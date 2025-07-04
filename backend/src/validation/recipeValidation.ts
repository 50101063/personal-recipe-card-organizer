import Joi from 'joi';

export const createRecipeSchema = Joi.object({
  name: Joi.string().trim().min(1).required().messages({
    'string.empty': 'Recipe name cannot be empty',
    'string.min': 'Recipe name cannot be empty',
    'any.required': 'Recipe name is required',
  }),
  ingredients: Joi.string().trim().min(1).required().messages({
    'string.empty': 'Ingredients cannot be empty',
    'string.min': 'Ingredients cannot be empty',
    'any.required': 'Ingredients are required',
  }),
  instructions: Joi.string().trim().min(1).required().messages({
    'string.empty': 'Instructions cannot be empty',
    'string.min': 'Instructions cannot be empty',
    'any.required': 'Instructions are required',
  }),
  category: Joi.string().trim().allow('').optional().messages({
    'string.empty': 'Category cannot be empty if provided',
  }),
});

export const updateRecipeSchema = Joi.object({
  name: Joi.string().trim().min(1).optional(),
  ingredients: Joi.string().trim().min(1).optional(),
  instructions: Joi.string().trim().min(1).optional(),
  category: Joi.string().trim().allow('').optional(),
}).min(1).messages({
  'object.min': 'At least one field (name, ingredients, instructions, or category) must be provided for update.',
});
