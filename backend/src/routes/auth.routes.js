import { Router } from "express";
import { protect, authorize } from "../middleware/auth.js";
import * as authController from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", protect, authController.logout);
router.get("/me", protect, authController.me);
router.post("/refresh-token", authController.refreshToken);

export default router;
