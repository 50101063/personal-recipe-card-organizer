import Joi from 'joi';

export const registerSchema = Joi.object({
  username: Joi.string().email().required().messages({
    'string.email': 'Username must be a valid email address',
    'string.empty': 'Username cannot be empty',
    'any.required': 'Username is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'string.empty': 'Password cannot be empty',
    'any.required': 'Password is required',
  }),
});

export const loginSchema = Joi.object({
  username: Joi.string().email().required(),
  password: Joi.string().required(),
});
