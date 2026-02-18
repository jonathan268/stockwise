import { useState, useEffect } from "react";
import api from "../api/axios";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      if (token) {
        setIsAuthenticated(true);
        fetchCurrentUser();
      } else {
        setLoading(false);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get("/api/v1/auth/me");
      setUser(response.data.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Erreur de récupération de l'utilisateur:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setUser(null);
    setIsAuthenticated(false);
  };

  const refreshToken = async () => {
    try {
      const refreshTokenValue = localStorage.getItem("refreshToken");
      if (!refreshTokenValue) {
        throw new Error("No refresh token available");
      }

      const response = await api.post("/api/v1/auth/refresh-token", {
        refreshToken: refreshTokenValue,
      });

      const newAccessToken = response.data.data.accessToken;
      localStorage.setItem("token", newAccessToken);
      return newAccessToken;
    } catch (error) {
      console.error("Erreur lors du rafraîchissement du token:", error);
      logout();
      throw error;
    }
  };

  return {
    user,
    loading,
    isAuthenticated,
    error,
    logout,
    refreshToken,
    fetchCurrentUser,
  };
};
