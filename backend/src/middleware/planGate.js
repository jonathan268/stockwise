import { PRO_FEATURES } from "../config/plans.js";
import Organization from "../models/Organization.js";
import { AppError } from "../utils/appError.js";

/**
 * Factory — crée un middleware qui bloque si la feature n'est pas disponible
 */
export const planGate = (feature) => {
  return async (req, res, next) => {
    try {
      // Super admin a accès à tout
      if (req.user?.role === "super_admin") return next();

      const org = await Organization.findById(req.organizationId);
      if (!org)
        return res
          .status(404)
          .json({ success: false, error: "Organisation introuvable" });

      // Vérifier si la feature est Pro-only
      if (!PRO_FEATURES.includes(feature)) return next();

      // Le trial donne accès à tout pendant 30 jours
      const now = new Date();
      const trialActive = org.isTrialActive && org.trialEndsAt > now;

      if (trialActive || org.plan === "pro" || org.plan === "enterprise") {
        return next();
      }

      // Accès refusé
      return res.status(403).json({
        success: false,
        error: "feature_locked",
        message: "Cette fonctionnalité nécessite le plan Pro.",
        code: "FEATURE_LOCKED",
      });
    } catch (error) {
      next(error);
    }
  };
};
