const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const { addToCartSchema, updateCartItemSchema } = require("../middleware/validate.schemas");

router.get("/", authenticate, authorize("BUYER"), cartController.getCart);
router.post("/items", authenticate, authorize("BUYER"), validate(addToCartSchema), cartController.addToCart);
router.put("/items/:cropId", authenticate, authorize("BUYER"), validate(updateCartItemSchema), cartController.updateCartItem);
router.delete("/items/:cropId", authenticate, authorize("BUYER"), cartController.removeFromCart);
router.delete("/", authenticate, authorize("BUYER"), cartController.clearCart);
router.post("/checkout", authenticate, authorize("BUYER"), cartController.checkout);

module.exports = router;
