const cropService = require("../services/crop.service");
const { sendResponse } = require("../utils/apiResponse");

const createCrop = async (req, res, next) => {
  try {
    const { cropName, quantity, pricePerKg, location, category, stockAlertThreshold } = req.body;

    if (!cropName || !quantity || !pricePerKg || !location) {
      return sendResponse(res, 400, "cropName, quantity, pricePerKg, and location are required.");
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const crop = await cropService.createCrop({
      cropName,
      quantity: parseFloat(quantity),
      pricePerKg: parseFloat(pricePerKg),
      location,
      category: category || null,
      imageUrl,
      farmerId: req.user.id,
      stockAlertThreshold: stockAlertThreshold !== undefined ? parseFloat(stockAlertThreshold) : 0,
    });

    return sendResponse(res, 201, "Crop listed successfully.", crop);
  } catch (error) {
    next(error);
  }
};

const getAllCrops = async (req, res, next) => {
  try {
    const result = await cropService.getAllCrops(req.query);
    return sendResponse(res, 200, "Crops fetched successfully.", result);
  } catch (error) {
    next(error);
  }
};

const getMyCrops = async (req, res, next) => {
  try {
    const crops = await cropService.getMyCrops(req.user.id);
    return sendResponse(res, 200, "Farmer crops fetched successfully.", crops);
  } catch (error) {
    next(error);
  }
};

const getCropById = async (req, res, next) => {
  try {
    const crop = await cropService.getCropById(req.params.id);
    return sendResponse(res, 200, "Crop fetched successfully.", crop);
  } catch (error) {
    next(error);
  }
};

const updateCrop = async (req, res, next) => {
  try {
    const updateData = {};
    const { cropName, quantity, pricePerKg, location, category, stockAlertThreshold } = req.body;

    if (cropName) updateData.cropName = cropName;
    if (quantity) updateData.quantity = parseFloat(quantity);
    if (pricePerKg) updateData.pricePerKg = parseFloat(pricePerKg);
    if (location) updateData.location = location;
    if (category !== undefined) updateData.category = category || null;
    if (stockAlertThreshold !== undefined) updateData.stockAlertThreshold = parseFloat(stockAlertThreshold);
    if (req.file) updateData.imageUrl = `/uploads/${req.file.filename}`;

    const crop = await cropService.updateCrop(req.params.id, req.user.id, updateData);
    return sendResponse(res, 200, "Crop updated successfully.", crop);
  } catch (error) {
    next(error);
  }
};

const deleteCrop = async (req, res, next) => {
  try {
    await cropService.deleteCrop(req.params.id, req.user.id);
    return sendResponse(res, 200, "Crop deleted successfully.");
  } catch (error) {
    next(error);
  }
};

const getStockAlerts = async (req, res, next) => {
  try {
    const crops = await cropService.getStockAlerts(req.user.id);
    return sendResponse(res, 200, "Stock alerts fetched successfully.", crops);
  } catch (error) {
    next(error);
  }
};

module.exports = { createCrop, getAllCrops, getMyCrops, getCropById, updateCrop, deleteCrop, getStockAlerts };
