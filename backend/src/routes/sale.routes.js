import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { tenant } from "../middleware/tenant.js";
import * as saleController from "../controllers/sale.controller.js";

const router = Router();

// Toutes les routes de vente nécessitent l'authentification et la vérification du tenant
router.use(protect, tenant);

/**
 * @route   GET /api/v1/sales
 * @desc    Récupère la liste des ventes de l'organisation
 * @access  Private
 * @query   {Number} page - Page (default: 1)
 * @query   {Number} limit - Limite par page (default: 20)
 * @query   {String} startDate - Date de début du filtre
 * @query   {String} endDate - Date de fin du filtre
 * @query   {String} paymentMethod - Filtre par méthode de paiement
 * @query   {String} search - Recherche par numéro de vente, client, note
 */
router.get("/", saleController.getSales);

/**
 * @route   POST /api/v1/sales
 * @desc    Crée une nouvelle vente et déduit le stock
 * @access  Private
 * @body    {Array} items - Tableau des articles [{productId, quantity, unitPrice}]
 * @body    {String} paymentMethod - cash, card, mobile_money, credit
 * @body    {String} customerName - Nom du client (optionnel)
 * @body    {String} note - Note de vente (optionnel)
 */
router.post("/", saleController.createSale);

/**
 * @route   GET /api/v1/sales/stats/:period
 * @desc    Récupère les statistiques de ventes
 * @access  Private
 * @param   {String} period - day, week, month, year (default: month)
 */
router.get("/stats/:period", saleController.getSalesStats);

/**
 * @route   GET /api/v1/sales/:id
 * @desc    Récupère les détails d'une vente
 * @access  Private
 * @param   {String} id - ID de la vente
 */
router.get("/:id", saleController.getSaleById);

/**
 * @route   POST /api/v1/sales/:id/cancel
 * @desc    Annule une vente et restitue le stock
 * @access  Private
 * @param   {String} id - ID de la vente
 * @body    {String} reason - Raison de l'annulation (optionnel)
 */
router.post("/:id/cancel", saleController.cancelSale);

export default router;
