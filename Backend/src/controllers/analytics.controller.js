const analyticsService = require("../services/analytics.service");
const trackingService = require("../services/tracking.service");
const { sendResponse } = require("../utils/apiResponse");

const getPriceTrend = async (req, res, next) => {
  try {
    const result = await analyticsService.getPriceTrend(req.query);
    return sendResponse(res, 200, "Price trend fetched successfully.", result);
  } catch (error) {
    next(error);
  }
};

const getDemandForecast = async (req, res, next) => {
  try {
    const result = await analyticsService.getDemandForecast(req.query);
    return sendResponse(res, 200, "Demand forecast generated successfully.", result);
  } catch (error) {
    next(error);
  }
};

const getSuggestedPrice = async (req, res, next) => {
  try {
    const result = await analyticsService.getSuggestedPrice(req.query);
    return sendResponse(res, 200, "Price suggestion generated successfully.", result);
  } catch (error) {
    next(error);
  }
};

const getOrderTracking = async (req, res, next) => {
  try {
    const result = await trackingService.getOrderTracking(req.params.id);
    return sendResponse(res, 200, "Order tracking fetched successfully.", result);
  } catch (error) {
    next(error);
  }
};

const simulateLocationUpdate = async (req, res, next) => {
  try {
    const result = await trackingService.simulateLocationUpdate(req.params.id);
    return sendResponse(res, 200, "Location update simulated.", result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPriceTrend,
  getDemandForecast,
  getSuggestedPrice,
  getOrderTracking,
  simulateLocationUpdate,
};
