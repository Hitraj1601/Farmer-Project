const crypto = require("crypto");
const prisma = require("../config/db");
const razorpay = require("../config/razorpay");
const ApiError = require("../utils/apiError");

const createPaymentOrder = async (orderId, userId) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payment: true },
  });

  if (!order) throw new ApiError(404, "Order not found.");
  if (order.buyerId !== userId) throw new ApiError(403, "You can only pay for your own orders.");
  if (order.payment?.status === "SUCCESS") throw new ApiError(400, "Order is already paid.");

  // Create Razorpay order (amount in paise)
  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(order.totalPrice * 100),
    currency: "INR",
    receipt: orderId,
    notes: { orderId, buyerId: userId },
  });

  // Create or update payment record
  const payment = await prisma.payment.upsert({
    where: { orderId },
    create: {
      orderId,
      amount: order.totalPrice,
      status: "INITIATED",
      razorpayOrderId: razorpayOrder.id,
    },
    update: {
      status: "INITIATED",
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

  // Update payment status
  const payment = await prisma.payment.update({
    where: { razorpayOrderId: razorpay_order_id },
    data: {
      status: "SUCCESS",
      transactionId: razorpay_payment_id,
    },
  });

  // Update order status to ACCEPTED after successful payment
  await prisma.order.update({
    where: { id: payment.orderId },
    data: { status: "ACCEPTED" },
  });

  return payment;
};

module.exports = { createPaymentOrder, verifyPayment };
