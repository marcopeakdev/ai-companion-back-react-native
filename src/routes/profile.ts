import express from "express";
import profileController from "../controllers/profile";
import authMiddleware from "../middlewares/auth";

const router = express.Router();
// auth
router.post("/set-question-interval", authMiddleware.ensureLogin, profileController.setQuestionInterval);
router.post("/set-tip-interval", authMiddleware.ensureLogin, profileController.setTipInterval);
router.post("/set-goal", authMiddleware.ensureLogin, profileController.setGoal);
router.post("/goal-progress", authMiddleware.ensureLogin, profileController.saveGoalProgress);
router.post("/domain-progress", authMiddleware.ensureLogin, profileController.saveDomainProgress);
router.delete("/goal", authMiddleware.ensureLogin, profileController.deleteGoal);
router.get("/progress", authMiddleware.ensureLogin, profileController.getProgress);
router.get("/tips", authMiddleware.ensureLogin, profileController.getTips);
router.patch("/tips-date", authMiddleware.ensureLogin, profileController.updateTipsDate);

export default router;
