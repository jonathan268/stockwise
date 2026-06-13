import { asyncHandler } from "../utils/appError.js";
import * as saleService from "../services/sale.service.js";
import Joi from "joi";

/**
 * Crée une nouvelle vente
 * POST /api/v1/sales
 */
export const createSale = asyncHandler(async (req, res) => {
  // Validation
  const schema = Joi.object({
    items: Joi.array()
      .items(
        Joi.object({
          productId: Joi.string().required(),
          quantity: Joi.number().min(1).required(),
          unitPrice: Joi.number().min(0).required(),
        }),
      )
      .min(1)
      .required(),
    paymentMethod: Joi.string()
      .valid("cash", "card", "mobile_money", "credit")
      .required(),
    customerName: Joi.string().optional(),
    note: Joi.string().optional(),
  });

  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: { message: error.details[0].message, code: "VALIDATION_ERROR" },
    });
  }

  const sale = await saleService.createSale(
    req.organizationId,
    value.items,
    value.paymentMethod,
    req.user._id,
    value.customerName,
    value.note,
  );

  res.status(201).json({
    success: true,
    data: sale,
    message: "Vente créée avec succès",
  });
});

/**
 * Récupère la liste des ventes
 * GET /api/v1/sales
 */
export const getSales = asyncHandler(async (req, res) => {
  const result = await saleService.getSales(req.organizationId, req.query);

  res.json({
    success: true,
    data: result.sales,
    meta: {
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      limit: 20,
    },
  });
});

/**
 * Récupère une vente par ID
 * GET /api/v1/sales/:id
 */
export const getSaleById = asyncHandler(async (req, res) => {
  const sale = await saleService.getSaleById(req.organizationId, req.params.id);

  res.json({
    success: true,
    data: sale,
  });
});

/**
 * Annule une vente
 * POST /api/v1/sales/:id/cancel
 */
export const cancelSale = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const result = await saleService.cancelSale(
    req.organizationId,
    req.params.id,
    req.user._id,
    reason,
  );

  res.json({
    success: true,
    data: result.sale,
    message: result.message,
  });
});

/**
 * Récupère les statistiques de ventes
 * GET /api/v1/sales/stats/:period
 */
export const getSalesStats = asyncHandler(async (req, res) => {
  const { period = "month" } = req.params;

  const stats = await saleService.getSalesStats(req.organizationId, period);

  res.json({
    success: true,
    data: stats,
  });
});
