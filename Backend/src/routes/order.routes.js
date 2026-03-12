const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const { createOrderSchema, updateOrderStatusSchema } = require("../middleware/validate.schemas");

router.post("/", authenticate, authorize("BUYER"), validate(createOrderSchema), orderController.createOrder);
router.get("/my", authenticate, orderController.getMyOrders);
router.put("/:id/status", authenticate, authorize("FARMER", "ADMIN"), validate(updateOrderStatusSchema), orderController.updateOrderStatus);

module.exports = router;
