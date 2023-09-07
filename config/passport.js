const passport = require("passport");
require("dotenv").config();
const UserService = require("../models/userService");
const User = require("../models/user");
const indexes = require("../models/index");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  const currentUser = await User.findById(id);
  done(null, currentUser);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.googleClientID,
      clientSecret: process.env.googleClientSecret,
      callbackURL: process.env.googleCallbackURL,
    },

    async (accessToken, refreshToken, profile, done) => {
      const googleId = profile.id;
      const email = profile.emails[0].value;
      const name = profile.displayName;
      const profilePhoto = profile.photos[0].value;

      try {
        let currentUser = await indexes.getUserByEmail({
          email: profile.emails[0].value,
        });

        if (!currentUser) {
          const newUser = await indexes.addGoogleUser({
            googleId,
            email,
            name,
            profilePhoto,
          });
          return done(null, newUser);
        }
        return done(null, currentUser);
      } catch (error) {
        return done(error);
      }
    }
  )
);
module.exports = passport;
