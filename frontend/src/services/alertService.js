import api from '../api/axios';

export const AlertService = {
  // Récupérer toutes les alertes
  getAllAlerts: async (params = {}) => {
    const response = await api.get('api/v1/alerts', { params });
    return response.data;
  },

  // Récupérer alertes non lues
  getUnreadAlerts: async () => {
    const response = await api.get('api/v1/alerts/unread');
    return response.data;
  },

  // Récupérer le nombre d'alertes
  getAlertsCount: async () => {
    const response = await api.get('api/v1/alerts/count');
    return response.data;
  },

  // Récupérer une alerte par ID
  getAlertById: async (id) => {
    const response = await api.get(`api/v1/alerts/${id}`);
    return response.data;
  },

  // Marquer comme lue
  markAsRead: async (id) => {
    const response = await api.patch(`api/v1/alerts/${id}/read`);
    return response.data;
  },

  // Marquer toutes comme lues
  markAllAsRead: async () => {
    const response = await api.patch('api/v1/alerts/read-all');
    return response.data;
  },

  // Rejeter une alerte
  dismissAlert: async (id) => {
    const response = await api.patch(`api/v1/alerts/${id}/dismiss`);
    return response.data;
  },

  // Supprimer une alerte
  deleteAlert: async (id) => {
    const response = await api.delete(`api/v1/alerts/${id}`);
    return response.data;
  },

  // Supprimer toutes les alertes
  clearAllAlerts: async (olderThan = null) => {
    const params = olderThan ? { olderThan } : {};
    const response = await api.delete('api/v1/alerts/clear-all', { params });
    return response.data;
  },

  // Alertes par type
  getAlertsByType: async (type) => {
    const response = await api.get(`api/v1/alerts/by-type/${type}`);
    return response.data;
  },

  // Alertes par sévérité
  getAlertsBySeverity: async (severity) => {
    const response = await api.get(`api/v1/alerts/by-severity/${severity}`);
    return response.data;
  },

  // Paramètres de notifications
  getNotificationSettings: async () => {
    const response = await api.get('api/v1/alerts/settings');
    return response.data;
  },

  updateNotificationSettings: async (settings) => {
    const response = await api.put('api/v1/alerts/settings', settings);
    return response.data;
  }
};