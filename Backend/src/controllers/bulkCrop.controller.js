const XLSX = require("xlsx");
const prisma = require("../config/db");
const { recordPriceHistory } = require("../services/analytics.service");
const { sendResponse } = require("../utils/apiResponse");

const REQUIRED_COLS = ["cropName", "quantity", "pricePerKg", "location"];
const OPTIONAL_COLS = ["category", "stockAlertThreshold"];

const bulkUploadCrops = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendResponse(res, 400, "No file uploaded. Please upload a CSV or XLSX file.");
    }

    // Parse file buffer with xlsx
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    if (!rows || rows.length === 0) {
      return sendResponse(res, 400, "The uploaded file is empty or could not be parsed.");
    }

    const created = [];
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // row 1 is the header

      // Validate required fields
      const missing = REQUIRED_COLS.filter((col) => !row[col] && row[col] !== 0);
      if (missing.length > 0) {
        errors.push({ row: rowNum, error: `Missing required fields: ${missing.join(", ")}` });
        continue;
      }

      const quantity = parseFloat(row.quantity);
      const pricePerKg = parseFloat(row.pricePerKg);
      const stockAlertThreshold = parseFloat(row.stockAlertThreshold) || 0;

      if (isNaN(quantity) || quantity <= 0) {
        errors.push({ row: rowNum, error: "quantity must be a positive number" });
        continue;
      }
      if (isNaN(pricePerKg) || pricePerKg <= 0) {
        errors.push({ row: rowNum, error: "pricePerKg must be a positive number" });
        continue;
      }

      try {
        const crop = await prisma.crop.create({
          data: {
            cropName: String(row.cropName).trim(),
            quantity,
            pricePerKg,
            location: String(row.location).trim(),
            category: row.category ? String(row.category).trim() : null,
            stockAlertThreshold,
            farmerId: req.user.id,
          },
        });

        // Record price history
        await recordPriceHistory({
          cropId: crop.id,
          cropName: crop.cropName,
          category: crop.category,
          pricePerKg: crop.pricePerKg,
          location: crop.location,
          farmerId: crop.farmerId,
        });

        created.push({ row: rowNum, cropName: crop.cropName, id: crop.id });
      } catch (dbErr) {
        errors.push({ row: rowNum, error: dbErr.message || "Database error" });
      }
    }

    return sendResponse(res, 201, `Bulk upload complete. ${created.length} crops created, ${errors.length} errors.`, {
      created,
      errors,
      summary: { total: rows.length, created: created.length, failed: errors.length },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { bulkUploadCrops };
