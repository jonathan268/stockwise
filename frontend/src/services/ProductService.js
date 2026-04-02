import api from "../api/axios";

const ProductService = {
  getAllProducts: async (params = {}) => {
    const response = await api.get("/api/v1/products", { params });
    return response.data;
  },

  getProductById: async (id) => {
    const response = await api.get(`/api/v1/products/${id}`);
    return response.data;
  },

  addProduct: async (productData) => {
    const response = await api.post("/api/v1/products", productData);
    return response.data;
  },

  updateProduct: async (id, productData) => {
    const response = await api.put(`/api/v1/products/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`/api/v1/products/${id}`);
    return response.data;
  },

  // Additional endpoints
  searchProducts: async (query, params = {}) => {
    const response = await api.get("/api/v1/products/search", {
      params: { q: query, ...params },
    });
    return response.data;
  },

  getLowStockProducts: async (params = {}) => {
    const response = await api.get("/api/v1/products/low-stock", { params });
    return response.data;
  },

  getByCategory: async (categoryId, params = {}) => {
    const response = await api.get(`/api/v1/products/category/${categoryId}`, {
      params,
    });
    return response.data;
  },

  bulkImport: async (importData) => {
    const response = await api.post("/api/v1/products/bulk-import", importData);
    return response.data;
  },

  exportProducts: async (format = "csv", params = {}) => {
    const response = await api.get("/api/v1/products/export", {
      params: { format, ...params },
    });
    return response.data;
  },

  toggleStatus: async (id, status) => {
    const response = await api.patch(`/api/v1/products/${id}/status`, {
      status,
    });
    return response.data;
  },

  duplicateProduct: async (id, productData = {}) => {
    const response = await api.post(
      `/api/v1/products/${id}/duplicate`,
      productData,
    );
    return response.data;
  },
};

export default ProductService;
