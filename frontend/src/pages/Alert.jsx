import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  TrendingDown,
  AlertCircle,
  Search,
  X,
  Loader2,
  RefreshCw,
  Settings,
  Trash2,
  Eye
} from 'lucide-react';
import { AlertService } from '../services/alertService';
import AlertSettingsModal from '../components/common/Alerts/alertSettingModal';
import toast from 'react-hot-toast';

const Alerts = () => {
  // ==================== STATE ====================
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedTab, setSelectedTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    bySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
    byType: {}
  });

  // ==================== FETCH ALERTS ====================
  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError(null);

      const [alertsRes, countsRes] = await Promise.all([
        AlertService.getAllAlerts(),
        AlertService.getAlertsCount()
      ]);

      if (alertsRes.success && alertsRes.data) {
        setAlerts(alertsRes.data);
      } else {
        setAlerts([]);
      }

      if (countsRes.success && countsRes.data) {
        setStats(countsRes.data);
      }

    } catch (err) {
      console.error('Erreur chargement alertes:', err);
      setError(err.message || 'Erreur lors du chargement des alertes');
      toast.error('Erreur lors du chargement des alertes');
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  // ==================== REFRESH ====================
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAlerts();
    setRefreshing(false);
    toast.success('Alertes actualisées');
  };

  // ==================== MARK AS READ ====================
  const handleMarkAsRead = async (alertId) => {
    try {
      await AlertService.markAsRead(alertId);
      
      setAlerts(alerts.map(alert =>
        alert._id === alertId ? { ...alert, isRead: true } : alert
      ));

      toast.success('Alerte marquée comme lue');
    } catch (err) {
      console.error('Erreur marquage alerte:', err);
      toast.error('Erreur lors du marquage');
    }
  };

  // ==================== MARK ALL AS READ ====================
  const handleMarkAllAsRead = async () => {
    try {
      await AlertService.markAllAsRead();
      
      setAlerts(alerts.map(alert => ({ ...alert, isRead: true })));
      
      toast.success('Toutes les alertes ont été marquées comme lues');
      fetchAlerts(); // Refresh stats
    } catch (err) {
      console.error('Erreur marquage toutes:', err);
      toast.error('Erreur lors du marquage');
    }
  };

  // ==================== DISMISS ALERT ====================
  const handleDismissAlert = async (alertId) => {
    try {
      await AlertService.dismissAlert(alertId);
      
      setAlerts(alerts.filter(alert => alert._id !== alertId));
      
      toast.success('Alerte ignorée');
      fetchAlerts(); // Refresh stats
    } catch (err) {
      console.error('Erreur suppression alerte:', err);
      toast.error('Erreur lors de la suppression');
    }
  };

  // ==================== DELETE ALERT ====================
  const handleDeleteAlert = async (alertId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette alerte ?')) {
      return;
    }

    try {
      await AlertService.deleteAlert(alertId);
      
      setAlerts(alerts.filter(alert => alert._id !== alertId));
      
      toast.success('Alerte supprimée');
      fetchAlerts(); // Refresh stats
    } catch (err) {
      console.error('Erreur suppression alerte:', err);
      toast.error('Erreur lors de la suppression');
    }
  };

  // ==================== CLEAR ALL ====================
  const handleClearAll = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer toutes les alertes lues ?')) {
      return;
    }

    try {
      await AlertService.clearAllAlerts();
      
      toast.success('Alertes nettoyées');
      fetchAlerts();
    } catch (err) {
      console.error('Erreur nettoyage:', err);
      toast.error('Erreur lors du nettoyage');
    }
  };

  // ==================== ALERT HELPERS ====================
  const getAlertIcon = (type) => {
    const icons = {
      low_stock: AlertTriangle,
      out_of_stock: XCircle,
      overstock: Package,
      expiring_soon: Clock,
      expired: XCircle,
      anomaly: AlertCircle,
      price_change: TrendingDown,
      new_order: Package,
      order_status: CheckCircle,
      payment_due: AlertCircle,
      supplier_issue: AlertTriangle,
      system: Bell,
      ai_insight: Bell
    };
    return icons[type] || Bell;
  };

  const getAlertColor = (severity) => {
    const colors = {
      low: 'bg-info/10 border-info/20',
      medium: 'bg-warning/10 border-warning/20',
      high: 'bg-warning/10 border-warning/20',
      critical: 'bg-error/10 border-error/20'
    };
    return colors[severity] || colors.medium;
  };

  const getAlertIconColor = (severity) => {
    const colors = {
      low: 'text-info',
      medium: 'text-warning',
      high: 'text-warning',
      critical: 'text-error'
    };
    return colors[severity] || colors.medium;
  };

  const getSeverityBadge = (severity) => {
    const badges = {
      low: { class: 'badge-info', text: 'Basse' },
      medium: { class: 'badge-warning', text: 'Moyenne' },
      high: { class: 'badge-warning', text: 'Haute' },
      critical: { class: 'badge-error', text: 'Critique' }
    };
    return badges[severity] || badges.medium;
  };

  // ==================== FILTERING ====================
  const filteredAlerts = alerts.filter(alert => {
    // Tab filter
    const matchTab =
      selectedTab === 'all' ||
      (selectedTab === 'unread' && !alert.isRead) ||
      (selectedTab === 'critical' && alert.severity === 'critical') ||
      (selectedTab === 'read' && alert.isRead);

    // Search filter
    const matchSearch =
      alert.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.relatedTo?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchTab && matchSearch;
  });

  // ==================== RENDER LOADING ====================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-base-content/60">Chargement des alertes...</p>
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
              <button className="btn btn-primary" onClick={fetchAlerts}>
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
            <Bell size={32} className="text-warning" />
            Alertes
          </h1>
          <p className="text-base-content/60 mt-1">
            Surveillez et gérez vos alertes de stock
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn btn-ghost gap-2"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
            Actualiser
          </button>
          <button
            className="btn btn-primary gap-2"
            onClick={() => setShowSettingsModal(true)}
          >
            <Settings size={20} />
            Paramètres
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-warning">
            <Bell size={32} />
          </div>
          <div className="stat-title">Total</div>
          <div className="stat-value text-warning">{stats.total}</div>
          <div className="stat-desc">Toutes les alertes</div>
        </div>

        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-info">
            <AlertCircle size={32} />
          </div>
          <div className="stat-title">Non lues</div>
          <div className="stat-value text-info">{stats.unread}</div>
          <div className="stat-desc">À consulter</div>
        </div>

        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-error">
            <AlertTriangle size={32} />
          </div>
          <div className="stat-title">Critiques</div>
          <div className="stat-value text-error">{stats.bySeverity?.critical || 0}</div>
          <div className="stat-desc">Action immédiate requise</div>
        </div>

        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-success">
            <CheckCircle size={32} />
          </div>
          <div className="stat-title">Lues</div>
          <div className="stat-value text-success">{stats.total - stats.unread}</div>
          <div className="stat-desc">Traitées</div>
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
                Toutes ({stats.total})
              </button>
              <button
                className={`tab ${selectedTab === 'unread' ? 'tab-active' : ''}`}
                onClick={() => setSelectedTab('unread')}
              >
                Non lues ({stats.unread})
              </button>
              <button
                className={`tab ${selectedTab === 'critical' ? 'tab-active' : ''}`}
                onClick={() => setSelectedTab('critical')}
              >
                Critiques ({stats.bySeverity?.critical || 0})
              </button>
              <button
                className={`tab ${selectedTab === 'read' ? 'tab-active' : ''}`}
                onClick={() => setSelectedTab('read')}
              >
                Lues
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
          const Icon = getAlertIcon(alert.type);
          const severityBadge = getSeverityBadge(alert.severity);

          return (
            <div
              key={alert._id}
              className={`card ${getAlertColor(alert.severity)} border shadow-lg hover:shadow-xl transition-shadow ${
                !alert.isRead ? 'ring-2 ring-primary ring-offset-2' : ''
              }`}
            >
              <div className="card-body">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={`p-3 rounded-lg ${
                      alert.severity === 'critical'
                        ? 'bg-error/20'
                        : alert.severity === 'high' || alert.severity === 'medium'
                        ? 'bg-warning/20'
                        : 'bg-info/20'
                    }`}
                  >
                    <Icon className={getAlertIconColor(alert.severity)} size={20} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                          {alert.title}
                          {!alert.isRead && (
                            <span className="badge badge-primary badge-sm">Nouveau</span>
                          )}
                        </h3>
                        <p className="text-base-content/70 mt-1">{alert.message}</p>

                        <div className="flex flex-wrap items-center gap-4 mt-3">
                          {alert.relatedTo?.name && (
                            <div className="flex items-center gap-2">
                              <Package size={16} className="text-base-content/60" />
                              <span className="text-sm font-semibold">{alert.relatedTo.name}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-sm text-base-content/60">
                            <Clock size={14} />
                            {new Date(alert.createdAt).toLocaleString('fr-FR')}
                          </div>
                        </div>
                      </div>

                      {/* Severity Badge */}
                      <div className="flex flex-col items-end gap-2">
                        <div className={`badge ${severityBadge.class}`}>
                          {severityBadge.text}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-4">
                      {!alert.isRead && (
                        <button
                          className="btn btn-sm btn-success gap-2"
                          onClick={() => handleMarkAsRead(alert._id)}
                        >
                          <CheckCircle size={16} />
                          Marquer comme lue
                        </button>
                      )}
                      <button
                        className="btn btn-sm btn-ghost gap-2"
                        onClick={() => handleDismissAlert(alert._id)}
                      >
                        <XCircle size={16} />
                        Ignorer
                      </button>
                      <button
                        className="btn btn-sm btn-ghost text-error gap-2"
                        onClick={() => handleDeleteAlert(alert._id)}
                      >
                        <Trash2 size={16} />
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Empty State */}
        {filteredAlerts.length === 0 && (
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body text-center py-12">
              <CheckCircle size={48} className="mx-auto text-success mb-4" />
              <h3 className="text-xl font-bold">Aucune alerte</h3>
              <p className="text-base-content/60">
                {selectedTab === 'all'
                  ? 'Aucune alerte trouvée'
                  : selectedTab === 'unread'
                  ? 'Aucune alerte non lue'
                  : selectedTab === 'critical'
                  ? 'Aucune alerte critique'
                  : 'Aucune alerte lue'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {stats.unread > 0 && (
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h3 className="card-title">Actions rapides</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <button
                className="btn btn-outline btn-success gap-2 justify-start"
                onClick={handleMarkAllAsRead}
              >
                <CheckCircle size={20} />
                <div className="text-left">
                  <div className="font-semibold">Tout marquer comme lu</div>
                  <div className="text-xs opacity-70">{stats.unread} alertes</div>
                </div>
              </button>

              <button
                className="btn btn-outline btn-error gap-2 justify-start"
                onClick={handleClearAll}
              >
                <Trash2 size={20} />
                <div className="text-left">
                  <div className="font-semibold">Nettoyer les alertes lues</div>
                  <div className="text-xs opacity-70">Supprimer anciennes</div>
                </div>
              </button>

              <button
                className="btn btn-outline btn-primary gap-2 justify-start"
                onClick={() => setShowSettingsModal(true)}
              >
                <Settings size={20} />
                <div className="text-left">
                  <div className="font-semibold">Configurer</div>
                  <div className="text-xs opacity-70">Paramètres notifications</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <AlertSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onSuccess={() => {
          toast.success('Paramètres enregistrés');
          fetchAlerts();
        }}
      />
    </div>
  );
};

export default Alerts;