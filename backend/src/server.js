const express = require('express');
const { connectDatabase, closeDatabase } = require('./db/client');
const { createCampusRouter } = require('./routes/campus');

async function start() {
  const database = await connectDatabase();
  const app = express();
  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/campus-posts', createCampusRouter(database.collection('campusPosts')));
  app.use((error, _req, res, _next) => {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  });

  const server = app.listen(process.env.PORT || 3000, () => {
    console.log(`HuskyKit backend listening on port ${server.address().port}`);
  });
  process.once('SIGINT', () => server.close(() => closeDatabase()));
  process.once('SIGTERM', () => server.close(() => closeDatabase()));
}

start().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
