import crypto from "crypto";
import axios from "axios";
import Organization from "../models/Organization.js";
import Subscription from "../models/Subscription.js";
import { AppError } from "../utils/appError.js";
import logger from "../utils/logger.js";
import { PLANS } from "../config/plans.js";

/**
 * Initialise un paiement NotchPay pour un upgrade de plan
 */
export const initializePayment = async (organizationId, userEmail, targetPlan) => {
  if (!["pro", "enterprise"].includes(targetPlan)) {
    throw new AppError("Plan invalide pour la souscription", 400);
  }

  const organization = await Organization.findById(organizationId);
  const planConfig = PLANS[targetPlan];
  if (!planConfig) throw new AppError("Plan invalide", 400);
  const amount = planConfig.price;

  // Identifiant unique pour la référence interne (ex: renvoyé dans le webhook)
  const reference = `sub_${organizationId}_${Date.now()}`;

  try {
    const response = await axios.post(
      "https://api.notchpay.co/payments/initialize",
      {
        email: userEmail,
        amount: amount,
        currency: "XAF",
        reference: reference, // la ref unique
        description: `Abonnement StockWise ${targetPlan.toUpperCase()}`,
        callback: `${process.env.CLIENT_URL}/dashboard/settings/billing?status=success`, // URL de retour après paiement
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.NOTCHPAY_PUBLIC_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    // On stocke temporairement la référence liée au plan en DB si besoin (ou on se fie juste à la référence contenant l'org_id)
    // Ici la ref contient explicitement l'organizationId !
    
    return {
      authorization_url: response.data.authorization_url,
      reference: reference
    };
  } catch (error) {
    logger.error("NotchPay Initialize Error:", error.response?.data || error.message);
    throw new AppError("Erreur lors de l'initialisation du paiement", 500);
  }
};

/**
 * Gère le webhook de NotchPay pour valider la transaction et mettre à jour l'Organisation
 */
export const handleWebhook = async (signature, payloadBody) => {
  if (!process.env.NOTCHPAY_WEBHOOK_HASH) {
    throw new AppError("Webhook secret non configuré", 500);
  }

  const hash = crypto
    .createHmac("sha256", process.env.NOTCHPAY_WEBHOOK_HASH)
    .update(JSON.stringify(payloadBody))
    .digest("hex");

  if (hash.length !== signature.length || !crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature))) {
    throw new AppError("Signature Webhook Invalide", 401);
  }

  const event = payloadBody.event;
  const data = payloadBody.data;

  if (event === "payment.complete" && data.status === "complete") {
    const reference = data.reference;
    const parts = reference.split("_");
    if (parts.length >= 3 && parts[0] === "sub") {
      const orgId = parts[1];

      const paidAmount = data.amount;
      let newPlan = null;
      if (paidAmount === PLANS.pro.price) {
        newPlan = "pro";
      } else if (paidAmount === PLANS.enterprise.price) {
        newPlan = "enterprise";
      } else {
        logger.warn(`Webhook: montant ${paidAmount} ne correspond à aucun plan pour org ${orgId}`);
        return true;
      }

      const org = await Organization.findById(orgId);
      if (org) {
        org.plan = newPlan;
        org.isTrialActive = false;
        await org.save();

        let subscription = await Subscription.findOne({ organizationId: orgId });
        if (subscription) {
          subscription.plan = newPlan;
          subscription.status = "active";
          subscription.invoices.push({
            reference: reference,
            amount: paidAmount,
            currency: "XAF",
            status: "complete",
            paidAt: new Date(),
            channel: data.channel || "notchpay",
          });
          await subscription.save();
        }

        logger.info(`✅ Webhook Notchpay: Upgrade réussi pour l'Org ${orgId} (Plan: ${newPlan})`);
      }
    }
  }

  return true;
};
