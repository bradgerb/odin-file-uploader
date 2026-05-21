// const db = require ('../db/queries');
// const CustomNotFoundError = require("../errors/CustomNotFoundError");
const { body, validationResult, matchedData } = require("express-validator");
const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma.js");

const validateUser = [
    body("username").trim().escape().toLowerCase()
      .isLength({min: 1, max: 20}).withMessage('Username must be between 1 and 20 characters.'),
    body("password").trim().escape()
      .isLength({ min: 4}).withMessage('Password must be at least 4 characters.'),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    })
];

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await prisma.user.findFirst({ where: { username: username } })

      if (!user) {
        return done(null, false, { message: "Username not found" });
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, { message: "Incorrect username/password combination" })
      }
      return done(null, user);
    } catch(err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findFirst({ where: { id: id } });

    done(null, user);
  } catch(err) {
    done(err);
  }
});

const usernameCheck = async (username) => {
  const test = await prisma.user.findFirst({ where: { username: username } });
  //return boolean equivalent
  return !!test;
};

exports.indexGet = async (req, res) => {
    const errors = req.session.messages || [];
    // const messages = await db.getMessages();
    req.session.messages = [];
    res.render("index", { 
      title: 'Log in',
      user: req.user,
      errors: errors,
      // messages: messages,
     });
};

exports.signUpGet = (req, res) => {
    res.render("sign-up-form", {title: 'Sign up'});
};

exports.signUpPost = [
  validateUser,
  async (req, res, next) => {
    const { username, password } = matchedData(req);
    const errors = validationResult(req);
    const usernameExists = await usernameCheck(username);
    let errorMsgArray = [];

    if(usernameExists){
      errorMsgArray.push('Username already taken');
    };
  
    errors.array().forEach(error => {
      errorMsgArray.push(error.msg);
    });

    if(errorMsgArray.length > 0){
        return res.status(400).render("sign-up-form", {
          title: 'Sign up',
          errors: errorMsgArray,
        });
    } else {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.create({
        data: {
          username: username,
          password: hashedPassword
        },
        include: {
          files: true
        }
      });
      res.redirect("/");
    } catch (error) {
        console.error(error);
        next(error);
      }
    }
  }
] 

exports.logInPost = [
  validateUser, 
  (req, res, next) => {
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/",
      failureMessage: true
    })(req, res, next);
  }
]

exports.logOutPost = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
};
