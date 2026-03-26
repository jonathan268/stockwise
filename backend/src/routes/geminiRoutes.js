const express = require("express");
const router = express.Router();
const geminiController = require("../controllers/geminiController");
const { protect: authenticate, restrictTo } = require("../middlewares/auth");
const { tenantIsolation } = require("../middlewares/tenant");
const { checkSubscription } = require("../middlewares/subscription");

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

// Appliquer les middlewares de protection
router.use(authenticate);
router.use(tenantIsolation);
router.use(checkSubscription);
router.get(
  "/quick-analysis",
  authenticate,
  geminiRateLimiter,
  geminiController.quickAnalysis,
);

// Analyse complète (1 seul appel IA) - Correspond au frontend /analyze-combined
router.post(
  "/analyze-combined",
  authenticate,
  restrictTo("owner", "admin", "manager"),
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
  "/optimize-orders",
  authenticate,
  geminiRateLimiter,
  geminiController.optimizeOrders,
);

router.post(
  "/analyze-waste",
  authenticate,
  geminiRateLimiter,
  geminiController.analyzeWaste,
);

router.post(
  "/generate-report",
  authenticate,
  geminiRateLimiter,
  geminiController.generateReport,
);

router.post(
  "/custom-prompt",
  authenticate,
  geminiRateLimiter,
  geminiController.customQuery,
);

// Utilitaires
router.post(
  "/clear-cache",
  authenticate,
  restrictTo("owner", "admin"),
  geminiController.clearCache,
);

router.get("/stats", authenticate, geminiController.getApiUsage);

module.exports = router;
