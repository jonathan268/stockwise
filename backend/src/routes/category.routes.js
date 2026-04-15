import express from "express";
import * as categoryController from "../controllers/category.controller.js";
import { protect, authorize } from "../middleware/auth.js";
import { tenant } from "../middleware/tenant.js";

const router = express.Router();

router.use(protect);
router.use(tenant);

router.get("/", authorize("owner", "admin", "staff"), categoryController.getCategories);
router.post("/", authorize("owner", "admin"), categoryController.createCategory);
router.put("/:id", authorize("owner", "admin"), categoryController.updateCategory);
router.delete("/:id", authorize("owner", "admin"), categoryController.deleteCategory);

export default router;
