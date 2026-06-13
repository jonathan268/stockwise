import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import {
  User, Building2, Shield, Palette, Save, Sun, Moon, CreditCard, AlertCircle
} from "lucide-react";
import SubscriptionModal from "../components/SubscriptionModal";
import axiosInstance from "../lib/axios";
import { useToastStore } from "../store/toastStore";

const tabs = [
  { id: "profile", label: "Profil", icon: User },
  { id: "company", label: "Entreprise", icon: Building2 },
  { id: "security", label: "Sécurité", icon: Shield },
  { id: "appearance", label: "Apparence", icon: Palette },
];

export default function SettingsPage() {
  const { user, organization, setAuth, updateOrganization } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [activeTab, setActiveTab] = useState("profile");
  const [saved, setSaved] = useState(false);
  const [isSubsModalOpen, setIsSubsModalOpen] = useState(false);

  // States
  const [profileForm, setProfileForm] = useState({ firstName: "", lastName: "" });
  const [orgForm, setOrgForm] = useState({ name: "", currency: "XAF", timezone: "Africa/Douala", lowStockAlertEmail: false });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingOrg, setIsSavingOrg] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Sync initial state
  useEffect(() => {
    if (user) {
      setProfileForm({ firstName: user.firstName || "", lastName: user.lastName || "" });
    }
    if (organization) {
      setOrgForm({
        name: organization.name || "",
        currency: organization.settings?.currency || "XAF",
        timezone: organization.settings?.timezone || "Africa/Douala",
        lowStockAlertEmail: organization.settings?.lowStockAlertEmail || false,
      });
    }
  }, [user, organization]);

  const getDaysRemaining = () => {
    const targetDate = organization?.trialEndsAt || organization?.currentPeriodEnd;
    if (!targetDate) return null;
    const remaining = Math.ceil((new Date(targetDate) - new Date()) / (1000 * 60 * 60 * 24));
    return remaining > 0 ? remaining : 0;
  };
  const daysLeft = getDaysRemaining();

  const showSaved = () => {
    useToastStore.getState().success("Modifications sauvegardées");
  };

  const handleSaveProfile = async () => {
    try {
      setIsSavingProfile(true);
      const { data } = await axiosInstance.put("/auth/me", profileForm);
      setAuth({ user: { ...user, ...data.data }, organization, accessToken: useAuthStore.getState().accessToken, refreshToken: useAuthStore.getState().refreshToken });
      showSaved();
    } catch (error) {
      useToastStore.getState().error("Erreur lors de la sauvegarde du profil");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveOrg = async () => {
    try {
      setIsSavingOrg(true);
      const { data } = await axiosInstance.put("/auth/organization", {
        name: orgForm.name,
        currency: orgForm.currency,
        timezone: orgForm.timezone,
        lowStockAlertEmail: orgForm.lowStockAlertEmail,
      });
      updateOrganization({ ...organization, ...data.data });
      showSaved();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSavingOrg(false);
    }
  };

  const handleSavePassword = async () => {
    setPasswordError("");
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return setPasswordError("Les mots de passe ne correspondent pas");
    }
    try {
      setIsSavingPassword(true);
      await axiosInstance.put("/auth/password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      showSaved();
    } catch (error) {
      setPasswordError(error.response?.data?.message || error.response?.data?.error || "Erreur lors de la mise à jour");
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black font-display">Paramètres</h1>
        <p className="text-base-content/60 text-sm mt-1">Gérez votre profil et les préférences.</p>
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

        <div className="flex-1 card bg-base-100 shadow-sm border border-base-content/5">
          <div className="card-body">
            
            {activeTab === "profile" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold font-display">Informations personnelles</h2>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-primary text-primary-content rounded-2xl flex items-center justify-center font-bold text-2xl">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-lg">{user?.firstName} {user?.lastName}</p>
                    <p className="text-sm text-base-content/50 capitalize">{user?.role}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label"><span className="label-text font-medium">Prénom</span></label>
                    <input type="text" className="input input-bordered w-full" value={profileForm.firstName} onChange={e => setProfileForm({...profileForm, firstName: e.target.value})} />
                  </div>
                  <div>
                    <label className="label"><span className="label-text font-medium">Nom</span></label>
                    <input type="text" className="input input-bordered w-full" value={profileForm.lastName} onChange={e => setProfileForm({...profileForm, lastName: e.target.value})} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label"><span className="label-text font-medium">Email</span></label>
                    <input type="email" className="input input-bordered w-full" value={user?.email || ""} disabled />
                    <label className="label"><span className="label-text-alt text-base-content/40">L'email ne peut pas être modifié</span></label>
                  </div>
                </div>
                <button onClick={handleSaveProfile} disabled={isSavingProfile} className="btn btn-primary gap-2">
                  {isSavingProfile ? <span className="loading loading-spinner loading-sm"/> : <Save size={18} />} Enregistrer
                </button>
              </div>
            )}

            {activeTab === "company" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold font-display">Informations de l'entreprise</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="label"><span className="label-text font-medium">Nom de l'organisation</span></label>
                    <input type="text" className="input input-bordered w-full" value={orgForm.name} onChange={e => setOrgForm({...orgForm, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="label"><span className="label-text font-medium">Devise</span></label>
                    <select className="select select-bordered w-full" value={orgForm.currency} onChange={e => setOrgForm({...orgForm, currency: e.target.value})}>
                      <option value="XAF">XAF (Franc CFA)</option>
                      <option value="EUR">EUR (Euro)</option>
                      <option value="USD">USD (Dollar)</option>
                    </select>
                  </div>
                  <div>
                    <label className="label"><span className="label-text font-medium">Fuseau horaire</span></label>
                    <select className="select select-bordered w-full" value={orgForm.timezone} onChange={e => setOrgForm({...orgForm, timezone: e.target.value})}>
                      <option value="Africa/Douala">Africa/Douala</option>
                      <option value="Europe/Paris">Europe/Paris</option>
                      <option value="America/New_York">America/New_York</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label"><span className="label-text font-medium text-base-content/60">Abonnement & Facturation</span></label>
                    <div className="card bg-base-200/50 border border-base-content/5 p-4 rounded-xl">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${organization?.plan === "starter" ? "bg-base-300 text-base-content" : "bg-primary/10 text-primary border border-primary/20"}`}>
                            {organization?.plan?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold flex items-center gap-2">
                              Plan {organization?.plan || "Starter"}
                              {organization?.isTrialActive && <span className="badge badge-warning badge-xs">ESSAI</span>}
                            </p>
                            {daysLeft !== null && (
                              <p className="text-xs text-base-content/50">{daysLeft} jours restants avant expiration</p>
                            )}
                          </div>
                        </div>
                        <button onClick={() => setIsSubsModalOpen(true)} className="btn btn-primary btn-sm gap-2">
                          <CreditCard size={14} /> {organization?.plan === "starter" ? "S'abonner maintenant" : "Gérer l'abonnement"}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label cursor-pointer justify-start gap-3">
                      <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        checked={orgForm.lowStockAlertEmail}
                        onChange={(e) => setOrgForm({...orgForm, lowStockAlertEmail: e.target.checked})}
                      />
                      <span className="label-text font-medium">Recevoir les alertes de stock par email</span>
                    </label>
                  </div>
                </div>
                <button onClick={handleSaveOrg} disabled={isSavingOrg} className="btn btn-primary gap-2">
                  {isSavingOrg ? <span className="loading loading-spinner loading-sm"/> : <Save size={18} />} Enregistrer
                </button>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold font-display">Sécurité du compte</h2>
                {passwordError && (
                  <div className="alert alert-error text-sm py-2">
                    <AlertCircle size={16} /> <span>{passwordError}</span>
                  </div>
                )}
                <div className="space-y-4">
                  <div>
                    <label className="label"><span className="label-text font-medium">Mot de passe actuel</span></label>
                    <input type="password" value={passwordForm.currentPassword} onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})} className="input input-bordered w-full" placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="label"><span className="label-text font-medium">Nouveau mot de passe</span></label>
                    <input type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} className="input input-bordered w-full" placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="label"><span className="label-text font-medium">Confirmer le mot de passe</span></label>
                    <input type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} className="input input-bordered w-full" placeholder="••••••••" />
                  </div>
                </div>
                <button onClick={handleSavePassword} disabled={isSavingPassword || !passwordForm.currentPassword || !passwordForm.newPassword} className="btn btn-primary gap-2">
                  {isSavingPassword ? <span className="loading loading-spinner loading-sm"/> : <Save size={18} />} Mettre à jour
                </button>
              </div>
            )}

            {activeTab === "appearance" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold font-display">Apparence</h2>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => { if (theme === "dark") toggleTheme(); }} className={`card p-6 border-2 transition-all ${theme === "light" ? "border-primary bg-primary/5" : "border-base-content/10 hover:border-base-content/20"}`}>
                    <Sun size={32} className="mx-auto mb-3 text-warning" />
                    <p className="font-bold">Mode Clair</p>
                    {theme === "light" && <span className="badge badge-primary badge-sm mt-2 mx-auto">Actif</span>}
                  </button>
                  <button onClick={() => { if (theme === "light") toggleTheme(); }} className={`card p-6 border-2 transition-all ${theme === "dark" ? "border-primary bg-primary/5" : "border-base-content/10 hover:border-base-content/20"}`}>
                    <Moon size={32} className="mx-auto mb-3 text-info" />
                    <p className="font-bold">Mode Sombre</p>
                    {theme === "dark" && <span className="badge badge-primary badge-sm mt-2 mx-auto">Actif</span>}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
      <SubscriptionModal isOpen={isSubsModalOpen} onClose={() => setIsSubsModalOpen(false)} />
    </div>
  );
}
