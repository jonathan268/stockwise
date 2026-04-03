import axios from "axios";

// Configuration du baseURL selon l'environnement
const apiUrl = import.meta.env.MODE === "production" 
  ? import.meta.env.VITE_API_URL 
  : import.meta.env.VITE_API_LOCAL;

const api = axios.create({
  baseURL: apiUrl,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

const authApi = axios.create({
  baseURL: apiUrl,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Interceptor for handling token refresh on 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          // No refresh token, trigger auth-error event instead of hard redirect
          localStorage.removeItem("token");
          window.dispatchEvent(new Event("auth-error"));
          return Promise.reject(error);
        }

        const response = await authApi.post("/api/v1/auth/refresh-token", {
          refreshToken: refreshToken,
        });

        const { accessToken } = response.data.data;
        localStorage.setItem("token", accessToken);

        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, trigger auth-error event
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.dispatchEvent(new Event("auth-error"));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
