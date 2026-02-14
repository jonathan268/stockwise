const { AppError } = require('../utils/appError');
const { errorResponse } = require('../utils/apiResponse');
const { extractMongooseErrors } = require('../utils/helpers');

/**
 * Gérer erreurs Mongoose CastError (ObjectId invalide)
 */
const handleCastErrorDB = (err) => {
  const message = `Valeur invalide pour ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

/**
 * Gérer erreurs Mongoose ValidationError
 */
const handleValidationErrorDB = (err) => {
  const errors = extractMongooseErrors(err);
  return new AppError('Erreur de validation', 400, errors);
};

/**
 * Gérer erreurs duplicata MongoDB (code 11000)
 */
const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `${field} "${value}" existe déjà`;
  return new AppError(message, 400);
};

/**
 * Gérer erreurs JWT invalide
 */
const handleJWTError = () => {
  return new AppError('Token invalide. Veuillez vous reconnecter', 401);
};

/**
 * Gérer erreurs JWT expiré
 */
const handleJWTExpiredError = () => {
  return new AppError('Token expiré. Veuillez vous reconnecter', 401);
};

/**
 * Envoyer erreur en développement
 */
const sendErrorDev = (err, res) => {
  return res.status(err.statusCode).json({
    success: false,
    error: err,
    message: err.message,
    stack: err.stack,
    ...(err.errors && { errors: err.errors })
  });
};

/**
 * Envoyer erreur en production
 */
const sendErrorProd = (err, res) => {
  // Erreur opérationnelle, de confiance : envoyer message au client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors && { errors: err.errors })
    });
  }
  
  // Erreur de programmation ou inconnue : ne pas leak détails
  console.error('ERROR 💥', err);
  
  return res.status(500).json({
    success: false,
    message: 'Une erreur est survenue'
  });
};

/**
 * Middleware global de gestion d'erreurs
 */
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    
    // Erreurs Mongoose
    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    
    // Erreurs JWT
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();
    
    sendErrorProd(error, res);
  }
};

/**
 * Wrapper async pour éviter try-catch partout
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

/**
 * Middleware 404 - Route non trouvée
 */
const notFound = (req, res, next) => {
  const error = new AppError(
    `Route ${req.originalUrl} non trouvée`,
    404
  );
  next(error);
};

module.exports = {
  errorHandler,
  catchAsync,
  notFound
};