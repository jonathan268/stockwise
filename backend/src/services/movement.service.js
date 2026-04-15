import mongoose from "mongoose";
import Product from "../models/Product.js";
import StockMovement from "../models/StockMovement.js";
import { AppError } from "../utils/appError.js";
import { checkStockAlerts } from "./alert.service.js";
import { runInTransaction } from "../utils/transactionHelper.js";

/**
 * Crée un mouvement de stock et met à jour le produit conceptuellement de manière atomique.
 * Utilise une session Mongoose pour garantir la cohérence d'isolation par tenant.
 */
export const createMovement = async (organizationId, movementData, userId) => {
  return await runInTransaction(async ({ opt }) => {
    const { productId, type, quantity, reason, reference, saleId } = movementData;

    // 1. Récupérer le produit (avec lock de session si possible)
    const product = await Product.findOne({
      _id: productId,
      organizationId,
      isDeleted: false,
    }, null, opt);

    if (!product) throw new AppError("Produit introuvable ou vous n'avez pas cette permission", 404);

    // 2. Calculer le nouveau stock
    const quantityBefore = product.currentStock;
    let quantityAfter;

    if (type === "in" || type === "return") {
      quantityAfter = quantityBefore + quantity;
    } else if (type === "out" || type === "sale") {
      if (quantity > quantityBefore) {
        throw new AppError("Stock insuffisant pour ce mouvement de sortie", 400);
      }
      quantityAfter = quantityBefore - quantity;
    } else if (type === "adjustment") {
      quantityAfter = quantity; // Valeur absolue explicite
    }

    // 3. Créer le mouvement
    const movements = await StockMovement.create(
      [{
        organizationId,
        product: productId,
        type,
        quantity,
        quantityBefore,
        quantityAfter,
        reason,
        reference,
        createdBy: userId,
        saleId: saleId || null
      }],
      opt
    );
    const movement = movements[0];

    // 4. Mettre à jour le stock du produit
    await Product.findByIdAndUpdate(
      productId,
      { currentStock: quantityAfter },
      { ...opt, returnDocument: "after" }
    );

    // 5. Post-commit : vérifier les alertes (sans bloquer la réponse de la requête en cours)
    setImmediate(() => checkStockAlerts(product, quantityAfter, organizationId));

    return movement;
  });
};

export const getMovements = async (organizationId, filters = {}) => {
  const { productId, type, page = 1, limit = 20 } = filters;
  
  const query = { organizationId };
  if (productId) query.product = productId;
  if (type) query.type = type;

  const [movements, total] = await Promise.all([
    StockMovement.find(query)
      .populate("product", "name sku")
      .populate("createdBy", "firstName lastName")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    StockMovement.countDocuments(query),
  ]);

  return {
    movements,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit)
  };
};
