const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { protect, restrictTo } = require("../middlewares/auth");
const { validateProduct } = require("../middlewares/validation");

router.use(protect);

// Routes spéciales en premier
router.get("/search", productController.searchProducts);
router.get("/low-stock", productController.getLowStockProducts);
router.get("/by-category/:categoryId", productController.getByCategory);

router.post(
  "/bulk-import",
  restrictTo("owner", "admin", "manager"),
  productController.bulkImport,
);

router.get("/export", productController.exportProducts);

// Routes CRUD principales
router
  .route("/")
  .get(productController.getProducts)
  .post(
    restrictTo("owner", "admin", "manager"),
    validateProduct,
    productController.createProduct,
  );

router
  .route("/:id")
  .get(productController.getProduct)
  .put(
    restrictTo("owner", "admin", "manager"),
    validateProduct,
    productController.updateProduct,
  )
  .delete(restrictTo("owner", "admin"), productController.deleteProduct);

// Actions spécifiques
router.patch(
  "/:id/status",
  restrictTo("owner", "admin", "manager"),
  productController.toggleStatus,
);

router.post(
  "/:id/duplicate",
  restrictTo("owner", "admin", "manager"),
  productController.duplicateProduct,
);

module.exports = router;
