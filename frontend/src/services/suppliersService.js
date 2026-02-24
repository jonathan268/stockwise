import api from '../api/axios';

export const SupplierService = {
  getAllSuppliers: async (params = {}) => {
    const response = await api.get('api/v1/suppliers', { params });
    return response.data;
  },

  getSupplierById: async (id) => {
    const response = await api.get(`api/v1/suppliers/${id}`);
    return response.data;
  }
};