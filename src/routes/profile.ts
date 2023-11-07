import express from "express";
import profileController from "../controllers/profile";
import authMiddleware from "../middlewares/auth";

const router = express.Router();
// auth
router.post("/set-question-interval", authMiddleware.ensureLogin, profileController.setQuestionInterval);
router.post("/set-tip-interval", authMiddleware.ensureLogin, profileController.setTipInterval);
router.get("/domain", authMiddleware.ensureLogin, profileController.getDomain);
router.get("/goal", authMiddleware.ensureLogin, profileController.getGoal);
router.post("/set-goal", authMiddleware.ensureLogin, profileController.setGoal);
router.delete("/goal", authMiddleware.ensureLogin, profileController.deleteGoal);

export default router;  
