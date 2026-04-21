import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Package, Search, Edit3, Trash2, AlertCircle,
  ChevronLeft, ChevronRight, X, Save, BarChart3,
} from "lucide-react";
import axiosInstance from "../lib/axios";

const StockBadge = ({ current, min }) => {
  if (current === 0) return <span className="badge badge-error badge-sm font-bold">Rupture</span>;
  if (current <= min) return <span className="badge badge-warning badge-sm font-bold">Bas</span>;
  return <span className="badge badge-success badge-sm font-bold">OK</span>;
};

const emptyProduct = {
  name: "", description: "",
  costPrice: "", sellingPrice: "", currentStock: "",
  minimumStock: "5", unit: "pièce", category: "",
};

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Quick category creation state
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  // Fetch products
  const { data, isLoading } = useQuery({
    queryKey: ["products", page, search],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/products", {
        params: { page, limit: 10, search },
      });
      return data;
    },
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/categories");
      return data.data;
    },
  });

  const products = data?.data || [];
  const meta = data?.meta || { total: 0, totalPages: 1 };
  const categories = categoriesData || [];

  // Create / Update mutation
  const saveMutation = useMutation({
    mutationFn: async (productData) => {
      if (editingProduct) {
        return axiosInstance.put(`/products/${editingProduct._id}`, productData);
      }
      return axiosInstance.post("/products", productData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      closeModal();
    },
  });

  // Create category mutation
  const categoryMutation = useMutation({
    mutationFn: async (categoryData) => {
      const { data } = await axiosInstance.post("/categories", categoryData);
      return data.data;
    },
    onSuccess: (newCat) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setForm((prev) => ({ ...prev, category: newCat._id }));
      setIsCreatingCategory(false);
      setNewCatName("");
    },
  });

  const handleQuickCategory = async () => {
    if (!newCatName.trim()) return setIsCreatingCategory(false);
    categoryMutation.mutate({ name: newCatName.trim() });
  };
  const deleteMutation = useMutation({
    mutationFn: (id) => axiosInstance.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setDeleteConfirm(null);
    },
  });

  const openCreate = () => {
    setEditingProduct(null);
    setForm(emptyProduct);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name || "",
      description: product.description || "",
      costPrice: product.costPrice || "",
      sellingPrice: product.sellingPrice || "",
      currentStock: product.currentStock || "",
      minimumStock: product.minimumStock || "5",
      unit: product.unit || "pièce",
      category: product.category?._id || product.category || "",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
    setForm(emptyProduct);
    setIsCreatingCategory(false);
    setNewCatName("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      costPrice: Number(form.costPrice),
      sellingPrice: Number(form.sellingPrice),
      currentStock: Number(form.currentStock),
      minimumStock: Number(form.minimumStock),
    };
    if (!payload.category) delete payload.category;
    saveMutation.mutate(payload);
  };

  const fmt = (n) => new Intl.NumberFormat("fr-FR").format(n || 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black font-display flex items-center gap-2">
            <Package className="text-primary" size={26} /> Inventaire
          </h1>
          <p className="text-base-content/60 text-sm mt-1">
            {fmt(meta.total)} produit{meta.total > 1 ? "s" : ""} enregistré{meta.total > 1 ? "s" : ""}
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

      {/* Table */}
      <div className="card bg-base-100 shadow-sm border border-base-content/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr className="bg-base-200/50">
                <th>Produit</th>
                <th>Catégorie</th>
                <th>Prix Achat</th>
                <th>Prix Vente</th>
                <th>Stock</th>
                <th>Statut</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="7" className="text-center py-12"><span className="loading loading-spinner loading-lg text-primary" /></td></tr>
              ) : products.length > 0 ? (
                products.map((p, idx) => (
                  <motion.tr
                    key={p._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="hover:bg-base-200/30"
                  >
                    <td>
                      <div>
                        <p className="font-semibold">{p.name}</p>
                        <p className="text-xs text-base-content/50">{p.sku || "—"}</p>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-ghost badge-sm">{p.category?.name || "—"}</span>
                    </td>
                    <td className="font-mono text-sm">{fmt(p.costPrice)} XAF</td>
                    <td className="font-mono text-sm font-semibold">{fmt(p.sellingPrice)} XAF</td>
                    <td className="font-mono font-bold">{p.currentStock} {p.unit}</td>
                    <td><StockBadge current={p.currentStock} min={p.minimumStock} /></td>
                    <td>
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEdit(p)} className="btn btn-ghost btn-sm btn-circle"><Edit3 size={16} /></button>
                        <button onClick={() => setDeleteConfirm(p)} className="btn btn-ghost btn-sm btn-circle text-error"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-16">
                    <AlertCircle className="mx-auto mb-3 opacity-30" size={40} />
                    <p className="text-base-content/50 font-medium">Aucun produit trouvé</p>
                    <button onClick={openCreate} className="btn btn-primary btn-sm mt-4">Ajouter un produit</button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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

      {/* ── Create/Edit Modal ── */}
      <AnimatePresence>
        {modalOpen && (
          <div className="modal modal-open">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="modal-box max-w-lg"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-xl font-display">
                  {editingProduct ? "Modifier le produit" : "Nouveau produit"}
                </h3>
                <button onClick={closeModal} className="btn btn-ghost btn-sm btn-circle"><X size={20} /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="label"><span className="label-text font-medium">Nom du produit *</span></label>
                    <input type="text" className="input input-bordered w-full" required
                      value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>

                  <div>
                    <label className="label flex justify-between items-center">
                      <span className="label-text font-medium">Catégorie</span>
                      <button 
                        type="button"
                        onClick={() => setIsCreatingCategory(!isCreatingCategory)}
                        className={`btn btn-xs btn-circle ${isCreatingCategory ? 'btn-error' : 'btn-primary'}`}
                        title={isCreatingCategory ? "Annuler" : "Nouvelle catégorie"}
                      >
                        {isCreatingCategory ? <X size={12} /> : <Plus size={12} />}
                      </button>
                    </label>
                    
                    {isCreatingCategory ? (
                      <div className="join w-full">
                        <input 
                          type="text" 
                          autoFocus
                          placeholder="Nom de catégorie..." 
                          className="input input-bordered input-sm join-item w-full"
                          value={newCatName}
                          onChange={(e) => setNewCatName(e.target.value)}
                          onKeyDown={(e) => {
                            if(e.key === 'Enter') { e.preventDefault(); handleQuickCategory(); }
                          }}
                        />
                        <button 
                          type="button" 
                          onClick={handleQuickCategory}
                          className="btn btn-sm btn-primary join-item px-4"
                          disabled={categoryMutation.isPending}
                        >
                          {categoryMutation.isPending ? <span className="loading loading-spinner loading-xs" /> : "OK"}
                        </button>
                      </div>
                    ) : (
                      <select className="select select-bordered w-full"
                        value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                        <option value="">Sans catégorie</option>
                        {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                      </select>
                    )}
                  </div>
                  <div>
                    <label className="label"><span className="label-text font-medium">Prix d'achat *</span></label>
                    <input type="number" className="input input-bordered w-full" required min="0"
                      value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} />
                  </div>
                  <div>
                    <label className="label"><span className="label-text font-medium">Prix de vente *</span></label>
                    <input type="number" className="input input-bordered w-full" required min="0"
                      value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} />
                  </div>
                  <div>
                    <label className="label"><span className="label-text font-medium">Stock initial *</span></label>
                    <input type="number" className="input input-bordered w-full" required min="0"
                      value={form.currentStock} onChange={(e) => setForm({ ...form, currentStock: e.target.value })} />
                  </div>
                  <div>
                    <label className="label"><span className="label-text font-medium">Stock minimum</span></label>
                    <input type="number" className="input input-bordered w-full" min="0"
                      value={form.minimumStock} onChange={(e) => setForm({ ...form, minimumStock: e.target.value })} />
                  </div>
                  <div>
                    <label className="label"><span className="label-text font-medium">Unité</span></label>
                    <select className="select select-bordered w-full"
                      value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                      <option value="pièce">Pièce</option>
                      <option value="kg">Kg</option>
                      <option value="litre">Litre</option>
                      <option value="mètre">Mètre</option>
                      <option value="sac">Sac</option>
                      <option value="carton">Carton</option>
                    </select>
                  </div>
                </div>

                <div className="modal-action">
                  <button type="button" onClick={closeModal} className="btn btn-ghost">Annuler</button>
                  <button type="submit" className="btn btn-primary gap-2" disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? <span className="loading loading-spinner loading-sm" /> : <Save size={18} />}
                    {editingProduct ? "Enregistrer" : "Créer le produit"}
                  </button>
                </div>
              </form>
            </motion.div>
            <div className="modal-backdrop" onClick={closeModal} />
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Confirmer la suppression</h3>
            <p className="py-4 text-base-content/70">
              Êtes-vous sûr de vouloir supprimer <strong>{deleteConfirm.name}</strong> ? Cette action est irréversible.
            </p>
            <div className="modal-action">
              <button onClick={() => setDeleteConfirm(null)} className="btn btn-ghost">Annuler</button>
              <button
                onClick={() => deleteMutation.mutate(deleteConfirm._id)}
                className="btn btn-error gap-2"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? <span className="loading loading-spinner loading-sm" /> : <Trash2 size={16} />}
                Supprimer
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setDeleteConfirm(null)} />
        </div>
      )}
    </div>
  );
}
