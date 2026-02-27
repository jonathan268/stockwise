import React, { useState, useEffect } from 'react';
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  ShoppingCart,
  DollarSign,
  Eye,
  Plus,
  Filter,
  Activity,
  Box,
  Loader2,
  AlertCircle,
  RefreshCw,
  Calendar,
  Brain
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardService } from '../services/dashboardService';
import { ProductService } from '../services/productService';
import StatCard from '../components/dashboard/StatCard';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const navigate = useNavigate();

  // ==================== STATE ====================
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [stats, setStats] = useState({
    totalProducts: 0,
    stockValue: 0,
    lowStockAlerts: 0,
    pendingOrders: 0,
    trends: {}
  });

  const [stockAlerts, setStockAlerts] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [aiInsights, setAIInsights] = useState([]);

  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  // ==================== FETCH DATA ====================
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Appel API pour récupérer le résumé complet
      const [summaryRes, alertsRes, activityRes, topProductsRes, insightsRes] = await Promise.allSettled([
        DashboardService.getDashboardSummary(),
        DashboardService.getStockAlerts({ limit: 5 }),
        DashboardService.getRecentActivity(5),
        DashboardService.getTopProducts(4),
        DashboardService.getAIInsights()
      ]);

      // Traiter le résumé
      if (summaryRes.status === 'fulfilled' && summaryRes.value?.success) {
        setStats(summaryRes.value.data || {});
      } else {
        // Fallback : récupérer les stats basiques
        await fetchBasicStats();
      }

      // Traiter les alertes
      if (alertsRes.status === 'fulfilled' && alertsRes.value?.success) {
        setStockAlerts(alertsRes.value.data || []);
      }

      // Traiter les activités
      if (activityRes.status === 'fulfilled' && activityRes.value?.success) {
        setRecentActivity(activityRes.value.data || []);
      }

      // Traiter les top produits
      if (topProductsRes.status === 'fulfilled' && topProductsRes.value?.success) {
        setTopProducts(topProductsRes.value.data || []);
      }

      // Traiter les insights IA
      if (insightsRes.status === 'fulfilled' && insightsRes.value?.success) {
        setAIInsights(insightsRes.value.data || []);
      }

    } catch (err) {
      console.error('Erreur chargement dashboard:', err);
      setError(err.message || 'Erreur lors du chargement du dashboard');
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  // Fallback pour récupérer les stats basiques
  const fetchBasicStats = async () => {
    try {
      const productsRes = await ProductService.getAllProducts();
      
      let products = [];
      if (productsRes?.success && productsRes.data) {
        products = Array.isArray(productsRes.data) ? productsRes.data : 
                   Array.isArray(productsRes.data.data) ? productsRes.data.data : [];
      }

      // Calculer les stats localement
      const totalProducts = products.length;
      const stockValue = products.reduce((sum, p) => {
        const qty = p.stock?.quantity || 0;
        const price = p.pricing?.sellingPrice || 0;
        return sum + (qty * price);
      }, 0);

      const lowStockAlerts = products.filter(p => {
        const qty = p.stock?.quantity || 0;
        const min = p.stock?.minThreshold || 0;
        return qty > 0 && qty <= min;
      }).length;

      setStats({
        totalProducts,
        stockValue,
        lowStockAlerts,
        pendingOrders: 0,
        trends: {
          products: '+0%',
          value: '+0%',
          alerts: '+0%',
          orders: '+0%'
        }
      });

      // Générer des alertes locales
      const alerts = products
        .filter(p => {
          const qty = p.stock?.quantity || 0;
          const min = p.stock?.minThreshold || 0;
          return qty <= min;
        })
        .slice(0, 5)
        .map(p => ({
          _id: p._id,
          product: {
            _id: p._id,
            name: p.name,
            sku: p.sku
          },
          quantity: p.stock?.quantity || 0,
          threshold: p.stock?.minThreshold || 0,
          status: (p.stock?.quantity || 0) === 0 ? 'critical' : 
                  (p.stock?.quantity || 0) <= (p.stock?.minThreshold || 0) / 2 ? 'critical' : 'warning'
        }));

      setStockAlerts(alerts);

    } catch (err) {
      console.error('Erreur stats basiques:', err);
    }
  };

  // ==================== EFFECTS ====================
  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod]);

  // ==================== REFRESH ====================
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
    toast.success('Dashboard actualisé');
  };

  // ==================== HANDLERS ====================
  const handleViewProduct = (productId) => {
    navigate(`/inventory?product=${productId}`);
  };

  const handleAddProduct = () => {
    navigate('/inventory?action=add');
  };

  const handleNewOrder = () => {
    navigate('/orders?action=add');
  };

  const handleViewPredictions = () => {
    navigate('/analytics');
  };

  // ==================== RENDER LOADING ====================
  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-base-content/60">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  // ==================== RENDER ERROR ====================
  if (error && stats.totalProducts === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="card bg-base-100 shadow-xl w-full max-w-md">
          <div className="card-body text-center">
            <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
            <h2 className="card-title justify-center">Erreur de chargement</h2>
            <p className="text-base-content/60">{error}</p>
            <div className="card-actions justify-center mt-4">
              <button className="btn btn-primary" onClick={fetchDashboardData}>
                <RefreshCw size={20} />
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== PREPARE STATS FOR DISPLAY ====================
  const displayStats = [
    {
      title: 'Total Produits',
      value: stats.totalProducts?.toLocaleString('fr-FR') || '0',
      change: stats.trends?.products || '+0%',
      trend: stats.trends?.products?.startsWith('+') ? 'up' : 'down',
      icon: Package,
      color: 'bg-blue-500'
    },
    {
      title: 'Valeur du Stock',
      value: `${(stats.stockValue || 0).toLocaleString('fr-FR')} FCFA`,
      change: stats.trends?.value || '+0%',
      trend: stats.trends?.value?.startsWith('+') ? 'up' : 'down',
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      title: 'Alertes Stock Bas',
      value: (stats.lowStockAlerts || 0).toString(),
      change: stats.trends?.alerts || '0%',
      trend: stats.trends?.alerts?.startsWith('-') ? 'up' : 'down',
      icon: AlertTriangle,
      color: 'bg-orange-500'
    },
    {
      title: 'Commandes en attente',
      value: (stats.pendingOrders || 0).toString(),
      change: stats.trends?.orders || '+0%',
      trend: stats.trends?.orders?.startsWith('+') ? 'up' : 'down',
      icon: ShoppingCart,
      color: 'bg-purple-500'
    }
  ];

  // ==================== MAIN RENDER ====================
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-base-content/60 mt-1">
            Vue d'ensemble de votre inventaire
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayStats.map((stat, index) => (
          <StatCard key={index} {...stat} loading={loading && refreshing} />
        ))}
      </div>

      {/* Alertes et Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alertes Stock Critique */}
        <div className="card bg-base-100 shadow-lg lg:col-span-2">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h2 className="card-title">Alertes Stock Critique</h2>
              <button 
                className="btn btn-ghost btn-sm gap-2"
                onClick={() => navigate('/inventory?filter=low_stock')}
              >
                <Filter size={16} />
                Voir tout
              </button>
            </div>
            
            {loading && refreshing ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : stockAlerts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Produit</th>
                      <th>Quantité</th>
                      <th>Seuil</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockAlerts.map((alert) => (
                      <tr key={alert._id} className="hover">
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="avatar placeholder">
                              <div className="bg-neutral-focus text-neutral-content rounded w-10">
                                <Box size={18} />
                              </div>
                            </div>
                            <div>
                              <span className="font-medium">{alert.product?.name || 'Produit'}</span>
                              {alert.product?.sku && (
                                <div className="text-xs text-base-content/60 font-mono">
                                  {alert.product.sku}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="font-bold">{alert.quantity}</span>
                        </td>
                        <td className="text-base-content/60">{alert.threshold}</td>
                        <td>
                          <div className={`badge ${alert.status === 'critical' ? 'badge-error' : 'badge-warning'} gap-2`}>
                            <AlertTriangle size={12} />
                            {alert.status === 'critical' ? 'Critique' : 'Attention'}
                          </div>
                        </td>
                        <td>
                          <div className="flex gap-2">
                            <button 
                              className="btn btn-ghost btn-xs" 
                              title="Voir détails"
                              onClick={() => handleViewProduct(alert.product?._id)}
                            >
                              <Eye size={16} />
                            </button>
                            <button 
                              className="btn btn-primary btn-xs"
                              onClick={handleNewOrder}
                            >
                              Commander
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-base-content/60">
                <AlertTriangle size={48} className="mx-auto mb-4 opacity-20" />
                <p>Aucune alerte de stock pour le moment</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions Rapides */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title mb-4">Actions Rapides</h2>
            <div className="space-y-3">
              <button 
                className="btn btn-primary w-full justify-start gap-3"
                onClick={handleAddProduct}
              >
                <Plus size={20} />
                Ajouter Produit
              </button>
              <button 
                className="btn btn-outline w-full justify-start gap-3"
                onClick={handleNewOrder}
              >
                <ShoppingCart size={20} />
                Nouvelle Commande
              </button>
              <button 
                className="btn btn-outline w-full justify-start gap-3"
                onClick={handleViewPredictions}
              >
                <Brain size={20} />
                Prédictions IA
              </button>
            </div>

            <div className="divider"></div>

            {/* Suggestions IA */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-base-content/70">Suggestions IA</h3>
              
              {aiInsights.length > 0 ? (
                aiInsights.slice(0, 2).map((insight, index) => (
                  <div 
                    key={index}
                    className={`alert ${
                      insight.type === 'opportunity' ? 'alert-info' :
                      insight.type === 'warning' ? 'alert-warning' : 
                      'alert-success'
                    } shadow-lg`}
                  >
                    <div>
                      <span className="text-sm">{insight.message}</span>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className="alert alert-info shadow-lg">
                    <div>
                      <span className="text-sm">
                        📊 Analysez vos tendances avec l'IA pour des recommandations personnalisées
                      </span>
                    </div>
                  </div>
                  <div className="alert alert-success shadow-lg">
                    <div>
                      <span className="text-sm">
                        ✨ Activez les prédictions IA pour optimiser votre stock
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Activité Récente et Top Produits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activité Récente */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title mb-4">Activité Récente</h2>
            
            {loading && refreshing ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div 
                    key={activity._id} 
                    className="flex items-start gap-4 p-3 hover:bg-base-200 rounded-lg transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${
                      activity.type === 'in' ? 'bg-success/20 text-success' :
                      activity.type === 'out' ? 'bg-warning/20 text-warning' : 
                      activity.type === 'order' ? 'bg-info/20 text-info' :
                      'bg-primary/20 text-primary'
                    }`}>
                      {activity.type === 'alert' ? (
                        <AlertTriangle size={20} />
                      ) : activity.type === 'order' ? (
                        <ShoppingCart size={20} />
                      ) : (
                        <Package size={20} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{activity.action || 'Action'}</p>
                      <p className="text-sm text-base-content/70 truncate">
                        {activity.product?.name || activity.description || 'Produit'}
                      </p>
                      {activity.quantity && (
                        <p className="text-sm">
                          Quantité: <span className="font-semibold">{activity.quantity}</span>
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-base-content/50 whitespace-nowrap">
                      {activity.time || new Date(activity.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-base-content/60">
                <Activity size={48} className="mx-auto mb-4 opacity-20" />
                <p>Aucune activité récente</p>
              </div>
            )}
          </div>
        </div>

        {/* Produits les Plus Actifs */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title mb-4">Produits les Plus Actifs</h2>
            
            {loading && refreshing ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : topProducts.length > 0 ? (
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product._id || index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-base-content/60">
                          Stock: {product.stock || 0} • 
                          Valeur: {(product.value || 0).toLocaleString('fr-FR')} FCFA
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-primary">
                          {product.movement || 0}%
                        </p>
                        <p className="text-xs text-base-content/60">Mouvement</p>
                      </div>
                    </div>
                    <progress 
                      className="progress progress-primary w-full" 
                      value={product.movement || 0} 
                      max="100"
                    ></progress>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-base-content/60">
                <Package size={48} className="mx-auto mb-4 opacity-20" />
                <p>Aucun produit actif</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;