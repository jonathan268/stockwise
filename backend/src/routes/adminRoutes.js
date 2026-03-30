const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { protect, restrictTo } = require("../middlewares/auth");

/**
 * Routeur pour l'administration globale de la plateforme SaaS
 */
router.use(protect);
router.use(restrictTo("superadmin"));

// Dashboard Stats
router.get("/stats", adminController.getPlatformStats);

// Organizations Management
router.get("/organizations", adminController.getAllOrganizations);
router.patch("/organizations/:id/status", adminController.updateOrganizationStatus);

// Users Management
router.get("/users", adminController.getAllUsers);

module.exports = router;
