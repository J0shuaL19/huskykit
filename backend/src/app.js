const express = require('express');
const session = require('express-session');
const path = require('node:path');
const fs = require('node:fs');
const { createPassport } = require('./auth/passport');
const { MongoSessionStore } = require('./db/sessionStore');
const { createAuthRouter } = require('./routes/auth');
const { createAcademicRouter } = require('./routes/academic');
const { createCampusRouter } = require('./routes/campus');

async function createApp(
  database,
  { secret = process.env.SESSION_SECRET, production = process.env.NODE_ENV === 'production' } = {},
) {
  if (!secret || secret.length < 32 || secret.startsWith('replace-with-'))
    throw new Error('SESSION_SECRET must contain at least 32 characters.');
  const users = database.collection('users');
  const sessions = database.collection('sessions');
  await users.createIndex({ username: 1 }, { unique: true });
  await sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await database.collection('academicPosts').createIndex({ updatedAt: -1, _id: -1 });
  const passport = createPassport(users);
  const app = express();
  app.disable('x-powered-by');
  if (production) app.set('trust proxy', 1);
  // Mutations must use JSON plus a custom header. Cross-origin forms cannot do this;
  // cross-origin fetch requires a preflight that this same-origin app does not allow.
  app.use('/api', (req, res, next) => {
    if (
      ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) &&
      (!req.is('application/json') || req.get('X-HuskyKit') !== '1')
    ) {
      return res.status(415).json({ error: 'Use JSON with the X-HuskyKit: 1 header.' });
    }
    return next();
  });
  app.use(express.json({ limit: '32kb' }));
  app.use(
    session({
      name: 'huskykit.sid',
      secret,
      resave: false,
      saveUninitialized: false,
      store: new MongoSessionStore(sessions),
      cookie: { httpOnly: true, sameSite: 'lax', secure: production, maxAge: 86400000 },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/auth', createAuthRouter(users, passport));
  app.use('/api/academic-posts', createAcademicRouter(database.collection('academicPosts')));
  app.use('/api/campus-posts', createCampusRouter(database.collection('campusPosts')));
  app.use('/api', (_req, res) => res.status(404).json({ error: 'API route not found' }));

  const frontend = path.resolve(__dirname, '../../frontend/dist');
  if (fs.existsSync(path.join(frontend, 'index.html'))) {
    app.use(express.static(frontend));
    app.get('/{*path}', (_req, res) => res.sendFile(path.join(frontend, 'index.html')));
  }
  app.use((error, _req, res, _next) => {
    if (error.type === 'entity.parse.failed')
      return res.status(400).json({ error: 'Invalid JSON.' });
    if (error.type === 'entity.too.large')
      return res.status(413).json({ error: 'Request is too large.' });
    console.error(error.message);
    return res.status(500).json({ error: 'Internal server error' });
  });
  return app;
}

module.exports = { createApp };
