import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ShoppingCart, Plus, Search, DollarSign, TrendingUp, Hash,
  Calendar, ChevronLeft, ChevronRight, X as XIcon, Eye, Download,
} from "lucide-react";
import axiosInstance from "../lib/axios";
import SaleForm from "../components/SaleForm";
import { useDebounce } from "use-debounce";

const paymentBadge = {
  cash: "badge-success",
  card: "badge-info",
  mobile_money: "badge-warning",
  credit: "badge-error",
};

const paymentLabel = {
  cash: "Espèces",
  card: "Carte",
  mobile_money: "Mobile Money",
  credit: "Crédit",
};

export default function SalesPage() {
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ search: "", paymentMethod: "", startDate: "", endDate: "" });
  const [cancelModal, setCancelModal] = useState({ open: false, saleId: null, reason: "" });
  const [debouncedSearch] = useDebounce(filters.search, 500);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["sales", page, filters.paymentMethod, filters.startDate, filters.endDate, debouncedSearch],
    queryFn: async () => {
      const activeFilters = { ...filters, search: debouncedSearch };
      const res = await axiosInstance.get("/sales", { params: { page, limit: 10, ...activeFilters } });
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  const { data: stats } = useQuery({
    queryKey: ["sales-stats"],
    queryFn: async () => {
      const res = await axiosInstance.get("/sales/stats/month");
      return res.data?.data?.stats;
    },
  });

  const sales = data?.data || [];
  const meta = data?.meta || { total: 0, totalPages: 1 };

  const handleSaleCreated = () => { setShowForm(false); refetch(); setPage(1); };

  const confirmCancel = async () => {
    try {
      await axiosInstance.post(`/sales/${cancelModal.saleId}/cancel`, { reason: cancelModal.reason });
      refetch();
      setCancelModal({ open: false, saleId: null, reason: "" });
    } catch (err) {
      alert(err.response?.data?.error || "Erreur lors de l'annulation");
    }
  };

  const fmt = (n) => new Intl.NumberFormat("fr-FR").format(n || 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black font-display flex items-center gap-2">
            <ShoppingCart className="text-primary" size={26} /> Ventes
          </h1>
          <p className="text-base-content/60 text-sm mt-1">Historique et création de ventes</p>
        </div>
        <div className="flex gap-2">
          <a href={`${import.meta.env.VITE_API_URL}/exports/sales/csv`}
            className="btn btn-ghost btn-sm gap-2" target="_blank" rel="noopener">
            <Download size={16} /> CSV
          </a>
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary gap-2">
            {showForm ? <XIcon size={18} /> : <Plus size={18} />}
            {showForm ? "Fermer" : "Nouvelle vente"}
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card bg-base-100 shadow-sm border border-base-content/5 p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center"><Hash size={20} /></div>
              <div><p className="text-sm text-base-content/60">Total Ventes</p><p className="text-2xl font-black">{fmt(stats.totalSales)}</p></div>
            </div>
          </div>
          <div className="card bg-base-100 shadow-sm border border-base-content/5 p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-success/10 text-success rounded-2xl flex items-center justify-center"><DollarSign size={20} /></div>
              <div><p className="text-sm text-base-content/60">Chiffre d'affaire</p><p className="text-2xl font-black">{fmt(stats.totalAmount)} XAF</p></div>
            </div>
          </div>
          <div className="card bg-base-100 shadow-sm border border-base-content/5 p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-info/10 text-info rounded-2xl flex items-center justify-center"><TrendingUp size={20} /></div>
              <div><p className="text-sm text-base-content/60">Moyenne/Vente</p><p className="text-2xl font-black">{fmt(stats.averageAmount)} XAF</p></div>
            </div>
          </div>
        </div>
      )}

      {/* Sale Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="card bg-base-100 shadow-sm border border-primary/20 overflow-hidden">
          <div className="card-body">
            <h3 className="font-bold text-lg mb-4">Nouvelle vente</h3>
            <SaleForm onSuccess={handleSaleCreated} />
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <div className="card bg-base-100 shadow-sm border border-base-content/5 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <label className="input input-bordered input-sm flex items-center gap-2">
            <Search size={14} className="text-base-content/40" />
            <input type="text" placeholder="Rechercher..." className="grow"
              value={filters.search} onChange={(e) => { setFilters({ ...filters, search: e.target.value }); setPage(1); }} />
          </label>
          <select className="select select-bordered select-sm"
            value={filters.paymentMethod} onChange={(e) => { setFilters({ ...filters, paymentMethod: e.target.value }); setPage(1); }}>
            <option value="">Tous les paiements</option>
            <option value="cash">Espèces</option>
            <option value="card">Carte</option>
            <option value="mobile_money">Mobile Money</option>
            <option value="credit">Crédit</option>
          </select>
          <input type="date" className="input input-bordered input-sm"
            value={filters.startDate} onChange={(e) => { setFilters({ ...filters, startDate: e.target.value }); setPage(1); }} />
          <input type="date" className="input input-bordered input-sm"
            value={filters.endDate} onChange={(e) => { setFilters({ ...filters, endDate: e.target.value }); setPage(1); }} />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-16"><span className="loading loading-spinner loading-lg text-primary" /></div>
      ) : error ? (
        <div className="alert alert-error"><span>Erreur: {error.message}</span></div>
      ) : sales.length > 0 ? (
        <div className="card bg-base-100 shadow-sm border border-base-content/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead><tr className="bg-base-200/50">
                <th>Numéro</th><th>Client</th><th>Articles</th><th>Montant</th><th>Paiement</th><th>Date</th><th className="text-right">Actions</th>
              </tr></thead>
              <tbody>
                {sales.map((sale, idx) => (
                  <motion.tr key={sale._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }} className="hover:bg-base-200/30">
                    <td className="font-mono font-semibold text-primary">{sale.saleNumber}</td>
                    <td>{sale.customerName || "—"}</td>
                    <td><span className="badge badge-ghost badge-sm">{sale.items?.length || 0} article(s)</span></td>
                    <td className="font-mono font-bold">{fmt(sale.totalAmount)} XAF</td>
                    <td><span className={`badge badge-sm ${paymentBadge[sale.paymentMethod] || "badge-ghost"}`}>{paymentLabel[sale.paymentMethod] || sale.paymentMethod}</span></td>
                    <td className="text-sm text-base-content/60">{new Date(sale.createdAt).toLocaleDateString("fr-FR")}</td>
                    <td>
                      <div className="flex justify-end gap-1">
                        {sale.status === "completed" && (
                          <button onClick={() => setCancelModal({ open: true, saleId: sale._id, reason: "" })} className="btn btn-ghost btn-xs text-error">Annuler</button>
                        )}
                        {sale.status === "cancelled" && (
                          <span className="badge badge-error badge-outline badge-sm">Annulée</span>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-base-content/5">
              <p className="text-sm text-base-content/60">Page {page} sur {meta.totalPages} ({fmt(meta.total)} résultats)</p>
              <div className="join">
                <button className="join-item btn btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft size={16} /></button>
                <button className="join-item btn btn-sm" disabled={page >= meta.totalPages} onClick={() => setPage(page + 1)}><ChevronRight size={16} /></button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="card bg-base-100 shadow-sm border border-base-content/5 p-16 text-center">
          <ShoppingCart size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-lg font-bold text-base-content/60">Aucune vente trouvée</p>
          <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm mt-4">Créer la première vente</button>
        </div>
      )}

      {/* Cancel Modal */}
      {cancelModal.open && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Confirmer l'annulation</h3>
            <p className="py-2 text-base-content/70">Êtes-vous sûr de vouloir annuler cette vente ? Le stock sera automatiquement restitué.</p>
            <div className="form-control mt-4">
              <label className="label"><span className="label-text">Raison de l'annulation</span></label>
              <textarea 
                className="textarea textarea-bordered h-24" 
                placeholder="Ex: Erreur de saisie, retour client..."
                value={cancelModal.reason}
                onChange={(e) => setCancelModal({ ...cancelModal, reason: e.target.value })}
              ></textarea>
            </div>
            <div className="modal-action">
              <button onClick={() => setCancelModal({ open: false, saleId: null, reason: "" })} className="btn btn-ghost">Fermer</button>
              <button 
                onClick={confirmCancel} 
                className="btn btn-error gap-2"
                disabled={!cancelModal.reason.trim()}
              >
                Confirmer l'annulation
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setCancelModal({ open: false, saleId: null, reason: "" })} />
        </div>
      )}
    </div>
  );
}
