import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import { useAuthStore } from "../store/authStore";
import { useToastStore } from "../store/toastStore";
import {
  UserPlus, Users, Mail, Shield, UserCog, X,
  ToggleLeft, ToggleRight, AlertCircle, CheckCircle, Clock,
  Send, Trash2,
} from "lucide-react";

const roleLabels = {
  owner: "Propriétaire",
  admin: "Administrateur",
  staff: "Employé",
};

export default function TeamPage() {
  const { user, organization } = useAuthStore();
  const queryClient = useQueryClient();
  const isOwner = user?.role === "owner";
  const isAdmin = user?.role === "admin";

  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("staff");
  const [editingRole, setEditingRole] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["team-members"],
    queryFn: async () => {
      const r = await axiosInstance.get("/organization/members");
      return r.data.data;
    },
  });

  const inviteMutation = useMutation({
    mutationFn: (body) => axiosInstance.post("/organization/members/invite", body),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      setShowInviteForm(false);
      setInviteEmail("");
      useToastStore.getState().success(res.data.message);
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }) => axiosInstance.patch(`/organization/members/${userId}/role`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      setEditingRole(null);
      useToastStore.getState().success("Rôle mis à jour.");
    },
  });

  const removeMutation = useMutation({
    mutationFn: (userId) => axiosInstance.delete(`/organization/members/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      useToastStore.getState().success("Membre retiré.");
    },
  });

  const cancelInviteMutation = useMutation({
    mutationFn: (inviteId) => axiosInstance.delete(`/organization/members/invite/${inviteId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      useToastStore.getState().success("Invitation annulée.");
    },
  });

  const handleInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    inviteMutation.mutate({ email: inviteEmail, role: inviteRole });
  };

  const members = data?.members || [];
  const pendingInvites = data?.pendingInvites || [];
  const usage = data?.usage || { current: 0, max: 3 };
  const usagePercent = usage.max === Infinity ? 0 : Math.round((usage.current / usage.max) * 100);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black font-display">Équipe</h1>
          <p className="text-base-content/60 text-sm mt-1">Gérez les membres de votre organisation.</p>
        </div>
        {isOwner && (
          <button
            onClick={() => setShowInviteForm(!showInviteForm)}
            className="btn btn-primary gap-2"
          >
            <UserPlus size={18} /> Inviter un membre
          </button>
        )}
      </div>

      {/* Usage */}
      <div className="card bg-base-100 border border-base-content/5 shadow-sm">
        <div className="card-body">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Utilisation de l'équipe</span>
            <span className="text-sm text-base-content/60">
              {usage.current} / {usage.max === Infinity ? "Illimité" : usage.max} membres
            </span>
          </div>
          {usage.max !== Infinity && (
            <div className="w-full bg-base-content/10 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all ${
                  usagePercent >= 90 ? "bg-error" : usagePercent >= 70 ? "bg-warning" : "bg-primary"
                }`}
                style={{ width: `${Math.min(usagePercent, 100)}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Invite form */}
      {showInviteForm && (
        <div className="card bg-base-100 border border-primary/30 shadow-sm">
          <div className="card-body">
            <h3 className="font-bold flex items-center gap-2">
              <Send size={16} className="text-primary" /> Inviter un membre
            </h3>
            <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3 mt-2">
              <div className="flex-1">
                <input
                  type="email"
                  placeholder="email@exemple.com"
                  className="input input-bordered w-full"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                />
              </div>
              <select
                className="select select-bordered sm:w-44"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
              >
                <option value="staff">Employé</option>
                <option value="admin">Administrateur</option>
              </select>
              <button
                type="submit"
                disabled={inviteMutation.isPending}
                className="btn btn-primary gap-2"
              >
                {inviteMutation.isPending ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  <Send size={16} />
                )}
                Envoyer
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Pending invites */}
      {pendingInvites.length > 0 && (
        <div className="card bg-base-100 border border-base-content/5 shadow-sm">
          <div className="card-body">
            <h3 className="font-bold flex items-center gap-2 text-sm mb-3">
              <Clock size={16} className="text-warning" /> Invitations en attente ({pendingInvites.length})
            </h3>
            <div className="space-y-2">
              {pendingInvites.map((inv) => (
                <div key={inv._id} className="flex items-center justify-between p-3 bg-base-200/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-base-content/40" />
                    <span className="text-sm">{inv.email}</span>
                    <span className="badge badge-sm">{roleLabels[inv.role] || inv.role}</span>
                  </div>
                  <button
                    onClick={() => cancelInviteMutation.mutate(inv._id)}
                    className="btn btn-ghost btn-xs text-error gap-1"
                  >
                    <X size={14} /> Annuler
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Members list */}
      <div className="card bg-base-100 border border-base-content/5 shadow-sm">
        <div className="card-body p-0 overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Membre</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th>Dernière connexion</th>
                {(isOwner || isAdmin) && <th className="text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-base-content/40">
                    <span className="loading loading-spinner loading-sm" />
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-base-content/40">
                    <Users size={32} className="mx-auto mb-2 opacity-50" />
                    <p>Aucun membre</p>
                  </td>
                </tr>
              ) : (
                members.map((m) => (
                  <tr key={m._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary text-primary-content rounded-xl flex items-center justify-center font-bold text-sm">
                          {m.firstName?.charAt(0)}{m.lastName?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{m.firstName} {m.lastName}</p>
                          <p className="text-sm text-base-content/50">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      {editingRole === m._id ? (
                        <div className="flex items-center gap-2">
                          <select
                            className="select select-bordered select-xs"
                            defaultValue={m.role}
                            onChange={(e) =>
                              updateRoleMutation.mutate({ userId: m._id, role: e.target.value })
                            }
                          >
                            <option value="admin">Administrateur</option>
                            <option value="staff">Employé</option>
                          </select>
                          <button
                            onClick={() => setEditingRole(null)}
                            className="btn btn-ghost btn-xs"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <span className="badge badge-sm capitalize">
                          {roleLabels[m.role] || m.role}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`badge badge-sm ${m.isActive ? "badge-success" : "badge-error"}`}>
                        {m.isActive ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td className="text-sm text-base-content/50">
                      {m.lastLogin ? new Date(m.lastLogin).toLocaleDateString("fr-FR") : "Jamais"}
                    </td>
                    {(isOwner || isAdmin) && (
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {isOwner && m.role !== "owner" && (
                            <>
                              <button
                                onClick={() => setEditingRole(m._id)}
                                className="btn btn-ghost btn-xs gap-1"
                                title="Changer le rôle"
                              >
                                <UserCog size={14} /> Rôle
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Retirer ${m.firstName} ${m.lastName} de l'organisation ?`)) {
                                    removeMutation.mutate(m._id);
                                  }
                                }}
                                className="btn btn-ghost btn-xs text-error gap-1"
                                title="Retirer"
                              >
                                <Trash2 size={14} /> Retirer
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
