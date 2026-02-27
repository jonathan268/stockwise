import api from "../api/axios";

export const CategoryService = {
  getAllCategories: async () => {
    const response = await api.get("/api/v1/categories");
    return response.data;
  },

  getCategoryById: async (id) => {
    const response = await api.get(`/api/v1/categories/${id}`);
    return response.data;
  },

  addCategory: async (categoryData) => {
    const response = await api.post("/api/v1/categories", categoryData);
    return response.data;
  },

  updateCategory: async (id, categoryData) => {
    const response = await api.put(`/api/v1/categories/${id}`, categoryData);
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await api.delete(`/api/v1/categories/${id}`);
    return response.data;
  },

  getSubcategories: async (id) => {
    const response = await api.get(`/api/v1/categories/${id}/subcategories`);
    return response.data;
  },
};
