import Feedback from "../models/Feedback.js";
import { AppError } from "../utils/appError.js";

export const createFeedback = async (data) => {
  const feedback = await Feedback.create(data);
  return feedback;
};

export const getFeedbacks = async (filters = {}) => {
  const { status, type, priority, page = 1, limit = 20 } = filters;
  const query = {};

  if (status) query.status = status;
  if (type) query.type = type;
  if (priority) query.priority = priority;

  const [feedbacks, total] = await Promise.all([
    Feedback.find(query)
      .populate("userId", "firstName lastName email")
      .populate("organizationId", "name slug")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    Feedback.countDocuments(query),
  ]);

  return {
    feedbacks,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
  };
};

export const getFeedbackById = async (feedbackId) => {
  const feedback = await Feedback.findById(feedbackId)
    .populate("userId", "firstName lastName email")
    .populate("organizationId", "name slug");

  if (!feedback) throw new AppError("Feedback introuvable", 404);
  return feedback;
};

export const updateFeedback = async (feedbackId, updateData) => {
  const feedback = await Feedback.findByIdAndUpdate(
    feedbackId,
    updateData,
    { returnDocument: "after", runValidators: true },
  );

  if (!feedback) throw new AppError("Feedback introuvable", 404);
  return feedback;
};

export const getFeedbackStats = async () => {
  const [total, newCount, inReview, planned, done, rejected] = await Promise.all([
    Feedback.countDocuments(),
    Feedback.countDocuments({ status: "new" }),
    Feedback.countDocuments({ status: "in_review" }),
    Feedback.countDocuments({ status: "planned" }),
    Feedback.countDocuments({ status: "done" }),
    Feedback.countDocuments({ status: "rejected" }),
  ]);

  return { total, new: newCount, inReview, planned, done, rejected };
};
