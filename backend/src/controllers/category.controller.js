import { asyncHandler } from "../utils/appError.js";
import * as categoryService from "../services/category.service.js";
import Joi from "joi";

const createCategorySchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required(),
  color: Joi.string().optional(),
  icon: Joi.string().optional(),
});

const updateCategorySchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).optional(),
  color: Joi.string().optional(),
  icon: Joi.string().optional(),
});

const validate = (schema, data) => {
  const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: true });
  if (error) {
    const message = error.details.map((d) => d.message).join(", ");
    throw { status: 400, message, code: "VALIDATION_ERROR", isValidation: true };
  }
  return value;
};

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.getCategories(req.organizationId);
  res.json({ success: true, data: categories });
});

export const createCategory = asyncHandler(async (req, res) => {
  const data = validate(createCategorySchema, req.body);
  const category = await categoryService.createCategory(req.organizationId, data);
  res.status(201).json({ success: true, data: category });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const data = validate(updateCategorySchema, req.body);
  const category = await categoryService.updateCategory(req.organizationId, req.params.id, data);
  res.json({ success: true, data: category });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  await categoryService.deleteCategory(req.organizationId, req.params.id);
  res.json({ success: true, data: null, message: "Catégorie supprimée" });
});
