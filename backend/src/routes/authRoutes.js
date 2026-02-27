const express = require("express");
const router = express.Router();
const passport = require("../config/passport");
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
router.post("/register", validateRegister, authController.register);
router.post("/login", authLimiter, validateLogin, authController.login);
router.post("/refresh-token", authController.refreshToken);

// ─── GOOGLE : Lancer le flux OAuth ──────────────────────────────────────────
// GET /api/v1/auth/google
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

// ─── GOOGLE : Callback après authentification Google ────────────────────────
// GET /api/v1/auth/google/callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_failed`,
  }),
  (req, res) => {
    try {
      // Générer JWT pour l'utilisateur authentifié
      const token = generateToken(req.user._id);

      // Rediriger vers le frontend avec le token en query param
      // Le frontend récupère le token et le stocke dans localStorage
      res.redirect(
        `${process.env.FRONTEND_URL}/auth/callback?token=${token}`,
      );
    } catch (error) {
      res.redirect(
        `${process.env.FRONTEND_URL}/login?error=server_error`,
      );
    }
  },
);

// ─── OPTIONNEL : Lier un compte Google à un compte existant ─────────────────
// POST /api/v1/auth/google/link  (utilisateur déjà connecté)
router.post("/google/link", protect, async (req, res) => {
  res.json({
    success: true,
    message: "Utilisez GET /api/v1/auth/google pour lier votre compte Google",
    linkUrl: `${process.env.BACKEND_URL || "http://localhost:3000"}/api/v1/auth/google`,
  });
});

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
router.post("/setup-organization", authController.setupOrganization);

module.exports = router;
