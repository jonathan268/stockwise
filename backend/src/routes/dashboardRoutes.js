const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middlewares/auth');
const { checkSubscription } = require('../middlewares/subscription');

// Toutes les routes nécessitent une authentification
router.use(protect);
router.use(checkSubscription);

// GET /api/v1/dashboard/summary - Résumé complet
router.get('/summary', dashboardController.getDashboardSummary);

// GET /api/v1/dashboard/stats - Statistiques globales
router.get('/stats', dashboardController.getStats);

// GET /api/v1/dashboard/alerts - Alertes de stock
router.get('/alerts', dashboardController.getStockAlerts);

// GET /api/v1/dashboard/activity - Activités récentes
router.get('/activity', dashboardController.getRecentActivity);

// GET /api/v1/dashboard/top-products - Produits les plus actifs
router.get('/top-products', dashboardController.getTopProducts);

// GET /api/v1/dashboard/ai-insights - Insights IA
router.get('/ai-insights', dashboardController.getAIInsights);

module.exports = router;
