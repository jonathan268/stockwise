import api from '../api/axios';

export const PredictionService = {
  // Récupérer toutes les prédictions
  getAllPredictions: async (params = {}) => {
    const response = await api.get('/api/v1/predictions', { params });
    return response.data;
  },

  // Récupérer une prédiction par ID
  getPredictionById: async (id) => {
    const response = await api.get(`/api/v1/predictions/${id}`);
    return response.data;
  },

  // Créer une nouvelle prédiction
  createPrediction: async (predictionData) => {
    const response = await api.post('/api/v1/predictions', predictionData);
    return response.data;
  },

  // Analyse rapide du stock
  analyzeStock: async () => {
    const response = await api.post('/api/v1/ai/analyze-stock');
    return response.data;
  },

  // Prédiction de demande pour un produit
  predictDemand: async (productId, timeframe = 'week') => {
    const response = await api.post('/api/v1/ai/predict-demand', {
      productId,
      timeframe
    });
    return response.data;
  },

  // Analyse combinée
  analyzeCombined: async () => {
    const response = await api.post('/api/v1/ai/analyze-combined');
    return response.data;
  },

  // Détection d'anomalies
  detectAnomalies: async () => {
    const response = await api.post('/api/v1/ai/detect-anomalies');
    return response.data;
  },

  // Optimisation des commandes
  optimizeOrders: async (budgetConstraint = null) => {
    const response = await api.post('/api/v1/ai/optimize-orders', {
      budgetConstraint
    });
    return response.data;
  },

  // Analyse du gaspillage
  analyzeWaste: async (startDate, endDate) => {
    const response = await api.post('/api/v1/ai/analyze-waste', {
      startDate,
      endDate
    });
    return response.data;
  },

  // Prompt personnalisé
  customPrompt: async (prompt, context = {}) => {
    const response = await api.post('/api/v1/ai/custom-prompt', {
      prompt,
      context
    });
    return response.data;
  },

  // Soumettre un feedback
  submitFeedback: async (predictionId, feedback) => {
    const response = await api.patch(`/api/v1/predictions/${predictionId}/feedback`, feedback);
    return response.data;
  },

  // Statistiques IA
  getAIStats: async () => {
    const response = await api.get('/api/v1/ai/stats');
    return response.data;
  },

  // Prédictions par type
  getPredictionsByType: async (type, params = {}) => {
    const response = await api.get(`/api/v1/predictions/by-type/${type}`, { params });
    return response.data;
  },

  // Prédictions par produit
  getPredictionsByProduct: async (productId) => {
    const response = await api.get(`/api/v1/predictions/by-product/${productId}`);
    return response.data;
  },

  // Générer rapport complet
  generateReport: async (period = '30d') => {
    const response = await api.post('/api/v1/ai/generate-report', { period });
    return response.data;
  }
};