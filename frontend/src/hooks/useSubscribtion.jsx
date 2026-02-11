import { useState, useEffect } from 'react';
import axios from 'axios';

export const useSubscription = () => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await axios.get('/api/subscriptions/my-subscription');
      setSubscription(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const hasFeature = (featureName) => {
    return subscription?.planId?.features?.[featureName] || false;
  };

  const isActive = () => {
    return subscription?.status === 'active';
  };

  return { subscription, loading, error, hasFeature, isActive, refetch: fetchSubscription };
};