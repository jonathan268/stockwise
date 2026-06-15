import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X, Settings, CheckCircle } from "lucide-react";
import { useCookieStore } from "../store/cookieStore";
import CookiePreferencesModal from "./CookiePreferencesModal";

export default function CookieConsentBanner() {
  const { consent, acceptAll, refuseAll, openModal, modalOpen, closeModal } =
    useCookieStore();

  return (
    <>
      <AnimatePresence>
        {!consent && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-0 left-0 right-0 z-[9999] p-4 sm:p-6"
          >
            <div className="max-w-4xl mx-auto">
              <div className="relative bg-base-100 border border-base-content/10 rounded-2xl shadow-2xl p-5 sm:p-6 backdrop-blur-xl bg-base-100/95">
                <button
                  onClick={refuseAll}
                  className="absolute top-3 right-3 btn btn-ghost btn-xs btn-circle"
                  aria-label="Fermer"
                >
                  <X size={14} />
                </button>

                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Cookie size={20} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-sm sm:text-base mb-1">
                      Nous utilisons des cookies
                    </p>
                    <p className="text-xs sm:text-sm text-base-content/60 leading-relaxed">
                      StockWise utilise des cookies pour assurer le bon
                      fonctionnement du service et améliorer votre expérience.
                      Les cookies analytics ne sont activés qu'avec votre
                      consentement.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 sm:items-center shrink-0 w-full sm:w-auto">
                    <button
                      onClick={refuseAll}
                      className="btn btn-ghost btn-sm text-base-content/50 order-1 sm:order-none"
                    >
                      Refuser
                    </button>
                    <button
                      onClick={openModal}
                      className="btn btn-outline btn-sm gap-2 order-2 sm:order-none"
                    >
                      <Settings size={14} /> Personnaliser
                    </button>
                    <button
                      onClick={acceptAll}
                      className="btn btn-primary btn-sm gap-2 order-3 sm:order-none"
                    >
                      <CheckCircle size={14} /> Accepter tout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {consent && (
        <button
          onClick={openModal}
          className="fixed bottom-4 left-4 z-[9999] w-10 h-10 rounded-xl bg-base-100 border border-base-content/10 shadow-lg flex items-center justify-center text-base-content/50 hover:text-base-content hover:border-base-content/30 transition-all duration-300"
          title="Préférences cookies"
        >
          <Cookie size={16} />
        </button>
      )}

      <CookiePreferencesModal isOpen={modalOpen} onClose={closeModal} />
    </>
  );
}
