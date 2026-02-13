const express = require("express");
const router = express.Router();
const geminiController = require("../controllers/geminiController");
const { protect: authenticate } = require("../middlewares/auth");

// Middleware de rate limiting pour respecter les quotas Gemini gratuits
const rateLimit = require("express-rate-limit");

const geminiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requêtes max par minute (plan gratuit = 15, on met 10 pour sécurité)
  message: {
    success: false,
    message:
      "Trop de requêtes IA. Plan gratuit limité à 10/min. Réessayez dans 1 minute.",
  },
});

// ROUTE ULTRA-OPTIMISÉE - Recommandée pour le plan gratuit
router.post(
  "/quick-analysis",
  authenticate,
  geminiRateLimiter,
  geminiController.quickAnalysis,
);

// Analyse complète (1 seul appel IA)
router.post(
  "/complete-analysis",
  authenticate,
  authorize(["admin", "manager"]),
  geminiRateLimiter,
  geminiController.runCompleteAnalysis,
);

// Analyse sélective (max 2 appels IA)
router.post(
  "/selective-analysis",
  authenticate,
  geminiRateLimiter,
  geminiController.runSelectiveAnalysis,
);

// Routes individuelles (à utiliser avec parcimonie)
router.post(
  "/analyze-stock",
  authenticate,
  geminiRateLimiter,
  geminiController.analyzeStock,
);

router.post(
  "/predict-demand",
  authenticate,
  geminiRateLimiter,
  geminiController.predictDemand,
);

router.post(
  "/detect-anomalies",
  authenticate,
  geminiRateLimiter,
  geminiController.detectAnomalies,
);

router.post(
  "/custom-query",
  authenticate,
  geminiRateLimiter,
  geminiController.customQuery,
);

// Utilitaires
router.post(
  "/clear-cache",
  authenticate,
  authorize(["admin"]),
  geminiController.clearCache,
);

router.get("/usage", authenticate, geminiController.getApiUsage);

module.exports = router;
