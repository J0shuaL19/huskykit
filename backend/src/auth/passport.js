const { Passport } = require('passport');
const { Strategy } = require('passport-local');
const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');

function publicUser(user) {
  return { id: user._id.toString(), username: user.username, displayName: user.displayName };
}

function createPassport(users) {
  const passport = new Passport();
  passport.use(
    new Strategy(async (username, password, done) => {
      try {
        const user = await users.findOne({ username: username.trim().toLowerCase() });
        if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
          return done(null, false);
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );
  passport.serializeUser((user, done) => done(null, user._id.toString()));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = ObjectId.isValid(id) ? await users.findOne({ _id: new ObjectId(id) }) : null;
      done(null, user || false);
    } catch (error) {
      done(error);
    }
  });
  return passport;
}

function requireAuth(req, res, next) {
  if (!req.isAuthenticated?.()) return res.status(401).json({ error: 'Please log in first.' });
  return next();
}

module.exports = { createPassport, publicUser, requireAuth };
