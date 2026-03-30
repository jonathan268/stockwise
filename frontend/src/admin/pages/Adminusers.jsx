import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import {
  Users,
  Search,
  Filter,
  Download,
  UserPlus,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  Calendar,
  Shield,
  Ban,
  CheckCircle,
  X,
  Clock,
  MapPin,
  Building
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      console.error("Erreur chargement utilisateurs:", err);
      setError("Impossible de charger les utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // Données utilisateurs
  const plans = ['all', 'free', 'basic', 'smart', 'premium'];
  const statuses = ['all', 'active', 'pending', 'suspended', 'inactive'];

  const getStatusBadge = (status) => {
    const badges = {
      active: { class: 'badge-success', text: 'Actif', icon: CheckCircle },
      pending: { class: 'badge-warning', text: 'En attente', icon: Clock },
      suspended: { class: 'badge-error', text: 'Suspendu', icon: Ban },
      inactive: { class: 'badge-neutral', text: 'Inactif', icon: X }
    };
    return badges[status] || { class: 'badge-ghost', text: status, icon: Clock };
  };

  const getPlanBadge = (plan) => {
    const badges = {
      premium: { class: 'badge-error', text: 'Premium' },
      smart: { class: 'badge-warning', text: 'Smart' },
      basic: { class: 'badge-info', text: 'Basic' },
      free: { class: 'badge-ghost', text: 'Free' }
    };
    return badges[plan?.toLowerCase()] || badges.free;
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(filteredUsers.map(u => u._id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (id) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter(uId => uId !== id));
    } else {
      setSelectedUsers([...selectedUsers, id]);
    }
  };

  const filteredUsers = users.filter(user => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const matchSearch = 
      fullName.includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.organization?.name || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    // Pour le plan, c'est un peu plus complexe car c'est dans organization.subscription
    // mais on va simplifier pour l'instant si le backend ne le renvoie pas directement
    const matchPlan = selectedPlan === 'all'; 
    const matchStatus = selectedStatus === 'all' || user.status === selectedStatus;
    
    return matchSearch && matchPlan && matchStatus;
  });

  const totalUsersCount = users.length;
  const activeUsersCount = users.filter(u => u.status === 'active').length;
  const pendingUsersCount = users.filter(u => u.status === 'pending').length;
  const suspendedUsersCount = users.filter(u => u.status === 'suspended').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users size={32} className="text-primary" />
            Gestion des Utilisateurs
          </h1>
          <p className="text-base-content/60 mt-1">
            Gérez tous les utilisateurs de la plateforme
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-outline gap-2">
            <Download size={20} />
            Exporter
          </button>
          <button className="btn btn-primary gap-2">
            <UserPlus size={20} />
            Ajouter Utilisateur
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-primary">
            <Users size={32} />
          </div>
          <div className="stat-title">Total Utilisateurs</div>
          <div className="stat-value text-primary">{totalUsersCount}</div>
          <div className="stat-desc">Sur la plateforme</div>
        </div>
        
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-success">
            <CheckCircle size={32} />
          </div>
          <div className="stat-title">Actifs</div>
          <div className="stat-value text-success">{activeUsersCount}</div>
          <div className="stat-desc">{totalUsersCount > 0 ? Math.round(activeUsersCount / totalUsersCount * 100) : 0}% du total</div>
        </div>
        
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-warning">
            <Clock size={32} />
          </div>
          <div className="stat-title">En attente</div>
          <div className="stat-value text-warning">{pendingUsersCount}</div>
          <div className="stat-desc">À valider</div>
        </div>
        
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-error">
            <Ban size={32} />
          </div>
          <div className="stat-title">Suspendus</div>
          <div className="stat-value text-error">{suspendedUsersCount}</div>
          <div className="stat-desc">Action requise</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="form-control">
                <div className="input-group">
                  <span className="bg-base-200">
                    <Search size={20} />
                  </span>
                  <input
                    type="text"
                    placeholder="Rechercher par nom, email ou organisation..."
                    className="input input-bordered w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button 
                      className="btn btn-ghost btn-square"
                      onClick={() => setSearchQuery('')}
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Plan Filter */}
            <div className="form-control w-full md:w-48">
              <select 
                className="select select-bordered"
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
              >
                <option value="all">Tous les plans</option>
                {plans.slice(1).map(plan => (
                  <option key={plan} value={plan}>{plan}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="form-control w-full md:w-48">
              <select 
                className="select select-bordered"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actifs</option>
                <option value="pending">En attente</option>
                <option value="suspended">Suspendus</option>
              </select>
            </div>
          </div>

          {/* Active Filters */}
          {(selectedPlan !== 'all' || selectedStatus !== 'all' || searchQuery) && (
            <div className="flex items-center gap-2 mt-4">
              <span className="text-sm text-base-content/60">Filtres actifs:</span>
              {searchQuery && (
                <div className="badge badge-primary gap-2">
                  {searchQuery}
                  <button onClick={() => setSearchQuery('')}>
                    <X size={14} />
                  </button>
                </div>
              )}
              {selectedPlan !== 'all' && (
                <div className="badge badge-secondary gap-2">
                  {selectedPlan}
                  <button onClick={() => setSelectedPlan('all')}>
                    <X size={14} />
                  </button>
                </div>
              )}
              {selectedStatus !== 'all' && (
                <div className="badge badge-accent gap-2">
                  {getStatusBadge(selectedStatus).text}
                  <button onClick={() => setSelectedStatus('all')}>
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          {selectedUsers.length > 0 && (
            <div className="alert shadow-lg mb-4">
              <div className="flex-1">
                <span>{selectedUsers.length} utilisateur(s) sélectionné(s)</span>
              </div>
              <div className="flex-none gap-2">
                <button className="btn btn-sm btn-success gap-2">
                  <CheckCircle size={16} />
                  Activer
                </button>
                <button className="btn btn-sm btn-warning gap-2">
                  <Ban size={16} />
                  Suspendre
                </button>
                <button className="btn btn-sm btn-error gap-2">
                  <Trash2 size={16} />
                  Supprimer
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>Utilisateur</th>
                  <th>Organisation</th>
                  <th>Plan</th>
                  <th>Usage</th>
                  <th>Statut</th>
                  <th>Dernière connexion</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const statusBadge = getStatusBadge(user.status);
                  const planBadge = getPlanBadge(user.organization?.subscription?.plan || 'free');
                  const StatusIcon = statusBadge.icon;
                  const fullName = `${user.firstName} ${user.lastName}`;
                  
                  return (
                    <tr key={user._id} className="hover">
                      <td>
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm"
                          checked={selectedUsers.includes(user._id)}
                          onChange={() => handleSelectUser(user._id)}
                        />
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar placeholder">
                            <div className="bg-neutral-focus text-neutral-content rounded-full w-12">
                              <span>{user.firstName[0]}{user.lastName[0]}</span>
                            </div>
                          </div>
                          <div>
                            <div className="font-bold">{fullName}</div>
                            <div className="text-sm text-base-content/60 flex items-center gap-1">
                              <Mail size={12} />
                              {user.email}
                            </div>
                            <div className="text-xs text-base-content/40 mt-1 uppercase tracking-tighter font-semibold">
                              Rôle: {user.role}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="font-semibold">{user.organization?.name || "Sans organisation"}</div>
                        <div className="text-xs text-base-content/60 mt-1 italic">
                          ID: {user.organization?._id?.substring(0, 8)}...
                        </div>
                      </td>
                      <td>
                        <div className={`badge ${planBadge.class}`}>
                          {planBadge.text}
                        </div>
                      </td>
                      <td>
                        <div className="space-y-1">
                          <div className="text-xs text-base-content/60">Limit / Usage</div>
                          <div className="text-xs font-medium">
                            {user.organization?.usage?.usersCount || 0} / {user.organization?.limits?.maxUsers || 0} membres
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className={`badge ${statusBadge.class} gap-2`}>
                          <StatusIcon size={12} />
                          {statusBadge.text}
                        </div>
                      </td>
                      <td>
                        <div className="text-sm flex flex-col gap-1">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} className="text-base-content/60" />
                            {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button className="btn btn-ghost btn-xs" title="Voir">
                            <Eye size={16} />
                          </button>
                          <button className="btn btn-ghost btn-xs text-error" title="Désactiver">
                            <Ban size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users size={48} className="mx-auto text-base-content/20 mb-4" />
                <p className="text-base-content/60">Aucun utilisateur trouvé</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredUsers.length > 0 && (
            <div className="flex justify-center mt-6">
              <div className="btn-group">
                <button className="btn btn-sm">«</button>
                <button className="btn btn-sm btn-active">1</button>
                <button className="btn btn-sm">2</button>
                <button className="btn btn-sm">3</button>
                <button className="btn btn-sm">»</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;