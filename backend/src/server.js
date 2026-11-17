const { connectDatabase, closeDatabase } = require('./db/client');
const { createApp } = require('./app');

async function start() {
  const database = await connectDatabase();
  const app = await createApp(database);

  const server = app.listen(process.env.PORT || 3000, () => {
    console.log(`HuskyKit backend listening on port ${server.address().port}`);
  });
  process.once('SIGINT', () => server.close(() => closeDatabase()));
  process.once('SIGTERM', () => server.close(() => closeDatabase()));
}

start().catch(async (error) => {
  console.error(error.message);
  await closeDatabase();
  process.exitCode = 1;
});
