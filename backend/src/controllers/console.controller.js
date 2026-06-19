import { asyncHandler } from "../utils/appError.js";
import User from "../models/User.js";
import Organization from "../models/Organization.js";
import Subscription from "../models/Subscription.js";
import Product from "../models/Product.js";
import Alert from "../models/Alert.js";
import Sale from "../models/Sale.js";
import Feedback from "../models/Feedback.js";
import logger from "../utils/logger.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PLANS } from "../config/plans.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const getDashboard = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [
    totalUsers,
    newUsersThisMonth,
    totalOrgs,
    activeOrgs,
    totalProducts,
    totalAlerts,
    totalSales,
    usersByRole,
    plansBreakdown,
    statusBreakdown,
    paidRevenueThisMonth,
    totalPaidRevenue,
    subscriptionTrend,
    recentSubscriptions,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ createdAt: { $gte: startOfMonth } }),
    Organization.countDocuments(),
    Organization.countDocuments({ isActive: true }),
    Product.countDocuments({ isDeleted: false }),
    Alert.countDocuments(),
    Sale.countDocuments({ status: "completed" }),

    User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]),

    Subscription.aggregate([
      { $group: { _id: "$plan", count: { $sum: 1 } } },
    ]),

    Subscription.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),

    Subscription.aggregate([
      { $match: { "invoices.status": "complete", "invoices.paidAt": { $gte: startOfMonth } } },
      { $unwind: "$invoices" },
      { $match: { "invoices.status": "complete", "invoices.paidAt": { $gte: startOfMonth } } },
      { $group: { _id: null, revenue: { $sum: "$invoices.amount" } } },
    ]),

    Subscription.aggregate([
      { $match: { "invoices.status": "complete" } },
      { $unwind: "$invoices" },
      { $match: { "invoices.status": "complete" } },
      { $group: { _id: null, revenue: { $sum: "$invoices.amount" } } },
    ]),

    Subscription.aggregate([
      { $unwind: "$invoices" },
      { $match: { "invoices.status": "complete" } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$invoices.paidAt" } },
          revenue: { $sum: "$invoices.amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),

    Subscription.find()
      .populate({ path: "organizationId", select: "name owner plan", populate: { path: "owner", select: "firstName lastName email" } })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
  ]);

  // MRR : revenu mensuel récurrent (plans actifs)
  const activeSubs = await Subscription.find({ status: { $in: ["active", "trial"] } }).lean();
  let mrr = 0;
  for (const sub of activeSubs) {
    const planConfig = PLANS[sub.plan];
    if (planConfig && sub.status === "active") {
      mrr += planConfig.price;
    }
  }

  // Taux de conversion trial → payant
  const totalTrials = await Subscription.countDocuments({ status: "trial" });
  const totalPaid = await Subscription.countDocuments({ status: "active" });
  const conversionRate = totalTrials + totalPaid > 0
    ? Math.round((totalPaid / (totalTrials + totalPaid)) * 100)
    : 0;

  // Jours moyens avant paiement
  const paidSubs = await Subscription.find({
    status: "active",
    "invoices.0.paidAt": { $ne: null },
  }).lean();
  let avgDaysToPaid = null;
  if (paidSubs.length > 0) {
    let totalDays = 0;
    let count = 0;
    for (const sub of paidSubs) {
      const firstInvoice = sub.invoices?.find((inv) => inv.status === "complete");
      if (firstInvoice?.paidAt && sub.createdAt) {
        const days = Math.ceil((new Date(firstInvoice.paidAt) - new Date(sub.createdAt)) / (1000 * 60 * 60 * 24));
        totalDays += days;
        count++;
      }
    }
    if (count > 0) avgDaysToPaid = Math.round(totalDays / count);
  }

  res.json({
    success: true,
    data: {
      totalUsers,
      newUsersThisMonth,
      totalOrgs,
      activeOrgs,
      totalProducts,
      totalAlerts,
      totalSales,
      usersByRole,
      plansBreakdown,
      statusBreakdown,
      paidRevenueThisMonth: paidRevenueThisMonth[0]?.revenue || 0,
      totalPaidRevenue: totalPaidRevenue[0]?.revenue || 0,
      mrr,
      conversionRate,
      avgDaysToPaid,
      subscriptionTrend: subscriptionTrend || [],
      recentSubscriptions: recentSubscriptions || [],
    },
  });
});

