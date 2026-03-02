const Product = require("../models/Product");
const Order = require("../models/Orders");
const Stock = require("../models/Stock");
const { AppError } = require("../utils/appError");
const { successResponse } = require("../utils/apiResponse");
const { catchAsync } = require("../middlewares/errorHandler");

class DashboardController {
  /**
   * Récupérer le résumé complet du dashboard
   * GET /api/v1/dashboard/summary
   */
  getDashboardSummary = catchAsync(async (req, res, next) => {
    const organizationId = req.user.organization;
    const mongoose = require("mongoose");

    // Stats produits
    const totalProducts = await Product.countDocuments({
      organization: organizationId,
    });

    // Valeur totale du stock - calcul direct depuis la collection Stock
    let stockValue = 0;
    try {
      console.log(
        `DEBUG Dashboard - organizationId: ${organizationId}, type: ${typeof organizationId}`
      );

      // Vérifier d'abord combien de stocks existent
      const stockCount = await Stock.countDocuments({
        organization: organizationId,
      });
      console.log(`DEBUG Dashboard - Found ${stockCount} stock records`);

      // Récupérer tous les stocks avec les données de produit
      const stocks = await Stock.find({
        organization: organizationId,
      })
        .populate("product", "pricing")
        .lean();

      console.log(
        `DEBUG Dashboard - After .find(), got ${stocks.length} stocks:`,
        JSON.stringify(stocks.slice(0, 2), null, 2)
      );

      stockValue = stocks.reduce((sum, stock) => {
        const quantity = stock.quantity || 0;
        const cost = stock.product?.pricing?.cost || 0;
        const value = quantity * cost;
        console.log(
          `DEBUG Dashboard - Stock calculation: qty=${quantity}, cost=${cost}, result=${value}`
        );
        return sum + value;
      }, 0);

      console.log(`DEBUG Dashboard - Final stockValue calculated: ${stockValue}`);
    } catch (error) {
      console.error("Error calculating stock value:", error);
      stockValue = 0;
    }

    // Alertes stock bas
    const lowStockAlerts = await Product.countDocuments({
      organization: organizationId,
      $expr: {
        $and: [
          { $gt: ["$stock.quantity", 0] },
          { $lte: ["$stock.quantity", "$stock.minThreshold"] },
        ],
      },
    });

    // Commandes en attente
    const pendingOrders = await Order.countDocuments({
      organization: organizationId,
      status: { $in: ["pending", "confirmed"] },
    });

    // Calculer les tendances (comparaison avec le mois dernier)
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const lastMonthProducts = await Product.countDocuments({
      organization: organizationId,
      createdAt: { $lt: oneMonthAgo },
    });

    const productsTrend =
      lastMonthProducts > 0
        ? `${(((totalProducts - lastMonthProducts) / lastMonthProducts) * 100).toFixed(0)}%`
        : "+0%";

    const trends = {
      products: productsTrend.startsWith("-")
        ? productsTrend
        : `+${productsTrend}`,
      value: "+0%", // À calculer selon vos besoins
      alerts: "+0%",
      orders: "+0%",
    };

    return successResponse(
      res,
      {
        totalProducts,
        stockValue,
        lowStockAlerts,
        pendingOrders,
        trends,
      },
      "Résumé du dashboard récupéré",
    );
  });

  /**
   * Récupérer les alertes de stock
   * GET /api/v1/dashboard/alerts
   */
  getStockAlerts = catchAsync(async (req, res, next) => {
    const organizationId = req.user.organization;
    const { limit = 10 } = req.query;

    const alerts = await Product.find({
      organization: organizationId,
      $expr: {
        $lte: ["$stock.quantity", "$stock.minThreshold"],
      },
    })
      .limit(parseInt(limit))
      .sort({ "stock.quantity": 1 })
      .select("name sku stock")
      .lean();

    // Formater les alertes
    const formattedAlerts = alerts.map((product) => ({
      _id: product._id,
      product: {
        _id: product._id,
        name: product.name,
        sku: product.sku,
      },
      quantity: product.stock?.quantity || 0,
      threshold: product.stock?.minThreshold || 0,
      status:
        product.stock?.quantity === 0
          ? "critical"
          : product.stock?.quantity <= (product.stock?.minThreshold || 0) / 2
            ? "critical"
            : "warning",
    }));

    return successResponse(res, formattedAlerts, "Alertes récupérées");
  });

