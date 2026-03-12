const orderService = require("../services/order.service");
const { sendResponse } = require("../utils/apiResponse");

const createOrder = async (req, res, next) => {
  try {
    const { cropId, quantity } = req.body;

    if (!cropId || !quantity) {
      return sendResponse(res, 400, "cropId and quantity are required.");
    }

    const order = await orderService.createOrder({
      buyerId: req.user.id,
      cropId,
      quantity: parseFloat(quantity),
    });

    return sendResponse(res, 201, "Order placed successfully.", order);
  } catch (error) {
    next(error);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getMyOrders(req.user.id, req.user.role);
    return sendResponse(res, 200, "Orders fetched successfully.", orders);
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      return sendResponse(res, 400, "Status is required.");
    }

    const validStatuses = ["PENDING", "ACCEPTED", "REJECTED", "SHIPPED", "DELIVERED"];
    if (!validStatuses.includes(status)) {
      return sendResponse(res, 400, `Status must be one of: ${validStatuses.join(", ")}`);
    }

    const order = await orderService.updateOrderStatus(
      req.params.id,
      status,
      req.user.id,
      req.user.role
    );

    return sendResponse(res, 200, "Order status updated successfully.", order);
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, getMyOrders, updateOrderStatus };
