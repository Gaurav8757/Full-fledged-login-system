const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");
const {
  registerValidation,
  loginValidation,
} = require("../validation/validation");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
require("dotenv").config();
// ................................get login page..................................//
module.exports.getLoginPage = (req, res) => {
  const pageTitle = "Login System";
  res.render("login", { title: pageTitle });
};
// .................................get register page................................//
module.exports.getRegisterPage = (req, res) => {
  const pageTitle = "Login System";
  res.render("register", { title: pageTitle });
};

//...................................get home page...................................//
module.exports.getHomePage = (req, res) => {
  req.flash("success", "Login Successfully");
  res.render("home", {
    title: "Homepage | Login System",
    name: req.user.name,
    email: req.user.email,
    profilePhoto: req.user.profilePhoto,
  });
};

//..............................get Forgot Password page...........,,.................//
module.exports.getForgotPage = (req, res) => {
  return res.status(200).render("forgotPassword", {
    title: "Login System",
  });
};
// ..............................get resetPassword page...............................//
module.exports.getChangePassword = (req, res) => {
  res.status(200).render("changePassword", {
    title: "Login System",
  });
};
// ..............................get resetPassword page...............................//
module.exports.getResetPassword = (req, res) => {
  res.status(200).render("resetPassword", {
    title: "Login System",
  });
};
//................................registration logic..................................//
module.exports.register = async (req, res) => {
  //............................validating the data...................................//
  try {
    const { error } = registerValidation(req.body);
    if (error) {
      req.flash("error", "Invalid User Credentials");
      return res.status(400).redirect("/register");
    }
    //.......................checking if the user is already in the db..................//
    const emailExist = await User.findOne({ email: req.body.email });
    if (emailExist) {
      req.flash("error", "Email already exists");
      return res.status(400).redirect("/register");
    }
    //.................................hash the password................................//
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    //............................. Generate JWT token ....................................//

    //....................................create a new user.............................//
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      confirm_password: hashedPassword,
    });
    await newUser.save();
    //........................... Generate JWT token ....................................//
    const token = jwt.sign({ userId: newUser._id }, process.env.SECRET, {
      expiresIn: "30m",
    });
    //..................... Send the token as a cookie to the client ...................//
    res.cookie("token", token, {
      maxAge: 3600000, // Token expiration time (in milliseconds)
      httpOnly: true, // Ensures the cookie is only accessible via HTTP(S)
      secure: false, // Set to true if using HTTPS
    });
    req.flash("success", "User registered successfully");
    res.status(201).redirect("/login");
  } catch (err) {
    req.flash("error", "Invalid Registration");
    return res.status(400).redirect("/register");
  }
};

//...................................... ....login logic..............................//
module.exports.login = async (req, res) => {
  const { error } = loginValidation(req.body);
  if (error) {
    // req.flash("error", "Password should be atleast 6 characters long");
    return res.status(400).redirect("/login");
  }
  //...................................checking if email exists.........................//
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      req.flash("error", "User is not found! Register Now!");
      return res.status(400).redirect("/register");
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      req.flash("error", "Password is Incorrect");
      return res.status(400).redirect("/login");
    }
    //.................................Generate JWT token..............................//
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.SECRET,
      { expiresIn: "1h" }
    );

    //.............................Set the token as a cookie...........................//
    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 1 * 60 * 60 * 1000, // 1 hours in milliseconds
    });
    // store LOGIN userId in session
    req.session.userId = user._id;
    req.flash("success", "User Logged In Successfully");
    res.status(200).render("home", {
      title: "Homepage | Registration-Login Page",
      name: user.name,
      email: "",
      profilePhoto: "",
    });
  } catch (error) {
    req.flash("error", "Internal Server Error");
    return res.status(500).redirect("/register");
  }
};
//.................................Reset Password Logic...............................//
module.exports.changePassword = async (req, res) => {
  try {
    //...............take user input oldpassword and newpassword......................//
    const { password, newPassword, confirm_new_password } = req.body;
    //......................check user is loggedin in session.........................//
    const userId = req.session.userId;
    //........................Check if the user is logged in.........................//
    if (!userId) {
      req.flash("error", "User is not logged in");
      return res.status(401).redirect("/login");
    }
    //............................find userId in database............................//
    const user = await User.findById(userId);
    if (!user) {
      req.flash("error", "User is not found!");
      return res.status(400).redirect("/login");
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      req.flash("error", "Current password is incorrect");
      return res.status(400).redirect("/changePassword");
    }
    //................................Hash the new password..........................//
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    const hashedPassword1 = await bcrypt.hash(confirm_new_password, salt);
    //...................Update the user's password in the database..................//
    user.password = hashedPassword;
    user.confirm_password = hashedPassword1;
    await user.save();
    req.flash("success", "Password changed successfully");
    res.redirect("/login");
  } catch (error) {
    req.flash("error", "Internal Server Error");
    return res.status(500).redirect("/register");
  }
};

