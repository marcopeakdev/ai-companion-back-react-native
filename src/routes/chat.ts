import express from "express";
import chatController from "../controllers/chat";

const router = express.Router();
// auth
router.get("/chat-message", chatController.chat);

export default router;
