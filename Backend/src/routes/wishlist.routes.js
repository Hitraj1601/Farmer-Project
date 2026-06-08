const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishlist.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");

// All wishlist routes require BUYER role
router.use(authenticate, authorize("BUYER"));

router.get("/", wishlistController.getWishlist);
router.get("/ids", wishlistController.getWishlistIds);
router.get("/price-drops", wishlistController.checkPriceDrops);
router.post("/:cropId", wishlistController.addToWishlist);
router.delete("/:cropId", wishlistController.removeFromWishlist);

module.exports = router;
