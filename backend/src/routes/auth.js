const express = require('express');
const bcrypt = require('bcryptjs');
const { publicUser } = require('../auth/passport');

function validPassword(password) {
  return (
    typeof password === 'string' &&
    password.length >= 8 &&
    Buffer.byteLength(password, 'utf8') <= 72
  );
}

function logIn(req, res, next, user, status = 200) {
  req.logIn(user, (error) => {
    if (error) return next(error);
    req.session.save((saveError) => {
      if (saveError) return next(saveError);
      return res.status(status).json({ user: publicUser(user) });
    });
  });
}

function createAuthRouter(users, passport) {
  const router = express.Router();
  router.get('/me', (req, res) => {
    res.set('Cache-Control', 'no-store');
    res.json({ user: req.user ? publicUser(req.user) : null });
  });

  router.post('/register', async (req, res, next) => {
    const { username, password, displayName } = req.body || {};
    if (typeof username !== 'string' || !/^[a-zA-Z0-9_]{3,30}$/.test(username.trim())) {
      return res
        .status(400)
        .json({ error: 'Username must contain 3–30 letters, numbers, or underscores.' });
    }
    if (
      typeof displayName !== 'string' ||
      displayName.trim().length < 2 ||
      displayName.trim().length > 60
    ) {
      return res.status(400).json({ error: 'Display name must contain 2–60 characters.' });
    }
    if (!validPassword(password)) {
      return res
        .status(400)
        .json({ error: 'Password must be at least 8 characters and at most 72 UTF-8 bytes.' });
    }
    try {
      const user = {
        username: username.trim().toLowerCase(),
        displayName: displayName.trim(),
        passwordHash: await bcrypt.hash(password, 12),
        createdAt: new Date(),
      };
      const result = await users.insertOne(user);
      user._id = result.insertedId;
      return logIn(req, res, next, user, 201);
    } catch (error) {
      // Jharshini - I like that you used unique index and catching error code 1100 to
      // check for taken usernames instead of querying the database
      if (error.code === 11000)
        return res.status(409).json({ error: 'That username is already taken.' });
      return next(error);
    }
  });

  router.post('/login', (req, res, next) => {
    const { username, password } = req.body || {};
    if (typeof username !== 'string' || username.length > 30 || !validPassword(password)) {
      return res.status(400).json({ error: 'Enter a valid username and password.' });
    }
    return passport.authenticate('local', (error, user) => {
      if (error) return next(error);
      if (!user) return res.status(401).json({ error: 'Incorrect username or password.' });
      return logIn(req, res, next, user);
    })(req, res, next);
  });

  router.post('/logout', (req, res, next) => {
    req.logout((error) => {
      if (error) return next(error);
      req.session.destroy((destroyError) => {
        if (destroyError) return next(destroyError);
        res.clearCookie('huskykit.sid', { path: '/' });
        return res.json({ user: null });
      });
    });
  });
  return router;
}

module.exports = { createAuthRouter };
