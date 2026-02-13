import React, { useState } from "react";
import {
  Users,
  Search,
  Plus,
  Filter,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Star,
  TrendingUp,
  Package,
  DollarSign,
  Calendar,
  X,
  Building,
  Globe,
  Award,
  AlertCircle,
} from "lucide-react";

const Suppliers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'

  // Données des fournisseurs
  const suppliers = [
    {
      id: 1,
      name: "TechDistrib SA",
      category: "Électronique",
      rating: 4.8,
      email: "contact@techdistrib.cm",
      phone: "+237 6 90 12 34 56",
      address: "Douala, Cameroun",
      website: "www.techdistrib.cm",
      productsSupplied: 156,
      totalOrders: 45,
      totalSpent: 245750,
      lastOrderDate: "2024-02-10",
      status: "active",
      reliability: 10,
      deliveryTime: 5,
      paymentTerms: "30 jours",
      logo: null,
    },
    {
      id: 2,
      name: "ElectroWorld",
      category: "Électronique",
      rating: 4.5,
      email: "info@electroworld.com",
      phone: "+33 1 23 45 67 89",
      address: "Paris, France",
      website: "www.electroworld.com",
      productsSupplied: 89,
      totalOrders: 28,
      totalSpent: 156900,
      lastOrderDate: "2024-02-12",
      status: "active",
      reliability: 88,
      deliveryTime: 7,
      paymentTerms: "60 jours",
      logo: null,
    },
    {
      id: 3,
      name: "MegaTech Distribution",
      category: "Informatique",
      rating: 4.9,
      email: "sales@megatech.cm",
      phone: "+237 6 70 11 22 33",
      address: "Yaoundé, Cameroun",
      website: "www.megatech.cm",
      productsSupplied: 203,
      totalOrders: 67,
      totalSpent: 389450,
      lastOrderDate: "2024-02-11",
      status: "active",
      reliability: 97,
      deliveryTime: 3,
      paymentTerms: "45 jours",
      logo: null,
    },
    {
      id: 4,
      name: "Global Electronics",
      category: "Électronique",
      rating: 4.2,
      email: "contact@globalelec.com",
      phone: "+1 555 123 4567",
      address: "New York, USA",
      website: "www.globalelec.com",
      productsSupplied: 124,
      totalOrders: 19,
      totalSpent: 98500,
      lastOrderDate: "2024-01-28",
      status: "inactive",
      reliability: 82,
      deliveryTime: 10,
      paymentTerms: "90 jours",
      logo: null,
    },
    {
      id: 5,
      name: "Accessoires Plus",
      category: "Accessoires",
      rating: 4.6,
      email: "info@accplus.cm",
      phone: "+237 6 99 88 77 66",
      address: "Douala, Cameroun",
      website: "www.accplus.cm",
      productsSupplied: 67,
      totalOrders: 34,
      totalSpent: 45200,
      lastOrderDate: "2024-02-09",
      status: "active",
      reliability: 90,
      deliveryTime: 4,
      paymentTerms: "30 jours",
      logo: null,
    },
  ];

  const categories = [
    "all",
    "Électronique",
    "Informatique",
    "Accessoires",
    "Mobilier",
  ];

  const getStatusBadge = (status) => {
    return status === "active"
      ? { class: "badge-success", text: "Actif" }
      : { class: "badge-ghost", text: "Inactif" };
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return "text-success";
    if (rating >= 4.0) return "text-warning";
    return "text-error";
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedSuppliers(suppliers.map((s) => s.id));
    } else {
      setSelectedSuppliers([]);
    }
  };

  const handleSelectSupplier = (id) => {
    if (selectedSuppliers.includes(id)) {
      setSelectedSuppliers(selectedSuppliers.filter((sId) => sId !== id));
    } else {
      setSelectedSuppliers([...selectedSuppliers, id]);
    }
  };

  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchSearch =
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory =
      selectedCategory === "all" || supplier.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const activeSuppliers = suppliers.filter((s) => s.status === "active").length;
  const avgRating = (
    suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length
  ).toFixed(1);
  const totalSpent = suppliers.reduce((sum, s) => sum + s.totalSpent, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users size={32} className="text-primary" />
            Fournisseurs
          </h1>
          <p className="text-base-content/60 mt-1">
            Gérez vos partenaires et fournisseurs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-outline gap-2">
            <Upload size={20} />
            Importer
          </button>
          <button className="btn btn-outline gap-2">
            <Download size={20} />
            Exporter
          </button>
          <button className="btn btn-primary gap-2">
            <Plus size={20} />
            Nouveau fournisseur
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-primary">
            <Users size={32} />
          </div>
          <div className="stat-title">Total Fournisseurs</div>
          <div className="stat-value text-primary">{suppliers.length}</div>
          <div className="stat-desc">{activeSuppliers} actifs</div>
        </div>

        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-warning">
            <Star size={32} />
          </div>
          <div className="stat-title">Note moyenne</div>
          <div className="stat-value text-warning">{avgRating}</div>
          <div className="stat-desc">Sur 5 étoiles</div>
        </div>

        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-success">
            <DollarSign size={32} />
          </div>
          <div className="stat-title">Dépenses totales</div>
          <div className="stat-value text-success">
            {totalSpent.toLocaleString()} FCFA
          </div>
          <div className="stat-desc">Tous fournisseurs</div>
        </div>

        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-info">
            <Package size={32} />
          </div>
          <div className="stat-title">Produits fournis</div>
          <div className="stat-value text-info">
            {suppliers.reduce((sum, s) => sum + s.productsSupplied, 0)}
          </div>
          <div className="stat-desc">Au catalogue</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="form-control">
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Rechercher par nom, email ou adresse..."
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

            {/* Category Filter */}
            <div className="form-control w-full md:w-48">
              <select
                className="select select-bordered"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">Toutes catégories</option>
                {categories.slice(1).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* View Toggle */}
            <div className="btn-group">
              <button
                className={`btn ${viewMode === "grid" ? "btn-active" : ""}`}
                onClick={() => setViewMode("grid")}
              >
                Grille
              </button>
              <button
                className={`btn ${viewMode === "list" ? "btn-active" : ""}`}
                onClick={() => setViewMode("list")}
              >
                Liste
              </button>
            </div>
          </div>

          {/* Active Filters */}
          {(selectedCategory !== "all" || searchQuery) && (
            <div className="flex items-center gap-2 mt-4">
              <span className="text-sm text-base-content/60">
                Filtres actifs:
              </span>
              {searchQuery && (
                <div className="badge badge-primary gap-2">
                  {searchQuery}
                  <button onClick={() => setSearchQuery("")}>
                    <X size={14} />
                  </button>
                </div>
              )}
              {selectedCategory !== "all" && (
                <div className="badge badge-secondary gap-2">
                  {selectedCategory}
                  <button onClick={() => setSelectedCategory("all")}>
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Suppliers Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuppliers.map((supplier) => {
            const statusBadge = getStatusBadge(supplier.status);
            const ratingColor = getRatingColor(supplier.rating);

            return (
              <div
                key={supplier.id}
                className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="card-body">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="avatar placeholder">
                        <div className="bg-primary text-primary-content rounded-lg w-12 h-12">
                          <Building size={24} />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{supplier.name}</h3>
                        <div className="badge badge-ghost badge-sm">
                          {supplier.category}
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={selectedSuppliers.includes(supplier.id)}
                      onChange={() => handleSelectSupplier(supplier.id)}
                    />
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={
                            i < Math.floor(supplier.rating)
                              ? ratingColor
                              : "text-base-content/20"
                          }
                          fill={
                            i < Math.floor(supplier.rating)
                              ? "currentColor"
                              : "none"
                          }
                        />
                      ))}
                    </div>
                    <span className={`font-semibold ${ratingColor}`}>
                      {supplier.rating}
                    </span>
                    <div
                      className={`badge ${statusBadge.class} badge-sm ml-auto`}
                    >
                      {statusBadge.text}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail size={16} className="text-base-content/60" />
                      <span className="truncate">{supplier.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone size={16} className="text-base-content/60" />
                      <span>{supplier.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin size={16} className="text-base-content/60" />
                      <span className="truncate">{supplier.address}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="stats stats-vertical shadow mt-4">
                    <div className="stat p-3">
                      <div className="stat-title text-xs">Produits</div>
                      <div className="stat-value text-lg text-primary">
                        {supplier.productsSupplied}
                      </div>
                    </div>
                    <div className="stat p-3">
                      <div className="stat-title text-xs">Commandes</div>
                      <div className="stat-value text-lg text-secondary">
                        {supplier.totalOrders}
                      </div>
                    </div>
                    <div className="stat p-3">
                      <div className="stat-title text-xs">Total dépensé</div>
                      <div className="stat-value text-lg text-success">
                        {supplier.totalSpent.toLocaleString()} FCFA
                      </div>
                    </div>
                  </div>

                  {/* Performance Indicators */}
                  <div className="space-y-2 mt-4">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-base-content/60">Fiabilité</span>
                        <span className="font-semibold">
                          {supplier.reliability}%
                        </span>
                      </div>
                      <progress
                        className="progress progress-success w-full h-2"
                        value={supplier.reliability}
                        max="100"
                      ></progress>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-base-content/60">
                        Délai livraison
                      </span>
                      <span className="font-semibold">
                        {supplier.deliveryTime} jours
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-base-content/60">Paiement</span>
                      <span className="font-semibold">
                        {supplier.paymentTerms}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="card-actions justify-end mt-4">
                    <button className="btn btn-ghost btn-sm gap-2">
                      <Eye size={16} />
                      Voir
                    </button>
                    <button className="btn btn-ghost btn-sm gap-2">
                      <Edit size={16} />
                      Modifier
                    </button>
                    <button className="btn btn-primary btn-sm gap-2">
                      <Package size={16} />
                      Commander
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Suppliers List View */}
      {viewMode === "list" && (
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            {selectedSuppliers.length > 0 && (
              <div className="alert shadow-lg mb-4">
                <div className="flex-1">
                  <span>
                    {selectedSuppliers.length} fournisseur(s) sélectionné(s)
                  </span>
                </div>
                <div className="flex-none">
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
                        checked={selectedSuppliers.length === suppliers.length}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th>Fournisseur</th>
                    <th>Contact</th>
                    <th>Catégorie</th>
                    <th>Note</th>
                    <th>Produits</th>
                    <th>Commandes</th>
                    <th>Total dépensé</th>
                    <th>Fiabilité</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSuppliers.map((supplier) => {
                    const statusBadge = getStatusBadge(supplier.status);
                    const ratingColor = getRatingColor(supplier.rating);

                    return (
                      <tr key={supplier.id} className="hover">
                        <td>
                          <input
                            type="checkbox"
                            className="checkbox checkbox-sm"
                            checked={selectedSuppliers.includes(supplier.id)}
                            onChange={() => handleSelectSupplier(supplier.id)}
                          />
                        </td>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="avatar placeholder">
                              <div className="bg-neutral-focus text-neutral-content rounded w-12 h-12">
                                <Building size={20} />
                              </div>
                            </div>
                            <div>
                              <div className="font-bold">{supplier.name}</div>
                              <div className="text-sm text-base-content/60 flex items-center gap-1">
                                <MapPin size={12} />
                                {supplier.address}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="space-y-1">
                            <div className="text-sm flex items-center gap-1">
                              <Mail
                                size={12}
                                className="text-base-content/60"
                              />
                              <span className="truncate max-w-[150px]">
                                {supplier.email}
                              </span>
                            </div>
                            <div className="text-sm flex items-center gap-1">
                              <Phone
                                size={12}
                                className="text-base-content/60"
                              />
                              {supplier.phone}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="badge badge-ghost">
                            {supplier.category}
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            <Star
                              size={16}
                              className={ratingColor}
                              fill="currentColor"
                            />
                            <span className={`font-semibold ${ratingColor}`}>
                              {supplier.rating}
                            </span>
                          </div>
                        </td>
                        <td className="font-semibold">
                          {supplier.productsSupplied}
                        </td>
                        <td className="font-semibold">
                          {supplier.totalOrders}
                        </td>
                        <td className="font-bold text-success">
                          {supplier.totalSpent.toLocaleString()} FCFA
                        </td>
                        <td>
                          <div className="w-24">
                            <div className="text-xs mb-1 text-right">
                              {supplier.reliability}%
                            </div>
                            <progress
                              className="progress progress-success w-full h-2"
                              value={supplier.reliability}
                              max="100"
                            ></progress>
                          </div>
                        </td>
                        <td>
                          <div className={`badge ${statusBadge.class}`}>
                            {statusBadge.text}
                          </div>
                        </td>
                        <td>
                          <div className="flex gap-2">
                            <button
                              className="btn btn-ghost btn-xs"
                              title="Voir"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              className="btn btn-ghost btn-xs"
                              title="Modifier"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className="btn btn-ghost btn-xs text-error"
                              title="Supprimer"
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

              {filteredSuppliers.length === 0 && (
                <div className="text-center py-12">
                  <Users
                    size={48}
                    className="mx-auto text-base-content/20 mb-4"
                  />
                  <p className="text-base-content/60">
                    Aucun fournisseur trouvé
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Top Suppliers */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h2 className="card-title mb-4">
            <Award className="text-warning" size={24} />
            Meilleurs fournisseurs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...suppliers]
              .sort((a, b) => b.reliability - a.reliability)
              .slice(0, 3)
              .map((supplier, index) => (
                <div key={supplier.id} className="stat bg-base-200 rounded-lg">
                  <div className="stat-figure text-warning">
                    <Award size={32} />
                  </div>
                  <div className="stat-title">
                    #{index + 1} - {supplier.name}
                  </div>
                  <div className="stat-value text-2xl">
                    {supplier.reliability}%
                  </div>
                  <div className="stat-desc">
                    {supplier.totalOrders} commandes • {supplier.rating} ⭐
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h2 className="card-title mb-4">
            <TrendingUp className="text-info" size={24} />
            Insights de performance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="alert alert-info">
              <AlertCircle size={20} />
              <div className="text-sm">
                <strong>Meilleur délai de livraison:</strong>{" "}
                {Math.min(...suppliers.map((s) => s.deliveryTime))} jours en
                moyenne avec{" "}
                {
                  suppliers.find(
                    (s) =>
                      s.deliveryTime ===
                      Math.min(...suppliers.map((s) => s.deliveryTime)),
                  )?.name
                }
              </div>
            </div>
            <div className="alert alert-success">
              <TrendingUp size={20} />
              <div className="text-sm">
                <strong>Fournisseur le plus fiable:</strong>{" "}
                {
                  suppliers.reduce((max, s) =>
                    s.reliability > max.reliability ? s : max,
                  ).name
                }
                avec{" "}
                {
                  suppliers.reduce((max, s) =>
                    s.reliability > max.reliability ? s : max,
                  ).reliability
                }
                % de fiabilité
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Suppliers;
