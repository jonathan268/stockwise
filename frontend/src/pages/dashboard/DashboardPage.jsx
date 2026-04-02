import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Package,
  AlertTriangle,
  Loader,
} from "lucide-react";
import toast from "react-hot-toast";
import apiClient from "../../api/axios";
import { useAuth } from "../../hooks/useAuth";
import { useOrganization } from "../../context/OrganizationContext";

/**
 * DashboardPage - Page principal tableau de bord
 * Affiche les KPIs, graphiques et statistiques clés
 */
const DashboardPage = () => {
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalValue: 0,
    lowStockProducts: 0,
    recentOrders: 0,
  });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get("/api/dashboard/stats");
        setStats(response.data.data);
        setChartData(response.data.chartData || []);
      } catch (error) {
        toast.error("Erreur chargement du dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (currentOrganization) {
      fetchDashboardData();
    }
  }, [currentOrganization]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Tableau de bord
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Bienvenue, {user?.fullName} ! Organisation:{" "}
          {currentOrganization?.name}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          icon={<Package className="w-6 h-6" />}
          title="Produits"
          value={stats.totalProducts}
          color="blue"
        />
        <KPICard
          icon={<TrendingUp className="w-6 h-6" />}
          title="Valeur totale"
          value={`${stats.totalValue.toLocaleString("fr-FR")} €`}
          color="green"
        />
        <KPICard
          icon={<AlertTriangle className="w-6 h-6" />}
          title="Stock faible"
          value={stats.lowStockProducts}
          color="red"
        />
        <KPICard
          icon={<BarChart3 className="w-6 h-6" />}
          title="Commandes récentes"
          value={stats.recentOrders}
          color="purple"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Ventes derniers 30 jours
          </h2>
          <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
            <p className="text-gray-500">Graphique du chiffre d'affaires</p>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Top produits
          </h2>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Produit {i}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    234 vendus
                  </p>
                </div>
                <span className="text-lg font-semibold text-blue-600">
                  $1,234.00
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Activité récente
        </h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-start gap-4 border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0"
            >
              <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
              <div className="flex-1">
                <p className="text-gray-900 dark:text-white font-medium">
                  Commande #{1000 + i} créée
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Il y a {i} heure(s)
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * KPI Card Component
 */
const KPICard = ({ icon, title, value, color }) => {
  const colorClasses = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600",
    green: "bg-green-50 dark:bg-green-900/20 text-green-600",
    red: "bg-red-50 dark:bg-red-900/20 text-red-600",
    purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600",
  };

  return (
    <div className={`${colorClasses[color]} rounded-lg shadow p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {value}
          </p>
        </div>
        <div className="opacity-20">{icon}</div>
      </div>
    </div>
  );
};

export default DashboardPage;
