const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Organization = require("../models/Organization");
const { AppError } = require("../utils/appError");
const { catchAsync } = require("./errorHandler");

/**
 * Protéger les routes (vérifier JWT)
 */
const protect = catchAsync(async (req, res, next) => {
  // 1. Récupérer token
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("Non authentifié. Veuillez vous connecter", 401));
  }

  // 2. Vérifier token
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new AppError("Token expiré. Veuillez vous reconnecter", 401));
    }
    return next(new AppError("Token invalide", 401));
  }

  // 3. Vérifier si utilisateur existe toujours
  const user = await User.findById(decoded.id).select("+password");

  if (!user) {
    return next(new AppError("Utilisateur introuvable", 401));
  }

  // 4. Vérifier si utilisateur actif
  if (user.status !== "active") {
    return next(new AppError("Compte inactif ou suspendu", 401));
  }

  // 5. Vérifier si compte verrouillé
  if (user.isLocked()) {
    return next(new AppError("Compte verrouillé. Réessayez plus tard", 423));
  }

  // 6. Vérifier organisation active (optionnel - user peut ne pas en avoir)
  let organization = null;
  if (user.organization || user.ownedOrganization) {
    organization = await Organization.findById(
      user.organization || user.ownedOrganization,
    );

    if (organization && organization.status !== "active") {
      return next(new AppError("Organisation suspendue", 403));
    }
  }

  // 7. Attacher user et organization à la requête
  req.user = user;
  req.organization = organization;

  next();
});

/**
 * Restreindre accès par rôle
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    // Vérifier rôle dans organisation
    const member = req.organization.members.find(
      (m) => m.user.toString() === req.user._id.toString(),
    );

    const userRole = member
      ? member.role
      : req.organization.owner.toString() === req.user._id.toString()
        ? "owner"
        : null;

    if (!userRole || !roles.includes(userRole)) {
      return next(
        new AppError(
          "Vous n'avez pas la permission d'effectuer cette action",
          403,
        ),
      );
    }

    next();
  };
};

/**
 * Vérifier si propriétaire de l'organisation
 */
const isOwner = (req, res, next) => {
  if (req.organization.owner.toString() !== req.user._id.toString()) {
    return next(
      new AppError("Seul le propriétaire peut effectuer cette action", 403),
    );
  }
  next();
};

module.exports = {
  protect,
  restrictTo,
  isOwner,
};
