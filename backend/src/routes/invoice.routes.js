import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { tenant } from "../middleware/tenant.js";
import { asyncHandler } from "../utils/appError.js";
import { generateInvoiceHTML } from "../services/invoice.service.js";

const router = Router();

router.use(protect, tenant);

router.get("/:saleId/html", asyncHandler(async (req, res) => {
  const html = await generateInvoiceHTML(req.params.saleId, req.organizationId);
  if (!html) return res.status(404).json({ success: false, error: "Facture introuvable" });
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(html);
}));

export default router;
