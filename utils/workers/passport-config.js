const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');

const jwt = require('jsonwebtoken');
const { createUser } = require('../services/userService');
const { config } = require('./utils');
const serverCallBackUrl = config.get('oAuth.serverCallBackUrl');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID2,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET2,
      callbackURL: `${serverCallBackUrl}/api/dev/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if the user exists in the database
        let user = await db('app_user')
          .where({ email: profile.emails[0].value })
          .first();
        if (!user) {
          user = await createUser({
            googleId: profile.id,
            email: profile.emails[0].value,
            firstName: profile.name.givenName,
            lastName: profile.name.givenName,
            profilePic: profile.photos[0].value,
          });
        }
        console.log('User Before Callback : ', user);
        done(null, { ...user });
      } catch (err) {
        done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await db('app_user').where({ appUserId: id }).first();
    done(null, user);
  } catch (err) {
    done(err);
  }
});

const generateToken = (user) => {
  return jwt.sign(
    { id: user.appUserId, email: user.email },
    process.env.JWT_SECRET
  );
};

module.exports = { passport, generateToken };
