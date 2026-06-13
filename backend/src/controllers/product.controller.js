import { asyncHandler } from "../utils/appError.js";
import { validate } from "../utils/validation.js";
import * as productService from "../services/product.service.js";
import Joi from "joi";

const createProductSchema = Joi.object({
  name: Joi.string().trim().min(1).max(200).required(),
  sku: Joi.string().trim().max(50).optional(),
  description: Joi.string().trim().max(1000).optional().allow(""),
  category: Joi.string().optional(),
  image: Joi.string().optional(),
  sellingPrice: Joi.number().min(0).required(),
  costPrice: Joi.number().min(0).optional(),
  currentStock: Joi.number().min(0).optional(),
  minimumStock: Joi.number().min(0).optional(),
  unit: Joi.string().optional(),
  preferredSupplier: Joi.string().optional().allow(""),
});

const updateProductSchema = Joi.object({
  name: Joi.string().trim().min(1).max(200).optional(),
  sku: Joi.string().trim().max(50).optional(),
  description: Joi.string().trim().max(1000).optional().allow(""),
  category: Joi.string().optional(),
  image: Joi.string().optional(),
  sellingPrice: Joi.number().min(0).optional(),
  costPrice: Joi.number().min(0).optional(),
  minimumStock: Joi.number().min(0).optional(),
  unit: Joi.string().optional(),
  preferredSupplier: Joi.string().optional().allow(""),
});

const adjustStockSchema = Joi.object({
  delta: Joi.number().required(),
  reason: Joi.string().trim().max(500).optional().allow(""),
});

export const getProducts = asyncHandler(async (req, res) => {
  const result = await productService.getProducts(
    req.organizationId,
    req.query,
  );
  res.json({
    success: true,
    data: result.products,
    meta: { total: result.total, page: result.page, limit: 20 },
  });
});

export const createProduct = asyncHandler(async (req, res) => {
  const data = validate(createProductSchema, req.body);
  const product = await productService.createProduct(
    req.organizationId,
    data,
  );
  res.status(201).json({ success: true, data: product });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const data = validate(updateProductSchema, req.body);
  const product = await productService.updateProduct(
    req.organizationId,
    req.params.id,
    data,
  );
  res.json({ success: true, data: product });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await productService.deleteProduct(
    req.organizationId,
    req.params.id,
  );
  res.json({ success: true, data: product });
});

export const adjustStock = asyncHandler(async (req, res) => {
  const data = validate(adjustStockSchema, req.body);
  const product = await productService.adjustStock(
    req.organizationId,
    req.params.id,
    data,
    req.user._id,
  );
  res.json({ success: true, data: product });
});
