import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);

  const fetchCurrentUser = useCallback(async () => {
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
  }, []);

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
  }, [fetchCurrentUser]);

  // Écouter les erreurs d'authentification globales (ex: token expiré sans refresh token)
  useEffect(() => {
    const handleAuthError = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      setIsAuthenticated(false);
      setUser(null);
      setLoading(false);
    };

    window.addEventListener("auth-error", handleAuthError);
    return () => window.removeEventListener("auth-error", handleAuthError);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setUser(null);
    setIsAuthenticated(false);
    // Rediriger vers la page de login
    window.location.href = "/auth/login";
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
    isSuperAdmin: user?.role === "superadmin",
    error,
    logout,
    refreshToken,
    fetchCurrentUser,
  };
};
