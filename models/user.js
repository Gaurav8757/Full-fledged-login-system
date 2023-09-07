const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: false,
    },
    password: {
      type: String,
    },
    confirm_password: {
      type: String,
    },
    googleId: {
      type: String,
      default: null,
    },
    profilePhoto: {
      type: String,
      default: null,
    },
    facebookId: {
      type: String,
      default: null,
    },
    token: [{
      type: String,
    }],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
