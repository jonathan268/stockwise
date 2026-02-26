import React, { useState, useEffect } from 'react';
import { Save, X, AlertCircle, Loader2, Building2, User, Mail, Phone, MapPin, CreditCard } from 'lucide-react';
import Modal from '../Modal';
import { SupplierService } from '../../../services/suppliersService';
import toast from 'react-hot-toast';

const SupplierModal = ({ isOpen, onClose, supplier, onSuccess }) => {
  const isEditMode = !!supplier;

  // ==================== STATE ====================
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('basic');

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    email: '',
    phone: '',
    website: '',
    address: {
      street: '',
      city: '',
      region: '',
      country: 'Cameroun',
      postalCode: ''
    },
    contactPerson: {
      name: '',
      position: '',
      phone: '',
      email: '',
      notes: ''
    },
    taxId: '',
    registrationNumber: '',
    paymentTerms: {
      method: 'cash',
      creditDays: 0,
      creditLimit: 0,
      currency: 'XAF'
    },
    shipping: {
      leadTime: 7,
      minimumOrderAmount: 0,
      shippingCost: 0,
      freeShippingThreshold: 0
    },
    categories: [],
    notes: '',
    internalNotes: '',
    tags: [],
    status: 'active'
  });

  const [categoryInput, setCategoryInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  // ==================== LOAD SUPPLIER DATA ====================
  useEffect(() => {
    if (supplier && isOpen) {
      setFormData({
        name: supplier.name || '',
        code: supplier.code || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        website: supplier.website || '',
        address: {
          street: supplier.address?.street || '',
          city: supplier.address?.city || '',
          region: supplier.address?.region || '',
          country: supplier.address?.country || 'Cameroun',
          postalCode: supplier.address?.postalCode || ''
        },
        contactPerson: {
          name: supplier.contactPerson?.name || '',
          position: supplier.contactPerson?.position || '',
          phone: supplier.contactPerson?.phone || '',
          email: supplier.contactPerson?.email || '',
          notes: supplier.contactPerson?.notes || ''
        },
        taxId: supplier.taxId || '',
        registrationNumber: supplier.registrationNumber || '',
        paymentTerms: {
          method: supplier.paymentTerms?.method || 'cash',
          creditDays: supplier.paymentTerms?.creditDays || 0,
          creditLimit: supplier.paymentTerms?.creditLimit || 0,
          currency: supplier.paymentTerms?.currency || 'XAF'
        },
        shipping: {
          leadTime: supplier.shipping?.leadTime || 7,
          minimumOrderAmount: supplier.shipping?.minimumOrderAmount || 0,
          shippingCost: supplier.shipping?.shippingCost || 0,
          freeShippingThreshold: supplier.shipping?.freeShippingThreshold || 0
        },
        categories: supplier.categories || [],
        notes: supplier.notes || '',
        internalNotes: supplier.internalNotes || '',
        tags: supplier.tags || [],
        status: supplier.status || 'active'
      });
    } else if (!isOpen) {
      // Reset form
      setFormData({
        name: '',
        code: '',
        email: '',
        phone: '',
        website: '',
        address: {
          street: '',
          city: '',
          region: '',
          country: 'Cameroun',
          postalCode: ''
        },
        contactPerson: {
          name: '',
          position: '',
          phone: '',
          email: '',
          notes: ''
        },
        taxId: '',
        registrationNumber: '',
        paymentTerms: {
          method: 'cash',
          creditDays: 0,
          creditLimit: 0,
          currency: 'XAF'
        },
        shipping: {
          leadTime: 7,
          minimumOrderAmount: 0,
          shippingCost: 0,
          freeShippingThreshold: 0
        },
        categories: [],
        notes: '',
        internalNotes: '',
        tags: [],
        status: 'active'
      });
      setErrors({});
      setActiveTab('basic');
    }
  }, [supplier, isOpen]);

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
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // ==================== CATEGORIES ====================
  const handleAddCategory = () => {
    if (categoryInput.trim() && !formData.categories.includes(categoryInput.trim())) {
      setFormData(prev => ({
        ...prev,
        categories: [...prev.categories, categoryInput.trim()]
      }));
      setCategoryInput('');
    }
  };

  const handleRemoveCategory = (category) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c !== category)
    }));
  };

  // ==================== TAGS ====================
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim().toLowerCase())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim().toLowerCase()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  // ==================== VALIDATION ====================
  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }

    if (formData.email && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (formData.contactPerson.email && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.contactPerson.email)) {
      newErrors['contactPerson.email'] = 'Email invalide';
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
      // Préparer les données
      const dataToSend = {
        ...formData,
        paymentTerms: {
          ...formData.paymentTerms,
          creditDays: parseInt(formData.paymentTerms.creditDays),
          creditLimit: parseFloat(formData.paymentTerms.creditLimit)
        },
        shipping: {
          leadTime: parseInt(formData.shipping.leadTime),
          minimumOrderAmount: parseFloat(formData.shipping.minimumOrderAmount),
          shippingCost: parseFloat(formData.shipping.shippingCost),
          freeShippingThreshold: parseFloat(formData.shipping.freeShippingThreshold)
        }
      };

      if (isEditMode) {
        await SupplierService.updateSupplier(supplier._id, dataToSend);
        toast.success('Fournisseur mis à jour avec succès');
      } else {
        await SupplierService.createSupplier(dataToSend);
        toast.success('Fournisseur créé avec succès');
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Erreur sauvegarde fournisseur:', err);
      toast.error(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  // ==================== RENDER ====================
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Tabs */}
        <div className="tabs tabs-boxed">
          <button
            type="button"
            className={`tab ${activeTab === 'basic' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('basic')}
          >
            <Building2 size={16} className="mr-2" />
            Informations de base
          </button>
          <button
            type="button"
            className={`tab ${activeTab === 'contact' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('contact')}
          >
            <User size={16} className="mr-2" />
            Contact
          </button>
          <button
            type="button"
            className={`tab ${activeTab === 'commercial' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('commercial')}
          >
            <CreditCard size={16} className="mr-2" />
            Commercial
          </button>
        </div>

        {/* Tab: Informations de base */}
        {activeTab === 'basic' && (
          <div className="space-y-4">
            <h4 className="font-semibold text-lg border-b pb-2">Informations de base</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nom */}
              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text font-medium">
                    Nom du fournisseur <span className="text-error">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ex: Société CAMLAIT"
                  className={`input input-bordered w-full ${errors.name ? 'input-error' : ''}`}
                  disabled={loading}
                />
                {errors.name && (
                  <label className="label">
                    <span className="label-text-alt text-error flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.name}
                    </span>
                  </label>
                )}
              </div>

              {/* Code */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Code</span>
                  <span className="label-text-alt text-gray-500">Auto-généré si vide</span>
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="SUP-001"
                  className="input input-bordered w-full"
                  disabled={loading}
                />
              </div>

              {/* Statut */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Statut</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="select select-bordered"
                  disabled={loading}
                >
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                  <option value="blacklisted">Liste noire</option>
                </select>
              </div>

              {/* Email */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Email</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contact@fournisseur.com"
                  className={`input input-bordered w-full ${errors.email ? 'input-error' : ''}`}
                  disabled={loading}
                />
                {errors.email && (
                  <label className="label">
                    <span className="label-text-alt text-error flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.email}
                    </span>
                  </label>
                )}
              </div>

              {/* Téléphone */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Téléphone</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+237 6XX XX XX XX"
                  className="input input-bordered w-full"
                  disabled={loading}
                />
              </div>

              {/* Site web */}
              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text font-medium">Site web</span>
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://www.fournisseur.com"
                  className="input input-bordered w-full"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Adresse */}
            <div className="space-y-3">
              <h5 className="font-semibold flex items-center gap-2">
                <MapPin size={18} />
                Adresse
              </h5>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control md:col-span-2">
                  <label className="label">
                    <span className="label-text">Rue</span>
                  </label>
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    placeholder="123 Rue de..."
                    className="input input-bordered w-full"
                    disabled={loading}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Ville</span>
                  </label>
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    placeholder="Douala"
                    className="input input-bordered w-full"
                    disabled={loading}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Région</span>
                  </label>
                  <input
                    type="text"
                    name="address.region"
                    value={formData.address.region}
                    onChange={handleChange}
                    placeholder="Littoral"
                    className="input input-bordered w-full"
                    disabled={loading}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Pays</span>
                  </label>
                  <input
                    type="text"
                    name="address.country"
                    value={formData.address.country}
                    onChange={handleChange}
                    placeholder="Cameroun"
                    className="input input-bordered w-full"
                    disabled={loading}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Code postal</span>
                  </label>
                  <input
                    type="text"
                    name="address.postalCode"
                    value={formData.address.postalCode}
                    onChange={handleChange}
                    placeholder="12345"
                    className="input input-bordered w-full"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Catégories */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Catégories de produits</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCategory())}
                  placeholder="Ajouter une catégorie..."
                  className="input input-bordered flex-1"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="btn btn-primary"
                  disabled={loading}
                >
                  Ajouter
                </button>
              </div>
              {formData.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.categories.map((category, index) => (
                    <div key={index} className="badge badge-primary gap-2">
                      {category}
                      <button
                        type="button"
                        onClick={() => handleRemoveCategory(category)}
                        className="btn btn-ghost btn-xs btn-circle"
                        disabled={loading}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Tags</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="Ajouter un tag..."
                  className="input input-bordered flex-1"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  Ajouter
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, index) => (
                    <div key={index} className="badge badge-secondary gap-2">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="btn btn-ghost btn-xs btn-circle"
                        disabled={loading}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Contact */}
        {activeTab === 'contact' && (
          <div className="space-y-4">
            <h4 className="font-semibold text-lg border-b pb-2">Personne de contact</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Nom complet</span>
                </label>
                <input
                  type="text"
                  name="contactPerson.name"
                  value={formData.contactPerson.name}
                  onChange={handleChange}
                  placeholder="Jean Dupont"
                  className="input input-bordered w-full"
                  disabled={loading}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Poste</span>
                </label>
                <input
                  type="text"
                  name="contactPerson.position"
                  value={formData.contactPerson.position}
                  onChange={handleChange}
                  placeholder="Directeur commercial"
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
                  name="contactPerson.phone"
                  value={formData.contactPerson.phone}
                  onChange={handleChange}
                  placeholder="+237 6XX XX XX XX"
                  className="input input-bordered w-full"
                  disabled={loading}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Email</span>
                </label>
                <input
                  type="email"
                  name="contactPerson.email"
                  value={formData.contactPerson.email}
                  onChange={handleChange}
                  placeholder="jean.dupont@fournisseur.com"
                  className={`input input-bordered w-full ${errors['contactPerson.email'] ? 'input-error' : ''}`}
                  disabled={loading}
                />
                {errors['contactPerson.email'] && (
                  <label className="label">
                    <span className="label-text-alt text-error flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors['contactPerson.email']}
                    </span>
                  </label>
                )}
              </div>

              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text font-medium">Notes</span>
                </label>
                <textarea
                  name="contactPerson.notes"
                  value={formData.contactPerson.notes}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Notes additionnelles..."
                  className="textarea textarea-bordered"
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab: Commercial */}
        {activeTab === 'commercial' && (
          <div className="space-y-6">
            {/* Informations fiscales */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg border-b pb-2">Informations fiscales</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Numéro fiscal</span>
                  </label>
                  <input
                    type="text"
                    name="taxId"
                    value={formData.taxId}
                    onChange={handleChange}
                    placeholder="M123456789"
                    className="input input-bordered w-full"
                    disabled={loading}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Numéro d'enregistrement</span>
                  </label>
                  <input
                    type="text"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    placeholder="RC/DLA/2023/B/1234"
                    className="input input-bordered w-full"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Conditions de paiement */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg border-b pb-2">Conditions de paiement</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Méthode de paiement</span>
                  </label>
                  <select
                    name="paymentTerms.method"
                    value={formData.paymentTerms.method}
                    onChange={handleChange}
                    className="select select-bordered"
                    disabled={loading}
                  >
                    <option value="cash">Espèces</option>
                    <option value="credit">Crédit</option>
                    <option value="mobile_money">Mobile Money</option>
                    <option value="bank_transfer">Virement bancaire</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Devise</span>
                  </label>
                  <select
                    name="paymentTerms.currency"
                    value={formData.paymentTerms.currency}
                    onChange={handleChange}
                    className="select select-bordered"
                    disabled={loading}
                  >
                    <option value="XAF">FCFA</option>
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Délai de crédit (jours)</span>
                  </label>
                  <input
                    type="number"
                    name="paymentTerms.creditDays"
                    value={formData.paymentTerms.creditDays}
                    onChange={handleChange}
                    min="0"
                    placeholder="30"
                    className="input input-bordered w-full"
                    disabled={loading}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Limite de crédit (FCFA)</span>
                  </label>
                  <input
                    type="number"
                    name="paymentTerms.creditLimit"
                    value={formData.paymentTerms.creditLimit}
                    onChange={handleChange}
                    min="0"
                    placeholder="1000000"
                    className="input input-bordered w-full"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Conditions de livraison */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg border-b pb-2">Conditions de livraison</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Délai de livraison (jours)</span>
                  </label>
                  <input
                    type="number"
                    name="shipping.leadTime"
                    value={formData.shipping.leadTime}
                    onChange={handleChange}
                    min="0"
                    placeholder="7"
                    className="input input-bordered w-full"
                    disabled={loading}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Montant minimum (FCFA)</span>
                  </label>
                  <input
                    type="number"
                    name="shipping.minimumOrderAmount"
                    value={formData.shipping.minimumOrderAmount}
                    onChange={handleChange}
                    min="0"
                    placeholder="50000"
                    className="input input-bordered w-full"
                    disabled={loading}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Frais de livraison (FCFA)</span>
                  </label>
                  <input
                    type="number"
                    name="shipping.shippingCost"
                    value={formData.shipping.shippingCost}
                    onChange={handleChange}
                    min="0"
                    placeholder="5000"
                    className="input input-bordered w-full"
                    disabled={loading}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Seuil livraison gratuite (FCFA)</span>
                  </label>
                  <input
                    type="number"
                    name="shipping.freeShippingThreshold"
                    value={formData.shipping.freeShippingThreshold}
                    onChange={handleChange}
                    min="0"
                    placeholder="100000"
                    className="input input-bordered w-full"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Notes publiques</span>
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Notes visibles dans les documents..."
                  className="textarea textarea-bordered"
                  disabled={loading}
                  maxLength={2000}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Notes internes</span>
                </label>
                <textarea
                  name="internalNotes"
                  value={formData.internalNotes}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Notes internes (non visibles par le fournisseur)..."
                  className="textarea textarea-bordered"
                  disabled={loading}
                  maxLength={2000}
                />
              </div>
            </div>
          </div>
        )}

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
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save size={20} />
                {isEditMode ? 'Mettre à jour' : 'Créer le fournisseur'}
              </>
            )}
          </button>
        </div>

      </form>
    </Modal>
  );
};

export default SupplierModal;