import { useState, useEffect } from "react";
import api from "../api/axios";

export const useSubscription = () => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await api.get("/api/v1/subscriptions/my-subscription");
      setSubscription(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  const hasFeature = (featureName) => {
    return subscription?.planId?.features?.[featureName] || false;
  };

  const isActive = () => {
    return subscription?.status === "active";
  };

  return {
    subscription,
    loading,
    error,
    hasFeature,
    isActive,
    refetch: fetchSubscription,
  };
};
