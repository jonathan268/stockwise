import { Router } from "express";
import { protect, authorize } from "../middleware/auth.js";
import { tenant } from "../middleware/tenant.js";
import * as supportController from "../controllers/support.controller.js";

const router = Router();

router.use(protect);
router.use(tenant);

router.post("/", supportController.createTicket);
router.get("/", supportController.getMyTickets);

export default router;

export const adminSupportRoutes = Router();
adminSupportRoutes.use(protect);
adminSupportRoutes.use(authorize("super_admin"));

adminSupportRoutes.get("/", supportController.getAllTickets);
adminSupportRoutes.patch("/:id", supportController.updateTicket);
