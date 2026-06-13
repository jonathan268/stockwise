import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Package,
  DollarSign,
  ShoppingCart,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  PieChart,
  Bell,
  Clock,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell, Legend,
} from "recharts";
import axiosInstance from "../lib/axios";

const COLORS = ["#2563eb", "#16a34a", "#eab308", "#dc2626", "#8b5cf6"];

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

const KPICard = ({ icon: Icon, label, value, sub, color, index }) => (
  <motion.div custom={index} initial="hidden" animate="visible" variants={fadeIn}
    className="card bg-base-100 shadow-sm border border-base-content/5"
  >
    <div className="card-body p-5">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-base-content/60 mb-1">{label}</p>
          <p className="text-3xl font-black font-display tracking-tight truncate">{value}</p>
          {sub && <p className="text-xs text-base-content/50 mt-1">{sub}</p>}
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${color}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  </motion.div>
);

const ChangeBadge = ({ value }) => {
  if (value === 0) return <span className="text-base-content/40 flex items-center gap-1 text-xs"><Minus size={12} /> Stable</span>;
  const isUp = value > 0;
  const color = isUp ? "text-success" : "text-error";
  return (
    <span className={`${color} flex items-center gap-1 text-xs font-medium`}>
      {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {Math.abs(value).toFixed(1)}%
    </span>
  );
};

export default function DashboardPage() {
  const { data: summary, isLoading } = useQuery({
    queryKey: ["dashboard-aggregate"],
    queryFn: async () => {
      const res = await axiosInstance.get("/dashboard/summary");
      return res.data.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const fmt = (n) => n == null ? "0" : new Intl.NumberFormat("fr-FR").format(n);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  const s = summary;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black font-display">Tableau de bord</h1>
        <p className="text-base-content/60 mt-1">Vue d'ensemble de votre activité.</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={Package} label="Produits" value={fmt(s?.totalProducts)}
          sub={`${fmt(s?.lowStockCount || 0)} en alerte`} color="bg-primary/10 text-primary" index={0} />
        <KPICard icon={DollarSign} label="Valeur du Stock" value={`${fmt(s?.totalStockValue)} XAF`}
          color="bg-success/10 text-success" index={1} />
        <KPICard icon={ShoppingCart} label="Ventes du mois" value={fmt(s?.monthlySalesCount)}
          sub={
            <span className="flex items-center gap-2">
              <span>{fmt(s?.monthlySalesAmount)} XAF</span>
              {s?.comparison && <ChangeBadge value={s.comparison.countChange} />}
            </span>
          }
          color="bg-info/10 text-info" index={2} />
        <KPICard icon={AlertTriangle} label="Alertes" value={fmt(s?.activeAlerts)}
          sub={`${fmt(s?.outOfStockCount || 0)} ruptures`} color="bg-error/10 text-error" index={3} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="card bg-base-100 shadow-sm border border-base-content/5">
          <div className="card-body">
            <h3 className="font-bold flex items-center gap-2 mb-4">
              <BarChart3 size={18} className="text-primary" /> Évolution des ventes
            </h3>
            {s?.monthlyTrend?.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={s.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--bc)/0.1)" />
                  <XAxis dataKey="_id" tick={{ fontSize: 11 }} stroke="oklch(var(--bc)/0.4)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="oklch(var(--bc)/0.4)" />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                  <Bar dataKey="revenue" fill="#2563eb" radius={[6, 6, 0, 0]} name="Revenu" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[220px] text-base-content/40">Pas assez de données</div>
            )}
          </div>
        </motion.div>

        {/* Payment Breakdown Pie */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="card bg-base-100 shadow-sm border border-base-content/5">
          <div className="card-body">
            <h3 className="font-bold flex items-center gap-2 mb-4">
              <PieChart size={18} className="text-primary" /> Répartition des paiements
            </h3>
            {s?.paymentBreakdown?.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <RePieChart>
                  <Pie data={s.paymentBreakdown} dataKey="amount" nameKey="_id" cx="50%" cy="50%" outerRadius={80}
                    label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}>
                    {s.paymentBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[220px] text-base-content/40">Aucune donnée</div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="card bg-base-100 shadow-sm border border-base-content/5">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <ShoppingCart size={20} className="text-primary" /> Dernières Ventes
              </h2>
            </div>
            {s?.recentSales?.data?.length > 0 ? (
              <div className="space-y-3">
                {s.recentSales.data.slice(0, 5).map((sale) => (
                  <div key={sale._id}
                    className="flex items-center justify-between p-3 rounded-xl bg-base-200/50 hover:bg-base-200 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-success/10 text-success rounded-xl flex items-center justify-center shrink-0">
                        <TrendingUp size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{sale.saleNumber}</p>
                        <p className="text-xs text-base-content/50 truncate">
                          {sale.customerName || "Client"} — {sale.items?.length || 0} article(s)
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="card bg-base-100 shadow-sm border border-base-content/5">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Bell size={20} className="text-error" /> Alertes Récentes
              </h2>
            </div>
            {s?.recentAlerts?.length > 0 ? (
              <div className="space-y-3">
                {s.recentAlerts.slice(0, 5).map((alert) => (
                  <div key={alert._id}
                    className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                      alert.type === "out_of_stock" ? "bg-error/5 hover:bg-error/10" : "bg-warning/5 hover:bg-warning/10"
                    }`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        alert.type === "out_of_stock" ? "bg-error/10 text-error" : "bg-warning/10 text-warning"
                      }`}>
                        <AlertTriangle size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{alert.product?.name || "Produit"}</p>
                        <p className="text-xs text-base-content/50">
                          {alert.type === "out_of_stock" ? "Rupture de stock" : "Stock faible"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="font-mono font-bold text-sm">{alert.product?.currentStock ?? 0}</p>
                      <p className="text-xs text-base-content/50">Min: {alert.product?.minimumStock ?? 0}</p>
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

      {/* Days of Stock Remaining */}
      {s?.daysOfStockRemaining?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          className="card bg-base-100 shadow-sm border border-base-content/5">
          <div className="card-body">
            <h3 className="font-bold flex items-center gap-2 mb-4">
              <Clock size={18} className="text-warning" /> Jours de stock restants (basé sur la vélocité)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {s.daysOfStockRemaining.slice(0, 10).map((item) => (
                <div key={item.name} className="p-3 rounded-xl bg-base-200/50">
                  <p className="font-semibold text-sm truncate">{item.name}</p>
                  <p className={`text-lg font-bold mt-1 ${
                    item.daysRemaining === "N/A" || item.daysRemaining < 7 ? "text-error" :
                    item.daysRemaining < 30 ? "text-warning" : "text-success"
                  }`}>
                    {item.daysRemaining === "N/A" ? "N/A" : `${item.daysRemaining}j`}
                  </p>
                  <p className="text-xs text-base-content/40">Stock: {item.currentStock}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
