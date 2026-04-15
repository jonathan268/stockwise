/**
 * Inject req.organizationId sur toutes les routes authentifiées
 * LE FICHIER LE PLUS IMPORTANT POUR L'ISOLATION TENANT
 */
export const tenant = (req, res, next) => {
  if (!req.user?.organizationId && req.user?.role !== "super_admin") {
    return res.status(403).json({
      success: false,
      error: "Organization context missing",
    });
  }

  // Super admin n'a pas d'organizationId
  if (req.user?.organizationId) {
    req.organizationId = req.user.organizationId;
  }

  next();
};
