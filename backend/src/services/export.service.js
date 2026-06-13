import Product from "../models/Product.js";
import Sale from "../models/Sale.js";
import StockMovement from "../models/StockMovement.js";

const escapeCSV = (val) => {
  if (val == null) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const toCSV = (headers, rows) => {
  const headerLine = headers.map((h) => escapeCSV(h)).join(",");
  const dataLines = rows.map((row) => headers.map((h) => escapeCSV(row[h] || "")).join(","));
  return [headerLine, ...dataLines].join("\n");
};

export const exportProductsCSV = async (organizationId) => {
  const products = await Product.find({ organizationId, isDeleted: false })
    .populate("category", "name")
    .lean();

  const rows = products.map((p) => ({
    name: p.name,
    sku: p.sku,
    category: p.category?.name || "",
    sellingPrice: p.sellingPrice,
    costPrice: p.costPrice,
    currentStock: p.currentStock,
    minimumStock: p.minimumStock,
    unit: p.unit,
    stockStatus: p.currentStock === 0 ? "Rupture" : p.currentStock <= p.minimumStock ? "Faible" : "OK",
    salesVelocity: p.salesVelocity,
    lastSoldAt: p.lastSoldAt ? new Date(p.lastSoldAt).toLocaleDateString("fr-FR") : "",
  }));

  return toCSV(
    ["name", "sku", "category", "sellingPrice", "costPrice", "currentStock", "minimumStock", "unit", "stockStatus", "salesVelocity", "lastSoldAt"],
    rows,
  );
};

export const exportSalesCSV = async (organizationId) => {
  const sales = await Sale.find({ organizationId })
    .populate("soldBy", "firstName lastName")
    .lean();

  const rows = sales.map((s) => ({
    saleNumber: s.saleNumber,
    date: new Date(s.createdAt).toLocaleDateString("fr-FR"),
    totalAmount: s.totalAmount,
    paymentMethod: s.paymentMethod,
    customerName: s.customerName || "",
    items: s.items.map((i) => `${i.productName} x${i.quantity}`).join("; "),
    soldBy: s.soldBy ? `${s.soldBy.firstName} ${s.soldBy.lastName}` : "",
    status: s.status,
  }));

  return toCSV(
    ["saleNumber", "date", "totalAmount", "paymentMethod", "customerName", "items", "soldBy", "status"],
    rows,
  );
};

export const exportMovementsCSV = async (organizationId) => {
  const movements = await StockMovement.find({ organizationId })
    .populate("product", "name sku")
    .populate("createdBy", "firstName lastName")
    .lean();

  const rows = movements.map((m) => ({
    date: new Date(m.createdAt).toLocaleDateString("fr-FR"),
    product: m.product?.name || "",
    sku: m.product?.sku || "",
    type: m.type === "in" ? "Entrée" : m.type === "out" ? "Sortie" : m.type === "adjustment" ? "Ajustement" : m.type === "sale" ? "Vente" : "Retour",
    quantity: m.quantity,
    quantityBefore: m.quantityBefore,
    quantityAfter: m.quantityAfter,
    reason: m.reason || "",
    createdBy: m.createdBy ? `${m.createdBy.firstName} ${m.createdBy.lastName}` : "",
  }));

  return toCSV(
    ["date", "product", "sku", "type", "quantity", "quantityBefore", "quantityAfter", "reason", "createdBy"],
    rows,
  );
};

export const getProfitabilityReport = async (organizationId) => {
  const products = await Product.find({ organizationId, isDeleted: false })
    .populate("category", "name")
    .lean();

  const report = products.map((p) => {
    const costPrice = p.costPrice || 0;
    const sellingPrice = p.sellingPrice || 0;
    const marginPerUnit = sellingPrice - costPrice;
    const marginPercent = sellingPrice > 0 ? ((marginPerUnit / sellingPrice) * 100).toFixed(1) : 0;
    const stockValue = p.currentStock * costPrice;

    return {
      _id: p._id,
      name: p.name,
      sku: p.sku,
      category: p.category?.name || "",
      sellingPrice,
      costPrice,
      marginPerUnit,
      marginPercent: Number(marginPercent),
      currentStock: p.currentStock,
      stockValue,
      salesVelocity: p.salesVelocity,
    };
  });

  const totals = {
    totalStockValue: report.reduce((s, r) => s + r.stockValue, 0),
    totalRevenue: report.reduce((s, r) => s + r.sellingPrice * r.currentStock, 0),
    avgMargin: report.length > 0 ? report.reduce((s, r) => s + r.marginPercent, 0) / report.length : 0,
    lowMarginCount: report.filter((r) => r.marginPercent < 15).length,
  };

  return { products: report, totals };
};

export const getDeadStockReport = async (organizationId) => {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const products = await Product.find({
    organizationId,
    isDeleted: false,
    currentStock: { $gt: 0 },
    $or: [
      { lastSoldAt: { $lt: ninetyDaysAgo } },
      { lastSoldAt: { $exists: false } },
      { salesVelocity: 0 },
    ],
  })
    .populate("category", "name")
    .lean();

  return products.map((p) => ({
    _id: p._id,
    name: p.name,
    sku: p.sku,
    category: p.category?.name || "",
    currentStock: p.currentStock,
    costPrice: p.costPrice || 0,
    stockValue: p.currentStock * (p.costPrice || 0),
    sellingPrice: p.sellingPrice,
    lastSoldAt: p.lastSoldAt ? new Date(p.lastSoldAt).toLocaleDateString("fr-FR") : "Jamais",
    daysSinceLastSale: p.lastSoldAt ? Math.floor((Date.now() - p.lastSoldAt.getTime()) / (24 * 60 * 60 * 1000)) : "N/A",
  }));
};
