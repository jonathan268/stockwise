import React from 'react';
import { WifiOff, Wifi, CloudOff, RefreshCw } from 'lucide-react';
import useOffline from '../hooks/useOffline';

const OfflineIndicator = ({ onSync }) => {
  const { isOffline, wasOffline } = useOffline();

  if (!isOffline && !wasOffline) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] animate-bounce-in">
      {isOffline ? (
        <div className="alert alert-warning shadow-2xl border border-warning/50 backdrop-blur-md bg-warning/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning rounded-lg">
              <WifiOff size={20} className="text-warning-content" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Mode Hors Ligne</h3>
              <div className="text-[10px] opacity-70">
                Vos modifications seront synchronisées automatiquement
              </div>
            </div>
          </div>
        </div>
      ) : wasOffline ? (
        <div className="alert alert-success shadow-2xl border border-success/50 backdrop-blur-md bg-success/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success rounded-lg animate-pulse">
              <Wifi size={20} className="text-success-content" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Connexion Rétablie</h3>
              <div className="text-[10px] opacity-70">Synchronisation en cours...</div>
            </div>
            {onSync && (
              <button
                className="btn btn-xs btn-circle btn-ghost"
                onClick={onSync}
              >
                <RefreshCw size={14} />
              </button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default OfflineIndicator;
