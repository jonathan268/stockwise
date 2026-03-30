const axios = require("axios");
const crypto = require("crypto");
const { AppError } = require("../utils/appError");

class NotchPayService {
  constructor() {
    this.publicKey = process.env.NOTCHPAY_PUBLIC_KEY;
    this.privateKey = process.env.NOTCHPAY_PRIVATE_KEY;
    this.baseUrl = "https://api.notchpay.co";
  }

  /**
   * Initialiser un paiement
   */
  async initializePayment({ amount, email, currency = "XAF", description, customer_name, callback_url, reference }) {
    try {
      if (!this.privateKey) {
        throw new AppError("Configuration NotchPay manquante (Private Key)", 500);
      }

      const response = await axios.post(
        `${this.baseUrl}/payments/initialize`,
        {
          amount,
          email,
          currency,
          description,
          customer: {
            name: customer_name,
            email: email,
          },
          callback_url,
          reference: reference || `sub_${Date.now()}`,
        },
        {
          headers: {
            Authorization: this.privateKey,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Erreur initialisation NotchPay:", error.response?.data || error.message);
      throw new AppError(
        error.response?.data?.message || "Erreur lors de l'initialisation du paiement NotchPay",
        error.response?.status || 500
      );
    }
  }

  /**
   * Vérifier une transaction
   */
  async verifyTransaction(reference) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/payments/${reference}`,
        {
          headers: {
            Authorization: this.privateKey,
            Accept: "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erreur vérification NotchPay:", error.response?.data || error.message);
      return null;
    }
  }

  /**
   * Vérifier la signature du webhook
   */
  verifyWebhookSignature(payload, signature) {
    if (!signature || !this.privateKey) return false;

    // NotchPay utilise le hash HMAC SHA256 de la clé privée sur le payload
    const hash = crypto
      .createHmac("sha256", this.privateKey)
      .update(JSON.stringify(payload))
      .digest("hex");

    return hash === signature;
  }
}

module.exports = new NotchPayService();
