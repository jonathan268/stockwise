import { asyncHandler } from "../utils/appError.js";
import User from "../models/User.js";
import Organization from "../models/Organization.js";
import Subscription from "../models/Subscription.js";
import Product from "../models/Product.js";
import Alert from "../models/Alert.js";

export const getDashboard = asyncHandler(async (req, res) => {
  const [totalUsers, totalOrgs, totalProducts, totalAlerts] = await Promise.all([
    User.countDocuments(),
    Organization.countDocuments(),
    Product.countDocuments({ isDeleted: false }),
    Alert.countDocuments(),
  ]);

  const plansBreakdown = await Subscription.aggregate([
    { $group: { _id: "$plan", count: { $sum: 1 } } },
  ]);

  res.json({
    success: true,
    data: {
      totalUsers,
      totalOrgs,
      totalProducts,
      totalAlerts,
      plansBreakdown,
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

  if (!user) {
    return res.status(404).json({ success: false, error: "Utilisateur introuvable" });
  }

  res.json({ success: true, data: user });
});

export const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, error: "Utilisateur introuvable" });
  }

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

  if (!org) {
    return res.status(404).json({ success: false, error: "Organisation introuvable" });
  }

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
