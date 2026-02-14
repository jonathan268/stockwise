const rateLimit = require('express-rate-limit');
const { errorResponse } = require('../utils/apiResponse');

/**
 * Rate limiter général (100 req/15min par IP)
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Trop de requêtes depuis cette adresse IP. Réessayez dans 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(
      res,
      'Trop de requêtes. Veuillez réessayer plus tard',
      429
    );
  }
});

/**
 * Rate limiter auth (5 tentatives/15min)
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes',
  handler: (req, res) => {
    return errorResponse(
      res,
      'Trop de tentatives de connexion. Compte temporairement verrouillé',
      429
    );
  }
});

/**
 * Rate limiter API stricte (30 req/min pour AI endpoints)
 */
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30,
  message: 'Limite API atteinte',
  handler: (req, res) => {
    return errorResponse(
      res,
      'Limite d\'API atteinte. Veuillez patienter',
      429
    );
  }
});

module.exports = {
  generalLimiter,
  authLimiter,
  apiLimiter
};
