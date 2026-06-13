import express from "express";
import * as supplierController from "../controllers/supplier.controller.js";
import { protect, authorize } from "../middleware/auth.js";
import { tenant } from "../middleware/tenant.js";

const router = express.Router();

router.use(protect);
router.use(tenant);

router.get("/", authorize("owner", "admin", "staff"), supplierController.getSuppliers);
router.post("/", authorize("owner", "admin"), supplierController.createSupplier);
router.get("/:id", authorize("owner", "admin", "staff"), supplierController.getSupplier);
router.put("/:id", authorize("owner", "admin"), supplierController.updateSupplier);
router.delete("/:id", authorize("owner", "admin"), supplierController.deleteSupplier);

export default router;
