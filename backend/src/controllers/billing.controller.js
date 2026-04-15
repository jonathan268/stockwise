import * as billingService from "../services/billing.service.js";

export const initializePayment = async (req, res, next) => {
  try {
    const { targetPlan } = req.body;
    
    const paymentData = await billingService.initializePayment(
      req.organizationId,
      req.user.email,
      targetPlan
    );

    res.status(200).json({
      success: true,
      data: paymentData,
      error: null
    });
  } catch (error) {
    next(error);
  }
};

export const handleWebhook = async (req, res, next) => {
  try {
    const signature = req.headers["x-notch-signature"];
    
    await billingService.handleWebhook(signature, req.body);

    res.status(200).json({ success: true, message: "Webhook processed" });
  } catch (error) {
    // Note: Ne pas utiliser `next(error)` classique pour les webhooks si on veut tjrs répondre 200 à l'API provider
    // mais 400/401 pour signature fail c'est legit.
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};
