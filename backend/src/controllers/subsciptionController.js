const Subscription = require("../models/Subscription");
const Organization = require("../models/Organization");
const { AppError } = require("../utils/appError");
const { successResponse } = require("../utils/apiResponse");

class SubscriptionController {
  // GET /api/v1/subscription
  async getCurrentSubscription(req, res, next) {
    try {
      const organizationId = req.user.organization;

      const subscription = await Subscription.findOne({
        organization: organizationId,
      }).populate("organization", "name email");

      if (!subscription) {
        throw new AppError("Abonnement introuvable", 404);
      }

      return successResponse(
        res,
        subscription,
        "Abonnement récupéré avec succès",
      );
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/subscription/plans
  async getAvailablePlans(req, res, next) {
    try {
      const plans = [
        {
          id: "free",
          name: "Gratuit",
          price: 0,
          interval: "monthly",
          features: {
            maxProducts: 50,
            maxUsers: 2,
            maxStockLocations: 1,
            aiPredictionsPerMonth: 5,
            advancedReports: false,
            mobileApp: false,
            apiAccess: false,
          },
          popular: false,
        },
        {
          id: "basic",
          name: "Basic",
          price: 15000,
          interval: "monthly",
          features: {
            maxProducts: 200,
            maxUsers: 5,
            maxStockLocations: 2,
            aiPredictionsPerMonth: 50,
            advancedReports: false,
            mobileApp: true,
            apiAccess: false,
          },
          popular: false,
        },
        {
          id: "smart",
          name: "Smart",
          price: 45000,
          interval: "monthly",
          features: {
            maxProducts: 1000,
            maxUsers: 15,
            maxStockLocations: 5,
            aiPredictionsPerMonth: 200,
            advancedReports: true,
            mobileApp: true,
            apiAccess: true,
          },
          popular: true,
        },
        {
          id: "premium",
          name: "Premium",
          price: 95000,
          interval: "monthly",
          features: {
            maxProducts: "Illimité",
            maxUsers: "Illimité",
            maxStockLocations: "Illimité",
            aiPredictionsPerMonth: "Illimité",
            advancedReports: true,
            mobileApp: true,
            apiAccess: true,
            prioritySupport: true,
          },
          popular: false,
        },
      ];

      return successResponse(res, plans, "Plans disponibles");
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/subscription/upgrade
  async upgradePlan(req, res, next) {
    try {
      const { newPlan, interval, immediate } = req.body;
      const organizationId = req.user.organization;

      const subscription = await Subscription.findOne({
        organization: organizationId,
      });

      if (!subscription) {
        throw new AppError("Abonnement introuvable", 404);
      }

      // Vérifier que le nouveau plan est valide
      const validPlans = ["free", "basic", "smart", "premium"];
      if (!validPlans.includes(newPlan)) {
        throw new AppError("Plan invalide", 400);
      }

      // Ne pas permettre downgrade vers free
      if (newPlan === "free") {
        throw new AppError(
          "Utilisez l'endpoint de downgrade pour passer au plan gratuit",
          400,
        );
      }

      // Changer de plan
      subscription.changePlan(newPlan, immediate !== false);

      if (interval) {
        subscription.pricing.interval = interval;
      }

      await subscription.save();

      return successResponse(
        res,
        subscription,
        immediate
          ? "Plan mis à jour avec succès"
          : "Changement de plan planifié",
      );
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/subscription/downgrade
  async downgradePlan(req, res, next) {
    try {
      const { newPlan } = req.body;
      const organizationId = req.user.organization;

      const subscription = await Subscription.findOne({
        organization: organizationId,
      });

      if (!subscription) {
        throw new AppError("Abonnement introuvable", 404);
      }

      // Planifier downgrade à la fin de la période
      subscription.scheduledChange = {
        newPlan,
        effectiveDate: subscription.currentPeriod.end,
        reason: "user_requested_downgrade",
      };

      await subscription.save();

      return successResponse(
        res,
        subscription,
        `Downgrade vers ${newPlan} planifié pour le ${subscription.currentPeriod.end.toLocaleDateString()}`,
      );
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/subscription/cancel
  async cancelSubscription(req, res, next) {
    try {
      const { reason, immediate } = req.body;
      const organizationId = req.user.organization;

      const subscription = await Subscription.findOne({
        organization: organizationId,
      });

      if (!subscription) {
        throw new AppError("Abonnement introuvable", 404);
      }

      if (subscription.plan === "free") {
        throw new AppError("L'abonnement gratuit ne peut pas être annulé", 400);
      }

      if (immediate) {
        subscription.cancel(reason);
      } else {
        // Annuler à la fin de la période
        subscription.autoRenew = false;
        subscription.scheduledChange = {
          newPlan: "free",
          effectiveDate: subscription.currentPeriod.end,
          reason: reason || "user_cancelled",
        };
      }

      await subscription.save();

      return successResponse(
        res,
        subscription,
        immediate
          ? "Abonnement annulé"
          : "Annulation planifiée pour la fin de la période",
      );
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/subscription/reactivate
  async reactivateSubscription(req, res, next) {
    try {
      const organizationId = req.user.organization;

      const subscription = await Subscription.findOne({
        organization: organizationId,
      });

      if (!subscription) {
        throw new AppError("Abonnement introuvable", 404);
      }

      if (subscription.status !== "cancelled") {
        throw new AppError(
          "Seuls les abonnements annulés peuvent être réactivés",
          400,
        );
      }

      subscription.status = "active";
      subscription.autoRenew = true;
      subscription.cancelledAt = undefined;
      subscription.cancellationReason = undefined;

      await subscription.save();

      return successResponse(
        res,
        subscription,
        "Abonnement réactivé avec succès",
      );
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/subscription/invoices
  async getInvoices(req, res, next) {
    try {
      const organizationId = req.user.organization;

      const subscription = await Subscription.findOne({
        organization: organizationId,
      });

      if (!subscription) {
        throw new AppError("Abonnement introuvable", 404);
      }

      const invoices = subscription.paymentHistory.sort(
        (a, b) => b.date - a.date,
      );

      return successResponse(res, invoices, "Factures récupérées");
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/subscription/invoices/:id
  async getInvoice(req, res, next) {
    try {
      const { id } = req.params;
      const organizationId = req.user.organization;

      const subscription = await Subscription.findOne({
        organization: organizationId,
      }).populate("organization", "name email address");

      if (!subscription) {
        throw new AppError("Abonnement introuvable", 404);
      }

      const invoice = subscription.paymentHistory.id(id);

      if (!invoice) {
        throw new AppError("Facture introuvable", 404);
      }

      return successResponse(
        res,
        {
          invoice,
          organization: subscription.organization,
        },
        "Facture récupérée",
      );
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/subscription/usage
  async getUsage(req, res, next) {
    try {
      const organizationId = req.user.organization;

      const organization = await Organization.findById(organizationId)
        .select("usage limits")
        .populate("subscription", "features");

      if (!organization) {
        throw new AppError("Organisation introuvable", 404);
      }

      const usage = {
        current: organization.usage,
        limits: organization.limits,
        percentages: {
          products:
            organization.limits.maxProducts === -1
              ? 0
              : (
                  (organization.usage.productsCount /
                    organization.limits.maxProducts) *
                  100
                ).toFixed(2),
          users:
            organization.limits.maxUsers === -1
              ? 0
              : (
                  (organization.usage.usersCount /
                    organization.limits.maxUsers) *
                  100
                ).toFixed(2),
          aiPredictions:
            organization.limits.aiPredictionsPerMonth === -1
              ? 0
              : (
                  (organization.usage.aiPredictionsUsed /
                    organization.limits.aiPredictionsPerMonth) *
                  100
                ).toFixed(2),
        },
      };

      return successResponse(res, usage, "Utilisation récupérée");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SubscriptionController();
