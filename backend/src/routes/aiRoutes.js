const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");
const { protect, restrictTo } = require("../middlewares/auth");
const { checkSubscription } = require("../middlewares/subscription");
const { apiLimiter } = require("../middlewares/rateLimit");

router.use(protect);
router.use(checkSubscription);
router.use(apiLimiter); // Rate limiting strict pour IA

// Prédictions
router.post(
  "/predict-demand",
  restrictTo("owner", "admin", "manager"),
  aiController.predictDemand,
);

router.post(
  "/optimize-stock",
  restrictTo("owner", "admin", "manager"),
  aiController.optimizeStock,
);

router.post(
  "/detect-anomalies",
  restrictTo("owner", "admin", "manager"),
  aiController.detectAnomalies,
);

router.post("/ask", aiController.askQuestion);

router.post(
  "/insights",
  restrictTo("owner", "admin"),
  aiController.generateInsights,
);

// Historique
router.get("/predictions", aiController.getPredictions);
router.get("/predictions/:id", aiController.getPrediction);
router.post("/predictions/:id/feedback", aiController.submitFeedback);

module.exports = router;
