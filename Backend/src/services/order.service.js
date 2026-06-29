const prisma = require("../config/db");
const ApiError = require("../utils/apiError");
const { addTrackingEntry } = require("./tracking.service");
const { notifyUser } = require("../config/socket");

const createOrder = async ({ buyerId, cropId, quantity }) => {
  const crop = await prisma.crop.findUnique({ where: { id: cropId } });
  if (!crop) throw new ApiError(404, "Crop not found.");

  if (crop.farmerId === buyerId) {
    throw new ApiError(400, "You cannot order your own crop.");
  }

  if (quantity > crop.quantity) {
    throw new ApiError(400, `Only ${crop.quantity} kg available.`);
  }

  const totalPrice = parseFloat((quantity * crop.pricePerKg).toFixed(2));

  const order = await prisma.order.create({
    data: { buyerId, cropId, quantity, totalPrice },
    include: {
      crop: { select: { cropName: true, pricePerKg: true, location: true } },
    },
  });

  // Record initial tracking entry
  await addTrackingEntry({
    orderId: order.id,
    status: "PENDING",
    location: crop.location,
    note: "Order placed successfully",
  });

  // Notify the farmer in real-time
  notifyUser(crop.farmerId, {
    title: "New Order Received!",
    message: `A buyer ordered ${order.quantity} kg of ${crop.cropName}.`,
    type: "success",
    orderId: order.id,
  });

  return order;
};

const getMyOrders = async (userId, role) => {
  if (role === "BUYER") {
    return prisma.order.findMany({
      where: { buyerId: userId },
      include: {
        crop: {
          select: { cropName: true, pricePerKg: true, location: true, farmerId: true, farmer: { select: { id: true, name: true, phone: true } } },
        },
        payment: { select: { status: true, transactionId: true } },
        items: {
          include: {
            crop: { select: { id: true, cropName: true, pricePerKg: true, imageUrl: true, location: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  if (role === "FARMER") {
    return prisma.order.findMany({
      where: { crop: { farmerId: userId } },
      include: {
        crop: { select: { cropName: true, pricePerKg: true } },
        buyer: { select: { name: true, phone: true, email: true } },
        payment: { select: { status: true, transactionId: true } },
        items: {
          include: {
            crop: { select: { id: true, cropName: true, pricePerKg: true, imageUrl: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // Admin sees all
  return prisma.order.findMany({
    include: {
      crop: { select: { cropName: true, pricePerKg: true } },
      buyer: { select: { name: true, phone: true } },
      payment: { select: { status: true, transactionId: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

const updateOrderStatus = async (orderId, status, userId, role) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { crop: true },
  });

  if (!order) throw new ApiError(404, "Order not found.");

  // Farmers can accept/reject their crop orders
  if (role === "FARMER") {
    if (order.crop.farmerId !== userId) {
      throw new ApiError(403, "You can only manage orders for your own crops.");
    }
    if (!["ACCEPTED", "REJECTED", "SHIPPED", "DELIVERED"].includes(status)) {
      throw new ApiError(400, "Farmer can set status to ACCEPTED, REJECTED, SHIPPED, or DELIVERED.");
    }
  }

  // Admins can set any status
  if (role !== "FARMER" && role !== "ADMIN") {
    throw new ApiError(403, "You are not authorized to update order status.");
  }

  // Update crop quantity when order is accepted
  if (status === "ACCEPTED" && order.status === "PENDING") {
    if (order.quantity > order.crop.quantity) {
      throw new ApiError(400, "Insufficient crop quantity available.");
    }
    await prisma.crop.update({
      where: { id: order.cropId },
      data: { quantity: { decrement: order.quantity } },
    });
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });

  // Record tracking entry for status change
  const trackingNotes = {
    ACCEPTED: "Order accepted by farmer",
    REJECTED: "Order rejected by farmer",
    SHIPPED: "Order shipped - In transit",
    DELIVERED: "Order delivered successfully",
  };

  await addTrackingEntry({
    orderId: updated.id,
    status,
    location: order.crop?.location || null,
    note: trackingNotes[status] || `Status changed to ${status}`,
  });

  // Notify the buyer in real-time
  const buyerMessages = {
    ACCEPTED: { title: "Order Accepted!", message: `Your order for ${order.crop?.cropName} has been accepted by the farmer.`, type: "success" },
    REJECTED: { title: "Order Rejected", message: `Your order for ${order.crop?.cropName} was rejected by the farmer.`, type: "error" },
    SHIPPED: { title: "Order Shipped!", message: `Your order for ${order.crop?.cropName} is on its way!`, type: "info" },
    DELIVERED: { title: "Order Delivered!", message: `Your order for ${order.crop?.cropName} has been delivered successfully.`, type: "success" },
  };
  if (buyerMessages[status]) {
    notifyUser(order.buyerId, { ...buyerMessages[status], orderId: updated.id });
  }

  return updated;
};

module.exports = { createOrder, getMyOrders, updateOrderStatus };