  /**
   * Récupérer les activités récentes
   * GET /api/v1/dashboard/activity
   */
  getRecentActivity = catchAsync(async (req, res, next) => {
    const organizationId = req.user.organization;
    const { limit = 10 } = req.query;

    // Récupérer les mouvements de stock récents
    const stockMovements = await Stock.find({
      organization: organizationId,
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate("product", "name sku")
      .lean();

    // Formater les activités
    const activities = stockMovements.map((movement) => ({
      _id: movement._id,
      action:
        movement.type === "in"
          ? "Entrée stock"
          : movement.type === "out"
            ? "Sortie stock"
            : movement.type === "adjustment"
              ? "Ajustement"
              : "Mouvement",
      product: {
        _id: movement.product?._id,
        name: movement.product?.name || "Produit",
      },
      quantity: Math.abs(movement.quantity),
      type: movement.type,
      time: this.getTimeAgo(movement.createdAt),
      createdAt: movement.createdAt,
    }));

    return successResponse(res, activities, "Activités récupérées");
  });

  /**
   * Récupérer les produits les plus actifs
   * GET /api/v1/dashboard/top-products
   */
  getTopProducts = catchAsync(async (req, res, next) => {
    const organizationId = req.user.organization;
    const { limit = 5 } = req.query;

    // Récupérer les produits avec le plus de mouvements
    const products = await Product.find({
      organization: organizationId,
    })
      .sort({ "stock.quantity": -1 })
      .limit(parseInt(limit))
      .select("name stock pricing")
      .lean();

    // Calculer les statistiques pour chaque produit
    const topProducts = await Promise.all(
      products.map(async (product) => {
        const movements = await Stock.countDocuments({
          product: product._id,
          organization: organizationId,
        });

        const quantity = product.stock?.quantity || 0;
        const price = product.pricing?.sellingPrice || 0;
        const value = quantity * price;

        return {
          _id: product._id,
          name: product.name,
          stock: quantity,
          value: value,
          movement: Math.min((movements / 10) * 100, 100), // Pourcentage basé sur les mouvements
        };
      }),
    );

    // Trier par mouvement
    topProducts.sort((a, b) => b.movement - a.movement);

    return successResponse(res, topProducts, "Top produits récupérés");
  });

  /**
   * Récupérer les insights IA
   * GET /api/v1/dashboard/ai-insights
   */
  getAIInsights = catchAsync(async (req, res, next) => {
    const organizationId = req.user.organization;

    const insights = [];

    // Insight 1: Stock bas
    const lowStockCount = await Product.countDocuments({
      organization: organizationId,
      $expr: {
        $and: [
          { $gt: ["$stock.quantity", 0] },
          { $lte: ["$stock.quantity", "$stock.minThreshold"] },
        ],
      },
    });

    if (lowStockCount > 0) {
      insights.push({
        type: "warning",
        message: `⚠️ ${lowStockCount} produit(s) nécessitent un réapprovisionnement`,
        action: "Voir les alertes",
      });
    }

    // Insight 2: Produits en rupture
    const outOfStockCount = await Product.countDocuments({
      organization: organizationId,
      "stock.quantity": 0,
    });

    if (outOfStockCount > 0) {
      insights.push({
        type: "critical",
        message: `🚫 ${outOfStockCount} produit(s) en rupture de stock`,
        action: "Commander maintenant",
      });
    }

    // Insight 3: Opportunité
    const totalProducts = await Product.countDocuments({
      organization: organizationId,
    });

    if (totalProducts > 50) {
      insights.push({
        type: "opportunity",
        message:
          "📊 Votre inventaire grandit ! Pensez aux prédictions IA pour optimiser",
        action: "Activer l'IA",
      });
    }

    return successResponse(res, insights, "Insights récupérés");
  });

  /**
   * Récupérer les statistiques globales
   * GET /api/v1/dashboard/stats
   */
  getStats = catchAsync(async (req, res, next) => {
    const organizationId = req.user.organization;

    const [totalProducts, totalOrders, pendingOrders, completedOrders] =
      await Promise.all([
        Product.countDocuments({ organization: organizationId }),
        Order.countDocuments({ organization: organizationId }),
        Order.countDocuments({
          organization: organizationId,
          status: "pending",
        }),
        Order.countDocuments({
          organization: organizationId,
          status: "completed",
        }),
      ]);

    return successResponse(
      res,
      {
        totalProducts,
        totalOrders,
        pendingOrders,
        completedOrders,
      },
      "Statistiques récupérées",
    );
  });

  /**
   * Helper: Calculer le temps écoulé
   */
  getTimeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return `Il y a ${Math.floor(interval)} an(s)`;

    interval = seconds / 2592000;
    if (interval > 1) return `Il y a ${Math.floor(interval)} mois`;

    interval = seconds / 86400;
    if (interval > 1) return `Il y a ${Math.floor(interval)} jour(s)`;

    interval = seconds / 3600;
    if (interval > 1) return `Il y a ${Math.floor(interval)} heure(s)`;

    interval = seconds / 60;
    if (interval > 1) return `Il y a ${Math.floor(interval)} minute(s)`;

    return `Il y a ${Math.floor(seconds)} seconde(s)`;
  }
}

module.exports = new DashboardController();
