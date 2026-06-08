const prisma = require("../config/db");
const ApiError = require("../utils/apiError");

// Simulated location waypoints for different statuses
const LOCATION_WAYPOINTS = {
  PENDING: ["Order placed - Awaiting farmer confirmation"],
  ACCEPTED: ["Farmer confirmed order", "Being prepared for dispatch"],
  SHIPPED: [
    "Picked up from farm",
    "At local collection center",
    "In transit to regional hub",
    "At regional sorting facility",
    "Out for delivery to your area",
  ],
  DELIVERED: ["Arrived at delivery location", "Delivered successfully"],
};

const addTrackingEntry = async ({ orderId, status, location, note }) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new ApiError(404, "Order not found.");

  return prisma.orderTracking.create({
    data: { orderId, status, location: location || null, note: note || null },
  });
};

const getOrderTracking = async (orderId) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      crop: { select: { cropName: true, location: true, farmer: { select: { name: true } } } },
      buyer: { select: { name: true } },
      tracking: { orderBy: { timestamp: "asc" } },
    },
  });

  if (!order) throw new ApiError(404, "Order not found.");

  // If no tracking entries exist, generate simulated ones based on current status
  let tracking = order.tracking;
  if (tracking.length === 0) {
    tracking = generateSimulatedTracking(order);
  }

  return {
    orderId: order.id,
    currentStatus: order.status,
    cropName: order.crop?.cropName,
    farmLocation: order.crop?.location,
    farmerName: order.crop?.farmer?.name,
    buyerName: order.buyer?.name,
    timeline: tracking,
  };
};

// Generate simulated tracking based on order status transitions
function generateSimulatedTracking(order) {
  const statusFlow = ["PENDING", "ACCEPTED", "SHIPPED", "DELIVERED"];
  const currentIdx = statusFlow.indexOf(order.status);
  const isRejected = order.status === "REJECTED";

  const timeline = [];
  const baseTime = new Date(order.createdAt);

  // Add PENDING entry
  timeline.push({
    id: `sim-pending`,
    status: "PENDING",
    location: order.crop?.location || "Farm",
    note: "Order placed - Awaiting farmer confirmation",
    timestamp: baseTime.toISOString(),
  });

  if (isRejected) {
    timeline.push({
      id: `sim-rejected`,
      status: "REJECTED",
      location: null,
      note: "Order was rejected by farmer",
      timestamp: new Date(baseTime.getTime() + 2 * 60 * 60 * 1000).toISOString(),
    });
    return timeline;
  }

  if (currentIdx >= 1) {
    // ACCEPTED
    timeline.push({
      id: `sim-accepted`,
      status: "ACCEPTED",
      location: order.crop?.location || "Farm",
      note: "Farmer confirmed order - Being prepared",
      timestamp: new Date(baseTime.getTime() + 3 * 60 * 60 * 1000).toISOString(),
    });
  }

  if (currentIdx >= 2) {
    // SHIPPED - add multiple location updates
    const shipLocations = LOCATION_WAYPOINTS.SHIPPED;
    shipLocations.forEach((loc, i) => {
      timeline.push({
        id: `sim-ship-${i}`,
        status: "SHIPPED",
        location: getSimulatedLocation(order.crop?.location, i, shipLocations.length),
        note: loc,
        timestamp: new Date(
          baseTime.getTime() + (6 + i * 4) * 60 * 60 * 1000
        ).toISOString(),
      });
    });
  }

  if (currentIdx >= 3) {
    // DELIVERED
    timeline.push({
      id: `sim-delivered`,
      status: "DELIVERED",
      location: "Delivery Address",
      note: "Package delivered successfully",
      timestamp: new Date(baseTime.getTime() + 48 * 60 * 60 * 1000).toISOString(),
    });
  }

  return timeline;
}

function getSimulatedLocation(farmLocation, step, totalSteps) {
  const locations = [
    farmLocation || "Farm Location",
    "Local Collection Center",
    "Regional Transport Hub",
    "District Sorting Facility",
    "Buyer's Area - Local Hub",
  ];
  return locations[Math.min(step, locations.length - 1)];
}

// Simulate a location update for shipped orders
const simulateLocationUpdate = async (orderId) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { crop: { select: { location: true } } },
  });

  if (!order) throw new ApiError(404, "Order not found.");
  if (order.status !== "SHIPPED") {
    throw new ApiError(400, "Location updates only available for shipped orders.");
  }

  const existingTracking = await prisma.orderTracking.findMany({
    where: { orderId, status: "SHIPPED" },
    orderBy: { timestamp: "desc" },
  });

  const waypoints = LOCATION_WAYPOINTS.SHIPPED;
  const nextStep = Math.min(existingTracking.length, waypoints.length - 1);

  const entry = await prisma.orderTracking.create({
    data: {
      orderId,
      status: "SHIPPED",
      location: getSimulatedLocation(order.crop?.location, nextStep, waypoints.length),
      note: waypoints[nextStep],
    },
  });

  return entry;
};

module.exports = { addTrackingEntry, getOrderTracking, simulateLocationUpdate };
