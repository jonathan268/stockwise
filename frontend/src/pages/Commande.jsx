import React, { useState, useEffect } from "react";
import {
  Package,
  Plus,
  Eye,
  Edit,
  Trash2,
  Search,
  X,
  RefreshCw,
  Loader2,
  AlertCircle,
  TrendingUp,
  Clock,
  DollarSign,
  CheckCircle,
} from "lucide-react";
import { OrderService } from "../services/orderService";
import OrderModal from "../components/common/Orders/orderModal";
import OrderDetailsModal from "../components/common/Orders/orderDetailsModal";
import toast from "react-hot-toast";

const Orders = () => {
  // ==================== STATE ====================
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ==================== FETCH ORDERS ====================
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await OrderService.getAllOrders();

      if (response.success && response.data) {
        setOrders(response.data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Erreur chargement commandes:", err);
      setError(err.message || "Erreur lors du chargement des commandes");
      toast.error("Erreur lors du chargement des commandes");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ==================== REFRESH ====================
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
    toast.success("Commandes actualisées");
  };

  // ==================== MODAL HANDLERS ====================
  const handleAddOrder = () => {
    setSelectedOrder(null);
    setShowOrderModal(true);
  };

  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleOrderSaved = () => {
    fetchOrders();
  };

  // ==================== DELETE ====================
  const handleDeleteOrder = async (orderId) => {
    if (
      !window.confirm("Êtes-vous sûr de vouloir supprimer cette commande ?")
    ) {
      return;
    }

    try {
      await OrderService.deleteOrder(orderId);
      setOrders(orders.filter((o) => o._id !== orderId));
      toast.success("Commande supprimée");
    } catch (err) {
      console.error("Erreur suppression:", err);
      toast.error("Erreur lors de la suppression");
    }
  };

  // ==================== STATUS BADGE ====================
  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: "badge-warning", text: "En attente" },
      confirmed: { class: "badge-info", text: "Confirmée" },
      processing: { class: "badge-info", text: "Traitement" },
      shipped: { class: "badge-primary", text: "Expédiée" },
      delivered: { class: "badge-success", text: "Livrée" },
      completed: { class: "badge-success", text: "Complétée" },
      cancelled: { class: "badge-error", text: "Annulée" },
    };
    return badges[status] || badges.pending;
  };

  // ==================== FILTERING ====================
  const filteredOrders = orders.filter((order) => {
    const matchSearch =
      order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.supplier?.name &&
        order.supplier.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase())) ||
      (order.reference &&
        order.reference.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchStatus = filterStatus === "all" || order.status === filterStatus;

    return matchSearch && matchStatus;
  });

  // ==================== STATS ====================
  const calculateStats = () => {
    const totalOrders = orders.length;
    const completedOrders = orders.filter(
      (o) => o.status === "completed" || o.status === "delivered",
    ).length;
    const totalAmount = orders.reduce(
      (sum, o) => sum + (o.totalAmount || 0),
      0,
    );
    const pendingOrders = orders.filter((o) => o.status === "pending").length;

    return {
      totalOrders,
      completedOrders,
      totalAmount,
      pendingOrders,
    };
  };

  const stats = calculateStats();

  // ==================== PAGINATION ====================
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredOrders.length, currentPage, totalPages]);

  // ==================== RENDER LOADING ====================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-base-content/60">
            Chargement des commandes...
          </p>
        </div>
      </div>
    );
  }

  // ==================== RENDER ERROR ====================
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="card bg-base-100 shadow-xl w-full max-w-md">
          <div className="card-body text-center">
            <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
            <h2 className="card-title justify-center">Erreur de chargement</h2>
            <p className="text-base-content/60">{error}</p>
            <div className="card-actions justify-center mt-4">
              <button className="btn btn-primary" onClick={fetchOrders}>
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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Package size={32} className="text-primary" />
            Commandes
          </h1>
          <p className="text-base-content/60 mt-1">
            Gérez vos commandes et achats
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn btn-ghost gap-2"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw size={20} className={refreshing ? "animate-spin" : ""} />
            Actualiser
          </button>
          <button className="btn btn-primary gap-2" onClick={handleAddOrder}>
            <Plus size={20} />
            Nouvelle commande
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-primary">
            <Package size={32} />
          </div>
          <div className="stat-title">Total Commandes</div>
          <div className="stat-value text-primary">{stats.totalOrders}</div>
          <div className="stat-desc">Toutes périodes</div>
        </div>

        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-success">
            <CheckCircle size={32} />
          </div>
          <div className="stat-title">Complétées</div>
          <div className="stat-value text-success">{stats.completedOrders}</div>
          <div className="stat-desc">Commandes livrées</div>
        </div>

        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-info">
            <DollarSign size={32} />
          </div>
          <div className="stat-title">Montant Total</div>
          <div className="stat-value text-info text-2xl">
            {stats.totalAmount.toLocaleString("fr-FR", {
              maximumFractionDigits: 0,
            })}
          </div>
          <div className="stat-desc">FCFA</div>
        </div>

        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-warning">
            <Clock size={32} />
          </div>
          <div className="stat-title">En attente</div>
          <div className="stat-value text-warning">{stats.pendingOrders}</div>
          <div className="stat-desc">À traiter</div>
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
                    placeholder="Rechercher par nom, code, email..."
                    className="input input-bordered w-full"
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
            <div className="form-control w-full md:w-48">
              <select
                className="select select-bordered"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Tous statuts</option>
                <option value="pending">En attente</option>
                <option value="confirmed">Confirmées</option>
                <option value="processing">En traitement</option>
                <option value="shipped">Expédiées</option>
                <option value="delivered">Livrées</option>
                <option value="completed">Complétées</option>
                <option value="cancelled">Annulées</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="card bg-base-100 shadow-lg">
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
                            <div className="text-sm text-base-content/60 font-mono">
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
            {paginatedOrders.length === 0 && (
              <div className="text-center py-12">
                <Package
                  size={48}
                  className="mx-auto text-base-content/20 mb-4"
                />
                <p className="text-base-content/60">
                  {orders.length === 0
                    ? "Aucune commande"
                    : "Aucune commande trouvée avec ces filtres"}
                </p>
                {orders.length === 0 && (
                  <button
                    className="btn btn-primary mt-4 gap-2"
                    onClick={handleAddOrder}
                  >
                    <Plus size={20} />
                    Créer votre première commande
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredOrders.length > itemsPerPage && (
            <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4">
              <div className="text-sm text-base-content/60">
                Affichage de {(currentPage - 1) * itemsPerPage + 1} à{" "}
                {Math.min(currentPage * itemsPerPage, filteredOrders.length)}{" "}
                sur {filteredOrders.length} commandes
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
      <OrderModal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        order={selectedOrder}
        onSuccess={handleOrderSaved}
      />

      <OrderDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        order={selectedOrder}
      />
    </div>
  );
};

export default Orders;
