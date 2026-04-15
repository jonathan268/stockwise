import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import {
  User, Building2, Shield, Palette, Save, Sun, Moon, Check, CreditCard, Zap
} from "lucide-react";
import SubscriptionModal from "../components/SubscriptionModal";

const tabs = [
  { id: "profile", label: "Profil", icon: User },
  { id: "company", label: "Entreprise", icon: Building2 },
  { id: "security", label: "Sécurité", icon: Shield },
  { id: "appearance", label: "Apparence", icon: Palette },
];

export default function SettingsPage() {
  const { user, organization } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [activeTab, setActiveTab] = useState("profile");
  const [saved, setSaved] = useState(false);
  const [isSubsModalOpen, setIsSubsModalOpen] = useState(false);

  const getDaysRemaining = () => {
    const targetDate = organization?.trialEndsAt || organization?.currentPeriodEnd;
    if (!targetDate) return null;
    const remaining = Math.ceil((new Date(targetDate) - new Date()) / (1000 * 60 * 60 * 24));
    return remaining > 0 ? remaining : 0;
  };
  const daysLeft = getDaysRemaining();

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black font-display">Paramètres</h1>
        <p className="text-base-content/60 text-sm mt-1">Gérez votre profil et les préférences de l'application</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Tabs */}
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

        {/* Content */}
        <div className="flex-1 card bg-base-100 shadow-sm border border-base-content/5">
          <div className="card-body">
            {/* Profile Tab */}
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
                    <input type="text" className="input input-bordered w-full" defaultValue={user?.firstName} />
                  </div>
                  <div>
                    <label className="label"><span className="label-text font-medium">Nom</span></label>
                    <input type="text" className="input input-bordered w-full" defaultValue={user?.lastName} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label"><span className="label-text font-medium">Email</span></label>
                    <input type="email" className="input input-bordered w-full" defaultValue={user?.email} disabled />
                    <label className="label"><span className="label-text-alt text-base-content/40">L'email ne peut pas être modifié</span></label>
                  </div>
                </div>
                <button onClick={showSaved} className="btn btn-primary gap-2"><Save size={18} /> Enregistrer</button>
              </div>
            )}

            {/* Company Tab */}
            {activeTab === "company" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold font-display">Informations de l'entreprise</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="label"><span className="label-text font-medium">Nom de l'organisation</span></label>
                    <input type="text" className="input input-bordered w-full" defaultValue={organization?.name} />
                  </div>
                  <div>
                    <label className="label"><span className="label-text font-medium">Devise</span></label>
                    <select className="select select-bordered w-full" defaultValue={organization?.settings?.currency || "XAF"}>
                      <option value="XAF">XAF (Franc CFA)</option>
                      <option value="EUR">EUR (Euro)</option>
                      <option value="USD">USD (Dollar)</option>
                    </select>
                  </div>
                  <div>
                    <label className="label"><span className="label-text font-medium">Fuseau horaire</span></label>
                    <select className="select select-bordered w-full" defaultValue={organization?.settings?.timezone || "Africa/Douala"}>
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
                        <button 
                          onClick={() => setIsSubsModalOpen(true)}
                          className="btn btn-primary btn-sm gap-2"
                        >
                          <CreditCard size={14} /> 
                          {organization?.plan === "starter" ? "S'abonner maintenant" : "Gérer l'abonnement"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <button onClick={showSaved} className="btn btn-primary gap-2"><Save size={18} /> Enregistrer</button>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold font-display">Sécurité du compte</h2>
                <div className="space-y-4">
                  <div>
                    <label className="label"><span className="label-text font-medium">Mot de passe actuel</span></label>
                    <input type="password" className="input input-bordered w-full" placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="label"><span className="label-text font-medium">Nouveau mot de passe</span></label>
                    <input type="password" className="input input-bordered w-full" placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="label"><span className="label-text font-medium">Confirmer le mot de passe</span></label>
                    <input type="password" className="input input-bordered w-full" placeholder="••••••••" />
                  </div>
                </div>
                <button onClick={showSaved} className="btn btn-primary gap-2"><Save size={18} /> Mettre à jour</button>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === "appearance" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold font-display">Apparence</h2>
                <p className="text-base-content/60">Personnalisez l'interface selon vos préférences</p>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => { if (theme === "dark") toggleTheme(); }}
                    className={`card p-6 text-center cursor-pointer border-2 transition-all ${theme === "light" ? "border-primary bg-primary/5" : "border-base-content/10 hover:border-base-content/20"}`}
                  >
                    <Sun size={32} className="mx-auto mb-3 text-warning" />
                    <p className="font-bold">Mode Clair</p>
                    {theme === "light" && <span className="badge badge-primary badge-sm mt-2 mx-auto">Actif</span>}
                  </button>

                  <button
                    onClick={() => { if (theme === "light") toggleTheme(); }}
                    className={`card p-6 text-center cursor-pointer border-2 transition-all ${theme === "dark" ? "border-primary bg-primary/5" : "border-base-content/10 hover:border-base-content/20"}`}
                  >
                    <Moon size={32} className="mx-auto mb-3 text-info" />
                    <p className="font-bold">Mode Sombre</p>
                    {theme === "dark" && <span className="badge badge-primary badge-sm mt-2 mx-auto">Actif</span>}
                  </button>
                </div>
              </div>
            )}

            {/* Saved Toast */}
            {saved && (
              <div className="toast toast-end toast-bottom z-50">
                <div className="alert alert-success shadow-lg">
                  <Check size={18} />
                  <span className="font-medium">Modifications sauvegardées</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <SubscriptionModal 
        isOpen={isSubsModalOpen} 
        onClose={() => setIsSubsModalOpen(false)} 
      />
    </div>
  );
}
