import express from "express";
import authController from "../controllers/auth";
import authMiddleware from "../middlewares/auth";

const router = express.Router();
// auth
router.post("/signup", authController.signup);
router.post("/signin", authController.signin);
router.get("/user", authController.getUser);
router.get("/loading", authMiddleware.ensureLogin, authController.load);

export default router;
