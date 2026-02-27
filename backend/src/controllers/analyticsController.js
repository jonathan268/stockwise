const Order = require("../models/Orders");
const Stock = require("../models/Stock");
const Product = require("../models/Product");
const Transaction = require("../models/Transaction");
const { AppError } = require("../utils/appError");
const { successResponse } = require("../utils/apiResponse");

class AnalyticsController {
  // GET /api/v1/analytics/dashboard
  async getDashboard(req, res, next) {
    try {
      const organizationId = req.user.organization;
      const { period = "30" } = req.query; // Jours

      const startDate = new Date(
        Date.now() - parseInt(period) * 24 * 60 * 60 * 1000,
      );

      const [salesStats, inventoryStats, topProducts, recentTransactions] =
        await Promise.all([
          this.getSalesStats(organizationId, startDate),
          this.getInventoryStats(organizationId),
          this.getTopProducts(organizationId, startDate, 5),
          Transaction.find({
            organization: organizationId,
            transactionDate: { $gte: startDate },
          })
            .populate("product", "name sku")
            .sort({ transactionDate: -1 })
            .limit(10),
        ]);

      const dashboard = {
        period: `${period} derniers jours`,
        sales: salesStats,
        inventory: inventoryStats,
        topProducts,
        recentActivity: recentTransactions,
      };

      return successResponse(res, dashboard, "Tableau de bord récupéré");
    } catch (error) {
      next(error);
    }
  }

