import { v4 as uuidv4 } from 'uuid';
import knex from '../db/knex';

export interface User {
  id: string;
  username: string;
  password_hash: string;
  created_at: Date;
}

export class UserModel {
  private tableName = 'users';

  async create(username: string, passwordHash: string): Promise<User> {
    const [user] = await knex(this.tableName)
      .insert({
        id: uuidv4(),
        username,
        password_hash: passwordHash,
      })
      .returning('*');
    return user;
  }

  async findByUsername(username: string): Promise<User | undefined> {
    return knex(this.tableName).where({ username }).first();
  }

  async findById(id: string): Promise<User | undefined> {
    return knex(this.tableName).where({ id }).first();
  }
}

export const userModel = new UserModel();
