import { asyncHandler } from "../utils/appError.js";
import { validate } from "../utils/validation.js";
import * as supplierService from "../services/supplier.service.js";
import Joi from "joi";

const createSupplierSchema = Joi.object({
  name: Joi.string().trim().min(1).max(200).required(),
  contactName: Joi.string().trim().max(100).optional().allow(""),
  email: Joi.string().trim().email().optional().allow(""),
  phone: Joi.string().trim().max(50).optional().allow(""),
  address: Joi.string().trim().max(500).optional().allow(""),
  paymentTerms: Joi.string().trim().max(100).optional().allow(""),
  notes: Joi.string().trim().max(1000).optional().allow(""),
});

const updateSupplierSchema = Joi.object({
  name: Joi.string().trim().min(1).max(200).optional(),
  contactName: Joi.string().trim().max(100).optional().allow(""),
  email: Joi.string().trim().email().optional().allow(""),
  phone: Joi.string().trim().max(50).optional().allow(""),
  address: Joi.string().trim().max(500).optional().allow(""),
  paymentTerms: Joi.string().trim().max(100).optional().allow(""),
  notes: Joi.string().trim().max(1000).optional().allow(""),
  isActive: Joi.boolean().optional(),
});

export const getSuppliers = asyncHandler(async (req, res) => {
  const result = await supplierService.getSuppliers(req.organizationId, req.query);
  res.json({ success: true, data: result.suppliers, meta: { total: result.total, page: result.page, totalPages: result.totalPages } });
});

export const getSupplier = asyncHandler(async (req, res) => {
  const supplier = await supplierService.getSupplier(req.organizationId, req.params.id);
  res.json({ success: true, data: supplier });
});

export const createSupplier = asyncHandler(async (req, res) => {
  const data = validate(createSupplierSchema, req.body);
  const supplier = await supplierService.createSupplier(req.organizationId, data);
  res.status(201).json({ success: true, data: supplier });
});

export const updateSupplier = asyncHandler(async (req, res) => {
  const data = validate(updateSupplierSchema, req.body);
  const supplier = await supplierService.updateSupplier(req.organizationId, req.params.id, data);
  res.json({ success: true, data: supplier });
});

export const deleteSupplier = asyncHandler(async (req, res) => {
  const supplier = await supplierService.deleteSupplier(req.organizationId, req.params.id);
  res.json({ success: true, data: supplier });
});
