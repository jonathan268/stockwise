import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Package,
  DollarSign,
  ShoppingCart,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Bell,
} from "lucide-react";
import axiosInstance from "../lib/axios";
import { useAuthStore } from "../store/authStore";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

const KPICard = ({ icon: Icon, label, value, sub, color, index }) => (
  <motion.div
    custom={index}
    initial="hidden"
    animate="visible"
    variants={fadeIn}
    className="card bg-base-100 shadow-sm border border-base-content/5"
  >
    <div className="card-body p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-base-content/60 mb-1">{label}</p>
          <p className="text-3xl font-black font-display tracking-tight">{value}</p>
          {sub && <p className="text-xs text-base-content/50 mt-1">{sub}</p>}
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  </motion.div>
);

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["dashboard-aggregate"],
    queryFn: async () => {
      const res = await axiosInstance.get("/dashboard/summary");
      return res.data.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10,  // 10 minutes
  });

  const summary = dashboardData;
  const recentAlerts = dashboardData?.recentAlerts;
  const recentSales = dashboardData?.recentSales;

  const fmt = (n) => {
    if (n == null) return "0";
    return new Intl.NumberFormat("fr-FR").format(n);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black font-display">
          Bonjour, {user?.firstName}
        </h1>
        <p className="text-base-content/60 mt-1">
          Voici un résumé de votre activité pour aujourd'hui.
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={Package}
          label="Total Produits"
          value={fmt(summary?.totalProducts)}
          sub={`${fmt(summary?.lowStockCount || 0)} en alerte`}
          color="bg-primary/10 text-primary"
          index={0}
        />
        <KPICard
          icon={DollarSign}
          label="Valeur du Stock"
          value={`${fmt(summary?.totalStockValue)} XAF`}
          color="bg-success/10 text-success"
          index={1}
        />
        <KPICard
          icon={ShoppingCart}
          label="Ventes ce mois"
          value={fmt(summary?.monthlySalesCount)}
          sub={`${fmt(summary?.monthlySalesAmount)} XAF`}
          color="bg-info/10 text-info"
          index={2}
        />
        <KPICard
          icon={AlertTriangle}
          label="Alertes Actives"
          value={fmt(summary?.activeAlerts)}
          sub={`${fmt(summary?.outOfStockCount || 0)} ruptures`}
          color="bg-error/10 text-error"
          index={3}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card bg-base-100 shadow-sm border border-base-content/5"
        >
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <ShoppingCart size={20} className="text-primary" />
                Dernières Ventes
              </h2>
            </div>

            {recentSales?.data && recentSales.data.length > 0 ? (
              <div className="space-y-3">
                {recentSales.data.slice(0, 5).map((sale) => (
                  <div
                    key={sale._id}
                    className="flex items-center justify-between p-3 rounded-xl bg-base-200/50 hover:bg-base-200 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-success/10 text-success rounded-xl flex items-center justify-center">
                        <ArrowUpRight size={18} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{sale.saleNumber}</p>
                        <p className="text-xs text-base-content/50">
                          {sale.customerName || "Client anonyme"} — {sale.items?.length || 0} article(s)
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">{fmt(sale.totalAmount)} XAF</p>
                      <p className="text-xs text-base-content/50">
                        {new Date(sale.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-base-content/40">
                <ShoppingCart size={32} className="mx-auto mb-2 opacity-50" />
                <p className="font-medium">Aucune vente récente</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card bg-base-100 shadow-sm border border-base-content/5"
        >
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Bell size={20} className="text-error" />
                Alertes Récentes
              </h2>
            </div>

            {recentAlerts && recentAlerts.length > 0 ? (
              <div className="space-y-3">
                {recentAlerts.slice(0, 5).map((alert) => (
                  <div
                    key={alert._id}
                    className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                      alert.type === "out_of_stock"
                        ? "bg-error/5 hover:bg-error/10"
                        : "bg-warning/5 hover:bg-warning/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          alert.type === "out_of_stock"
                            ? "bg-error/10 text-error"
                            : "bg-warning/10 text-warning"
                        }`}
                      >
                        <AlertTriangle size={18} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{alert.product?.name || "Produit"}</p>
                        <p className="text-xs text-base-content/50">
                          {alert.type === "out_of_stock" ? "Rupture de stock" : "Stock faible"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-sm">
                        {alert.product?.currentStock ?? 0} restants
                      </p>
                      <p className="text-xs text-base-content/50">
                        Min: {alert.product?.minimumStock ?? 0}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-base-content/40">
                <Bell size={32} className="mx-auto mb-2 opacity-50" />
                <p className="font-medium">Aucune alerte active</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
