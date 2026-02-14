const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { protect, restrictTo } = require("../middlewares/auth");
const { checkSubscription } = require("../middlewares/subscription");
const {
  validateCreateOrder,
  validateUpdateOrder,
  validateUpdateStatus,
  validatePayment,
} = require("../utils/orderValidation");

// Toutes les routes nécessitent authentification
router.use(protect);
router.use(checkSubscription);

// Routes stats et types spécifiques
router.get("/stats", orderController.getOrderStats);
router.get("/purchases", orderController.getPurchaseOrders);
router.get("/sales", orderController.getSalesOrders);
router.get("/export", orderController.exportOrders);

// Routes CRUD principales
router
  .route("/")
  .get(orderController.getOrders)
  .post(
    restrictTo("owner", "admin", "manager", "staff"),
    validateCreateOrder,
    orderController.createOrder,
  );

router
  .route("/:id")
  .get(orderController.getOrder)
  .put(
    restrictTo("owner", "admin", "manager"),
    validateUpdateOrder,
    orderController.updateOrder,
  )
  .delete(restrictTo("owner", "admin"), orderController.deleteOrder);

// Actions sur statut
router.patch(
  "/:id/status",
  restrictTo("owner", "admin", "manager"),
  validateUpdateStatus,
  orderController.updateStatus,
);

router.patch(
  "/:id/confirm",
  restrictTo("owner", "admin", "manager"),
  orderController.confirmOrder,
);

router.patch(
  "/:id/complete",
  restrictTo("owner", "admin", "manager"),
  orderController.completeOrder,
);

router.patch(
  "/:id/cancel",
  restrictTo("owner", "admin", "manager"),
  orderController.cancelOrder,
);

// Paiement
router.patch(
  "/:id/payment",
  restrictTo("owner", "admin", "manager", "staff"),
  validatePayment,
  orderController.updatePaymentStatus,
);

// PDF
router.get("/:id/pdf", orderController.generatePDF);

module.exports = router;
