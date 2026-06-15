import { motion, AnimatePresence } from "framer-motion";
import { Cookie, Shield, Settings, Info, CheckCircle, X, XCircle } from "lucide-react";
import { useCookieStore } from "../store/cookieStore";

const categories = [
  {
    id: "required",
    icon: Shield,
    title: "Cookies nécessaires",
    required: true,
    desc: "Essentiels au fonctionnement de la plateforme (session, authentification, sécurité).",
  },
  {
    id: "analytics",
    icon: Settings,
    title: "Cookies analytics",
    required: false,
    desc: "Nous aident à comprendre l'utilisation du service pour l'améliorer (données anonymisées).",
  },
  {
    id: "preferences",
    icon: Info,
    title: "Cookies de préférences",
    required: false,
    desc: "Mémorisent vos choix (langue, thème, paramètres d'affichage).",
  },
];

export default function CookiePreferencesModal({ isOpen, onClose }) {
  const { preferences, updatePreferences, acceptAll, acceptSelected, refuseAll } =
    useCookieStore();

  const handleToggle = (id) => {
    if (id === "required") return;
    updatePreferences({ [id]: !preferences[id] });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative bg-base-100 rounded-2xl shadow-2xl border border-base-content/10 w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Cookie size={22} className="text-primary" />
                  <h2 className="font-display font-bold text-xl">
                    Préférences cookies
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="btn btn-ghost btn-sm btn-circle"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-sm text-base-content/60 leading-relaxed">
                Gérez vos préférences de cookies. Les cookies nécessaires
                sont toujours actifs. Vous pouvez modifier vos choix à tout
                moment.
              </p>

              <div className="space-y-3">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-start justify-between gap-4 p-4 rounded-xl bg-base-200/30 border border-base-content/5"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <cat.icon size={17} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-display font-semibold text-sm flex items-center gap-2">
                          {cat.title}
                          {cat.required && (
                            <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                              Toujours actif
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-base-content/60 mt-1 leading-relaxed">
                          {cat.desc}
                        </p>
                      </div>
                    </div>
                    <div className="relative shrink-0 mt-1">
                      <input
                        type="checkbox"
                        id={`cookie-${cat.id}`}
                        disabled={cat.required}
                        checked={preferences[cat.id]}
                        onChange={() => handleToggle(cat.id)}
                        className="sr-only"
                      />
                      <label
                        htmlFor={`cookie-${cat.id}`}
                        className={`block w-11 h-6 rounded-full cursor-pointer transition-colors duration-200 ${
                          preferences[cat.id] ? "bg-primary" : "bg-base-300"
                        }`}
                      >
                        <span
                          className={`block w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                            preferences[cat.id]
                              ? "translate-x-[1.375rem]"
                              : "translate-x-0.5"
                          } mt-0.5`}
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  onClick={() => {
                    acceptSelected(preferences);
                    onClose();
                  }}
                  className="btn btn-primary btn-sm flex-1 gap-2"
                >
                  <CheckCircle size={14} /> Enregistrer
                </button>
                <button
                  onClick={() => {
                    acceptAll();
                    onClose();
                  }}
                  className="btn btn-outline btn-sm flex-1 gap-2"
                >
                  <CheckCircle size={14} /> Tout accepter
                </button>
                <button
                  onClick={() => {
                    refuseAll();
                    onClose();
                  }}
                  className="btn btn-ghost btn-sm text-base-content/50 gap-2"
                >
                  <XCircle size={14} /> Tout refuser
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
