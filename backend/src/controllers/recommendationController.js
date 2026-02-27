const Product = require("../models/Product");
const Order = require("../models/Orders");
const { AppError } = require("../utils/appError");
const { successResponse } = require("../utils/apiResponse");
const { catchAsync } = require("../middlewares/errorHandler");

class RecommendationController {
  /**
   * GET /api/v1/recommendations/reorder
   * Recommandations de réapprovisionnement
   */
  getReorderRecommendations = catchAsync(async (req, res, next) => {
    const organizationId = req.user.organization;

    // Produits qui atteignent le seuil de réapprovisionnement
    const lowStockProducts = await Product.find({
      organization: organizationId,
      status: "active",
      $expr: {
        $lte: ["$stock.quantity", "$stock.reorderPoint"],
      },
    })
      .select("name sku stock pricing supplier")
      .populate("supplier", "name email phone")
      .sort({ "stock.quantity": 1 })
      .limit(20);

    return successResponse(
      res,
      lowStockProducts,
      "Recommandations de réapprovisionnement",
    );
  });

  /**
   * GET /api/v1/recommendations/discontinue
   * Produits recommandés pour discontinuation
   */
  getDiscontinueRecommendations = catchAsync(async (req, res, next) => {
    const organizationId = req.user.organization;
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Produits sans vente pendant 6 mois
    const inactiveProducts = await Product.aggregate([
      {
        $match: {
          organization: organizationId,
          status: "active",
        },
      },
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "items.product",
          as: "orders",
        },
      },
      {
        $addFields: {
          lastOrder: {
            $max: "$orders.orderDate",
          },
        },
      },
      {
        $match: {
          $or: [{ lastOrder: { $lt: sixMonthsAgo } }, { lastOrder: null }],
        },
      },
      {
        $project: {
          name: 1,
          sku: 1,
          "stock.quantity": 1,
          lastOrder: 1,
        },
      },
      { $limit: 20 },
    ]);

    return successResponse(
      res,
      inactiveProducts,
      "Produits recommandés pour discontinuation",
    );
  });

  /**
   * GET /api/v1/recommendations/cross-sell
   * Recommandations de vente croisée
   */
  getCrossSellRecommendations = catchAsync(async (req, res, next) => {
    const organizationId = req.user.organization;
    const { productId } = req.query;

    if (!productId) {
      throw new AppError("Product ID requis", 400);
    }

    // Produits fréquemment achetés ensemble
    const crossSellProducts = await Order.aggregate([
      {
        $match: {
          organization: organizationId,
        },
      },
      {
        $unwind: "$items",
      },
      {
        $match: {
          "items.product": new require("mongoose").Types.ObjectId(productId),
        },
      },
      {
        $group: {
          _id: "$_id",
          products: { $push: "$items.product" },
        },
      },
      {
        $unwind: "$products",
      },
      {
        $match: {
          products: { $ne: new require("mongoose").Types.ObjectId(productId) },
        },
      },
      {
        $group: {
          _id: "$products",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 5,
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: "$product",
      },
      {
        $project: {
          _id: "$product._id",
          name: "$product.name",
          sku: "$product.sku",
          frequency: "$count",
        },
      },
    ]);

    return successResponse(
      res,
      crossSellProducts,
      "Recommandations de vente croisée",
    );
  });

  /**
   * GET /api/v1/recommendations/bundle
   * Recommandations de bundle/combo
   */
  getBundleRecommendations = catchAsync(async (req, res, next) => {
    const organizationId = req.user.organization;

    // Produits avec stock élevé = bons candidats pour bundle
    const bundleCandidates = await Product.find({
      organization: organizationId,
      status: "active",
      $expr: {
        $gte: ["$stock.quantity", "$stock.maxThreshold"],
      },
    })
      .select("name sku stock pricing")
      .sort({ "stock.quantity": -1 })
      .limit(10);

    return successResponse(
      res,
      bundleCandidates,
      "Candidats pour bundle/combo",
    );
  });
}

module.exports = new RecommendationController();
