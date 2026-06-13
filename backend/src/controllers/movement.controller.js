import { asyncHandler } from "../utils/appError.js";
import * as movementService from "../services/movement.service.js";
import Joi from "joi";

const createMovementSchema = Joi.object({
  productId: Joi.string().required(),
  type: Joi.string().valid("in", "out", "adjustment").required(),
  quantity: Joi.number().min(0).required(),
  reason: Joi.string().trim().max(500).optional().allow(""),
  reference: Joi.string().optional().allow(""),
  saleId: Joi.string().optional().allow(""),
});

const validate = (schema, data) => {
  const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: true });
  if (error) {
    const message = error.details.map((d) => d.message).join(", ");
    throw { status: 400, message, code: "VALIDATION_ERROR", isValidation: true };
  }
  return value;
};

export const createMovement = asyncHandler(async (req, res) => {
  const data = validate(createMovementSchema, req.body);
  const movement = await movementService.createMovement(
    req.organizationId,
    data,
    req.user._id,
  );

  res.status(201).json({
    success: true,
    data: movement,
  });
});

export const getMovements = asyncHandler(async (req, res) => {
  const { movements, total, page, totalPages } = await movementService.getMovements(
    req.organizationId,
    req.query,
  );

  res.json({
    success: true,
    data: movements,
    meta: { total, page, totalPages, limit: Number(req.query.limit || 20) },
  });
});
