const express = require("express");
const router = express.Router();
const Prediction = require("../models/Prediction");
const { protect } = require("../middlewares/auth");
const { tenantIsolation } = require("../middlewares/tenant");
const { checkSubscription } = require("../middlewares/subscription");
const { successResponse, paginatedResponse } = require("../utils/apiResponse");
const { getPaginationParams } = require("../utils/helpers");

router.use(protect);
router.use(tenantIsolation);
router.use(checkSubscription);

// GET /api/v1/predictions
router.get("/", async (req, res, next) => {
  try {
    const organizationId = req.user.organization;
    const { type, status } = req.query;
    const { page, limit, skip } = getPaginationParams(req.query);

    const query = { organization: organizationId };
    if (type) query.type = type;
    if (status) query.status = status;

    const [predictions, total] = await Promise.all([
      Prediction.find(query)
        .populate("product", "name sku")
        .populate("createdBy", "firstName lastName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Prediction.countDocuments(query),
    ]);

    return paginatedResponse(res, predictions, { total, page, limit, pages: Math.ceil(total / limit) }, "Prédictions récupérées");
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/predictions/by-type/:type
router.get("/by-type/:type", async (req, res, next) => {
  try {
    const organizationId = req.user.organization;
    const { type } = req.params;
    const { limit = 10 } = req.query;

    const predictions = await Prediction.find({ organization: organizationId, type })
      .populate("product", "name sku")
      .populate("createdBy", "firstName lastName")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    return successResponse(res, predictions, `Prédictions de type ${type}`);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/predictions/by-product/:productId
router.get("/by-product/:productId", async (req, res, next) => {
  try {
    const organizationId = req.user.organization;
    const { productId } = req.params;

    const predictions = await Prediction.find({ organization: organizationId, product: productId })
      .populate("product", "name sku")
      .sort({ createdAt: -1 });

    return successResponse(res, predictions, "Prédictions du produit");
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/predictions/:id
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organization;

    const prediction = await Prediction.findOne({ _id: id, organization: organizationId })
      .populate("product")
      .populate("createdBy", "firstName lastName");

    if (!prediction) {
      return res.status(404).json({ success: false, message: "Prédiction introuvable" });
    }

    return successResponse(res, prediction, "Prédiction récupérée");
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/predictions/:id/feedback
router.patch("/:id/feedback", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { helpful, accuracy, actualOutcome, comment } = req.body;
    const organizationId = req.user.organization;
    const userId = req.user._id;

    const prediction = await Prediction.findOne({ _id: id, organization: organizationId });

    if (!prediction) {
      return res.status(404).json({ success: false, message: "Prédiction introuvable" });
    }

    prediction.feedback = { helpful, accuracy, actualOutcome, comment, submittedAt: new Date(), submittedBy: userId };
    await prediction.save();

    return successResponse(res, prediction, "Feedback enregistré");
  } catch (error) {
    next(error);
  }
});

module.exports = router;
