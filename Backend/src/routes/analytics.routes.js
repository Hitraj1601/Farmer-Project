const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analytics.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");

// Price trends - accessible to all authenticated users
router.get("/price-trend", authenticate, analyticsController.getPriceTrend);

// Demand forecast - accessible to farmers and admins
router.get("/demand-forecast", authenticate, authorize("FARMER", "ADMIN"), analyticsController.getDemandForecast);

// Dynamic price suggestion - accessible to farmers
router.get("/suggested-price", authenticate, authorize("FARMER"), analyticsController.getSuggestedPrice);

// Order tracking
router.get("/tracking/:id", authenticate, analyticsController.getOrderTracking);

// Simulate location update (for demo purposes)
router.post("/tracking/:id/simulate", authenticate, authorize("FARMER", "ADMIN"), analyticsController.simulateLocationUpdate);

module.exports = router;
