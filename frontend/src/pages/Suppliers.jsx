import React, { useState, useEffect } from "react";
import {
  Building2,
  Plus,
  Eye,
  Edit,
  Trash2,
  Search,
  X,
  RefreshCw,
  Loader2,
  AlertCircle,
  Star,
  TrendingUp,
  Package,
  DollarSign,
} from "lucide-react";
import { SupplierService } from "../services/suppliersService";
import SupplierModal from "../components/common/Suppliers/SupplierModal";
import SupplierDetailsModal from "../components/common/Suppliers/SupplierDetailsModal";
import toast from "react-hot-toast";

const Suppliers = () => {
  // ==================== STATE ====================
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ==================== FETCH SUPPLIERS ====================
  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await SupplierService.getAllSuppliers();

      if (response.success && response.data) {
        setSuppliers(response.data);
      } else {
        setSuppliers([]);
      }
    } catch (err) {
      console.error("Erreur chargement fournisseurs:", err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Erreur lors du chargement des fournisseurs";
      setError(
        typeof errorMessage === "string"
          ? errorMessage
          : "Erreur lors du chargement des fournisseurs",
      );
      toast.error("Erreur lors du chargement des fournisseurs");
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // ==================== REFRESH ====================
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSuppliers();
    setRefreshing(false);
    toast.success("Fournisseurs actualisés");
  };

  // ==================== MODAL HANDLERS ====================
  const handleAddSupplier = () => {
    setSelectedSupplier(null);
    setShowSupplierModal(true);
  };

  const handleEditSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setShowSupplierModal(true);
  };

  const handleViewDetails = (supplier) => {
    setSelectedSupplier(supplier);
    setShowDetailsModal(true);
  };

  const handleSupplierSaved = () => {
    fetchSuppliers();
  };

  // ==================== DELETE ====================
  const handleDeleteSupplier = async (supplierId) => {
    if (
      !window.confirm("Êtes-vous sûr de vouloir supprimer ce fournisseur ?")
    ) {
      return;
    }

    try {
      await SupplierService.deleteSupplier(supplierId);
      setSuppliers(suppliers.filter((s) => s._id !== supplierId));
      toast.success("Fournisseur supprimé");
    } catch (err) {
      console.error("Erreur suppression:", err);
      toast.error("Erreur lors de la suppression");
    }
  };

  // ==================== STATUS BADGE ====================
  const getStatusBadge = (status) => {
    const badges = {
      active: { class: "badge-success", text: "Actif" },
      inactive: { class: "badge-ghost", text: "Inactif" },
      blacklisted: { class: "badge-error", text: "Liste noire" },
    };
    return badges[status] || badges.active;
  };

  // ==================== FILTERING ====================
  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchSearch =
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (supplier.code &&
        supplier.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (supplier.email &&
        supplier.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchStatus =
      filterStatus === "all" || supplier.status === filterStatus;

    return matchSearch && matchStatus;
  });

  // ==================== STATS ====================
  const calculateStats = () => {
    const totalSuppliers = suppliers.length;
    const activeSuppliers = suppliers.filter(
      (s) => s.status === "active",
    ).length;
    const totalSpent = suppliers.reduce(
      (sum, s) => sum + (s.stats?.totalSpent || 0),
      0,
    );
    const totalOrders = suppliers.reduce(
      (sum, s) => sum + (s.stats?.totalOrders || 0),
      0,
    );

    return {
      totalSuppliers,
      activeSuppliers,
      totalSpent,
      totalOrders,
    };
  };

  const stats = calculateStats();

  // ==================== PAGINATION ====================
  const paginatedSuppliers = filteredSuppliers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredSuppliers.length, currentPage, totalPages]);

  // ==================== RENDER LOADING ====================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-primary" />
          <p className="text-lg text-base-content/60">
            Chargement des fournisseurs...
          </p>
        </div>
      </div>
    );
  }

  // ==================== RENDER ERROR ====================
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md shadow-xl card bg-base-100">
          <div className="text-center card-body">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-error" />
            <h2 className="justify-center card-title">Erreur de chargement</h2>
            <p className="text-base-content/60">{error}</p>
            <div className="justify-center mt-4 card-actions">
              <button className="btn btn-primary" onClick={fetchSuppliers}>
                <RefreshCw size={20} />
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== MAIN RENDER ====================
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold">
            <Building2 size={32} className="text-primary" />
            Fournisseurs
          </h1>
          <p className="mt-1 text-base-content/60">
            Gérez vos fournisseurs et partenaires
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="gap-2 btn btn-ghost"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw size={20} className={refreshing ? "animate-spin" : ""} />
            Actualiser
          </button>
          <button className="gap-2 btn btn-primary" onClick={handleAddSupplier}>
            <Plus size={20} />
            Nouveau fournisseur
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg shadow-lg stat bg-base-100">
          <div className="stat-figure text-primary">
            <Building2 size={32} />
          </div>
          <div className="stat-title">Total Fournisseurs</div>
          <div className="stat-value text-primary">{stats.totalSuppliers}</div>
          <div className="stat-desc">Dans la base</div>
        </div>

        <div className="rounded-lg shadow-lg stat bg-base-100">
          <div className="stat-figure text-success">
            <Package size={32} />
          </div>
          <div className="stat-title">Actifs</div>
          <div className="stat-value text-success">{stats.activeSuppliers}</div>
          <div className="stat-desc">Fournisseurs actifs</div>
        </div>

        <div className="rounded-lg shadow-lg stat bg-base-100">
          <div className="stat-figure text-info">
            <DollarSign size={32} />
          </div>
          <div className="stat-title">Total Dépensé</div>
          <div className="text-2xl stat-value text-info">
            {stats.totalSpent.toLocaleString("fr-FR", {
              maximumFractionDigits: 0,
            })}
          </div>
          <div className="stat-desc">FCFA</div>
        </div>

        <div className="rounded-lg shadow-lg stat bg-base-100">
          <div className="stat-figure text-warning">
            <TrendingUp size={32} />
          </div>
          <div className="stat-title">Commandes</div>
          <div className="stat-value text-warning">{stats.totalOrders}</div>
          <div className="stat-desc">Total commandes</div>
        </div>
      </div>

      {/* Filters */}
      <div className="shadow-lg card bg-base-100">
        <div className="card-body">
          <div className="flex flex-col gap-4 md:flex-row">
            {/* Search */}
            <div className="flex-1">
              <div className="form-control">
                <div className="input-group">
                  <span className="bg-base-200">
                  </span>
                  <input
                    type="text"
                    placeholder="Rechercher par nom, code, email..."
                    className="w-full input input-bordered"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      className="btn btn-ghost btn-square"
                      onClick={() => setSearchQuery("")}
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Status Filter */}
            <div className="w-full form-control md:w-48">
              <select
                className="select select-bordered"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Tous statuts</option>
                <option value="active">Actifs</option>
                <option value="inactive">Inactifs</option>
                <option value="blacklisted">Liste noire</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="shadow-lg card bg-base-100">
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Fournisseur</th>
                  <th>Contact</th>
                  <th>Statut</th>
                  <th>Commandes</th>
                  <th>Total dépensé</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSuppliers.map((supplier) => {
                  const statusBadge = getStatusBadge(supplier.status);

                  return (
                    <tr key={supplier._id} className="hover">
                      <td>
                        <div>
                          <div className="font-bold">{supplier.name}</div>
                          {supplier.code && (
                            <div className="font-mono text-sm text-base-content/60">
                              {supplier.code}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="text-sm">
                          {supplier.email && <div>{supplier.email}</div>}
                          {supplier.phone && (
                            <div className="text-base-content/60">
                              {supplier.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className={`badge ${statusBadge.class}`}>
                          {statusBadge.text}
                        </div>
                      </td>
                      <td className="font-semibold">
                        {supplier.stats?.totalOrders || 0}
                      </td>
                      <td className="font-semibold">
                        {(supplier.stats?.totalSpent || 0).toLocaleString(
                          "fr-FR",
                        )}{" "}
                        FCFA
                      </td>
                      <td>
                        {supplier.rating?.overall > 0 ? (
                          <div className="flex items-center gap-1">
                            <Star
                              size={14}
                              className="fill-warning text-warning"
                            />
                            <span className="font-semibold">
                              {supplier.rating.overall.toFixed(1)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-base-content/40">-</span>
                        )}
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            className="btn btn-ghost btn-xs"
                            title="Voir détails"
                            onClick={() => handleViewDetails(supplier)}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="btn btn-ghost btn-xs"
                            title="Modifier"
                            onClick={() => handleEditSupplier(supplier)}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="btn btn-ghost btn-xs text-error"
                            title="Supprimer"
                            onClick={() => handleDeleteSupplier(supplier._id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Empty State */}
            {paginatedSuppliers.length === 0 && (
              <div className="py-12 text-center">
                <Building2
                  size={48}
                  className="mx-auto mb-4 text-base-content/20"
                />
                <p className="text-base-content/60">
                  {suppliers.length === 0
                    ? "Aucun fournisseur"
                    : "Aucun fournisseur trouvé avec ces filtres"}
                </p>
                {suppliers.length === 0 && (
                  <button
                    className="gap-2 mt-4 btn btn-primary"
                    onClick={handleAddSupplier}
                  >
                    <Plus size={20} />
                    Ajouter votre premier fournisseur
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredSuppliers.length > itemsPerPage && (
            <div className="flex flex-col items-center justify-between gap-4 mt-6 md:flex-row">
              <div className="text-sm text-base-content/60">
                Affichage de {(currentPage - 1) * itemsPerPage + 1} à{" "}
                {Math.min(currentPage * itemsPerPage, filteredSuppliers.length)}{" "}
                sur {filteredSuppliers.length} fournisseurs
              </div>

              <div className="btn-group">
                <button
                  className="btn btn-sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  «
                </button>

                {[...Array(totalPages)].map((_, idx) => {
                  const page = idx + 1;
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        className={`btn btn-sm ${currentPage === page ? "btn-active" : ""}`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  ) {
                    return (
                      <button key={page} className="btn btn-sm btn-disabled">
                        ...
                      </button>
                    );
                  }
                  return null;
                })}

                <button
                  className="btn btn-sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  »
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <SupplierModal
        isOpen={showSupplierModal}
        onClose={() => setShowSupplierModal(false)}
        supplier={selectedSupplier}
        onSuccess={handleSupplierSaved}
      />

      <SupplierDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        supplier={selectedSupplier}
      />
    </div>
  );
};

export default Suppliers;
