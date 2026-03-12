const prisma = require("../config/db");
const ApiError = require("../utils/apiError");

const createReview = async ({ buyerId, farmerId, rating, comment }) => {
  if (buyerId === farmerId) {
    throw new ApiError(400, "You cannot review yourself.");
  }

  // Verify farmer exists and is actually a farmer
  const farmer = await prisma.user.findUnique({ where: { id: farmerId } });
  if (!farmer || farmer.role !== "FARMER") {
    throw new ApiError(404, "Farmer not found.");
  }

  // Check buyer has completed an order with this farmer
  const hasOrder = await prisma.order.findFirst({
    where: {
      buyerId,
      crop: { farmerId },
      status: "DELIVERED",
    },
  });
  if (!hasOrder) {
    throw new ApiError(400, "You can only review farmers from whom you have a delivered order.");
  }

  const review = await prisma.review.create({
    data: { buyerId, farmerId, rating, comment },
    include: {
      buyer: { select: { name: true } },
    },
  });

  return review;
};

const getFarmerReviews = async (farmerId) => {
  const farmer = await prisma.user.findUnique({ where: { id: farmerId } });
  if (!farmer || farmer.role !== "FARMER") {
    throw new ApiError(404, "Farmer not found.");
  }

  const reviews = await prisma.review.findMany({
    where: { farmerId },
    include: { buyer: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const avgRating = reviews.length
    ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1))
    : 0;

  return { farmerId, averageRating: avgRating, totalReviews: reviews.length, reviews };
};

module.exports = { createReview, getFarmerReviews };
