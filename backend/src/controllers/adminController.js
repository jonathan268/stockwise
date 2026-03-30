const User = require("../models/User");
const Organization = require("../models/Organization");
const Subscription = require("../models/Subscription");
const { AppError } = require("../utils/appError");
const { successResponse } = require("../utils/apiResponse");

/**
 * Contrôleur pour l'administration globale de la plateforme SaaS
 */
class AdminController {
  /**
   * Récupérer les statistiques globales de la plateforme
   */
  async getPlatformStats(req, res, next) {
    try {
      // 1. Comptes de base
      const totalUsers = await User.countDocuments();
      const activeUsers = await User.countDocuments({ status: "active" });
      const totalOrganizations = await Organization.countDocuments();
      const activeOrganizations = await Organization.countDocuments({ status: "active" });

      // 2. Statistiques d'abonnements
      const subscriptions = await Subscription.find();
      const activeSubscriptions = subscriptions.filter(s => s.status === "active").length;
      
      // Calculer revenus totaux estimés (somme de tous les paiements complétés)
      let totalRevenue = 0;
      subscriptions.forEach(sub => {
        if (sub.paymentHistory) {
          sub.paymentHistory.forEach(payment => {
            if (payment.status === "completed") {
              totalRevenue += (payment.amount || 0);
            }
          });
        }
      });

      // 3. Répartition par plan
      const planStats = {
        free: subscriptions.filter(s => s.plan === "free").length,
        basic: subscriptions.filter(s => s.plan === "basic").length,
        smart: subscriptions.filter(s => s.plan === "smart").length,
        premium: subscriptions.filter(s => s.plan === "premium").length,
      };

      return successResponse(res, {
        overview: {
          totalUsers,
          activeUsers,
          totalOrganizations,
          activeOrganizations,
          activeSubscriptions,
          totalRevenue
        },
        plans: planStats,
        system: {
          nodeVersion: process.version,
          platform: process.platform,
          memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + " MB"
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lister toutes les organisations
   */
  async getAllOrganizations(req, res, next) {
    try {
      const { status, plan, search } = req.query;
      const query = { deletedAt: null };

      if (status) query.status = status;
      
      // Pour filtrer par plan, on doit joindre avec Subscription
      // Mais pour simplifier ici, on va d'abord lister les orgs
      
      let organizations = await Organization.find(query)
        .populate("owner", "firstName lastName email")
        .populate("subscription")
        .sort("-createdAt");

      if (search) {
        organizations = organizations.filter(org => 
          org.name.toLowerCase().includes(search.toLowerCase()) ||
          org.slug.toLowerCase().includes(search.toLowerCase())
        );
      }

      return successResponse(res, organizations);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lister tous les utilisateurs de la plateforme
   */
  async getAllUsers(req, res, next) {
    try {
      const { role, status, search } = req.query;
      const query = {};

      if (role) query.role = role;
      if (status) query.status = status;
      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } }
        ];
      }

      const users = await User.find(query)
        .populate("organization", "name slug")
        .sort("-createdAt");

      return successResponse(res, users);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mettre à jour le statut d'une organisation
   */
  async updateOrganizationStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!["active", "suspended", "cancelled"].includes(status)) {
        throw new AppError("Statut invalide", 400);
      }

      const organization = await Organization.findByIdAndUpdate(
        id,
        { $set: { status } },
        { new: true, runValidators: true }
      );

      if (!organization) {
        throw new AppError("Organisation introuvable", 404);
      }

      return successResponse(res, organization, "Statut de l'organisation mis à jour");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();
