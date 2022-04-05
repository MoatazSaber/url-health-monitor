const Joi = require("@hapi/joi");
//Create Validation
exports.createAlertContactValidation = (data) => {
  const schema = Joi.object({
    friendly_name: Joi.string().min(6).required(),
    type: Joi.string().max(20).required(),
    value: Joi.string().required(),
  });

  return schema.validate(data);
};

//Update Validation
exports.updateAlertContactValidation = (data) => {
  const schema = Joi.object({
    friendly_name: Joi.string().min(6),
    value: Joi.string(),
  });

  return schema.validate(data);
};
