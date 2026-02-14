const express = require("express");
const router = express.Router();
const alertController = require("../controllers/alertController");
const { protect } = require("../middlewares/auth");
const { checkSubscription } = require("../middlewares/subscription");

router.use(protect);
router.use(checkSubscription);

// Routes principales
router.get("/", alertController.getAlerts);
router.get("/unread", alertController.getUnreadAlerts);
router.get("/count", alertController.getAlertsCount);

// Actions groupées
router.patch("/read-all", alertController.markAllAsRead);
router.delete("/clear-all", alertController.clearAll);

// Filtres
router.get("/by-type/:type", alertController.getAlertsByType);
router.get("/by-severity/:severity", alertController.getAlertsBySeverity);

// Paramètres notifications
router.get("/settings", alertController.getNotificationSettings);
router.put("/settings", alertController.updateNotificationSettings);

// Routes individuelles
router.get("/:id", alertController.getAlert);
router.patch("/:id/read", alertController.markAsRead);
router.patch("/:id/dismiss", alertController.dismissAlert);
router.delete("/:id", alertController.deleteAlert);

module.exports = router;
