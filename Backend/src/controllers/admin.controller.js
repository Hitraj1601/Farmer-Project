const adminService = require("../services/admin.service");
const { sendResponse } = require("../utils/apiResponse");

const getAllUsers = async (req, res, next) => {
  try {
    const result = await adminService.getAllUsers(req.query);
    return sendResponse(res, 200, "Users fetched successfully.", result);
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await adminService.getUserById(req.params.id);
    return sendResponse(res, 200, "User fetched successfully.", user);
  } catch (error) {
    next(error);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const result = await adminService.getAllOrders(req.query);
    return sendResponse(res, 200, "Orders fetched successfully.", result);
  } catch (error) {
    next(error);
  }
};

const getAnalytics = async (req, res, next) => {
  try {
    const analytics = await adminService.getAnalytics();
    return sendResponse(res, 200, "Analytics fetched successfully.", analytics);
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    await adminService.deleteUser(req.params.id);
    return sendResponse(res, 200, "User deleted successfully.");
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, getUserById, getAllOrders, getAnalytics, deleteUser };
