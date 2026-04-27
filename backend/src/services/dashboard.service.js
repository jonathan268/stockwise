import Product from "../models/Product.js";
import Sale from "../models/Sale.js";
import Alert from "../models/Alert.js";
import mongoose from "mongoose";
import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 300, useClones: false }); // 5 minutes TTL

export const getDashboardSummary = async (organizationId) => {
  const cacheKey = `dashboard_${organizationId}`;
  const cachedData = cache.get(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }

  const orgId = new mongoose.Types.ObjectId(organizationId);
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const startOfWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [
    totalProducts,
    lowStockCount,
    outOfStockCount,
    totalStockValue,
    salesToday,
    salesThisWeek,
    salesThisMonth,
    activeAlerts,
    recentAlerts,
    recentSales
  ] = await Promise.all([
    Product.countDocuments({ organizationId: orgId, isDeleted: false }),
    Product.countDocuments({ organizationId: orgId, isDeleted: false, $expr: { $lte: ["$currentStock", "$minimumStock"] }, currentStock: { $gt: 0 } }),
    Product.countDocuments({ organizationId: orgId, isDeleted: false, currentStock: 0 }),
    Product.aggregate([
      { $match: { organizationId: orgId, isDeleted: false } },
      { $group: { _id: null, totalValue: { $sum: { $multiply: ["$currentStock", "$sellingPrice"] } } } }
    ]),
    Sale.aggregate([
      { $match: { organizationId: orgId, createdAt: { $gte: startOfDay }, status: "completed" } },
      { $group: { _id: null, revenue: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
    ]),
    Sale.aggregate([
      { $match: { organizationId: orgId, createdAt: { $gte: startOfWeek }, status: "completed" } },
      { $group: { _id: null, revenue: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
    ]),
    Sale.aggregate([
      { $match: { organizationId: orgId, createdAt: { $gte: startOfMonth }, status: "completed" } },
      { $group: { _id: null, revenue: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
    ]),
    Alert.countDocuments({ organizationId: orgId, isRead: false }),
    Alert.find({ organizationId: orgId, isRead: false }).populate("product", "name currentStock minimumStock").sort({ createdAt: -1 }).limit(5).lean(),
    Sale.find({ organizationId: orgId }).populate("items.product", "name").populate("soldBy", "firstName lastName").sort({ createdAt: -1 }).limit(5).lean()
  ]);

  const result = {
    totalProducts,
    lowStockCount,
    outOfStockCount,
    totalStockValue: totalStockValue[0]?.totalValue || 0,
    dailySalesAmount: salesToday[0]?.revenue || 0,
    dailySalesCount: salesToday[0]?.count || 0,
    weeklySalesAmount: salesThisWeek[0]?.revenue || 0,
    weeklySalesCount: salesThisWeek[0]?.count || 0,
    monthlySalesAmount: salesThisMonth[0]?.revenue || 0,
    monthlySalesCount: salesThisMonth[0]?.count || 0,
    activeAlerts,
    recentAlerts,
    recentSales: { data: recentSales }
  };

  cache.set(cacheKey, result);
  return result;
};

// Export to clear cache when a product, sale, or alert is modified
export const clearDashboardCache = (organizationId) => {
  cache.del(`dashboard_${organizationId}`);
};
