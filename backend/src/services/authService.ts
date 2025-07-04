import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { userModel, User } from '../models/userModel';
import { config } from '../config';
import { logger } from '../utils/logger';

export class AuthService {
  async register(username: string, password: string): Promise<{ user: User; token: string }> {
    const existingUser = await userModel.findByUsername(username);
    if (existingUser) {
      throw new Error('User with that username already exists');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser = await userModel.create(username, passwordHash);

    const token = this.generateToken(newUser.id);
    logger.info(`User registered: ${newUser.username}`);
    return { user: newUser, token };
  }

  async login(username: string, password: string): Promise<{ user: User; token: string }> {
    const user = await userModel.findByUsername(username);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user.id);
    logger.info(`User logged in: ${user.username}`);
    return { user, token };
  }

  async getCurrentUser(userId: string): Promise<User | undefined> {
    return userModel.findById(userId);
  }

  private generateToken(id: string): string {
    return jwt.sign({ id }, config.jwtSecret, { expiresIn: '1h' }); // Token expires in 1 hour
  }
}

export const authService = new AuthService();
