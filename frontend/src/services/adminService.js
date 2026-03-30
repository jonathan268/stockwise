import api from "../api/axios";

/**
 * Service pour les opérations d'administration globale
 */
const adminService = {
  /**
   * Récupérer les statistiques globales de la plateforme
   */
  getPlatformStats: async () => {
    const response = await api.get("/api/v1/admin/stats");
    return response.data.data;
  },

  /**
   * Lister toutes les organisations
   * @param {Object} filters - Facultatif (status, search)
   */
  getAllOrganizations: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/api/v1/admin/organizations?${params.toString()}`);
    return response.data.data;
  },

  /**
   * Mettre à jour le statut d'une organisation
   */
  updateOrganizationStatus: async (id, status) => {
    const response = await api.patch(`/api/v1/admin/organizations/${id}/status`, { status });
    return response.data.data;
  },

  /**
   * Lister tous les utilisateurs de la plateforme
   */
  getAllUsers: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/api/v1/admin/users?${params.toString()}`);
    return response.data.data;
  },
};

export default adminService;
