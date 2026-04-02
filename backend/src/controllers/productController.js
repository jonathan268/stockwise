const Product = require("../models/Product");
const Stock = require("../models/Stock");
const Category = require("../models/Category");
const { AppError } = require("../utils/appError");
const { successResponse } = require("../utils/apiResponse");

class ProductController {
  // GET /api/v1/products
  async getProducts(req, res, next) {
    try {
      const organizationId = req.user.organization;
      const {
        page = 1,
        limit = 20,
        search,
        category,
        status,
        supplier,
        perishable,
        sortBy = "name",
        order = "asc",
      } = req.query;

      const query = { organization: organizationId };

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { sku: { $regex: search, $options: "i" } },
          { barcode: { $regex: search, $options: "i" } },
        ];
      }

      if (category) query.category = category;
      if (status) query.status = status;
      if (supplier) query.supplier = supplier;
      if (perishable !== undefined) {
        query["metadata.perishable"] = perishable === "true";
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const sortOptions = {};
      sortOptions[sortBy] = order === "desc" ? -1 : 1;

      const [products, total] = await Promise.all([
        Product.find(query)
          .populate("category", "name slug")
          .populate("supplier", "name phone")
          .populate("createdBy", "firstName lastName")
          .sort(sortOptions)
          .skip(skip)
          .limit(parseInt(limit)),
        Product.countDocuments(query),
      ]);

      // ✅ FIX : convertir en objet JS pur avant d'attacher le stock
      const productsWithStock = await Promise.all(
        products.map(async (product) => {
          const stock = await Stock.findOne({
            organization: organizationId,
            product: product._id,
          });
          const productObj = product.toObject();
          productObj.stock = stock ? stock.toObject() : null;
          return productObj;
        }),
      );

      return successResponse(
        res,
        {
          products: productsWithStock,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / parseInt(limit)),
          },
        },
        "Produits récupérés avec succès",
      );
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/products/:id
  async getProduct(req, res, next) {
    try {
      const { id } = req.params;
      const organizationId = req.user.organization;

      const product = await Product.findOne({
        _id: id,
        organization: organizationId,
      })
        .populate("category")
        .populate("supplier")
        .populate("createdBy", "firstName lastName")
        .populate("updatedBy", "firstName lastName");

      if (!product) {
        throw new AppError("Produit introuvable", 404);
      }

      const stock = await Stock.findOne({
        organization: organizationId,
        product: product._id,
      });

      // ✅ FIX : convertir en objet JS pur
      const productObj = product.toObject();
      productObj.stock = stock ? stock.toObject() : null;

      return successResponse(res, productObj, "Produit récupéré avec succès");
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/products
  async createProduct(req, res, next) {
    try {
      const organizationId = req.user.organization;
      const userId = req.user._id;

      const subscription = req.subscription;
      const currentCount = await Product.countDocuments({
        organization: organizationId,
        status: { $ne: "discontinued" },
      });

      if (
        subscription.features.maxProducts !== -1 &&
        currentCount >= subscription.features.maxProducts
      ) {
        throw new AppError(
          `Limite de ${subscription.features.maxProducts} produits atteinte. Passez à un plan supérieur.`,
          403,
        );
      }

      console.log("[CreateProduct] Body:", JSON.stringify(req.body, null, 2));

      // Vérifier si la catégorie est un ObjectId valide
      const mongoose = require("mongoose");
      if (
        req.body.category &&
        !mongoose.Types.ObjectId.isValid(req.body.category)
      ) {
        console.warn(
          "[CreateProduct] Invalid Category ID format:",
          req.body.category,
        );
        throw new AppError("Format de catégorie invalide", 400);
      }

      const category = await Category.findOne({
        _id: req.body.category,
        organization: organizationId,
      });

      if (!category) {
        console.warn("[CreateProduct] Category not found:", req.body.category);
        throw new AppError("Catégorie introuvable ou invalide", 400);
      }

      const productData = {
        ...req.body,
        organization: organizationId,
        createdBy: userId,
      };

      // Supprimer le champ virtual pour éviter les conflits lors de la création
      delete productData.stock;

      console.log("[CreateProduct] Saving product...");
      const product = await Product.create(productData);
      console.log("[CreateProduct] Product saved:", product._id);

      let createdStock = null;
      if (req.body.stock) {
        // Valider et nettoyer les données de stock
        const quantity = parseFloat(req.body.stock.quantity);
        const minThreshold = parseFloat(req.body.stock.minThreshold);
        const maxThreshold = parseFloat(req.body.stock.maxThreshold);
        const reorderPoint = req.body.stock.reorderPoint
          ? parseFloat(req.body.stock.reorderPoint)
          : undefined;

        const stockData = {
          quantity: isNaN(quantity) ? 0 : Math.max(0, quantity),
          minThreshold: isNaN(minThreshold) ? 0 : Math.max(0, minThreshold),
          maxThreshold: isNaN(maxThreshold) ? 0 : Math.max(0, maxThreshold),
          reorderPoint:
            !isNaN(reorderPoint) && reorderPoint > 0 ? reorderPoint : undefined,
          location: {
            name: req.body.stock.location || "Principal",
            type: "warehouse",
          },
        };

        console.log(
          "[CreateProduct] Creating/Updating stock with:",
          JSON.stringify(stockData, null, 2),
        );
        createdStock = await Stock.findOneAndUpdate(
          { organization: organizationId, product: product._id },
          { $set: stockData },
          { upsert: true, new: true, runValidators: true },
        );
        console.log(
          "[CreateProduct] Stock saved with quantity:",
          createdStock.quantity,
        );
      } else {
        console.log("[CreateProduct] Initializing default stock...");
        createdStock = await Stock.findOneAndUpdate(
          { organization: organizationId, product: product._id },
          {
            $setOnInsert: {
              quantity: 0,
              minThreshold: 0,
              maxThreshold: 0,
              location: { name: "Principal", type: "warehouse" },
            },
          },
          { upsert: true, new: true },
        );
      }

      const productWithStock = await Product.findById(product._id)
        .populate("category")
        .populate("supplier");

      // ✅ FIX : convertir en objet JS pur
      const productObj = productWithStock.toObject();
      productObj.stock = createdStock.toObject();

      return successResponse(res, productObj, "Produit créé avec succès", 201);
    } catch (error) {
      console.error("[CreateProduct] ERROR:", error);
      if (error.code === 11000) {
        return next(new AppError("Un produit avec ce SKU existe déjà", 400));
      }
      next(error);
    }
  }

  // PUT /api/v1/products/:id
  async updateProduct(req, res, next) {
    try {
      const { id } = req.params;
      const organizationId = req.user.organization;
      const userId = req.user._id;

      const product = await Product.findOne({
        _id: id,
        organization: organizationId,
      });

      if (!product) {
        throw new AppError("Produit introuvable", 404);
      }

      if (
        req.body.category &&
        req.body.category !== product.category.toString()
      ) {
        const category = await Category.findOne({
          _id: req.body.category,
          organization: organizationId,
        });
        if (!category) {
          throw new AppError("Catégorie invalide", 400);
        }
      }

      const stockData = req.body.stock;
      const productDataToUpdate = { ...req.body };
      delete productDataToUpdate.stock;

      Object.assign(product, productDataToUpdate);
      product.updatedBy = userId;
      await product.save();

      let updatedStock = null;
      if (stockData) {
        const updateObj = {};

        // Valider et nettoyer chaque champ stock
        if (stockData.quantity !== undefined) {
          const qty = parseFloat(stockData.quantity);
          updateObj.quantity = isNaN(qty) ? 0 : Math.max(0, qty);
        }
        if (stockData.minThreshold !== undefined) {
          const min = parseFloat(stockData.minThreshold);
          updateObj.minThreshold = isNaN(min) ? 0 : Math.max(0, min);
        }
        if (stockData.maxThreshold !== undefined) {
          const max = parseFloat(stockData.maxThreshold);
          updateObj.maxThreshold = isNaN(max) ? 0 : Math.max(0, max);
        }
        if (
          stockData.reorderPoint !== undefined &&
          stockData.reorderPoint !== null &&
          stockData.reorderPoint !== ""
        ) {
          const reorder = parseFloat(stockData.reorderPoint);
          updateObj.reorderPoint =
            !isNaN(reorder) && reorder > 0 ? reorder : undefined;
        }

        if (stockData.location) {
          updateObj.location = {
            name: stockData.location,
            type: "warehouse",
          };
        }

        console.log(
          "[UpdateProduct] Stock update with:",
          JSON.stringify(updateObj, null, 2),
        );
        updatedStock = await Stock.findOneAndUpdate(
          { organization: organizationId, product: id },
          { $set: updateObj },
          { upsert: true, new: true, runValidators: true },
        );
        console.log(
          "[UpdateProduct] Stock updated with quantity:",
          updatedStock.quantity,
        );
      } else {
        updatedStock = await Stock.findOne({
          organization: organizationId,
          product: id,
        });
      }

      const productWithStock = await Product.findById(id)
        .populate("category")
        .populate("supplier");

      // ✅ FIX : convertir en objet JS pur
      const productObj = productWithStock.toObject();
      productObj.stock = updatedStock ? updatedStock.toObject() : null;

      return successResponse(res, productObj, "Produit mis à jour avec succès");
    } catch (error) {
      if (error.code === 11000) {
        return next(new AppError("Un produit avec ce SKU existe déjà", 400));
      }
      next(error);
    }
  }

  // DELETE /api/v1/products/:id
  async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;
      const organizationId = req.user.organization;

      const product = await Product.findOne({
        _id: id,
        organization: organizationId,
      });

      if (!product) {
        throw new AppError("Produit introuvable", 404);
      }

      const stock = await Stock.findOne({
        organization: organizationId,
        product: id,
      });

      if (stock && stock.quantity > 0) {
        throw new AppError(
          'Impossible de supprimer un produit avec du stock. Mettez-le en statut "discontinued" à la place.',
          400,
        );
      }

      if (stock) await stock.deleteOne();
      await product.deleteOne();

      return successResponse(res, null, "Produit supprimé avec succès");
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/v1/products/:id/status
  async toggleStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const organizationId = req.user.organization;

      if (!["active", "inactive", "discontinued"].includes(status)) {
        throw new AppError("Statut invalide", 400);
      }

      const product = await Product.findOneAndUpdate(
        { _id: id, organization: organizationId },
        { status, updatedBy: req.user._id },
        { new: true },
      ).populate("category");

      if (!product) {
        throw new AppError("Produit introuvable", 404);
      }

      return successResponse(res, product, "Statut mis à jour avec succès");
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/products/:id/duplicate
  async duplicateProduct(req, res, next) {
    try {
      const { id } = req.params;
      const organizationId = req.user.organization;

      const original = await Product.findOne({
        _id: id,
        organization: organizationId,
      });

      if (!original) {
        throw new AppError("Produit introuvable", 404);
      }

      const duplicate = original.toObject();
      delete duplicate._id;
      delete duplicate.createdAt;
      delete duplicate.updatedAt;
      delete duplicate.sku;

      duplicate.name = `${duplicate.name} (Copie)`;
      duplicate.createdBy = req.user._id;

      const newProduct = await Product.create(duplicate);
      await newProduct.populate("category");

      return successResponse(
        res,
        newProduct,
        "Produit dupliqué avec succès",
        201,
      );
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/products/search
  async searchProducts(req, res, next) {
    try {
      const { q } = req.query;
      const organizationId = req.user.organization;

      if (!q || q.length < 2) {
        throw new AppError("Recherche trop courte (min 2 caractères)", 400);
      }

      const products = await Product.find({
        organization: organizationId,
        $or: [
          { name: { $regex: q, $options: "i" } },
          { sku: { $regex: q, $options: "i" } },
          { barcode: { $regex: q, $options: "i" } },
          { tags: { $in: [new RegExp(q, "i")] } },
        ],
      })
        .populate("category", "name")
        .populate("stock")
        .limit(10)
        .select("name sku barcode pricing image");

      return successResponse(res, products, "Résultats de recherche");
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/products/by-category/:categoryId
  async getByCategory(req, res, next) {
    try {
      const { categoryId } = req.params;
      const organizationId = req.user.organization;

      const products = await Product.find({
        organization: organizationId,
        category: categoryId,
        status: "active",
      })
        .populate("stock")
        .sort({ name: 1 });

      return successResponse(res, products, "Produits par catégorie");
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/products/low-stock
  async getLowStockProducts(req, res, next) {
    try {
      const organizationId = req.user.organization;

      const lowStocks = await Stock.find({
        organization: organizationId,
        $expr: { $lte: ["$quantity", "$minThreshold"] },
      }).populate({
        path: "product",
        populate: { path: "category supplier" },
      });

      const products = lowStocks.map((stock) => ({
        ...stock.product.toObject(),
        stockInfo: {
          quantity: stock.quantity,
          minThreshold: stock.minThreshold,
          location: stock.location,
          status: stock.stockStatus,
        },
      }));

      return successResponse(res, products, "Produits en stock bas");
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/products/bulk-import
  async bulkImport(req, res, next) {
    try {
      throw new AppError("Fonctionnalité en développement", 501);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/products/export
  async exportProducts(req, res, next) {
    try {
      throw new AppError("Fonctionnalité en développement", 501);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProductController();
