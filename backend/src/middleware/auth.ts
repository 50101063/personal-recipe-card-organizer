import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { logger } from '../utils/logger';
import { userModel, User } from '../models/userModel';

// Extend the Request object to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded: any = jwt.verify(token, config.jwtSecret);

      // Fetch user from DB to ensure user still exists and is active (optional, but good practice)
      req.user = await userModel.findById(decoded.id);

      if (!req.user) {
        logger.warn(`Authentication failed: User with ID ${decoded.id} not found.`);
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next();
    } catch (error: any) {
      logger.error(`Authentication error: ${error.message}`);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    logger.warn('Authentication failed: No token provided.');
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};
