// Middleware pour ajouter automatiquement le tenantId aux requêtes
const tenantIsolation = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Non authentifié" });
  }

  // Ajouter le tenantId à la requête pour l'utiliser partout
  req.tenantId = req.user.tenantId;

  next();
};

module.exports = tenantIsolation;
