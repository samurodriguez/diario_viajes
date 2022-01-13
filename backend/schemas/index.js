const Joi = require("joi");

const newUserSchema = Joi.object().keys({
  email: Joi.string().required().max(100),
  password: Joi.string()
    .required()
    .min(3)
    .max(100)
    .error(
      new Error(
        "La contraseña es obligatoria y tiene que ser de longitud entre 3 y 100"
      )
    ),
});

const newEntrySchema = Joi.object().keys({
  place: Joi.string().required().max(1000),
  description: Joi.string(),
});

module.exports = {
  newUserSchema,
  newEntrySchema,
};
