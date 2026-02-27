const Stock = require("../models/Stock");
const Product = require("../models/Product");
const Transaction = require("../models/Transaction");
const { AppError } = require("../utils/appError");
const { successResponse } = require("../utils/apiResponse");

class StockController {
  // GET /api/v1/stock
  async getAllStock(req, res, next) {
    try {
      const organizationId = req.user.organization;
      const {
        page = 1,
        limit = 20,
        location,
        status, // ok, low, out_of_stock, overstock
        search,
      } = req.query;

      const query = { organization: organizationId };

      if (location) {
        query["location.name"] = location;
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      let stocks = await Stock.find(query)
        .populate({
          path: "product",
          populate: { path: "category supplier" },
        })
        .populate("updatedBy", "firstName lastName")
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ lastMovement: -1 });

      // Filtrer par statut si demandé
      if (status) {
        stocks = stocks.filter((stock) => stock.stockStatus === status);
      }

      // Recherche par nom produit
      if (search) {
        stocks = stocks.filter(
          (stock) =>
            stock.product.name.toLowerCase().includes(search.toLowerCase()) ||
            stock.product.sku.toLowerCase().includes(search.toLowerCase()),
        );
      }

      const total = await Stock.countDocuments(query);

      return successResponse(
        res,
        {
          stocks,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / parseInt(limit)),
          },
        },
        "Stocks récupérés avec succès",
      );
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/stock/overview
  async getStockOverview(req, res, next) {
    try {
      const organizationId = req.user.organization;

      const [
        totalValue,
        totalProducts,
        lowStockCount,
        outOfStockCount,
        overstockCount,
      ] = await Promise.all([
        Stock.getTotalValue(organizationId),
        Stock.countDocuments({ organization: organizationId }),
        Stock.countDocuments({
          organization: organizationId,
          $expr: { $lte: ["$quantity", "$minThreshold"] },
          quantity: { $gt: 0 },
        }),
        Stock.countDocuments({
          organization: organizationId,
          quantity: 0,
        }),
        Stock.countDocuments({
          organization: organizationId,
          $expr: { $gte: ["$quantity", "$maxThreshold"] },
        }),
      ]);

      // Alertes non lues
      const stocksWithAlerts = await Stock.find({
        organization: organizationId,
        "alerts.isRead": false,
      });

      const unreadAlerts = stocksWithAlerts.reduce(
        (count, stock) => count + stock.alerts.filter((a) => !a.isRead).length,
        0,
      );

      const overview = {
        totalValue,
        totalProducts,
        lowStockCount,
        outOfStockCount,
        overstockCount,
        unreadAlerts,
        healthStatus: {
          ok: totalProducts - lowStockCount - outOfStockCount - overstockCount,
          low: lowStockCount,
          outOfStock: outOfStockCount,
          overstock: overstockCount,
        },
      };

      return successResponse(res, overview, "Aperçu du stock");
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/stock/:productId
  async getProductStock(req, res, next) {
    try {
      const { productId } = req.params;
      const organizationId = req.user.organization;
      const { location } = req.query;

      const query = {
        organization: organizationId,
        product: productId,
      };

      if (location) {
        query["location.name"] = location;
      }

      const stocks = await Stock.find(query)
        .populate("product")
        .populate("updatedBy", "firstName lastName");

      if (stocks.length === 0) {
        throw new AppError("Stock introuvable pour ce produit", 404);
      }

      // Si une seule localisation, retourner objet unique
      const result = stocks.length === 1 ? stocks[0] : stocks;

      return successResponse(res, result, "Stock du produit récupéré");
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/v1/stock/:productId
  async updateStock(req, res, next) {
    try {
      const { productId } = req.params;
      const organizationId = req.user.organization;
      const userId = req.user._id;
      const { location = "Principal", ...updates } = req.body;

      const stock = await Stock.findOne({
        organization: organizationId,
        product: productId,
        "location.name": location,
      });

      if (!stock) {
        throw new AppError("Stock introuvable", 404);
      }

      // Empêcher modification directe de quantity (utiliser adjust)
      if (updates.quantity !== undefined) {
        throw new AppError(
          "Utilisez l'endpoint /stock/adjust pour modifier la quantité",
          400,
        );
      }

      Object.assign(stock, updates);
      stock.updatedBy = userId;
      await stock.save();

      return successResponse(res, stock, "Stock mis à jour avec succès");
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/stock/adjust
  async adjustStock(req, res, next) {
    try {
      const {
        productId,
        location = "Principal",
        quantity,
        type,
        reference,
        notes,
      } = req.body;

      const organizationId = req.user.organization;
      const userId = req.user._id;

      // Validation
      if (!productId || quantity === undefined || !type) {
        throw new AppError("productId, quantity et type sont requis", 400);
      }

      if (
        !["purchase", "sale", "adjustment", "return", "loss"].includes(type)
      ) {
        throw new AppError("Type invalide", 400);
      }

      // Récupérer stock
      const stock = await Stock.findOne({
        organization: organizationId,
        product: productId,
        "location.name": location,
      });

      if (!stock) {
        throw new AppError("Stock introuvable", 404);
      }

      // Récupérer produit pour valeur
      const product = await Product.findById(productId);

      // Calculer nouvelle quantité
      let newQuantity = stock.quantity;

      if (["purchase", "return"].includes(type)) {
        newQuantity += Math.abs(quantity);
      } else if (["sale", "loss", "adjustment"].includes(type)) {
        newQuantity -= Math.abs(quantity);
      }

      if (newQuantity < 0) {
        throw new AppError("Quantité insuffisante en stock", 400);
      }

      // Mettre à jour stock
      stock.quantity = newQuantity;
      stock.updatedBy = userId;

      // Ajouter à l'historique
      const value = Math.abs(quantity) * product.pricing.cost;
      stock.addTransaction(type, quantity, value, reference, notes);

      await stock.save();

      // Créer transaction dans historique global
      await Transaction.create({
        organization: organizationId,
        product: productId,
        type,
        quantity: Math.abs(quantity),
        unitPrice: product.pricing.cost,
        totalAmount: value,
        reference,
        notes,
        performedBy: userId,
      });

      await stock.populate("product");

      return successResponse(res, stock, "Stock ajusté avec succès");
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/stock/transfer
  async transferStock(req, res, next) {
    try {
      const {
        productId,
        fromLocation,
        toLocation,
        quantity,
        reference,
        notes,
      } = req.body;

      const organizationId = req.user.organization;
      const userId = req.user._id;

      // Validation
      if (!productId || !fromLocation || !toLocation || !quantity) {
        throw new AppError("Tous les champs sont requis", 400);
      }

      if (fromLocation === toLocation) {
        throw new AppError("Les localisations doivent être différentes", 400);
      }

      if (quantity <= 0) {
        throw new AppError("La quantité doit être positive", 400);
      }

      // Récupérer stocks source et destination
      const [fromStock, toStock] = await Promise.all([
        Stock.findOne({
          organization: organizationId,
          product: productId,
          "location.name": fromLocation,
        }),
        Stock.findOne({
          organization: organizationId,
          product: productId,
          "location.name": toLocation,
        }),
      ]);

      if (!fromStock) {
        throw new AppError(`Stock introuvable à ${fromLocation}`, 404);
      }

      if (fromStock.availableQuantity < quantity) {
        throw new AppError("Quantité insuffisante en stock source", 400);
      }

      // Si destination n'existe pas, la créer
      let destinationStock = toStock;
      if (!destinationStock) {
        destinationStock = await Stock.create({
          organization: organizationId,
          product: productId,
          quantity: 0,
          location: { name: toLocation, type: "warehouse" },
        });
      }

      // Effectuer le transfert
      fromStock.quantity -= quantity;
      fromStock.updatedBy = userId;
      fromStock.addTransaction("transfer_out", -quantity, 0, reference, notes);

      destinationStock.quantity += quantity;
      destinationStock.updatedBy = userId;
      destinationStock.addTransaction(
        "transfer_in",
        quantity,
        0,
        reference,
        notes,
      );

      await Promise.all([fromStock.save(), destinationStock.save()]);

      // Transaction historique
      const product = await Product.findById(productId);
      await Transaction.create({
        organization: organizationId,
        product: productId,
        type: "transfer",
        quantity,
        unitPrice: product.pricing.cost,
        totalAmount: quantity * product.pricing.cost,
        fromLocation,
        toLocation,
        reference,
        notes,
        performedBy: userId,
      });

      return successResponse(
        res,
        {
          from: fromStock,
          to: destinationStock,
        },
        "Transfert effectué avec succès",
      );
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/stock/movements
  async getStockMovements(req, res, next) {
    try {
      const organizationId = req.user.organization;
      const { productId, startDate, endDate, type, limit = 50 } = req.query;

      const query = { organization: organizationId };

      if (productId) query.product = productId;
      if (type) query.type = type;

      if (startDate || endDate) {
        query.transactionDate = {};
        if (startDate) query.transactionDate.$gte = new Date(startDate);
        if (endDate) query.transactionDate.$lte = new Date(endDate);
      }

      const movements = await Transaction.find(query)
        .populate("product", "name sku")
        .populate("performedBy", "firstName lastName")
        .sort({ transactionDate: -1 })
        .limit(parseInt(limit));

      return successResponse(res, movements, "Mouvements de stock récupérés");
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/stock/:productId/movements
  async getProductMovements(req, res, next) {
    try {
      const { productId } = req.params;
      const organizationId = req.user.organization;
      const { limit = 20 } = req.query;

      const stock = await Stock.findOne({
        organization: organizationId,
        product: productId,
      });

      if (!stock) {
        throw new AppError("Stock introuvable", 404);
      }

      // Retourner historique du stock
      const history = stock.salesHistory
        .sort((a, b) => b.date - a.date)
        .slice(0, parseInt(limit));

      return successResponse(res, history, "Historique des mouvements");
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/stock/locations
  async getLocations(req, res, next) {
    try {
      const organizationId = req.user.organization;

      const locations = await Stock.distinct("location.name", {
        organization: organizationId,
      });

      return successResponse(res, locations, "Localisations récupérées");
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/stock/locations
  async createLocation(req, res, next) {
    try {
      // Cette fonctionnalité pourrait être un modèle séparé Location
      // Pour l'instant, les localisations sont créées automatiquement
      throw new AppError("Fonctionnalité en développement", 501);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/stock/stock-take (Inventaire physique)
  async performStockTake(req, res, next) {
    try {
      const { productId, location = "Principal", physicalCount } = req.body;
      const organizationId = req.user.organization;
      const userId = req.user._id;

      const stock = await Stock.findOne({
        organization: organizationId,
        product: productId,
        "location.name": location,
      });

      if (!stock) {
        throw new AppError("Stock introuvable", 404);
      }

      const difference = physicalCount - stock.quantity;

      // Ajuster stock
      stock.quantity = physicalCount;
      stock.lastStockTake = new Date();
      stock.updatedBy = userId;

      // Enregistrer comme ajustement
      const product = await Product.findById(productId);
      stock.addTransaction(
        "adjustment",
        difference,
        Math.abs(difference) * product.pricing.cost,
        "STOCK_TAKE",
        `Inventaire physique: ${difference > 0 ? "+" : ""}${difference}`,
      );

      await stock.save();

      return successResponse(
        res,
        {
          stock,
          difference,
          previousCount: stock.quantity - difference,
          newCount: physicalCount,
        },
        "Inventaire physique enregistré",
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new StockController();
