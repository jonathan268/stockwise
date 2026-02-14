const express = require("express");
const router = express.Router();
const stockController = require("../controllers/stockController");
const { protect, restrictTo } = require("../middlewares/auth");
const { validateStockAdjustment } = require("../middlewares/validation");

router.use(protect);

// Routes spéciales
router.get("/overview", stockController.getStockOverview);
router.get("/movements", stockController.getStockMovements);
router.get("/locations", stockController.getLocations);

router.post(
  "/locations",
  restrictTo("owner", "admin"),
  stockController.createLocation,
);

router.post(
  "/adjust",
  restrictTo("owner", "admin", "manager", "staff"),
  validateStockAdjustment,
  stockController.adjustStock,
);

router.post(
  "/transfer",
  restrictTo("owner", "admin", "manager"),
  stockController.transferStock,
);

router.post(
  "/stock-take",
  restrictTo("owner", "admin", "manager"),
  stockController.performStockTake,
);

// Routes par produit
router.route("/").get(stockController.getAllStock);

router
  .route("/:productId")
  .get(stockController.getProductStock)
  .put(restrictTo("owner", "admin", "manager"), stockController.updateStock);

router.get("/:productId/movements", stockController.getProductMovements);

module.exports = router;
