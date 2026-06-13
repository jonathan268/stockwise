import { asyncHandler } from "../utils/appError.js";
import { validate } from "../utils/validation.js";
import * as movementService from "../services/movement.service.js";
import Joi from "joi";

const createMovementSchema = Joi.object({
  productId: Joi.string().required(),
  type: Joi.string().valid("in", "out", "adjustment").required(),
  quantity: Joi.number().min(0).required(),
  reason: Joi.string().trim().max(500).optional().allow(""),
  reference: Joi.string().optional().allow(""),
  saleId: Joi.string().optional().allow(""),
  supplier: Joi.string().optional().allow(""),
});

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
