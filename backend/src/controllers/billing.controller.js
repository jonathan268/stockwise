import { asyncHandler } from "../utils/appError.js";
import * as billingService from "../services/billing.service.js";
import logger from "../utils/logger.js";

export const initializePayment = asyncHandler(async (req, res) => {
  const { targetPlan } = req.body;

  const paymentData = await billingService.initializePayment(
    req.organizationId,
    req.user,
    targetPlan,
  );

  res.status(200).json({
    success: true,
    data: paymentData,
  });
});

export const handleWebhook = async (req, res) => {
  try {
    await billingService.handleWebhook(req.body);

    // CinetPay attend "OK" en retour pour l'IPN
    res.status(200).send("OK");
  } catch (error) {
    logger.error("Webhook error:", error.message);
    res.status(error.statusCode || 500).send("FAIL");
  }
};
