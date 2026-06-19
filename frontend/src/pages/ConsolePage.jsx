import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import { useAuthStore } from "../store/authStore";
import {
  Users, Building2, BarChart3, MessageSquare, LifeBuoy,
  ToggleLeft, ToggleRight, TrendingUp, DollarSign, FileText,
  CreditCard, UserCheck, CalendarDays,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { Navigate, useSearchParams } from "react-router-dom";

const COLORS = ["#2563eb", "#16a34a", "#eab308", "#dc2626", "#8b5cf6", "#ec4899"];

const planLabels = { starter: "Starter", pro: "Pro", enterprise: "Entreprise" };
const statusLabels = {
  trial: "Essai", active: "Actif", past_due: "Impayé",
  cancelled: "Annulé", expired: "Expiré",
};

export default function ConsolePage() {
  const { isSuperAdmin } = useAuthStore();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";
  const [userPage, setUserPage] = useState(1);
  const [orgPage, setOrgPage] = useState(1);
  const [subPage, setSubPage] = useState(1);

  // Reset pagination on tab change
  useEffect(() => {
    setUserPage(1);
    setOrgPage(1);
    setSubPage(1);
  }, [activeTab]);

  if (!isSuperAdmin()) return <Navigate to="/dashboard" replace />;

  const { data: dashData } = useQuery({
    queryKey: ["console-dashboard"],
    queryFn: async () => { const r = await axiosInstance.get("/console/dashboard"); return r.data.data; },
    enabled: activeTab === "overview",
    refetchInterval: 30000,
  });

  const { data: subsData } = useQuery({
    queryKey: ["console-subscriptions", subPage],
    queryFn: async () => { const r = await axiosInstance.get(`/console/subscriptions?page=${subPage}&limit=15`); return r.data; },
    enabled: activeTab === "subscriptions",
  });

  const { data: usersData } = useQuery({
    queryKey: ["console-users", userPage],
    queryFn: async () => { const r = await axiosInstance.get(`/console/users?page=${userPage}`); return r.data; },
    enabled: activeTab === "users",
  });

  const { data: orgsData } = useQuery({
    queryKey: ["console-orgs", orgPage],
    queryFn: async () => { const r = await axiosInstance.get(`/console/organizations?page=${orgPage}`); return r.data; },
    enabled: activeTab === "organizations",
  });

  const { data: feedbackData } = useQuery({
    queryKey: ["console-feedback"],
    queryFn: async () => { const r = await axiosInstance.get("/console/feedback?limit=50"); return r.data; },
    enabled: activeTab === "feedback",
  });

  const { data: supportData, refetch: refetchSupport } = useQuery({
    queryKey: ["console-support"],
    queryFn: async () => { const r = await axiosInstance.get("/console/support?limit=50"); return r.data; },
    enabled: activeTab === "support",
  });

  const { data: logsData } = useQuery({
    queryKey: ["console-logs"],
    queryFn: async () => { const r = await axiosInstance.get("/console/logs"); return r.data.data; },
    enabled: activeTab === "logs",
    refetchInterval: 10000,
  });

  const toggleUser = useMutation({
    mutationFn: (id) => axiosInstance.patch(`/console/users/${id}/toggle-status`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["console-users"] }),
  });

  const toggleOrg = useMutation({
    mutationFn: (id) => axiosInstance.patch(`/console/organizations/${id}/toggle-status`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["console-orgs"] }),
  });

  const updateFeedback = useMutation({
    mutationFn: ({ id, data }) => axiosInstance.patch(`/console/feedback/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["console-feedback"] }),
  });

  const updateTicket = useMutation({
    mutationFn: ({ id, data }) => axiosInstance.patch(`/console/support/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["console-support"] }),
  });

  const fmt = (n) => n == null ? "0" : new Intl.NumberFormat("fr-FR").format(n);
  const fmtMoney = (n) => n == null ? "0" : new Intl.NumberFormat("fr-FR").format(Math.round(n));

  const d = dashData || {};

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-black font-display">Console Super Admin</h1>
        <p className="text-base-content/60 text-sm mt-1">Supervision globale de la plateforme StockWise.</p>
      </div>

      <div className="space-y-4">
          {/* ═══════════════ OVERVIEW ═══════════════ */}
          {activeTab === "overview" && (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="stat bg-base-100 rounded-2xl border border-base-content/5 shadow-sm">
                  <div className="stat-figure text-primary"><Users size={24} /></div>
                  <div className="stat-title text-xs">Utilisateurs</div>
                  <div className="stat-value text-2xl">{fmt(d.totalUsers)}</div>
                  <div className="stat-desc text-xs">+{fmt(d.newUsersThisMonth)} ce mois</div>
                </div>
                <div className="stat bg-base-100 rounded-2xl border border-base-content/5 shadow-sm">
                  <div className="stat-figure text-secondary"><Building2 size={24} /></div>
                  <div className="stat-title text-xs">Organisations</div>
                  <div className="stat-value text-2xl">{fmt(d.totalOrgs)}</div>
                  <div className="stat-desc text-xs">{fmt(d.activeOrgs)} actives</div>
                </div>
                <div className="stat bg-base-100 rounded-2xl border border-base-content/5 shadow-sm">
                  <div className="stat-figure text-accent"><DollarSign size={24} /></div>
                  <div className="stat-title text-xs">Revenu abonnements (mois)</div>
                  <div className="stat-value text-xl">{fmtMoney(d.paidRevenueThisMonth)}</div>
                  <div className="stat-desc text-xs">XAF</div>
                </div>
                <div className="stat bg-base-100 rounded-2xl border border-base-content/5 shadow-sm">
                  <div className="stat-figure text-info"><TrendingUp size={24} /></div>
                  <div className="stat-title text-xs">MRR</div>
                  <div className="stat-value text-xl">{fmtMoney(d.mrr)}</div>
                  <div className="stat-desc text-xs">XAF / mois</div>
                </div>
              </div>

              {/* Secondary KPIs */}
              <div className="grid grid-cols-2 lg:grid-cols-2 gap-4">
                <div className="stat bg-base-100 rounded-2xl border border-base-content/5 shadow-sm">
                  <div className="stat-figure text-success"><UserCheck size={20} /></div>
                  <div className="stat-title text-xs">Conversion → Payant</div>
                  <div className="stat-value text-xl">{d.conversionRate ?? "—"}%</div>
                </div>
                <div className="stat bg-base-100 rounded-2xl border border-base-content/5 shadow-sm">
                  <div className="stat-figure text-primary"><CalendarDays size={20} /></div>
                  <div className="stat-title text-xs">Délai moyen avant paiement</div>
                  <div className="stat-value text-xl">{d.avgDaysToPaid ?? "—"}</div>
                  <div className="stat-desc text-xs">jours</div>
                </div>
              </div>

              {/* Charts row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Subscription Revenue Trend */}
                <div className="card bg-base-100 border border-base-content/5 shadow-sm">
                  <div className="card-body">
                    <h3 className="font-bold text-sm flex items-center gap-2">
                      <TrendingUp size={16} className="text-primary" /> Évolution des revenus abonnements
                    </h3>
                    {d.subscriptionTrend?.length > 0 ? (
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={d.subscriptionTrend}>
                          <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--bc)/0.1)" />
                          <XAxis dataKey="_id" tick={{ fontSize: 10 }} stroke="oklch(var(--bc)/0.4)" />
                          <YAxis tick={{ fontSize: 10 }} stroke="oklch(var(--bc)/0.4)" />
                          <Tooltip />
                          <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[220px] flex items-center justify-center text-base-content/40">Pas encore de données</div>
                    )}
                  </div>
                </div>

                {/* Plans Breakdown */}
                <div className="card bg-base-100 border border-base-content/5 shadow-sm">
                  <div className="card-body">
                    <h3 className="font-bold text-sm flex items-center gap-2">
                      <DollarSign size={16} className="text-primary" /> Répartition des plans
                    </h3>
                    {d.plansBreakdown?.length > 0 ? (
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie data={d.plansBreakdown} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={80}
                            label={({ _id, count }) => `${planLabels[_id] || _id} (${count})`}>
                            {d.plansBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[220px] flex items-center justify-center text-base-content/40">Pas de données</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Status breakdown + Users by role */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="card bg-base-100 border border-base-content/5 shadow-sm">
                  <div className="card-body">
                    <h3 className="font-bold text-sm flex items-center gap-2">
                      <Activity size={16} className="text-primary" /> Statuts des abonnements
                    </h3>
                    {d.statusBreakdown?.length > 0 ? (
                      <div className="space-y-2 mt-2">
                        {d.statusBreakdown.map((s) => (
                          <div key={s._id} className="flex items-center justify-between p-2 bg-base-200/50 rounded-lg">
                            <span className="text-sm font-medium">{statusLabels[s._id] || s._id}</span>
                            <span className="font-bold">{s.count}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-[120px] flex items-center justify-center text-base-content/40">Pas de données</div>
                    )}
                  </div>
                </div>

                <div className="card bg-base-100 border border-base-content/5 shadow-sm">
                  <div className="card-body">
                    <h3 className="font-bold text-sm flex items-center gap-2">
                      <Users size={16} className="text-primary" /> Répartition des rôles utilisateurs
                    </h3>
                    {d.usersByRole?.length > 0 ? (
                      <div className="space-y-2 mt-2">
                        {d.usersByRole.map((r) => (
                          <div key={r._id} className="flex items-center justify-between p-2 bg-base-200/50 rounded-lg">
                            <span className="text-sm font-medium capitalize">{r._id}</span>
                            <span className="font-bold">{r.count}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-[120px] flex items-center justify-center text-base-content/40">Pas de données</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent subscriptions */}
              {d.recentSubscriptions?.length > 0 && (
                <div className="card bg-base-100 border border-base-content/5 shadow-sm">
                  <div className="card-body">
                    <h3 className="font-bold text-sm flex items-center gap-2 mb-3">
                      <CreditCard size={16} className="text-primary" /> Derniers abonnements
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Organisation</th>
                            <th>Propriétaire</th>
                            <th>Plan</th>
                            <th>Statut</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {d.recentSubscriptions.map((sub) => (
                            <tr key={sub._id}>
                              <td className="font-medium">{sub.organizationId?.name || "—"}</td>
                              <td className="text-sm">{sub.organizationId?.owner?.firstName} {sub.organizationId?.owner?.lastName}</td>
                              <td><span className="badge badge-sm capitalize">{planLabels[sub.plan] || sub.plan}</span></td>
                              <td><span className={`badge badge-sm ${sub.status === "active" ? "badge-success" : sub.status === "trial" ? "badge-warning" : "badge-error"}`}>{statusLabels[sub.status] || sub.status}</span></td>
                              <td className="text-sm text-base-content/50">{new Date(sub.createdAt).toLocaleDateString("fr-FR")}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ═══════════════ SUBSCRIPTIONS ═══════════════ */}
          {activeTab === "subscriptions" && (
            <div className="card bg-base-100 border border-base-content/5 shadow-sm">
              <div className="card-body p-0 overflow-x-auto">
                <table className="table">
                  <thead><tr>
                    <th>Organisation</th><th>Propriétaire</th><th>Plan</th><th>Statut</th><th>Factures</th><th>Total payé</th><th>Date</th>
                  </tr></thead>
                  <tbody>
                    {subsData?.data?.map((sub) => {
                      const paidInvoices = sub.invoices?.filter((inv) => inv.status === "complete") || [];
                      const totalPaid = paidInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
                      return (
                        <tr key={sub._id}>
                          <td className="font-medium">{sub.organization?.name || "—"}</td>
                          <td className="text-sm">{sub.organization?.owner?.firstName} {sub.organization?.owner?.lastName}<br /><span className="text-xs text-base-content/40">{sub.organization?.owner?.email}</span></td>
                          <td><span className="badge badge-sm capitalize">{planLabels[sub.plan] || sub.plan}</span></td>
                          <td><span className={`badge badge-sm ${sub.status === "active" ? "badge-success" : sub.status === "trial" ? "badge-warning" : "badge-error"}`}>{statusLabels[sub.status] || sub.status}</span></td>
                          <td className="text-sm">{paidInvoices.length}</td>
                          <td className="text-sm font-medium">{fmtMoney(totalPaid)} XAF</td>
                          <td className="text-sm text-base-content/50">{new Date(sub.createdAt).toLocaleDateString("fr-FR")}</td>
                        </tr>
                      );
                    })}
                    {(!subsData?.data || subsData.data.length === 0) && (
                      <tr><td colSpan={7} className="text-center py-8 text-base-content/40">Aucun abonnement</td></tr>
                    )}
                  </tbody>
                </table>
                {subsData?.meta && (
                  <div className="flex justify-center p-4 gap-2">
                    <button disabled={subPage <= 1} onClick={() => setSubPage(p => p - 1)} className="btn btn-ghost btn-sm">Précédent</button>
                    <span className="btn btn-ghost btn-sm disabled">Page {subsData.meta.page}/{subsData.meta.totalPages}</span>
                    <button disabled={subPage >= subsData.meta.totalPages} onClick={() => setSubPage(p => p + 1)} className="btn btn-ghost btn-sm">Suivant</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════ USERS ═══════════════ */}
          {activeTab === "users" && (
            <div className="card bg-base-100 border border-base-content/5 shadow-sm">
              <div className="card-body p-0 overflow-x-auto">
                <table className="table">
                  <thead><tr>
                    <th>Nom</th><th>Email</th><th>Rôle</th><th>Statut</th><th>Organisation</th><th className="text-right">Actions</th>
                  </tr></thead>
                  <tbody>
                    {usersData?.data?.map((u) => (
                      <tr key={u._id}>
                        <td className="font-medium">{u.firstName} {u.lastName}</td>
                        <td className="text-sm text-base-content/60">{u.email}</td>
                        <td><span className="badge badge-sm capitalize">{u.role}</span></td>
                        <td><span className={`badge badge-sm ${u.isActive ? "badge-success" : "badge-error"}`}>{u.isActive ? "Actif" : "Inactif"}</span></td>
                        <td className="text-sm">{u.organizationId?.name || "—"}</td>
                        <td className="text-right">
                          <button onClick={() => toggleUser.mutate(u._id)} className="btn btn-ghost btn-xs gap-1">
                            {u.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                            {u.isActive ? "Désactiver" : "Activer"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {usersData?.meta && (
                  <div className="flex justify-center p-4 gap-2">
                    <button disabled={userPage <= 1} onClick={() => setUserPage(p => p - 1)} className="btn btn-ghost btn-sm">Précédent</button>
                    <span className="btn btn-ghost btn-sm disabled">Page {usersData.meta.page}/{usersData.meta.totalPages}</span>
                    <button disabled={userPage >= usersData.meta.totalPages} onClick={() => setUserPage(p => p + 1)} className="btn btn-ghost btn-sm">Suivant</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════ ORGANIZATIONS ═══════════════ */}
          {activeTab === "organizations" && (
            <div className="card bg-base-100 border border-base-content/5 shadow-sm">
              <div className="card-body p-0 overflow-x-auto">
                <table className="table">
                  <thead><tr>
                    <th>Organisation</th><th>Propriétaire</th><th>Plan</th><th>Statut</th><th>Date</th><th className="text-right">Actions</th>
                  </tr></thead>
                  <tbody>
                    {orgsData?.data?.map((org) => (
                      <tr key={org._id}>
                        <td className="font-medium">{org.name}</td>
                        <td className="text-sm">{org.owner?.firstName} {org.owner?.lastName}</td>
                        <td><span className="badge badge-sm capitalize">{org.plan}</span></td>
                        <td><span className={`badge badge-sm ${org.isActive ? "badge-success" : "badge-error"}`}>{org.isActive ? "Active" : "Inactive"}</span></td>
                        <td className="text-sm text-base-content/40">{new Date(org.createdAt).toLocaleDateString()}</td>
                        <td className="text-right">
                          <button onClick={() => toggleOrg.mutate(org._id)} className="btn btn-ghost btn-xs gap-1">
                            {org.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                            {org.isActive ? "Désactiver" : "Activer"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {orgsData?.meta && (
                  <div className="flex justify-center p-4 gap-2">
                    <button disabled={orgPage <= 1} onClick={() => setOrgPage(p => p - 1)} className="btn btn-ghost btn-sm">Précédent</button>
                    <span className="btn btn-ghost btn-sm disabled">Page {orgsData.meta.page}/{orgsData.meta.totalPages}</span>
                    <button disabled={orgPage >= orgsData.meta.totalPages} onClick={() => setOrgPage(p => p + 1)} className="btn btn-ghost btn-sm">Suivant</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════ FEEDBACK ═══════════════ */}
          {activeTab === "feedback" && (
            <div className="card bg-base-100 border border-base-content/5 shadow-sm">
              <div className="card-body p-0 overflow-x-auto">
                <table className="table">
                  <thead><tr>
                    <th>Titre</th><th>Type</th><th>Statut</th><th>Priorité</th><th>Note</th><th>Date</th><th className="text-right">Actions</th>
                  </tr></thead>
                  <tbody>
                    {feedbackData?.data?.map((f) => (
                      <tr key={f._id}>
                        <td className="font-medium max-w-xs truncate">{f.title}</td>
                        <td><span className="badge badge-sm">{f.type}</span></td>
                        <td>
                          <select className="select select-ghost select-xs"
                            value={f.status}
                            onChange={(e) => updateFeedback.mutate({ id: f._id, data: { status: e.target.value } })}>
                            <option value="new">Nouveau</option>
                            <option value="in_review">En cours</option>
                            <option value="planned">Planifié</option>
                            <option value="done">Fait</option>
                            <option value="rejected">Rejeté</option>
                          </select>
                        </td>
                        <td>
                          <select className="select select-ghost select-xs"
                            value={f.priority}
                            onChange={(e) => updateFeedback.mutate({ id: f._id, data: { priority: e.target.value } })}>
                            <option value="low">Basse</option>
                            <option value="medium">Moyenne</option>
                            <option value="high">Haute</option>
                            <option value="critical">Critique</option>
                          </select>
                        </td>
                        <td className="text-sm">{f.rating ? `${f.rating}/5` : "—"}</td>
                        <td className="text-sm text-base-content/40">{new Date(f.createdAt).toLocaleDateString()}</td>
                        <td className="text-right">
                          <span className={`badge badge-xs ${
                            f.status === "done" ? "badge-success" :
                            f.status === "rejected" ? "badge-error" :
                            f.status === "in_review" ? "badge-info" :
                            f.status === "planned" ? "badge-warning" : ""
                          }`}>{f.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══════════════ SUPPORT ═══════════════ */}
          {activeTab === "support" && (
            <div className="card bg-base-100 border border-base-content/5 shadow-sm">
              <div className="card-body p-0 overflow-x-auto">
                <table className="table">
                  <thead><tr>
                    <th>Sujet</th><th>Organisation</th><th>Statut</th><th>Priorité</th><th>Date</th><th className="text-right">Actions</th>
                  </tr></thead>
                  <tbody>
                    {supportData?.data?.map((t) => {
                      const orgName = t.organizationId?.name || "—";
                      return (
                        <tr key={t._id} className={t.isPriority ? "bg-error/5" : ""}>
                          <td className="font-medium max-w-xs truncate">{t.subject}</td>
                          <td className="text-sm">{orgName}<br /><span className="text-xs text-base-content/40">{t.userId?.email || ""}</span></td>
                          <td>
                            <select className="select select-ghost select-xs"
                              value={t.status}
                              onChange={(e) => updateTicket.mutate({ id: t._id, data: { status: e.target.value } })}>
                              <option value="open">Ouvert</option>
                              <option value="in_progress">En cours</option>
                              <option value="resolved">Résolu</option>
                              <option value="closed">Fermé</option>
                            </select>
                          </td>
                          <td>
                            <span className={`badge badge-sm ${t.priority === "urgent" ? "badge-error" : t.priority === "high" ? "badge-warning" : "badge-ghost"}`}>
                              {t.priority === "urgent" ? "Urgente" : t.priority === "high" ? "Haute" : "Normale"}
                            </span>
                          </td>
                          <td className="text-sm text-base-content/40">{new Date(t.createdAt).toLocaleDateString()}</td>
                          <td className="text-right">
                            {t.adminNote ? (
                              <span className="text-xs text-base-content/40">Répondu</span>
                            ) : (
                              <button className="btn btn-ghost btn-xs">Répondre</button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {(!supportData?.data || supportData.data.length === 0) && (
                      <tr><td colSpan={6} className="text-center py-8 text-base-content/40">Aucun ticket</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══════════════ LOGS ═══════════════ */}
          {activeTab === "logs" && (
            <div className="card bg-base-100 border border-base-content/5 shadow-sm">
              <div className="card-body p-0 overflow-x-auto">
                <div className="p-4 text-sm font-mono max-h-[70vh] overflow-y-auto">
                  {logsData?.length > 0 ? logsData.map((entry, i) => (
                    <div key={i} className={`py-1 border-b border-base-content/5 last:border-0 ${
                      entry.level === "error" ? "text-error" :
                      entry.level === "warn" ? "text-warning" : "text-base-content/70"
                    }`}>
                      <span className="text-[10px] text-base-content/30">{entry.timestamp ? new Date(entry.timestamp).toLocaleString() : ""}</span>{" "}
                      <span className="font-bold text-[10px] uppercase">{entry.level}</span>{" "}
                      <span>{entry.message}</span>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-base-content/40">
                      <FileText size={32} className="mx-auto mb-2 opacity-50" />
                      <p>Aucun log disponible</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
