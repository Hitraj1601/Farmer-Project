const { verifyToken } = require("../utils/jwt");
const { sendResponse } = require("../utils/apiResponse");
const prisma = require("../config/db");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendResponse(res, 401, "Access denied. No token provided.");
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      return sendResponse(res, 401, "Invalid token. User not found.");
    }

    req.user = { id: user.id, email: user.email, role: user.role, name: user.name };
    next();
  } catch (error) {
    return sendResponse(res, 401, "Invalid or expired token.");
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendResponse(res, 403, "Access denied. Insufficient permissions.");
    }
    next();
  };
};

module.exports = { authenticate, authorize };
