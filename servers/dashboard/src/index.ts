import { loadConfig } from './config';
import { createDashboardServer } from './server';

async function main(): Promise<void> {
  const config = loadConfig();
  const server = createDashboardServer(config);

  process.on('SIGINT', async () => {
    await server.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await server.stop();
    process.exit(0);
  });

  await server.start();
}

main().catch((err) => {
  console.error('Failed to start dashboard:', err);
  process.exit(1);
});
