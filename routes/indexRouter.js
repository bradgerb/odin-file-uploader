import { Router } from 'express';
import { indexGet, signUpGet, signUpPost, logInPost, logOutPost, uploadGet, addFolderGet } from '../controllers/indexController.js';
const indexRouter = Router();

indexRouter.get("/", indexGet);
indexRouter.get("/sign-up", signUpGet);
indexRouter.post("/sign-up", signUpPost);
indexRouter.post("/log-in", logInPost);
indexRouter.get("/log-out", logOutPost);
indexRouter.get("/upload", uploadGet);
indexRouter.post("/addFolder", addFolderGet);

export default indexRouter;
