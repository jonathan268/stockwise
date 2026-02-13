import React, { useState } from 'react';
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
  X
} from 'lucide-react';

const Inventory = () => {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Données de produits
  const products = [
    { id: 1, name: 'iPhone 14 Pro', sku: 'IPH14PRO-128', category: 'Smartphones', quantity: 45, threshold: 20, price: 1099, status: 'in_stock', image: null },
    { id: 2, name: 'MacBook Air M2', sku: 'MBA-M2-256', category: 'Ordinateurs', quantity: 8, threshold: 10, price: 1299, status: 'low_stock', image: null },
    { id: 3, name: 'Samsung Galaxy S23', sku: 'SGS23-256', category: 'Smartphones', quantity: 32, threshold: 15, price: 899, status: 'in_stock', image: null },
    { id: 4, name: 'iPad Pro 12.9', sku: 'IPD-PRO-129', category: 'Tablettes', quantity: 2, threshold: 8, price: 1199, status: 'critical', image: null },
    { id: 5, name: 'Dell XPS 15', sku: 'DXPS15-512', category: 'Ordinateurs', quantity: 15, threshold: 12, price: 1599, status: 'in_stock', image: null },
    { id: 6, name: 'AirPods Pro', sku: 'APP-GEN2', category: 'Accessoires', quantity: 67, threshold: 30, price: 249, status: 'in_stock', image: null },
    { id: 7, name: 'Logitech MX Master', sku: 'LGT-MXM3', category: 'Accessoires', quantity: 5, threshold: 15, price: 99, status: 'low_stock', image: null },
    { id: 8, name: 'Samsung Monitor 27"', sku: 'SAM-M27-4K', category: 'Écrans', quantity: 0, threshold: 8, price: 399, status: 'out_of_stock', image: null },
  ];

  const categories = ['all', 'Smartphones', 'Ordinateurs', 'Tablettes', 'Accessoires', 'Écrans'];
  const statuses = ['all', 'in_stock', 'low_stock', 'critical', 'out_of_stock'];

  const getStatusBadge = (status) => {
    const badges = {
      in_stock: { class: 'badge-success', text: 'En stock' },
      low_stock: { class: 'badge-warning', text: 'Stock bas' },
      critical: { class: 'badge-error', text: 'Critique' },
      out_of_stock: { class: 'badge-ghost', text: 'Rupture' }
    };
    return badges[status] || badges.in_stock;
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProducts(products.map(p => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (id) => {
    if (selectedProducts.includes(id)) {
      setSelectedProducts(selectedProducts.filter(pId => pId !== id));
    } else {
      setSelectedProducts([...selectedProducts, id]);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = filterCategory === 'all' || product.category === filterCategory;
    const matchStatus = filterStatus === 'all' || product.status === filterStatus;
    return matchSearch && matchCategory && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Package size={32} className="text-primary" />
            Inventaire
          </h1>
          <p className="text-base-content/60 mt-1">
            Gérez vos produits et suivez votre stock
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
            Ajouter un produit
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-title">Total Produits</div>
          <div className="stat-value text-primary">{products.length}</div>
          <div className="stat-desc">Dans l'inventaire</div>
        </div>
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-title">Valeur Totale</div>
          <div className="stat-value text-success">
            {products.reduce((sum, p) => sum + (p.price * p.quantity), 0).toLocaleString()} FCFA
          </div>
          <div className="stat-desc">Stock actuel</div>
        </div>
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-title">Alertes</div>
          <div className="stat-value text-warning">
            {products.filter(p => p.status === 'low_stock' || p.status === 'critical').length}
          </div>
          <div className="stat-desc">Stock bas ou critique</div>
        </div>
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-title">Ruptures</div>
          <div className="stat-value text-error">
            {products.filter(p => p.status === 'out_of_stock').length}
          </div>
          <div className="stat-desc">Produits en rupture</div>
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
                    placeholder="Rechercher par nom ou SKU..."
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

            {/* Category Filter */}
            <div className="form-control w-full md:w-48">
              <select 
                className="select select-bordered"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">Toutes catégories</option>
                {categories.slice(1).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="form-control w-full md:w-48">
              <select 
                className="select select-bordered"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Tous statuts</option>
                <option value="in_stock">En stock</option>
                <option value="low_stock">Stock bas</option>
                <option value="critical">Critique</option>
                <option value="out_of_stock">Rupture</option>
              </select>
            </div>
          </div>

          {/* Active Filters */}
          {(filterCategory !== 'all' || filterStatus !== 'all' || searchQuery) && (
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
              {filterCategory !== 'all' && (
                <div className="badge badge-secondary gap-2">
                  {filterCategory}
                  <button onClick={() => setFilterCategory('all')}>
                    <X size={14} />
                  </button>
                </div>
              )}
              {filterStatus !== 'all' && (
                <div className="badge badge-accent gap-2">
                  {getStatusBadge(filterStatus).text}
                  <button onClick={() => setFilterStatus('all')}>
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          {selectedProducts.length > 0 && (
            <div className="alert shadow-lg mb-4">
              <div className="flex-1">
                <span>{selectedProducts.length} produit(s) sélectionné(s)</span>
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
                      checked={selectedProducts.length === products.length}
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
                {filteredProducts.map((product) => {
                  const statusBadge = getStatusBadge(product.status);
                  return (
                    <tr key={product.id} className="hover">
                      <td>
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => handleSelectProduct(product.id)}
                        />
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar placeholder">
                            <div className="bg-neutral-focus text-neutral-content rounded w-12 h-12">
                              <Box size={20} />
                            </div>
                          </div>
                          <div>
                            <div className="font-bold">{product.name}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="font-mono text-sm">{product.sku}</span>
                      </td>
                      <td>
                        <div className="badge badge-ghost">{product.category}</div>
                      </td>
                      <td>
                        <div className="flex flex-col">
                          <span className="font-bold">{product.quantity}</span>
                          <span className="text-xs text-base-content/60">Seuil: {product.threshold}</span>
                        </div>
                      </td>
                      <td className="font-semibold">{product.price} FCFA</td>
                      <td className="font-semibold text-success">
                        {(product.price * product.quantity).toLocaleString()} FACFA
                      </td>
                      <td>
                        <div className={`badge ${statusBadge.class}`}>
                          {statusBadge.text}
                        </div>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button className="btn btn-ghost btn-xs" title="Voir">
                            <Eye size={16} />
                          </button>
                          <button className="btn btn-ghost btn-xs" title="Modifier">
                            <Edit size={16} />
                          </button>
                          <button className="btn btn-ghost btn-xs text-error" title="Supprimer">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <Package size={48} className="mx-auto text-base-content/20 mb-4" />
                <p className="text-base-content/60">Aucun produit trouvé</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredProducts.length > 0 && (
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

export default Inventory;