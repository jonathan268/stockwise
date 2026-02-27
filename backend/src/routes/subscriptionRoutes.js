const express = require("express");
const router = express.Router();
const Subscription = require("../models/Subscription");
const Plan = require("../models/Plan");
const { protect: authenticate, restrictTo } = require("../middlewares/auth");
const { checkSubscription } = require("../middlewares/subscription");
const { successResponse } = require("../utils/apiResponse");
const { AppError } = require("../utils/appError");

// Obtenir l'abonnement actuel de l'organisation
router.get(
  "/my-subscription",
  authenticate,
  checkSubscription,
  async (req, res, next) => {
    try {
      const subscription = req.subscription;
      return successResponse(
        res,
        subscription,
        "Abonnement récupéré avec succès",
      );
    } catch (error) {
      next(error);
    }
  },
);

// Créer un nouvel abonnement
router.post("/subscribe", authenticate, async (req, res, next) => {
  try {
    const { planId } = req.body;
    const organizationId = req.user.organization || req.user.ownedOrganization;

    if (!organizationId) {
      throw new AppError("Aucune organisation associée", 400);
    }

    const plan = await Plan.findById(planId);
    if (!plan) {
      throw new AppError("Plan introuvable", 404);
    }

    // Vérifier s'il y a déjà un abonnement actif
    const existingSubscription = await Subscription.findOne({
      organization: organizationId,
      status: { $in: ["active", "trial"] },
    });

    if (existingSubscription) {
      throw new AppError("Vous avez déjà un abonnement actif", 400);
    }

    // Créer l'abonnement
    const subscription = new Subscription({
      organization: organizationId,
      plan: plan._id,
      status: "trial",
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
      trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 jours de trial
    });

    await subscription.save();

    return successResponse(
      res,
      subscription,
      "Abonnement créé avec succès",
      201,
    );
  } catch (error) {
    next(error);
  }
});

// Annuler l'abonnement
router.post(
  "/cancel",
  authenticate,
  restrictTo("owner", "admin"),
  async (req, res, next) => {
    try {
      const organizationId =
        req.user.organization || req.user.ownedOrganization;

      if (!organizationId) {
        throw new AppError("Aucune organisation associée", 400);
      }

      const subscription = await Subscription.findOne({
        organization: organizationId,
        status: { $in: ["active", "trial"] },
      });

      if (!subscription) {
        throw new AppError("Aucun abonnement actif", 404);
      }

      subscription.status = "canceled";
      subscription.canceledAt = new Date();
      await subscription.save();

      return successResponse(
        res,
        subscription,
        "Abonnement annulé avec succès",
      );
    } catch (error) {
      next(error);
    }
  },
);

// Récupérer les plans disponibles
router.get("/plans", authenticate, async (req, res, next) => {
  try {
    const plans = await Plan.find({ status: "active" });
    return successResponse(res, plans, "Plans disponibles");
  } catch (error) {
    next(error);
  }
});

module.exports = router;
