import { Router } from 'express';
import pkg from 'multer';
const multer = pkg;
import { indexGet, signUpGet, signUpPost, logInPost, logOutPost, uploadGet, addFolderPost, deleteFolderPost, editFolderPost, updateFolderPost, fileFolderPost, uploadPost } from '../controllers/indexController.js';
const indexRouter = Router();
const upload = multer({ dest: 'uploads/' })

indexRouter.get("/", indexGet);
indexRouter.get("/sign-up", signUpGet);
indexRouter.post("/sign-up", signUpPost);
indexRouter.post("/log-in", logInPost);
indexRouter.get("/log-out", logOutPost);
indexRouter.get("/upload", uploadGet);
indexRouter.post("/addFolder", addFolderPost);
indexRouter.post("/deleteFolder", deleteFolderPost);
indexRouter.post("/editFolder", editFolderPost);
indexRouter.post("/updateFolder", updateFolderPost);
indexRouter.post("/fileFolder", fileFolderPost);
indexRouter.post("/upload", upload.single('file'), uploadPost);

export default indexRouter;
