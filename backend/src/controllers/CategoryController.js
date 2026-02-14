const Category = require("../models/Category");
const Product = require("../models/Product");
const { AppError } = require("../utils/appError");
const { successResponse } = require("../utils/apiResponse");

class CategoryController {
  // GET /api/v1/categories
  async getCategories(req, res, next) {
    try {
      const { parent, status, search } = req.query;
      const organizationId = req.user.organization;

      // Construction query
      const query = { organization: organizationId };

      if (parent !== undefined) {
        query.parent = parent === "null" ? null : parent;
      }

      if (status) {
        query.status = status;
      }

      if (search) {
        query.name = { $regex: search, $options: "i" };
      }

      const categories = await Category.find(query)
        .populate("parent", "name")
        .populate("createdBy", "firstName lastName")
        .populate("productsCount")
        .sort({ order: 1, name: 1 });

      return successResponse(
        res,
        categories,
        "Catégories récupérées avec succès",
      );
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/categories/:id
  async getCategory(req, res, next) {
    try {
      const { id } = req.params;
      const organizationId = req.user.organization;

      const category = await Category.findOne({
        _id: id,
        organization: organizationId,
      })
        .populate("parent", "name")
        .populate("subcategories")
        .populate("productsCount");

      if (!category) {
        throw new AppError("Catégorie introuvable", 404);
      }

      return successResponse(res, category, "Catégorie récupérée avec succès");
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/categories
  async createCategory(req, res, next) {
    try {
      const organizationId = req.user.organization;
      const userId = req.user._id;

      const categoryData = {
        ...req.body,
        organization: organizationId,
        createdBy: userId,
      };

      // Vérifier parent existe si fourni
      if (categoryData.parent) {
        const parentCategory = await Category.findOne({
          _id: categoryData.parent,
          organization: organizationId,
        });

        if (!parentCategory) {
          throw new AppError("Catégorie parente introuvable", 404);
        }
      }

      const category = await Category.create(categoryData);

      return successResponse(res, category, "Catégorie créée avec succès", 201);
    } catch (error) {
      if (error.code === 11000) {
        return next(new AppError("Une catégorie avec ce nom existe déjà", 400));
      }
      next(error);
    }
  }

  // PUT /api/v1/categories/:id
  async updateCategory(req, res, next) {
    try {
      const { id } = req.params;
      const organizationId = req.user.organization;

      const category = await Category.findOne({
        _id: id,
        organization: organizationId,
      });

      if (!category) {
        throw new AppError("Catégorie introuvable", 404);
      }

      // Empêcher de définir parent = soi-même
      if (req.body.parent && req.body.parent.toString() === id) {
        throw new AppError(
          "Une catégorie ne peut pas être son propre parent",
          400,
        );
      }

      // Empêcher cycles (parent devient enfant de son enfant)
      if (req.body.parent) {
        const parentCategory = await Category.findById(req.body.parent);
        if (
          parentCategory &&
          parentCategory.parent &&
          parentCategory.parent.toString() === id
        ) {
          throw new AppError("Hiérarchie circulaire détectée", 400);
        }
      }

      Object.assign(category, req.body);
      await category.save();

      return successResponse(
        res,
        category,
        "Catégorie mise à jour avec succès",
      );
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/v1/categories/:id
  async deleteCategory(req, res, next) {
    try {
      const { id } = req.params;
      const organizationId = req.user.organization;

      const category = await Category.findOne({
        _id: id,
        organization: organizationId,
      });

      if (!category) {
        throw new AppError("Catégorie introuvable", 404);
      }

      // Vérifier si a des sous-catégories
      const hasSubcategories = await category.hasSubcategories();
      if (hasSubcategories) {
        throw new AppError(
          "Impossible de supprimer une catégorie contenant des sous-catégories",
          400,
        );
      }

      // Vérifier si a des produits
      const hasProducts = await category.hasProducts();
      if (hasProducts) {
        throw new AppError(
          "Impossible de supprimer une catégorie contenant des produits",
          400,
        );
      }

      await category.deleteOne();

      return successResponse(res, null, "Catégorie supprimée avec succès");
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/categories/:id/subcategories
  async getSubcategories(req, res, next) {
    try {
      const { id } = req.params;
      const organizationId = req.user.organization;

      // Vérifier que parent existe
      const parentCategory = await Category.findOne({
        _id: id,
        organization: organizationId,
      });

      if (!parentCategory) {
        throw new AppError("Catégorie parente introuvable", 404);
      }

      const subcategories = await Category.find({
        organization: organizationId,
        parent: id,
      })
        .populate("productsCount")
        .sort({ order: 1, name: 1 });

      return successResponse(
        res,
        subcategories,
        "Sous-catégories récupérées avec succès",
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CategoryController();
