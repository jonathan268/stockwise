import api from "../api/axios";

const AuthService = {
  // POST /api/v1/auth/register
  register: async (userData) => {
    const response = await api.post("/api/v1/auth/register", userData);
    return response.data;
  },

  // POST /api/v1/auth/login
  login: async (credentials) => {
    const response = await api.post("/api/v1/auth/login", credentials);
    return response.data;
  },

  // POST /api/v1/auth/logout
  logout: async () => {
    const response = await api.post("/api/v1/auth/logout");
    return response.data;
  },

  // POST /api/v1/auth/refresh-token
  refreshToken: async () => {
    const response = await api.post("/api/v1/auth/refresh-token");
    return response.data;
  },

  // POST /api/v1/auth/forgot-password
  forgotPassword: async (email) => {
    const response = await api.post("/api/v1/auth/forgot-password", { email });
    return response.data;
  },

  // POST /api/v1/auth/reset-password
  resetPassword: async (resetData) => {
    const response = await api.post("/api/v1/auth/reset-password", resetData);
    return response.data;
  },

  // GET /api/v1/auth/verify-email
  verifyEmail: async (token) => {
    const response = await api.get("/api/v1/auth/verify-email", {
      params: { token },
    });
    return response.data;
  },

  // POST /api/v1/auth/resend-verification
  resendVerification: async (email) => {
    const response = await api.post("/api/v1/auth/resend-verification", {
      email,
    });
    return response.data;
  },

  // POST /api/v1/auth/google
  googleAuth: async (token) => {
    const response = await api.post("/api/v1/auth/google", { token });
    return response.data;
  },
};

export default AuthService;
