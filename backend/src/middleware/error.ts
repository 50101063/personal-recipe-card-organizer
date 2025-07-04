import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { logger } from '../utils/logger';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  logger.error(`Error: ${err.message}, Stack: ${err.stack}`);

  res.json({
    message: err.message,
    stack: config.nodeEnv === 'production' ? null : err.stack,
  });
};
