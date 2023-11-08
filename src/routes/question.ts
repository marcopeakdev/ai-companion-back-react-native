import express from "express";
import questionController from "../controllers/question";
import authMiddleware from "../middlewares/auth";

const router = express.Router();
// auth
router.get("/questions", authMiddleware.ensureLogin, questionController.getQestionsandTips);
router.post("/user-question-answer", authMiddleware.ensureLogin, questionController.saveUserAnswer);
router.post("/goal-question-answer", authMiddleware.ensureLogin, questionController.saveGoalAnswer);

export default router;  