import api from "../api/axios";

const StockService = {
  // GET /api/v1/stock
  getAll: async (params = {}) => {
    const response = await api.get("/api/v1/stock", { params });
    return response.data;
  },

  // GET /api/v1/stock/:id
  getById: async (id) => {
    const response = await api.get(`/api/v1/stock/${id}`);
    return response.data;
  },

  // PUT /api/v1/stock/:id
  update: async (id, stockData) => {
    const response = await api.put(`/api/v1/stock/${id}`, stockData);
    return response.data;
  },

  // POST /api/v1/stock/transfer
  transfer: async (transferData) => {
    const response = await api.post("/api/v1/stock/transfer", transferData);
    return response.data;
  },

  // GET /api/v1/stock/movement
  getMovement: async (params = {}) => {
    const response = await api.get("/api/v1/stock/movement", { params });
    return response.data;
  },

  // POST /api/v1/stock/adjustment
  adjustment: async (adjustmentData) => {
    const response = await api.post("/api/v1/stock/adjustment", adjustmentData);
    return response.data;
  },

  // GET /api/v1/stock/alerts
  getAlerts: async (params = {}) => {
    const response = await api.get("/api/v1/stock/alerts", { params });
    return response.data;
  },

  // POST /api/v1/stock/batch-update
  batchUpdate: async (updates) => {
    const response = await api.post("/api/v1/stock/batch-update", { updates });
    return response.data;
  },

  // GET /api/v1/stock/export
  export: async (format = "csv") => {
    const response = await api.get("/api/v1/stock/export", {
      params: { format },
    });
    return response.data;
  },

  // GET /api/v1/stock/analyze
  analyze: async (params = {}) => {
    const response = await api.get("/api/v1/stock/analyze", { params });
    return response.data;
  },

  // GET /api/v1/stock/low-stock
  getLowStock: async () => {
    const response = await api.get("/api/v1/stock/low-stock");
    return response.data;
  },
};

export default StockService;
