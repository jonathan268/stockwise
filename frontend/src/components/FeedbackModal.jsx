import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import { MessageSquare, Send, X, Check, AlertCircle } from "lucide-react";
import { useAuthStore } from "../store/authStore";

const types = [
  { value: "bug", label: "Bug" },
  { value: "feature_request", label: "Suggestion" },
  { value: "general", label: "Général" },
  { value: "ux", label: "Expérience utilisateur" },
  { value: "billing", label: "Facturation" },
];

const ratings = [1, 2, 3, 4, 5];

export default function FeedbackModal({ isOpen, onClose }) {
  const { user } = useAuthStore();
  const [form, setForm] = useState({ type: "general", title: "", message: "", rating: null });
  const [sent, setSent] = useState(false);

  const mutation = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post("/feedback", data);
      return res.data;
    },
    onSuccess: () => {
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setForm({ type: "general", title: "", message: "", rating: null });
        onClose();
      }, 2000);
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) return;
    mutation.mutate(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-base-content/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-base-100 rounded-2xl shadow-2xl w-full max-w-md p-6">
        <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle absolute top-3 right-3">
          <X size={18} />
        </button>

        {sent ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} />
            </div>
            <h3 className="text-lg font-bold">Merci !</h3>
            <p className="text-sm text-base-content/60 mt-1">Votre feedback nous aide à améliorer StockWise.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/10 text-primary rounded-xl">
                <MessageSquare size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold">Votre avis compte</h3>
                <p className="text-sm text-base-content/60">Une suggestion ? Un problème ? Dites-nous tout.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label"><span className="label-text font-medium">Type</span></label>
                <div className="flex flex-wrap gap-2">
                  {types.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setForm({ ...form, type: t.value })}
                      className={`btn btn-xs ${form.type === t.value ? "btn-primary" : "btn-ghost border"}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label"><span className="label-text font-medium">Titre</span></label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="En quelques mots..."
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  maxLength={120}
                  required
                />
              </div>

              <div>
                <label className="label"><span className="label-text font-medium">Message</span></label>
                <textarea
                  className="textarea textarea-bordered w-full h-24"
                  placeholder="Décrivez votre idée, problème ou suggestion..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  maxLength={1000}
                  required
                />
                <label className="label"><span className="label-text-alt text-base-content/40">{form.message.length}/1000</span></label>
              </div>

              <div>
                <label className="label"><span className="label-text font-medium">Note (optionnelle)</span></label>
                <div className="flex gap-1">
                  {ratings.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setForm({ ...form, rating: r === form.rating ? null : r })}
                      className={`btn btn-sm ${r <= (form.rating || 0) ? "btn-warning" : "btn-ghost border"}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {mutation.isError && (
                <div className="alert alert-error text-sm py-2">
                  <AlertCircle size={16} /> <span>Une erreur est survenue. Réessayez.</span>
                </div>
              )}

              <button
                type="submit"
                disabled={mutation.isPending || !form.title.trim() || !form.message.trim()}
                className="btn btn-primary w-full gap-2"
              >
                {mutation.isPending ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  <Send size={16} />
                )}
                Envoyer
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
