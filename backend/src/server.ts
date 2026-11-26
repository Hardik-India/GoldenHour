import http from 'http';
import { env } from './config/env';
import { connectDB } from './config/db';
import { createApp } from './app';
import { initSocket } from './sockets';
import { logger } from './utils/logger';
import { BloodRequest } from './models/BloodRequest';

async function main() {
  await connectDB();

  const app = createApp();
  const server = http.createServer(app);
  initSocket(server);

  // Expire stale blood requests every 10 minutes
  setInterval(async () => {
    try {
      await BloodRequest.updateMany(
        { status: { $in: ['open', 'partially_fulfilled'] }, expiresAt: { $lt: new Date() } },
        { status: 'expired' }
      );
    } catch (err) {
      logger.warn('Blood request expiry job failed', err);
    }
  }, 10 * 60 * 1000);

  server.listen(env.port, () => {
    logger.info(`GoldenHour API listening on http://localhost:${env.port} (${env.nodeEnv})`);
  });

  const shutdown = () => {
    logger.info('Shutting down...');
    server.close(() => process.exit(0));
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  logger.error('Failed to start server', err);
  process.exit(1);
});
