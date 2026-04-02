const express = require("express");
const router = express.Router();
const recommendationController = require("../controllers/recommendationController");
const { protect: authenticate } = require("../middlewares/auth");
const { tenantIsolation } = require("../middlewares/tenant");

// Appliquer les middlewares de protection
router.use(authenticate);
router.use(tenantIsolation);

// GET /api/v1/recommendations/reorder
router.get("/reorder", recommendationController.getReorderRecommendations);

// GET /api/v1/recommendations/discontinue
router.get(
  "/discontinue",
  recommendationController.getDiscontinueRecommendations,
);

// GET /api/v1/recommendations/low-stock
router.get("/low-stock", recommendationController.getLowStockRecommendations);

// GET /api/v1/recommendations/high-value
router.get("/high-value", recommendationController.getHighValueProducts);

// GET /api/v1/recommendations/supplier
router.get("/supplier", recommendationController.getSupplierRecommendations);

// POST /api/v1/recommendations/optimal-order
router.post("/optimal-order", recommendationController.getOptimalOrderQuantity);

module.exports = router;
