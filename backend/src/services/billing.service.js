import axios from "axios";
import Organization from "../models/Organization.js";
import Subscription from "../models/Subscription.js";
import { AppError } from "../utils/appError.js";
import logger from "../utils/logger.js";
import { PLANS } from "../config/plans.js";

const getBaseUrl = () => {
  const key = process.env.CINETPAY_API_KEY || "";
  if (process.env.CINETPAY_BASE_URL) return process.env.CINETPAY_BASE_URL;
  return key.startsWith("sk_live_") ? "https://api.cinetpay.co" : "https://api.cinetpay.net";
};

let tokenCache = { token: null, expiresAt: 0 };

const authenticate = async () => {
  if (tokenCache.token && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }

  const baseUrl = getBaseUrl();
  const res = await axios.post(`${baseUrl}/v1/oauth/login`, {
    apikey: process.env.CINETPAY_API_KEY,
    password: process.env.CINETPAY_API_PASSWORD,
  }, {
    headers: { "Content-Type": "application/json" },
    timeout: 15000,
  });

  if (res.data?.code !== "200" && res.data?.code !== 200) {
    throw new Error(res.data?.message || "Échec d'authentification CinetPay");
  }

  const { access_token, expires_in } = res.data.data || res.data;
  tokenCache = {
    token: access_token,
    expiresAt: Date.now() + ((expires_in || 82800) - 300) * 1000,
  };

  return access_token;
};

export const initializePayment = async (organizationId, user, targetPlan) => {
  if (!["pro", "enterprise"].includes(targetPlan)) {
    throw new AppError("Plan invalide pour la souscription", 400);
  }

  const organization = await Organization.findById(organizationId);
  const planConfig = PLANS[targetPlan];
  if (!planConfig) throw new AppError("Plan invalide", 400);
  const amount = planConfig.price;

  const merchantTransactionId = `sub_${organizationId}_${Date.now()}`;
  const baseUrl = getBaseUrl();

  try {
    const token = await authenticate();

    const response = await axios.post(
      `${baseUrl}/v1/payment`,
      {
        currency: "XAF",
        merchant_transaction_id: merchantTransactionId,
        amount,
        lang: "fr",
        designation: `Abonnement StockWise ${targetPlan.toUpperCase()}`,
        client_email: user.email,
        client_first_name: user.firstName || "Client",
        client_last_name: user.lastName || "",
        client_phone_number: user.phone || "",
        success_url: `${process.env.CLIENT_URL}/dashboard?payment=success`,
        failed_url: `${process.env.CLIENT_URL}/dashboard?payment=failed`,
        notify_url: `${process.env.API_URL}/api/v1/billing/webhook`,
        payment_method: "ALL",
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        timeout: 20000,
      },
    );

    if (response.data?.code !== "200" && response.data?.code !== 200) {
      throw new Error(response.data?.message || "Erreur CinetPay");
    }

    const data = response.data.data || response.data;

    return {
      authorization_url: data.payment_url,
      reference: merchantTransactionId,
      payment_token: data.payment_token,
      notify_token: data.notify_token,
    };
  } catch (error) {
    if (error.response?.status === 401) {
      tokenCache = { token: null, expiresAt: 0 };
    }
    logger.error("CinetPay Init Error:", error.response?.data || error.message);
    throw new AppError(
      error.response?.data?.message || "Erreur lors de l'initialisation du paiement",
      500,
    );
  }
};

export const handleWebhook = async (body) => {
  const { transaction_id, merchant_transaction_id, notify_token, amount, currency, status } = body;

  if (!merchant_transaction_id) {
    throw new AppError("Paramètres webhook manquants", 400);
  }

  // Vérifier le statut via l'API CinetPay
  const baseUrl = getBaseUrl();
  try {
    const token = await authenticate();
    const resp = await axios.get(`${baseUrl}/v1/payment/${transaction_id || merchant_transaction_id}`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10000,
    });

    const paymentStatus = resp.data?.data?.status || resp.data?.status;

    if (paymentStatus !== "SUCCESS" && paymentStatus !== "success") {
      logger.info(`CinetPay: Paiement non confirmé (${paymentStatus}) pour ${merchant_transaction_id}`);
      return true;
    }
  } catch (error) {
    // Même si la vérification échoue, on peut toujours traiter
    // CinetPay envoie le statut directement dans le body
    if (status !== "SUCCESS" && status !== "success") {
      logger.warn(`CinetPay: Statut non confirmé pour ${merchant_transaction_id}`);
      return true;
    }
  }

  const parts = merchant_transaction_id.split("_");
  if (parts.length >= 3 && parts[0] === "sub") {
    const orgId = parts[1];
    const paidAmount = Number(amount);
    const paidCurrency = currency || "XAF";

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
          reference: merchant_transaction_id,
          amount: paidAmount,
          currency: paidCurrency,
          status: "complete",
          paidAt: new Date(),
          channel: "cinetpay",
        });
        await subscription.save();
      }

      logger.info(`✅ CinetPay: Upgrade réussi pour Org ${orgId} (Plan: ${newPlan})`);
    }
  }

  return true;
};
