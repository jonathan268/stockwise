import React, { useEffect, useState } from 'react';
import { Download, X, RefreshCcw } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import OfflineIndicator from './OfflineIndicator';

/**
 * Wrapper PWA pour gérer l'installation et les mises à jour
 * Utilisant vite-plugin-pwa
 */
const PWAWrapper = ({ children }) => {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [installPromptEvent, setInstallPromptEvent] = useState(null);

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r);
      // Vérifier les mises à jour périodiquement (toutes les heures)
      r && setInterval(() => {
        r.update();
      }, 60 * 60 * 1000);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  useEffect(() => {
    // Gérer l'événement d'installation chrome-only
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPromptEvent(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Détecter si l'app est déjà installée
    window.addEventListener('appinstalled', (evt) => {
      console.log('StockWise a été installé avec succès');
      setShowInstallPrompt(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Installer la PWA
  const handleInstall = async () => {
    if (!installPromptEvent) return;

    installPromptEvent.prompt();
    const { outcome } = await installPromptEvent.userChoice;

    if (outcome === 'accepted') {
      console.log('Utilisateur a accepté l\'installation');
    }

    setShowInstallPrompt(false);
    setInstallPromptEvent(null);
  };

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  return (
    <>
      <OfflineIndicator />
      {children}

      {/* Prompt d'installation */}
      {showInstallPrompt && (
        <div className="fixed z-[9999] max-w-sm bottom-6 right-6 animate-slide-up">
          <div className="card shadow-2xl bg-base-100 border border-primary/20 backdrop-blur-lg">
            <div className="card-body p-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                  <Download size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm">Installer StockWise</h3>
                  <p className="text-xs opacity-70">
                    Accédez à vos stocks plus rapidement et même sans connexion.
                  </p>
                </div>
                <button
                  className="btn btn-xs btn-circle btn-ghost"
                  onClick={() => setShowInstallPrompt(false)}
                >
                  <X size={16} />
                </button>
              </div>
              <div className="card-actions justify-end mt-2">
                <button
                  className="btn btn-sm btn-primary"
                  onClick={handleInstall}
                >
                  Installer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prompt de mise à jour / Offline Ready */}
      {(offlineReady || needRefresh) && (
        <div className="fixed z-[10000] bottom-6 left-6 animate-slide-up">
          <div className="alert shadow-2xl bg-base-100 border border-success/20 py-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg text-success">
                {needRefresh ? <RefreshCcw size={20} /> : <Download size={20} />}
              </div>
              <div>
                <h3 className="font-bold text-sm">
                  {needRefresh ? 'Mise à jour disponible' : 'Prêt pour le mode hors ligne'}
                </h3>
                <p className="text-[10px] opacity-70">
                  {needRefresh 
                    ? 'Une nouvelle version est prête.' 
                    : 'L\'application est maintenant disponible hors ligne.'}
                </p>
              </div>
              <div className="flex gap-2 ml-4">
                {needRefresh && (
                  <button
                    className="btn btn-xs btn-primary"
                    onClick={() => updateServiceWorker(true)}
                  >
                    Mettre à jour
                  </button>
                )}
                <button
                  className="btn btn-xs btn-ghost"
                  onClick={close}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PWAWrapper;