export const getSubscriptions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, plan, status } = req.query;
  const query = {};
  if (plan) query.plan = plan;
  if (status) query.status = status;

  const [subscriptions, total] = await Promise.all([
    Subscription.find(query)
      .populate({
        path: "organizationId",
        select: "name owner isActive createdAt settings",
        populate: { path: "owner", select: "firstName lastName email" },
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean(),
    Subscription.countDocuments(query),
  ]);

  const data = subscriptions.map((sub) => ({
    ...sub,
    organization: sub.organizationId,
    organizationId: sub.organizationId?._id,
  }));

  res.json({
    success: true,
    data,
    meta: { total, page: Number(page), totalPages: Math.ceil(total / limit) },
  });
});

export const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const [users, total] = await Promise.all([
    User.find()
      .select("-password -refreshToken")
      .populate("organizationId", "name plan")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    User.countDocuments(),
  ]);

  res.json({
    success: true,
    data: users,
    meta: { total, page: Number(page), totalPages: Math.ceil(total / limit) },
  });
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select("-password -refreshToken")
    .populate("organizationId", "name slug plan settings");

  if (!user) return res.status(404).json({ success: false, error: "Utilisateur introuvable" });
  res.json({ success: true, data: user });
});

export const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, error: "Utilisateur introuvable" });

  user.isActive = !user.isActive;
  await user.save();

  res.json({
    success: true,
    data: user,
    message: `Utilisateur ${user.isActive ? "activé" : "désactivé"}`,
  });
});

export const getOrganizations = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const [orgs, total] = await Promise.all([
    Organization.find()
      .populate("owner", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    Organization.countDocuments(),
  ]);

  res.json({
    success: true,
    data: orgs,
    meta: { total, page: Number(page), totalPages: Math.ceil(total / limit) },
  });
});

export const getOrganizationById = asyncHandler(async (req, res) => {
  const org = await Organization.findById(req.params.id)
    .populate("owner", "firstName lastName email role");

  if (!org) return res.status(404).json({ success: false, error: "Organisation introuvable" });

  const [subscription, userCount, productCount, salesCount] = await Promise.all([
    Subscription.findOne({ organizationId: org._id }),
    User.countDocuments({ organizationId: org._id }),
    Product.countDocuments({ organizationId: org._id, isDeleted: false }),
    Sale.countDocuments({ organizationId: org._id, status: "completed" }),
  ]);

  res.json({
    success: true,
    data: { ...org.toJSON(), subscription, userCount, productCount, salesCount },
  });
});

export const toggleOrganizationStatus = asyncHandler(async (req, res) => {
  const org = await Organization.findById(req.params.id);
  if (!org) return res.status(404).json({ success: false, error: "Organisation introuvable" });

  org.isActive = !org.isActive;
  await org.save();

  res.json({
    success: true,
    data: org,
    message: `Organisation ${org.isActive ? "activée" : "désactivée"}`,
  });
});

export const getFeedbackList = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = {};
  if (status) query.status = status;

  const [feedbacks, total] = await Promise.all([
    Feedback.find(query)
      .populate("userId", "firstName lastName email")
      .populate("organizationId", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    Feedback.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: feedbacks,
    meta: { total, page: Number(page), totalPages: Math.ceil(total / limit) },
  });
});

export const updateFeedback = asyncHandler(async (req, res) => {
  const { status, priority, adminNote } = req.body;
  const update = {};
  if (status) update.status = status;
  if (priority) update.priority = priority;
  if (adminNote !== undefined) update.adminNote = adminNote;

  const feedback = await Feedback.findByIdAndUpdate(req.params.id, update, { returnDocument: "after" });
  if (!feedback) return res.status(404).json({ success: false, error: "Feedback introuvable" });

  res.json({ success: true, data: feedback });
});

export const getLogs = asyncHandler(async (req, res) => {
  const logFile = path.join(__dirname, "../../logs/combined.log");
  if (!fs.existsSync(logFile)) return res.json({ success: true, data: [] });

  const lines = fs.readFileSync(logFile, "utf-8").split("\n").filter(Boolean).slice(-100);
  const entries = lines.map((line) => {
    try { return JSON.parse(line); } catch { return { message: line }; }
  });

  res.json({ success: true, data: entries.reverse() });
});
