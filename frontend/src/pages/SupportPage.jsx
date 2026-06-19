import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import axiosInstance from "../lib/axios";
import { useAuthStore } from "../store/authStore";
import { useToastStore } from "../store/toastStore";
import { MessageSquare, Send, Plus, ChevronLeft, ChevronRight, Clock, CheckCircle } from "lucide-react";

const statusBadge = {
  open: "badge-info",
  in_progress: "badge-warning",
  resolved: "badge-success",
  closed: "badge-ghost",
};

const statusLabel = {
  open: "Ouvert",
  in_progress: "En cours",
  resolved: "Résolu",
  closed: "Fermé",
};

export default function SupportPage() {
  const queryClient = useQueryClient();
  const { organization } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({ subject: "", message: "", priority: "normal" });

  const { data, isLoading } = useQuery({
    queryKey: ["support-tickets", page],
    queryFn: async () => {
      const r = await axiosInstance.get(`/support?page=${page}&limit=20`);
      return r.data;
    },
  });

  const createTicket = useMutation({
    mutationFn: (body) => axiosInstance.post("/support", body),
    onSuccess: () => {
      useToastStore.getState().success("Ticket créé avec succès");
      setShowForm(false);
      setForm({ subject: "", message: "", priority: "normal" });
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
    },
    onError: (err) => useToastStore.getState().error(err.response?.data?.error || "Erreur"),
  });

  const tickets = data?.data || [];
  const meta = data?.meta || { total: 0, totalPages: 1 };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.subject.trim() && form.message.trim()) createTicket.mutate(form);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black font-display flex items-center gap-2">
            <MessageSquare className="text-primary" size={26} /> Support
          </h1>
          <p className="text-base-content/60 text-sm mt-1">Besoin d'aide ? Créez un ticket et notre équipe vous répondra.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary gap-2">
          {showForm ? "Fermer" : <><Plus size={18} /> Nouveau ticket</>}
        </button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="card bg-base-100 shadow-sm border border-primary/20 overflow-hidden">
          <div className="card-body">
            <h3 className="font-bold text-lg mb-4">Créer un ticket</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Sujet</span></label>
                <input type="text" className="input input-bordered" placeholder="Ex: Problème de connexion"
                  value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Message</span></label>
                <textarea className="textarea textarea-bordered h-32" placeholder="Décrivez votre problème en détail..."
                  value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Priorité</span></label>
                <select className="select select-bordered" value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                  <option value="normal">Normale</option>
                  <option value="high">Haute</option>
                  {organization?.plan === "enterprise" && <option value="urgent">Urgente</option>}
                </select>
              </div>
              <button type="submit" className="btn btn-primary gap-2" disabled={createTicket.isPending}>
                {createTicket.isPending ? <span className="loading loading-spinner loading-sm" /> : <Send size={16} />}
                Envoyer
              </button>
            </form>
          </div>
        </motion.div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16"><span className="loading loading-spinner loading-lg text-primary" /></div>
      ) : tickets.length > 0 ? (
        <div className="space-y-3">
          {tickets.map((ticket, idx) => (
            <motion.div key={ticket._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
              className="card bg-base-100 shadow-sm border border-base-content/5">
              <div className="card-body p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-base truncate">{ticket.subject}</h3>
                      <span className={`badge badge-sm ${statusBadge[ticket.status]}`}>{statusLabel[ticket.status]}</span>
                      {ticket.isPriority && <span className="badge badge-error badge-sm">Prioritaire</span>}
                    </div>
                    <p className="text-sm text-base-content/70 whitespace-pre-wrap line-clamp-3">{ticket.message}</p>
                    {ticket.adminNote && (
                      <div className="mt-3 p-3 bg-base-200/50 rounded-lg border border-base-content/5">
                        <p className="text-xs font-bold text-base-content/50 uppercase tracking-wider mb-1">Réponse support</p>
                        <p className="text-sm">{ticket.adminNote}</p>
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-base-content/40">{new Date(ticket.createdAt).toLocaleDateString("fr-FR")}</p>
                    {ticket.resolvedAt && (
                      <p className="text-xs text-base-content/40 mt-1">
                        <CheckCircle size={12} className="inline mr-1 text-success" />
                        {new Date(ticket.resolvedAt).toLocaleDateString("fr-FR")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-between py-4">
              <p className="text-sm text-base-content/60">Page {page} sur {meta.totalPages}</p>
              <div className="join">
                <button className="join-item btn btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft size={16} /></button>
                <button className="join-item btn btn-sm" disabled={page >= meta.totalPages} onClick={() => setPage(page + 1)}><ChevronRight size={16} /></button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="card bg-base-100 shadow-sm border border-base-content/5 p-16 text-center">
          <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-lg font-bold text-base-content/60">Aucun ticket</p>
          <p className="text-sm text-base-content/40 mt-1">Créez un ticket pour contacter le support.</p>
          <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm mt-4">Créer un ticket</button>
        </div>
      )}
    </div>
  );
}
