const wishlistService = require("../services/wishlist.service");
const { sendResponse } = require("../utils/apiResponse");

const addToWishlist = async (req, res, next) => {
  try {
    const item = await wishlistService.addToWishlist(req.user.id, req.params.cropId);
    return sendResponse(res, 201, "Crop added to wishlist.", item);
  } catch (error) {
    next(error);
  }
};

const removeFromWishlist = async (req, res, next) => {
  try {
    await wishlistService.removeFromWishlist(req.user.id, req.params.cropId);
    return sendResponse(res, 200, "Crop removed from wishlist.");
  } catch (error) {
    next(error);
  }
};

const getWishlist = async (req, res, next) => {
  try {
    const items = await wishlistService.getWishlist(req.user.id);
    return sendResponse(res, 200, "Wishlist fetched successfully.", items);
  } catch (error) {
    next(error);
  }
};

const checkPriceDrops = async (req, res, next) => {
  try {
    const drops = await wishlistService.checkPriceDrops(req.user.id);
    return sendResponse(res, 200, "Price drop check complete.", drops);
  } catch (error) {
    next(error);
  }
};

const getWishlistIds = async (req, res, next) => {
  try {
    const ids = await wishlistService.getWishlistIds(req.user.id);
    return sendResponse(res, 200, "Wishlist IDs fetched.", ids);
  } catch (error) {
    next(error);
  }
};

module.exports = { addToWishlist, removeFromWishlist, getWishlist, checkPriceDrops, getWishlistIds };
