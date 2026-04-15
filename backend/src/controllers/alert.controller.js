import { asyncHandler } from "../utils/appError.js";
import * as alertService from "../services/alert.service.js";

/**
 * Récupère la liste des alertes
 * GET /api/v1/alerts
 */
export const getAlerts = asyncHandler(async (req, res) => {
  const result = await alertService.getAlerts(req.organizationId, req.query);

  res.json({
    success: true,
    data: result.alerts,
    meta: {
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      limit: 20,
    },
  });
});

/**
 * Récupère une alerte par ID
 * GET /api/v1/alerts/:id
 */
export const getAlertById = asyncHandler(async (req, res) => {
  const alert = await alertService.getAlertById(
    req.organizationId,
    req.params.id,
  );

  res.json({
    success: true,
    data: alert,
  });
});

/**
 * Marque une alerte comme lue
 * PATCH /api/v1/alerts/:id/read
 */
export const markAlertAsRead = asyncHandler(async (req, res) => {
  const alert = await alertService.markAlertAsRead(
    req.organizationId,
    req.params.id,
    req.user._id,
  );

  res.json({
    success: true,
    data: alert,
    message: "Alerte marquée comme lue",
  });
});

/**
 * Marque toutes les alertes comme lues
 * PATCH /api/v1/alerts/mark-all-read
 */
export const markAllAlertsAsRead = asyncHandler(async (req, res) => {
  const result = await alertService.markAllAlertsAsRead(
    req.organizationId,
    req.user._id,
  );

  res.json({
    success: true,
    data: result,
    message: `${result.modified} alerte(s) marquée(s) comme lue(s)`,
  });
});

/**
 * Supprime une alerte
 * DELETE /api/v1/alerts/:id
 */
export const deleteAlert = asyncHandler(async (req, res) => {
  const alert = await alertService.deleteAlert(
    req.organizationId,
    req.params.id,
  );

  res.json({
    success: true,
    message: "Alerte supprimée avec succès",
  });
});

/**
 * Récupère les statistiques des alertes
 * GET /api/v1/alerts/stats
 */
export const getAlertStats = asyncHandler(async (req, res) => {
  const stats = await alertService.getAlertStats(req.organizationId);

  res.json({
    success: true,
    data: stats,
  });
});

/**
 * Récupère le nombre d'alertes non lues
 * GET /api/v1/alerts/unread/count
 */
export const getUnreadAlertCount = asyncHandler(async (req, res) => {
  const count = await alertService.getUnreadAlertCount(req.organizationId);

  res.json({
    success: true,
    data: { unreadCount: count },
  });
});
