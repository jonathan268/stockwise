const Joi = require('joi');
const { AppError } = require('../utils/appError');
const { 
  isValidObjectId, 
  isValidSKU, 
  sanitizeString 
} = require('../utils/validators');

/**
 * Middleware de validation générique avec Joi
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      const errors = {};
      error.details.forEach(detail => {
        errors[detail.path.join('.')] = detail.message;
      });
      
      return next(new AppError('Erreur de validation', 400, errors));
    }
    
    req[source] = value;
    next();
  };
};

/**
 * Schéma Joi pour Category
 */
const categorySchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Le nom est requis',
      'string.min': 'Le nom doit contenir au moins 2 caractères',
      'string.max': 'Le nom ne peut pas dépasser 100 caractères'
    }),
  
  description: Joi.string()
    .max(500)
    .allow('', null)
    .messages({
      'string.max': 'La description ne peut pas dépasser 500 caractères'
    }),
  
  parent: Joi.string()
    .custom((value, helpers) => {
      if (!isValidObjectId(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    })
    .allow(null)
    .messages({
      'any.invalid': 'ID de catégorie parent invalide'
    }),
  
  icon: Joi.string().max(50).allow('', null),
  
  color: Joi.string()
    .pattern(/^#[0-9A-Fa-f]{6}$/)
    .allow(null)
    .messages({
      'string.pattern.base': 'Couleur invalide (format: #RRGGBB)'
    }),
  
  order: Joi.number()
    .integer()
    .min(0)
    .default(0),
  
  status: Joi.string()
    .valid('active', 'inactive')
    .default('active')
});

/**
 * Middleware validation Category
 */
const validateCategory = validate(categorySchema);

/**
 * Schéma Joi pour Product
 */
const productSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Le nom du produit est requis',
      'string.min': 'Le nom doit contenir au moins 2 caractères',
      'string.max': 'Le nom ne peut pas dépasser 200 caractères'
    }),
  
  sku: Joi.string()
    .uppercase()
    .custom((value, helpers) => {
      if (!isValidSKU(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    })
    .allow('', null)
    .messages({
      'any.invalid': 'SKU invalide (lettres majuscules, chiffres et tirets uniquement)'
    }),
  
  barcode: Joi.string()
    .max(50)
    .allow('', null),
  
  description: Joi.string()
    .max(1000)
    .allow('', null),
  
  category: Joi.string()
    .required()
    .custom((value, helpers) => {
      if (!isValidObjectId(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    })
    .messages({
      'string.empty': 'La catégorie est requise',
      'any.invalid': 'ID de catégorie invalide'
    }),
  
  unit: Joi.string()
    .valid('kg', 'g', 'l', 'ml', 'piece', 'box', 'bag', 'ton', 'carton')
    .required()
    .messages({
      'string.empty': 'L\'unité est requise',
      'any.only': 'Unité invalide'
    }),
  
  pricing: Joi.object({
    cost: Joi.number()
      .min(0)
      .required()
      .messages({
        'number.base': 'Le prix d\'achat doit être un nombre',
        'number.min': 'Le prix d\'achat ne peut pas être négatif',
        'any.required': 'Le prix d\'achat est requis'
      }),
    
    sellingPrice: Joi.number()
      .min(0)
      .required()
      .messages({
        'number.base': 'Le prix de vente doit être un nombre',
        'number.min': 'Le prix de vente ne peut pas être négatif',
        'any.required': 'Le prix de vente est requis'
      }),
    
    currency: Joi.string()
      .valid('XAF', 'EUR', 'USD')
      .default('XAF'),
    
    taxRate: Joi.number()
      .min(0)
      .max(100)
      .default(0)
  }).required(),
  
  supplier: Joi.string()
    .custom((value, helpers) => {
      if (value && !isValidObjectId(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    })
    .allow(null)
    .messages({
      'any.invalid': 'ID de fournisseur invalide'
    }),
  
  image: Joi.object({
    url: Joi.string().uri().allow('', null),
    publicId: Joi.string().allow('', null)
  }),
  
  metadata: Joi.object({
    perishable: Joi.boolean().default(false),
    
    shelfLife: Joi.number()
      .integer()
      .min(0)
      .allow(null),
    
    seasonal: Joi.boolean().default(false),
    
    seasonalMonths: Joi.array()
      .items(Joi.number().integer().min(1).max(12))
      .allow(null),
    
    storageConditions: Joi.string()
      .valid('ambient', 'refrigerated', 'frozen', 'dry', 'special')
      .default('ambient'),
    
    weight: Joi.number().min(0).allow(null),
    
    dimensions: Joi.object({
      length: Joi.number().min(0),
      width: Joi.number().min(0),
      height: Joi.number().min(0),
      unit: Joi.string().valid('cm', 'm').default('cm')
    })
  }),
  
  tags: Joi.array()
    .items(Joi.string().lowercase().trim())
    .allow(null),
  
  status: Joi.string()
    .valid('active', 'inactive', 'discontinued')
    .default('active')
});

/**
 * Middleware validation Product
 */
const validateProduct = validate(productSchema);

/**
 * Schéma Joi pour Stock Adjustment
 */
const stockAdjustmentSchema = Joi.object({
  productId: Joi.string()
    .required()
    .custom((value, helpers) => {
      if (!isValidObjectId(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    })
    .messages({
      'string.empty': 'L\'ID du produit est requis',
      'any.invalid': 'ID de produit invalide'
    }),
  
  location: Joi.string()
    .default('Principal')
    .messages({
      'string.empty': 'La localisation est requise'
    }),
  
  quantity: Joi.number()
    .integer()
    .required()
    .messages({
      'number.base': 'La quantité doit être un nombre',
      'number.integer': 'La quantité doit être un nombre entier',
      'any.required': 'La quantité est requise'
    }),
  
  type: Joi.string()
    .valid('purchase', 'sale', 'adjustment', 'return', 'loss')
    .required()
    .messages({
      'string.empty': 'Le type est requis',
      'any.only': 'Type invalide'
    }),
  
  reference: Joi.string()
    .max(100)
    .allow('', null),
  
  notes: Joi.string()
    .max(500)
    .allow('', null)
});

/**
 * Middleware validation Stock Adjustment
 */
const validateStockAdjustment = validate(stockAdjustmentSchema);

/**
 * Schéma Joi pour Stock Transfer
 */
const stockTransferSchema = Joi.object({
  productId: Joi.string()
    .required()
    .custom((value, helpers) => {
      if (!isValidObjectId(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    })
    .messages({
      'string.empty': 'L\'ID du produit est requis',
      'any.invalid': 'ID de produit invalide'
    }),
  
  fromLocation: Joi.string()
    .required()
    .messages({
      'string.empty': 'La localisation source est requise'
    }),
  
  toLocation: Joi.string()
    .required()
    .messages({
      'string.empty': 'La localisation destination est requise'
    }),
  
  quantity: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      'number.base': 'La quantité doit être un nombre',
      'number.integer': 'La quantité doit être un nombre entier',
      'number.min': 'La quantité doit être au moins 1',
      'any.required': 'La quantité est requise'
    }),
  
  reference: Joi.string()
    .max(100)
    .allow('', null),
  
  notes: Joi.string()
    .max(500)
    .allow('', null)
});

/**
 * Middleware validation Stock Transfer
 */
const validateStockTransfer = validate(stockTransferSchema);

/**
 * Middleware de sanitization (nettoyer inputs)
 */
const sanitizeInputs = (req, res, next) => {
  // Sanitizer body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeString(req.body[key]);
      }
    });
  }
  
  // Sanitizer query
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeString(req.query[key]);
      }
    });
  }
  
  next();
};

/**
 * Validation ObjectId dans params
 */
const validateObjectIdParam = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    if (!isValidObjectId(id)) {
      return next(new AppError(`ID invalide: ${paramName}`, 400));
    }
    
    next();
  };
};

module.exports = {
  validate,
  validateCategory,
  validateProduct,
  validateStockAdjustment,
  validateStockTransfer,
  sanitizeInputs,
  validateObjectIdParam
};