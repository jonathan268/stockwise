const Subscription = require("../models/Subscription");
const { AppError } = require("../utils/appError");

/**
 * Wrapper pour attraper les erreurs async dans les middleware
 */
const catchAsync = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next);
};

/**
 * Vérifier abonnement actif
 */
const checkSubscription = catchAsync(async (req, res, next) => {
  // FIX: Vérifier que req.organization existe avant d'accéder à ._id
  if (!req.organization) {
    return next(
      new AppError(
        "Aucune organisation associée à ce compte. Veuillez créer ou rejoindre une organisation",
        403,
      ),
    );
  }

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
    // FIX: Vérifier que req.subscription et req.organization existent
    if (!req.subscription) {
      return next(new AppError("Abonnement non vérifié", 500));
    }

    if (!req.organization) {
      return next(new AppError("Organisation introuvable", 403));
    }

    const subscription = req.subscription;
    const organizationId = req.organization._id;

    // -1 = illimité
    if (subscription.features[feature] === -1) {
      return next();
    }

    // FIX: Vérifier que la feature existe dans le plan
    if (subscription.features[feature] === undefined) {
      return next(
        new AppError(`Feature "${feature}" non reconnue dans le plan`, 400),
      );
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
    // FIX: Vérifier que req.subscription existe
    if (!req.subscription) {
      return next(new AppError("Abonnement non vérifié", 500));
    }

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
    // FIX: Vérifier que req.organization existe
    if (!req.organization) {
      return next(new AppError("Organisation introuvable", 403));
    }

    await req.organization.updateOne({
      $inc: { [`usage.${usageField}`]: 1 },
    });

    next();
  });
};

module.exports = {
  catchAsync,
  checkSubscription,
  checkFeatureLimit,
  requireFeature,
  incrementUsage,
};
