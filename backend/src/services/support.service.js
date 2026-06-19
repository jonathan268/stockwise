import SupportTicket from "../models/SupportTicket.js";
import Organization from "../models/Organization.js";
import { PLANS } from "../config/plans.js";
import { AppError } from "../utils/appError.js";

export const createTicketService = async ({ organizationId, userId, subject, message, priority }) => {
  const org = await Organization.findById(organizationId);
  const isPriority = org?.plan === "enterprise" && priority === "urgent";

  const ticket = await SupportTicket.create({
    organizationId,
    userId,
    subject,
    message,
    priority: isPriority ? "urgent" : priority || "normal",
    isPriority,
  });

  return ticket;
};

export const getMyTicketsService = async (organizationId, { page = 1, limit = 20 }) => {
  const [tickets, total] = await Promise.all([
    SupportTicket.find({ organizationId })
      .populate("userId", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    SupportTicket.countDocuments({ organizationId }),
  ]);

  return { tickets, total, page: Number(page), totalPages: Math.ceil(total / limit) };
};

export const getAllTicketsService = async ({ status, page = 1, limit = 20 }) => {
  const query = {};
  if (status) query.status = status;

  const [tickets, total] = await Promise.all([
    SupportTicket.find(query)
      .populate("userId", "firstName lastName email")
      .populate("organizationId", "name plan")
      .sort({ isPriority: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    SupportTicket.countDocuments(query),
  ]);

  return { tickets, total, page: Number(page), totalPages: Math.ceil(total / limit) };
};

export const updateTicketService = async (ticketId, update, adminId) => {
  const ticket = await SupportTicket.findById(ticketId);
  if (!ticket) throw new AppError("Ticket introuvable", 404);

  if (update.status) ticket.status = update.status;
  if (update.adminNote !== undefined) ticket.adminNote = update.adminNote;
  if (update.status === "resolved" || update.status === "closed") {
    ticket.resolvedAt = new Date();
    ticket.resolvedBy = adminId;
  }

  await ticket.save();
  return ticket;
};
