import React, { useState, useEffect } from "react";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Brain,
  Target,
  Zap,
  Calendar,
  Package,
  BarChart3,
  PieChart,
  RefreshCw,
  Loader2,
  AlertCircle,
  Sparkles,
  FileText,
} from "lucide-react";
import { PredictionService } from "../services/predictionService";
import ProductService from "../services/ProductService";
import SalesChart from "../components/common/Analytics/SalesChart";
import AIInsightCard from "../components/common/Analytics/AIInsightCard";
import CustomPromptModal from "../components/common/Analytics/CustomPromptModal";
import toast from "react-hot-toast";

const Analytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("7d");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [aiQuotaError, setAiQuotaError] = useState(false);

  // Data
  const [aiStats, setAiStats] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [insights, setInsights] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [combinedAnalysis, setCombinedAnalysis] = useState(null);

  // Modals
  const [showCustomPromptModal, setShowCustomPromptModal] = useState(false);

  // Loading states
  const [analyzingStock, setAnalyzingStock] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      setAiQuotaError(false);

      const [statsRes, predictionsRes, analysisRes] = await Promise.all([
        PredictionService.getAIStats().catch(e => ({ error: e })),
        PredictionService.getPredictionsByType("demand_forecast", {
          limit: 10,
        }).catch(e => ({ error: e })),
        PredictionService.analyzeCombined().catch(e => ({ error: e })),
      ]);

      // Handle Quota Error globally
      const checkQuota = (res) => res?.error?.response?.status === 429;
      if (checkQuota(statsRes) || checkQuota(predictionsRes) || checkQuota(analysisRes)) {
        setAiQuotaError(true);
      }

      if (statsRes && !statsRes.error && statsRes.success && statsRes.data) {
        setAiStats(statsRes.data);
      }

      if (predictionsRes && !predictionsRes.error && predictionsRes.success && predictionsRes.data) {
        setPredictions(predictionsRes.data);
      }

      if (analysisRes && !analysisRes.error && analysisRes.success && analysisRes.data) {
        setCombinedAnalysis(analysisRes.data);
        // Extraire les insights de l'analyse combinée
        if (analysisRes.data.predictions?.insights) {
          const newInsights = analysisRes.data.predictions.insights.map(
            (insight, index) => ({
              id: `insight-${index}`,
              type: "info",
              title: "Insight IA",
              message: insight,
              confidence: analysisRes.data.output?.confidence
                ? Math.round(analysisRes.data.output.confidence * 100)
                : 85,
            }),
          );
          setInsights(newInsights);
        }
      }
    } catch (err) {
      console.error("Erreur chargement analytics:", err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Erreur lors du chargement des analytics";
      setError(
        typeof errorMessage === "string"
          ? errorMessage
          : "Erreur lors du chargement des analytics",
      );
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
    toast.success("Analytics actualisées");
  };

  const handleAnalyzeStock = async () => {
    setAnalyzingStock(true);

    try {
      const response = await PredictionService.analyzeStock();

      if (response.success && response.data) {
        toast.success("Analyse du stock terminée");

        // Ajouter les résultats aux insights
        if (response.data.output?.rawResponse) {
          const newInsight = {
            id: `stock-analysis-${Date.now()}`,
            type: "info",
            title: "Analyse du stock",
            message: response.data.output.rawResponse,
            confidence: response.data.output.confidence
              ? Math.round(response.data.output.confidence * 100)
              : 90,
          };
          setInsights((prev) => [newInsight, ...prev]);
        }

        fetchAnalytics(); // Refresh data
      }
    } catch (err) {
      console.error("Erreur analyse stock:", err);
      toast.error("Erreur lors de l'analyse");
    } finally {
      setAnalyzingStock(false);
    }
  };

  const handleDetectAnomalies = async () => {
    const loadingToast = toast.loading("Détection des anomalies...");

    try {
      const response = await PredictionService.detectAnomalies();

      if (response.success && response.data) {
        const anomalyInsight = {
          id: `anomalies-${Date.now()}`,
          type: "warning",
          title: "Anomalies détectées",
          message:
            response.data.output?.rawResponse ||
            "Analyse des anomalies terminée",
          confidence: response.data.output?.confidence
            ? Math.round(response.data.output.confidence * 100)
            : 85,
        };
        setInsights((prev) => [anomalyInsight, ...prev]);

        toast.success("Anomalies détectées", { id: loadingToast });
      }
    } catch (err) {
      console.error("Erreur détection anomalies:", err);
      toast.error("Erreur lors de la détection", { id: loadingToast });
    }
  };

  const handleOptimizeOrders = async () => {
    const loadingToast = toast.loading("Optimisation des commandes...");

    try {
      const response = await PredictionService.optimizeOrders();

      if (response.success && response.data) {
        const optimizationInsight = {
          id: `optimization-${Date.now()}`,
          type: "opportunity",
          title: "Optimisation des commandes",
          message:
            response.data.output?.rawResponse ||
            "Recommandations de commandes générées",
          confidence: response.data.output?.confidence
            ? Math.round(response.data.output.confidence * 100)
            : 88,
        };
        setInsights((prev) => [optimizationInsight, ...prev]);

        toast.success("Optimisation terminée", { id: loadingToast });
      }
    } catch (err) {
      console.error("Erreur optimisation:", err);
      toast.error("Erreur lors de l'optimisation", { id: loadingToast });
    }
  };

  const handleGenerateReport = async () => {
    setGeneratingReport(true);

    try {
      const response = await PredictionService.generateReport(selectedPeriod);

      if (response.success && response.data) {
        toast.success("Rapport généré avec succès");

        // TODO: Télécharger ou afficher le rapport
        console.log("Rapport:", response.data);
      }
    } catch (err) {
      console.error("Erreur génération rapport:", err);
      toast.error("Erreur lors de la génération");
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleDismissInsight = (insightId) => {
    setInsights((prev) => prev.filter((i) => i.id !== insightId));
    toast.success("Insight ignoré");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-primary" />
          <p className="text-lg text-base-content/60">
            Chargement des analytics...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md shadow-xl card bg-base-100">
          <div className="text-center card-body">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-error" />
            <h2 className="justify-center card-title">Erreur de chargement</h2>
            <p className="text-base-content/60">{error}</p>
            <div className="justify-center mt-4 card-actions">
              <button className="btn btn-primary" onClick={fetchAnalytics}>
                <RefreshCw size={20} />
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold">
            <Activity size={32} className="text-primary" />
            Analytiques IA
          </h1>
          <p className="mt-1 text-base-content/60">
            Prédictions et insights alimentés par l'intelligence artificielle
          </p>
          {aiQuotaError && (
            <div className="badge badge-error gap-2 mt-2 p-3 font-semibold text-white">
              <AlertCircle size={16} />
              Quota IA dépassé. Certaines fonctionnalités sont limitées.
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-base-200">
            <Calendar size={20} className="text-base-content/60" />
            <select
              className="select select-ghost select-sm"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="24h">24 heures</option>
              <option value="7d">7 jours</option>
              <option value="30d">30 jours</option>
              <option value="90d">90 jours</option>
            </select>
          </div>

          <button
            className="gap-2 btn btn-ghost"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw size={20} className={refreshing ? "animate-spin" : ""} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="border rounded-lg shadow-lg stat bg-linear-to-br from-primary/20 to-primary/5 border-primary/20">
          <div className="stat-figure text-primary">
            <Brain size={32} />
          </div>
          <div className="stat-title">Précision IA</div>
          <div className="stat-value text-primary">
            {aiStats?.averageAccuracy
              ? `${Math.round(aiStats.averageAccuracy)}%`
              : "94%"}
          </div>
          <div className="stat-desc">
            {aiStats?.totalPredictions || 0} prédictions
          </div>
        </div>

        <div className="border rounded-lg shadow-lg stat bg-linear-to-br from-success/20 to-success/5 border-success/20">
          <div className="stat-figure text-success">
            <TrendingUp size={32} />
          </div>
          <div className="stat-title">Insights positifs</div>
          <div className="stat-value text-success">
            {insights.filter((i) => i.type === "opportunity").length}
          </div>
          <div className="stat-desc">Opportunités détectées</div>
        </div>

        <div className="border rounded-lg shadow-lg stat bg-linear-to-br from-warning/20 to-warning/5 border-warning/20">
          <div className="stat-figure text-warning">
            <Target size={32} />
          </div>
          <div className="stat-title">Actions recommandées</div>
          <div className="stat-value text-warning">
            {
              predictions.filter((p) => p.predictions?.recommendedOrderQty > 0)
                .length
            }
          </div>
          <div className="stat-desc">À traiter</div>
        </div>

        <div className="border rounded-lg shadow-lg stat bg-linear-to-br from-info/20 to-info/5 border-info/20">
          <div className="stat-figure text-info">
            <Zap size={32} />
          </div>
          <div className="stat-title">Temps économisé</div>
          <div className="stat-value text-info">
            {aiStats?.timeSaved ? `${aiStats.timeSaved}h` : "24h"}
          </div>
          <div className="stat-desc">Ce mois-ci</div>
        </div>
      </div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <div className="shadow-lg card bg-base-100">
          <div className="card-body">
            <h2 className="mb-4 card-title">
              <Brain className="text-primary" size={24} />
              Insights IA en temps réel
            </h2>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {insights.slice(0, 6).map((insight) => (
                <AIInsightCard
                  key={insight.id}
                  insight={insight}
                  onDismiss={handleDismissInsight}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Sales Chart */}
        <SalesChart data={salesData} period={selectedPeriod} />

        {/* Categories Distribution */}
        <div className="shadow-lg card bg-base-100">
          <div className="card-body">
            <h2 className="card-title">
              <PieChart size={24} />
              Répartition par catégorie
            </h2>
            {topCategories.length > 0 ? (
              <div className="mt-4 space-y-4">
                {topCategories.map((category, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{category.name}</span>
                      <span className="text-sm font-bold">
                        {category.value}%
                      </span>
                    </div>
                    <progress
                      className={`progress progress-primary w-full`}
                      value={category.value}
                      max="100"
                    ></progress>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-base-content/60">
                Aucune donnée disponible
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Predictions Table */}
      {predictions.length > 0 && (
        <div className="shadow-lg card bg-base-100">
          <div className="card-body">
            <h2 className="mb-4 card-title">
              <Target size={24} />
              Prédictions de demande
            </h2>
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Demande prévue</th>
                    <th>Qté recommandée</th>
                    <th>Confiance</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {predictions.map((pred) => (
                    <tr key={pred._id} className="hover">
                      <td>
                        <div className="flex items-center gap-3">
                          <Package size={20} className="text-primary" />
                          <span className="font-semibold">
                            {pred.product?.name || "Produit"}
                          </span>
                        </div>
                      </td>
                      <td className="font-bold text-primary">
                        {pred.predictions?.nextWeekDemand || "-"}
                      </td>
                      <td className="font-semibold">
                        {pred.predictions?.recommendedOrderQty || "-"}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <progress
                            className="w-20 progress progress-success"
                            value={(pred.output?.confidence || 0) * 100}
                            max="100"
                          ></progress>
                          <span className="text-sm font-semibold">
                            {pred.output?.confidence
                              ? `${Math.round(pred.output.confidence * 100)}%`
                              : "-"}
                          </span>
                        </div>
                      </td>
                      <td className="text-sm text-base-content/60">
                        {new Date(pred.createdAt).toLocaleDateString("fr-FR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <button
          className="justify-start h-auto gap-2 py-4 btn btn-outline btn-primary"
          onClick={() => setShowCustomPromptModal(true)}
        >
          <Sparkles size={24} />
          <div className="text-left">
            <div className="font-semibold">Question personnalisée</div>
            <div className="text-xs opacity-70">Posez n'importe quoi</div>
          </div>
        </button>

        <button
          className="justify-start h-auto gap-2 py-4 btn btn-outline btn-secondary"
          onClick={handleAnalyzeStock}
          disabled={analyzingStock}
        >
          {analyzingStock ? (
            <Loader2 size={24} className="animate-spin" />
          ) : (
            <Brain size={24} />
          )}
          <div className="text-left">
            <div className="font-semibold">Analyser le stock</div>
            <div className="text-xs opacity-70">Analyse complète IA</div>
          </div>
        </button>

        <button
          className="justify-start h-auto gap-2 py-4 btn btn-outline btn-accent"
          onClick={handleDetectAnomalies}
        >
          <AlertCircle size={24} />
          <div className="text-left">
            <div className="font-semibold">Détecter anomalies</div>
            <div className="text-xs opacity-70">Vérification automatique</div>
          </div>
        </button>

        <button
          className="justify-start h-auto gap-2 py-4 btn btn-outline btn-info"
          onClick={handleOptimizeOrders}
        >
          <Target size={24} />
          <div className="text-left">
            <div className="font-semibold">Optimiser commandes</div>
            <div className="text-xs opacity-70">Recommandations IA</div>
          </div>
        </button>
      </div>

      {/* Generate Report */}
      <div className="border shadow-lg card bg-linear-to-br from-primary/10 to-primary/5 border-primary/20">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                <FileText size={20} />
                Rapport d'analyse complet
              </h3>
              <p className="mt-1 text-sm text-base-content/60">
                Générez un rapport détaillé avec toutes les analyses et
                prédictions IA
              </p>
            </div>
            <button
              className="gap-2 btn btn-primary"
              onClick={handleGenerateReport}
              disabled={generatingReport}
            >
              {generatingReport ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <Brain size={20} />
                  Générer le rapport
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Custom Prompt Modal */}
      <CustomPromptModal
        isOpen={showCustomPromptModal}
        onClose={() => setShowCustomPromptModal(false)}
      />
    </div>
  );
};

export default Analytics;
