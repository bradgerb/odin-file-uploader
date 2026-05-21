// require('dotenv').config();
// import dotenv from 'dotenv';
// dotenv.config();
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import express from 'express';
import expressSession from 'express-session';
import { prisma } from './lib/prisma.js';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import passport from 'passport';
import indexRouter from './routes/indexRouter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const assetsPath = path.join(__dirname, "public");
app.use(express.static(assetsPath));
app.use(express.urlencoded({ extended: true }));

app.use(
  expressSession({
    cookie: {
     maxAge: 7 * 24 * 60 * 60 * 1000 // ms
    },
    secret: `${process.env.sessionCode}`,
    resave: true,
    saveUninitialized: true,
    store: new PrismaSessionStore(
      prisma,
      {
        checkPeriod: 2 * 60 * 1000,  //ms
        dbRecordIdIsSessionId: true,
        dbRecordIdFunction: undefined,
      }
    )
  })
);

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

// npx prisma studio --config ./prisma.config.js
// npx prisma migrate dev