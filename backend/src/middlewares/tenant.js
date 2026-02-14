const { AppError } = require('../utils/appError');

/**
 * Middleware d'isolation multi-tenant
 * S'assure que les requêtes ne peuvent accéder qu'aux données de leur organisation
 */
const tenantIsolation = (req, res, next) => {
  // Vérifier que l'utilisateur a une organisation
  if (!req.user || !req.user.organization) {
    return next(new AppError('Organisation non définie', 400));
  }
  
  // Ajouter automatiquement organization filter aux queries
  const organizationId = req.user.organization;
  
  // Stocker pour utilisation dans les controllers
  req.organizationId = organizationId;
  
  next();
};

/**
 * Vérifier que la ressource appartient à l'organisation
 */
const checkResourceOwnership = (Model, resourceIdParam = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[resourceIdParam];
      const organizationId = req.user.organization;
      
      const resource = await Model.findOne({
        _id: resourceId,
        organization: organizationId
      });
      
      if (!resource) {
        return next(new AppError('Ressource introuvable ou accès non autorisé', 404));
      }
      
      // Attacher ressource à la requête si besoin
      req.resource = resource;
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  tenantIsolation,
  checkResourceOwnership
};