const prisma = require("../config/db");
const ApiError = require("../utils/apiError");
const { addTrackingEntry } = require("./tracking.service");
const { notifyUser } = require("../config/socket");

const getBuyerDeliveryAddress = async (buyerId) => {
  const buyerProfile = await prisma.buyerProfile.findUnique({
    where: { userId: buyerId },
    select: { deliveryAddress: true },
  });

  if (!buyerProfile?.deliveryAddress) {
    throw new ApiError(400, "Please add a delivery address in your profile before placing an order.");
  }

  return buyerProfile.deliveryAddress;
};

const createOrder = async ({ buyerId, cropId, quantity }) => {
  const crop = await prisma.crop.findUnique({
    where: { id: cropId },
    include: { farmer: { select: { farmerProfile: { select: { serviceableAreas: true } } } } },
  });
  if (!crop) throw new ApiError(404, "Crop not found.");

  if (crop.farmerId === buyerId) {
    throw new ApiError(400, "You cannot order your own crop.");
  }

  if (quantity > crop.quantity) {
    throw new ApiError(400, `Only ${crop.quantity} kg available.`);
  }

  const deliveryAddress = await getBuyerDeliveryAddress(buyerId);
  const totalPrice = parseFloat((quantity * crop.pricePerKg).toFixed(2));

  // Check delivery feasibility (soft warning, does not block)
  let deliveryWarning = null;
  const serviceableAreas = crop.farmer?.farmerProfile?.serviceableAreas;
  if (serviceableAreas) {
    const areas = serviceableAreas.split(",").map((a) => a.trim().toLowerCase()).filter(Boolean);
    const addressLower = deliveryAddress.toLowerCase();
    const isServiceable = areas.some((area) => addressLower.includes(area));
    if (!isServiceable) {
      deliveryWarning = `This farmer typically delivers to: ${serviceableAreas}. Your delivery address may be outside their service area. We recommend confirming with the farmer via chat.`;
    }
  }

  const order = await prisma.order.create({
    data: { buyerId, cropId, quantity, totalPrice, deliveryAddress },
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

  return { ...order, deliveryWarning };
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
        buyer: {
          select: {
            name: true,
            phone: true,
            email: true,
            buyerProfile: { select: { businessName: true, businessAddress: true, deliveryAddress: true } },
          },
        },
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
      buyer: { select: { name: true, phone: true, buyerProfile: { select: { deliveryAddress: true } } } },
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

const cancelOrder = async (orderId, userId, reason) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { crop: true },
  });

  if (!order) throw new ApiError(404, "Order not found.");
  if (order.buyerId !== userId) {
    throw new ApiError(403, "You can only cancel your own orders.");
  }

  // Cancellation is only allowed for PENDING or ACCEPTED status
  if (order.status !== "PENDING" && order.status !== "ACCEPTED") {
    throw new ApiError(400, "You can only cancel orders that are PENDING or ACCEPTED.");
  }

  // Restore inventory if status was ACCEPTED (since stock was already decremented)
  if (order.status === "ACCEPTED") {
    await prisma.crop.update({
      where: { id: order.cropId },
      data: { quantity: { increment: order.quantity } },
    });
  }

  // Update order status to CANCELLED and store reason
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "CANCELLED",
      cancelReason: reason,
    },
    include: {
      crop: { select: { cropName: true, location: true, farmerId: true } },
    },
  });

  // Log timeline tracking event
  await addTrackingEntry({
    orderId: updatedOrder.id,
    status: "CANCELLED",
    location: updatedOrder.crop?.location || null,
    note: `Order cancelled by buyer. Reason: ${reason}`,
  });

  // Notify the farmer in real-time via WebSocket
  if (updatedOrder.crop?.farmerId) {
    notifyUser(updatedOrder.crop.farmerId, {
      title: "Order Cancelled",
      message: `Buyer cancelled order #${order.id.slice(0, 8)} for ${updatedOrder.crop.cropName}. Reason: ${reason}`,
      type: "error",
      orderId: updatedOrder.id,
    });
  }

  return updatedOrder;
};

module.exports = { createOrder, getMyOrders, updateOrderStatus, cancelOrder };
