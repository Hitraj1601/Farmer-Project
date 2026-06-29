const cartService = require("../services/cart.service");
const { sendResponse } = require("../utils/apiResponse");

const getCart = async (req, res, next) => {
  try {
    const cart = await cartService.getCart(req.user.id);
    return sendResponse(res, 200, "Cart fetched successfully.", cart);
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const { cropId, quantity } = req.body;

    if (!cropId || !quantity) {
      return sendResponse(res, 400, "cropId and quantity are required.");
    }

    const item = await cartService.addToCart({
      buyerId: req.user.id,
      cropId,
      quantity: parseFloat(quantity),
    });

    return sendResponse(res, 200, "Item added to cart.", item);
  } catch (error) {
    next(error);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const { cropId } = req.params;

    if (!quantity) {
      return sendResponse(res, 400, "quantity is required.");
    }

    const item = await cartService.updateCartItem({
      buyerId: req.user.id,
      cropId,
      quantity: parseFloat(quantity),
    });

    return sendResponse(res, 200, "Cart item updated.", item);
  } catch (error) {
    next(error);
  }
};

const removeFromCart = async (req, res, next) => {
  try {
    await cartService.removeFromCart({
      buyerId: req.user.id,
      cropId: req.params.cropId,
    });

    return sendResponse(res, 200, "Item removed from cart.");
  } catch (error) {
    next(error);
  }
};

const clearCartHandler = async (req, res, next) => {
  try {
    await cartService.clearCart(req.user.id);
    return sendResponse(res, 200, "Cart cleared.");
  } catch (error) {
    next(error);
  }
};

const checkout = async (req, res, next) => {
  try {
    const orders = await cartService.checkout(req.user.id);
    return sendResponse(res, 201, "Checkout successful. Orders created.", orders);
  } catch (error) {
    next(error);
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart: clearCartHandler, checkout };
