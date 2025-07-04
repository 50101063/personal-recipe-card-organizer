import app from './app';
import { config } from './config';
import { logger } from './utils/logger';
import knex from './db/knex'; // Import knex to ensure connection is established

const startServer = async () => {
  try {
    // Test database connection
    await knex.raw('SELECT 1');
    logger.info('Database connected successfully!');

    app.listen(config.port, () => {
      logger.info(`Server running in ${config.nodeEnv} mode on port ${config.port}`);
    });
  } catch (error: any) {
    logger.error(`Error connecting to database or starting server: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

startServer();
