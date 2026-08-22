const { sendResponse } = require("../utils/apiResponse");

const errorHandler = (err, _req, res, _next) => {
  // Always log full error details to the server console
  console.error("Error handler caught error:", err);

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

  if (err.code === "P2021" || err.code === "P2022") {
    return sendResponse(res, 500, "Database schema is out of sync. Please contact administrator.");
  }

  if (
    err.name === "PrismaClientInitializationError" ||
    err.code === "P1001" ||
    err.code === "P1002" ||
    err.code === "P1003" ||
    err.code === "P1017" ||
    (err.message && (err.message.includes("prisma.") || err.message.includes("FATAL:") || err.message.includes("ENOTFOUND")))
  ) {
    return sendResponse(res, 500, "Database connection error. Please try again later.");
  }

  if (err.message && err.message.includes("Only JPEG")) {
    return sendResponse(res, 400, err.message);
  }

  // Fallback for non-operational / internal server errors
  return sendResponse(res, 500, "Internal server error. Please try again later.");
};

module.exports = errorHandler;

