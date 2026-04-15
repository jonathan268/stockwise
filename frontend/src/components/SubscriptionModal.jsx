import { motion } from "framer-motion";
import { Check, Sparkles, Zap, ShieldCheck, X, ArrowRight } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import { useAuthStore } from "../store/authStore";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: "0",
    description: "Pour les petites entreprises qui débutent.",
    features: ["Jusqu'à 100 produits", "Historique de 30 jours", "1 Utilisateur"],
    color: "bg-base-200",
    button: "Plan Actuel",
    disabled: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: "9 900",
    description: "Tout ce dont vous avez besoin pour croître.",
    features: ["Produits illimités", "Historique complet", "Analyses IA avancées", "Utilisateurs illimités", "Alertes stock intelligentes"],
    color: "bg-primary/10 border-primary",
    button: "Passer à Pro",
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "sur mesure",
    description: "Solutions personnalisées pour grandes structures.",
    features: ["Support prioritaire 24/7", "API dédiée", "Multi-entrepôts", "Formation sur site"],
    color: "bg-base-200",
    button: "Contacter Sales",
  },
];

export default function SubscriptionModal({ isOpen, onClose }) {
  const { user, organization } = useAuthStore();

  const subscribeMutation = useMutation({
    mutationFn: async (planId) => {
      const { data } = await axiosInstance.post("/billing/subscribe", { targetPlan: planId });
      return data;
    },
    onSuccess: (data) => {
      if (data.data?.authorization_url) {
        window.location.href = data.data.authorization_url;
      }
    },
    onError: (error) => {
      console.error("Subscription error:", error);
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-base-300/60 backdrop-blur-md"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative bg-base-100 rounded-3xl shadow-2xl border border-base-content/10 w-full max-w-5xl overflow-hidden"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 btn btn-ghost btn-circle btn-sm z-10"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col lg:flex-row h-full max-h-[95vh]">
          {/* Left Panel: Pricing */}
          <div className="flex-1 p-6 lg:p-10 overflow-y-auto">
            <div className="mb-8 text-center lg:text-left">
              <h2 className="text-3xl font-black font-display mb-2">Choisissez votre plan</h2>
              <p className="text-base-content/60">Optimisez votre gestion de stock avec des outils professionnels.</p>
            </div>

            <div className="flex flex-wrap justify-center lg:justify-start gap-6">
              {plans.map((p) => (
                <div 
                  key={p.id}
                  className={`card border-2 p-6 transition-all duration-300 relative flex-1 min-w-70 max-w-[320px] ${p.color} ${p.popular ? "shadow-xl shadow-primary/10" : "border-base-content/5"}`}
                >
                  {p.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 badge badge-primary font-bold gap-1 px-4 z-10">
                      <Zap size={12} /> Populaire
                    </div>
                  )}
                  
                  <div className="mb-6">
                    <p className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-1">{p.name}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black">{p.price}</span>
                      {p.id === "pro" && <span className="text-sm font-medium opacity-60">XAF/mois</span>}
                    </div>
                    <p className="text-xs text-base-content/60 mt-2 leading-relaxed min-h-12">{p.description}</p>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {p.features.map((f, i) => (
                      <li key={i} className="flex gap-2 text-sm font-medium">
                        <Check size={16} className="text-primary shrink-0" />
                        <span className="leading-tight">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <button 
                    disabled={p.disabled || organization?.plan === p.id || subscribeMutation.isPending}
                    onClick={() => p.id === "pro" ? subscribeMutation.mutate("pro") : null}
                    className={`btn btn-sm w-full gap-2 ${p.popular ? "btn-primary" : "btn-outline border-base-content/20"}`}
                  >
                    {subscribeMutation.isPending && p.id === "pro" ? (
                      <span className="loading loading-spinner loading-xs" />
                    ) : (
                      <>
                        {p.button}
                        {!p.disabled && <ArrowRight size={14} />}
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel: Benefits/Highlight */}
          <div className="lg:w-[300px] bg-primary text-primary-content p-8 lg:p-10 flex flex-col justify-center shrink-0">
            <h3 className="text-2xl font-black font-display mb-8">Pourquoi passer au plan Pro ?</h3>
            
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="bg-primary-content/20 p-2 rounded-xl shrink-0 h-fit"><Sparkles size={18} /></div>
                <div>
                  <p className="font-bold text-sm">Analyses IA Illimitées</p>
                  <p className="text-xs opacity-75 mt-1">Prévisions de demande ultra-précises basées sur vos ventes.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-primary-content/20 p-2 rounded-xl shrink-0 h-fit"><Zap size={18} /></div>
                <div>
                  <p className="font-bold text-sm">Réactivité maximale</p>
                  <p className="text-xs opacity-75 mt-1">Alertes temps réel pour éviter toute rupture de stock.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-primary-content/20 p-2 rounded-xl shrink-0 h-fit"><ShieldCheck size={18} /></div>
                <div>
                  <p className="font-bold text-sm">Sécurité entreprise</p>
                  <p className="text-xs opacity-75 mt-1">Protection avancée de vos données commerciales.</p>
                </div>
              </div>
            </div>

            <div className="mt-10 p-5 rounded-2xl bg-primary-content/10 border border-primary-content/20">
              <p className="text-[10px] uppercase font-black opacity-60 mb-2">Sécurisé par NotchPay</p>
              <p className="text-xs italic">"La confiance pour vos transactions."</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
