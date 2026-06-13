import { Router } from "express";
import { protect, authorize } from "../middleware/auth.js";
import * as consoleController from "../controllers/console.controller.js";

const router = Router();

// Toutes les routes console nécessitent super_admin
router.use(protect);
router.use(authorize("super_admin"));

router.get("/dashboard", consoleController.getDashboard);
router.get("/users", consoleController.getUsers);
router.get("/users/:id", consoleController.getUserById);
router.patch("/users/:id/toggle-status", consoleController.toggleUserStatus);
router.get("/organizations", consoleController.getOrganizations);
router.get("/organizations/:id", consoleController.getOrganizationById);

export default router;
