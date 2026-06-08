const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const { createPaymentOrderSchema, verifyPaymentSchema } = require("../middleware/validate.schemas");

router.post("/create-order", authenticate, authorize("BUYER"), validate(createPaymentOrderSchema), paymentController.createPaymentOrder);
router.post("/verify", authenticate, validate(verifyPaymentSchema), paymentController.verifyPayment);
router.post("/free", authenticate, authorize("BUYER"), validate(createPaymentOrderSchema), paymentController.processFreePayment);

module.exports = router;
