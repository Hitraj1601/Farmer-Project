const { sendResponse } = require("../utils/apiResponse");

const errorHandler = (err, _req, res, _next) => {
  console.error("Error:", err.message);

  if (err.isOperational) {
    return sendResponse(res, err.statusCode, err.message);
  }

  if (err.code === "P2002") {
    const field = err.meta?.target?.[0] || "field";
    return sendResponse(res, 409, `A record with this ${field} already exists.`);
  }

  if (err.code === "P2025") {
    return sendResponse(res, 404, "Record not found.");
  }

  if (err.message && err.message.includes("Only JPEG")) {
    return sendResponse(res, 400, err.message);
  }

  return sendResponse(res, 500, "Internal server error.");
};

module.exports = errorHandler;
