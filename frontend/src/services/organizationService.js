import api from "../api/axios";

const OrganizationService = {
  // GET /api/v1/organizations
  getAll: async (params = {}) => {
    const response = await api.get("/api/v1/organizations", { params });
    return response.data;
  },

  // GET /api/v1/organizations/:id
  getById: async (id) => {
    const response = await api.get(`/api/v1/organizations/${id}`);
    return response.data;
  },

  // POST /api/v1/organizations
  create: async (organizationData) => {
    const response = await api.post("/api/v1/organizations", organizationData);
    return response.data;
  },

  // PUT /api/v1/organizations/:id
  update: async (id, organizationData) => {
    const response = await api.put(
      `/api/v1/organizations/${id}`,
      organizationData,
    );
    return response.data;
  },

  // DELETE /api/v1/organizations/:id
  delete: async (id) => {
    const response = await api.delete(`/api/v1/organizations/${id}`);
    return response.data;
  },

  // GET /api/v1/organizations/:id/members
  getMembers: async (id) => {
    const response = await api.get(`/api/v1/organizations/${id}/members`);
    return response.data;
  },

  // POST /api/v1/organizations/:id/members
  addMember: async (id, memberData) => {
    const response = await api.post(
      `/api/v1/organizations/${id}/members`,
      memberData,
    );
    return response.data;
  },

  // DELETE /api/v1/organizations/:id/members/:memberId
  removeMember: async (id, memberId) => {
    const response = await api.delete(
      `/api/v1/organizations/${id}/members/${memberId}`,
    );
    return response.data;
  },

  // GET /api/v1/organizations/:id/settings
  getSettings: async (id) => {
    const response = await api.get(`/api/v1/organizations/${id}/settings`);
    return response.data;
  },
};

export default OrganizationService;
