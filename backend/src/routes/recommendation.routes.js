import express from "express";
import { protect } from "../middleware/auth.js";
import { tenant } from "../middleware/tenant.js";
import { planGate } from "../middleware/planGate.js";
import { asyncHandler } from "../utils/appError.js";
import Recommendation from "../models/Recommendation.js";
import { generateInsightsForOrg } from "../services/ai.service.js";

const router = express.Router();

router.use(protect);
router.use(tenant);

/**
 * @route   GET /api/v1/recommendations
 * @desc    Récupère les recommandations IA de l'organisation
 */
router.get("/", planGate("aiRecommendations"), asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const query = { organizationId: req.organizationId, isDismissed: false };

  const [recommendations, total] = await Promise.all([
    Recommendation.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    Recommendation.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: recommendations,
    meta: { total, page: Number(page), totalPages: Math.ceil(total / limit) },
  });
}));

/**
 * @route   POST /api/v1/recommendations/generate
 * @desc    Déclenche manuellement une analyse IA
 */
router.post("/generate", asyncHandler(async (req, res) => {
  await generateInsightsForOrg(req.organizationId);
  res.json({ success: true, message: "Analyse IA lancée avec succès" });
}));

/**
 * @route   PATCH /api/v1/recommendations/:id/read
 * @desc    Marque une recommandation comme lue
 */
router.patch("/:id/read", asyncHandler(async (req, res) => {
  const rec = await Recommendation.findOneAndUpdate(
    { _id: req.params.id, organizationId: req.organizationId },
    { isRead: true },
    { new: true }
  );
  res.json({ success: true, data: rec });
}));

/**
 * @route   PATCH /api/v1/recommendations/:id/dismiss
 * @desc    Masque une recommandation
 */
router.patch("/:id/dismiss", asyncHandler(async (req, res) => {
  const rec = await Recommendation.findOneAndUpdate(
    { _id: req.params.id, organizationId: req.organizationId },
    { isDismissed: true },
    { returnDocument: "after" }
  );
  res.json({ success: true, data: rec });
}));

export default router;
