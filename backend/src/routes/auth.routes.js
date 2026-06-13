import { Router } from "express";
import { protect, authorize } from "../middleware/auth.js";
import * as authController from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/google", authController.googleLogin);
router.post("/logout", protect, authController.logout);
router.get("/me", protect, authController.me);
router.post("/refresh-token", authController.refreshToken);

router.put("/me", protect, authController.updateProfile);
router.put("/password", protect, authController.updatePassword);

router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

import { tenant } from "../middleware/tenant.js";
router.put("/organization", protect, tenant, authController.updateOrganization);

export default router;
