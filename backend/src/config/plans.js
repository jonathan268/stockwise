/**
 * Configuration des plans — source de vérité unique
 */
export const PLANS = {
  starter: {
    name: "Starter",
    price: 0,
    currency: "XAF",
    label: "Gratuit",
    features: {
      maxProducts: 100,
      maxUsers: 3,
      aiRecommendations: false,
      aiAlerts: false,
      exportReports: false,
      prioritySupport: false,
    },
  },
  pro: {
    name: "Pro",
    price: 9900,
    currency: "XAF",
    label: "9 900 XAF / mois",
    features: {
      maxProducts: Infinity,
      maxUsers: 10,
      aiRecommendations: true,
      aiAlerts: true,
      exportReports: true,
      prioritySupport: false,
    },
  },
  enterprise: {
    name: "Entreprise",
    price: null,
    currency: "XAF",
    label: "Sur devis",
    features: {
      maxProducts: Infinity,
      maxUsers: Infinity,
      aiRecommendations: true,
      aiAlerts: true,
      exportReports: true,
      prioritySupport: true,
    },
  },
};

// Features gated — nécessitent plan Pro ou trial actif
export const PRO_FEATURES = ["aiRecommendations", "aiAlerts", "exportReports"];
