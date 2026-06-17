const reviewService = require("../services/review.service");
const { sendResponse } = require("../utils/apiResponse");

const createReview = async (req, res, next) => {
  try {
    const { farmerId, cropId, rating, comment } = req.body;

    if (!farmerId || !rating) {
      return sendResponse(res, 400, "farmerId and rating are required.");
    }

    if (rating < 1 || rating > 5 || !Number.isInteger(Number(rating))) {
      return sendResponse(res, 400, "Rating must be an integer between 1 and 5.");
    }

    // Handle image upload
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const review = await reviewService.createReview({
      buyerId: req.user.id,
      farmerId,
      cropId: cropId || null,
      rating: Number(rating),
      comment: comment || null,
      imageUrl,
    });

    return sendResponse(
      res,
      review.created ? 201 : 200,
      review.created ? "Review submitted successfully." : "Review updated successfully.",
      review.review
    );
  } catch (error) {
    next(error);
  }
};

const getFarmerReviews = async (req, res, next) => {
  try {
    const result = await reviewService.getFarmerReviews(req.params.farmerId);
    return sendResponse(res, 200, "Reviews fetched successfully.", result);
  } catch (error) {
    next(error);
  }
};

const getCropReviews = async (req, res, next) => {
  try {
    const result = await reviewService.getCropReviews(req.params.cropId);
    return sendResponse(res, 200, "Crop reviews fetched successfully.", result);
  } catch (error) {
    next(error);
  }
};

module.exports = { createReview, getFarmerReviews, getCropReviews };
