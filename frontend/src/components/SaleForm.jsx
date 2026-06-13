import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Trash2, ShoppingCart, AlertCircle } from "lucide-react";
import axiosInstance from "../lib/axios";
import { useToastStore } from "../store/toastStore";

export default function SaleForm({ onSuccess }) {
  const [items, setItems] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { data: productsData } = useQuery({
    queryKey: ["products-for-sale"],
    queryFn: async () => {
      const res = await axiosInstance.get("/products", { params: { limit: 1000 } });
      return res.data;
    },
  });

  const products = productsData?.data || [];

  const addItem = () => setItems([...items, { productId: "", quantity: 1, unitPrice: 0, product: null }]);
  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));

  const updateItem = (idx, field, value) => {
    const updated = [...items];
    updated[idx][field] = value;
    if (field === "productId" && value) {
      const p = products.find((p) => p._id === value);
      if (p) {
        updated[idx].product = p;
        if (!updated[idx].unitPrice) updated[idx].unitPrice = p.sellingPrice || p.price || 0;
      }
    }
    setItems(updated);
  };

  const total = items.reduce((sum, i) => sum + (i.quantity * i.unitPrice || 0), 0);
  const fmt = (n) => new Intl.NumberFormat("fr-FR").format(n || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (items.length === 0) throw new Error("Ajoutez au moins un article");
      for (const item of items) {
        if (!item.productId || item.quantity <= 0) throw new Error("Complétez tous les articles");
      }

      await axiosInstance.post("/sales", {
        items: items.map((i) => ({ productId: i.productId, quantity: parseInt(i.quantity), unitPrice: parseFloat(i.unitPrice) })),
        paymentMethod,
        customerName: customerName || undefined,
        note: note || undefined,
      });

      setItems([]);
      setCustomerName("");
      setPaymentMethod("cash");
      setNote("");
      useToastStore.getState().success("Vente enregistrée avec succès");
      if (onSuccess) onSuccess();
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Erreur lors de la création";
      setError(msg);
      useToastStore.getState().error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Client & Payment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label"><span className="label-text font-medium">Client (optionnel)</span></label>
          <input type="text" className="input input-bordered w-full" placeholder="Nom du client"
            value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
        </div>
        <div>
          <label className="label"><span className="label-text font-medium">Paiement</span></label>
          <select className="select select-bordered w-full"
            value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option value="cash">Espèces</option>
            <option value="card">Carte bancaire</option>
            <option value="mobile_money">Mobile Money</option>
            <option value="credit">Crédit</option>
          </select>
        </div>
      </div>

      <div>
        <label className="label"><span className="label-text font-medium">Note (optionnelle)</span></label>
        <textarea className="textarea textarea-bordered w-full" rows="2" placeholder="Ajouter une note..."
          value={note} onChange={(e) => setNote(e.target.value)} />
      </div>

      {/* Items */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold">Articles</h3>
          <button type="button" onClick={addItem} className="btn btn-ghost btn-sm gap-1 text-primary">
            <Plus size={16} /> Ajouter
          </button>
        </div>

        {items.length === 0 ? (
          <div className="bg-base-200/50 rounded-xl p-8 text-center text-base-content/40">
            <ShoppingCart size={28} className="mx-auto mb-2 opacity-50" />
            <p className="font-medium">Cliquez sur "Ajouter" pour commencer</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-12 md:col-span-5">
                  <select className="select select-bordered select-sm w-full"
                    value={item.productId} onChange={(e) => updateItem(idx, "productId", e.target.value)}>
                    <option value="">Sélectionner un produit</option>
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>{p.name} (Stock: {p.currentStock})</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-4 md:col-span-2">
                  <input type="number" min="1" className="input input-bordered input-sm w-full" placeholder="Qty"
                    value={item.quantity} onChange={(e) => updateItem(idx, "quantity", e.target.value)} />
                </div>
                <div className="col-span-4 md:col-span-2">
                  <input type="number" min="0" className="input input-bordered input-sm w-full" placeholder="Prix"
                    value={item.unitPrice} onChange={(e) => updateItem(idx, "unitPrice", e.target.value)} />
                </div>
                <div className="col-span-3 md:col-span-2 text-right">
                  <div className="bg-base-200 rounded-lg px-3 py-2 text-sm font-bold">
                    {fmt(item.quantity * item.unitPrice)} XAF
                  </div>
                </div>
                <div className="col-span-1">
                  <button type="button" onClick={() => removeItem(idx)} className="btn btn-ghost btn-sm btn-circle text-error">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Total */}
      {items.length > 0 && (
        <div className="bg-base-200/50 rounded-xl p-4 flex justify-between items-center">
          <span className="font-bold text-lg">Total à payer</span>
          <span className="text-2xl font-black text-primary">{fmt(total)} XAF</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <button type="button" className="btn btn-ghost"
          onClick={() => { setItems([]); setCustomerName(""); setPaymentMethod("cash"); setNote(""); }}>
          Réinitialiser
        </button>
        <button type="submit" className="btn btn-primary gap-2" disabled={loading || items.length === 0}>
          {loading ? <span className="loading loading-spinner loading-sm" /> : <ShoppingCart size={18} />}
          Valider ({fmt(total)} XAF)
        </button>
      </div>
    </form>
  );
}
