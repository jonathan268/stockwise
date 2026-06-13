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

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const getDashboard = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [
    totalUsers,
    totalOrgs,
    activeOrgs,
    totalProducts,
    totalAlerts,
    totalSales,
    revenueThisMonth,
    revenueThisYear,
    plansBreakdown,
    newUsersThisMonth,
    salesTrend,
  ] = await Promise.all([
    User.countDocuments(),
    Organization.countDocuments(),
    Organization.countDocuments({ isActive: true }),
    Product.countDocuments({ isDeleted: false }),
    Alert.countDocuments(),
    Sale.countDocuments({ status: "completed" }),
    Sale.aggregate([
      { $match: { createdAt: { $gte: startOfMonth }, status: "completed" } },
      { $group: { _id: null, revenue: { $sum: "$totalAmount" } } },
    ]),
    Sale.aggregate([
      { $match: { createdAt: { $gte: startOfYear }, status: "completed" } },
      { $group: { _id: null, revenue: { $sum: "$totalAmount" } } },
    ]),
    Subscription.aggregate([
      { $group: { _id: "$plan", count: { $sum: 1 } } },
    ]),
    User.countDocuments({ createdAt: { $gte: startOfMonth } }),
    Sale.aggregate([
      { $match: { createdAt: { $gte: startOfYear }, status: "completed" } },
      { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, revenue: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      totalUsers,
      totalOrgs,
      activeOrgs,
      totalProducts,
      totalAlerts,
      totalSales,
      revenueThisMonth: revenueThisMonth[0]?.revenue || 0,
      revenueThisYear: revenueThisYear[0]?.revenue || 0,
      newUsersThisMonth,
      plansBreakdown,
      salesTrend,
    },
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

  const [subscription, userCount, productCount] = await Promise.all([
    Subscription.findOne({ organizationId: org._id }),
    User.countDocuments({ organizationId: org._id }),
    Product.countDocuments({ organizationId: org._id, isDeleted: false }),
  ]);

  res.json({
    success: true,
    data: { ...org.toJSON(), subscription, userCount, productCount },
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
