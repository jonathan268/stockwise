const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middlewares/auth");
const { tenantIsolation } = require("../middlewares/tenant");
const { checkSubscription } = require("../middlewares/subscription");

const {
  getFournisseur,
  getFournisseurById,
  createFournisseur,
  updateFournisseur,
  deleteFournisseur,
} = require("../controllers/fournisseurController");

// Toutes les routes nécessitent authentification et isolation multi-tenant
router.use(protect);
router.use(tenantIsolation);
router.use(checkSubscription);
router.use(tenantIsolation);

router.get("/", getFournisseur);
router.get("/:id", getFournisseurById);
router.post("/", restrictTo("owner", "admin", "manager"), createFournisseur);
router.put("/:id", restrictTo("owner", "admin", "manager"), updateFournisseur);
router.delete("/:id", restrictTo("owner", "admin"), deleteFournisseur);

module.exports = router;
