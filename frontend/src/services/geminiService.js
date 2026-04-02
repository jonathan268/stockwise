import api from "../api/axios";

const GeminiService = {
  // POST /api/v1/gemini/analyze-combined
  analyzeCombined: async (analysisData) => {
    const response = await api.post(
      "/api/v1/gemini/analyze-combined",
      analysisData,
    );
    return response.data;
  },

  // POST /api/v1/gemini/selective-analysis
  selectiveAnalysis: async (analysisData) => {
    const response = await api.post(
      "/api/v1/gemini/selective-analysis",
      analysisData,
    );
    return response.data;
  },

  // POST /api/v1/gemini/anomaly-detection
  detectAnomalies: async (detectionData) => {
    const response = await api.post(
      "/api/v1/gemini/anomaly-detection",
      detectionData,
    );
    return response.data;
  },

  // POST /api/v1/gemini/demand-forecast
  forecastDemand: async (forecastData) => {
    const response = await api.post(
      "/api/v1/gemini/demand-forecast",
      forecastData,
    );
    return response.data;
  },

  // POST /api/v1/gemini/optimization-plan
  generateOptimizationPlan: async (optimizationData) => {
    const response = await api.post(
      "/api/v1/gemini/optimization-plan",
      optimizationData,
    );
    return response.data;
  },

  // POST /api/v1/gemini/nlp-query
  queryNLP: async (queryData) => {
    const response = await api.post("/api/v1/gemini/nlp-query", queryData);
    return response.data;
  },

  // POST /api/v1/gemini/insight-generation
  generateInsights: async (insightData) => {
    const response = await api.post(
      "/api/v1/gemini/insight-generation",
      insightData,
    );
    return response.data;
  },

  // POST /api/v1/gemini/scenario-planning
  planScenarios: async (scenarioData) => {
    const response = await api.post(
      "/api/v1/gemini/scenario-planning",
      scenarioData,
    );
    return response.data;
  },

  // POST /api/v1/gemini/supplier-recommendation
  recommendSuppliers: async (supplierData) => {
    const response = await api.post(
      "/api/v1/gemini/supplier-recommendation",
      supplierData,
    );
    return response.data;
  },

  // POST /api/v1/gemini/bulk-analyze
  bulkAnalyze: async (bulkData) => {
    const response = await api.post("/api/v1/gemini/bulk-analyze", bulkData);
    return response.data;
  },
};

export default GeminiService;
