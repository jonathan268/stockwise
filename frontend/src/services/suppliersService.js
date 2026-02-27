import api from "../api/axios";

export const SupplierService = {
  // Récupérer tous les fournisseurs
  getAllSuppliers: async (params = {}) => {
    try {
      const response = await api.get("/api/v1/suppliers", { params });
      return response.data;
    } catch (error) {
      console.error("Status:", error.response?.status);
      console.error("Data:", error.response?.data); // ← ici le vrai message d'erreur
      throw error;
    }
  },

  // Récupérer un fournisseur par ID
  getSupplierById: async (id) => {
    const response = await api.get(`/api/v1/suppliers/${id}`);
    return response.data;
  },

  // Créer un fournisseur
  createSupplier: async (supplierData) => {
    const response = await api.post("/api/v1/suppliers", supplierData);
    return response.data;
  },

  // Mettre à jour un fournisseur
  updateSupplier: async (id, supplierData) => {
    const response = await api.put(`/api/v1/suppliers/${id}`, supplierData);
    return response.data;
  },

  // Supprimer un fournisseur
  deleteSupplier: async (id) => {
    const response = await api.delete(`/api/v1/suppliers/${id}`);
    return response.data;
  },

  // Mettre à jour le rating (utilise PUT, pas PATCH)
  updateRating: async (id, ratings) => {
    const response = await api.put(`/api/v1/suppliers/${id}/rating`, ratings);
    return response.data;
  },

  // Récupérer la performance du fournisseur
  getPerformance: async (id) => {
    const response = await api.get(`/api/v1/suppliers/${id}/performance`);
    return response.data;
  },

  // Top fournisseurs
  getTopSuppliers: async (limit = 10) => {
    const response = await api.get("/api/v1/suppliers/top", {
      params: { limit },
    });
    return response.data;
  },

  // Produits d'un fournisseur
  getSupplierProducts: async (id) => {
    const response = await api.get(`/api/v1/suppliers/${id}/products`);
    return response.data;
  },

  // Commandes d'un fournisseur
  getSupplierOrders: async (id, params = {}) => {
    const response = await api.get(`/api/v1/suppliers/${id}/orders`, {
      params,
    });
    return response.data;
  },
};
