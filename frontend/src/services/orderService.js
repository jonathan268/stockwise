import api from '../api/axios';

export const OrderService = {
  // Récupérer toutes les commandes
  getAllOrders: async (params = {}) => {
    const response = await api.get('api/v1/orders', { params });
    return response.data;
  },

  // Récupérer une commande par ID
  getOrderById: async (id) => {
    const response = await api.get(`api/v1/orders/${id}`);
    return response.data;
  },

  // Créer une commande
  createOrder: async (orderData) => {
    const response = await api.post('api/v1/orders', orderData);
    return response.data;
  },

  // Mettre à jour une commande
  updateOrder: async (id, orderData) => {
    const response = await api.put(`api/v1/orders/${id}`, orderData);
    return response.data;
  },

  // Supprimer une commande
  deleteOrder: async (id) => {
    const response = await api.delete(`api/v1/orders/${id}`);
    return response.data;
  },

  // Mettre à jour le statut
  updateStatus: async (id, status, notes = '') => {
    const response = await api.patch(`api/v1/orders/${id}/status`, { status, notes });
    return response.data;
  },

  // Confirmer une commande
  confirmOrder: async (id) => {
    const response = await api.post(`api/v1/orders/${id}/confirm`);
    return response.data;
  },

  // Compléter une commande
  completeOrder: async (id) => {
    const response = await api.post(`api/v1/orders/${id}/complete`);
    return response.data;
  },

  // Annuler une commande
  cancelOrder: async (id, reason = '') => {
    const response = await api.post(`api/v1/orders/${id}/cancel`, { reason });
    return response.data;
  },

  // Enregistrer un paiement
  recordPayment: async (id, paymentData) => {
    const response = await api.patch(`api/v1/orders/${id}/payment`, paymentData);
    return response.data;
  },

  // Statistiques
  getOrderStats: async (params = {}) => {
    const response = await api.get('api/v1/orders/stats', { params });
    return response.data;
  },

  // Commandes d'achat
  getPurchaseOrders: async (params = {}) => {
    const response = await api.get('api/v1/orders/purchases', { params });
    return response.data;
  },

  // Commandes de vente
  getSalesOrders: async (params = {}) => {
    const response = await api.get('api/v1/orders/sales', { params });
    return response.data;
  }
};