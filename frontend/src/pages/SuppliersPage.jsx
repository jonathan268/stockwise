import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Edit3, Trash2, AlertCircle,
  ChevronLeft, ChevronRight, X, Save, Building2,
  Phone, Mail, MapPin, FileText,
} from "lucide-react";
import axiosInstance from "../lib/axios";
import { useDebounce } from "use-debounce";

const emptySupplier = {
  name: "", contactName: "", email: "", phone: "",
  address: "", paymentTerms: "", notes: "",
};

export default function SuppliersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [form, setForm] = useState(emptySupplier);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [viewingSupplier, setViewingSupplier] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["suppliers", page, debouncedSearch],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/suppliers", {
        params: { page, limit: 10, search: debouncedSearch },
      });
      return data;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  const suppliers = data?.data || [];
  const meta = data?.meta || { total: 0, totalPages: 1 };

  const saveMutation = useMutation({
    mutationFn: async (supplierData) => {
      if (editingSupplier) {
        return axiosInstance.put(`/suppliers/${editingSupplier._id}`, supplierData);
      }
      return axiosInstance.post("/suppliers", supplierData);
    },
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ["suppliers"] });
      const previous = queryClient.getQueryData(["suppliers", page, debouncedSearch]);
      if (editingSupplier && previous) {
        queryClient.setQueryData(["suppliers", page, debouncedSearch], {
          ...previous,
          data: previous.data.map((s) => s._id === editingSupplier._id ? { ...s, ...newData } : s),
        });
      }
      return { previous };
    },
    onError: (err, newData, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["suppliers", page, debouncedSearch], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
    onSuccess: () => closeModal(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => axiosInstance.delete(`/suppliers/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["suppliers"] });
      const previous = queryClient.getQueryData(["suppliers", page, debouncedSearch]);
      if (previous) {
        queryClient.setQueryData(["suppliers", page, debouncedSearch], {
          ...previous,
          data: previous.data.filter((s) => s._id !== id),
        });
      }
      return { previous };
    },
    onError: (err, id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["suppliers", page, debouncedSearch], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      setDeleteConfirm(null);
    },
  });

  const openCreate = () => {
    setEditingSupplier(null);
    setForm(emptySupplier);
    setModalOpen(true);
  };

  const openEdit = (supplier) => {
    setEditingSupplier(supplier);
    setForm({
      name: supplier.name || "",
      contactName: supplier.contactName || "",
      email: supplier.email || "",
      phone: supplier.phone || "",
      address: supplier.address || "",
      paymentTerms: supplier.paymentTerms || "",
      notes: supplier.notes || "",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingSupplier(null);
    setForm(emptySupplier);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {};
    Object.keys(form).forEach((k) => {
      if (form[k]) payload[k] = form[k];
    });
    saveMutation.mutate(payload);
  };

  const fmt = (n) => new Intl.NumberFormat("fr-FR").format(n || 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black font-display flex items-center gap-2">
            <Building2 className="text-primary" size={26} /> Fournisseurs
          </h1>
          <p className="text-base-content/60 text-sm mt-1">
            {fmt(meta.total)} fournisseur{meta.total > 1 ? "s" : ""} enregistré{meta.total > 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <label className="input input-bordered flex items-center gap-2 flex-1 sm:w-64">
            <Search size={16} className="text-base-content/40" />
            <input
              type="text" placeholder="Rechercher..."
              value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="grow"
            />
          </label>
          <button onClick={openCreate} className="btn btn-primary gap-2">
            <Plus size={18} />
            <span className="hidden sm:inline">Nouveau</span>
          </button>
        </div>
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-content/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr className="bg-base-200/50">
                <th>Nom</th>
                <th>Contact</th>
                <th>Email / Téléphone</th>
                <th>Produits</th>
                <th>Mouvements</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="6" className="text-center py-12"><span className="loading loading-spinner loading-lg text-primary" /></td></tr>
              ) : suppliers.length > 0 ? (
                suppliers.map((s, idx) => (
                  <motion.tr
                    key={s._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="hover:bg-base-200/30 cursor-pointer"
                    onClick={() => setViewingSupplier(s)}
                  >
                    <td>
                      <div>
                        <p className="font-semibold">{s.name}</p>
                        <p className="text-xs text-base-content/50">{s.contactName || "—"}</p>
                      </div>
                    </td>
                    <td>
                      {s.phone && (
                        <div className="flex items-center gap-1 text-sm text-base-content/70">
                          <Phone size={13} /> {s.phone}
                        </div>
                      )}
                      {!s.phone && <span className="text-base-content/40">—</span>}
                    </td>
                    <td>
                      <div className="text-sm">
                        {s.email && <div className="flex items-center gap-1"><Mail size={13} className="text-base-content/50" /> {s.email}</div>}
                        {!s.email && <span className="text-base-content/40">—</span>}
                      </div>
                    </td>
                    <td className="font-mono text-sm">{s.productCount || 0}</td>
                    <td className="font-mono text-sm">{s.movementCount || 0}</td>
                    <td>
                      <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => openEdit(s)} className="btn btn-ghost btn-sm btn-circle"><Edit3 size={16} /></button>
                        <button onClick={() => setDeleteConfirm(s)} className="btn btn-ghost btn-sm btn-circle text-error"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-16">
                    <Building2 className="mx-auto mb-3 opacity-30" size={40} />
                    <p className="text-base-content/50 font-medium">Aucun fournisseur trouvé</p>
                    <button onClick={openCreate} className="btn btn-primary btn-sm mt-4">Ajouter un fournisseur</button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-base-content/5">
            <p className="text-sm text-base-content/60">
              Page {page} sur {meta.totalPages} ({fmt(meta.total)} résultats)
            </p>
            <div className="join">
              <button className="join-item btn btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                <ChevronLeft size={16} />
              </button>
              <button className="join-item btn btn-sm" disabled={page >= meta.totalPages} onClick={() => setPage(page + 1)}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="modal modal-open">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="modal-box max-w-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-xl font-display">
                  {editingSupplier ? "Modifier le fournisseur" : "Nouveau fournisseur"}
                </h3>
                <button onClick={closeModal} className="btn btn-ghost btn-sm btn-circle"><X size={20} /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="label"><span className="label-text font-medium">Nom *</span></label>
                    <input type="text" className="input input-bordered w-full" required
                      value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>

                  <div>
                    <label className="label"><span className="label-text font-medium">Personne de contact</span></label>
                    <input type="text" className="input input-bordered w-full" placeholder="Nom du contact"
                      value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
                  </div>
                  <div>
                    <label className="label"><span className="label-text font-medium">Téléphone</span></label>
                    <input type="text" className="input input-bordered w-full" placeholder="+237 6XX XXX XXX"
                      value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                  <div className="col-span-2">
                    <label className="label"><span className="label-text font-medium">Email</span></label>
                    <input type="email" className="input input-bordered w-full" placeholder="contact@fournisseur.com"
                      value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div className="col-span-2">
                    <label className="label"><span className="label-text font-medium">Adresse</span></label>
                    <textarea className="textarea textarea-bordered w-full" rows="2" placeholder="Adresse complète"
                      value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                  </div>
                  <div>
                    <label className="label"><span className="label-text font-medium">Conditions de paiement</span></label>
                    <select className="select select-bordered w-full"
                      value={form.paymentTerms} onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })}>
                      <option value="">Sélectionner</option>
                      <option value="Comptant">Comptant</option>
                      <option value="30 jours">30 jours</option>
                      <option value="60 jours">60 jours</option>
                      <option value="45 jours fin de mois">45 jours fin de mois</option>
                      <option value="À négocier">À négocier</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label"><span className="label-text font-medium">Notes</span></label>
                  <textarea className="textarea textarea-bordered w-full" rows="2" placeholder="Informations complémentaires..."
                    value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </div>

                <div className="modal-action">
                  <button type="button" onClick={closeModal} className="btn btn-ghost">Annuler</button>
                  <button type="submit" className="btn btn-primary gap-2" disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? <span className="loading loading-spinner loading-sm" /> : <Save size={18} />}
                    {editingSupplier ? "Enregistrer" : "Créer le fournisseur"}
                  </button>
                </div>
              </form>
            </motion.div>
            <div className="modal-backdrop" onClick={closeModal} />
          </div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {viewingSupplier && (
          <div className="modal modal-open">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="modal-box max-w-lg"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-xl font-display">{viewingSupplier.name}</h3>
                <button onClick={() => setViewingSupplier(null)} className="btn btn-ghost btn-sm btn-circle"><X size={20} /></button>
              </div>

              <div className="space-y-4">
                {viewingSupplier.contactName && (
                  <div className="flex items-center gap-2 text-base-content/70"><FileText size={16} /> {viewingSupplier.contactName}</div>
                )}
                {viewingSupplier.phone && (
                  <div className="flex items-center gap-2 text-base-content/70"><Phone size={16} /> {viewingSupplier.phone}</div>
                )}
                {viewingSupplier.email && (
                  <div className="flex items-center gap-2 text-base-content/70"><Mail size={16} /> {viewingSupplier.email}</div>
                )}
                {viewingSupplier.address && (
                  <div className="flex items-start gap-2 text-base-content/70"><MapPin size={16} className="mt-0.5" /> {viewingSupplier.address}</div>
                )}
                {viewingSupplier.paymentTerms && (
                  <div className="badge badge-outline">{viewingSupplier.paymentTerms}</div>
                )}

                <div className="divider" />

                <div className="grid grid-cols-2 gap-4">
                  <div className="stat bg-base-200/50 rounded-box px-4 py-3">
                    <div className="stat-title text-xs">Produits liés</div>
                    <div className="stat-value text-lg">{viewingSupplier.productCount || 0}</div>
                  </div>
                  <div className="stat bg-base-200/50 rounded-box px-4 py-3">
                    <div className="stat-title text-xs">Mouvements</div>
                    <div className="stat-value text-lg">{viewingSupplier.movementCount || 0}</div>
                  </div>
                </div>

                {viewingSupplier.products?.length > 0 && (
                  <div>
                    <p className="font-medium text-sm mb-2">Produits associés</p>
                    <div className="space-y-1">
                      {viewingSupplier.products.map((p) => (
                        <div key={p._id} className="flex justify-between text-sm bg-base-200/30 rounded-lg px-3 py-2">
                          <span>{p.name}</span>
                          <span className="font-mono">{p.currentStock} en stock</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {viewingSupplier.notes && (
                  <div>
                    <p className="font-medium text-sm mb-1">Notes</p>
                    <p className="text-sm text-base-content/60">{viewingSupplier.notes}</p>
                  </div>
                )}
              </div>
            </motion.div>
            <div className="modal-backdrop" onClick={() => setViewingSupplier(null)} />
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Confirmer la suppression</h3>
            <p className="py-4 text-base-content/70">
              Êtes-vous sûr de vouloir désactiver <strong>{deleteConfirm.name}</strong> ?
            </p>
            <div className="modal-action">
              <button onClick={() => setDeleteConfirm(null)} className="btn btn-ghost">Annuler</button>
              <button
                onClick={() => deleteMutation.mutate(deleteConfirm._id)}
                className="btn btn-error gap-2"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? <span className="loading loading-spinner loading-sm" /> : <Trash2 size={16} />}
                Désactiver
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setDeleteConfirm(null)} />
        </div>
      )}
    </div>
  );
}
