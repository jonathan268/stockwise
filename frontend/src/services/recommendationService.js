import api from "../api/axios";

const RecommendationService = {
  // GET /api/v1/recommendations/reorder
  getReorderRecommendations: async (params = {}) => {
    const response = await api.get("/api/v1/recommendations/reorder", {
      params,
    });
    return response.data;
  },

  // GET /api/v1/recommendations/discontinue
  getDiscontinueRecommendations: async (params = {}) => {
    const response = await api.get("/api/v1/recommendations/discontinue", {
      params,
    });
    return response.data;
  },

  // GET /api/v1/recommendations/low-stock
  getLowStockRecommendations: async (params = {}) => {
    const response = await api.get("/api/v1/recommendations/low-stock", {
      params,
    });
    return response.data;
  },

  // GET /api/v1/recommendations/high-value
  getHighValueProducts: async (params = {}) => {
    const response = await api.get("/api/v1/recommendations/high-value", {
      params,
    });
    return response.data;
  },

  // GET /api/v1/recommendations/supplier
  getSupplierRecommendations: async (params = {}) => {
    const response = await api.get("/api/v1/recommendations/supplier", {
      params,
    });
    return response.data;
  },

  // POST /api/v1/recommendations/optimal-order
  getOptimalOrderQuantity: async (productData) => {
    const response = await api.post(
      "/api/v1/recommendations/optimal-order",
      productData,
    );
    return response.data;
  },
};

export default RecommendationService;
