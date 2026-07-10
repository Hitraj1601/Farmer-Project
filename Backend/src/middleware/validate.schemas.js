const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    "string.min": "Name must be at least 2 characters",
    "string.max": "Name must not exceed 100 characters",
    "any.required": "Name is required",
  }),
  phone: Joi.string()
    .pattern(/^\+[1-9]\d{6,14}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone must start with a + and include country code, e.g. +919876543210",
      "any.required": "Phone is required",
    }),
  email: Joi.string().trim().lowercase().email({ tlds: { allow: false } }).required().messages({
    "string.email": "Must be a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters",
      "string.max": "Password must not exceed 128 characters",
      "string.pattern.base": "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)",
      "any.required": "Password is required",
    }),
  role: Joi.string().valid("FARMER", "BUYER").default("FARMER").messages({
    "any.only": "Role must be either FARMER or BUYER",
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email({ tlds: { allow: false } }).required().messages({
    "string.email": "Must be a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required",
  }),
});

const createCropSchema = Joi.object({
  cropName: Joi.string().min(2).max(100).required().messages({
    "any.required": "Crop name is required",
  }),
  quantity: Joi.number().positive().required().messages({
    "number.positive": "Quantity must be a positive number",
    "any.required": "Quantity is required",
  }),
  pricePerKg: Joi.number().positive().required().messages({
    "number.positive": "Price per kg must be a positive number",
    "any.required": "Price per kg is required",
  }),
  location: Joi.string().min(2).max(200).required().messages({
    "any.required": "Location is required",
  }),
  category: Joi.string().max(100).optional(),
  stockAlertThreshold: Joi.number().min(0).optional().default(0),
});

const updateCropSchema = Joi.object({
  cropName: Joi.string().min(2).max(100),
  quantity: Joi.number().positive(),
  pricePerKg: Joi.number().positive(),
  location: Joi.string().min(2).max(200),
  category: Joi.string().max(100).optional(),
  stockAlertThreshold: Joi.number().min(0).optional(),
}).min(1);

const createOrderSchema = Joi.object({
  cropId: Joi.string().uuid().required().messages({
    "string.uuid": "cropId must be a valid UUID",
    "any.required": "cropId is required",
  }),
  quantity: Joi.number().positive().required().messages({
    "number.positive": "Quantity must be a positive number",
    "any.required": "Quantity is required",
  }),
});

const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid("PENDING", "ACCEPTED", "REJECTED", "SHIPPED", "DELIVERED", "CANCELLED")
    .required()
    .messages({
      "any.only": "Status must be one of: PENDING, ACCEPTED, REJECTED, SHIPPED, DELIVERED, CANCELLED",
      "any.required": "Status is required",
    }),
});

const cancelOrderSchema = Joi.object({
  reason: Joi.string().min(3).max(500).required().messages({
    "string.min": "Reason must be at least 3 characters",
    "string.max": "Reason must not exceed 500 characters",
    "any.required": "Reason is required",
  }),
});

const createPaymentOrderSchema = Joi.object({
  orderId: Joi.string().uuid().required().messages({
    "string.uuid": "orderId must be a valid UUID",
    "any.required": "orderId is required",
  }),
});

const verifyPaymentSchema = Joi.object({
  razorpay_order_id: Joi.string().required(),
  razorpay_payment_id: Joi.string().required(),
  razorpay_signature: Joi.string().required(),
});

const createReviewSchema = Joi.object({
  farmerId: Joi.string().uuid().required().messages({
    "string.uuid": "farmerId must be a valid UUID",
    "any.required": "farmerId is required",
  }),
  cropId: Joi.string().uuid().optional().allow(null, "").messages({
    "string.uuid": "cropId must be a valid UUID",
  }),
  rating: Joi.number().integer().min(1).max(5).required().messages({
    "number.min": "Rating must be between 1 and 5",
    "number.max": "Rating must be between 1 and 5",
    "any.required": "Rating is required",
  }),
  comment: Joi.string().max(1000).allow(null, ""),
});

const farmerProfileSchema = Joi.object({
  farmLocation: Joi.string().min(2).max(200).required(),
  bankAccount: Joi.string().min(8).max(20).required(),
  ifscCode: Joi.string()
    .pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)
    .required()
    .messages({ "string.pattern.base": "IFSC code must be in valid format (e.g., SBIN0001234)" }),
  serviceableAreas: Joi.string().max(1000).allow(null, "").optional(),
});

const buyerProfileSchema = Joi.object({
  businessName: Joi.string().min(2).max(200).required(),
  businessAddress: Joi.string().min(5).max(500).required(),
  deliveryAddress: Joi.string().min(5).max(500).required(),
});

const addToCartSchema = Joi.object({
  cropId: Joi.string().uuid().required().messages({
    "string.uuid": "cropId must be a valid UUID",
    "any.required": "cropId is required",
  }),
  quantity: Joi.number().positive().required().messages({
    "number.positive": "Quantity must be a positive number",
    "any.required": "Quantity is required",
  }),
});

const updateCartItemSchema = Joi.object({
  quantity: Joi.number().positive().required().messages({
    "number.positive": "Quantity must be a positive number",
    "any.required": "Quantity is required",
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
  createCropSchema,
  updateCropSchema,
  createOrderSchema,
  updateOrderStatusSchema,
  createPaymentOrderSchema,
  verifyPaymentSchema,
  createReviewSchema,
  farmerProfileSchema,
  buyerProfileSchema,
  addToCartSchema,
  updateCartItemSchema,
  cancelOrderSchema,
};
