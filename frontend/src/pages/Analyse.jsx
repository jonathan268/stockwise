import React, { useState } from 'react';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Brain,
  Target,
  Zap,
  Calendar,
  DollarSign,
  Package,
  ShoppingCart,
  BarChart3,
  PieChart
} from 'lucide-react';

const Analytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  // Données de prédictions IA
  const predictions = [
    {
      id: 1,
      product: 'iPhone 14 Pro',
      currentStock: 45,
      predictedDemand: 68,
      recommendation: 'Commander 30 unités',
      confidence: 92,
      trend: 'up',
      reason: 'Tendance saisonnière détectée'
    },
    {
      id: 2,
      product: 'MacBook Air M2',
      currentStock: 8,
      predictedDemand: 15,
      recommendation: 'Commander 12 unités',
      confidence: 87,
      trend: 'up',
      reason: 'Promotion à venir'
    },
    {
      id: 3,
      product: 'AirPods Pro',
      currentStock: 67,
      predictedDemand: 45,
      recommendation: 'Stock suffisant',
      confidence: 78,
      trend: 'down',
      reason: 'Baisse de demande prévue'
    },
  ];

  // Données de ventes
  const salesData = [
    { period: 'Lun', sales: 4500, orders: 23 },
    { period: 'Mar', sales: 5200, orders: 28 },
    { period: 'Mer', sales: 4800, orders: 25 },
    { period: 'Jeu', sales: 6100, orders: 32 },
    { period: 'Ven', sales: 7300, orders: 38 },
    { period: 'Sam', sales: 5900, orders: 31 },
    { period: 'Dim', sales: 4200, orders: 22 },
  ];

  // Top catégories
  const topCategories = [
    { name: 'Smartphones', value: 45, color: 'bg-primary' },
    { name: 'Ordinateurs', value: 30, color: 'bg-secondary' },
    { name: 'Accessoires', value: 15, color: 'bg-accent' },
    { name: 'Tablettes', value: 10, color: 'bg-info' },
  ];

  // Insights IA
  const aiInsights = [
    {
      id: 1,
      type: 'opportunity',
      icon: TrendingUp,
      title: 'Opportunité détectée',
      message: 'Les ventes de smartphones augmentent de 25% en moyenne',
      action: 'Augmenter le stock de 15%',
      confidence: 89
    },
    {
      id: 2,
      type: 'warning',
      icon: TrendingDown,
      title: 'Tendance à la baisse',
      message: 'Les accessoires informatiques montrent une baisse de 8%',
      action: 'Réduire les commandes futures',
      confidence: 76
    },
    {
      id: 3,
      type: 'info',
      icon: Brain,
      title: 'Pattern identifié',
      message: 'Pic de ventes récurrent tous les vendredis',
      action: 'Optimiser le stock pour le weekend',
      confidence: 94
    },
  ];

  return (
    <div className="space-y-6">
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
        
        {/* Period Selector */}
        <div className="flex items-center gap-2">
          <Calendar size={20} className="text-base-content/60" />
          <select 
            className="select select-bordered"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="24h">Dernières 24h</option>
            <option value="7d">7 derniers jours</option>
            <option value="30d">30 derniers jours</option>
            <option value="90d">90 derniers jours</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg rounded-lg border border-primary/20">
          <div className="stat-figure text-primary">
            <Brain size={32} />
          </div>
          <div className="stat-title">Précision IA</div>
          <div className="stat-value text-primary">94%</div>
          <div className="stat-desc">Sur les 30 derniers jours</div>
        </div>
        
        <div className="stat bg-gradient-to-br from-success/20 to-success/5 shadow-lg rounded-lg border border-success/20">
          <div className="stat-figure text-success">
            <TrendingUp size={32} />
          </div>
          <div className="stat-title">Prédictions positives</div>
          <div className="stat-value text-success">12</div>
          <div className="stat-desc">Opportunités détectées</div>
        </div>
        
        <div className="stat bg-gradient-to-br from-warning/20 to-warning/5 shadow-lg rounded-lg border border-warning/20">
          <div className="stat-figure text-warning">
            <Target size={32} />
          </div>
          <div className="stat-title">Actions recommandées</div>
          <div className="stat-value text-warning">8</div>
          <div className="stat-desc">À traiter cette semaine</div>
        </div>
        
        <div className="stat bg-gradient-to-br from-info/20 to-info/5 shadow-lg rounded-lg border border-info/20">
          <div className="stat-figure text-info">
            <Zap size={32} />
          </div>
          <div className="stat-title">Temps économisé</div>
          <div className="stat-value text-info">24h</div>
          <div className="stat-desc">Ce mois-ci</div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h2 className="card-title mb-4">
            <Brain className="text-primary" size={24} />
            Insights IA en temps réel
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {aiInsights.map((insight) => {
              const Icon = insight.icon;
              const bgColor = 
                insight.type === 'opportunity' ? 'bg-success/10 border-success/20' :
                insight.type === 'warning' ? 'bg-warning/10 border-warning/20' :
                'bg-info/10 border-info/20';
              const iconColor =
                insight.type === 'opportunity' ? 'text-success' :
                insight.type === 'warning' ? 'text-warning' :
                'text-info';
              
              return (
                <div key={insight.id} className={`card ${bgColor} border`}>
                  <div className="card-body">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${bgColor}`}>
                        <Icon size={20} className={iconColor} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{insight.title}</h3>
                        <p className="text-sm text-base-content/70 mt-1">{insight.message}</p>
                        <div className="mt-3">
                          <div className="text-xs text-base-content/60 mb-1">
                            Confiance: {insight.confidence}%
                          </div>
                          <progress 
                            className="progress progress-primary w-full h-1" 
                            value={insight.confidence} 
                            max="100"
                          ></progress>
                        </div>
                        <button className="btn btn-sm btn-outline w-full mt-3">
                          {insight.action}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title">
              <BarChart3 size={24} />
              Évolution des ventes
            </h2>
            <div className="mt-4 space-y-3">
              {salesData.map((day, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-12 text-sm font-semibold">{day.period}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-base-content/60">
                        {day.orders} commandes
                      </span>
                      <span className="text-sm font-semibold">{day.sales} FCFA</span>
                    </div>
                    <progress 
                      className="progress progress-primary w-full" 
                      value={day.sales} 
                      max="8000"
                    ></progress>
                  </div>
                </div>
              ))}
            </div>
            <div className="stats stats-horizontal shadow mt-4">
              <div className="stat">
                <div className="stat-title text-xs">Total</div>
                <div className="stat-value text-lg">
                  {salesData.reduce((sum, d) => sum + d.sales, 0).toLocaleString()} FCFA
                </div>
              </div>
              <div className="stat">
                <div className="stat-title text-xs">Moyenne</div>
                <div className="stat-value text-lg">
                  {Math.round(salesData.reduce((sum, d) => sum + d.sales, 0) / salesData.length).toLocaleString()} FCFA
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Chart */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title">
              <PieChart size={24} />
              Répartition par catégorie
            </h2>
            <div className="mt-4 space-y-4">
              {topCategories.map((category, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{category.name}</span>
                    <span className="text-sm font-bold">{category.value}%</span>
                  </div>
                  <progress 
                    className={`progress ${category.color} w-full`} 
                    value={category.value} 
                    max="100"
                  ></progress>
                </div>
              ))}
            </div>
            <div className="alert alert-info mt-6">
              <Brain size={20} />
              <span className="text-sm">
                Les smartphones représentent 45% de vos ventes. Considérez d'augmenter leur stock.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Predictions Table */}
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
                  <th>Stock actuel</th>
                  <th>Demande prévue</th>
                  <th>Confiance</th>
                  <th>Tendance</th>
                  <th>Recommandation</th>
                  <th>Raison</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((pred) => (
                  <tr key={pred.id} className="hover">
                    <td>
                      <div className="flex items-center gap-3">
                        <Package size={20} className="text-primary" />
                        <span className="font-semibold">{pred.product}</span>
                      </div>
                    </td>
                    <td className="font-bold">{pred.currentStock}</td>
                    <td className="font-bold text-primary">{pred.predictedDemand}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <progress 
                          className="progress progress-success w-20" 
                          value={pred.confidence} 
                          max="100"
                        ></progress>
                        <span className="text-sm font-semibold">{pred.confidence}%</span>
                      </div>
                    </td>
                    <td>
                      {pred.trend === 'up' ? (
                        <div className="badge badge-success gap-2">
                          <TrendingUp size={14} />
                          Hausse
                        </div>
                      ) : (
                        <div className="badge badge-warning gap-2">
                          <TrendingDown size={14} />
                          Baisse
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="font-semibold text-primary">{pred.recommendation}</span>
                    </td>
                    <td>
                      <span className="text-sm text-base-content/70">{pred.reason}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="btn btn-outline btn-primary gap-2 justify-start h-auto py-4">
          <Brain size={24} />
          <div className="text-left">
            <div className="font-semibold">Générer rapport IA</div>
            <div className="text-xs opacity-70">Analyse complète du mois</div>
          </div>
        </button>
        
        <button className="btn btn-outline btn-secondary gap-2 justify-start h-auto py-4">
          <Target size={24} />
          <div className="text-left">
            <div className="font-semibold">Optimiser le stock</div>
            <div className="text-xs opacity-70">Basé sur les prédictions</div>
          </div>
        </button>
        
        <button className="btn btn-outline btn-accent gap-2 justify-start h-auto py-4">
          <Zap size={24} />
          <div className="text-left">
            <div className="font-semibold">Appliquer recommandations</div>
            <div className="text-xs opacity-70">8 actions en attente</div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Analytics;