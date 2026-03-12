const prisma = require("../config/db");
const ApiError = require("../utils/apiError");

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

  return updated;
};

module.exports = { createOrder, getMyOrders, updateOrderStatus };
