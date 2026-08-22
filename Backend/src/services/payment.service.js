const crypto = require("crypto");
const prisma = require("../config/db");
const razorpay = require("../config/razorpay");
const ApiError = require("../utils/apiError");

const createPaymentOrder = async (orderId, userId) => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret || keyId === 'your_razorpay_key_id' || keySecret === 'your_razorpay_key_secret') {
    throw new ApiError(503, "Payment gateway is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend .env.");
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payment: true },
  });

  if (!order) throw new ApiError(404, "Order not found.");
  if (order.buyerId !== userId) throw new ApiError(403, "You can only pay for your own orders.");
  if (order.payment?.status === "SUCCESS") throw new ApiError(400, "Order is already paid.");

  // Create Razorpay order (amount in paise)
  let razorpayOrder;
  try {
    razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.totalPrice * 100),
      currency: "INR",
      receipt: orderId,
      notes: { orderId, buyerId: userId },
    });
  } catch (error) {
    const gatewayMessage = error?.error?.description || error?.message;
    throw new ApiError(502, gatewayMessage || "Failed to create payment order with gateway.");
  }

  // Create or update payment record
  const payment = await prisma.payment.upsert({
    where: { orderId },
    create: {
      orderId,
      amount: order.totalPrice,
      status: "INITIATED",
      method: "RAZORPAY",
      razorpayOrderId: razorpayOrder.id,
    },
    update: {
      status: "INITIATED",
      method: "RAZORPAY",
      razorpayOrderId: razorpayOrder.id,
    },
  });

  return {
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    paymentId: payment.id,
  };
};

const verifyPayment = async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
  if (!process.env.RAZORPAY_KEY_SECRET) {
    throw new ApiError(503, "Payment gateway is not configured. Add RAZORPAY_KEY_SECRET in backend .env.");
  }

  // Verify signature
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    // Mark payment as failed
    await prisma.payment.updateMany({
      where: { razorpayOrderId: razorpay_order_id },
      data: { status: "FAILED" },
    });
    throw new ApiError(400, "Payment verification failed. Invalid signature.");
  }

  // Execute payment status update and stock decrement inside a database transaction
  const payment = await prisma.$transaction(async (tx) => {
    const paymentRecord = await tx.payment.findUnique({
      where: { razorpayOrderId: razorpay_order_id },
      include: {
        order: {
          include: {
            items: true,
            crop: true,
          },
        },
      },
    });

    if (!paymentRecord) throw new ApiError(404, "Payment record not found.");

    // Idempotency check: if payment already succeeded, return cleanly
    if (paymentRecord.status === "SUCCESS") {
      return paymentRecord;
    }

    // 1. Update payment record status
    const updatedPayment = await tx.payment.update({
      where: { id: paymentRecord.id },
      data: {
        status: "SUCCESS",
        transactionId: razorpay_payment_id,
      },
    });

    const order = paymentRecord.order;
    if (order && order.status !== "ACCEPTED") {
      // 2. Decrement inventory for single or multi-item orders
      if (order.items && order.items.length > 0) {
        for (const item of order.items) {
          await tx.crop.update({
            where: { id: item.cropId },
            data: { quantity: { decrement: item.quantity } },
          });
        }
      } else if (order.cropId) {
        await tx.crop.update({
          where: { id: order.cropId },
          data: { quantity: { decrement: order.quantity } },
        });
      }

      // 3. Update order status to ACCEPTED
      await tx.order.update({
        where: { id: order.id },
        data: { status: "ACCEPTED" },
      });
    }

    return updatedPayment;
  });

  return payment;
};

// Free Payment - Process free orders without Razorpay
const processFreePayment = async (orderId, userId) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payment: true, items: true, crop: true },
  });

  if (!order) throw new ApiError(404, "Order not found.");
  if (order.buyerId !== userId) throw new ApiError(403, "You can only pay for your own orders.");
  if (order.payment?.status === "SUCCESS") throw new ApiError(400, "Order is already paid.");

  const payment = await prisma.$transaction(async (tx) => {
    // Create or update payment record with FREE method
    const paymentRec = await tx.payment.upsert({
      where: { orderId },
      create: {
        orderId,
        amount: order.totalPrice,
        status: "SUCCESS",
        method: "FREE",
        transactionId: `FREE-${orderId}-${Date.now()}`,
      },
      update: {
        status: "SUCCESS",
        method: "FREE",
        transactionId: `FREE-${orderId}-${Date.now()}`,
      },
    });

    if (order.status !== "ACCEPTED") {
      // Decrement inventory for single or multi-item orders
      if (order.items && order.items.length > 0) {
        for (const item of order.items) {
          await tx.crop.update({
            where: { id: item.cropId },
            data: { quantity: { decrement: item.quantity } },
          });
        }
      } else if (order.cropId) {
        await tx.crop.update({
          where: { id: order.cropId },
          data: { quantity: { decrement: order.quantity } },
        });
      }

      // Update order status to ACCEPTED
      await tx.order.update({
        where: { id: orderId },
        data: { status: "ACCEPTED" },
      });
    }

    return paymentRec;
  });

  return payment;
};

module.exports = { createPaymentOrder, verifyPayment, processFreePayment };
