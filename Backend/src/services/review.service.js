const prisma = require("../config/db");
const ApiError = require("../utils/apiError");

const createReview = async ({ buyerId, farmerId, cropId, rating, comment, imageUrl }) => {
  if (buyerId === farmerId) {
    throw new ApiError(400, "You cannot review yourself.");
  }

  // Verify farmer exists and is actually a farmer
  const farmer = await prisma.user.findUnique({ where: { id: farmerId } });
  if (!farmer || farmer.role !== "FARMER") {
    throw new ApiError(404, "Farmer not found.");
  }

  // Check buyer has completed an order with this farmer (and optionally this crop)
  const orderWhere = {
    buyerId,
    crop: { farmerId },
    status: "DELIVERED",
  };
  if (cropId) {
    orderWhere.cropId = cropId;
  }

  const hasOrder = await prisma.order.findFirst({ where: orderWhere });
  if (!hasOrder) {
    throw new ApiError(400, "You can only review after a delivered order.");
  }

  // Build unique key for upsert
  const uniqueKey = { buyerId_farmerId_cropId: { buyerId, farmerId, cropId: cropId || null } };

  const existingReview = await prisma.review.findUnique({ where: uniqueKey });

  const data = { rating, comment, imageUrl: imageUrl || null };

  const review = await prisma.review.upsert({
    where: uniqueKey,
    update: data,
    create: { buyerId, farmerId, cropId: cropId || null, ...data },
    include: {
      buyer: { select: { name: true } },
      crop: { select: { id: true, cropName: true } },
    },
  });

  return { review, created: !existingReview };
};

const getFarmerReviews = async (farmerId) => {
  const farmer = await prisma.user.findUnique({ where: { id: farmerId } });
  if (!farmer || farmer.role !== "FARMER") {
    throw new ApiError(404, "Farmer not found.");
  }

  const reviews = await prisma.review.findMany({
    where: { farmerId },
    include: {
      buyer: { select: { name: true } },
      crop: { select: { id: true, cropName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const avgRating = reviews.length
    ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1))
    : 0;

  return { farmerId, averageRating: avgRating, totalReviews: reviews.length, reviews };
};

const getCropReviews = async (cropId) => {
  const crop = await prisma.crop.findUnique({ where: { id: cropId } });
  if (!crop) {
    throw new ApiError(404, "Crop not found.");
  }

  const reviews = await prisma.review.findMany({
    where: { cropId },
    include: {
      buyer: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const avgRating = reviews.length
    ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1))
    : 0;

  return { cropId, averageRating: avgRating, totalReviews: reviews.length, reviews };
};

module.exports = { createReview, getFarmerReviews, getCropReviews };