  // Méthode helper: Stats ventes
  async getSalesStats(organizationId, startDate) {
    const orders = await Order.find({
      organization: organizationId,
      type: "sale",
      status: { $in: ["completed", "confirmed"] },
      orderDate: { $gte: startDate },
    });

    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.totals.total,
      0,
    );
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
    };
  }

  // Méthode helper: Stats inventaire
  async getInventoryStats(organizationId) {
    const [totalValue, productsCount, lowStockCount, outOfStockCount] =
      await Promise.all([
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
      ]);

    return {
      totalValue,
      productsCount,
      lowStockCount,
      outOfStockCount,
    };
  }

  // Méthode helper: Top produits
  async getTopProducts(organizationId, startDate, limit) {
    const topProducts = await Transaction.aggregate([
      {
        $match: {
          organization: organizationId,
          type: "sale",
          transactionDate: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$product",
          totalQuantity: { $sum: "$quantity" },
          totalRevenue: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
    ]);

    return topProducts;
  }

  // GET /api/v1/analytics/sales
  async getSalesAnalytics(req, res, next) {
    try {
      const organizationId = req.user.organization;
      const { startDate, endDate, groupBy = "day" } = req.query;

      const match = {
        organization: organizationId,
        type: "sale",
        status: { $in: ["completed", "confirmed"] },
      };

      if (startDate || endDate) {
        match.orderDate = {};
        if (startDate) match.orderDate.$gte = new Date(startDate);
        if (endDate) match.orderDate.$lte = new Date(endDate);
      }

      // Format de groupement selon période
      let dateFormat;
      switch (groupBy) {
        case "day":
          dateFormat = "%Y-%m-%d";
          break;
        case "week":
          dateFormat = "%Y-W%U";
          break;
        case "month":
          dateFormat = "%Y-%m";
          break;
        case "year":
          dateFormat = "%Y";
          break;
        default:
          dateFormat = "%Y-%m-%d";
      }

      const salesByPeriod = await Order.aggregate([
        { $match: match },
        {
          $group: {
            _id: {
              $dateToString: {
                format: dateFormat,
                date: "$orderDate",
              },
            },
            totalRevenue: { $sum: "$totals.total" },
            orderCount: { $sum: 1 },
            avgOrderValue: { $avg: "$totals.total" },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      return successResponse(res, salesByPeriod, "Analyses des ventes");
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/analytics/inventory
  async getInventoryAnalytics(req, res, next) {
    try {
      const organizationId = req.user.organization;

      const [valueByCategory, stockStatus, turnoverRate] = await Promise.all([
        this.getValueByCategory(organizationId),
        this.getStockStatus(organizationId),
        this.calculateTurnoverRate(organizationId),
      ]);

      const analytics = {
        valueByCategory,
        stockStatus,
        turnoverRate,
      };

      return successResponse(res, analytics, "Analyses inventaire");
    } catch (error) {
      next(error);
    }
  }

  async getValueByCategory(organizationId) {
    return Stock.aggregate([
      { $match: { organization: organizationId } },
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "productData",
        },
      },
      { $unwind: "$productData" },
      {
        $lookup: {
          from: "categories",
          localField: "productData.category",
          foreignField: "_id",
          as: "categoryData",
        },
      },
      { $unwind: "$categoryData" },
      {
        $group: {
          _id: "$categoryData.name",
          totalValue: { $sum: "$totalValue" },
          itemsCount: { $sum: 1 },
        },
      },
      { $sort: { totalValue: -1 } },
    ]);
  }

  async getStockStatus(organizationId) {
    const total = await Stock.countDocuments({ organization: organizationId });

    const [ok, low, out, overstock] = await Promise.all([
      Stock.countDocuments({
        organization: organizationId,
        $expr: {
          $and: [
            { $gt: ["$quantity", "$minThreshold"] },
            { $lt: ["$quantity", "$maxThreshold"] },
          ],
        },
      }),
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

    return {
      total,
      ok,
      low,
      outOfStock: out,
      overstock,
      okPercentage: ((ok / total) * 100).toFixed(2),
    };
  }

  async calculateTurnoverRate(organizationId) {
    // Taux de rotation = Ventes / Stock moyen
    // Simplifié pour l'exemple
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const sales = await Transaction.aggregate([
      {
        $match: {
          organization: organizationId,
          type: "sale",
          transactionDate: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: null,
          totalSold: { $sum: "$quantity" },
        },
      },
    ]);

    const avgStock = await Stock.aggregate([
      { $match: { organization: organizationId } },
      {
        $group: {
          _id: null,
          avgQuantity: { $avg: "$quantity" },
        },
      },
    ]);

    const totalSold = sales[0]?.totalSold || 0;
    const avgQty = avgStock[0]?.avgQuantity || 1;

    return {
      rate: (totalSold / avgQty).toFixed(2),
      period: "30 jours",
    };
  }

  // GET /api/v1/analytics/revenue
  async getRevenueAnalytics(req, res, next) {
    try {
      const organizationId = req.user.organization;
      const { startDate, endDate } = req.query;

      const match = {
        organization: organizationId,
        type: "sale",
        status: "completed",
      };

      if (startDate || endDate) {
        match.orderDate = {};
        if (startDate) match.orderDate.$gte = new Date(startDate);
        if (endDate) match.orderDate.$lte = new Date(endDate);
      }

      const revenue = await Order.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totals.total" },
            totalOrders: { $sum: 1 },
            avgOrderValue: { $avg: "$totals.total" },
          },
        },
      ]);

      return successResponse(res, revenue[0] || {}, "Analyses revenus");
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/analytics/top-products
  async getTopProducts(req, res, next) {
    try {
      const organizationId = req.user.organization;
      const { limit = 10, startDate, endDate, sortBy = "revenue" } = req.query;

      const match = {
        organization: organizationId,
        type: "sale",
      };

      if (startDate || endDate) {
        match.transactionDate = {};
        if (startDate) match.transactionDate.$gte = new Date(startDate);
        if (endDate) match.transactionDate.$lte = new Date(endDate);
      }

      const sortField =
        sortBy === "quantity" ? "totalQuantity" : "totalRevenue";

      const topProducts = await Transaction.aggregate([
        { $match: match },
        {
          $group: {
            _id: "$product",
            totalQuantity: { $sum: "$quantity" },
            totalRevenue: { $sum: "$totalAmount" },
            orderCount: { $sum: 1 },
          },
        },
        { $sort: { [sortField]: -1 } },
        { $limit: parseInt(limit) },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },
      ]);

      return successResponse(res, topProducts, "Top produits");
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/analytics/trends
  async getTrends(req, res, next) {
    try {
      const organizationId = req.user.organization;
      const { period = "90" } = req.query;

      const startDate = new Date(
        Date.now() - parseInt(period) * 24 * 60 * 60 * 1000,
      );

      const dailyTrends = await Order.aggregate([
        {
          $match: {
            organization: organizationId,
            type: "sale",
            status: { $in: ["completed", "confirmed"] },
            orderDate: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$orderDate",
              },
            },
            revenue: { $sum: "$totals.total" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      return successResponse(res, dailyTrends, "Tendances");
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/analytics/export
  async exportReport(req, res, next) {
    try {
      // TODO: Implémenter export PDF/Excel
      throw new AppError("Export en développement", 501);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AnalyticsController();
