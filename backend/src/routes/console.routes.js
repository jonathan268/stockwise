import { Router } from "express";
import { protect, authorize } from "../middleware/auth.js";
import * as consoleController from "../controllers/console.controller.js";

const router = Router();

router.use(protect);
router.use(authorize("super_admin"));

router.get("/dashboard", consoleController.getDashboard);
router.get("/logs", consoleController.getLogs);

router.get("/users", consoleController.getUsers);
router.get("/users/:id", consoleController.getUserById);
router.patch("/users/:id/toggle-status", consoleController.toggleUserStatus);

router.get("/organizations", consoleController.getOrganizations);
router.get("/organizations/:id", consoleController.getOrganizationById);
router.patch("/organizations/:id/toggle-status", consoleController.toggleOrganizationStatus);

router.get("/feedback", consoleController.getFeedbackList);
router.patch("/feedback/:id", consoleController.updateFeedback);

export default router;
