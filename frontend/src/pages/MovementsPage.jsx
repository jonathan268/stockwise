import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowLeftRight, ArrowUpRight, ArrowDownRight, RotateCcw, SlidersHorizontal,
  Plus, ChevronLeft, ChevronRight, Package, X, Save,
} from "lucide-react";
import axiosInstance from "../lib/axios";

const typeConfig = {
  in: { label: "Entrée", icon: ArrowUpRight, color: "text-success", bg: "bg-success/10" },
  out: { label: "Sortie", icon: ArrowDownRight, color: "text-error", bg: "bg-error/10" },
  sale: { label: "Vente", icon: ArrowDownRight, color: "text-info", bg: "bg-info/10" },
  return: { label: "Retour", icon: RotateCcw, color: "text-warning", bg: "bg-warning/10" },
  adjustment: { label: "Ajustement", icon: SlidersHorizontal, color: "text-secondary", bg: "bg-secondary/10" },
};

export default function MovementsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ productId: "", type: "in", quantity: "", reason: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["movements", page, typeFilter],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/movements", {
        params: { page, limit: 15, type: typeFilter || undefined },
      });
      return data;
    },
  });

  const { data: productsData } = useQuery({
    queryKey: ["products-list"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/products", { params: { limit: 200 } });
      return data.data;
    },
  });

  const movements = data?.data || [];
  const meta = data?.meta || { total: 0, totalPages: 1 };
  const products = productsData || [];

  const createMutation = useMutation({
    mutationFn: (payload) => axiosInstance.post("/movements", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movements"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setModalOpen(false);
      setForm({ productId: "", type: "in", quantity: "", reason: "" });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({ ...form, quantity: Number(form.quantity) });
  };

  const fmt = (n) => new Intl.NumberFormat("fr-FR").format(n || 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black font-display flex items-center gap-2">
            <ArrowLeftRight className="text-primary" size={26} /> Mouvements de Stock
          </h1>
          <p className="text-base-content/60 text-sm mt-1">Historique des entrées, sorties et ajustements</p>
        </div>
        <div className="flex gap-2">
          <select
            className="select select-bordered select-sm"
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          >
            <option value="">Tous les types</option>
            <option value="in">Entrées</option>
            <option value="out">Sorties</option>
            <option value="sale">Ventes</option>
            <option value="return">Retours</option>
            <option value="adjustment">Ajustements</option>
          </select>
          <button onClick={() => setModalOpen(true)} className="btn btn-primary btn-sm gap-2">
            <Plus size={16} /> Mouvement
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card bg-base-100 shadow-sm border border-base-content/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr className="bg-base-200/50">
                <th>Type</th>
                <th>Produit</th>
                <th>Quantité</th>
                <th>Avant</th>
                <th>Après</th>
                <th>Raison</th>
                <th>Par</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="8" className="text-center py-12"><span className="loading loading-spinner loading-lg text-primary" /></td></tr>
              ) : movements.length > 0 ? (
                movements.map((m, idx) => {
                  const config = typeConfig[m.type] || typeConfig.adjustment;
                  const Icon = config.icon;
                  return (
                    <motion.tr
                      key={m._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.02 }}
                      className="hover:bg-base-200/30"
                    >
                      <td>
                        <div className={`flex items-center gap-2 ${config.color}`}>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.bg}`}>
                            <Icon size={16} />
                          </div>
                          <span className="font-semibold text-sm">{config.label}</span>
                        </div>
                      </td>
                      <td className="font-medium">{m.product?.name || "—"}</td>
                      <td className="font-mono font-bold">{m.quantity}</td>
                      <td className="font-mono text-base-content/50">{m.quantityBefore}</td>
                      <td className="font-mono font-bold">{m.quantityAfter}</td>
                      <td className="text-sm text-base-content/60 max-w-[200px] truncate">{m.reason || "—"}</td>
                      <td className="text-sm">{m.createdBy?.firstName || "Système"}</td>
                      <td className="text-sm text-base-content/50">
                        {new Date(m.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </td>
                    </motion.tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-16">
                    <ArrowLeftRight className="mx-auto mb-3 opacity-30" size={40} />
                    <p className="text-base-content/50 font-medium">Aucun mouvement enregistré</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-base-content/5">
            <p className="text-sm text-base-content/60">Page {page} sur {meta.totalPages}</p>
            <div className="join">
              <button className="join-item btn btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft size={16} /></button>
              <button className="join-item btn btn-sm" disabled={page >= meta.totalPages} onClick={() => setPage(page + 1)}><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {/* Create Movement Modal */}
      {modalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-xl font-display">Nouveau mouvement</h3>
              <button onClick={() => setModalOpen(false)} className="btn btn-ghost btn-sm btn-circle"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label"><span className="label-text font-medium">Produit *</span></label>
                <select className="select select-bordered w-full" required
                  value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })}>
                  <option value="" disabled>Sélectionner un produit</option>
                  {products.map((p) => <option key={p._id} value={p._id}>{p.name} (Stock: {p.currentStock})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label"><span className="label-text font-medium">Type *</span></label>
                  <select className="select select-bordered w-full"
                    value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option value="in">Entrée</option>
                    <option value="out">Sortie</option>
                    <option value="return">Retour</option>
                    <option value="adjustment">Ajustement</option>
                  </select>
                </div>
                <div>
                  <label className="label"><span className="label-text font-medium">Quantité *</span></label>
                  <input type="number" className="input input-bordered w-full" required min="1"
                    value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label"><span className="label-text font-medium">Raison</span></label>
                <input type="text" className="input input-bordered w-full" placeholder="Réapprovisionnement, inventaire..."
                  value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
              </div>
              <div className="modal-action">
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-ghost">Annuler</button>
                <button type="submit" className="btn btn-primary gap-2" disabled={createMutation.isPending}>
                  {createMutation.isPending ? <span className="loading loading-spinner loading-sm" /> : <Save size={18} />}
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={() => setModalOpen(false)} />
        </div>
      )}
    </div>
  );
}
