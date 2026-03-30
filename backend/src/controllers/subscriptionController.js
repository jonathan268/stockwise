const Subscription = require("../models/Subscription");
const Organization = require("../models/Organization");
const { AppError } = require("../utils/appError");
const { successResponse } = require("../utils/apiResponse");
const notchpayService = require("../services/notchpayService");

class SubscriptionController {
  // GET /api/v1/subscriptions/my-subscription
  async getCurrentSubscription(req, res, next) {
    try {
      if (!req.organization || !req.organization._id) {
        throw new AppError(
          "Aucune organisation associée à ce compte. Veuillez en créer une ou rejoindre une organisation.",
          403,
        );
      }

      const organizationId = req.organization._id;

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

  // GET /api/v1/subscriptions/plans
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

  // POST /api/v1/subscriptions/checkout
  async initializeCheckout(req, res, next) {
    try {
      const { plan, interval = "monthly" } = req.body;
      const organizationId = req.organization._id;
      const user = req.user;

      const subscription = await Subscription.findOne({ organization: organizationId });
      if (!subscription) throw new AppError("Abonnement introuvable", 404);

      // Définir le montant selon le plan
      const pricing = {
        basic: 15000,
        smart: 45000,
        premium: 95000,
      };

      const amount = pricing[plan];
      if (!amount) throw new AppError("Plan invalide pour le paiement", 400);

      const callback_url = `${process.env.FRONTEND_URL}/settings/subscription/callback`;
      
      const payment = await notchpayService.initializePayment({
        amount,
        email: user.email,
        currency: "XAF",
        description: `Abonnement StockWise - Plan ${plan} (${interval})`,
        customer_name: `${user.firstName} ${user.lastName}`,
        callback_url,
        reference: `sub_${subscription._id}_${Date.now()}`,
      });

      return successResponse(res, payment, "Paiement initialisé avec succès");
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/subscriptions/webhook
  // Note: Cette route doit être exclue de l'authentification dans les routes
  async handleWebhook(req, res, next) {
    try {
      const signature = req.headers["x-notchpay-signature"];
      const payload = req.body;

      if (payload.event === "payment.complete") {
        const reference = payload.data.reference;
        const subscriptionId = reference.split("_")[1];

        const subscription = await Subscription.findById(subscriptionId);
        if (subscription) {
          await subscription.recordPayment(
            payload.data.amount,
            payload.data.type || "notchpay",
            reference
          );
          await subscription.save();
          
          await Organization.findByIdAndUpdate(subscription.organization, {
            status: "active"
          });
        }
      }

      return res.status(200).json({ status: "success" });
    } catch (error) {
      console.error("Erreur Webhook NotchPay:", error);
      return res.status(500).json({ status: "error" });
    }
  }

  // POST /api/v1/subscriptions/cancel
  async cancelSubscription(req, res, next) {
    try {
      const { reason, immediate } = req.body;
      const organizationId = req.organization._id;

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

  // GET /api/v1/subscriptions/usage
  async getUsage(req, res, next) {
    try {
      const organizationId = req.organization._id;

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
          products: organization.limits.maxProducts === -1 ? 0 : ((organization.usage.productsCount / organization.limits.maxProducts) * 100).toFixed(2),
          users: organization.limits.maxUsers === -1 ? 0 : ((organization.usage.usersCount / organization.limits.maxUsers) * 100).toFixed(2),
          aiPredictions: organization.limits.aiPredictionsPerMonth === -1 ? 0 : ((organization.usage.aiPredictionsUsed / organization.limits.aiPredictionsPerMonth) * 100).toFixed(2),
        },
      };

      return successResponse(res, usage, "Utilisation récupérée");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SubscriptionController();
