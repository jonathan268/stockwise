import Sale from "../models/Sale.js";
import Product from "../models/Product.js";
import StockMovement from "../models/StockMovement.js";
import Alert from "../models/Alert.js";
import { AppError } from "../utils/appError.js";
import mongoose from "mongoose";
import { runInTransaction } from "../utils/transactionHelper.js";
import { checkStockAlerts } from "./alert.service.js";

/**
 * Crée une vente avec déduction automatique du stock
 * Utilise une transaction pour garantir l'atomicité
 * @param {String} organizationId - ID de l'organisation
 * @param {Array} items - Tableau des articles [{productId, quantity, unitPrice}]
 * @param {String} paymentMethod - cash, card, mobile_money, credit
 * @param {String} userId - ID de l'utilisateur qui effectue la vente
 * @param {String} customerName - Nom du client (optionnel)
 * @param {String} note - Note de vente (optionnel)
 * @returns {Object} Sale créée avec les numéros de mouvements de stock
 */
export const createSale = async (
  organizationId,
  items,
  paymentMethod,
  userId,
  customerName = null,
  note = null,
) => {
  // Validation des paramètres
  if (!items || items.length === 0) {
    throw new AppError("La vente doit contenir au moins un article", 400);
  }

  if (!paymentMethod) {
    throw new AppError("Méthode de paiement requise", 400);
  }

  return await runInTransaction(async ({ opt }) => {
    // 1. Vérifier la disponibilité du stock pour tous les articles
    const products = await Product.find({
      _id: { $in: items.map((i) => i.productId) },
      organizationId,
      isDeleted: false,
    }, null, opt);

    const saleItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = products.find(
        (p) => p._id.toString() === item.productId.toString(),
      );

      if (!product) {
        throw new AppError(
          `Produit ${item.productId} introuvable ou supprimé`,
          400,
          "PRODUCT_NOT_FOUND",
        );
      }

      if (product.currentStock < item.quantity) {
        throw new AppError(
          `Stock insuffisant pour ${product.name}. Disponible: ${product.currentStock}, Demandé: ${item.quantity}`,
          400,
          "INSUFFICIENT_STOCK",
        );
      }

      const itemTotal = item.quantity * item.unitPrice;
      totalAmount += itemTotal;

      saleItems.push({
        product: product._id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: itemTotal,
        vatRate: product.vatRate || 0,
      });
    }

    // 2. Créer la vente
    const sale = await Sale.create(
      [
        {
          organizationId,
          items: saleItems,
          totalAmount,
          paymentMethod,
          customerName,
          note,
          soldBy: userId,
          status: "completed",
        },
      ],
      opt,
    );

    const createdSale = sale[0];

    // 3. Déduire le stock et créer les mouvements de stock
    for (const item of items) {
      const product = products.find(
        (p) => p._id.toString() === item.productId.toString(),
      );

      const quantityBefore = product.currentStock;
      const quantityAfter = quantityBefore - item.quantity;

      // Mise à jour du stock produit
      await Product.findByIdAndUpdate(
        product._id,
        { currentStock: quantityAfter },
        { ...opt, returnDocument: "after" },
      );

      await StockMovement.create(
        [
          {
            organizationId,
            product: product._id,
            type: "sale",
            quantity: item.quantity,
            quantityBefore,
            quantityAfter,
            reference: createdSale._id,
            reason: `Vente ${createdSale.saleNumber} - ${product.name}`,
            createdBy: userId,
          },
        ],
        opt,
      );

      // 4. Vérifier les alertes post-commit
      setImmediate(() => checkStockAlerts(product, quantityAfter, organizationId));
    }

    return createdSale;
  });
};

/**
 * Récupère la liste des ventes avec pagination et filtres
 * @param {String} organizationId - ID de l'organisation
 * @param {Object} filters - {page, limit, startDate, endDate, paymentMethod, search}
 * @returns {Object} {sales, total, page, totalPages}
 */
