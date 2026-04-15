import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { tenant } from "../middleware/tenant.js";
import * as alertController from "../controllers/alert.controller.js";

const router = Router();

// Toutes les routes d'alertes nécessitent l'authentification et la vérification du tenant
router.use(protect, tenant);

/**
 * @route   GET /api/v1/alerts
 * @desc    Récupère la liste des alertes de l'organisation
 * @access  Private
 * @query   {String} type - low_stock, out_of_stock, expiring_stock (optionnel)
 * @query   {Boolean} isRead - Filtrer par statut de lecture (optionnel)
 * @query   {Number} page - Page (default: 1)
 * @query   {Number} limit - Limite par page (default: 20)
 */
router.get("/", alertController.getAlerts);

/**
 * @route   GET /api/v1/alerts/unread/count
 * @desc    Récupère le nombre d'alertes non lues
 * @access  Private
 */
router.get("/unread/count", alertController.getUnreadAlertCount);

/**
 * @route   GET /api/v1/alerts/stats
 * @desc    Récupère les statistiques des alertes
 * @access  Private
 */
router.get("/stats", alertController.getAlertStats);

/**
 * @route   GET /api/v1/alerts/:id
 * @desc    Récupère une alerte par ID
 * @access  Private
 * @param   {String} id - ID de l'alerte
 */
router.get("/:id", alertController.getAlertById);

/**
 * @route   PATCH /api/v1/alerts/:id/read
 * @desc    Marque une alerte comme lue
 * @access  Private
 * @param   {String} id - ID de l'alerte
 */
router.patch("/:id/read", alertController.markAlertAsRead);

/**
 * @route   PATCH /api/v1/alerts/mark-all-read
 * @desc    Marque toutes les alertes non lues comme lues
 * @access  Private
 */
router.patch("/", alertController.markAllAlertsAsRead);

/**
 * @route   DELETE /api/v1/alerts/:id
 * @desc    Supprime une alerte
 * @access  Private
 * @param   {String} id - ID de l'alerte
 */
router.delete("/:id", alertController.deleteAlert);

export default router;
