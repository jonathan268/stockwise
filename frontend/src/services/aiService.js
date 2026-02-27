import api from "../api/axios";

export const aiService = {
  getAllAnalytics: async (params = {}) => {
    const response = await api.get("/api/v1/ai/predictions", { params });
    return response.data;
  },

  // Prédiction de demande
  predictDemand: async (productId, timeframe = "week") => {
    const response = await api.post("/api/v1/ai/predict-demand", {
      productId,
      timeframe,
    });
    return response.data;
  },

  // Optimisation du stock
  optimizeStock: async () => {
    const response = await api.post("/api/v1/ai/optimize-stock");
    return response.data;
  },

  // Détection des anomalies
  detectAnomalies: async () => {
    const response = await api.post("/api/v1/ai/detect-anomalies");
    return response.data;
  },

  // Poser une question
  askQuestion: async (question) => {
    const response = await api.post("/api/v1/ai/ask", { question });
    return response.data;
  },

  // Générer des insights
  generateInsights: async () => {
    const response = await api.post("/api/v1/ai/insights");
    return response.data;
  },
};
