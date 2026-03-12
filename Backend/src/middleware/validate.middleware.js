const ApiError = require("../utils/apiError");

const validate = (schema) => {
  return (req, _res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const messages = error.details.map((d) => d.message).join(", ");
      throw new ApiError(400, messages);
    }
    next();
  };
};

module.exports = validate;
