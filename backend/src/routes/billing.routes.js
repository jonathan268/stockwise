import express from "express";
import * as billingController from "../controllers/billing.controller.js";
import { protect, authorize } from "../middleware/auth.js";
import { tenant } from "../middleware/tenant.js";

const router = express.Router();

// Webhook ouvert (pas de auth), la signature est vérifiée dans le contrôleur
router.post("/webhook", express.json({type: "application/json"}), billingController.handleWebhook);

// Routes protégées
router.use(protect);
router.use(tenant);

// Seul le propriétaire peut initier un paiement
router.post("/subscribe", authorize("owner"), billingController.initializePayment);

export default router;
