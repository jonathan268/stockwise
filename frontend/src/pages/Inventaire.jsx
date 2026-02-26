import React, { useState, useEffect } from "react";
import {
  Package,
  Search,
  Plus,
  Filter,
  Download,
  Upload,
  Edit,
  Trash2,
  Eye,
  Box,
  ChevronDown,
  X,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { ProductService } from "../services/productService";
import ProductModal from "../components/common/Inventory/ProductModal";
import ProductDetailsModal from "../components/common/Inventory/ProductDetailsModal";
import ImportExportButtons from "../components/common/Inventory/ImportExportButtons";
import toast from "react-hot-toast";

const Inventory = () => {
  // ==================== STATE ====================
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [showProductModal, setShowProductModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ==================== FETCH PRODUCTS ====================
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await ProductService.getAllProducts();

      // Extraire le tableau de produits selon la structure de la réponse API
      let productsData = [];

      if (response) {
        if (Array.isArray(response)) {
          // Cas : l'API retourne directement un tableau
          productsData = response;
        } else if (Array.isArray(response.data)) {
          // Cas : { success: true, data: [...] }
          productsData = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          // Cas paginé Node : { success: true, data: { data: [...], total: 50 } }
          productsData = response.data.data;
        } else if (response.data && Array.isArray(response.data.products)) {
          // Cas : { data: { products: [...] } }
          productsData = response.data.products;
        }
      }

      // Filtrer les produits invalides
      const validProducts = productsData.filter(p => p && typeof p === 'object');
      setProducts(validProducts);
    } catch (err) {
      console.error("Erreur chargement produits:", err);
      setError(err.message || "Erreur lors du chargement des produits");
      toast.error("Erreur lors du chargement des produits");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // ==================== EFFECTS ====================
  useEffect(() => {
    fetchProducts();
  }, []);

  // ==================== REFRESH ====================
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
    toast.success("Inventaire actualisé");
  };

  // ==================== MODAL HANDLERS ====================
  const handleAddProduct = () => {
    setSelectedProduct(null);
    setShowProductModal(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setShowDetailsModal(true);
  };

  const handleProductSaved = () => {
    fetchProducts();
  };

  // ==================== DELETE PRODUCT ====================
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      return;
    }

    try {
      await ProductService.deleteProduct(productId);

      setProducts(products.filter((p) => p._id !== productId));
      setSelectedProducts(selectedProducts.filter((id) => id !== productId));

      toast.success("Produit supprimé avec succès");
    } catch (err) {
      console.error("Erreur suppression produit:", err);
      toast.error("Erreur lors de la suppression du produit");
    }
  };

  // ==================== DELETE MULTIPLE ====================
  const handleDeleteSelected = async () => {
    if (
      !window.confirm(
        `Voulez-vous vraiment supprimer ${selectedProducts.length} produit(s) ?`,
      )
    ) {
      return;
    }

    const loadingToast = toast.loading("Suppression en cours...");

    try {
      await Promise.all(
        selectedProducts.map((id) => ProductService.deleteProduct(id)),
      );

      setProducts(products.filter((p) => !selectedProducts.includes(p._id)));
      setSelectedProducts([]);

      toast.success("Produits supprimés avec succès", { id: loadingToast });
    } catch (err) {
      console.error("Erreur suppression multiple:", err);
      toast.error("Erreur lors de la suppression", { id: loadingToast });
    }
  };

  // ==================== STATUS BADGE ====================
  const getStatusBadge = (product) => {
    if (!product || !product.stock) {
      return { class: "badge-ghost", text: "Non défini" };
    }

    const quantity = product.stock.quantity || 0;
    const minThreshold = product.stock.minThreshold || 0;

    if (quantity === 0) {
      return { class: "badge-ghost", text: "Rupture" };
    } else if (quantity <= minThreshold / 2) {
      return { class: "badge-error", text: "Critique" };
    } else if (quantity <= minThreshold) {
      return { class: "badge-warning", text: "Stock bas" };
    } else {
      return { class: "badge-success", text: "En stock" };
    }
  };

  // ==================== STATS CALCULATIONS ====================
  const calculateStats = () => {
    // Sécurité : s'assurer que products est toujours un tableau
    const safeProducts = Array.isArray(products) ? products : [];
    const totalProducts = safeProducts.length;

    const totalValue = safeProducts.reduce((sum, p) => {
      if (!p) return sum;
      const quantity = p.stock?.quantity || 0;
      const price = p.pricing?.sellingPrice || 0;
      return sum + price * quantity;
    }, 0);

    const lowStockCount = safeProducts.filter((p) => {
      if (!p || !p.stock) return false;
      const quantity = p.stock.quantity || 0;
      const minThreshold = p.stock.minThreshold || 0;
      return quantity > 0 && quantity <= minThreshold;
    }).length;

    const outOfStockCount = safeProducts.filter((p) => {
      if (!p || !p.stock) return false;
      const quantity = p.stock.quantity || 0;
      return quantity === 0;
    }).length;

    return {
      totalProducts,
      totalValue,
      lowStockCount,
      outOfStockCount,
    };
  };

  const stats = calculateStats();

  // ==================== FILTERING ====================
  const filteredProducts = products.filter((product) => {
    // Vérification que le produit est valide
    if (!product) return false;

    // Recherche - CORRECTION DE L'ERREUR PRINCIPALE
    const matchSearch =
      (product.name && product.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));

    // Catégorie
    const matchCategory =
      filterCategory === "all" ||
      (product.category && product.category.name === filterCategory);

    // Statut
    let matchStatus = true;
    if (filterStatus !== "all") {
      const status = getStatusBadge(product);
      const statusMap = {
        in_stock: "En stock",
        low_stock: "Stock bas",
        critical: "Critique",
        out_of_stock: "Rupture",
      };
      matchStatus = status.text === statusMap[filterStatus];
    }

    return matchSearch && matchCategory && matchStatus;
  });

  // ==================== CATEGORIES ====================
  const categories = [
    ...new Set(
      products
        .filter(p => p && p.category && p.category.name)
        .map((p) => p.category.name)
    ),
  ];

  // ==================== PAGINATION ====================
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Réinitialiser à la page 1 si on filtre et qu'on dépasse le nombre de pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredProducts.length, currentPage, totalPages]);

  // ==================== SELECTION ====================
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProducts(paginatedProducts.map((p) => p._id).filter(Boolean));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (id) => {
    if (selectedProducts.includes(id)) {
      setSelectedProducts(selectedProducts.filter((pId) => pId !== id));
    } else {
      setSelectedProducts([...selectedProducts, id]);
    }
  };

  // ==================== RENDER LOADING ====================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-base-content/60">
            Chargement de l'inventaire...
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
              <button className="btn btn-primary" onClick={fetchProducts}>
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
            Inventaire
          </h1>
          <p className="text-base-content/60 mt-1">
            Gérez vos produits et votre stock
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
          <ImportExportButtons products={products} onImportSuccess={fetchProducts} />
          <button className="btn btn-primary gap-2" onClick={handleAddProduct}>
            <Plus size={20} />
            Ajouter
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-primary">
            <Package size={32} />
          </div>
          <div className="stat-title">Total Produits</div>
          <div className="stat-value text-primary">{stats.totalProducts}</div>
          <div className="stat-desc">Dans votre inventaire</div>
        </div>

        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-success">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block w-8 h-8 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              ></path>
            </svg>
          </div>
          <div className="stat-title">Valeur Totale</div>
          <div className="stat-value text-success text-2xl">
            {stats.totalValue.toLocaleString("fr-FR")}
          </div>
          <div className="stat-desc">FCFA</div>
        </div>

        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-warning">
            <AlertCircle size={32} />
          </div>
          <div className="stat-title">Alertes</div>
          <div className="stat-value text-warning">{stats.lowStockCount}</div>
          <div className="stat-desc">Stock bas</div>
        </div>

        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-error">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block w-8 h-8 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </div>
          <div className="stat-title">Ruptures</div>
          <div className="stat-value text-error">{stats.outOfStockCount}</div>
          <div className="stat-desc">Produits en rupture</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="form-control">
              <div className="input-group">
                <span className="bg-base-200">
                  <Search size={20} />
                </span>
                <input
                  type="text"
                  placeholder="Rechercher par nom, SKU..."
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

            {/* Category Filter */}
            <div className="form-control">
              <select
                className="select select-bordered"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">Toutes les catégories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="form-control">
              <select
                className="select select-bordered"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Tous les statuts</option>
                <option value="in_stock">En stock</option>
                <option value="low_stock">Stock bas</option>
                <option value="critical">Critique</option>
                <option value="out_of_stock">Rupture</option>
              </select>
            </div>
          </div>

          {/* Active Filters */}
          {(searchQuery || filterCategory !== "all" || filterStatus !== "all") && (
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="text-sm text-base-content/60">
                Filtres actifs:
              </span>
              {searchQuery && (
                <div className="badge badge-primary gap-2">
                  Recherche: {searchQuery}
                  <button onClick={() => setSearchQuery("")}>
                    <X size={12} />
                  </button>
                </div>
              )}
              {filterCategory !== "all" && (
                <div className="badge badge-secondary gap-2">
                  Catégorie: {filterCategory}
                  <button onClick={() => setFilterCategory("all")}>
                    <X size={12} />
                  </button>
                </div>
              )}
              {filterStatus !== "all" && (
                <div className="badge badge-accent gap-2">
                  Statut: {filterStatus}
                  <button onClick={() => setFilterStatus("all")}>
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Selected Products Alert */}
      {selectedProducts.length > 0 && (
        <div className="alert alert-info shadow-lg">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="stroke-current flex-shrink-0 w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span>
              {selectedProducts.length} produit(s) sélectionné(s)
            </span>
          </div>
          <div className="flex-none">
            <button
              className="btn btn-sm btn-error gap-2"
              onClick={handleDeleteSelected}
            >
              <Trash2 size={16} />
              Supprimer la sélection
            </button>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={
                        paginatedProducts.length > 0 &&
                        selectedProducts.length === paginatedProducts.length
                      }
                      disabled={paginatedProducts.length === 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>Produit</th>
                  <th>SKU</th>
                  <th>Catégorie</th>
                  <th>Quantité</th>
                  <th>Prix</th>
                  <th>Valeur</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map((product) => {
                  if (!product || !product._id) return null;

                  const statusBadge = getStatusBadge(product);
                  const quantity = product.stock?.quantity || 0;
                  const minThreshold = product.stock?.minThreshold || 0;
                  const price = product.pricing?.sellingPrice || 0;
                  const totalValue = price * quantity;

                  return (
                    <tr key={product._id} className="hover">
                      <td>
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm"
                          checked={selectedProducts.includes(product._id)}
                          onChange={() => handleSelectProduct(product._id)}
                        />
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar placeholder">
                            <div className="bg-neutral-focus text-neutral-content rounded w-12 h-12">
                              {product.image?.url ? (
                                <img
                                  src={product.image.url}
                                  alt={product.name || "Produit"}
                                />
                              ) : (
                                <Box size={20} />
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="font-bold">{product.name || "Sans nom"}</div>
                            {product.description && (
                              <div className="text-sm text-base-content/60 truncate max-w-xs">
                                {product.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="font-mono text-sm">
                          {product.sku || "N/A"}
                        </span>
                      </td>
                      <td>
                        <div className="badge badge-ghost">
                          {product.category?.name || "Sans catégorie"}
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-col">
                          <span className="font-bold">{quantity}</span>
                          <span className="text-xs text-base-content/60">
                            Seuil: {minThreshold}
                          </span>
                        </div>
                      </td>
                      <td className="font-semibold">
                        {price.toLocaleString("fr-FR")} FCFA
                      </td>
                      <td className="font-semibold text-success">
                        {totalValue.toLocaleString("fr-FR")} FCFA
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
                            onClick={() => handleViewDetails(product)}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="btn btn-ghost btn-xs"
                            title="Modifier"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="btn btn-ghost btn-xs text-error"
                            title="Supprimer"
                            onClick={() => handleDeleteProduct(product._id)}
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
            {paginatedProducts.length === 0 && (
              <div className="text-center py-12">
                <Package
                  size={48}
                  className="mx-auto text-base-content/20 mb-4"
                />
                <p className="text-base-content/60">
                  {products.length === 0
                    ? "Aucun produit dans votre inventaire"
                    : "Aucun produit trouvé avec ces filtres"}
                </p>
                {products.length === 0 && (
                  <button
                    className="btn btn-primary mt-4 gap-2"
                    onClick={handleAddProduct}
                  >
                    <Plus size={20} />
                    Ajouter votre premier produit
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredProducts.length > itemsPerPage && (
            <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4">
              <div className="text-sm text-base-content/60">
                Affichage de {(currentPage - 1) * itemsPerPage + 1} à{" "}
                {Math.min(currentPage * itemsPerPage, filteredProducts.length)}{" "}
                sur {filteredProducts.length} produits
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
                  // Afficher uniquement certaines pages
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
      <ProductModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        product={selectedProduct}
        onSuccess={handleProductSaved}
      />

      <ProductDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        product={selectedProduct}
      />
    </div>
  );
};

export default Inventory;