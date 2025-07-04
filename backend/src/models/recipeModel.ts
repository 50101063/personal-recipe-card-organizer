import { v4 as uuidv4 } from 'uuid';
import knex from '../db/knex';

export interface Recipe {
  id: string;
  user_id: string;
  name: string;
  ingredients: string;
  instructions: string;
  category: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateRecipePayload {
  user_id: string;
  name: string;
  ingredients: string;
  instructions: string;
  category?: string;
}

export interface UpdateRecipePayload {
  name?: string;
  ingredients?: string;
  instructions?: string;
  category?: string;
}

export class RecipeModel {
  private tableName = 'recipes';

  async create(payload: CreateRecipePayload): Promise<Recipe> {
    const [recipe] = await knex(this.tableName)
      .insert({
        id: uuidv4(),
        user_id: payload.user_id,
        name: payload.name,
        ingredients: payload.ingredients,
        instructions: payload.instructions,
        category: payload.category || null,
      })
      .returning('*');
    return recipe;
  }

  async findByUserId(
    userId: string,
    searchName?: string,
    searchIngredient?: string,
    filterCategory?: string
  ): Promise<Recipe[]> {
    let query = knex(this.tableName).where({ user_id: userId });

    if (searchName) {
      query = query.where('name', 'ilike', `%${searchName}%`);
    }

    if (searchIngredient) {
      query = query.where('ingredients', 'ilike', `%${searchIngredient}%`);
    }

    if (filterCategory) {
      query = query.where({ category: filterCategory });
    }

    return query.orderBy('created_at', 'desc');
  }

  async findById(id: string): Promise<Recipe | undefined> {
    return knex(this.tableName).where({ id }).first();
  }

  async update(
    id: string,
    userId: string,
    payload: UpdateRecipePayload
  ): Promise<Recipe | undefined> {
    const [recipe] = await knex(this.tableName)
      .where({ id, user_id: userId })
      .update({
        ...payload,
        updated_at: knex.fn.now(),
      })
      .returning('*');
    return recipe;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const count = await knex(this.tableName)
      .where({ id, user_id: userId })
      .del();
    return count > 0;
  }
}

export const recipeModel = new RecipeModel();
