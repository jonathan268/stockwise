import React, { useState } from "react";
import {Link} from 'react-router-dom';
import {
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ShoppingCart,
  BarChart3,
  Menu,
  Bell,
  Search,
  User,
  Settings,
  LogOut,
  Plus,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Box,
  DollarSign,
  Activity,
  TriangleAlert,
  ChartNoAxesCombined,
  Sparkles
} from "lucide-react";

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Données simulées pour le dashboard
  const stats = [
    {
      title: "Total Produits",
      value: "1,234",
      change: "+12%",
      trend: "up",
      icon: Package,
      color: "bg-blue-500",
    },
    {
      title: "Valeur du Stock",
      value: "450345 FCFA",
      change: "+8%",
      trend: "up",
      icon: DollarSign,
      color: "bg-green-500",
    },
    {
      title: "Alertes Stock Bas",
      value: "23",
      change: "-5%",
      trend: "down",
      icon: AlertTriangle,
      color: "bg-orange-500",
    },
    {
      title: "Commandes en attente",
      value: "56",
      change: "+15%",
      trend: "up",
      icon: ShoppingCart,
      color: "bg-purple-500",
    },
  ];

  const stockAlerts = [
    {
      id: 1,
      product: "Laptop Dell XPS 15",
      quantity: 5,
      threshold: 10,
      status: "warning",
    },
    {
      id: 2,
      product: "Souris Logitech MX",
      quantity: 2,
      threshold: 15,
      status: "critical",
    },
    {
      id: 3,
      product: "Clavier Mécanique",
      quantity: 8,
      threshold: 12,
      status: "warning",
    },
  ];

  const recentActivity = [
    {
      id: 1,
      action: "Entrée stock",
      product: "iPhone 14 Pro",
      quantity: 50,
      time: "Il y a 2h",
    },
    {
      id: 2,
      action: "Sortie stock",
      product: "MacBook Air M2",
      quantity: 15,
      time: "Il y a 3h",
    },
    {
      id: 3,
      action: "Alerte IA",
      product: "Stock faible détecté",
      quantity: null,
      time: "Il y a 5h",
    },
    {
      id: 4,
      action: "Entrée stock",
      product: "Samsung Galaxy S23",
      quantity: 30,
      time: "Il y a 6h",
    },
  ];

  const topProducts = [
    { name: "iPhone 14 Pro", stock: 120, value: "95,000 FCFA", movement: 85 },
    { name: "MacBook Air M2", stock: 65, value: "78,000 €", movement: 72 },
    { name: "Samsung Galaxy S23", stock: 90, value: "67,500 €", movement: 68 },
    { name: "iPad Pro 12.9", stock: 45, value: "54,000 €", movement: 55 },
  ];

  return (
    <div className="flex h-screen bg-base-200">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "w-64" : "w-20" } bg-base-100 transition-all duration-300 shadow-xl z-50`}
      >
        <div className="flex items-center justify-between p-4 border-b border-base-300 z-40">
          {sidebarOpen && (
            <h1 className="text-xl font-bold text-secondary">STOCKWISE</h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <Menu size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          <button className="btn btn-primary w-full justify-start gap-3">
            <BarChart3 size={20} />
            {sidebarOpen && <span>Tableau de bord</span>}
          </button>
          <button className="btn btn-ghost w-full justify-start gap-3">
            <Link to="/inventaire">
            <Package size={20} />
            {sidebarOpen && <span>Inventaire</span>}
            </Link>
          </button>
          <button className="btn btn-ghost w-full justify-start gap-3">
            <ShoppingCart size={20} />
            {sidebarOpen && <span>Commandes</span>}
          </button>
          <button className="btn btn-ghost w-full justify-start gap-3">
            <AlertTriangle size={20} />
            {sidebarOpen && <span>Alertes</span>}
          </button>
          <button className="btn btn-ghost w-full justify-start gap-3">
            <Sparkles size={20} />
            {sidebarOpen && <span>Analyses IA</span>}
          </button>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-base-300">
          <button className="btn btn-ghost w-full justify-start gap-3">
            <Settings size={20} />
            {sidebarOpen && <span>Paramètres</span>}
          </button>
          <button className="btn btn-ghost w-full justify-start gap-3 text-error">
            <LogOut size={20} />
            {sidebarOpen && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-base-100 shadow-sm sticky top-0 z-10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="form-control flex-1 max-w-md">
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Rechercher un produit..."
                    className="input input-bordered w-full"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="btn btn-ghost btn-circle">
                <div className="indicator">
                  <Bell size={20} />
                  <span className="badge badge-primary badge-xs indicator-item">2</span>
                </div>
              </button>

              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                  <div className="w-10 rounded-full bg-primary flex items-center justify-center">
                    <User size={20} className="text-primary-content" />
                  </div>
                </label>
                <ul
                  tabIndex={0}
                  className="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52"
                >
                  <li>
                    <a>Profil</a>
                  </li>
                  <li>
                    <a>Paramètres</a>
                  </li>
                  <li>
                    <a>Déconnexion</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="card-body">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm opacity-70">{stat.title}</p>
                      <h3 className="text-3xl font-bold mt-2">{stat.value}</h3>
                      <div className="flex items-center gap-1 mt-2">
                        {stat.trend === "up" ? (
                          <TrendingUp size={16} className="text-success" />
                        ) : (
                          <TrendingDown size={16} className="text-error" />
                        )}
                        <span
                          className={`text-sm ${stat.trend === "up" ? "text-success" : "text-error"}`}
                        >
                          {stat.change}
                        </span>
                        <span className="text-sm opacity-70">
                          vs mois dernier
                        </span>
                      </div>
                    </div>
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <stat.icon size={24} className="text-white" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts and Alerts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stock Alerts */}
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
                                <div className="bg-neutral-focus text-neutral-content rounded w-12">
                                  <Box size={20} />
                                </div>
                              </div>
                              <span className="font-medium">
                                {alert.product}
                              </span>
                            </div>
                          </td>
                          <td>
                            <span className="font-bold">{alert.quantity}</span>
                          </td>
                          <td className="opacity-70">{alert.threshold}</td>
                          <td>
                            <div
                              className={`badge ${alert.status === "critical" ? "badge-error" : "badge-warning"} gap-2`}
                            >
                              <AlertTriangle size={12} />
                              {alert.status === "critical"
                                ? "Critique"
                                : "Attention"}
                            </div>
                          </td>
                          <td>
                            <div className="flex gap-2">
                              <button className="btn btn-ghost btn-xs">
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

            {/* Quick Actions */}
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
                    <Download size={20} />
                    Exporter Données
                  </button>
                  <button className="btn btn-outline w-full justify-start gap-3">
                    <Activity size={20} />
                    Prédictions IA
                  </button>
                </div>

                <div className="divider"></div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-sm opacity-70">
                    Suggestions IA
                  </h3>
                  <div className="alert alert-info shadow-lg">
                    <div className="flex flex-col gap-2">
                      <span className="text-sm">
                        <ChartNoAxesCombined size={16} className="inline-flex"/> Tendance détectée: Augmentation des ventes de 25% sur
                        les smartphones
                      </span>
                    </div>
                  </div>
                  <div className="alert alert-warning shadow-lg">
                    <div className="flex flex-col gap-2">
                      <span className="text-sm">
                        <TriangleAlert size={16} className="inline-flex"/> Recommandation: Réapprovisionner les accessoires
                        informatiques
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title mb-4">Activité Récente</h2>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 p-3 hover:bg-base-200 rounded-lg transition-colors"
                    >
                      <div
                        className={`p-2 rounded-lg ${
                          activity.action === "Entrée stock"
                            ? "bg-success"
                            : activity.action === "Sortie stock"
                              ? "bg-warning"
                              : "bg-info"
                        } bg-opacity-20`}
                      >
                        {activity.action === "Alerte IA" ? (
                          <Activity size={20} />
                        ) : (
                          <Package size={20} />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-sm opacity-70">{activity.product}</p>
                        {activity.quantity && (
                          <p className="text-sm">
                            Quantité:{" "}
                            <span className="font-semibold">
                              {activity.quantity}
                            </span>
                          </p>
                        )}
                      </div>
                      <span className="text-xs opacity-50">
                        {activity.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Products */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title mb-4">Produits les Plus Actifs</h2>
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm opacity-70">
                            Stock: {product.stock} • Valeur: {product.value}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-primary">
                            {product.movement}%
                          </p>
                          <p className="text-xs opacity-70">Mouvement</p>
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
      </main>
    </div>
  );
};

export default Dashboard;
