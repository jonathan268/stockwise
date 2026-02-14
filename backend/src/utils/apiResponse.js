/**
 * Formater une réponse de succès
 */
const successResponse = (res, data, message = 'Succès', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Formater une réponse d'erreur
 */
const errorResponse = (res, message = 'Erreur', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message
  };
  
  if (errors) {
    response.errors = errors;
  }
  
  return res.status(statusCode).json(response);
};

/**
 * Formater une réponse paginée
 */
const paginatedResponse = (res, data, pagination, message = 'Succès') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      total: pagination.total,
      page: pagination.page,
      limit: pagination.limit,
      pages: pagination.pages,
      hasNext: pagination.page < pagination.pages,
      hasPrev: pagination.page > 1
    }
  });
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse
};