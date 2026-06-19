import { asyncHandler } from "../utils/appError.js";
import { validate } from "../utils/validation.js";
import Joi from "joi";
import * as supportService from "../services/support.service.js";

const createSchema = Joi.object({
  subject: Joi.string().trim().min(3).max(200).required(),
  message: Joi.string().trim().min(10).max(5000).required(),
  priority: Joi.string().valid("normal", "high", "urgent").optional(),
});

const updateSchema = Joi.object({
  status: Joi.string().valid("open", "in_progress", "resolved", "closed").optional(),
  adminNote: Joi.string().max(2000).allow("").optional(),
});

export const createTicket = asyncHandler(async (req, res) => {
  const data = validate(createSchema, req.body);
  const ticket = await supportService.createTicketService({
    organizationId: req.organizationId,
    userId: req.user._id,
    ...data,
  });
  res.status(201).json({ success: true, data: ticket });
});

export const getMyTickets = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const result = await supportService.getMyTicketsService(req.organizationId, { page, limit });
  res.json({ success: true, data: result.tickets, meta: { total: result.total, page: result.page, totalPages: result.totalPages } });
});

export const getAllTickets = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const result = await supportService.getAllTicketsService({ status, page, limit });
  res.json({ success: true, data: result.tickets, meta: { total: result.total, page: result.page, totalPages: result.totalPages } });
});

export const updateTicket = asyncHandler(async (req, res) => {
  const data = validate(updateSchema, req.body);
  const ticket = await supportService.updateTicketService(req.params.id, data, req.user._id);
  res.json({ success: true, data: ticket });
});
