import express from "express";
import authController from "../controllers/auth";
import authMiddleware from "../middlewares/auth";

const router = express.Router();
// auth
router.post("/signup", authController.signup);
router.patch("/signup", authController.updateSignup);
router.post("/signin", authController.signin);
router.post("/send-code", authController.sendCode);
router.post("/confirm-code", authController.confirmCode);
router.post("/format-code", authController.formatCode);
router.post("/reset-password", authController.resetPassword);
router.post("/logout", authMiddleware.ensureLogin, authController.logout);
router.get("/user", authController.getUser);
router.get("/loading", authMiddleware.ensureLogin, authController.load);

export default router;
