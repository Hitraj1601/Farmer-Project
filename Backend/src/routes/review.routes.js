const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/review.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const { createReviewSchema } = require("../middleware/validate.schemas");

router.post("/", authenticate, authorize("BUYER"), validate(createReviewSchema), reviewController.createReview);
router.get("/farmer/:farmerId", reviewController.getFarmerReviews);

module.exports = router;