// .................................Forgot Page Logic......................................//

module.exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      req.flash("error", "Email not found. Register Now!");
      return res.status(400).redirect("/register");
    }
    // Generate a random token
    const secret = user._id + process.env.SECRET;
    let token = jwt.sign({ userId: user._id }, secret, {
      expiresIn: "15m",
    });
    const link = `https://loginsystem-35m9.onrender.com/resetPassword/${user._id}/${token}`;
    // const link = `http://localhost:8000/resetPassword/${user._id}/${token}`;

    //...................................Nodemailer code.......................................//
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL, //own email id
        pass: process.env.PASSWORD, // own emailid password
      },
    });
    const mailGenerator = new Mailgen({
      theme: "default",
      product: {
        // .......................Appears in header & footer of e-mails......................//
        name: "Registration-Login System",
        link: "https://mailgen.js/",
        copyright:
          "Copyright © 2023 Registration-Login System. All rights reserved.",
      },
    });
    //...................................Prepare email contents..............................//
    let response = {
      body: {
        name: "User",
        intro: [
          "You have received this email because a password reset request for your account was received.",
          "Valid till 15 Minutes only!",
        ],
        action: {
          instructions: "Click the button below to reset your password:",
          button: {
            color: "#DC4D2F",
            text: "Reset your password",
            link: link,
          },
        },
        outro:
          "If you did not request a password reset, no further action is required on your part.",
      },
    };
    // .......................................Generate email....................................//
    const mail = mailGenerator.generate(response);
    //........................................Send email........................................//
    transporter.sendMail(
      {
        from: '"Registration-Login Services"<example@gmail.com>', // sender address
        to: user.email, // list of receivers
        subject: "Password Reset Request", // Subject line
        html: mail,
      },

      (error, info) => {
        if (error) {
          req.flash("error", "Email not sent. Register Yourself!");
          res.redirect("/register");
        }
        req.flash("success", "Email sent successfully.");
        return res.status(200).redirect("/login");
      }
    );
  } catch (error) {
    req.flash("error", "An error occurred");
    return res.status(500).redirect("/login");
  }
};
// .......................................Update Password..................................//
module.exports.userPasswordReset = async (req, res) => {
  const { password, confirm_password } = req.body;
  const { id, token } = req.params;
  const user = await User.findById(id);
  const new_secret = user._id + process.env.SECRET;
  try {
    jwt.verify(token, new_secret);
    if (password && confirm_password) {
      if (password !== confirm_password) {
        req.flash("error", "Passwords do not match");
        return res.status(400).redirect("/resetPassword");
      } else {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const hashedPassword1 = await bcrypt.hash(confirm_password, salt);
        await User.findByIdAndUpdate(user._id, {
          $set: {
            password: hashedPassword,
            confirm_password: hashedPassword1,
          },
        });
        req.flash("success", "Password Updated Successfully");
        return res.status(200).redirect("/login");
      }
    }
  } catch (error) {
    req.flash("error", "Invalid link or expired");
    return res.status(400).redirect("/forgotPassword");
  }
};

//..................................................logout logic..................................//
module.exports.logout = async (req, res) => {
  // Clear the JWT token cookie
  res.clearCookie("token");
  res.clearCookie("jwt");
  try {
    req.logout((err) => {
      if (err) {
        console.log(err);
        return res.status(500).redirect("/register");
      } else {
        req.flash("success", "User Logged Out Successfully");
        res.status(200).redirect("/login");
      }
    });
  } catch (error) {
    console.log(error);
    req.flash("error", "Internal Server Error");
    return res.status(500).redirect("/register");
  }
};
