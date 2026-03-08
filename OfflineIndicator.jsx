import React from 'react';
import { WifiOff, Wifi, CloudOff, RefreshCw } from 'lucide-react';
import useOffline from '../hooks/useOffline';

const OfflineIndicator = ({ onSync }) => {
  const { isOffline, wasOffline } = useOffline();

  if (!isOffline && !wasOffline) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
      {isOffline ? (
        <div className="alert alert-warning shadow-lg">
          <div className="flex items-center gap-3">
            <WifiOff size={24} />
            <div>
              <h3 className="font-bold">Mode Hors Ligne</h3>
              <div className="text-xs">
                Vos modifications seront synchronisées automatiquement
              </div>
            </div>
          </div>
        </div>
      ) : wasOffline ? (
        <div className="alert alert-success shadow-lg">
          <div className="flex items-center gap-3">
            <Wifi size={24} />
            <div>
              <h3 className="font-bold">Connexion Rétablie</h3>
              <div className="text-xs">Synchronisation en cours...</div>
            </div>
            {onSync && (
              <button
                className="btn btn-sm btn-ghost"
                onClick={onSync}
              >
                <RefreshCw size={16} />
              </button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default OfflineIndicator;
