const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");

// All admin routes require ADMIN role
router.use(authenticate, authorize("ADMIN"));

router.get("/users", adminController.getAllUsers);
router.get("/users/:id", adminController.getUserById);
router.delete("/users/:id", adminController.deleteUser);
router.get("/orders", adminController.getAllOrders);
router.get("/analytics", adminController.getAnalytics);

module.exports = router;
