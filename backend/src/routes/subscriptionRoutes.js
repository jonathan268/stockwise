const express = require("express");
const router = express.Router();
const Subscription = require("../models/Subscription");
const Plan = require("../models/Plan");
const { protect: authenticate } = require("../middlewares/auth");

// Obtenir l'abonnement actuel de l'utilisateur
router.get("/my-subscription", authenticate, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      userId: req.user.tenantId,
      status: "active",
    }).populate("planId");

    if (!subscription) {
      return res.status(404).json({ message: "Aucun abonnement actif" });
    }

    res.json(subscription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Créer un nouvel abonnement
router.post("/subscribe", authenticate, async (req, res) => {
  try {
    const { planId, paymentMethodId } = req.body;

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: "Plan introuvable" });
    }

    // Vérifier s'il y a déjà un abonnement actif
    const existingSubscription = await Subscription.findOne({
      userId: req.user.tenantId,
      status: "active",
    });

    if (existingSubscription) {
      return res.status(400).json({
        message: "Vous avez déjà un abonnement actif",
      });
    }

    // Créer l'abonnement (ici simplifié, intégrer Stripe ensuite)
    const subscription = new Subscription({
      userId: req.user.tenantId,
      planId: plan._id,
      status: "trial",
      startsAt: new Date(),
      endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 jours de trial
    });

    await subscription.save();

    res.status(201).json(subscription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Annuler l'abonnement
router.post("/cancel", authenticate, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      userId: req.user.tenantId,
      status: "active",
    });

    if (!subscription) {
      return res.status(404).json({ message: "Aucun abonnement actif" });
    }

    subscription.status = "canceled";
    subscription.canceledAt = new Date();
    await subscription.save();

    res.json({ message: "Abonnement annulé avec succès", subscription });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
