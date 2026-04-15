import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { tenant } from "../middleware/tenant.js";
import * as productController from "../controllers/product.controller.js";

const router = Router();

router.use(protect, tenant);

router.get("/", productController.getProducts);
router.post("/", productController.createProduct);
router.put("/:id", productController.updateProduct);
router.delete("/:id", productController.deleteProduct);
router.patch("/:id/stock", productController.adjustStock);

export default router;
