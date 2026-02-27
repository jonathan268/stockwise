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
  // FIX: Support decoded.id ET decoded._id selon comment le JWT a été signé
  const userId = decoded.id || decoded._id;
  if (!userId) {
    return next(new AppError("Token malformé", 401));
  }

  const user = await User.findById(userId);
  // FIX: Suppression du .select("+password") — inutile ici, ne jamais charger le hash par défaut

  if (!user) {
    return next(
      new AppError(
        "Utilisateur introuvable. Le compte a peut-être été supprimé",
        401,
      ),
    );
  }

  // 4. Vérifier si utilisateur actif
  if (user.status !== "active") {
    return next(new AppError("Compte inactif ou suspendu", 401));
  }

  // 5. Vérifier si compte verrouillé
  if (user.isLocked()) {
    return next(new AppError("Compte verrouillé. Réessayez plus tard", 423));
  }

  // 6. Récupérer organisation si elle existe
  // FIX: req.organization = null par défaut, les middlewares suivants doivent le gérer
  let organization = null;
  const orgId = user.organization || user.ownedOrganization;

  if (orgId) {
    organization = await Organization.findById(orgId);

    if (organization && organization.status !== "active") {
      return next(new AppError("Organisation suspendue", 403));
    }
  }

  // 7. Attacher user et organization à la requête
  req.user = user;
  req.organization = organization; // Peut être null si pas d'organisation

  next();
});

/**
 * Restreindre accès par rôle
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    // FIX: Vérifier que req.organization existe avant d'y accéder
    if (!req.organization) {
      return next(
        new AppError(
          "Aucune organisation associée à ce compte",
          403,
        ),
      );
    }

    // Vérifier si owner direct
    if (req.organization.owner.toString() === req.user._id.toString()) {
      if (roles.includes("owner")) return next();
    }

    // Vérifier rôle dans les membres
    const member = req.organization.members.find(
      (m) => m.user.toString() === req.user._id.toString(),
    );

    const userRole = member ? member.role : null;

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
  // FIX: Vérifier que req.organization existe
  if (!req.organization) {
    return next(new AppError("Aucune organisation associée à ce compte", 403));
  }

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