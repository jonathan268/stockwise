import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Bell, AlertTriangle, PackageX, CheckCircle, Trash2, Eye,
  ChevronLeft, ChevronRight, Filter,
} from "lucide-react";
import axiosInstance from "../lib/axios";
import { useQueryClient } from "@tanstack/react-query";

export default function AlertsPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ type: "", isRead: false, page: 1, limit: 20 });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["alerts", filters],
    queryFn: async () => {
      const res = await axiosInstance.get("/alerts", { params: filters });
      return res.data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["alert-stats"],
    queryFn: async () => {
      const res = await axiosInstance.get("/alerts/stats");
      return res.data.data;
    },
  });

  const alerts = data?.data || [];
  const meta = data?.meta || {};

  const markAsRead = async (id) => {
    await axiosInstance.patch(`/alerts/${id}/read`);
    refetch();
    queryClient.invalidateQueries({ queryKey: ["alerts-unread-count"] });
  };

  const markAllRead = async () => {
    await axiosInstance.patch("/alerts");
    refetch();
    queryClient.invalidateQueries({ queryKey: ["alerts-unread-count"] });
  };

  const deleteAlert = async (id) => {
    await axiosInstance.delete(`/alerts/${id}`);
    refetch();
  };

  const fmt = (n) => new Intl.NumberFormat("fr-FR").format(n || 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black font-display flex items-center gap-2">
            <Bell className="text-error" size={26} /> Alertes
          </h1>
          <p className="text-base-content/60 text-sm mt-1">Notifications de stock et alertes critiques</p>
        </div>
        {stats?.unread > 0 && (
          <button onClick={markAllRead} className="btn btn-outline btn-sm gap-2">
            <CheckCircle size={16} /> Tout marquer comme lu
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card bg-base-100 shadow-sm border border-base-content/5 p-5">
          <p className="text-sm text-base-content/60">Total</p>
          <p className="text-3xl font-black mt-1">{fmt(stats?.total)}</p>
        </div>
        <div className="card bg-error/5 border border-error/10 p-5">
          <p className="text-sm text-error/80 flex items-center gap-1"><PackageX size={14} /> Ruptures</p>
          <p className="text-3xl font-black text-error mt-1">{fmt(stats?.outOfStock)}</p>
        </div>
        <div className="card bg-warning/5 border border-warning/10 p-5">
          <p className="text-sm text-warning/80 flex items-center gap-1"><AlertTriangle size={14} /> Stock Bas</p>
          <p className="text-3xl font-black text-warning mt-1">{fmt(stats?.lowStock)}</p>
        </div>
        <div className="card bg-info/5 border border-info/10 p-5">
          <p className="text-sm text-info/80">Non lues</p>
          <p className="text-3xl font-black text-info mt-1">{fmt(stats?.unread)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center">
        <Filter size={16} className="text-base-content/40" />
        <select
          className="select select-bordered select-sm"
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
        >
          <option value="">Tous les types</option>
          <option value="low_stock">Stock faible</option>
          <option value="out_of_stock">Rupture de stock</option>
        </select>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="checkbox checkbox-sm checkbox-primary"
            checked={!filters.isRead}
            onChange={(e) => setFilters({ ...filters, isRead: !e.target.checked, page: 1 })}
          />
          <span className="text-sm font-medium">Non lues uniquement</span>
        </label>
      </div>

      {/* Alerts List */}
      {isLoading ? (
        <div className="flex justify-center py-16"><span className="loading loading-spinner loading-lg text-primary" /></div>
      ) : alerts.length > 0 ? (
        <div className="space-y-3">
          {alerts.map((alert, idx) => {
            const isOutOfStock = alert.type === "out_of_stock";
            return (
              <motion.div
                key={alert._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                className={`card shadow-sm border overflow-hidden ${
                  isOutOfStock ? "border-error/20 bg-error/5" : "border-warning/20 bg-warning/5"
                }`}
              >
                <div className="card-body p-4 flex-row items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isOutOfStock ? "bg-error/10 text-error" : "bg-warning/10 text-warning"}`}>
                    {isOutOfStock ? <PackageX size={22} /> : <AlertTriangle size={22} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`badge badge-sm ${isOutOfStock ? "badge-error" : "badge-warning"}`}>
                        {isOutOfStock ? "Rupture" : "Stock Bas"}
                      </span>
                      {!alert.isRead && <span className="badge badge-info badge-sm">Nouveau</span>}
                    </div>
                    <h3 className="font-bold">{alert.product?.name || "Produit inconnu"}</h3>
                    <p className="text-sm text-base-content/60">
                      Stock: <span className="font-mono font-bold">{alert.product?.currentStock ?? 0}</span> / Min: <span className="font-mono">{alert.product?.minimumStock ?? 0}</span>
                      <span className="mx-2">·</span>
                      {new Date(alert.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    {!alert.isRead && (
                      <button onClick={() => markAsRead(alert._id)} className="btn btn-ghost btn-sm btn-circle" title="Marquer comme lu">
                        <Eye size={16} />
                      </button>
                    )}
                    <button onClick={() => deleteAlert(alert._id)} className="btn btn-ghost btn-sm btn-circle text-error" title="Supprimer">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="card bg-base-100 shadow-sm border border-base-content/5 p-16 text-center">
          <CheckCircle size={48} className="mx-auto mb-4 text-success/40" />
          <p className="text-lg font-bold text-base-content/60">Aucune alerte active</p>
          <p className="text-sm text-base-content/40 mt-1">Tous vos stocks sont en bon état</p>
        </div>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button className="btn btn-sm" disabled={filters.page <= 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })}>
            <ChevronLeft size={16} /> Précédent
          </button>
          <span className="text-sm text-base-content/60">Page {filters.page} / {meta.totalPages}</span>
          <button className="btn btn-sm" disabled={filters.page >= meta.totalPages} onClick={() => setFilters({ ...filters, page: filters.page + 1 })}>
            Suivant <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
