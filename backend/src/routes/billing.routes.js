import express from "express";
import * as billingController from "../controllers/billing.controller.js";
import { protect, authorize } from "../middleware/auth.js";
import { tenant } from "../middleware/tenant.js";
import { asyncHandler } from "../utils/appError.js";

const router = express.Router();

router.post("/webhook", billingController.handleWebhook);

router.use(protect);
router.use(tenant);

router.post("/subscribe", authorize("owner"), billingController.initializePayment);

router.get("/history", asyncHandler(async (req, res) => {
  const Subscription = (await import("../models/Subscription.js")).default;
  const sub = await Subscription.findOne({ organizationId: req.organizationId });
  res.json({ success: true, data: sub?.invoices || [] });
}));

export default router;
