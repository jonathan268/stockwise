const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect } = require("../middlewares/auth");
const { authLimiter } = require("../middlewares/rateLimit");
const {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
} = require("../utils/authValidation");

// Routes publiques
router.post(
  "/register",
  authLimiter,
  validateRegister,
  authController.register,
);
router.post("/login", authLimiter, validateLogin, authController.login);
router.post("/refresh-token", authController.refreshToken);

// Mot de passe
router.post(
  "/forgot-password",
  authLimiter,
  validateForgotPassword,
  authController.forgotPassword,
);
router.post(
  "/reset-password/:token",
  authLimiter,
  validateResetPassword,
  authController.resetPassword,
);

// Email vérification
router.get("/verify-email/:token", authController.verifyEmail);
router.post(
  "/resend-verification",
  authLimiter,
  authController.resendVerification,
);

// Routes protégées
router.use(protect); // Toutes les routes ci-dessous nécessitent auth

router.post("/logout", authController.logout);
router.get("/me", authController.getCurrentUser);

module.exports = router;
