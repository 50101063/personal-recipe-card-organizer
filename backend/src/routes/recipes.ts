import { Router, Request, Response, NextFunction } from 'express';
import { recipeService } from '../services/recipeService';
import { createRecipeSchema, updateRecipeSchema } from '../validation/recipeValidation';
import { protect } from '../middleware/auth';
import { logger } from '../utils/logger';
import Joi from 'joi'; // Import Joi for the validate utility

const router = Router();

// Utility for validation
const validate = (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => {
  const { error } = schema.validate(req.body);
  if (error) {
    logger.warn(`Validation error for ${req.path}: ${error.details[0].message}`);
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

// All recipe routes are protected
router.use(protect);

router.post('/', validate(createRecipeSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }
    const recipe = await recipeService.createRecipe(req.user.id, req.body);
    res.status(201).json({ message: 'Recipe created successfully', recipe });
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }
    const { name, ingredient, category } = req.query;
    const recipes = await recipeService.getRecipes(
      req.user.id,
      name as string,
      ingredient as string,
      category as string
    );
    res.status(200).json(recipes);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }
    const recipe = await recipeService.getRecipeById(req.params.id, req.user.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found or unauthorized' });
    }
    res.status(200).json(recipe);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', validate(updateRecipeSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }
    const updatedRecipe = await recipeService.updateRecipe(req.params.id, req.user.id, req.body);
    if (!updatedRecipe) {
      return res.status(404).json({ message: 'Recipe not found or unauthorized' });
    }
    res.status(200).json({ message: 'Recipe updated successfully', recipe: updatedRecipe });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }
    const success = await recipeService.deleteRecipe(req.params.id, req.user.id);
    if (!success) {
      return res.status(404).json({ message: 'Recipe not found or unauthorized' });
    }
    res.status(204).send(); // No content for successful deletion
  } catch (error) {
    next(error);
  }
});

export default router;
