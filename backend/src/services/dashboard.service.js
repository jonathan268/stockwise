import Product from "../models/Product.js";
import Sale from "../models/Sale.js";
import Alert from "../models/Alert.js";
import mongoose from "mongoose";
import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 300, useClones: false });

export const getDashboardSummary = async (organizationId) => {
  const cacheKey = `dashboard_${organizationId}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) return cachedData;

  const orgId = new mongoose.Types.ObjectId(organizationId);
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

  const [
    totalProducts,
    lowStockCount,
    outOfStockCount,
    totalStockValue,
    salesToday,
    salesThisWeek,
    salesThisMonth,
    salesLastMonth,
    monthlyTrend,
    activeAlerts,
    recentAlerts,
    recentSales,
    paymentBreakdown,
    topProducts,
  ] = await Promise.all([
    Product.countDocuments({ organizationId: orgId, isDeleted: false }),
    Product.countDocuments({ organizationId: orgId, isDeleted: false, $expr: { $lte: ["$currentStock", "$minimumStock"] }, currentStock: { $gt: 0 } }),
    Product.countDocuments({ organizationId: orgId, isDeleted: false, currentStock: 0 }),
    Product.aggregate([
      { $match: { organizationId: orgId, isDeleted: false } },
      { $group: { _id: null, totalValue: { $sum: { $multiply: ["$currentStock", "$sellingPrice"] } } } },
    ]),
    Sale.aggregate([
      { $match: { organizationId: orgId, createdAt: { $gte: startOfDay }, status: "completed" } },
      { $group: { _id: null, revenue: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
    ]),
    Sale.aggregate([
      { $match: { organizationId: orgId, createdAt: { $gte: startOfWeek }, status: "completed" } },
      { $group: { _id: null, revenue: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
    ]),
    Sale.aggregate([
      { $match: { organizationId: orgId, createdAt: { $gte: startOfMonth }, status: "completed" } },
      { $group: { _id: null, revenue: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
    ]),
    Sale.aggregate([
      { $match: { organizationId: orgId, createdAt: { $gte: startOfLastMonth, $lt: startOfMonth }, status: "completed" } },
      { $group: { _id: null, revenue: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
    ]),
    Sale.aggregate([
      { $match: { organizationId: orgId, createdAt: { $gte: sixMonthsAgo }, status: "completed" } },
      { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, revenue: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Alert.countDocuments({ organizationId: orgId, isRead: false }),
    Alert.find({ organizationId: orgId, isRead: false }).populate("product", "name currentStock minimumStock").sort({ createdAt: -1 }).limit(5).lean(),
    Sale.find({ organizationId: orgId }).populate("items.product", "name").populate("soldBy", "firstName lastName").sort({ createdAt: -1 }).limit(5).lean(),
    Sale.aggregate([
      { $match: { organizationId: orgId, createdAt: { $gte: startOfMonth }, status: "completed" } },
      { $group: { _id: "$paymentMethod", amount: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
    ]),
    Sale.aggregate([
      { $match: { organizationId: orgId, createdAt: { $gte: startOfMonth }, status: "completed" } },
      { $unwind: "$items" },
      { $group: { _id: "$items.productName", totalQty: { $sum: "$items.quantity" }, totalRevenue: { $sum: "$items.totalPrice" } } },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 },
    ]),
  ]);

  // Calcul du stock restant (jours) basé sur salesVelocity
  const productsWithVelocity = await Product.find({
    organizationId: orgId, isDeleted: false, salesVelocity: { $gt: 0 },
  }).select("name currentStock salesVelocity minimumStock").lean();

  const daysOfStockRemaining = productsWithVelocity.map((p) => ({
    name: p.name,
    currentStock: p.currentStock,
    dailyRate: p.salesVelocity,
    daysRemaining: p.salesVelocity > 0 ? Math.round(p.currentStock / p.salesVelocity) : "N/A",
  })).sort((a, b) => a.daysRemaining - b.daysRemaining).slice(0, 10);

  const currentMonth = salesThisMonth[0];
  const lastMonth = salesLastMonth[0];
  const comparison = {
    revenueChange: lastMonth?.revenue
      ? ((currentMonth?.revenue || 0) - lastMonth.revenue) / lastMonth.revenue * 100
      : 0,
    countChange: lastMonth?.count
      ? ((currentMonth?.count || 0) - lastMonth.count) / lastMonth.count * 100
      : 0,
    currentRevenue: currentMonth?.revenue || 0,
    previousRevenue: lastMonth?.revenue || 0,
    currentCount: currentMonth?.count || 0,
    previousCount: lastMonth?.count || 0,
  };

  const result = {
    totalProducts,
    lowStockCount,
    outOfStockCount,
    totalStockValue: totalStockValue[0]?.totalValue || 0,
    dailySalesAmount: salesToday[0]?.revenue || 0,
    dailySalesCount: salesToday[0]?.count || 0,
    weeklySalesAmount: salesThisWeek[0]?.revenue || 0,
    weeklySalesCount: salesThisWeek[0]?.count || 0,
    monthlySalesAmount: currentMonth?.revenue || 0,
    monthlySalesCount: currentMonth?.count || 0,
    activeAlerts,
    recentAlerts,
    recentSales: { data: recentSales },
    comparison,
    monthlyTrend,
    paymentBreakdown,
    topProducts,
    daysOfStockRemaining,
  };

  cache.set(cacheKey, result);
  return result;
};

export const clearDashboardCache = (organizationId) => {
  cache.del(`dashboard_${organizationId}`);
};
