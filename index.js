require("dotenv").config();
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const mongoose = require("./config/mongoose");
require("mongodb");
const path = require("path");
const flash = require("connect-flash");
const customMiddleware = require("./config/flashMiddleware");
const usersRouter = require("./routes/users");

const port = process.env.PORT || 8000;
//.................creating the express app..................//
const app = express();
//...........   .to set up the viewengine....................//
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
//.......middleware to use static file/folder using path.....//
app.use(express.static("assets"));
//.........................middlewares....  .................//
app.use(express.json());

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,

    // cookie: {
    //   maxAge: 3600000,
    //   secure: false, //secure option should be set to true if my application is using HTTPS.
    // },
  })
);

//.......................passport  middleware..  ............//
app.use(passport.initialize());
app.use(passport.session()); // passport use session

//.........................flash middleware..  ..............//
app.use(flash());
app.use(customMiddleware.setFlash);

//....................import routes..........................//
app.use("/", usersRouter);

//............ server listening on port......................//
app.listen(port, (err) => {
  if (err) {
    console.log(`Problem in running the server ${err}`);
  }
  console.log(`Server running at http://localhost:${port}`);
});
