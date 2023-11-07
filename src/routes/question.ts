import express from "express";
import questionController from "../controllers/question";
import authMiddleware from "../middlewares/auth";

const router = express.Router();
// auth
router.get("/questions", authMiddleware.ensureLogin, questionController.getQestionsandTips);

export default router;  