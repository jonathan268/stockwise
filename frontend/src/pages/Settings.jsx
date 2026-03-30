import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Database,
  Palette,
  Globe,
  Mail,
  Lock,
  Save,
  RefreshCw,
  Trash2,
  Eye,
  EyeOff,
  Building,
  Phone,
  MapPin,
  CreditCard,
  Zap,
  Info,
  Calendar,
  CheckCircle,
  Crown,
  ChevronRight,
  Loader2,
  RefreshCcw
} from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    lowStock: true,
    orders: true,
    aiInsights: false
  });
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingSub, setLoadingSub] = useState(false);
  const [usage, setUsage] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [userRes, orgRes, subRes, usageRes] = await Promise.all([
        api.get('/api/v1/users/me'),
        api.get('/api/v1/organizations'),
        api.get('/api/v1/subscriptions/my-subscription'),
        api.get('/api/v1/subscriptions/usage')
      ]);
      
      const userData = userRes.data.data;
      setUser(userData);
      setOrganization(orgRes.data.data);
      setSubscription(subRes.data.data);
      setUsage(usageRes.data.data);
      
      // Sync notifications state with user preferences
      if (userData?.preferences?.notifications) {
        setNotifications(userData.preferences.notifications);
      }
    } catch (error) {
      console.error("Erreur chargement paramètres:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpgrade = async (plan) => {
    try {
      const response = await api.post('/api/v1/subscriptions/checkout', { plan });
      if (response.data.data.authorization_url) {
        window.location.href = response.data.data.authorization_url;
      }
    } catch (error) {
      alert("Erreur lors de l'initialisation du paiement: " + (error.response?.data?.message || error.message));
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.put('/api/v1/users/me', user);
      alert('Profil mis à jour avec succès');
    } catch (error) {
      alert('Erreur mise à jour profil');
    } finally {
      setLoading(false);
    }
  };

  const handleOrgUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.put('/api/v1/organizations', organization);
      alert('Organisation mise à jour avec succès');
    } catch (error) {
      alert('Erreur mise à jour organisation');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = async (key, value) => {
    const updated = { ...notifications, [key]: value };
    setNotifications(updated);
    try {
      await api.put('/api/v1/users/me', {
        preferences: { ...user.preferences, notifications: updated }
      });
    } catch (error) {
      console.error("Erreur sync notifications:", error);
    }
  };

  const handleAvatarUpdate = async () => {
    const url = prompt("Entrez l'URL de votre nouvel avatar:", user?.avatar || "");
    if (url !== null) {
      try {
        setLoading(true);
        await api.put('/api/v1/users/me/avatar', { avatarUrl: url });
        setUser({ ...user, avatar: url });
        alert('Avatar mis à jour');
      } catch (error) {
        alert('Erreur mise à jour avatar');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const currentPassword = e.target.currentPassword.value;
    const newPassword = e.target.newPassword.value;
    const newPasswordConfirm = e.target.newPasswordConfirm.value;

    if (newPassword !== newPasswordConfirm) return alert("Les mots de passe ne correspondent pas");

    try {
      setLoading(true);
      await api.put('/api/v1/users/me/password', { currentPassword, newPassword, newPasswordConfirm });
      alert('Mot de passe changé ! Reconnectez-vous.');
      // Optionnel: logout
    } catch (error) {
      alert(error.response?.data?.message || 'Erreur changement mot de passe');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const password = prompt("Confirmez votre mot de passe pour supprimer le compte :");
    if (!password) return;
    const confirmation = prompt("Tapez 'DELETE' pour confirmer la suppression définitive :");
    if (confirmation !== "DELETE") return;

    try {
      setLoading(true);
      await api.delete('/api/v1/users/me', { data: { password, confirmation } });
      alert('Compte supprimé.');
      window.location.href = '/login';
    } catch (error) {
      alert(error.response?.data?.message || 'Erreur suppression compte');
    } finally {
      setLoading(false);
    }
  };

  const handleAppearanceUpdate = async (key, value) => {
    if (key === 'theme') {
      document.documentElement.setAttribute('data-theme', value);
      try {
        await api.put('/api/v1/users/me', { preferences: { ...user.preferences, theme: value } });
      } catch (e) { console.error(e); }
    }
    // Langue, devise, etc. pourraient être gérés ici
  };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'company', label: 'Entreprise', icon: Building },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'appearance', label: 'Apparence', icon: Palette },
    { id: 'subscription', label: 'Abonnement', icon: CreditCard },
  ];

  if (loading && !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <SettingsIcon size={32} className="text-primary" />
          Paramètres
        </h1>
        <p className="text-base-content/60 mt-1">
          Gérez les paramètres de votre compte et de l'application
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto pb-2">
        <div className="tabs tabs-boxed">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`tab gap-2 ${activeTab === tab.id ? 'tab-active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === 'profile' && user && (
        <form onSubmit={handleProfileUpdate} className="space-y-6">
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="card-title mb-4">Informations personnelles</h2>
              
              <div className="flex items-center gap-6 mb-6">
                <div className="avatar placeholder">
                  <div className="bg-primary text-primary-content rounded-full w-24 h-24 overflow-hidden">
                    {user.avatar ? (
                      <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl">{user.initials || user.firstName?.[0]}</span>
                    )}
                  </div>
                </div>
                <div>
                  <button type="button" onClick={handleAvatarUpdate} className="btn btn-primary btn-sm">Changer l'avatar (URL)</button>
                  <p className="text-sm text-base-content/60 mt-2">Collez une URL vers une image JPG, PNG.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Prénom</span>
                  </label>
                  <input 
                    type="text" 
                    className="input input-bordered" 
                    value={user.firstName}
                    onChange={(e) => setUser({...user, firstName: e.target.value})}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Nom</span>
                  </label>
                  <input 
                    type="text" 
                    className="input input-bordered" 
                    value={user.lastName}
                    onChange={(e) => setUser({...user, lastName: e.target.value})}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Email</span>
                  </label>
                  <input 
                    type="email" 
                    className="input input-bordered opacity-70" 
                    value={user.email}
                    disabled
                  />
                  <span className="text-xs text-info mt-1 italic">Utilisez l'onglet Sécurité pour changer l'email.</span>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Téléphone</span>
                  </label>
                  <input 
                    type="tel" 
                    className="input input-bordered" 
                    value={user.phone || ""}
                    onChange={(e) => setUser({...user, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="card-actions justify-end mt-6">
                <button type="submit" className="btn btn-primary gap-2" disabled={loading}>
                  {loading ? <span className="loading loading-spinner"></span> : <Save size={20} />}
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {activeTab === 'company' && organization && (
        <form onSubmit={handleOrgUpdate} className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title mb-4">Informations entreprise</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text font-semibold">Nom de l'entreprise</span>
                </label>
                <input 
                  type="text" 
                  className="input input-bordered" 
                  value={organization.name || ""}
                  onChange={(e) => setOrganization({...organization, name: e.target.value})}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Secteur d'activité</span>
                </label>
                <select 
                  className="select select-bordered"
                  value={organization.industry || "other"}
                  onChange={(e) => setOrganization({...organization, industry: e.target.value})}
                >
                  <option value="agriculture">Agriculture</option>
                  <option value="retail">Commerce de détail</option>
                  <option value="wholesale">Commerce de gros</option>
                  <option value="manufacturing">Manufacture</option>
                  <option value="food_service">Restauration</option>
                  <option value="logistics">Logistique</option>
                  <option value="other">Autre</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Adresse</span>
                </label>
                <input 
                  type="text" 
                  className="input input-bordered" 
                  value={organization.address?.street || ""}
                  onChange={(e) => setOrganization({
                    ...organization, 
                    address: { ...organization.address, street: e.target.value }
                  })}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Ville</span>
                </label>
                <input 
                  type="text" 
                  className="input input-bordered" 
                  value={organization.address?.city || ""}
                  onChange={(e) => setOrganization({
                    ...organization, 
                    address: { ...organization.address, city: e.target.value }
                  })}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Pays</span>
                </label>
                <select 
                  className="select select-bordered"
                  value={organization.address?.country || "Cameroun"}
                  onChange={(e) => setOrganization({
                    ...organization, 
                    address: { ...organization.address, country: e.target.value }
                  })}
                >
                  <option value="Cameroun">Cameroun</option>
                  <option value="France">France</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">N° Fiscal / TVA</span>
                </label>
                <input 
                  type="text" 
                  className="input input-bordered" 
                  value={organization.taxId || ""}
                  onChange={(e) => setOrganization({...organization, taxId: e.target.value})}
                />
              </div>
            </div>

            <div className="card-actions justify-end mt-6">
              <button type="submit" className="btn btn-primary gap-2" disabled={loading}>
                {loading ? <span className="loading loading-spinner"></span> : <Save size={20} />}
                Enregistrer
              </button>
            </div>
          </div>
        </form>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="card-title mb-4">Préférences de notifications</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Mail size={24} className="text-primary" />
                    <div>
                      <div className="font-semibold">Notifications par email</div>
                      <div className="text-sm text-base-content/60">Recevoir des emails pour les événements importants</div>
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    className="toggle toggle-primary" 
                    checked={notifications.email}
                    onChange={(e) => handleNotificationChange('email', e.target.checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Bell size={24} className="text-primary" />
                    <div>
                      <div className="font-semibold">Notifications push</div>
                      <div className="text-sm text-base-content/60">Recevoir des notifications dans le navigateur</div>
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    className="toggle toggle-primary"
                    checked={notifications.push}
                    onChange={(e) => handleNotificationChange('push', e.target.checked)}
                  />
                </div>

                <div className="divider">Alertes spécifiques</div>

                <div className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Database size={24} className="text-warning" />
                    <div>
                      <div className="font-semibold">Alertes de stock bas</div>
                      <div className="text-sm text-base-content/60">Être notifié quand le stock est en dessous du seuil</div>
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    className="toggle toggle-warning"
                    checked={notifications.lowStock}
                    onChange={(e) => handleNotificationChange('lowStock', e.target.checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Zap size={24} className="text-info" />
                    <div>
                      <div className="font-semibold">Insights IA</div>
                      <div className="text-sm text-base-content/60">Recevoir les recommandations et prédictions IA</div>
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    className="toggle toggle-info"
                    checked={notifications.aiInsights}
                    onChange={(e) => handleNotificationChange('aiInsights', e.target.checked)}
                  />
                </div>
              </div>

              <div className="card-actions justify-center mt-6">
                <span className="text-sm italic opacity-60">Synchronisation automatique activée</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="card bg-base-100 shadow-lg">
            <form onSubmit={handleChangePassword} className="card-body">
              <h2 className="card-title mb-4">Changer le mot de passe</h2>
              
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Mot de passe actuel</span>
                  </label>
                  <div className="relative">
                    <input 
                      name="currentPassword"
                      type={showPassword ? 'text' : 'password'} 
                      placeholder="••••••••" 
                      className="input input-bordered w-full pr-10"
                      required
                    />
                    <button 
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Nouveau mot de passe</span>
                  </label>
                  <input name="newPassword" type="password" placeholder="••••••••" className="input input-bordered" required />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Confirmer le mot de passe</span>
                  </label>
                  <input name="newPasswordConfirm" type="password" placeholder="••••••••" className="input input-bordered" required />
                </div>
              </div>

              <div className="card-actions justify-end mt-6">
                <button type="submit" className="btn btn-primary gap-2" disabled={loading}>
                  {loading && <span className="loading loading-spinner"></span>}
                  <Lock size={20} />
                  Changer le mot de passe
                </button>
              </div>
            </form>
          </div>

          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="card-title mb-4">Authentification à deux facteurs</h2>
              <p className="text-base-content/70 mb-4 font-bold text-info italic">
                Bientôt disponible
              </p>
              <button className="btn btn-outline btn-disabled gap-2">
                <Shield size={20} />
                Activer l'authentification à deux facteurs
              </button>
            </div>
          </div>

          <div className="card bg-base-100 shadow-lg border-error">
            <div className="card-body">
              <h2 className="card-title text-error mb-4">Zone dangereuse</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Supprimer le compte</div>
                    <div className="text-sm text-base-content/60">Action irréversible</div>
                  </div>
                  <button onClick={handleDeleteAccount} className="btn btn-error btn-outline gap-2" disabled={loading}>
                    <Trash2 size={20} />
                    Supprimer le compte
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'appearance' && user && organization && (
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title mb-4">Personnalisation de l'apparence</h2>
            
            <div className="space-y-6">
              <div>
                <label className="label">
                  <span className="label-text font-semibold">Thème de l'interface</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['light', 'synthwave', 'cupcake', 'corporate', 'luxury', 'dracula'].map((theme) => (
                    <button 
                      key={theme}
                      className={`btn btn-outline capitalize ${user.preferences?.theme === theme ? 'btn-active' : ''}`}
                      onClick={() => handleAppearanceUpdate('theme', theme)}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-semibold">Langue (Organisation)</span>
                </label>
                <select 
                  className="select select-bordered w-full max-w-xs"
                  value={organization.settings?.language || "fr"}
                  onChange={(e) => setOrganization({...organization, settings: {...organization.settings, language: e.target.value}})}
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-semibold">Devise</span>
                </label>
                <select 
                  className="select select-bordered w-full max-w-xs"
                  value={organization.settings?.currency || "XAF"}
                  onChange={(e) => setOrganization({...organization, settings: {...organization.settings, currency: e.target.value}})}
                >
                  <option value="XAF">Franc CFA (FCFA)</option>
                  <option value="EUR">Euro (€)</option>
                  <option value="USD">Dollar ($)</option>
                </select>
              </div>
            </div>

            <div className="card-actions justify-end mt-6">
              <button onClick={handleOrgUpdate} className="btn btn-primary gap-2" disabled={loading}>
                {loading && <span className="loading loading-spinner"></span>}
                <Save size={20} />
                Enregistrer les paramètres globaux
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Subscription Tab */}
      {activeTab === 'subscription' && (
        <div className="space-y-6">
          {loadingSub ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-primary" size={48} />
            </div>
          ) : (
            <>
              {/* Current Subscription Status */}
              <div className={`card shadow-lg ${subscription?.status === 'trial' ? 'bg-primary text-primary-content' : 'bg-base-100'}`}>
                <div className="card-body">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Crown size={24} />
                        <h2 className="text-2xl font-bold uppercase tracking-wider">Plan {subscription?.plan}</h2>
                        {subscription?.status === 'trial' && (
                          <div className="badge badge-secondary font-bold">ESSAI GRATUIT</div>
                        )}
                      </div>
                      <p className={subscription?.status === 'trial' ? 'text-primary-content/80' : 'text-base-content/60'}>
                        {subscription?.status === 'trial' 
                          ? `Votre essai gratuit se termine dans ${subscription?.trial?.daysRemaining || 0} jours.` 
                          : subscription?.status === 'active' 
                            ? `Votre abonnement est actif jusqu'au ${new Date(subscription?.currentPeriod?.end).toLocaleDateString()}.`
                            : 'Votre abonnement est expiré.'}
                      </p>
                    </div>
                    {subscription?.status === 'trial' && (
                      <button onClick={() => fetchData()} className="btn btn-secondary border-none">
                        Gérer mon plan
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Usage Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Produits', used: usage?.current?.productsCount, limit: usage?.limits?.maxProducts, pct: usage?.percentages?.products },
                  { label: 'Utilisateurs', used: usage?.current?.usersCount, limit: usage?.limits?.maxUsers, pct: usage?.percentages?.users },
                  { label: 'Prédictions IA', used: usage?.current?.aiPredictionsUsed, limit: usage?.limits?.aiPredictionsPerMonth, pct: usage?.percentages?.aiPredictions },
                ].map((item) => (
                  <div key={item.label} className="card bg-base-100 shadow-md">
                    <div className="card-body p-5">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-semibold opacity-70">{item.label}</span>
                        <span className="text-lg font-bold">
                          {item.used} / {item.limit === -1 ? '∞' : item.limit}
                        </span>
                      </div>
                      <progress 
                        className={`progress w-full ${item.pct > 90 ? 'progress-error' : item.pct > 70 ? 'progress-warning' : 'progress-primary'}`} 
                        value={item.pct} 
                        max="100"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Plans Comparison */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                {[
                  { id: 'basic', name: 'Pro', price: '15,000', color: 'primary' },
                  { id: 'smart', name: 'Entreprise', price: '45,000', color: 'secondary' },
                ].map((p) => (
                  <div key={p.id} className={`card bg-base-100 shadow-lg border-2 ${subscription?.plan === p.id ? `border-${p.color}` : 'border-transparent'}`}>
                    <div className="card-body">
                      <h3 className="text-xl font-bold">{p.name}</h3>
                      <div className="flex items-baseline gap-1 my-4">
                        <span className="text-3xl font-black">{p.price}</span>
                        <span className="text-sm opacity-60">XAF / mois</span>
                      </div>
                      <button 
                        disabled={subscription?.plan === p.id}
                        onClick={() => handleUpgrade(p.id)}
                        className={`btn btn-${p.color} w-full mt-4 ${subscription?.plan === p.id ? 'btn-disabled' : ''}`}
                      >
                        {subscription?.plan === p.id ? 'Plan actuel' : 'Choisir ce plan'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Settings;