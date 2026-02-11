import React from 'react';
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
  Box
} from 'lucide-react';

const Dashboard = () => {
  // Données statistiques
  const stats = [
    {
      title: 'Total Produits',
      value: '1,234',
      change: '+12%',
      trend: 'up',
      icon: Package,
      color: 'bg-blue-500'
    },
    {
      title: 'Valeur du Stock',
      value: '45,678 FCFA',
      change: '+8%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      title: 'Alertes Stock Bas',
      value: '23',
      change: '-5%',
      trend: 'down',
      icon: AlertTriangle,
      color: 'bg-orange-500'
    },
    {
      title: 'Commandes en attente',
      value: '56',
      change: '+15%',
      trend: 'up',
      icon: ShoppingCart,
      color: 'bg-purple-500'
    }
  ];

  // Alertes de stock
  const stockAlerts = [
    { id: 1, product: 'Laptop Dell XPS 15', quantity: 5, threshold: 10, status: 'warning' },
    { id: 2, product: 'Souris Logitech MX', quantity: 2, threshold: 15, status: 'critical' },
    { id: 3, product: 'Clavier Mécanique', quantity: 8, threshold: 12, status: 'warning' },
    { id: 4, product: 'Écran Samsung 27"', quantity: 3, threshold: 8, status: 'critical' },
  ];

  // Activités récentes
  const recentActivity = [
    { id: 1, action: 'Entrée stock', product: 'iPhone 14 Pro', quantity: 50, time: 'Il y a 2h', type: 'in' },
    { id: 2, action: 'Sortie stock', product: 'MacBook Air M2', quantity: 15, time: 'Il y a 3h', type: 'out' },
    { id: 3, action: 'Alerte IA', product: 'Stock faible détecté', quantity: null, time: 'Il y a 5h', type: 'alert' },
    { id: 4, action: 'Entrée stock', product: 'Samsung Galaxy S23', quantity: 30, time: 'Il y a 6h', type: 'in' },
    { id: 5, action: 'Sortie stock', product: 'iPad Pro 12.9', quantity: 8, time: 'Il y a 8h', type: 'out' },
  ];

  // Produits les plus actifs
  const topProducts = [
    { name: 'iPhone 14 Pro', stock: 120, value: '95,000 €', movement: 85 },
    { name: 'MacBook Air M2', stock: 65, value: '78,000 €', movement: 72 },
    { name: 'Samsung Galaxy S23', stock: 90, value: '67,500 €', movement: 68 },
    { name: 'iPad Pro 12.9', stock: 45, value: '54,000 €', movement: 55 },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-base-content/60 font-medium">{stat.title}</p>
                    <h3 className="text-3xl font-bold mt-2">{stat.value}</h3>
                    <div className="flex items-center gap-1 mt-2">
                      {stat.trend === 'up' ? (
                        <TrendingUp size={16} className="text-success" />
                      ) : (
                        <TrendingDown size={16} className="text-error" />
                      )}
                      <span className={`text-sm font-semibold ${stat.trend === 'up' ? 'text-success' : 'text-error'}`}>
                        {stat.change}
                      </span>
                      <span className="text-sm text-base-content/60">vs mois dernier</span>
                    </div>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon size={24} className="text-white" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Alertes et Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alertes Stock Critique */}
        <div className="card bg-base-100 shadow-lg lg:col-span-2">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h2 className="card-title">Alertes Stock Critique</h2>
              <button className="btn btn-ghost btn-sm gap-2">
                <Filter size={16} />
                Filtrer
              </button>
            </div>
            
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
                    <tr key={alert.id} className="hover">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar placeholder">
                            <div className="bg-neutral-focus text-neutral-content rounded w-10">
                              <Box size={18} />
                            </div>
                          </div>
                          <span className="font-medium">{alert.product}</span>
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
                          <button className="btn btn-ghost btn-xs" title="Voir détails">
                            <Eye size={16} />
                          </button>
                          <button className="btn btn-primary btn-xs">
                            Commander
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Actions Rapides */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title mb-4">Actions Rapides</h2>
            <div className="space-y-3">
              <button className="btn btn-primary w-full justify-start gap-3">
                <Plus size={20} />
                Ajouter Produit
              </button>
              <button className="btn btn-outline w-full justify-start gap-3">
                <ShoppingCart size={20} />
                Nouvelle Commande
              </button>
              <button className="btn btn-outline w-full justify-start gap-3">
                <Activity size={20} />
                Prédictions IA
              </button>
            </div>

            <div className="divider"></div>

            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-base-content/70">Suggestions IA</h3>
              <div className="alert alert-info shadow-lg">
                <div>
                  <span className="text-sm">
                    📊 Tendance détectée: Augmentation des ventes de 25% sur les smartphones
                  </span>
                </div>
              </div>
              <div className="alert alert-warning shadow-lg">
                <div>
                  <span className="text-sm">
                    ⚠️ Recommandation: Réapprovisionner les accessoires informatiques
                  </span>
                </div>
              </div>
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
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 p-3 hover:bg-base-200 rounded-lg transition-colors">
                  <div className={`p-2 rounded-lg ${
                    activity.type === 'in' ? 'bg-success/20 text-success' :
                    activity.type === 'out' ? 'bg-warning/20 text-warning' : 
                    'bg-info/20 text-info'
                  }`}>
                    {activity.type === 'alert' ? (
                      <Activity size={20} />
                    ) : (
                      <Package size={20} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-base-content/70 truncate">{activity.product}</p>
                    {activity.quantity && (
                      <p className="text-sm">
                        Quantité: <span className="font-semibold">{activity.quantity}</span>
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-base-content/50 whitespace-nowrap">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Produits les Plus Actifs */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title mb-4">Produits les Plus Actifs</h2>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-base-content/60">
                        Stock: {product.stock} • Valeur: {product.value}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-primary">{product.movement}%</p>
                      <p className="text-xs text-base-content/60">Mouvement</p>
                    </div>
                  </div>
                  <progress 
                    className="progress progress-primary w-full" 
                    value={product.movement} 
                    max="100"
                  ></progress>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
