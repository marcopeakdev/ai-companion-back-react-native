import express from "express";
import chatController from "../controllers/chat";
import authMiddleware from "../middlewares/auth";

const router = express.Router();
// 
router.get("/messages", authMiddleware.ensureLogin, chatController.getMessages);
router.post("/message", authMiddleware.ensureLogin, chatController.sendMessage);

export default router;
