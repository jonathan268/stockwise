import api from "../api/axios";

const UserService = {
  // GET /api/v1/users/me
  getCurrentUser: async () => {
    const response = await api.get("/api/v1/users/me");
    return response.data;
  },

  // PUT /api/v1/users/me
  updateProfile: async (userData) => {
    const response = await api.put("/api/v1/users/me", userData);
    return response.data;
  },

  // POST /api/v1/users/change-password
  changePassword: async (passwordData) => {
    const response = await api.post(
      "/api/v1/users/change-password",
      passwordData,
    );
    return response.data;
  },

  // GET /api/v1/users
  getAll: async (params = {}) => {
    const response = await api.get("/api/v1/users", { params });
    return response.data;
  },

  // GET /api/v1/users/:id
  getById: async (id) => {
    const response = await api.get(`/api/v1/users/${id}`);
    return response.data;
  },

  // POST /api/v1/users
  create: async (userData) => {
    const response = await api.post("/api/v1/users", userData);
    return response.data;
  },

  // PUT /api/v1/users/:id
  update: async (id, userData) => {
    const response = await api.put(`/api/v1/users/${id}`, userData);
    return response.data;
  },

  // DELETE /api/v1/users/:id
  delete: async (id) => {
    const response = await api.delete(`/api/v1/users/${id}`);
    return response.data;
  },
};

export default UserService;
