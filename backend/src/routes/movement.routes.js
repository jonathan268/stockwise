import express from "express";
import * as movementController from "../controllers/movement.controller.js";
import { protect, authorize } from "../middleware/auth.js";
import { tenant } from "../middleware/tenant.js";

const router = express.Router();

router.use(protect);
router.use(tenant);

router.post("/", authorize("owner", "admin", "staff"), movementController.createMovement);
router.get("/", authorize("owner", "admin", "staff"), movementController.getMovements);

export default router;
