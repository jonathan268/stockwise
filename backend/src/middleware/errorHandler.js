/**
 * Global error handler middleware
 * Doit être le dernier middleware
 */
export const errorHandler = (err, req, res, next) => {
  // Joi validation error
  if (err.isValidation) {
    return res.status(err.status || 400).json({
      success: false,
      error: err.message,
      code: err.code || "VALIDATION_ERROR",
    });
  }

  const statusCode = err.statusCode || 500;
  const isDev = process.env.NODE_ENV === "development";

  // Log l'erreur dans le terminal pour le debug
  console.error("🔴 ERROR:", err.message);
  if (isDev) console.error(err.stack);

  res.status(statusCode).json({
    success: false,
    error: err.message || "Erreur serveur",
    code: err.code || "INTERNAL_ERROR",
    ...(isDev && { stack: err.stack }),
  });
};
