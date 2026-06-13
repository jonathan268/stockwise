import Product from "../models/Product.js";
import StockMovement from "../models/StockMovement.js";
import { AppError } from "../utils/appError.js";
import { runInTransaction } from "../utils/transactionHelper.js";
import { checkStockAlerts } from "./alert.service.js";

export const getProducts = async (organizationId, filters = {}) => {
  const { category, status, search, page = 1, limit = 20 } = filters;
  const query = { organizationId, isDeleted: false };

  if (category) query.category = category;
  if (status === "low")
    query.$expr = { $lte: ["$currentStock", "$minimumStock"] };
  if (status === "out") query.currentStock = 0;
  if (search) query.name = { $regex: search, $options: "i" };

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate("category", "name color icon")
      .populate("preferredSupplier", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(query),
  ]);

  return { products, total, page, totalPages: Math.ceil(total / limit) };
};

export const createProduct = async (organizationId, productData) => {
  if (productData.sku) {
    const existing = await Product.findOne({
      organizationId,
      sku: productData.sku,
    });
    if (existing)
      throw new AppError("SKU déjà utilisé dans votre organisation", 400);
  }

  const product = await Product.create({ organizationId, ...productData });
  return product;
};

export const updateProduct = async (organizationId, productId, updates) => {
  const product = await Product.findOneAndUpdate(
    { _id: productId, organizationId },
    updates,
    { returnDocument: "after", runValidators: true },
  );

  if (!product) throw new AppError("Produit introuvable", 404);
  return product;
};

export const deleteProduct = async (organizationId, productId) => {
  const product = await Product.findOneAndUpdate(
    { _id: productId, organizationId },
    { isDeleted: true },
    { returnDocument: "after" },
  );

  if (!product) throw new AppError("Produit introuvable", 404);
  return product;
};

export const adjustStock = async (
  organizationId,
  productId,
  adjustData,
  userId,
) => {
  return await runInTransaction(async ({ opt }) => {
    const product = await Product.findOne({
      _id: productId,
      organizationId,
      isDeleted: false,
    }, null, opt);

    if (!product) throw new AppError("Produit introuvable", 404);

    const quantityBefore = product.currentStock;
    const quantityAfter = adjustData.quantity;

    // Créer le mouvement
    await StockMovement.create(
      [
        {
          organizationId,
          product: productId,
          type: "adjustment",
          quantity: Math.abs(quantityAfter - quantityBefore),
          quantityBefore,
          quantityAfter,
          reason: adjustData.reason,
          createdBy: userId,
        },
      ],
      opt,
    );

    // Mettre à jour le produit
    await Product.findByIdAndUpdate(
      productId,
      { currentStock: quantityAfter },
      { ...opt, returnDocument: "after" },
    );

    // Vérifier les alertes (post-commit)
    setImmediate(() => checkStockAlerts(product, quantityAfter, organizationId));

    return product;
  });
};
