const express = require("express");
const router = express.Router();
const subscriptionController = require("../controllers/subscriptionController");
const { protect: authenticate, restrictTo } = require("../middlewares/auth");
const { checkSubscription } = require("../middlewares/subscription");
const { tenantIsolation } = require("../middlewares/tenant");

// Route Webhook NotchPay (Pas d'authentification requise)
router.post("/webhook", subscriptionController.handleWebhook);

// Appliquer les middlewares de protection pour les autres routes
router.use(authenticate);
router.use(tenantIsolation);

// Obtenir l'abonnement actuel de l'organisation
// NOTE: ne pas bloquer ici sur checkSubscription (active uniquement),
// sinon impossible d'afficher l'état d'un abonnement expiré/trial en settings.
router.get("/my-subscription", subscriptionController.getCurrentSubscription);

// Récupérer les plans disponibles
router.get("/plans", subscriptionController.getAvailablePlans);

// Initialiser un paiement NotchPay
router.post("/checkout", restrictTo("owner", "admin"), subscriptionController.initializeCheckout);

// Annuler l'abonnement
router.post("/cancel", restrictTo("owner", "admin"), subscriptionController.cancelSubscription);

// Récupérer l'utilisation des limites
router.get("/usage", subscriptionController.getUsage);

module.exports = router;
