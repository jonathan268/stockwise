const Subscription = require("../models/Subscription");

const checkActiveSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({
      tenantId: req.tenantId,
      status: { $in: ["active", "trial"] },
    }).populate("planId");

    if (!subscription) {
      return res.status(403).json({
        message: "Aucun abonnement actif. Veuillez souscrire à un plan.",
        requiresSubscription: true,
      });
    }

    // Vérifier expiration
    if (subscription.endsAt && subscription.endsAt < new Date()) {
      subscription.status = "expired";
      await subscription.save();

      return res.status(403).json({
        message: "Votre abonnement a expiré.",
        requiresSubscription: true,
      });
    }

    req.subscription = subscription;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Vérifier les limites du plan
const checkPlanLimit = (resource) => {
  return async (req, res, next) => {
    const plan = req.subscription.planId;
    const limitKey = `max${resource.charAt(0).toUpperCase() + resource.slice(1)}`;
    const limit = plan.features[limitKey];

    if (limit === -1) {
      // Illimité
      return next();
    }

    // Compter les ressources actuelles du tenant
    const Model = require(
      `../models/${resource.charAt(0).toUpperCase() + resource.slice(1)}`,
    );
    const count = await Model.countDocuments({ tenantId: req.tenantId });

    if (count >= limit) {
      return res.status(403).json({
        message: `Limite de ${limit} ${resource} atteinte. Passez à un plan supérieur.`,
        currentCount: count,
        limit: limit,
      });
    }

    next();
  };
};

module.exports = { checkActiveSubscription, checkPlanLimit };