export const getSales = async (organizationId, filters = {}) => {
  const {
    page = 1,
    limit = 20,
    startDate,
    endDate,
    paymentMethod,
    search,
  } = filters;

  const query = { organizationId };

  // Filtres
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  if (paymentMethod) query.paymentMethod = paymentMethod;

  if (search) {
    query.$or = [
      { saleNumber: { $regex: search, $options: "i" } },
      { customerName: { $regex: search, $options: "i" } },
      { note: { $regex: search, $options: "i" } },
    ];
  }

  const [sales, total] = await Promise.all([
    Sale.find(query)
      .populate("items.product", "name sku")
      .populate("soldBy", "firstName lastName")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Sale.countDocuments(query),
  ]);

  return {
    sales,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Récupère une vente par ID
 * @param {String} organizationId - ID de l'organisation
 * @param {String} saleId - ID de la vente
 * @returns {Object} Sale détaillée
 */
export const getSaleById = async (organizationId, saleId) => {
  const sale = await Sale.findOne({
    _id: saleId,
    organizationId,
  })
    .populate("items.product", "name sku price currentStock")
    .populate("soldBy", "firstName lastName email");

  if (!sale) {
    throw new AppError("Vente introuvable", 404, "SALE_NOT_FOUND");
  }

  return sale;
};

/**
 * Annule une vente et restitue le stock
 * @param {String} organizationId - ID de l'organisation
 * @param {String} saleId - ID de la vente
 * @param {String} userId - ID de l'utilisateur qui annule
 * @param {String} reason - Raison de l'annulation
 * @returns {Object} Sale avec status "cancelled"
 */
export const cancelSale = async (
  organizationId,
  saleId,
  userId,
  reason = null,
) => {
  return await runInTransaction(async ({ opt }) => {
    const sale = await Sale.findOne({
      _id: saleId,
      organizationId,
    }, null, opt);

    if (!sale) {
      throw new AppError("Vente introuvable", 404, "SALE_NOT_FOUND");
    }

    if (sale.status !== "completed") {
      throw new AppError(
        "Seules les ventes complétées peuvent être annulées",
        400,
        "INVALID_SALE_STATUS",
      );
    }

    // Restituer le stock pour chaque article
    for (const item of sale.items) {
      const product = await Product.findOne({
        _id: item.product,
        organizationId,
      }, null, opt);

      if (product) {
        const quantityBefore = product.currentStock;
        const quantityAfter = quantityBefore + item.quantity;

        // Mise à jour du stock
        await Product.findByIdAndUpdate(
          product._id,
          { currentStock: quantityAfter },
          { ...opt, returnDocument: "after" },
        );

        // Créer un mouvement de stock d'annulation
        await StockMovement.create(
          [
            {
              organizationId,
              product: product._id,
              type: "return",
              quantity: item.quantity,
              quantityBefore,
              quantityAfter,
              reference: saleId,
              description: `Annulation vente ${sale.saleNumber} - Raison: ${reason || "Non spécifiée"}`,
              createdBy: userId,
            },
          ],
          opt,
        );
      }
    }

    // Marquer la vente comme annulée
    const cancelledSale = await Sale.findByIdAndUpdate(
      saleId,
      { status: "cancelled" },
      { ...opt, returnDocument: "after" },
    )
      .populate("items.product", "name sku")
      .populate("soldBy", "firstName lastName");

    return {
      success: true,
      sale: cancelledSale,
      message: `Vente ${sale.saleNumber} annulée et stock restitué`,
    };
  });
};

/**
 * Récupère les statistiques de ventes
 * @param {String} organizationId - ID de l'organisation
 * @param {String} period - "day", "week", "month", "year"
 * @returns {Object} Statistiques de ventes
 */
export const getSalesStats = async (organizationId, period = "month") => {
  let dateFilter = {};
  const now = new Date();

  switch (period) {
    case "day":
      dateFilter.$gte = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );
      break;
    case "week":
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter.$gte = weekAgo;
      break;
    case "month":
      dateFilter.$gte = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "year":
      dateFilter.$gte = new Date(now.getFullYear(), 0, 1);
      break;
  }

  const query = { organizationId, createdAt: dateFilter };

  const stats = await Sale.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalSales: { $sum: 1 },
        totalAmount: { $sum: "$totalAmount" },
        averageAmount: { $avg: "$totalAmount" },
      },
    },
  ]);

  const topProducts = await Sale.aggregate([
    { $match: query },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.product",
        name: { $first: "$items.productName" },
        totalQty: { $sum: "$items.quantity" },
        totalRevenue: { $sum: "$items.totalPrice" },
      },
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: 5 },
  ]);

  const paymentBreakdown = await Sale.aggregate([
    { $match: query },
    {
      $group: {
        _id: "$paymentMethod",
        count: { $sum: 1 },
        amount: { $sum: "$totalAmount" },
      },
    },
  ]);

  return {
    stats: stats[0] || { totalSales: 0, totalAmount: 0, averageAmount: 0 },
    topProducts,
    paymentBreakdown,
  };
};
