const express = require("express");
const passport = require("passport");
require("../config/passport");
require("../config/facebook");
const loginController = require("../controllers/loginController");


const router = express.Router();
// ..................Routes page to get or post ................//
router.get("/register", loginController.getRegisterPage);

router.post("/register", loginController.register);

router.get("/login", loginController.getLoginPage);

router.post("/login", loginController.login);

router.get("/logout", loginController.logout);

router.get("/forgotPassword", loginController.getForgotPage);

router.post("/forgotPassword", loginController.forgotPassword);

router.get("/changePassword", loginController.getChangePassword);

router.post("/changePassword", loginController.changePassword);

router.get("/resetPassword/:id/:token", loginController.getResetPassword);

router.post("/resetPassword/:id/:token", loginController.userPasswordReset);

router.get("/home", loginController.getHomePage);

router.post('/home', loginController.logout);

//................Google authentication route............................//
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

//.............Google authentication callback route.....................//
router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: "/home",
    failureRedirect: "/register",
  })
);
// .................Facebook authentication route........................//
router.get("/facebook", passport.authenticate("facebook"));
router.get(
  "/facebook/logins",
  passport.authenticate("facebook", {
    successRedirect: "/home",
    failureRedirect: "/register",
  })
);
module.exports = router;
