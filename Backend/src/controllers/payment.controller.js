const paymentService = require("../services/payment.service");
const { sendResponse } = require("../utils/apiResponse");

const createPaymentOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return sendResponse(res, 400, "orderId is required.");
    }

    const result = await paymentService.createPaymentOrder(orderId, req.user.id);
    return sendResponse(res, 200, "Razorpay order created successfully.", result);
  } catch (error) {
    next(error);
  }
};

const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return sendResponse(res, 400, "razorpay_order_id, razorpay_payment_id, and razorpay_signature are required.");
    }

    const payment = await paymentService.verifyPayment({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    return sendResponse(res, 200, "Payment verified successfully.", payment);
  } catch (error) {
    next(error);
  }
};

module.exports = { createPaymentOrder, verifyPayment };
