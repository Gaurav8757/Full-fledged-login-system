const passport = require("passport");
const User = require("../models/user");
const indexes = require("../models/index");
const FacebookStrategy = require("passport-facebook");

passport.serializeUser((user, cb) => {
  cb(null, user.id);
});
passport.deserializeUser(async (id, cb) => {
  const currentUser = await User.findById(id);
  cb(null, currentUser);
});
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.faceboookClientID,
      clientSecret: process.env.facebookClientSecret,
      callbackURL: process.env.facebookCallbackURL,
      profileFields: ["id", "displayName", "picture.type(large)"],
    },
    async (accessToken, refreshToken, profile, cb) => {
      const facebookId = profile.id;
      const name = profile.displayName;
      const profilePhoto = profile.photos[0].value;
      const provider = profile.provider;

      try {
        let currentUser = await indexes.getUserById({
          facebookId: facebookId,
        });
        if (!currentUser) {
          const newUser = await indexes.addFacebookUser({
            facebookId,
            name,
            profilePhoto,
            provider,
          });
          return cb(null, newUser);
        }
        return cb(null, currentUser);
      } catch (error) {
        return cb(error);
      }
    }
  )
);
