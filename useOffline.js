import { useState, useEffect } from 'react';

/**
 * Hook pour gérer l'état offline/online de l'application
 */
export const useOffline = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setWasOffline(isOffline);
      setIsOffline(false);
      console.log('📶 Connexion rétablie');
    };

    const handleOffline = () => {
      setIsOffline(true);
      console.log('📵 Connexion perdue');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOffline]);

  return { isOffline, wasOffline, isOnline: !isOffline };
};

export default useOffline;
