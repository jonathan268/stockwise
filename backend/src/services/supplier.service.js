import mongoose from "mongoose";
import Supplier from "../models/Supplier.js";
import Product from "../models/Product.js";
import StockMovement from "../models/StockMovement.js";
import { AppError } from "../utils/appError.js";

export const getSuppliers = async (organizationId, filters = {}) => {
  const { search, active, page = 1, limit = 20 } = filters;
  const query = { organizationId };

  if (active !== undefined) query.isActive = active === "true";
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { contactName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const [suppliers, total, enrichment] = await Promise.all([
    Supplier.find(query)
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean(),
    Supplier.countDocuments(query),
    Promise.all([
      Product.aggregate([
        { $match: { organizationId: new mongoose.Types.ObjectId(organizationId), isDeleted: false, preferredSupplier: { $ne: null } } },
        { $group: { _id: "$preferredSupplier", count: { $sum: 1 } } },
      ]),
      StockMovement.aggregate([
        { $match: { organizationId: new mongoose.Types.ObjectId(organizationId), supplier: { $ne: null } } },
        { $group: { _id: "$supplier", count: { $sum: 1 } } },
      ]),
    ]),
  ]);

  const [productCounts, movementCounts] = enrichment;
  const productMap = Object.fromEntries(productCounts.map((p) => [p._id.toString(), p.count]));
  const movementMap = Object.fromEntries(movementCounts.map((m) => [m._id.toString(), m.count]));

  const enriched = suppliers.map((s) => ({
    ...s,
    productCount: productMap[s._id.toString()] || 0,
    movementCount: movementMap[s._id.toString()] || 0,
  }));

  return {
    suppliers: enriched,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)),
  };
};

export const getSupplier = async (organizationId, supplierId) => {
  const supplier = await Supplier.findOne({ _id: supplierId, organizationId });
  if (!supplier) throw new AppError("Fournisseur introuvable", 404);

  const productCount = await Product.countDocuments({
    organizationId,
    preferredSupplier: supplierId,
    isDeleted: false,
  });
  const movementCount = await StockMovement.countDocuments({
    organizationId,
    supplier: supplierId,
  });
  const products = await Product.find({
    organizationId,
    preferredSupplier: supplierId,
    isDeleted: false,
  }).select("name sku currentStock sellingPrice");

  return { ...supplier.toJSON(), productCount, movementCount, products };
};

export const createSupplier = async (organizationId, data) => {
  const supplier = await Supplier.create({ organizationId, ...data });
  return supplier;
};

export const updateSupplier = async (organizationId, supplierId, updates) => {
  const supplier = await Supplier.findOneAndUpdate(
    { _id: supplierId, organizationId },
    updates,
    { returnDocument: "after", runValidators: true },
  );
  if (!supplier) throw new AppError("Fournisseur introuvable", 404);
  return supplier;
};

export const deleteSupplier = async (organizationId, supplierId) => {
  const productsCount = await Product.countDocuments({
    organizationId,
    preferredSupplier: supplierId,
    isDeleted: false,
  });
  if (productsCount > 0) {
    throw new AppError(
      `Ce fournisseur est lié à ${productsCount} produit(s). Remplacez d'abord le fournisseur sur ces produits.`,
      400,
    );
  }

  const supplier = await Supplier.findOneAndUpdate(
    { _id: supplierId, organizationId },
    { isActive: false },
    { returnDocument: "after" },
  );
  if (!supplier) throw new AppError("Fournisseur introuvable", 404);
  return supplier;
};
