const profileService = require("../services/profile.service");
const { sendResponse } = require("../utils/apiResponse");

const upsertFarmerProfile = async (req, res, next) => {
  try {
    const { farmLocation, bankAccount, ifscCode } = req.body;

    if (!farmLocation || !bankAccount || !ifscCode) {
      return sendResponse(res, 400, "farmLocation, bankAccount, and ifscCode are required.");
    }

    const profile = await profileService.upsertFarmerProfile(req.user.id, {
      farmLocation,
      bankAccount,
      ifscCode,
    });

    return sendResponse(res, 200, "Farmer profile saved successfully.", profile);
  } catch (error) {
    next(error);
  }
};

const getFarmerProfile = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.user.id;
    const profile = await profileService.getFarmerProfile(userId);
    return sendResponse(res, 200, "Farmer profile fetched successfully.", profile);
  } catch (error) {
    next(error);
  }
};

const upsertBuyerProfile = async (req, res, next) => {
  try {
    const { businessName, businessAddress } = req.body;

    if (!businessName || !businessAddress) {
      return sendResponse(res, 400, "businessName and businessAddress are required.");
    }

    const profile = await profileService.upsertBuyerProfile(req.user.id, {
      businessName,
      businessAddress,
    });

    return sendResponse(res, 200, "Buyer profile saved successfully.", profile);
  } catch (error) {
    next(error);
  }
};

const getBuyerProfile = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.user.id;
    const profile = await profileService.getBuyerProfile(userId);
    return sendResponse(res, 200, "Buyer profile fetched successfully.", profile);
  } catch (error) {
    next(error);
  }
};

module.exports = { upsertFarmerProfile, getFarmerProfile, upsertBuyerProfile, getBuyerProfile };
