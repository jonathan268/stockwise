import React, { useState, useEffect } from 'react';
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
  FileText
} from 'lucide-react';
import { PredictionService } from '../services/predictionService';
import { ProductService } from '../services/productService';
import SalesChart from '../components/common/Analytics/SalesChart';
import AIInsightCard from '../components/common/Analytics/AIInsightCard';
import CustomPromptModal from '../components/common/Analytics/CustomPromptModal';
import toast from 'react-hot-toast';

const Analytics = () => {
  // ==================== STATE ====================
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

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

  // ==================== FETCH DATA ====================
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsRes, predictionsRes, analysisRes] = await Promise.all([
        PredictionService.getAIStats(),
        PredictionService.getPredictionsByType('demand_forecast', { limit: 10 }),
        PredictionService.analyzeCombined()
      ]);

      if (statsRes.success && statsRes.data) {
        setAiStats(statsRes.data);
      }

      if (predictionsRes.success && predictionsRes.data) {
        setPredictions(predictionsRes.data);
      }

      if (analysisRes.success && analysisRes.data) {
        setCombinedAnalysis(analysisRes.data);
        // Extraire les insights de l'analyse combinée
        if (analysisRes.data.predictions?.insights) {
          const newInsights = analysisRes.data.predictions.insights.map((insight, index) => ({
            id: `insight-${index}`,
            type: 'info',
            title: 'Insight IA',
            message: insight,
            confidence: analysisRes.data.output?.confidence ? Math.round(analysisRes.data.output.confidence * 100) : 85
          }));
          setInsights(newInsights);
        }
      }

    } catch (err) {
      console.error('Erreur chargement analytics:', err);
      setError(err.message || 'Erreur lors du chargement des analytics');
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod]);

  // ==================== REFRESH ====================
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
    toast.success('Analytics actualisées');
  };

  // ==================== ANALYZE STOCK ====================
  const handleAnalyzeStock = async () => {
    setAnalyzingStock(true);
    
    try {
      const response = await PredictionService.analyzeStock();
      
      if (response.success && response.data) {
        toast.success('Analyse du stock terminée');
        
        // Ajouter les résultats aux insights
        if (response.data.output?.rawResponse) {
          const newInsight = {
            id: `stock-analysis-${Date.now()}`,
            type: 'info',
            title: 'Analyse du stock',
            message: response.data.output.rawResponse,
            confidence: response.data.output.confidence ? Math.round(response.data.output.confidence * 100) : 90
          };
          setInsights(prev => [newInsight, ...prev]);
        }
        
        fetchAnalytics(); // Refresh data
      }
    } catch (err) {
      console.error('Erreur analyse stock:', err);
      toast.error('Erreur lors de l\'analyse');
    } finally {
      setAnalyzingStock(false);
    }
  };

  // ==================== DETECT ANOMALIES ====================
  const handleDetectAnomalies = async () => {
    const loadingToast = toast.loading('Détection des anomalies...');
    
    try {
      const response = await PredictionService.detectAnomalies();
      
      if (response.success && response.data) {
        const anomalyInsight = {
          id: `anomalies-${Date.now()}`,
          type: 'warning',
          title: 'Anomalies détectées',
          message: response.data.output?.rawResponse || 'Analyse des anomalies terminée',
          confidence: response.data.output?.confidence ? Math.round(response.data.output.confidence * 100) : 85
        };
        setInsights(prev => [anomalyInsight, ...prev]);
        
        toast.success('Anomalies détectées', { id: loadingToast });
      }
    } catch (err) {
      console.error('Erreur détection anomalies:', err);
      toast.error('Erreur lors de la détection', { id: loadingToast });
    }
  };

  // ==================== OPTIMIZE ORDERS ====================
  const handleOptimizeOrders = async () => {
    const loadingToast = toast.loading('Optimisation des commandes...');
    
    try {
      const response = await PredictionService.optimizeOrders();
      
      if (response.success && response.data) {
        const optimizationInsight = {
          id: `optimization-${Date.now()}`,
          type: 'opportunity',
          title: 'Optimisation des commandes',
          message: response.data.output?.rawResponse || 'Recommandations de commandes générées',
          confidence: response.data.output?.confidence ? Math.round(response.data.output.confidence * 100) : 88
        };
        setInsights(prev => [optimizationInsight, ...prev]);
        
        toast.success('Optimisation terminée', { id: loadingToast });
      }
    } catch (err) {
      console.error('Erreur optimisation:', err);
      toast.error('Erreur lors de l\'optimisation', { id: loadingToast });
    }
  };

  // ==================== GENERATE REPORT ====================
  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    
    try {
      const response = await PredictionService.generateReport(selectedPeriod);
      
      if (response.success && response.data) {
        toast.success('Rapport généré avec succès');
        
        // TODO: Télécharger ou afficher le rapport
        console.log('Rapport:', response.data);
      }
    } catch (err) {
      console.error('Erreur génération rapport:', err);
      toast.error('Erreur lors de la génération');
    } finally {
      setGeneratingReport(false);
    }
  };

  // ==================== DISMISS INSIGHT ====================
  const handleDismissInsight = (insightId) => {
    setInsights(prev => prev.filter(i => i.id !== insightId));
    toast.success('Insight ignoré');
  };

  // ==================== RENDER LOADING ====================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-base-content/60">Chargement des analytics...</p>
        </div>
      </div>
    );
  }

  // ==================== RENDER ERROR ====================
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="card bg-base-100 shadow-xl w-full max-w-md">
          <div className="card-body text-center">
            <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
            <h2 className="card-title justify-center">Erreur de chargement</h2>
            <p className="text-base-content/60">{error}</p>
            <div className="card-actions justify-center mt-4">
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

  // ==================== MAIN RENDER ====================
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Activity size={32} className="text-primary" />
            Analytiques IA
          </h1>
          <p className="text-base-content/60 mt-1">
            Prédictions et insights alimentés par l'intelligence artificielle
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-base-200 rounded-lg px-3 py-2">
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
            className="btn btn-ghost gap-2"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg rounded-lg border border-primary/20">
          <div className="stat-figure text-primary">
            <Brain size={32} />
          </div>
          <div className="stat-title">Précision IA</div>
          <div className="stat-value text-primary">
            {aiStats?.averageAccuracy ? `${Math.round(aiStats.averageAccuracy)}%` : '94%'}
          </div>
          <div className="stat-desc">
            {aiStats?.totalPredictions || 0} prédictions
          </div>
        </div>

        <div className="stat bg-gradient-to-br from-success/20 to-success/5 shadow-lg rounded-lg border border-success/20">
          <div className="stat-figure text-success">
            <TrendingUp size={32} />
          </div>
          <div className="stat-title">Insights positifs</div>
          <div className="stat-value text-success">
            {insights.filter(i => i.type === 'opportunity').length}
          </div>
          <div className="stat-desc">Opportunités détectées</div>
        </div>

        <div className="stat bg-gradient-to-br from-warning/20 to-warning/5 shadow-lg rounded-lg border border-warning/20">
          <div className="stat-figure text-warning">
            <Target size={32} />
          </div>
          <div className="stat-title">Actions recommandées</div>
          <div className="stat-value text-warning">
            {predictions.filter(p => p.predictions?.recommendedOrderQty > 0).length}
          </div>
          <div className="stat-desc">À traiter</div>
        </div>

        <div className="stat bg-gradient-to-br from-info/20 to-info/5 shadow-lg rounded-lg border border-info/20">
          <div className="stat-figure text-info">
            <Zap size={32} />
          </div>
          <div className="stat-title">Temps économisé</div>
          <div className="stat-value text-info">
            {aiStats?.timeSaved ? `${aiStats.timeSaved}h` : '24h'}
          </div>
          <div className="stat-desc">Ce mois-ci</div>
        </div>
      </div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title mb-4">
              <Brain className="text-primary" size={24} />
              Insights IA en temps réel
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <SalesChart data={salesData} period={selectedPeriod} />

        {/* Categories Distribution */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title">
              <PieChart size={24} />
              Répartition par catégorie
            </h2>
            {topCategories.length > 0 ? (
              <div className="space-y-4 mt-4">
                {topCategories.map((category, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{category.name}</span>
                      <span className="text-sm font-bold">{category.value}%</span>
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
              <div className="text-center py-12 text-base-content/60">
                Aucune donnée disponible
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Predictions Table */}
      {predictions.length > 0 && (
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title mb-4">
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
                            {pred.product?.name || 'Produit'}
                          </span>
                        </div>
                      </td>
                      <td className="font-bold text-primary">
                        {pred.predictions?.nextWeekDemand || '-'}
                      </td>
                      <td className="font-semibold">
                        {pred.predictions?.recommendedOrderQty || '-'}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <progress
                            className="progress progress-success w-20"
                            value={(pred.output?.confidence || 0) * 100}
                            max="100"
                          ></progress>
                          <span className="text-sm font-semibold">
                            {pred.output?.confidence ? `${Math.round(pred.output.confidence * 100)}%` : '-'}
                          </span>
                        </div>
                      </td>
                      <td className="text-sm text-base-content/60">
                        {new Date(pred.createdAt).toLocaleDateString('fr-FR')}
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button
          className="btn btn-outline btn-primary gap-2 justify-start h-auto py-4"
          onClick={() => setShowCustomPromptModal(true)}
        >
          <Sparkles size={24} />
          <div className="text-left">
            <div className="font-semibold">Question personnalisée</div>
            <div className="text-xs opacity-70">Posez n'importe quoi</div>
          </div>
        </button>

        <button
          className="btn btn-outline btn-secondary gap-2 justify-start h-auto py-4"
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
          className="btn btn-outline btn-accent gap-2 justify-start h-auto py-4"
          onClick={handleDetectAnomalies}
        >
          <AlertCircle size={24} />
          <div className="text-left">
            <div className="font-semibold">Détecter anomalies</div>
            <div className="text-xs opacity-70">Vérification automatique</div>
          </div>
        </button>

        <button
          className="btn btn-outline btn-info gap-2 justify-start h-auto py-4"
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
      <div className="card bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 shadow-lg">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <FileText size={20} />
                Rapport d'analyse complet
              </h3>
              <p className="text-sm text-base-content/60 mt-1">
                Générez un rapport détaillé avec toutes les analyses et prédictions IA
              </p>
            </div>
            <button
              className="btn btn-primary gap-2"
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