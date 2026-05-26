// const CustomNotFoundError = require("../errors/CustomNotFoundError");
import { body, validationResult, matchedData } from 'express-validator';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';

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

const validateFolder = [
  body("addFolder").trim().escape()
    .isLength({min: 1, max: 20}).withMessage('Folder names must be between 1 and 20 characters.')
    .isAlphanumeric().withMessage('Folder names must be alphanumeric'),
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
    //validation for id - bugfixing
      if (!id) {
        return done(null, null);
      }
      const parsedId = parseInt(id, 10);
      if (isNaN(parsedId)) {
        return done(null, null);
      }
    const user = await prisma.user.findFirst({ 
      where: { id: parsedId },
      include: {
        folders: {
          include: {
            files: true,
          },
        },
      },
    });

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

const indexGet = async (req, res) => {
    const errors = req.session.messages || [];
    req.session.messages = [];
    const folders = req.user.folders;

    res.render("index", { 
      title: 'Home',
      user: req.user,
      errors: errors,
      folders: folders,
     });
};

const signUpGet = (req, res) => {
    res.render("sign-up-form", {title: 'Sign up'});
};

const signUpPost = [
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
];

const logInPost = [
  validateUser, 
  (req, res, next) => {
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/",
      failureMessage: true
    })(req, res, next);
  }
];

const logOutPost = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
};

const uploadGet = (req, res) => {
  res.render("upload", {title: 'Upload'});
};

const addFolderPost = [
  validateFolder,
  async (req, res) => {
    const errors = validationResult(req);
    let errorMsgArray = [];
    errors.array().forEach(error => {
      errorMsgArray.push(error.msg);
    });

    const { addFolder } = matchedData(req);

    await prisma.folder.create({
      data: {
        title: addFolder,
        user: {
          connect: { id: req.user.id }
        }
      }
    });

    res.redirect("/");
  }
];

const deleteFolderPost = (req, res) => {
  res.redirect("/");
};

const editFolderPost = (req, res) => {
  res.redirect("/");
};

const fileFolderPost = (req, res) => {
  res.redirect("/");
};

export { indexGet, signUpGet, signUpPost, logInPost, logOutPost, uploadGet, addFolderPost, deleteFolderPost, editFolderPost, fileFolderPost }