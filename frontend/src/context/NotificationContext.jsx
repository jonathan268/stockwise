import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import apiClient from "../api/axios";
import toast from "react-hot-toast";

/**
 * NotificationContext - Gestion des notifications utilisateur
 * Gère les notifications en temps réel via WebSocket et les notifications stockées
 */
const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [ws, setWs] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Récupère les notifications stockées
  const fetchNotifications = useCallback(async (limit = 50) => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/notifications?limit=${limit}`);
      setNotifications(response.data.data || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (err) {
      console.error("Erreur fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Connecte WebSocket pour les notifications en temps réel
  const connectWebSocket = useCallback(() => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const wsUrl = `${import.meta.env.VITE_WS_URL || "ws://localhost:5000"}/api/notifications/subscribe?token=${token}`;
      const websocket = new WebSocket(wsUrl);

      websocket.onopen = () => {
        setIsConnected(true);
      };

      websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "notification") {
          // Ajoute la nouvelle notification au début de la liste
          setNotifications((prev) => [data.payload, ...prev]);
          setUnreadCount((prev) => prev + 1);
          toast.success(data.payload.message || "Nouvelle notification");
        }
      };

      websocket.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsConnected(false);
      };

      websocket.onclose = () => {
        setIsConnected(false);
        // Tente une reconnexion après 5 secondes
        setTimeout(() => connectWebSocket(), 5000);
      };

      setWs(websocket);
    } catch (err) {
      console.error("WebSocket connection error:", err);
    }
  }, []);

  // Récupère et connecte au démarrage
  useEffect(() => {
    fetchNotifications();
    connectWebSocket();

    return () => {
      if (ws) ws.close();
    };
  }, [fetchNotifications, connectWebSocket, ws]);

  // Marque une notification comme lue
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await apiClient.patch(`/api/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Erreur marquer comme lue:", err);
    }
  }, []);

  // Marque toutes les notifications comme lues
  const markAllAsRead = useCallback(async () => {
    try {
      await apiClient.post("/api/notifications/mark-all-read");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success("Toutes les notifications marquées comme lues");
    } catch (err) {
      toast.error("Erreur lors de la mise à jour");
    }
  }, []);

  // Supprime une notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await apiClient.delete(`/api/notifications/${notificationId}`);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (err) {
      console.error("Erreur suppression notification:", err);
    }
  }, []);

  // Supprime toutes les notifications
  const deleteAllNotifications = useCallback(async () => {
    try {
      await apiClient.post("/api/notifications/delete-all");
      setNotifications([]);
      setUnreadCount(0);
      toast.success("Toutes les notifications supprimées");
    } catch (err) {
      toast.error("Erreur lors de la suppression");
    }
  }, []);

  // Met à jour les paramètres de notification de l'utilisateur
  const updateNotificationSettings = useCallback(async (settings) => {
    try {
      await apiClient.put("/api/notification-settings", settings);
      toast.success("Paramètres mis à jour");
    } catch (err) {
      toast.error("Erreur lors de la mise à jour");
    }
  }, []);

  const value = {
    notifications,
    unreadCount,
    loading,
    isConnected,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    updateNotificationSettings,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

/**
 * Hook pour utiliser le contexte de notifications
 */
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within NotificationProvider",
    );
  }
  return context;
};
