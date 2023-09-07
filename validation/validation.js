const joi = require("joi");
// validate data or transform json to object
// blueprint of js
const registerValidation = (data) => {
  const schema = joi.object({
    name: joi.string().min(2).required(),
    email: joi.string().email().required(),
    password: joi.string().min(6).required(),
    confirm_password: joi.string().valid(joi.ref("password")).required(),
  });
  return schema.validate(data);
};

const loginValidation = (data) => {
  const schema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(6).required(),
  });
  return schema.validate(data);
};


module.exports = {
  registerValidation,
  loginValidation,
};
