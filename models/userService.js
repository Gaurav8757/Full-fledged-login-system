// ..............Adding google info to db .................//
const addGoogleUser =
  (User) =>
  async ({ googleId, email, name, profilePhoto }) => {
    const user = new User({
      googleId,
      email,
      name,
      profilePhoto,
      source: "google",
    });
    return await user.save();
  };
// ..............Adding facebook info to db .................//
const addFacebookUser =
  (User) =>
  async ({ facebookId, name, profilePhoto, provider, email }) => {
    const user = new User({
      facebookId,
      name,
      email,
      profilePhoto,
      provider,
    });
    return await user.save();
  };
//......................query....................//
const getUsers = (User) => async () => {
  return await User.find({});
};
// ................ get info by email or googleEmail-id ...........//
const getUserByEmail =
  (User) =>
  async ({ email }) => {
    return await User.findOne({
      email,
    });
  };
// ................ get info by facebook-id ...........//
const getUserById =
  (User) =>
  async ({ facebookId }) => {
    return await User.findOne({
      facebookId,
    });
  };

module.exports = (User) => {
  return {
    addGoogleUser: addGoogleUser(User),
    addFacebookUser: addFacebookUser(User),
    getUsers: getUsers(User),
    getUserByEmail: getUserByEmail(User),
    getUserById: getUserById(User),
  };
};
