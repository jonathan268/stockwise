const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");
const { protect } = require("../middlewares/auth");
const {
  checkSubscription,
  requireFeature,
} = require("../middlewares/subscription");

router.use(protect);
router.use(checkSubscription);

router.get("/dashboard", analyticsController.getDashboard);
router.get("/sales", analyticsController.getSalesAnalytics);
router.get("/inventory", analyticsController.getInventoryAnalytics);
router.get("/revenue", analyticsController.getRevenueAnalytics);
router.get("/top-products", analyticsController.getTopProducts);
router.get("/trends", analyticsController.getTrends);

router.get(
  "/export",
  requireFeature("advancedReports"),
  analyticsController.exportReport,
);

module.exports = router;
