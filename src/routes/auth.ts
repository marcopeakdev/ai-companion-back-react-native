import express from "express";
import authController from "../controllers/auth";

const router = express.Router();
// auth
router.post("/signup", authController.signup);
router.post("/signin", authController.signin);
router.get("/user", authController.getUser);

export default router;
