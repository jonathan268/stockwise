import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { tenant } from "../middleware/tenant.js";
import { planGate } from "../middleware/planGate.js";
import * as exportController from "../controllers/export.controller.js";

const router = Router();

router.use(protect, tenant);

router.get("/products/csv", planGate("csvExports"), exportController.exportProducts);
router.get("/sales/csv", planGate("csvExports"), exportController.exportSales);
router.get("/movements/csv", planGate("csvExports"), exportController.exportMovements);
router.get("/profitability", planGate("exportReports"), exportController.getProfitabilityReport);
router.get("/dead-stock", planGate("exportReports"), exportController.getDeadStockReport);

export default router;
