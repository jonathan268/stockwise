import express from "express";
import * as dashboardController from "../controllers/dashboard.controller.js";
import { protect, authorize } from "../middleware/auth.js";
import { tenant } from "../middleware/tenant.js";

const router = express.Router();

router.use(protect);
router.use(tenant);

router.get("/summary", authorize("owner", "admin", "staff"), dashboardController.getDashboardSummary);

export default router;
