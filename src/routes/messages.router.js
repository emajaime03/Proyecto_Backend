import { Router } from "express";
import MessagesController from "../controllers/messages.controller.js";
import {auth} from '../middlewares/auth.js'

export const router = Router();

router.get("/", auth(["user", "premium", "admin"]), MessagesController.getAllMessages);
router.post("/", auth(["user", "premium", "admin"]), MessagesController.createMessage);