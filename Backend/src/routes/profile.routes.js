const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profile.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const { farmerProfileSchema, buyerProfileSchema } = require("../middleware/validate.schemas");

// Farmer profile
router.post("/farmer", authenticate, authorize("FARMER"), validate(farmerProfileSchema), profileController.upsertFarmerProfile);
router.get("/farmer", authenticate, authorize("FARMER"), profileController.getFarmerProfile);
router.get("/farmer/:userId", profileController.getFarmerProfile);

// Buyer profile
router.post("/buyer", authenticate, authorize("BUYER"), validate(buyerProfileSchema), profileController.upsertBuyerProfile);
router.get("/buyer", authenticate, authorize("BUYER"), profileController.getBuyerProfile);
router.get("/buyer/:userId", profileController.getBuyerProfile);

module.exports = router;
