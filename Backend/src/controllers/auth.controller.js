const authService = require("../services/auth.service");
const { sendResponse } = require("../utils/apiResponse");

const register = async (req, res, next) => {
  try {
    const { name, phone, email, password, role } = req.body;

    if (!name || !phone || !email || !password) {
      return sendResponse(res, 400, "Name, phone, email, and password are required.");
    }

    const allowedRoles = ["FARMER", "BUYER"];
    const userRole = role && allowedRoles.includes(role.toUpperCase()) ? role.toUpperCase() : "FARMER";

    const result = await authService.register({ name, phone, email, password, role: userRole });
    return sendResponse(res, 201, "User registered successfully.", result);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendResponse(res, 400, "Email and password are required.");
    }

    const result = await authService.login({ email, password });
    return sendResponse(res, 200, "Login successful.", result);
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.user.id);
    return sendResponse(res, 200, "Profile fetched successfully.", user);
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getProfile };
