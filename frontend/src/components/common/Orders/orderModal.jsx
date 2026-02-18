import React, { useState, useEffect } from 'react';
import { Save, X, Plus, Trash2, AlertCircle, Loader2, Search } from 'lucide-react';
import Modal from '../common/Modal';
import { OrderService } from '../../services/orderService';
import { ProductService } from '../../services/productService';
import { SupplierService } from '../../services/supplierService';
import toast from 'react-hot-toast';

const OrderModal = ({ isOpen, onClose, order, onSuccess }) => {
  const isEditMode = !!order;

  // ==================== STATE ====================
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    type: 'sale',
    supplier: '',
    customer: {
      name: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        country: 'Cameroun',
        postalCode: ''
      }
    },
    items: [],
    totals: {
      discountPercentage: 0,
      shipping: 0
    },
    paymentMethod: 'cash',
    delivery: {
      method: 'pickup'
    },
    notes: ''
  });

  const [searchProduct, setSearchProduct] = useState('');
  const [showProductSearch, setShowProductSearch] = useState(false);

  // ==================== LOAD DATA ====================
  useEffect(() => {
    const loadData = async () => {
      if (!isOpen) return;

      try {
        setLoadingData(true);
        
        const [productsRes, suppliersRes] = await Promise.all([
          ProductService.getAllProducts(),
          SupplierService.getAllSuppliers()
        ]);

        if (productsRes.success && productsRes.data) {
          setProducts(productsRes.data);
        }

        if (suppliersRes.success && suppliersRes.data) {
          setSuppliers(suppliersRes.data);
        }
      } catch (err) {
        console.error('Erreur chargement données:', err);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [isOpen]);

  // ==================== LOAD ORDER DATA ====================
  useEffect(() => {
    if (order && isOpen) {
      setFormData({
        type: order.type || 'sale',
        supplier: order.supplier?._id || '',
        customer: {
          name: order.customer?.name || '',
          email: order.customer?.email || '',
          phone: order.customer?.phone || '',
          address: {
            street: order.customer?.address?.street || '',
            city: order.customer?.address?.city || '',
            country: order.customer?.address?.country || 'Cameroun',
            postalCode: order.customer?.address?.postalCode || ''
          }
        },
        items: order.items?.map(item => ({
          product: item.product?._id || item.product,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount || 0,
          taxRate: item.taxRate || 0
        })) || [],
        totals: {
          discountPercentage: order.totals?.discountPercentage || 0,
          shipping: order.totals?.shipping || 0
        },
        paymentMethod: order.paymentMethod || 'cash',
        delivery: {
          method: order.delivery?.method || 'pickup'
        },
        notes: order.notes || ''
      });
    } else if (!isOpen) {
      // Reset form
      setFormData({
        type: 'sale',
        supplier: '',
        customer: {
          name: '',
          email: '',
          phone: '',
          address: {
            street: '',
            city: '',
            country: 'Cameroun',
            postalCode: ''
          }
        },
        items: [],
        totals: {
          discountPercentage: 0,
          shipping: 0
        },
        paymentMethod: 'cash',
        delivery: {
          method: 'pickup'
        },
        notes: ''
      });
      setErrors({});
    }
  }, [order, isOpen]);

  // ==================== HANDLE CHANGE ====================
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const parts = name.split('.');
      if (parts.length === 2) {
        const [parent, child] = parts;
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        }));
      } else if (parts.length === 3) {
        const [parent, middle, child] = parts;
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [middle]: {
              ...prev[parent][middle],
              [child]: value
            }
          }
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // ==================== ITEMS MANAGEMENT ====================
  const addItem = (product) => {
    const existingIndex = formData.items.findIndex(
      item => item.product === product._id
    );

    if (existingIndex >= 0) {
      // Incrémenter quantité si déjà présent
      const newItems = [...formData.items];
      newItems[existingIndex].quantity += 1;
      setFormData(prev => ({ ...prev, items: newItems }));
    } else {
      // Ajouter nouveau
      const newItem = {
        product: product._id,
        productName: product.name,
        productSku: product.sku,
        quantity: 1,
        unitPrice: product.pricing?.sellingPrice || 0,
        discount: 0,
        taxRate: product.pricing?.taxRate || 0
      };

      setFormData(prev => ({
        ...prev,
        items: [...prev.items, newItem]
      }));
    }

    setSearchProduct('');
    setShowProductSearch(false);
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = parseFloat(value) || 0;
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  // ==================== CALCULATIONS ====================
  const calculateItemTotal = (item) => {
    const subtotal = item.quantity * item.unitPrice;
    const discountAmount = (subtotal * item.discount) / 100;
    const subtotalAfterDiscount = subtotal - discountAmount;
    const taxAmount = (subtotalAfterDiscount * item.taxRate) / 100;
    return subtotalAfterDiscount + taxAmount;
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice);
    }, 0);

    const itemsDiscount = formData.items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      return sum + ((itemSubtotal * item.discount) / 100);
    }, 0);

    const globalDiscount = (subtotal * formData.totals.discountPercentage) / 100;
    const totalDiscount = itemsDiscount + globalDiscount;

    const tax = formData.items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      const itemDiscount = (itemSubtotal * item.discount) / 100;
      const itemTax = ((itemSubtotal - itemDiscount) * item.taxRate) / 100;
      return sum + itemTax;
    }, 0);

    const shipping = parseFloat(formData.totals.shipping) || 0;
    const total = subtotal - totalDiscount + tax + shipping;

    return {
      subtotal,
      discount: totalDiscount,
      tax,
      shipping,
      total
    };
  };

  const totals = calculateTotals();

  // ==================== VALIDATION ====================
  const validate = () => {
    const newErrors = {};

    if (formData.type === 'purchase' && !formData.supplier) {
      newErrors.supplier = 'Fournisseur requis pour un achat';
    }

    if (formData.type === 'sale' && !formData.customer.name) {
      newErrors['customer.name'] = 'Nom du client requis';
    }

    if (formData.items.length === 0) {
      newErrors.items = 'Ajoutez au moins un produit';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ==================== SUBMIT ====================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Veuillez corriger les erreurs');
      return;
    }

    setLoading(true);

    try {
      const dataToSend = {
        type: formData.type,
        ...(formData.type === 'purchase' && { supplier: formData.supplier }),
        ...(formData.type === 'sale' && { customer: formData.customer }),
        items: formData.items.map(item => ({
          product: item.product,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          taxRate: item.taxRate
        })),
        totals: {
          discountPercentage: formData.totals.discountPercentage,
          shipping: formData.totals.shipping
        },
        paymentMethod: formData.paymentMethod,
        delivery: formData.delivery,
        notes: formData.notes
      };

      if (isEditMode) {
        await OrderService.updateOrder(order._id, dataToSend);
        toast.success('Commande mise à jour avec succès');
      } else {
        await OrderService.createOrder(dataToSend);
        toast.success('Commande créée avec succès');
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Erreur sauvegarde commande:', err);
      toast.error(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  // ==================== FILTERED PRODUCTS ====================
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(searchProduct.toLowerCase()))
  );

  // ==================== RENDER ====================
  if (loadingData) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Chargement...">
        <div className="flex justify-center py-12">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Modifier la commande' : 'Nouvelle commande'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Type de commande */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Type de commande</span>
          </label>
          <div className="flex gap-4">
            <label className="label cursor-pointer flex-1 border rounded-lg p-4">
              <input
                type="radio"
                name="type"
                value="purchase"
                checked={formData.type === 'purchase'}
                onChange={handleChange}
                className="radio radio-primary"
                disabled={loading}
              />
              <span className="label-text ml-2">Achat (Fournisseur)</span>
            </label>
            <label className="label cursor-pointer flex-1 border rounded-lg p-4">
              <input
                type="radio"
                name="type"
                value="sale"
                checked={formData.type === 'sale'}
                onChange={handleChange}
                className="radio radio-primary"
                disabled={loading}
              />
              <span className="label-text ml-2">Vente (Client)</span>
            </label>
          </div>
        </div>

        {/* Fournisseur (si achat) */}
        {formData.type === 'purchase' && (
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">
                Fournisseur <span className="text-error">*</span>
              </span>
            </label>
            <select
              name="supplier"
              value={formData.supplier}
              onChange={handleChange}
              className={`select select-bordered w-full ${errors.supplier ? 'select-error' : ''}`}
              disabled={loading}
            >
              <option value="">Sélectionner un fournisseur...</option>
              {suppliers.map(supplier => (
                <option key={supplier._id} value={supplier._id}>
                  {supplier.name}
                </option>
              ))}
            </select>
            {errors.supplier && (
              <label className="label">
                <span className="label-text-alt text-error flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.supplier}
                </span>
              </label>
            )}
          </div>
        )}

        {/* Client (si vente) */}
        {formData.type === 'sale' && (
          <div className="space-y-4">
            <h4 className="font-semibold text-lg border-b pb-2">Informations client</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    Nom <span className="text-error">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  name="customer.name"
                  value={formData.customer.name}
                  onChange={handleChange}
                  placeholder="Nom du client"
                  className={`input input-bordered w-full ${errors['customer.name'] ? 'input-error' : ''}`}
                  disabled={loading}
                />
                {errors['customer.name'] && (
                  <label className="label">
                    <span className="label-text-alt text-error flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors['customer.name']}
                    </span>
                  </label>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Email</span>
                </label>
                <input
                  type="email"
                  name="customer.email"
                  value={formData.customer.email}
                  onChange={handleChange}
                  placeholder="email@exemple.com"
                  className="input input-bordered w-full"
                  disabled={loading}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Téléphone</span>
                </label>
                <input
                  type="tel"
                  name="customer.phone"
                  value={formData.customer.phone}
                  onChange={handleChange}
                  placeholder="+237 6XX XX XX XX"
                  className="input input-bordered w-full"
                  disabled={loading}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Ville</span>
                </label>
                <input
                  type="text"
                  name="customer.address.city"
                  value={formData.customer.address.city}
                  onChange={handleChange}
                  placeholder="Douala"
                  className="input input-bordered w-full"
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        )}

        {/* Articles */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-semibold text-lg">Articles</h4>
            <button
              type="button"
              onClick={() => setShowProductSearch(!showProductSearch)}
              className="btn btn-sm btn-primary gap-2"
              disabled={loading}
            >
              <Plus size={16} />
              Ajouter un produit
            </button>
          </div>

          {errors.items && (
            <div className="alert alert-error">
              <AlertCircle size={20} />
              <span>{errors.items}</span>
            </div>
          )}

          {/* Recherche produit */}
          {showProductSearch && (
            <div className="card bg-base-200">
              <div className="card-body p-4">
                <div className="form-control">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchProduct}
                      onChange={(e) => setSearchProduct(e.target.value)}
                      placeholder="Rechercher un produit..."
                      className="input input-bordered w-full pl-10"
                      autoFocus
                    />
                  </div>
                </div>

                {searchProduct && (
                  <div className="max-h-60 overflow-y-auto mt-2">
                    {filteredProducts.length > 0 ? (
                      <div className="space-y-2">
                        {filteredProducts.map(product => (
                          <div
                            key={product._id}
                            onClick={() => addItem(product)}
                            className="p-3 hover:bg-base-300 rounded-lg cursor-pointer flex justify-between items-center"
                          >
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-base-content/60">
                                {product.sku} • Stock: {product.stock?.quantity || 0}
                              </div>
                            </div>
                            <div className="font-semibold">
                              {(product.pricing?.sellingPrice || 0).toLocaleString('fr-FR')} FCFA
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-base-content/60">
                        Aucun produit trouvé
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Liste des articles */}
          {formData.items.length > 0 && (
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Qté</th>
                    <th>Prix unitaire</th>
                    <th>Remise (%)</th>
                    <th>Taxe (%)</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <div className="font-medium">{item.productName}</div>
                        <div className="text-sm text-base-content/60">{item.productSku}</div>
                      </td>
                      <td>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                          min="1"
                          className="input input-bordered input-sm w-20"
                          disabled={loading}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                          min="0"
                          step="0.01"
                          className="input input-bordered input-sm w-28"
                          disabled={loading}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={item.discount}
                          onChange={(e) => updateItem(index, 'discount', e.target.value)}
                          min="0"
                          max="100"
                          className="input input-bordered input-sm w-20"
                          disabled={loading}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={item.taxRate}
                          onChange={(e) => updateItem(index, 'taxRate', e.target.value)}
                          min="0"
                          max="100"
                          className="input input-bordered input-sm w-20"
                          disabled={loading}
                        />
                      </td>
                      <td className="font-semibold">
                        {calculateItemTotal(item).toLocaleString('fr-FR')} FCFA
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="btn btn-ghost btn-xs text-error"
                          disabled={loading}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Totaux */}
        {formData.items.length > 0 && (
          <div className="card bg-base-200">
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Remise globale (%)</span>
                  </label>
                  <input
                    type="number"
                    name="totals.discountPercentage"
                    value={formData.totals.discountPercentage}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    className="input input-bordered"
                    disabled={loading}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Frais de livraison</span>
                  </label>
                  <input
                    type="number"
                    name="totals.shipping"
                    value={formData.totals.shipping}
                    onChange={handleChange}
                    min="0"
                    className="input input-bordered"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="divider"></div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Sous-total:</span>
                  <span className="font-semibold">
                    {totals.subtotal.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
                <div className="flex justify-between text-warning">
                  <span>Remise:</span>
                  <span className="font-semibold">
                    - {totals.discount.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes:</span>
                  <span className="font-semibold">
                    {totals.tax.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Livraison:</span>
                  <span className="font-semibold">
                    {totals.shipping.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
                <div className="divider my-2"></div>
                <div className="flex justify-between text-lg">
                  <span className="font-bold">TOTAL:</span>
                  <span className="font-bold text-success">
                    {totals.total.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Paiement et livraison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Mode de paiement</span>
            </label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className="select select-bordered"
              disabled={loading}
            >
              <option value="cash">Espèces</option>
              <option value="mobile_money">Mobile Money</option>
              <option value="bank_transfer">Virement bancaire</option>
              <option value="check">Chèque</option>
              <option value="credit">Crédit</option>
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Mode de livraison</span>
            </label>
            <select
              name="delivery.method"
              value={formData.delivery.method}
              onChange={handleChange}
              className="select select-bordered"
              disabled={loading}
            >
              <option value="pickup">Retrait sur place</option>
              <option value="delivery">Livraison</option>
              <option value="shipping">Expédition</option>
            </select>
          </div>
        </div>

        {/* Notes */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Notes</span>
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            placeholder="Notes additionnelles..."
            className="textarea textarea-bordered"
            disabled={loading}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost"
            disabled={loading}
          >
            <X size={20} />
            Annuler
          </button>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || formData.items.length === 0}
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save size={20} />
                {isEditMode ? 'Mettre à jour' : 'Créer la commande'}
              </>
            )}
          </button>
        </div>

      </form>
    </Modal>
  );
};

export default OrderModal;