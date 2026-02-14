const express = require("express");
const router = express.Router();
const supplierController = require("../controllers/supplierController");
const { protect, restrictTo } = require("../middlewares/auth");
const { checkSubscription } = require("../middlewares/subscription");
const {
  validateCreateSupplier,
  validateUpdateSupplier,
  validateRating,
} = require("../utils/supplierValidation");

router.use(protect);
router.use(checkSubscription);

// Routes spéciales
router.get("/top", supplierController.getTopSuppliers);
router.post(
  "/import",
  restrictTo("owner", "admin"),
  supplierController.importSuppliers,
);
router.get("/export", supplierController.exportSuppliers);

// Routes CRUD
router
  .route("/")
  .get(supplierController.getSuppliers)
  .post(
    restrictTo("owner", "admin", "manager"),
    validateCreateSupplier,
    supplierController.createSupplier,
  );

router
  .route("/:id")
  .get(supplierController.getSupplier)
  .put(
    restrictTo("owner", "admin", "manager"),
    validateUpdateSupplier,
    supplierController.updateSupplier,
  )
  .delete(restrictTo("owner", "admin"), supplierController.deleteSupplier);

// Relations
router.get("/:id/orders", supplierController.getSupplierOrders);
router.get("/:id/products", supplierController.getSupplierProducts);

// Performance
router.get("/:id/performance", supplierController.getPerformance);
router.put(
  "/:id/rating",
  restrictTo("owner", "admin", "manager"),
  validateRating,
  supplierController.updateRating,
);

module.exports = router;
