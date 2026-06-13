import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../lib/axios";
import { useAuthStore } from "../store/authStore";
import {
  Users, Building2, Package, Bell, BarChart3, Search, Eye, ToggleLeft, ToggleRight, MessageSquare
} from "lucide-react";
import { Navigate } from "react-router-dom";

const tabs = [
  { id: "overview", label: "Vue d'ensemble", icon: BarChart3 },
  { id: "users", label: "Utilisateurs", icon: Users },
  { id: "organizations", label: "Organisations", icon: Building2 },
  { id: "feedback", label: "Feedbacks", icon: MessageSquare },
];

export default function ConsolePage() {
  const { user, isSuperAdmin } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [userPage, setUserPage] = useState(1);
  const [orgPage, setOrgPage] = useState(1);

  if (!isSuperAdmin()) return <Navigate to="/dashboard" replace />;

  const { data: dashboardData } = useQuery({
    queryKey: ["console-dashboard"],
    queryFn: async () => {
      const res = await axiosInstance.get("/console/dashboard");
      return res.data.data;
    },
    enabled: activeTab === "overview",
  });

  const { data: usersData } = useQuery({
    queryKey: ["console-users", userPage],
    queryFn: async () => {
      const res = await axiosInstance.get(`/console/users?page=${userPage}&limit=20`);
      return res.data;
    },
    enabled: activeTab === "users",
  });

  const { data: orgsData } = useQuery({
    queryKey: ["console-orgs", orgPage],
    queryFn: async () => {
      const res = await axiosInstance.get(`/console/organizations?page=${orgPage}&limit=20`);
      return res.data;
    },
    enabled: activeTab === "organizations",
  });

  const { data: feedbackData } = useQuery({
    queryKey: ["console-feedback"],
    queryFn: async () => {
      const res = await axiosInstance.get("/feedback?limit=50");
      return res.data;
    },
    enabled: activeTab === "feedback",
  });

  const toggleStatus = useMutation({
    mutationFn: async (userId) => {
      const res = await axiosInstance.patch(`/console/users/${userId}/toggle-status`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["console-users"] });
    },
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-black font-display">Console Super Admin</h1>
        <p className="text-base-content/60 text-sm mt-1">Gestion globale de la plateforme.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-56 shrink-0">
          <ul className="menu bg-base-100 rounded-2xl border border-base-content/5 shadow-sm p-2 gap-1">
            {tabs.map((tab) => (
              <li key={tab.id}>
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 font-medium ${activeTab === tab.id ? "active" : ""}`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex-1 space-y-4">
          {activeTab === "overview" && dashboardData && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="stat bg-base-100 rounded-2xl border border-base-content/5 shadow-sm">
                  <div className="stat-figure text-primary"><Users size={24} /></div>
                  <div className="stat-title text-xs">Utilisateurs</div>
                  <div className="stat-value text-2xl">{dashboardData.totalUsers}</div>
                </div>
                <div className="stat bg-base-100 rounded-2xl border border-base-content/5 shadow-sm">
                  <div className="stat-figure text-secondary"><Building2 size={24} /></div>
                  <div className="stat-title text-xs">Organisations</div>
                  <div className="stat-value text-2xl">{dashboardData.totalOrgs}</div>
                </div>
                <div className="stat bg-base-100 rounded-2xl border border-base-content/5 shadow-sm">
                  <div className="stat-figure text-accent"><Package size={24} /></div>
                  <div className="stat-title text-xs">Produits</div>
                  <div className="stat-value text-2xl">{dashboardData.totalProducts}</div>
                </div>
                <div className="stat bg-base-100 rounded-2xl border border-base-content/5 shadow-sm">
                  <div className="stat-figure text-warning"><Bell size={24} /></div>
                  <div className="stat-title text-xs">Alertes</div>
                  <div className="stat-value text-2xl">{dashboardData.totalAlerts}</div>
                </div>
              </div>
              <div className="card bg-base-100 border border-base-content/5 shadow-sm">
                <div className="card-body">
                  <h3 className="font-bold">Répartition des plans</h3>
                  <div className="flex gap-4 mt-2">
                    {dashboardData.plansBreakdown?.map((p) => (
                      <div key={p._id} className="badge badge-lg gap-2">
                        <span className="capitalize">{p._id}</span>
                        <span className="font-bold">{p.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "users" && (
            <div className="card bg-base-100 border border-base-content/5 shadow-sm">
              <div className="card-body p-0 overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Utilisateur</th>
                      <th>Email</th>
                      <th>Rôle</th>
                      <th>Statut</th>
                      <th>Organisation</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersData?.data?.map((u) => (
                      <tr key={u._id}>
                        <td className="font-medium">{u.firstName} {u.lastName}</td>
                        <td className="text-sm text-base-content/60">{u.email}</td>
                        <td><span className="badge badge-sm capitalize">{u.role}</span></td>
                        <td>
                          <span className={`badge badge-sm ${u.isActive ? "badge-success" : "badge-error"}`}>
                            {u.isActive ? "Actif" : "Inactif"}
                          </span>
                        </td>
                        <td className="text-sm">{u.organizationId?.name || "—"}</td>
                        <td className="text-right">
                          <button
                            onClick={() => toggleStatus.mutate(u._id)}
                            className="btn btn-ghost btn-xs gap-1"
                          >
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
                    <button
                      disabled={userPage <= 1}
                      onClick={() => setUserPage((p) => p - 1)}
                      className="btn btn-ghost btn-sm"
                    >Précédent</button>
                    <span className="btn btn-ghost btn-sm disabled">Page {usersData.meta.page} / {usersData.meta.totalPages}</span>
                    <button
                      disabled={userPage >= usersData.meta.totalPages}
                      onClick={() => setUserPage((p) => p + 1)}
                      className="btn btn-ghost btn-sm"
                    >Suivant</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "organizations" && (
            <div className="card bg-base-100 border border-base-content/5 shadow-sm">
              <div className="card-body p-0 overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Organisation</th>
                      <th>Propriétaire</th>
                      <th>Plan</th>
                      <th>Slug</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orgsData?.data?.map((org) => (
                      <tr key={org._id}>
                        <td className="font-medium">{org.name}</td>
                        <td className="text-sm">{org.owner?.firstName} {org.owner?.lastName}</td>
                        <td><span className="badge badge-sm capitalize">{org.plan}</span></td>
                        <td className="text-sm text-base-content/40">{org.slug}</td>
                        <td className="text-sm text-base-content/40">{new Date(org.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {orgsData?.meta && (
                  <div className="flex justify-center p-4 gap-2">
                    <button
                      disabled={orgPage <= 1}
                      onClick={() => setOrgPage((p) => p - 1)}
                      className="btn btn-ghost btn-sm"
                    >Précédent</button>
                    <span className="btn btn-ghost btn-sm disabled">Page {orgsData.meta.page} / {orgsData.meta.totalPages}</span>
                    <button
                      disabled={orgPage >= orgsData.meta.totalPages}
                      onClick={() => setOrgPage((p) => p + 1)}
                      className="btn btn-ghost btn-sm"
                    >Suivant</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "feedback" && (
            <div className="card bg-base-100 border border-base-content/5 shadow-sm">
              <div className="card-body p-0 overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Titre</th>
                      <th>Type</th>
                      <th>Statut</th>
                      <th>Priorité</th>
                      <th>Note</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedbackData?.data?.map((f) => (
                      <tr key={f._id}>
                        <td className="font-medium max-w-xs truncate">{f.title}</td>
                        <td><span className="badge badge-sm">{f.type}</span></td>
                        <td><span className={`badge badge-sm ${f.status === "new" ? "badge-info" : f.status === "planned" ? "badge-warning" : f.status === "done" ? "badge-success" : ""}`}>{f.status}</span></td>
                        <td><span className={`badge badge-sm ${f.priority === "critical" ? "badge-error" : f.priority === "high" ? "badge-warning" : ""}`}>{f.priority}</span></td>
                        <td>{f.rating ? `${f.rating}/5` : "—"}</td>
                        <td className="text-sm text-base-content/40">{new Date(f.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
