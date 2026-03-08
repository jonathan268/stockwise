import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

/**
 * Wrapper PWA pour gérer l'installation et les mises à jour
 */
const PWAWrapper = ({ children }) => {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState(null);

  useEffect(() => {
    // Gérer l'événement d'installation
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPromptEvent(e);
      setShowInstallPrompt(true);
    };

    // Gérer les mises à jour du Service Worker
    const handleServiceWorkerUpdate = (registration) => {
      const worker = registration.waiting || registration.installing;
      if (worker) {
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) {
            setWaitingWorker(worker);
            setShowUpdatePrompt(true);
          }
        });
      }
    };

    // Enregistrer le Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('✅ Service Worker enregistré');
          handleServiceWorkerUpdate(registration);

          // Vérifier les mises à jour toutes les heures
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000);
        })
        .catch((error) => {
          console.error('❌ Erreur Service Worker:', error);
        });
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

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
      console.log('✅ PWA installée');
    }

    setShowInstallPrompt(false);
    setInstallPromptEvent(null);
  };

  // Mettre à jour le Service Worker
  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  return (
    <>
      {children}

      {/* Prompt d'installation */}
      {showInstallPrompt && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-slide-up">
          <div className="alert alert-info shadow-lg">
            <div className="flex-1">
              <Download size={24} />
              <div>
                <h3 className="font-bold">Installer l'application</h3>
                <div className="text-xs">
                  Accédez à StockWise hors ligne et plus rapidement
                </div>
              </div>
            </div>
            <div className="flex-none">
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => setShowInstallPrompt(false)}
              >
                <X size={16} />
              </button>
              <button
                className="btn btn-sm btn-primary"
                onClick={handleInstall}
              >
                Installer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prompt de mise à jour */}
      {showUpdatePrompt && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
          <div className="alert alert-success shadow-lg">
            <div className="flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current flex-shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h3 className="font-bold">Mise à jour disponible</h3>
                <div className="text-xs">
                  Une nouvelle version est prête à être installée
                </div>
              </div>
              <button
                className="btn btn-sm btn-primary"
                onClick={handleUpdate}
              >
                Mettre à jour
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PWAWrapper;
