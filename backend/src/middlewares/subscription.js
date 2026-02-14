const Subscription = require("../models/Subscription");
const { AppError } = require("../utils/appError");
const { catchAsync } = require("./errorHandler");

/**
 * Vérifier abonnement actif
 */
const checkSubscription = catchAsync(async (req, res, next) => {
  const organizationId = req.organization._id;

  const subscription = await Subscription.findOne({
    organization: organizationId,
  });

  if (!subscription) {
    return next(new AppError("Aucun abonnement trouvé", 404));
  }

  // Vérifier si actif
  if (!subscription.isActive()) {
    return next(
      new AppError(
        "Abonnement expiré ou inactif. Veuillez renouveler",
        402, // Payment Required
      ),
    );
  }

  // Attacher à la requête
  req.subscription = subscription;

  next();
});

/**
 * Vérifier limite de feature
 */
const checkFeatureLimit = (feature, countFn) => {
  return catchAsync(async (req, res, next) => {
    const subscription = req.subscription;
    const organizationId = req.organization._id;

    // -1 = illimité
    if (subscription.features[feature] === -1) {
      return next();
    }

    // Compter usage actuel
    const currentCount = await countFn(organizationId);

    if (currentCount >= subscription.features[feature]) {
      return next(
        new AppError(
          `Limite de ${subscription.features[feature]} ${feature} atteinte. Passez à un plan supérieur`,
          403,
        ),
      );
    }

    next();
  });
};

/**
 * Vérifier si feature disponible dans le plan
 */
const requireFeature = (featureName) => {
  return (req, res, next) => {
    const subscription = req.subscription;

    if (!subscription.hasFeature(featureName)) {
      return next(
        new AppError(
          `Cette fonctionnalité nécessite un plan ${featureName === "advancedReports" ? "Smart" : "Premium"}`,
          403,
        ),
      );
    }

    next();
  };
};

/**
 * Incrémenter usage d'une feature
 */
const incrementUsage = (usageField) => {
  return catchAsync(async (req, res, next) => {
    const organizationId = req.organization._id;

    await req.organization.updateOne({
      $inc: { [`usage.${usageField}`]: 1 },
    });

    next();
  });
};

module.exports = {
  checkSubscription,
  checkFeatureLimit,
  requireFeature,
  incrementUsage,
};
