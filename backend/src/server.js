import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { logger } from './config/logger.js';
import { verifyMailer } from './config/mailer.js';
import { isCloudinaryConfigured } from './config/cloudinary.js';
import { createApp } from './app.js';

async function start() {
  try {
    await connectDB();
  } catch (err) {
    logger.fatal({ err: err.message }, 'Could not connect to MongoDB — check MONGODB_URI and Atlas network access');
    process.exit(1);
  }

  if (!isCloudinaryConfigured) {
    logger.warn('Cloudinary is not configured — admin image uploads are disabled (set CLOUDINARY_* in backend/.env)');
  }
  verifyMailer();

  const app = createApp();
  const host = process.env.HOST || '0.0.0.0';
  const server = app.listen(env.PORT, host, () => {
    logger.info(`API listening on http://${host}:${env.PORT} (${env.NODE_ENV})`);
  });

  let shuttingDown = false;
  const shutdown = (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info(`${signal} received — shutting down gracefully`);
    server.close(async () => {
      await disconnectDB().catch(() => {});
      logger.info('Shutdown complete');
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('unhandledRejection', (reason) => logger.error({ err: reason }, 'Unhandled promise rejection'));
}

start();
