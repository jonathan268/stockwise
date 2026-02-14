const Joi = require("joi");
const { AppError } = require("./appError");

const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = {};
      error.details.forEach((detail) => {
        errors[detail.path.join(".")] = detail.message;
      });

      return next(new AppError("Erreur de validation", 400, errors));
    }

    req.body = value;
    next();
  };
};

const createSupplierSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  code: Joi.string().uppercase().allow("", null),
  email: Joi.string().email().allow("", null),
  phone: Joi.string().allow("", null),
  website: Joi.string().uri().allow("", null),

  address: Joi.object({
    street: Joi.string().allow("", null),
    city: Joi.string().allow("", null),
    region: Joi.string().allow("", null),
    country: Joi.string().default("Cameroun"),
    postalCode: Joi.string().allow("", null),
  }),

  contactPerson: Joi.object({
    name: Joi.string(),
    position: Joi.string().allow("", null),
    phone: Joi.string().allow("", null),
    email: Joi.string().email().allow("", null),
    notes: Joi.string().max(500).allow("", null),
  }),

  taxId: Joi.string().allow("", null),
  registrationNumber: Joi.string().allow("", null),

  paymentTerms: Joi.object({
    method: Joi.string()
      .valid("cash", "credit", "mobile_money", "bank_transfer")
      .default("cash"),
    creditDays: Joi.number().min(0).default(0),
    creditLimit: Joi.number().min(0).default(0),
    currency: Joi.string().valid("XAF", "EUR", "USD").default("XAF"),
  }),

  shipping: Joi.object({
    leadTime: Joi.number().min(0).default(7),
    minimumOrderAmount: Joi.number().min(0).default(0),
    shippingCost: Joi.number().min(0).default(0),
    freeShippingThreshold: Joi.number().min(0).default(0),
  }),

  categories: Joi.array().items(Joi.string()),
  tags: Joi.array().items(Joi.string().lowercase()),
  notes: Joi.string().max(2000).allow("", null),
  internalNotes: Joi.string().max(2000).allow("", null),
  status: Joi.string()
    .valid("active", "inactive", "blacklisted")
    .default("active"),
});

const validateCreateSupplier = validate(createSupplierSchema);

const updateSupplierSchema = createSupplierSchema.fork(["name"], (schema) =>
  schema.optional(),
);

const validateUpdateSupplier = validate(updateSupplierSchema);

const ratingSchema = Joi.object({
  quality: Joi.number().min(0).max(5),
  delivery: Joi.number().min(0).max(5),
  pricing: Joi.number().min(0).max(5),
  service: Joi.number().min(0).max(5),
  notes: Joi.string().max(500).allow("", null),
});

const validateRating = validate(ratingSchema);

module.exports = {
  validateCreateSupplier,
  validateUpdateSupplier,
  validateRating,
};
