import logger from "../utils/logger.js";

const CURRENCY_API = "https://api.exchangerate-api.com/v4/latest/XAF";
const cache = { rates: null, fetchedAt: null };

export const getExchangeRates = async () => {
  if (cache.rates && cache.fetchedAt && Date.now() - cache.fetchedAt < 86400000) {
    return cache.rates;
  }

  try {
    const res = await fetch(CURRENCY_API);
    const data = await res.json();
    cache.rates = data.rates;
    cache.fetchedAt = Date.now();
    return data.rates;
  } catch (error) {
    logger.warn("Impossible de récupérer les taux de change, utilisation des taux par défaut");
    return { EUR: 0.0015, USD: 0.0016 };
  }
};

export const convertCurrency = async (amount, from, to) => {
  if (from === to) return amount;
  const rates = await getExchangeRates();
  const inBase = from === "XAF" ? amount : amount / (rates[from] || 1);
  return inBase * (rates[to] || 1);
};

export const formatWithCurrency = (amount, currency = "XAF") => {
  const symbols = { XAF: "FCFA", EUR: "€", USD: "$" };
  const fmt = new Intl.NumberFormat("fr-FR").format(Math.round(amount));
  return `${fmt} ${symbols[currency] || currency}`;
};
