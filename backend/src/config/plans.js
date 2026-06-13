/**
 * Configuration des plans — source de vérité unique
 */
export const PLANS = {
  starter: {
    name: "Starter",
    price: 9900,
    currency: "XAF",
    label: "9 900 XAF / mois",
    features: {
      maxProducts: 100,
      maxUsers: 3,
      aiRecommendations: false,
      aiAlerts: false,
      exportReports: false,
      prioritySupport: false,
      invoices: true,
      csvExports: false,
    },
  },
  pro: {
    name: "Pro",
    price: 14900,
    currency: "XAF",
    label: "14 900 XAF / mois",
    features: {
      maxProducts: Infinity,
      maxUsers: 10,
      aiRecommendations: true,
      aiAlerts: true,
      exportReports: true,
      prioritySupport: false,
      invoices: true,
      csvExports: true,
    },
  },
  enterprise: {
    name: "Entreprise",
    price: 29900,
    currency: "XAF",
    label: "29 900 XAF / mois",
    features: {
      maxProducts: Infinity,
      maxUsers: Infinity,
      aiRecommendations: true,
      aiAlerts: true,
      exportReports: true,
      prioritySupport: true,
      invoices: true,
      csvExports: true,
    },
  },
};

// Features gated — nécessitent plan Pro+ ou trial actif
export const PRO_FEATURES = ["aiRecommendations", "aiAlerts", "exportReports", "csvExports"];
