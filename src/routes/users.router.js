import { Router } from 'express';
import UsersController from '../controllers/users.controller.js';
import {auth} from '../middlewares/auth.js';
import { uploader } from '../middlewares/multer.js';

export const router = Router();

router.get("/",auth(["PUBLIC"]), UsersController.getAllUsers)
router.get("/:uid",auth(["PUBLIC"]), UsersController.getUserById)
router.post("/premium/:uid",auth(["PUBLIC"]), UsersController.changeRole)
router.delete("/:uid",auth(["PUBLIC"]), UsersController.deleteUserById)
router.post("/:uid/documents", uploader.array("file"), auth(["PUBLIC"]), UsersController.uploadDocuments)