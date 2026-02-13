import React, { useState } from 'react';
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  TrendingDown,
  AlertCircle,
  Filter,
  Search,
  X
} from 'lucide-react';

const Alerts = () => {
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Données des alertes
  const alerts = [
    {
      id: 1,
      type: 'critical',
      title: 'Rupture de stock imminente',
      product: 'iPad Pro 12.9',
      message: 'Stock critique - Seulement 2 unités restantes',
      quantity: 2,
      threshold: 8,
      time: 'Il y a 30 min',
      status: 'active',
      priority: 'high'
    },
    {
      id: 2,
      type: 'warning',
      title: 'Stock bas détecté',
      product: 'MacBook Air M2',
      message: 'Le stock est en dessous du seuil recommandé',
      quantity: 8,
      threshold: 10,
      time: 'Il y a 2h',
      status: 'active',
      priority: 'medium'
    },
    {
      id: 3,
      type: 'critical',
      title: 'Rupture de stock',
      product: 'Samsung Monitor 27"',
      message: 'Produit en rupture de stock',
      quantity: 0,
      threshold: 8,
      time: 'Il y a 5h',
      status: 'active',
      priority: 'high'
    },
    {
      id: 4,
      type: 'warning',
      title: 'Stock bas',
      product: 'Logitech MX Master',
      message: 'Stock faible - Réapprovisionnement recommandé',
      quantity: 5,
      threshold: 15,
      time: 'Il y a 1j',
      status: 'active',
      priority: 'medium'
    },
    {
      id: 5,
      type: 'info',
      title: 'Prédiction IA',
      product: 'iPhone 14 Pro',
      message: 'Augmentation de la demande prévue dans 2 semaines',
      quantity: 45,
      threshold: 20,
      time: 'Il y a 2j',
      status: 'active',
      priority: 'low'
    },
    {
      id: 6,
      type: 'warning',
      title: 'Stock bas résolu',
      product: 'AirPods Pro',
      message: 'Le stock a été réapprovisionné',
      quantity: 67,
      threshold: 30,
      time: 'Il y a 3j',
      status: 'resolved',
      priority: 'medium'
    },
    {
      id: 7,
      type: 'critical',
      title: 'Alerte critique résolue',
      product: 'Dell XPS 15',
      message: 'Commande reçue - Stock normalisé',
      quantity: 15,
      threshold: 12,
      time: 'Il y a 5j',
      status: 'resolved',
      priority: 'high'
    },
  ];

  const getAlertIcon = (type) => {
    const icons = {
      critical: <AlertTriangle className="text-error" size={20} />,
      warning: <AlertCircle className="text-warning" size={20} />,
      info: <Bell className="text-info" size={20} />
    };
    return icons[type] || icons.info;
  };

  const getAlertColor = (type) => {
    const colors = {
      critical: 'bg-error/10 border-error/20',
      warning: 'bg-warning/10 border-warning/20',
      info: 'bg-info/10 border-info/20'
    };
    return colors[type] || colors.info;
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      high: { class: 'badge-error', text: 'Haute' },
      medium: { class: 'badge-warning', text: 'Moyenne' },
      low: { class: 'badge-info', text: 'Basse' }
    };
    return badges[priority] || badges.low;
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchTab = selectedTab === 'all' || 
                     (selectedTab === 'active' && alert.status === 'active') ||
                     (selectedTab === 'resolved' && alert.status === 'resolved') ||
                     (selectedTab === 'critical' && alert.type === 'critical');
    const matchSearch = alert.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       alert.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTab && matchSearch;
  });

  const activeAlerts = alerts.filter(a => a.status === 'active');
  const criticalAlerts = alerts.filter(a => a.type === 'critical' && a.status === 'active');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <AlertTriangle size={32} className="text-warning" />
            Alertes
          </h1>
          <p className="text-base-content/60 mt-1">
            Surveillez et gérez vos alertes de stock
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-warning">
            <Bell size={32} />
          </div>
          <div className="stat-title">Alertes actives</div>
          <div className="stat-value text-warning">{activeAlerts.length}</div>
          <div className="stat-desc">À traiter</div>
        </div>
        
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-error">
            <AlertTriangle size={32} />
          </div>
          <div className="stat-title">Critiques</div>
          <div className="stat-value text-error">{criticalAlerts.length}</div>
          <div className="stat-desc">Action immédiate requise</div>
        </div>
        
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-success">
            <CheckCircle size={32} />
          </div>
          <div className="stat-title">Résolues</div>
          <div className="stat-value text-success">
            {alerts.filter(a => a.status === 'resolved').length}
          </div>
          <div className="stat-desc">Cette semaine</div>
        </div>
        
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-info">
            <Clock size={32} />
          </div>
          <div className="stat-title">Temps moyen</div>
          <div className="stat-value text-info">2.4h</div>
          <div className="stat-desc">Résolution</div>
        </div>
      </div>

      {/* Tabs and Search */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Tabs */}
            <div className="tabs tabs-boxed">
              <button 
                className={`tab ${selectedTab === 'all' ? 'tab-active' : ''}`}
                onClick={() => setSelectedTab('all')}
              >
                Toutes
              </button>
              <button 
                className={`tab ${selectedTab === 'active' ? 'tab-active' : ''}`}
                onClick={() => setSelectedTab('active')}
              >
                Actives ({activeAlerts.length})
              </button>
              <button 
                className={`tab ${selectedTab === 'critical' ? 'tab-active' : ''}`}
                onClick={() => setSelectedTab('critical')}
              >
                Critiques ({criticalAlerts.length})
              </button>
              <button 
                className={`tab ${selectedTab === 'resolved' ? 'tab-active' : ''}`}
                onClick={() => setSelectedTab('resolved')}
              >
                Résolues
              </button>
            </div>

            {/* Search */}
            <div className="form-control">
              <div className="input-group">
                <span className="bg-base-200">
                  <Search size={20} />
                </span>
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="input input-bordered w-full md:w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button 
                    className="btn btn-ghost btn-square"
                    onClick={() => setSearchQuery('')}
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => {
          const priorityBadge = getPriorityBadge(alert.priority);
          
          return (
            <div 
              key={alert.id} 
              className={`card ${getAlertColor(alert.type)} border shadow-lg hover:shadow-xl transition-shadow`}
            >
              <div className="card-body">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`p-3 rounded-lg ${
                    alert.type === 'critical' ? 'bg-error/20' :
                    alert.type === 'warning' ? 'bg-warning/20' : 'bg-info/20'
                  }`}>
                    {getAlertIcon(alert.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{alert.title}</h3>
                        <p className="text-base-content/70 mt-1">{alert.message}</p>
                        
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-2">
                            <Package size={16} className="text-base-content/60" />
                            <span className="text-sm font-semibold">{alert.product}</span>
                          </div>
                          <div className="text-sm text-base-content/60">
                            Stock: <span className="font-semibold">{alert.quantity}</span> / Seuil: {alert.threshold}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-base-content/60">
                            <Clock size={14} />
                            {alert.time}
                          </div>
                        </div>
                      </div>

                      {/* Priority and Status */}
                      <div className="flex flex-col items-end gap-2">
                        <div className={`badge ${priorityBadge.class}`}>
                          {priorityBadge.text}
                        </div>
                        {alert.status === 'resolved' && (
                          <div className="badge badge-success gap-2">
                            <CheckCircle size={12} />
                            Résolue
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {alert.status === 'active' && (
                      <div className="flex items-center gap-2 mt-4">
                        <button className="btn btn-sm btn-primary gap-2">
                          <Package size={16} />
                          Commander
                        </button>
                        <button className="btn btn-sm btn-success gap-2">
                          <CheckCircle size={16} />
                          Marquer comme résolue
                        </button>
                        <button className="btn btn-sm btn-ghost gap-2">
                          <XCircle size={16} />
                          Ignorer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredAlerts.length === 0 && (
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body text-center py-12">
              <CheckCircle size={48} className="mx-auto text-success mb-4" />
              <h3 className="text-xl font-bold">Aucune alerte</h3>
              <p className="text-base-content/60">
                {selectedTab === 'all' ? 'Aucune alerte trouvée' : 
                 selectedTab === 'active' ? 'Aucune alerte active' :
                 selectedTab === 'critical' ? 'Aucune alerte critique' :
                 'Aucune alerte résolue'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h3 className="card-title">Actions rapides</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <button className="btn btn-outline btn-error gap-2 justify-start">
              <AlertTriangle size={20} />
              <div className="text-left">
                <div className="font-semibold">Traiter les critiques</div>
                <div className="text-xs opacity-70">{criticalAlerts.length} alertes</div>
              </div>
            </button>
            
            <button className="btn btn-outline btn-warning gap-2 justify-start">
              <TrendingDown size={20} />
              <div className="text-left">
                <div className="font-semibold">Stock bas</div>
                <div className="text-xs opacity-70">
                  {alerts.filter(a => a.type === 'warning' && a.status === 'active').length} produits
                </div>
              </div>
            </button>
            
            <button className="btn btn-outline btn-success gap-2 justify-start">
              <CheckCircle size={20} />
              <div className="text-left">
                <div className="font-semibold">Tout marquer comme lu</div>
                <div className="text-xs opacity-70">{activeAlerts.length} alertes</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alerts;