import { recipeModel, Recipe, CreateRecipePayload, UpdateRecipePayload } from '../models/recipeModel';
import { logger } from '../utils/logger';

export class RecipeService {
  async createRecipe(userId: string, payload: Omit<CreateRecipePayload, 'user_id'>): Promise<Recipe> {
    const newRecipe = await recipeModel.create({ ...payload, user_id: userId });
    logger.info(`Recipe created by user ${userId}: ${newRecipe.name}`);
    return newRecipe;
  }

  async getRecipes(
    userId: string,
    searchName?: string,
    searchIngredient?: string,
    filterCategory?: string
  ): Promise<Recipe[]> {
    logger.info(`Fetching recipes for user ${userId} with searchName: ${searchName}, searchIngredient: ${searchIngredient}, filterCategory: ${filterCategory}`);
    return recipeModel.findByUserId(userId, searchName, searchIngredient, filterCategory);
  }

  async getRecipeById(id: string, userId: string): Promise<Recipe | undefined> {
    const recipe = await recipeModel.findById(id);
    if (!recipe || recipe.user_id !== userId) {
      logger.warn(`Attempted to access unauthorized recipe. Recipe ID: ${id}, User ID: ${userId}`);
      return undefined; // Or throw an error for 404/403
    }
    logger.info(`Recipe fetched by user ${userId}: ${recipe.name}`);
    return recipe;
  }

  async updateRecipe(
    id: string,
    userId: string,
    payload: UpdateRecipePayload
  ): Promise<Recipe | undefined> {
    const updatedRecipe = await recipeModel.update(id, userId, payload);
    if (updatedRecipe) {
      logger.info(`Recipe updated by user ${userId}: ${updatedRecipe.name}`);
    } else {
      logger.warn(`Attempted to update unauthorized or non-existent recipe. Recipe ID: ${id}, User ID: ${userId}`);
    }
    return updatedRecipe;
  }

  async deleteRecipe(id: string, userId: string): Promise<boolean> {
    const success = await recipeModel.delete(id, userId);
    if (success) {
      logger.info(`Recipe deleted by user ${userId}: ID ${id}`);
    } else {
      logger.warn(`Attempted to delete unauthorized or non-existent recipe. Recipe ID: ${id}, User ID: ${userId}`);
    }
    return success;
  }
}

export const recipeService = new RecipeService();
