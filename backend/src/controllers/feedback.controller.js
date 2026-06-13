import { asyncHandler } from "../utils/appError.js";
import { validate } from "../utils/validation.js";
import * as feedbackService from "../services/feedback.service.js";
import Joi from "joi";

const createFeedbackSchema = Joi.object({
  type: Joi.string().valid("bug", "feature_request", "general", "ux", "billing").required(),
  title: Joi.string().trim().min(1).max(120).required(),
  message: Joi.string().trim().min(1).max(1000).required(),
  rating: Joi.number().min(1).max(5).optional(),
  page: Joi.string().optional(),
});

const updateFeedbackSchema = Joi.object({
  status: Joi.string().valid("new", "in_review", "planned", "done", "rejected").optional(),
  priority: Joi.string().valid("low", "medium", "high", "critical").optional(),
  adminNote: Joi.string().optional(),
});

export const createFeedback = asyncHandler(async (req, res) => {
  const data = validate(createFeedbackSchema, req.body);
  const feedback = await feedbackService.createFeedback({
    ...data,
    userId: req.user?._id || null,
    organizationId: req.organizationId || null,
    userAgent: req.headers["user-agent"] || null,
  });

  res.status(201).json({ success: true, data: feedback });
});

export const getFeedbacks = asyncHandler(async (req, res) => {
  const result = await feedbackService.getFeedbacks(req.query);

  res.json({
    success: true,
    data: result.feedbacks,
    meta: { total: result.total, page: result.page, totalPages: result.totalPages, limit: 20 },
  });
});

export const getFeedbackById = asyncHandler(async (req, res) => {
  const feedback = await feedbackService.getFeedbackById(req.params.id);
  res.json({ success: true, data: feedback });
});

export const updateFeedback = asyncHandler(async (req, res) => {
  const data = validate(updateFeedbackSchema, req.body);
  const feedback = await feedbackService.updateFeedback(req.params.id, data);
  res.json({ success: true, data: feedback });
});

export const getFeedbackStats = asyncHandler(async (req, res) => {
  const stats = await feedbackService.getFeedbackStats();
  res.json({ success: true, data: stats });
});
