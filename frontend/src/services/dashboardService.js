import api from "../api/axios";

export const DashboardService = {
  // Récupérer les statistiques globales
  getStats: async () => {
    const response = await api.get("/api/v1/dashboard/stats");
    return response.data;
  },

  // Récupérer les alertes de stock
  getStockAlerts: async (params = {}) => {
    const response = await api.get("/api/v1/dashboard/alerts", { params });
    return response.data;
  },

  // Récupérer les activités récentes
  getRecentActivity: async (limit = 10) => {
    const response = await api.get("/api/v1/dashboard/activity", {
      params: { limit },
    });
    return response.data;
  },

  // Récupérer les produits les plus actifs
  getTopProducts: async (limit = 5) => {
    const response = await api.get("/api/v1/dashboard/top-products", {
      params: { limit },
    });
    return response.data;
  },

  // Récupérer les insights IA
  getAIInsights: async () => {
    const response = await api.get("/api/v1/dashboard/ai-insights");
    return response.data;
  },

  // Récupérer le résumé complet du dashboard (inclut analytics)
  getAnalytics: async (period = "7d") => {
    const response = await api.get("/api/v1/analytics", {
      params: { period },
    });
    return response.data;
  },

  // Récupérer le résumé complet du dashboard
  getDashboardSummary: async () => {
    const response = await api.get("/api/v1/dashboard/summary");
    return response.data;
  },

  // Récupérer les statistiques du dashboard
  getDashboardStats: async () => {
    const response = await api.get("/api/v1/dashboard/stats");
    return response.data;
  },
};
