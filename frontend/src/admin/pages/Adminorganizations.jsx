import React, { useState } from 'react';
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
  Globe
} from 'lucide-react';

const AdminOrganizations = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('all');

  // Données des organisations
  const organizations = [
    {
      id: 1,
      name: 'TechCorp',
      owner: 'John Doe',
      email: 'contact@techcorp.com',
      plan: 'Pro',
      users: 5,
      usersLimit: 10,
      storage: 15.5,
      storageLimit: 50,
      createdDate: '2024-01-15',
      lastActivity: '2024-02-13',
      revenue: 245,
      products: 1247,
      status: 'active'
    },
    {
      id: 2,
      name: 'MegaCorp SA',
      owner: 'Jane Smith',
      email: 'contact@megacorp.com',
      plan: 'Enterprise',
      users: 45,
      usersLimit: 100,
      storage: 145.2,
      storageLimit: 500,
      createdDate: '2023-11-20',
      lastActivity: '2024-02-13',
      revenue: 5988,
      products: 8942,
      status: 'active'
    },
    {
      id: 3,
      name: 'StartupIO',
      owner: 'Bob Johnson',
      email: 'bob@startup.io',
      plan: 'Free',
      users: 1,
      usersLimit: 3,
      storage: 2.1,
      storageLimit: 5,
      createdDate: '2024-02-10',
      lastActivity: '2024-02-12',
      revenue: 0,
      products: 156,
      status: 'active'
    },
    {
      id: 4,
      name: 'AliceCo Ltd',
      owner: 'Alice Brown',
      email: 'contact@aliceco.com',
      plan: 'Pro',
      users: 7,
      usersLimit: 10,
      storage: 28.7,
      storageLimit: 50,
      createdDate: '2023-08-05',
      lastActivity: '2024-01-28',
      revenue: 294,
      products: 3421,
      status: 'inactive'
    },
    {
      id: 5,
      name: 'WilsonCo',
      owner: 'Charlie Wilson',
      email: 'contact@wilsonco.cm',
      plan: 'Starter',
      users: 1,
      usersLimit: 5,
      storage: 0.5,
      storageLimit: 10,
      createdDate: '2024-02-13',
      lastActivity: '2024-02-13',
      revenue: 0,
      products: 24,
      status: 'trial'
    },
  ];

  const plans = ['all', 'Free', 'Starter', 'Pro', 'Enterprise'];

  const getPlanBadge = (plan) => {
    const badges = {
      Enterprise: { class: 'badge-error', text: 'Enterprise' },
      Pro: { class: 'badge-warning', text: 'Pro' },
      Starter: { class: 'badge-info', text: 'Starter' },
      Free: { class: 'badge-ghost', text: 'Free' }
    };
    return badges[plan] || badges.Free;
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { class: 'badge-success', text: 'Actif' },
      trial: { class: 'badge-info', text: 'Essai' },
      inactive: { class: 'badge-ghost', text: 'Inactif' }
    };
    return badges[status] || badges.active;
  };

  const filteredOrganizations = organizations.filter(org => {
    const matchSearch = 
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPlan = selectedPlan === 'all' || org.plan === selectedPlan;
    return matchSearch && matchPlan;
  });

  const totalOrgs = organizations.length;
  const activeOrgs = organizations.filter(o => o.status === 'active').length;
  const totalRevenue = organizations.reduce((sum, o) => sum + o.revenue, 0);
  const totalProducts = organizations.reduce((sum, o) => sum + o.products, 0);

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
            <DollarSign size={32} />
          </div>
          <div className="stat-title">Revenus Total</div>
          <div className="stat-value text-success">{totalRevenue.toLocaleString()} €</div>
          <div className="stat-desc">Toutes organisations</div>
        </div>
        
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-primary">
            <Users size={32} />
          </div>
          <div className="stat-title">Utilisateurs</div>
          <div className="stat-value text-primary">
            {organizations.reduce((sum, o) => sum + o.users, 0)}
          </div>
          <div className="stat-desc">Au total</div>
        </div>
        
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-info">
            <Database size={32} />
          </div>
          <div className="stat-title">Produits</div>
          <div className="stat-value text-info">{totalProducts.toLocaleString()}</div>
          <div className="stat-desc">Dans tous les stocks</div>
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
          const planBadge = getPlanBadge(org.plan);
          const statusBadge = getStatusBadge(org.status);
          const storagePercent = (org.storage / org.storageLimit) * 100;
          const usersPercent = (org.users / org.usersLimit) * 100;
          
          return (
            <div key={org.id} className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
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
                        {org.owner}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className={`badge ${planBadge.class}`}>{planBadge.text}</div>
                    <div className={`badge ${statusBadge.class}`}>{statusBadge.text}</div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="stat bg-base-200 rounded-lg p-3">
                    <div className="stat-title text-xs">Produits</div>
                    <div className="stat-value text-2xl text-primary">{org.products.toLocaleString()}</div>
                  </div>
                  <div className="stat bg-base-200 rounded-lg p-3">
                    <div className="stat-title text-xs">Revenus</div>
                    <div className="stat-value text-2xl text-success">{org.revenue} €</div>
                  </div>
                </div>

                {/* Usage Meters */}
                <div className="space-y-3 mt-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-base-content/70 flex items-center gap-1">
                        <Users size={14} />
                        Utilisateurs
                      </span>
                      <span className="text-sm font-semibold">{org.users}/{org.usersLimit}</span>
                    </div>
                    <progress 
                      className={`progress ${usersPercent > 80 ? 'progress-warning' : 'progress-primary'} w-full`} 
                      value={usersPercent} 
                      max="100"
                    ></progress>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-base-content/70 flex items-center gap-1">
                        <Database size={14} />
                        Stockage
                      </span>
                      <span className="text-sm font-semibold">{org.storage}/{org.storageLimit} GB</span>
                    </div>
                    <progress 
                      className={`progress ${storagePercent > 80 ? 'progress-error' : 'progress-success'} w-full`} 
                      value={storagePercent} 
                      max="100"
                    ></progress>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-2 mt-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-base-content/60">Création</span>
                    <span className="font-semibold flex items-center gap-1">
                      <Calendar size={12} />
                      {org.createdDate}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-base-content/60">Dernière activité</span>
                    <span className="font-semibold flex items-center gap-1">
                      <Activity size={12} />
                      {org.lastActivity}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="card-actions justify-end mt-4">
                  <button className="btn btn-ghost btn-sm gap-2">
                    <Eye size={16} />
                    Voir
                  </button>
                  <button className="btn btn-ghost btn-sm gap-2">
                    <Edit size={16} />
                    Modifier
                  </button>
                  <button className="btn btn-ghost btn-sm text-error gap-2">
                    <Trash2 size={16} />
                    Supprimer
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