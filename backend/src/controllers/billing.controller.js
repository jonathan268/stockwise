import { asyncHandler } from "../utils/appError.js";
import * as billingService from "../services/billing.service.js";

export const initializePayment = asyncHandler(async (req, res) => {
  const { targetPlan } = req.body;
  
  const paymentData = await billingService.initializePayment(
    req.organizationId,
    req.user.email,
    targetPlan
  );

  res.status(200).json({
    success: true,
    data: paymentData,
  });
});

export const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-notch-signature"];
    
    await billingService.handleWebhook(signature, req.body);

    res.status(200).json({ success: true, message: "Webhook processed" });
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};
