import express from 'express';
import cors from 'cors';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/error';
import authRoutes from './routes/auth';
import recipeRoutes from './routes/recipes';

const app = express();

// Middleware
app.use(express.json()); // Body parser for JSON
app.use(express.urlencoded({ extended: true })); // Body parser for URL-encoded data
app.use(cors()); // Enable CORS for all origins (adjust in production)

// Logging middleware for HTTP requests
app.use((req, res, next) => {
  logger.http(`${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/recipes', recipeRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'Backend is running' });
});

// Catch-all for undefined routes
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// Error handling middleware
app.use(errorHandler);

export default app;
