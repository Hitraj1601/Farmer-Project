const ApiError = require("../utils/apiError");

const validate = (schema) => {
  return (req, _res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });
    if (error) {
      const messages = error.details.map((d) => d.message).join(", ");
      throw new ApiError(400, messages);
    }
    req.body = value;
    next();
  };
};

module.exports = validate;
