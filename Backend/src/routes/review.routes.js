const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/review.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");
const upload = require("../config/multer");

// Create review with optional photo upload (buyers only)
router.post(
  "/",
  authenticate,
  authorize("BUYER"),
  upload.single("image"),
  reviewController.createReview
);

// Get all reviews for a farmer
router.get("/farmer/:farmerId", reviewController.getFarmerReviews);

// Get all reviews for a specific crop
router.get("/crop/:cropId", reviewController.getCropReviews);

module.exports = router;
