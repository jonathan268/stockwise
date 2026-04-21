import Alert from "../models/Alert.js";
import Product from "../models/Product.js";
import { AppError } from "../utils/appError.js";

/**
 * Récupère tous les alertes non lues de l'organisation
 * @param {String} organizationId - ID de l'organisation
 * @param {Object} filters - {type, page, limit, sortBy}
 * @returns {Object} {alerts, total, page, totalPages}
 */
export const getAlerts = async (organizationId, filters = {}) => {
  const { type, page = 1, limit = 20, isRead = false } = filters;

  const query = { organizationId };

  if (type) query.type = type;
  if (isRead !== undefined) query.isRead = isRead;

  const [alerts, total] = await Promise.all([
    Alert.find(query)
      .populate("product", "name sku currentStock minimumStock")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Alert.countDocuments(query),
  ]);

  return {
    alerts,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Récupère une alerte par ID
 * @param {String} organizationId - ID de l'organisation
 * @param {String} alertId - ID de l'alerte
 * @returns {Object} Alert détaillée
 */
export const getAlertById = async (organizationId, alertId) => {
  const alert = await Alert.findOne({
    _id: alertId,
    organizationId,
  }).populate("product", "name sku currentStock minimumStock");

  if (!alert) {
    throw new AppError("Alerte introuvable", 404, "ALERT_NOT_FOUND");
  }

  return alert;
};

/**
 * Marque une alerte comme lue
 * @param {String} organizationId - ID de l'organisation
 * @param {String} alertId - ID de l'alerte
 * @param {String} userId - ID de l'utilisateur
 * @returns {Object} Alert mise à jour
 */
export const markAlertAsRead = async (organizationId, alertId, userId) => {
  const alert = await Alert.findOneAndUpdate(
    { _id: alertId, organizationId },
    {
      isRead: true,
      acknowledgedBy: userId,
      acknowledgedAt: new Date(),
    },
    { new: true },
  ).populate("product", "name sku currentStock minimumStock");

  if (!alert) {
    throw new AppError("Alerte introuvable", 404, "ALERT_NOT_FOUND");
  }

  return alert;
};

/**
 * Marque toutes les alertes non lues comme lues
 * @param {String} organizationId - ID de l'organisation
 * @param {String} userId - ID de l'utilisateur
 * @returns {Object} {matched, modified}
 */
export const markAllAlertsAsRead = async (organizationId, userId) => {
  const result = await Alert.updateMany(
    { organizationId, isRead: false },
    {
      isRead: true,
      acknowledgedBy: userId,
      acknowledgedAt: new Date(),
    },
  );

  return {
    matched: result.matchedCount,
    modified: result.modifiedCount,
  };
};

/**
 * Supprime une alerte
 * @param {String} organizationId - ID de l'organisation
 * @param {String} alertId - ID de l'alerte
 * @returns {Object} Alert supprimée
 */
export const deleteAlert = async (organizationId, alertId) => {
  const alert = await Alert.findOneAndDelete({
    _id: alertId,
    organizationId,
  });

  if (!alert) {
    throw new AppError("Alerte introuvable", 404, "ALERT_NOT_FOUND");
  }

  return alert;
};

/**
 * Crée une alerte de stock faible pour un produit
 * @param {String} organizationId - ID de l'organisation
 * @param {String} productId - ID du produit
 * @returns {Object} Alert créée ou null si existe déjà
 */
export const createLowStockAlert = async (organizationId, productId) => {
  const product = await Product.findOne({
    _id: productId,
    organizationId,
  });

  if (!product) {
    throw new AppError("Produit introuvable", 404, "PRODUCT_NOT_FOUND");
  }

  // Vérifier si une alerte non lue existe déjà
  const existingAlert = await Alert.findOne({
    organizationId,
    product: productId,
    type: "low_stock",
    isRead: false,
  });

  if (existingAlert) {
    return null; // Alerte existe déjà
  }

  const alert = await Alert.create({
    organizationId,
    product: productId,
    type: "low_stock",
    message: `Le stock pour ${product.name} est bas (${product.currentStock} restant(s)).`,
    isRead: false,
  });

  return alert;
};

/**
 * Crée une alerte de rupture de stock
 * @param {String} organizationId - ID de l'organisation
 * @param {String} productId - ID du produit
 * @returns {Object} Alert créée ou null si existe déjà
 */
export const createOutOfStockAlert = async (organizationId, productId) => {
  const product = await Product.findOne({
    _id: productId,
    organizationId,
  });

  if (!product) {
    throw new AppError("Produit introuvable", 404, "PRODUCT_NOT_FOUND");
  }

  // Vérifier si une alerte non lue existe déjà
  const existingAlert = await Alert.findOne({
    organizationId,
    product: productId,
    type: "out_of_stock",
    isRead: false,
  });

  if (existingAlert) {
    return null; // Alerte existe déjà
  }

  const alert = await Alert.create({
    organizationId,
    product: productId,
    type: "out_of_stock",
    message: `Le produit ${product.name} est en rupture de stock.`,
    isRead: false,
  });

  return alert;
};

/**
 * Vérifie le niveau de stock d'un produit post-mouvement
 * Appelé automatiquement par movement.service.js
 */
export const checkStockAlerts = async (product, currentStock, organizationId) => {
  if (currentStock === 0) {
    await createOutOfStockAlert(organizationId, product._id);
  } else if (currentStock <= product.minimumStock) {
    await createLowStockAlert(organizationId, product._id);
  }
};

/**
 * Vérifie les niveaux de stock et crée les alertes nécessaires
 * Appelé automatiquement lors des ajustements de stock
 * @param {String} organizationId - ID de l'organisation
 * @returns {Object} {lowStockProducts, outOfStockProducts, alertsCreated}
 */
export const checkAndCreateStockAlerts = async (organizationId) => {
  const products = await Product.find({
    organizationId,
    isDeleted: false,
  });

  const lowStockProducts = [];
  const outOfStockProducts = [];
  let alertsCreated = 0;

  for (const product of products) {
    if (product.currentStock === 0) {
      // Alerte rupture de stock
      const alert = await createOutOfStockAlert(organizationId, product._id);
      if (alert) {
        outOfStockProducts.push(product);
        alertsCreated++;
      }
    } else if (product.currentStock <= product.minimumStock) {
      // Alerte stock faible
      const alert = await createLowStockAlert(organizationId, product._id);
      if (alert) {
        lowStockProducts.push(product);
        alertsCreated++;
      }
    }
  }

  return {
    lowStockProducts,
    outOfStockProducts,
    alertsCreated,
  };
};

/**
 * Résout les alertes pour les produits dont le stock a été restitué
 * @param {String} organizationId - ID de l'organisation
 * @returns {Object} {resolvedCount}
 */
export const resolveStockAlerts = async (organizationId) => {
  // Récupérer tous les produits en rupture de stock
  const alerts = await Alert.find({
    organizationId,
    type: { $in: ["low_stock", "out_of_stock"] },
    isRead: false,
  }).populate("product");

  let resolvedCount = 0;

  for (const alert of alerts) {
    const product = alert.product;

    // Si le produit a maintenant du stock, marquer l'alerte comme lue
    if (
      (alert.type === "out_of_stock" && product.currentStock > 0) ||
      (alert.type === "low_stock" &&
        product.currentStock > product.minimumStock)
    ) {
      alert.isRead = true;
      alert.acknowledgedAt = new Date();
      await alert.save();
      resolvedCount++;
    }
  }

  return { resolvedCount };
};

/**
 * Récupère le nombre d'alertes non lues
 * @param {String} organizationId - ID de l'organisation
 * @returns {Number} Nombre d'alertes non lues
 */
export const getUnreadAlertCount = async (organizationId) => {
  const count = await Alert.countDocuments({
    organizationId,
    isRead: false,
  });

  return count;
};

/**
 * Récupère les statistiques des alertes
 * @param {String} organizationId - ID de l'organisation
 * @returns {Object} Statistiques des alertes
 */
export const getAlertStats = async (organizationId) => {
  const stats = {
    total: await Alert.countDocuments({ organizationId }),
    unread: await Alert.countDocuments({ organizationId, isRead: false }),
    lowStock: await Alert.countDocuments({
      organizationId,
      type: "low_stock",
      isRead: false,
    }),
    outOfStock: await Alert.countDocuments({
      organizationId,
      type: "out_of_stock",
      isRead: false,
    }),
  };

  return stats;
};
