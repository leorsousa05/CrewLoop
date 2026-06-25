import { loadConfig } from './config';
import { createDashboardServer } from './server';

function handleFatalError(err: unknown): void {
  if (err instanceof Error) {
    console.error(err.message);
  } else {
    console.error('An unexpected error occurred while starting the dashboard.');
  }
  process.exit(1);
}

process.on('uncaughtException', handleFatalError);
process.on('unhandledRejection', (reason) => {
  handleFatalError(reason);
});

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

main().catch(handleFatalError);
