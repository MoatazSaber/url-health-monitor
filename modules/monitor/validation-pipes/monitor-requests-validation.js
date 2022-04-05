const Joi = require("@hapi/joi");
//Create Validation
exports.createMonitorValidation = (data) => {
  const schema = Joi.object({
    friendly_name: Joi.string().min(6).required(),
    url: Joi.string().min(6).required(),
    port: Joi.number(),
    timeout: Joi.number().default(5),
    interval: Joi.number().default(600),
    tags: Joi.array().items(Joi.string()),
    authentication: Joi.object({
      username: Joi.string(),
      password: Joi.string(),
    }),
    custom_http_headers: Joi.object(),
    alertContacts: Joi.array().items({
      alertContactId: Joi.string(),
      threshold: Joi.number(),
      recurrence: Joi.number(),
    }),
  });

  return schema.validate(data);
};

//Update Validation
exports.updateMonitorValidation = (data) => {
  const schema = Joi.object({
    friendly_name: Joi.string().min(6),
    url: Joi.string().min(6),
    port: Joi.number(),
    timeout: Joi.number(),
    interval: Joi.number(),
    tags: Joi.array().items(Joi.string()),
    authentication: Joi.object({
      username: Joi.string(),
      password: Joi.string(),
    }),
    custom_http_headers: Joi.object(),
    alertContacts: Joi.array().items({
      alertContactId: Joi.string(),
      threshold: Joi.number(),
      recurrence: Joi.number(),
    }),
  });

  return schema.validate(data);
};
