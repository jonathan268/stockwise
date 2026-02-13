import React, { useState } from 'react';
import {
  CreditCard,
  Search,
  Download,
  DollarSign,
  TrendingUp,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  RefreshCw,
  X,
  Package
} from 'lucide-react';

const AdminSubscriptions = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Données des abonnements
  const subscriptions = [
    {
      id: 'SUB-001',
      user: 'John Doe',
      organization: 'TechCorp',
      email: 'john@techcorp.com',
      plan: 'Pro',
      price: 49,
      billing: 'monthly',
      status: 'active',
      startDate: '2024-01-15',
      nextBilling: '2024-03-15',
      lastPayment: '2024-02-15',
      revenue: 98,
      paymentMethod: 'Visa •••• 4242'
    },
    {
      id: 'SUB-002',
      user: 'Jane Smith',
      organization: 'MegaCorp SA',
      email: 'jane@megacorp.com',
      plan: 'Enterprise',
      price: 499,
      billing: 'yearly',
      status: 'active',
      startDate: '2023-11-20',
      nextBilling: '2024-11-20',
      lastPayment: '2023-11-20',
      revenue: 499,
      paymentMethod: 'Mastercard •••• 5555'
    },
    {
      id: 'SUB-003',
      user: 'Bob Johnson',
      organization: 'StartupIO',
      email: 'bob@startup.io',
      plan: 'Free',
      price: 0,
      billing: 'monthly',
      status: 'active',
      startDate: '2024-02-10',
      nextBilling: '-',
      lastPayment: '-',
      revenue: 0,
      paymentMethod: '-'
    },
    {
      id: 'SUB-004',
      user: 'Alice Brown',
      organization: 'AliceCo Ltd',
      email: 'alice@aliceco.com',
      plan: 'Pro',
      price: 49,
      billing: 'monthly',
      status: 'past_due',
      startDate: '2023-08-05',
      nextBilling: '2024-02-10',
      lastPayment: '2024-01-10',
      revenue: 294,
      paymentMethod: 'Visa •••• 1234'
    },
    {
      id: 'SUB-005',
      user: 'Charlie Wilson',
      organization: 'WilsonCo',
      email: 'charlie@example.com',
      plan: 'Starter',
      price: 19,
      billing: 'monthly',
      status: 'trial',
      startDate: '2024-02-06',
      nextBilling: '2024-02-20',
      lastPayment: '-',
      revenue: 0,
      paymentMethod: '-'
    },
    {
      id: 'SUB-006',
      user: 'Diana Prince',
      organization: 'DianaEnterprise',
      email: 'diana@enterprise.com',
      plan: 'Pro',
      price: 49,
      billing: 'monthly',
      status: 'cancelled',
      startDate: '2023-06-12',
      nextBilling: '-',
      lastPayment: '2024-01-12',
      revenue: 392,
      paymentMethod: 'Amex •••• 3782'
    },
  ];

  const plans = ['all', 'Free', 'Starter', 'Pro', 'Enterprise'];
  const statuses = ['all', 'active', 'trial', 'past_due', 'cancelled'];

  const getStatusBadge = (status) => {
    const badges = {
      active: { class: 'badge-success', text: 'Actif', icon: CheckCircle },
      trial: { class: 'badge-info', text: 'Essai', icon: Clock },
      past_due: { class: 'badge-warning', text: 'Impayé', icon: AlertTriangle },
      cancelled: { class: 'badge-error', text: 'Annulé', icon: XCircle }
    };
    return badges[status] || badges.active;
  };

  const getPlanColor = (plan) => {
    const colors = {
      Enterprise: 'text-error',
      Pro: 'text-warning',
      Starter: 'text-info',
      Free: 'text-base-content/60'
    };
    return colors[plan] || colors.Free;
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchSearch = 
      sub.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPlan = selectedPlan === 'all' || sub.plan === selectedPlan;
    const matchStatus = selectedStatus === 'all' || sub.status === selectedStatus;
    return matchSearch && matchPlan && matchStatus;
  });

  const totalRevenue = subscriptions.reduce((sum, sub) => sum + sub.revenue, 0);
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
  const trialSubscriptions = subscriptions.filter(s => s.status === 'trial').length;
  const mrr = subscriptions.filter(s => s.status === 'active' && s.billing === 'monthly')
    .reduce((sum, sub) => sum + sub.price, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <CreditCard size={32} className="text-success" />
            Gestion des Abonnements
          </h1>
          <p className="text-base-content/60 mt-1">
            Gérez tous les abonnements et paiements
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-outline gap-2">
            <Download size={20} />
            Exporter
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-success">
            <DollarSign size={32} />
          </div>
          <div className="stat-title">Revenus Total</div>
          <div className="stat-value text-success">{totalRevenue.toLocaleString()} €</div>
          <div className="stat-desc">Tous les temps</div>
        </div>
        
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-primary">
            <TrendingUp size={32} />
          </div>
          <div className="stat-title">MRR</div>
          <div className="stat-value text-primary">{mrr.toLocaleString()} €</div>
          <div className="stat-desc">Revenus récurrents mensuels</div>
        </div>
        
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-info">
            <CheckCircle size={32} />
          </div>
          <div className="stat-title">Abonnements Actifs</div>
          <div className="stat-value text-info">{activeSubscriptions}</div>
          <div className="stat-desc">Clients payants</div>
        </div>
        
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-warning">
            <Clock size={32} />
          </div>
          <div className="stat-title">Essais Gratuits</div>
          <div className="stat-value text-warning">{trialSubscriptions}</div>
          <div className="stat-desc">En cours</div>
        </div>
      </div>

      {/* Revenue by Plan */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h2 className="card-title mb-4">Répartition des Revenus</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {['Enterprise', 'Pro', 'Starter', 'Free'].map((plan) => {
              const subs = subscriptions.filter(s => s.plan === plan && s.status === 'active');
              const revenue = subs.reduce((sum, s) => sum + s.price, 0);
              const count = subs.length;
              
              return (
                <div key={plan} className="stat bg-base-200 rounded-lg">
                  <div className="stat-title">{plan}</div>
                  <div className={`stat-value text-2xl ${getPlanColor(plan)}`}>
                    {revenue > 0 ? `${revenue} €` : '-'}
                  </div>
                  <div className="stat-desc">{count} abonnements</div>
                </div>
              );
            })}
          </div>
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
                    placeholder="Rechercher par nom, email, organisation ou ID..."
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

            {/* Status Filter */}
            <div className="form-control w-full md:w-48">
              <select 
                className="select select-bordered"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actifs</option>
                <option value="trial">Essais</option>
                <option value="past_due">Impayés</option>
                <option value="cancelled">Annulés</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Client</th>
                  <th>Plan</th>
                  <th>Facturation</th>
                  <th>Statut</th>
                  <th>Prochain paiement</th>
                  <th>Revenus</th>
                  <th>Paiement</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscriptions.map((sub) => {
                  const statusBadge = getStatusBadge(sub.status);
                  const StatusIcon = statusBadge.icon;
                  
                  return (
                    <tr key={sub.id} className="hover">
                      <td className="font-mono text-sm">{sub.id}</td>
                      <td>
                        <div>
                          <div className="font-bold">{sub.user}</div>
                          <div className="text-sm text-base-content/60">{sub.organization}</div>
                          <div className="text-xs text-base-content/50">{sub.email}</div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div className={`font-bold ${getPlanColor(sub.plan)}`}>{sub.plan}</div>
                          {sub.price > 0 && (
                            <div className="text-sm text-base-content/60">{sub.price} €/{sub.billing === 'monthly' ? 'mois' : 'an'}</div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="badge badge-ghost">
                          {sub.billing === 'monthly' ? 'Mensuel' : sub.billing === 'yearly' ? 'Annuel' : '-'}
                        </div>
                      </td>
                      <td>
                        <div className={`badge ${statusBadge.class} gap-2`}>
                          <StatusIcon size={12} />
                          {statusBadge.text}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar size={12} className="text-base-content/60" />
                          {sub.nextBilling}
                        </div>
                      </td>
                      <td className="font-bold text-success">
                        {sub.revenue > 0 ? `${sub.revenue} €` : '-'}
                      </td>
                      <td className="text-sm">{sub.paymentMethod}</td>
                      <td>
                        <div className="flex gap-2">
                          <button className="btn btn-ghost btn-xs" title="Voir">
                            <Eye size={16} />
                          </button>
                          {sub.status === 'active' && (
                            <button className="btn btn-ghost btn-xs" title="Renouveler">
                              <RefreshCw size={16} />
                            </button>
                          )}
                          {sub.status === 'past_due' && (
                            <button className="btn btn-ghost btn-xs text-warning" title="Relancer">
                              <AlertTriangle size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredSubscriptions.length === 0 && (
              <div className="text-center py-12">
                <CreditCard size={48} className="mx-auto text-base-content/20 mb-4" />
                <p className="text-base-content/60">Aucun abonnement trouvé</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="alert alert-warning">
          <AlertTriangle size={20} />
          <div className="text-sm">
            <strong>{subscriptions.filter(s => s.status === 'past_due').length} paiements en retard</strong> à traiter
          </div>
        </div>
        
        <div className="alert alert-info">
          <Clock size={20} />
          <div className="text-sm">
            <strong>{trialSubscriptions} essais gratuits</strong> se terminent bientôt
          </div>
        </div>
        
        <div className="alert alert-success">
          <TrendingUp size={20} />
          <div className="text-sm">
            <strong>MRR: {mrr} €</strong> (+12% vs mois dernier)
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSubscriptions;