import { Router, Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { registerSchema, loginSchema } from '../validation/authValidation';
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

router.post('/register', validate(registerSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;
    const { user, token } = await authService.register(username, password);
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        username: user.username,
      },
      token,
    });
  } catch (error: any) {
    if (error.message.includes('already exists')) {
      return res.status(409).json({ message: error.message });
    }
    next(error);
  }
});

router.post('/login', validate(loginSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;
    const { user, token } = await authService.login(username, password);
    res.status(200).json({
      message: 'Logged in successfully',
      user: {
        id: user.id,
        username: user.username,
      },
      token,
    });
  } catch (error: any) {
    if (error.message.includes('Invalid credentials')) {
      return res.status(401).json({ message: error.message });
    }
    next(error);
  }
});

router.get('/me', protect, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // req.user is populated by the protect middleware
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }
    const user = await authService.getCurrentUser(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({
      id: user.id,
      username: user.username,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
