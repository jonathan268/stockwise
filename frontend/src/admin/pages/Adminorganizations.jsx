import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import {
  Package,
  Search,
  Download,
  Plus,
  Users,
  DollarSign,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Building,
  Calendar,
  Database,
  X,
  Activity,
  ShieldAlert,
  ShieldCheck,
  Globe
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminOrganizations = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('all');

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllOrganizations();
      setOrganizations(data);
      setError(null);
    } catch (err) {
      console.error("Erreur chargement orgs:", err);
      setError("Impossible de charger les organisations.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await adminService.updateOrganizationStatus(id, newStatus);
      toast.success("Statut mis à jour");
      fetchOrganizations();
    } catch (err) {
      toast.error("Échec de la mise à jour");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // Données des organisations
  const plans = ['all', 'free', 'basic', 'smart', 'premium'];

  const getPlanBadge = (plan) => {
    const badges = {
      premium: { class: 'badge-error', text: 'Premium' },
      smart: { class: 'badge-warning', text: 'Smart' },
      basic: { class: 'badge-info', text: 'Basic' },
      free: { class: 'badge-ghost', text: 'Free' }
    };
    return badges[plan?.toLowerCase()] || badges.free;
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { class: 'badge-success', text: 'Actif' },
      trial: { class: 'badge-info', text: 'Essai' },
      inactive: { class: 'badge-neutral', text: 'Inactif' },
      suspended: { class: 'badge-error', text: 'Suspendu' }
    };
    return badges[status] || { class: 'badge-ghost', text: status };
  };

  const filteredOrganizations = organizations.filter(org => {
    const matchSearch = 
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.owner?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.owner?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPlan = selectedPlan === 'all' || org.subscription?.plan === selectedPlan;
    return matchSearch && matchPlan;
  });

  const totalOrgs = organizations.length;
  const activeOrgs = organizations.filter(o => o.status === 'active').length;
  // Note: Revenu total and total products info will come from stats in dashboard usually
  // but we can calculate from items if they are all loaded
  const totalProducts = organizations.reduce((sum, o) => sum + (o.usage?.productsCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Package size={32} className="text-secondary" />
            Gestion des Organisations
          </h1>
          <p className="text-base-content/60 mt-1">
            Gérez toutes les organisations clientes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-outline gap-2">
            <Download size={20} />
            Exporter
          </button>
          <button className="btn btn-primary gap-2">
            <Plus size={20} />
            Nouvelle Organisation
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-secondary">
            <Package size={32} />
          </div>
          <div className="stat-title">Total Organisations</div>
          <div className="stat-value text-secondary">{totalOrgs}</div>
          <div className="stat-desc">{activeOrgs} actives</div>
        </div>
        
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-success">
            <TrendingUp size={32} />
          </div>
          <div className="stat-title">Utilisateurs</div>
          <div className="stat-value text-success">
            {organizations.reduce((sum, o) => sum + (o.usage?.usersCount || 0), 0)}
          </div>
          <div className="stat-desc">Plateforme</div>
        </div>
        
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-primary">
            <Database size={32} />
          </div>
          <div className="stat-title">Stockage Estimé</div>
          <div className="stat-value text-primary">
            {organizations.reduce((sum, o) => sum + (o.usage?.storageUsed || 0), 0).toFixed(1)} MB
          </div>
          <div className="stat-desc text-xs">Utilisé par tous</div>
        </div>
        
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-info">
            <Package size={32} />
          </div>
          <div className="stat-title">Produits</div>
          <div className="stat-value text-info">{totalProducts.toLocaleString()}</div>
          <div className="stat-desc">Total inventaire</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="form-control">
                <div className="input-group">
                  <span className="bg-base-200">
                    <Search size={20} />
                  </span>
                  <input
                    type="text"
                    placeholder="Rechercher par nom, propriétaire ou email..."
                    className="input input-bordered w-full"
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

            {/* Plan Filter */}
            <div className="form-control w-full md:w-48">
              <select 
                className="select select-bordered"
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
              >
                <option value="all">Tous les plans</option>
                {plans.slice(1).map(plan => (
                  <option key={plan} value={plan}>{plan}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Organizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredOrganizations.map((org) => {
          const planBadge = getPlanBadge(org.subscription?.plan || 'free');
          const statusBadge = getStatusBadge(org.status);
          const storageLimit = org.limits?.maxStorage || 50; // Default 50MB
          const usersLimit = org.limits?.maxUsers || 2;
          const productsLimit = org.limits?.maxProducts || 50;
          
          const storagePercent = (org.usage?.storageUsed / storageLimit) * 100;
          const usersPercent = (org.usage?.usersCount / usersLimit) * 100;
          const productsPercent = (org.usage?.productsCount / productsLimit) * 100;
          
          return (
            <div key={org._id} className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow border border-base-200">
              <div className="card-body">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="avatar placeholder">
                      <div className="bg-neutral text-neutral-content rounded-lg w-14 h-14">
                        <Building size={28} />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{org.name}</h3>
                      <p className="text-sm text-base-content/60 flex items-center gap-1">
                        <Users size={12} />
                        {org.owner ? `${org.owner.firstName} ${org.owner.lastName}` : 'Inconnu'}
                      </p>
                      <p className="text-xs text-base-content/40 italic">{org.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className={`badge ${planBadge.class}`}>{planBadge.text}</div>
                    <div className={`badge ${statusBadge.class}`}>{statusBadge.text}</div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="stat bg-base-200 rounded-lg p-3">
                    <div className="stat-title text-xs uppercase tracking-wider">Produits</div>
                    <div className="stat-value text-xl text-primary">{org.usage?.productsCount || 0}</div>
                    <div className="stat-desc text-[10px]">Limite: {productsLimit === -1 ? '∞' : productsLimit}</div>
                  </div>
                  <div className="stat bg-base-200 rounded-lg p-3">
                    <div className="stat-title text-xs uppercase tracking-wider">Membres</div>
                    <div className="stat-value text-xl text-secondary">{org.usage?.usersCount || 0}</div>
                    <div className="stat-desc text-[10px]">Limite: {usersLimit === -1 ? '∞' : usersLimit}</div>
                  </div>
                </div>

                {/* Usage Meters */}
                <div className="space-y-3 mt-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-base-content/70 flex items-center gap-1">
                        <Database size={14} />
                        Stockage utilisé
                      </span>
                      <span className="text-xs font-semibold">{(org.usage?.storageUsed || 0).toFixed(1)} / {storageLimit} MB</span>
                    </div>
                    <progress 
                      className={`progress ${storagePercent > 80 ? 'progress-error' : 'progress-success'} w-full h-2`} 
                      value={storagePercent} 
                      max="100"
                    ></progress>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-2 mt-4 text-xs border-t border-base-200 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-base-content/60">Date de création</span>
                    <span className="font-semibold flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(org.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Actions Admin Spécifiques */}
                <div className="card-actions justify-end mt-6 gap-2">
                  {org.status === 'active' ? (
                    <button 
                      onClick={() => handleStatusUpdate(org._id, 'suspended')}
                      className="btn btn-warning btn-sm gap-2"
                    >
                      <ShieldAlert size={16} />
                      Suspendre
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleStatusUpdate(org._id, 'active')}
                      className="btn btn-success btn-sm gap-2"
                    >
                      <ShieldCheck size={16} />
                      Activer
                    </button>
                  )}
                  <button className="btn btn-outline btn-sm gap-2">
                    <Eye size={16} />
                    Détails
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredOrganizations.length === 0 && (
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body text-center py-12">
            <Package size={48} className="mx-auto text-base-content/20 mb-4" />
            <p className="text-base-content/60">Aucune organisation trouvée</p>
          </div>
        </div>
      )}

      {/* Top Organizations */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h2 className="card-title mb-4">Top Organisations par Revenus</h2>
          <div className="space-y-3">
            {[...organizations]
              .sort((a, b) => b.revenue - a.revenue)
              .slice(0, 5)
              .map((org, index) => (
                <div key={org.id} className="flex items-center gap-4 p-3 bg-base-200 rounded-lg">
                  <div className="text-2xl font-bold text-primary">#{index + 1}</div>
                  <div className="flex-1">
                    <div className="font-bold">{org.name}</div>
                    <div className="text-sm text-base-content/60">{org.plan} • {org.products.toLocaleString()} produits</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-success">{org.revenue} €</div>
                    <div className="text-xs text-base-content/60">{org.users} utilisateurs</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrganizations;