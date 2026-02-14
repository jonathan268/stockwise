/**
 * Pagination helper
 */
const getPaginationParams = (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 20;
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
};

/**
 * Calculer pagination metadata
 */
const getPaginationMetadata = (total, page, limit) => {
  const pages = Math.ceil(total / limit);
  
  return {
    total,
    page,
    limit,
    pages,
    hasNext: page < pages,
    hasPrev: page > 1
  };
};

/**
 * Construire query de recherche MongoDB
 */
const buildSearchQuery = (searchTerm, fields) => {
  if (!searchTerm) return {};
  
  return {
    $or: fields.map(field => ({
      [field]: { $regex: searchTerm, $options: 'i' }
    }))
  };
};

/**
 * Formater date pour affichage
 */
const formatDate = (date, locale = 'fr-FR') => {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Formater datetime
 */
const formatDateTime = (date, locale = 'fr-FR') => {
  return new Date(date).toLocaleString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Calculer différence en jours entre deux dates
 */
const daysBetween = (date1, date2) => {
  const diffTime = Math.abs(new Date(date2) - new Date(date1));
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Vérifier si date est expirée
 */
const isExpired = (date) => {
  return new Date(date) < new Date();
};

/**
 * Générer code aléatoire
 */
const generateCode = (length = 6, type = 'alphanumeric') => {
  let chars;
  
  switch(type) {
    case 'numeric':
      chars = '0123456789';
      break;
    case 'alphabetic':
      chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      break;
    case 'alphanumeric':
    default:
      chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  }
  
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return code;
};

/**
 * Générer référence unique (ex: ORD-20240115-ABC123)
 */
const generateReference = (prefix = 'REF') => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = generateCode(6, 'alphanumeric');
  
  return `${prefix}-${year}${month}${day}-${random}`;
};

/**
 * Arrondir nombre à N décimales
 */
const roundTo = (num, decimals = 2) => {
  return parseFloat(num.toFixed(decimals));
};

/**
 * Nettoyer objet (retirer valeurs undefined/null)
 */
const cleanObject = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v != null && v !== '')
  );
};

/**
 * Extraire erreurs de validation Mongoose
 */
const extractMongooseErrors = (error) => {
  if (error.name === 'ValidationError') {
    const errors = {};
    Object.keys(error.errors).forEach(key => {
      errors[key] = error.errors[key].message;
    });
    return errors;
  }
  return null;
};

/**
 * Trier tableau d'objets par champ
 */
const sortBy = (array, field, order = 'asc') => {
  return array.sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];
    
    if (order === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });
};

/**
 * Grouper tableau par champ
 */
const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {});
};

/**
 * Delay (promesse)
 */
const delay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retry avec backoff exponentiel
 */
const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      const delayTime = baseDelay * Math.pow(2, i);
      await delay(delayTime);
    }
  }
};

module.exports = {
  getPaginationParams,
  getPaginationMetadata,
  buildSearchQuery,
  formatDate,
  formatDateTime,
  daysBetween,
  isExpired,
  generateCode,
  generateReference,
  roundTo,
  cleanObject,
  extractMongooseErrors,
  sortBy,
  groupBy,
  delay,
  retryWithBackoff
};