import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Sparkles, ArrowRight, X } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import SubscriptionModal from "./SubscriptionModal";

export default function PlanGate({ children, requiredPlan = "pro" }) {
  const [isSubsModalOpen, setIsSubsModalOpen] = useState(false);
  const { organization } = useAuthStore();

  const hasAccess = organization?.hasProAccess;

  if (hasAccess) return children;

  return (
    <div className="relative">
      <div className="pointer-events-none select-none blur-sm opacity-30">
        {children}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="absolute inset-0 flex items-center justify-center z-10"
      >
        <div className="bg-base-100 border border-base-content/10 rounded-2xl shadow-2xl p-8 max-w-sm mx-4 text-center space-y-5">
          <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto">
            <Lock size={28} />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold font-display">
              Fonctionnalité Premium
            </h3>
            <p className="text-sm text-base-content/60 leading-relaxed">
              Passez au plan Pro ou Enterprise pour débloquer cette fonctionnalité et booster votre gestion de stock.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => setIsSubsModalOpen(true)}
              className="btn btn-primary gap-2 w-full"
            >
              <Sparkles size={16} /> Voir les offres <ArrowRight size={14} />
            </button>
            <button
              onClick={() => window.location.href = "/settings"}
              className="btn btn-ghost btn-sm text-base-content/50"
            >
              Mon abonnement actuel
            </button>
          </div>
        </div>
      </motion.div>

      <SubscriptionModal
        isOpen={isSubsModalOpen}
        onClose={() => setIsSubsModalOpen(false)}
      />
    </div>
  );
}