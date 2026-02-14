const Supplier = require("../models/Suppliers");
const Product = require("../models/Product");
const Order = require("../models/Orders");
const { AppError } = require("../utils/appError");
const { successResponse, paginatedResponse } = require("../utils/apiResponse");
const { getPaginationParams } = require("../utils/helpers");

class SupplierController {
  // GET /api/v1/suppliers
  async getSuppliers(req, res, next) {
    try {
      const organizationId = req.user.organization;
      const {
        status,
        search,
        category,
        minRating,
        sortBy = "name",
        order = "asc",
      } = req.query;

      const { page, limit, skip } = getPaginationParams(req.query);

      // Construction query
      const query = { organization: organizationId };

      if (status) query.status = status;
      if (category) query.categories = category;
      if (minRating) query["rating.overall"] = { $gte: parseFloat(minRating) };

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { code: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
        ];
      }

      // Sort
      const sortOptions = {};
      sortOptions[sortBy] = order === "desc" ? -1 : 1;

      const [suppliers, total] = await Promise.all([
        Supplier.find(query)
          .populate("createdBy", "firstName lastName")
          .sort(sortOptions)
          .skip(skip)
          .limit(limit),
        Supplier.countDocuments(query),
      ]);

      return paginatedResponse(
        res,
        suppliers,
        {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
        "Fournisseurs récupérés avec succès",
      );
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/suppliers/:id
  async getSupplier(req, res, next) {
    try {
      const { id } = req.params;
      const organizationId = req.user.organization;

      const supplier = await Supplier.findOne({
        _id: id,
        organization: organizationId,
      })
        .populate("createdBy", "firstName lastName")
        .populate("updatedBy", "firstName lastName");

      if (!supplier) {
        throw new AppError("Fournisseur introuvable", 404);
      }

      return successResponse(res, supplier, "Fournisseur récupéré avec succès");
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/suppliers
  async createSupplier(req, res, next) {
    try {
      const organizationId = req.user.organization;
      const userId = req.user._id;

      const supplierData = {
        ...req.body,
        organization: organizationId,
        createdBy: userId,
      };

      const supplier = await Supplier.create(supplierData);

      return successResponse(
        res,
        supplier,
        "Fournisseur créé avec succès",
        201,
      );
    } catch (error) {
      if (error.code === 11000) {
        return next(
          new AppError("Un fournisseur avec ce code existe déjà", 400),
        );
      }
      next(error);
    }
  }

  // PUT /api/v1/suppliers/:id
  async updateSupplier(req, res, next) {
    try {
      const { id } = req.params;
      const organizationId = req.user.organization;
      const userId = req.user._id;

      const supplier = await Supplier.findOne({
        _id: id,
        organization: organizationId,
      });

      if (!supplier) {
        throw new AppError("Fournisseur introuvable", 404);
      }

      Object.assign(supplier, req.body);
      supplier.updatedBy = userId;
      await supplier.save();

      return successResponse(
        res,
        supplier,
        "Fournisseur mis à jour avec succès",
      );
    } catch (error) {
      if (error.code === 11000) {
        return next(
          new AppError("Un fournisseur avec ce code existe déjà", 400),
        );
      }
      next(error);
    }
  }

  // DELETE /api/v1/suppliers/:id
  async deleteSupplier(req, res, next) {
    try {
      const { id } = req.params;
      const organizationId = req.user.organization;

      const supplier = await Supplier.findOne({
        _id: id,
        organization: organizationId,
      });

      if (!supplier) {
        throw new AppError("Fournisseur introuvable", 404);
      }

      // Vérifier s'il y a des produits liés
      const productsCount = await Product.countDocuments({
        organization: organizationId,
        supplier: id,
      });

      if (productsCount > 0) {
        throw new AppError(
          `Impossible de supprimer ce fournisseur. ${productsCount} produit(s) y sont liés`,
          400,
        );
      }

      // Vérifier s'il y a des commandes
      const ordersCount = await Order.countDocuments({
        organization: organizationId,
        supplier: id,
        status: { $in: ["pending", "confirmed", "processing"] },
      });

      if (ordersCount > 0) {
        throw new AppError(
          `Impossible de supprimer ce fournisseur. ${ordersCount} commande(s) active(s)`,
          400,
        );
      }

      await supplier.deleteOne();

      return successResponse(res, null, "Fournisseur supprimé avec succès");
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/suppliers/:id/orders
  async getSupplierOrders(req, res, next) {
    try {
      const { id } = req.params;
      const organizationId = req.user.organization;
      const { status, limit = 20 } = req.query;

      // Vérifier fournisseur existe
      const supplier = await Supplier.findOne({
        _id: id,
        organization: organizationId,
      });

      if (!supplier) {
        throw new AppError("Fournisseur introuvable", 404);
      }

      const query = {
        organization: organizationId,
        supplier: id,
      };

      if (status) query.status = status;

      const orders = await Order.find(query)
        .populate("items.product", "name sku")
        .sort({ orderDate: -1 })
        .limit(parseInt(limit));

      return successResponse(
        res,
        orders,
        "Commandes du fournisseur récupérées",
      );
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/suppliers/:id/products
  async getSupplierProducts(req, res, next) {
    try {
      const { id } = req.params;
      const organizationId = req.user.organization;

      const supplier = await Supplier.findOne({
        _id: id,
        organization: organizationId,
      });

      if (!supplier) {
        throw new AppError("Fournisseur introuvable", 404);
      }

      const products = await Product.find({
        organization: organizationId,
        supplier: id,
        status: "active",
      })
        .populate("category", "name")
        .populate("stock")
        .sort({ name: 1 });

      return successResponse(
        res,
        products,
        "Produits du fournisseur récupérés",
      );
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/suppliers/:id/performance
  async getPerformance(req, res, next) {
    try {
      const { id } = req.params;
      const organizationId = req.user.organization;
      const { startDate, endDate } = req.query;

      const supplier = await Supplier.findOne({
        _id: id,
        organization: organizationId,
      });

      if (!supplier) {
        throw new AppError("Fournisseur introuvable", 404);
      }

      // Mettre à jour stats
      await supplier.updateStats();
      await supplier.save();

      // Récupérer commandes pour analyse
      const query = {
        organization: organizationId,
        supplier: id,
        status: { $in: ["completed", "confirmed"] },
      };

      if (startDate || endDate) {
        query.orderDate = {};
        if (startDate) query.orderDate.$gte = new Date(startDate);
        if (endDate) query.orderDate.$lte = new Date(endDate);
      }

      const orders = await Order.find(query).sort({ orderDate: -1 });

      // Calculer métriques
      const totalOrders = orders.length;
      const totalSpent = orders.reduce(
        (sum, order) => sum + order.totals.total,
        0,
      );
      const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

      // Tendance mensuelle
      const monthlyTrend = orders.reduce((acc, order) => {
        const month = new Date(order.orderDate).toISOString().slice(0, 7);
        if (!acc[month]) {
          acc[month] = { count: 0, total: 0 };
        }
        acc[month].count++;
        acc[month].total += order.totals.total;
        return acc;
      }, {});

      const performance = {
        supplier: {
          id: supplier._id,
          name: supplier.name,
          code: supplier.code,
        },
        stats: supplier.stats,
        rating: supplier.rating,
        period: {
          startDate,
          endDate,
          totalOrders,
          totalSpent,
          avgOrderValue,
        },
        monthlyTrend: Object.entries(monthlyTrend).map(([month, data]) => ({
          month,
          orders: data.count,
          amount: data.total,
        })),
      };

      return successResponse(res, performance, "Performance du fournisseur");
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/v1/suppliers/:id/rating
  async updateRating(req, res, next) {
    try {
      const { id } = req.params;
      const organizationId = req.user.organization;
      const { quality, delivery, pricing, service, notes } = req.body;

      const supplier = await Supplier.findOne({
        _id: id,
        organization: organizationId,
      });

      if (!supplier) {
        throw new AppError("Fournisseur introuvable", 404);
      }

      // Mettre à jour ratings
      if (quality !== undefined) supplier.rating.quality = quality;
      if (delivery !== undefined) supplier.rating.delivery = delivery;
      if (pricing !== undefined) supplier.rating.pricing = pricing;
      if (service !== undefined) supplier.rating.service = service;

      // Calculer overall
      supplier.calculateOverallRating();

      if (notes) {
        supplier.internalNotes =
          (supplier.internalNotes || "") +
          `\n[${new Date().toISOString()}] Évaluation: ${notes}`;
      }

      await supplier.save();

      return successResponse(
        res,
        supplier,
        "Évaluation mise à jour avec succès",
      );
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/suppliers/top
  async getTopSuppliers(req, res, next) {
    try {
      const organizationId = req.user.organization;
      const { limit = 10, sortBy = "totalSpent" } = req.query;

      let sortField = "stats.totalSpent";

      if (sortBy === "orders") sortField = "stats.totalOrders";
      if (sortBy === "rating") sortField = "rating.overall";

      const topSuppliers = await Supplier.find({
        organization: organizationId,
        status: "active",
      })
        .sort({ [sortField]: -1 })
        .limit(parseInt(limit))
        .select("name code stats rating");

      return successResponse(res, topSuppliers, "Top fournisseurs récupérés");
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/suppliers/import
  async importSuppliers(req, res, next) {
    try {
      // TODO: Implémenter import CSV/Excel
      throw new AppError("Import en développement", 501);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/suppliers/export
  async exportSuppliers(req, res, next) {
    try {
      // TODO: Implémenter export CSV
      throw new AppError("Export en développement", 501);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SupplierController();
