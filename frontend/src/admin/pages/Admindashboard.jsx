import React from 'react';
import {
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Server,
  Database,
  CreditCard,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';

const AdminDashboard = () => {
  // Métriques globales
  const globalStats = [
    {
      title: 'Utilisateurs Total',
      value: '2,847',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'bg-blue-500',
      subtext: '+142 ce mois'
    },
    {
      title: 'Revenus Mensuels',
      value: '45,678 €',
      change: '+23.8%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-green-500',
      subtext: 'vs mois dernier'
    },
    {
      title: 'Abonnements Actifs',
      value: '1,247',
      change: '+8.2%',
      trend: 'up',
      icon: CreditCard,
      color: 'bg-purple-500',
      subtext: '89% de rétention'
    },
    {
      title: 'Organisations',
      value: '456',
      change: '-2.1%',
      trend: 'down',
      icon: Package,
      color: 'bg-orange-500',
      subtext: '12 nouvelles'
    }
  ];

  // Métriques système
  const systemMetrics = [
    { label: 'CPU', value: 45, max: 100, color: 'progress-success' },
    { label: 'RAM', value: 68, max: 100, color: 'progress-warning' },
    { label: 'Stockage', value: 82, max: 100, color: 'progress-error' },
    { label: 'Bande passante', value: 35, max: 100, color: 'progress-info' },
  ];

  // Utilisateurs récents
  const recentUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', plan: 'Pro', status: 'active', date: '2024-02-13' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', plan: 'Enterprise', status: 'active', date: '2024-02-13' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', plan: 'Free', status: 'active', date: '2024-02-12' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', plan: 'Pro', status: 'pending', date: '2024-02-12' },
  ];

  // Revenus par plan
  const revenuByPlan = [
    { plan: 'Enterprise', revenue: 25670, users: 89, percentage: 56 },
    { plan: 'Pro', revenue: 15450, users: 456, percentage: 34 },
    { plan: 'Starter', revenue: 4558, users: 702, percentage: 10 },
  ];

  // Activité récente
  const recentActivity = [
    { id: 1, type: 'signup', user: 'John Doe', action: 'Inscription - Plan Pro', time: 'Il y a 5 min', icon: Users, color: 'success' },
    { id: 2, type: 'payment', user: 'TechCorp', action: 'Paiement reçu - 499€', time: 'Il y a 12 min', icon: DollarSign, color: 'success' },
    { id: 3, type: 'upgrade', user: 'Jane Smith', action: 'Upgrade vers Enterprise', time: 'Il y a 1h', icon: TrendingUp, color: 'info' },
    { id: 4, type: 'issue', user: 'Système', action: 'Cache Redis ralenti', time: 'Il y a 2h', icon: AlertTriangle, color: 'warning' },
    { id: 5, type: 'cancel', user: 'Bob Corp', action: 'Annulation d\'abonnement', time: 'Il y a 3h', icon: TrendingDown, color: 'error' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <BarChart3 size={32} className="text-error" />
          Dashboard Administrateur
        </h1>
        <p className="text-base-content/60 mt-1">
          Vue d'ensemble de la plateforme SaaS
        </p>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {globalStats.map((stat, index) => {
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
                      <span className="text-sm text-base-content/60">{stat.subtext}</span>
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

      {/* System Health & Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title mb-4">
              <Server className="text-info" size={24} />
              Santé du Système
            </h2>
            <div className="space-y-4">
              {systemMetrics.map((metric, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{metric.label}</span>
                    <span className="text-sm font-bold">{metric.value}%</span>
                  </div>
                  <progress 
                    className={`progress ${metric.color} w-full h-3`} 
                    value={metric.value} 
                    max={metric.max}
                  ></progress>
                </div>
              ))}
            </div>
            
            <div className="divider"></div>
            
            <div className="stats stats-vertical">
              <div className="stat">
                <div className="stat-title text-xs">Uptime</div>
                <div className="stat-value text-2xl text-success">99.98%</div>
                <div className="stat-desc">30 derniers jours</div>
              </div>
              <div className="stat">
                <div className="stat-title text-xs">Requêtes/sec</div>
                <div className="stat-value text-2xl text-info">1,247</div>
                <div className="stat-desc">Moyenne actuelle</div>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue by Plan */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title mb-4">
              <DollarSign className="text-success" size={24} />
              Revenus par Plan
            </h2>
            <div className="space-y-4">
              {revenuByPlan.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-bold">{item.plan}</span>
                      <span className="text-sm text-base-content/60 ml-2">({item.users} users)</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-success">{item.revenue.toLocaleString()} €</div>
                      <div className="text-xs text-base-content/60">{item.percentage}%</div>
                    </div>
                  </div>
                  <progress 
                    className="progress progress-success w-full" 
                    value={item.percentage} 
                    max="100"
                  ></progress>
                </div>
              ))}
            </div>
            
            <div className="alert alert-success mt-4">
              <TrendingUp size={20} />
              <span className="text-sm">
                Les revenus Enterprise ont augmenté de <strong>34%</strong> ce mois
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Users & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title mb-4">
              <Users className="text-primary" size={24} />
              Utilisateurs Récents
            </h2>
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Utilisateur</th>
                    <th>Plan</th>
                    <th>Statut</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((user) => (
                    <tr key={user.id} className="hover">
                      <td>
                        <div>
                          <div className="font-bold">{user.name}</div>
                          <div className="text-sm text-base-content/60">{user.email}</div>
                        </div>
                      </td>
                      <td>
                        <div className={`badge ${
                          user.plan === 'Enterprise' ? 'badge-error' :
                          user.plan === 'Pro' ? 'badge-warning' :
                          'badge-ghost'
                        }`}>
                          {user.plan}
                        </div>
                      </td>
                      <td>
                        <div className={`badge ${
                          user.status === 'active' ? 'badge-success' : 'badge-warning'
                        }`}>
                          {user.status === 'active' ? 'Actif' : 'En attente'}
                        </div>
                      </td>
                      <td className="text-sm">{user.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title mb-4">
              <Activity className="text-warning" size={24} />
              Activité Récente
            </h2>
            <div className="space-y-3">
              {recentActivity.map((activity) => {
                const Icon = activity.icon;
                const bgColor = 
                  activity.color === 'success' ? 'bg-success/20 text-success' :
                  activity.color === 'warning' ? 'bg-warning/20 text-warning' :
                  activity.color === 'error' ? 'bg-error/20 text-error' :
                  'bg-info/20 text-info';
                
                return (
                  <div key={activity.id} className="flex items-start gap-4 p-3 hover:bg-base-200 rounded-lg transition-colors">
                    <div className={`p-2 rounded-lg ${bgColor}`}>
                      <Icon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{activity.user}</p>
                      <p className="text-sm text-base-content/70 truncate">{activity.action}</p>
                    </div>
                    <span className="text-xs text-base-content/50 whitespace-nowrap">{activity.time}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h2 className="card-title mb-4">Actions Rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="btn btn-outline btn-primary gap-2 justify-start h-auto py-4">
              <Users size={24} />
              <div className="text-left">
                <div className="font-semibold">Gérer Utilisateurs</div>
                <div className="text-xs opacity-70">2,847 utilisateurs</div>
              </div>
            </button>
            
            <button className="btn btn-outline btn-success gap-2 justify-start h-auto py-4">
              <CreditCard size={24} />
              <div className="text-left">
                <div className="font-semibold">Abonnements</div>
                <div className="text-xs opacity-70">1,247 actifs</div>
              </div>
            </button>
            
            <button className="btn btn-outline btn-warning gap-2 justify-start h-auto py-4">
              <Database size={24} />
              <div className="text-left">
                <div className="font-semibold">Base de données</div>
                <div className="text-xs opacity-70">Gérer & Backup</div>
              </div>
            </button>
            
            <button className="btn btn-outline btn-error gap-2 justify-start h-auto py-4">
              <Server size={24} />
              <div className="text-left">
                <div className="font-semibold">Console Système</div>
                <div className="text-xs opacity-70">Logs & Monitoring</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;