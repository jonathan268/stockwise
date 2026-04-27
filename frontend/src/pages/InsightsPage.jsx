import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Sparkles,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  Package,
  Zap,
  CheckCircle,
  X,
  ChevronRight,
  BrainCircuit,
  Lightbulb,
} from "lucide-react";
import axiosInstance from "../lib/axios";
import { useAuthStore } from "../store/authStore";
import SubscriptionModal from "../components/SubscriptionModal";

const typeConfig = {
  restock: {
    label: "Réapprovisionnement",
    icon: Package,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  popular: {
    label: "Tendance",
    icon: TrendingUp,
    color: "text-success",
    bg: "bg-success/10",
    border: "border-success/20",
  },
  dead_stock: {
    label: "Déstockage",
    icon: AlertTriangle,
    color: "text-error",
    bg: "bg-error/10",
    border: "border-error/20",
  },
  bundle: {
    label: "Optimisation de Lot",
    icon: Zap,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
};

const priorityConfig = {
  high: "badge-error",
  medium: "badge-warning",
  low: "badge-info",
};

export default function InsightsPage() {
  const queryClient = useQueryClient();
  const { organization } = useAuthStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubsModalOpen, setIsSubsModalOpen] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["recommendations"],
    queryFn: async () => {
      const res = await axiosInstance.get("/recommendations");
      return res.data;
    },
  });

  const generateMutation = useMutation({
    mutationFn: () => axiosInstance.post("/recommendations/generate"),
    onMutate: () => setIsGenerating(true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recommendations"] });
      setIsGenerating(false);
    },
    onError: () => setIsGenerating(false),
  });

  const dismissMutation = useMutation({
    mutationFn: (id) => axiosInstance.patch(`/recommendations/${id}/dismiss`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["recommendations"] }),
  });

  const recommendations = data?.data || [];

  if (!organization?.hasProAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-md mx-auto space-y-6">
        <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center animate-pulse">
          <Sparkles size={40} />
        </div>
        <h1 className="text-3xl font-black font-display">Passer au plan PRO</h1>
        <p className="text-base-content/60">
          Les analyses IA par Gemini sont réservées aux membres PRO. Optimisez votre inventaire avec des prédictions intelligentes et des recommandations de réapprovisionnement automatiques.
        </p>
        <button 
          onClick={() => setIsSubsModalOpen(true)}
          className="btn btn-primary btn-wide"
        >
          Voir les tarifs
        </button>

        <SubscriptionModal 
          isOpen={isSubsModalOpen} 
          onClose={() => setIsSubsModalOpen(false)} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black font-display flex items-center gap-3">
            <Sparkles className="text-primary animate-pulse" size={32} />
            Analyses IA
          </h1>
          <p className="text-base-content/60">
            Propulsé par Google Gemini — Recommandations intelligentes pour votre stock.
          </p>
        </div>
        <button
          onClick={() => generateMutation.mutate()}
          className={`btn btn-primary gap-2 ${isGenerating ? "loading" : ""}`}
          disabled={isGenerating}
        >
          {isGenerating ? "Analyse en cours..." : <><RefreshCw size={18} /> Nouvelle Analyse</>}
        </button>
      </div>

      {/* Main Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 bg-base-200/50 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : recommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {recommendations.map((rec, idx) => {
              const config = typeConfig[rec.type] || typeConfig.restock;
              const Icon = config.icon;
              return (
                <motion.div
                  key={rec._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`card bg-base-100 border ${config.border} shadow-sm group hover:shadow-md transition-all duration-300 overflow-hidden`}
                >
                  <div className="card-body p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-3 rounded-2xl ${config.bg} ${config.color}`}>
                        <Icon size={24} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`badge ${priorityConfig[rec.priority]} badge-sm font-bold uppercase`}>
                          {rec.priority}
                        </span>
                        <button
                          onClick={() => dismissMutation.mutate(rec._id)}
                          className="btn btn-ghost btn-xs btn-circle opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {rec.title}
                    </h3>
                    <p className="text-base-content/70 text-sm leading-relaxed mb-6">
                      {rec.description}
                    </p>

                    <div className="mt-auto pt-4 border-t border-base-content/5 flex items-center justify-between">
                      <span className="text-xs font-medium text-base-content/40 flex items-center gap-1">
                        <Lightbulb size={12} /> {config.label}
                      </span>
                      <Link 
                        to="/products"
                        className="btn btn-ghost btn-sm gap-2 text-primary font-bold"
                      >
                        Voir le stock <ChevronRight size={16} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-20 bg-base-100 rounded-[2rem] border border-dashed border-base-content/10 text-center space-y-4">
          <div className="p-6 bg-base-200 rounded-full text-base-content/20">
            <BrainCircuit size={48} />
          </div>
          <h2 className="text-2xl font-bold">Prêt pour l'analyse ?</h2>
          <p className="text-base-content/50 max-w-sm">
            Cliquez sur le bouton pour laisser Gemini analyser vos tendances de ventes et l'état de votre stock.
          </p>
          <button
            onClick={() => generateMutation.mutate()}
            className="btn btn-primary"
            disabled={isGenerating}
          >
            Lancer la première analyse
          </button>
        </div>
      )}

      {/* Pro Banner/Info */}
      <div className="card bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/10 rounded-[2rem]">
        <div className="card-body flex-row items-center gap-6 p-8">
          <div className="hidden sm:flex w-16 h-16 bg-white dark:bg-base-100 rounded-2xl shadow-sm items-center justify-center shrink-0">
            <Zap className="text-primary" size={32} fill="currentColor" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-lg">Comment ça marche ?</h3>
            <p className="text-sm text-base-content/60">
              Notre IA analyse quotidiennement vos mouvements de stock et historiques de ventes pour prédire les ruptures avant qu'elles n'arrivent et identifier vos produits les plus rentables.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
