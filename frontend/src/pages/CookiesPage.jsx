import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Cookie, Info, Settings, Shield, CheckCircle, XCircle } from "lucide-react";
import { useToastStore } from "../store/toastStore";

const cookieCategories = [
  {
    id: "required",
    icon: Shield,
    title: "Cookies strictement nécessaires",
    required: true,
    desc: "Ces cookies sont essentiels au fonctionnement de la plateforme. Ils permettent la gestion de votre session d'authentification, la mémorisation de vos préférences de connexion, et la sécurité de votre compte. Ils ne peuvent pas être désactivés.",
    examples: ["Session d'authentification", "Protection CSRF", "Préférences de thème"],
  },
  {
    id: "analytics",
    icon: Settings,
    title: "Cookies analytics",
    required: false,
    desc: "Ces cookies nous aident à comprendre comment vous utilisez StockWise : pages visitées, fonctionnalités utilisées, durée des sessions. Les données sont anonymisées et nous permettent d'améliorer continuellement l'expérience utilisateur.",
    examples: ["Pages visitées", "Parcours utilisateur", "Performance du service"],
  },
  {
    id: "preferences",
    icon: Info,
    title: "Cookies de préférences",
    required: false,
    desc: "Ces cookies mémorisent vos choix et préférences pour personnaliser votre expérience : paramètres d'affichage, langue, préférences de notifications. Ils améliorent le confort d'utilisation de la plateforme.",
    examples: ["Langue choisie", "Paramètres d'affichage", "Préférences de notifications"],
  },
];

const cookieList = [
  { name: "auth-storage", provider: "StockWise", type: "Nécessaire", duration: "Persistant", purpose: "Stockage de la session d'authentification" },
  { name: "stockwise-theme", provider: "StockWise", type: "Nécessaire", duration: "Persistant", purpose: "Préférence de thème (clair/sombre)" },
  { name: "XSRF-TOKEN", provider: "StockWise", type: "Nécessaire", duration: "Session", purpose: "Protection contre les attaques CSRF" },
  { name: "_ga", provider: "Google Analytics", type: "Analytics", duration: "2 ans", purpose: "Statistiques d'utilisation anonymisées" },
  { name: "_gid", provider: "Google Analytics", type: "Analytics", duration: "24h", purpose: "Identification de session analytics" },
];

export default function CookiesPage() {
  const [preferences, setPreferences] = useState({
    required: true,
    analytics: false,
    preferences: false,
  });
  const [showDetails, setShowDetails] = useState(false);

  const allAccepted = Object.values(preferences).every(Boolean);

  const acceptAll = () => {
    setPreferences({ required: true, analytics: true, preferences: true });
    useToastStore.getState().success("Préférences de cookies enregistrées");
  };

  const acceptSelected = () => {
    useToastStore.getState().success("Préférences de cookies enregistrées");
  };

  const refuseAll = () => {
    setPreferences({ required: true, analytics: false, preferences: false });
    useToastStore.getState().success("Seuls les cookies nécessaires sont actifs");
  };

  return (
    <div className="min-h-screen bg-base-200/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-base-content/50 hover:text-base-content transition-colors no-underline"
          >
            <ArrowLeft size={16} /> Retour à l'accueil
          </Link>

          <div>
            <h1 className="text-3xl sm:text-4xl font-black font-display">
              Politique de cookies
            </h1>
            <p className="text-base-content/60 mt-2">
              Dernière mise à jour : 15 juin 2026
            </p>
          </div>

          <p className="text-base-content/70 leading-relaxed">
            StockWise utilise des cookies et technologies similaires pour
            assurer le bon fonctionnement de la plateforme, améliorer votre
            expérience et analyser l'utilisation du service. Vous pouvez
            paramétrer vos préférences ci-dessous.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card bg-base-100 shadow-sm border border-base-content/5"
        >
          <div className="card-body p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <Cookie size={24} className="text-primary" />
              <h2 className="font-display font-bold text-xl">
                Gérez vos préférences
              </h2>
            </div>

            <div className="space-y-4">
              {cookieCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-start justify-between gap-4 p-4 rounded-xl bg-base-200/30 border border-base-content/5"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <cat.icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-display font-semibold text-sm flex items-center gap-2">
                        {cat.title}
                        {cat.required && (
                          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            Requis
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-base-content/60 mt-1 leading-relaxed">
                        {cat.desc}
                      </p>
                      {cat.examples && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {cat.examples.map((ex, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-base-300/50 text-base-content/50"
                            >
                              {ex}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <label className="swap swap-active shrink-0 mt-1">
                    <input
                      type="checkbox"
                      disabled={cat.required}
                      checked={preferences[cat.id]}
                      onChange={() =>
                        setPreferences((p) => ({
                          ...p,
                          [cat.id]: !p[cat.id],
                        }))
                      }
                    />
                    <div className="swap-on w-11 h-6 bg-primary rounded-full relative transition-colors">
                      <div className="absolute top-0.5 right-0.5 w-5 h-5 bg-white rounded-full shadow-sm" />
                    </div>
                    <div className="swap-off w-11 h-6 bg-base-300 rounded-full relative transition-colors">
                      <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-base-content/30 rounded-full shadow-sm" />
                    </div>
                  </label>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={acceptAll}
                className="btn btn-primary gap-2 flex-1"
              >
                <CheckCircle size={16} /> Tout accepter
              </button>
              <button
                onClick={acceptSelected}
                className="btn btn-outline gap-2 flex-1"
              >
                <Settings size={16} /> Enregistrer mes choix
              </button>
              <button
                onClick={refuseAll}
                className="btn btn-ghost gap-2 text-base-content/50"
              >
                <XCircle size={16} /> Tout refuser
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card bg-base-100 shadow-sm border border-base-content/5"
        >
          <div className="card-body p-6 sm:p-8">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center gap-3">
                <Info size={20} className="text-primary" />
                <h2 className="font-display font-bold text-lg">
                  Liste détaillée des cookies
                </h2>
              </div>
              <motion.span
                animate={{ rotate: showDetails ? 180 : 0 }}
                className="text-base-content/40"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
              </motion.span>
            </button>

            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="overflow-hidden mt-6"
              >
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead>
                      <tr className="bg-base-200/50">
                        <th>Nom</th>
                        <th>Fournisseur</th>
                        <th>Type</th>
                        <th>Durée</th>
                        <th>Finalité</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cookieList.map((c, i) => (
                        <tr key={i} className="hover:bg-base-200/30">
                          <td className="font-mono text-xs">{c.name}</td>
                          <td className="text-sm">{c.provider}</td>
                          <td>
                            <span
                              className={`badge badge-sm ${
                                c.type === "Nécessaire"
                                  ? "badge-primary"
                                  : "badge-ghost"
                              }`}
                            >
                              {c.type}
                            </span>
                          </td>
                          <td className="text-sm text-base-content/60">
                            {c.duration}
                          </td>
                          <td className="text-sm text-base-content/70">
                            {c.purpose}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card bg-base-200/50 border border-base-content/5"
        >
          <div className="card-body p-6 text-center">
            <p className="text-sm text-base-content/50">
              Pour toute question relative aux cookies, contactez-nous à{" "}
              <a
                href="mailto:contact@stockwise.app"
                className="text-primary hover:text-primary/80 font-medium"
              >
                contact@stockwise.app
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
