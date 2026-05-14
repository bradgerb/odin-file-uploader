require('dotenv').config();
const path = require("node:path");
const express = require("express");
const session = require("express-session");

const passport = require("passport");
const indexRouter = require("./routes/indexRouter");
const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const assetsPath = path.join(__dirname, "public");
app.use(express.static(assetsPath));
app.use(express.urlencoded({ extended: true }));

app.use(session({ secret: `${process.env.sessionCode}`, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

app.use("/", indexRouter);

const PORT = 3000;
app.listen(3000, (error) => {
  if (error) {
    throw error;
  }
  console.log(`Odin file-uploader - listening on port ${PORT}!`);
});
