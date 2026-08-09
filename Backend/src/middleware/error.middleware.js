const { sendResponse } = require("../utils/apiResponse");

const errorHandler = (err, _req, res, _next) => {
  console.error("Error handler caught:", err);

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
    return sendResponse(res, 500, `Database schema is out of sync (${err.meta?.column ? `missing column ${err.meta.column}` : "missing tables"}). Please run database migrations (npx prisma migrate deploy).`);
  }

  if (err.code === "P1001") {
    return sendResponse(res, 500, "Cannot connect to database. Please check your DATABASE_URL and database connectivity.");
  }

  if (err.message && err.message.includes("Only JPEG")) {
    return sendResponse(res, 400, err.message);
  }

  return sendResponse(res, 500, err.message || "Internal server error.");
};

module.exports = errorHandler;
