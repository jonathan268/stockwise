import api from "../api/axios";

const AnalyticsService = {
  // GET /api/v1/analytics/overview
  getOverview: async (params = {}) => {
    const response = await api.get("/api/v1/analytics/overview", { params });
    return response.data;
  },

  // GET /api/v1/analytics/sales-trends
  getSalesTrends: async (params = {}) => {
    const response = await api.get("/api/v1/analytics/sales-trends", {
      params,
    });
    return response.data;
  },

  // GET /api/v1/analytics/product-performance
  getProductPerformance: async (params = {}) => {
    const response = await api.get("/api/v1/analytics/product-performance", {
      params,
    });
    return response.data;
  },

  // GET /api/v1/analytics/inventory-health
  getInventoryHealth: async (params = {}) => {
    const response = await api.get("/api/v1/analytics/inventory-health", {
      params,
    });
    return response.data;
  },

  // GET /api/v1/analytics/supplier-analysis
  getSupplierAnalysis: async (params = {}) => {
    const response = await api.get("/api/v1/analytics/supplier-analysis", {
      params,
    });
    return response.data;
  },

  // GET /api/v1/analytics/revenue
  getRevenue: async (params = {}) => {
    const response = await api.get("/api/v1/analytics/revenue", { params });
    return response.data;
  },

  // GET /api/v1/analytics/report
  generateReport: async (reportData) => {
    const response = await api.post("/api/v1/analytics/report", reportData);
    return response.data;
  },
};

export default AnalyticsService;
