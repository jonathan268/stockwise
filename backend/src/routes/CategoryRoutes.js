const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/CategoryController");
const { protect, restrictTo } = require("../middlewares/auth");
const { validateCategory } = require("../middlewares/validation");

// Toutes les routes nécessitent authentification
router.use(protect);

// Routes
router
  .route("/")
  .get(categoryController.getCategories)
  .post(
    restrictTo("owner", "admin", "manager"),
    validateCategory,
    categoryController.createCategory,
  );

router
  .route("/:id")
  .get(categoryController.getCategory)
  .put(
    restrictTo("owner", "admin", "manager"),
    validateCategory,
    categoryController.updateCategory,
  )
  .delete(restrictTo("owner", "admin"), categoryController.deleteCategory);

router.get("/:id/subcategories", categoryController.getSubcategories);

module.exports = router;
