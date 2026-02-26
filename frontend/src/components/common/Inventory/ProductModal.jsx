import React, { useState, useEffect } from "react";
import { Save, X, AlertCircle, Loader2 } from "lucide-react";
import Modal from "../Modal";
import { ProductService } from "../../../services/productService";
import { CategoryService } from "../../../services/categoryService";
import toast from "react-hot-toast";

const ProductModal = ({ isOpen, onClose, product, onSuccess }) => {
  const isEditMode = !!product;

  // ==================== STATE ====================
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
    category: "",
    unit: "piece",
    pricing: {
      cost: "",
      sellingPrice: "",
      currency: "XAF",
      taxRate: 0,
    },
    stock: {
      quantity: "",
      minThreshold: "",
      maxThreshold: "",
      location: "Principal",
    },
    metadata: {
      perishable: false,
      shelfLife: "",
      seasonal: false,
    },
  });

  // ==================== LOAD CATEGORIES ====================
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await CategoryService.getAllCategories();
        if (response.success && response.data) {
          setCategories(response.data);
        }
      } catch (err) {
        console.error("Erreur chargement catégories:", err);
        toast.error("Erreur lors du chargement des catégories");
      } finally {
        setLoadingCategories(false);
      }
    };

    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  // ==================== LOAD PRODUCT DATA ====================
  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        name: product.name || "",
        sku: product.sku || "",
        description: product.description || "",
        category: product.category?._id || "",
        unit: product.unit || "piece",
        pricing: {
          cost: product.pricing?.cost || "",
          sellingPrice: product.pricing?.sellingPrice || "",
          currency: product.pricing?.currency || "XAF",
          taxRate: product.pricing?.taxRate || 0,
        },
        stock: {
          quantity: product.stock?.quantity || "",
          minThreshold: product.stock?.minThreshold || "",
          maxThreshold: product.stock?.maxThreshold || "",
          location: product.stock?.location || "Principal",
        },
        metadata: {
          perishable: product.metadata?.perishable || false,
          shelfLife: product.metadata?.shelfLife || "",
          seasonal: product.metadata?.seasonal || false,
        },
      });
    } else if (!isOpen) {
      // Reset form when modal closes
      setFormData({
        name: "",
        sku: "",
        description: "",
        category: "",
        unit: "piece",
        pricing: {
          cost: "",
          sellingPrice: "",
          currency: "XAF",
          taxRate: 0,
        },
        stock: {
          quantity: "",
          minThreshold: "",
          maxThreshold: "",
          location: "Principal",
        },
        metadata: {
          perishable: false,
          shelfLife: "",
          seasonal: false,
        },
      });
      setErrors({});
    }
  }, [product, isOpen]);

  // ==================== HANDLE CHANGE ====================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // ==================== VALIDATION ====================
  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Le nom est requis";
    }

    if (!formData.category) {
      newErrors.category = "La catégorie est requise";
    }

    if (!formData.pricing.cost || formData.pricing.cost < 0) {
      newErrors["pricing.cost"] = "Prix d'achat invalide";
    }

    if (!formData.pricing.sellingPrice || formData.pricing.sellingPrice < 0) {
      newErrors["pricing.sellingPrice"] = "Prix de vente invalide";
    }

    if (
      parseFloat(formData.pricing.sellingPrice) <
      parseFloat(formData.pricing.cost)
    ) {
      newErrors["pricing.sellingPrice"] =
        "Le prix de vente doit être supérieur au prix d'achat";
    }

    if (formData.stock.quantity && formData.stock.quantity < 0) {
      newErrors["stock.quantity"] = "Quantité invalide";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ==================== SUBMIT ====================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Veuillez corriger les erreurs");
      return;
    }

    setLoading(true);

    try {
      // Préparer les données
      const dataToSend = {
        ...formData,
        pricing: {
          ...formData.pricing,
          cost: parseFloat(formData.pricing.cost),
          sellingPrice: parseFloat(formData.pricing.sellingPrice),
          taxRate: parseFloat(formData.pricing.taxRate) || 0,
        },
        stock: {
          ...formData.stock,
          quantity: formData.stock.quantity
            ? parseFloat(formData.stock.quantity)
            : 0,
          minThreshold: formData.stock.minThreshold
            ? parseFloat(formData.stock.minThreshold)
            : 0,
          maxThreshold: formData.stock.maxThreshold
            ? parseFloat(formData.stock.maxThreshold)
            : 0,
        },
        metadata: {
          perishable: formData.metadata.perishable,
          seasonal: formData.metadata.seasonal,
          ...(formData.metadata.perishable && formData.metadata.shelfLife
            ? { shelfLife: parseInt(formData.metadata.shelfLife) }
            : {}),
        },
      };

      if (isEditMode) {
        await ProductService.updateProduct(product._id, dataToSend);
        toast.success("Produit mis à jour avec succès");
      } else {
        await ProductService.addProduct(dataToSend);
        toast.success("Produit ajouté avec succès");
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Erreur sauvegarde produit:", err);
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.error ||
          (err.response?.data?.errors &&
            Object.values(err.response.data.errors)[0]?.message) ||
          "Erreur lors de la sauvegarde",
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================== PROFIT MARGIN ====================
  const profitMargin =
    formData.pricing.cost && formData.pricing.sellingPrice
      ? (
          ((formData.pricing.sellingPrice - formData.pricing.cost) /
            formData.pricing.cost) *
          100
        ).toFixed(2)
      : 0;

  const profit =
    formData.pricing.sellingPrice && formData.pricing.cost
      ? (formData.pricing.sellingPrice - formData.pricing.cost).toFixed(0)
      : 0;

  // ==================== RENDER ====================
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Modifier le produit" : "Nouveau produit"}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de base */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg border-b pb-2">
            Informations de base
          </h4>

          {/* Nom */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">
                Nom du produit <span className="text-error">*</span>
              </span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ex: Riz parfumé 25kg"
              className={`input input-bordered w-full ${errors.name ? "input-error" : ""}`}
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

          {/* SKU & Catégorie */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">SKU</span>
                <span className="label-text-alt text-gray-500">
                  Auto-généré si vide
                </span>
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                placeholder="PRD-001"
                className="input input-bordered w-full"
                disabled={loading}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">
                  Catégorie <span className="text-error">*</span>
                </span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`select select-bordered w-full ${errors.category ? "select-error" : ""}`}
                disabled={loading || loadingCategories}
              >
                <option value="">Sélectionner...</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <label className="label">
                  <span className="label-text-alt text-error flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.category}
                  </span>
                </label>
              )}
            </div>
          </div>

          {/* Unité */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Unité</span>
            </label>
            <select
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              className="select select-bordered w-full"
              disabled={loading}
            >
              <option value="piece">Pièce</option>
              <option value="kg">Kilogramme (kg)</option>
              <option value="g">Gramme (g)</option>
              <option value="l">Litre (l)</option>
              <option value="ml">Millilitre (ml)</option>
              <option value="box">Boîte</option>
              <option value="bag">Sac</option>
              <option value="ton">Tonne</option>
              <option value="carton">Carton</option>
            </select>
          </div>

          {/* Description */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Description</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Description du produit..."
              className="textarea textarea-bordered w-full"
              disabled={loading}
            />
          </div>
        </div>

        {/* Prix */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg border-b pb-2">Prix</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">
                  Prix d'achat (FCFA) <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="number"
                name="pricing.cost"
                value={formData.pricing.cost}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="0.01"
                className={`input input-bordered w-full ${errors["pricing.cost"] ? "input-error" : ""}`}
                disabled={loading}
              />
              {errors["pricing.cost"] && (
                <label className="label">
                  <span className="label-text-alt text-error flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors["pricing.cost"]}
                  </span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">
                  Prix de vente (FCFA) <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="number"
                name="pricing.sellingPrice"
                value={formData.pricing.sellingPrice}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="0.01"
                className={`input input-bordered w-full ${errors["pricing.sellingPrice"] ? "input-error" : ""}`}
                disabled={loading}
              />
              {errors["pricing.sellingPrice"] && (
                <label className="label">
                  <span className="label-text-alt text-error flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors["pricing.sellingPrice"]}
                  </span>
                </label>
              )}
            </div>
          </div>

          {/* Profit Margin Display */}
          {formData.pricing.cost > 0 && formData.pricing.sellingPrice > 0 && (
            <div className="alert alert-success">
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Marge bénéficiaire:</span>
                  <span className="text-2xl font-bold">{profitMargin}%</span>
                </div>
                <div className="text-sm mt-1">
                  Bénéfice par unité:{" "}
                  {parseFloat(profit).toLocaleString("fr-FR")} FCFA
                </div>
              </div>
            </div>
          )}

          {/* Tax Rate */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Taux de taxe (%)</span>
            </label>
            <input
              type="number"
              name="pricing.taxRate"
              value={formData.pricing.taxRate}
              onChange={handleChange}
              placeholder="0"
              min="0"
              max="100"
              step="0.01"
              className="input input-bordered w-full"
              disabled={loading}
            />
          </div>
        </div>

        {/* Stock */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg border-b pb-2">Stock</h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">
                  Quantité initiale
                </span>
              </label>
              <input
                type="number"
                name="stock.quantity"
                value={formData.stock.quantity}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="0.01"
                className={`input input-bordered w-full ${errors["stock.quantity"] ? "input-error" : ""}`}
                disabled={loading}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Seuil minimum</span>
              </label>
              <input
                type="number"
                name="stock.minThreshold"
                value={formData.stock.minThreshold}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="0.01"
                className="input input-bordered w-full"
                disabled={loading}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Seuil maximum</span>
              </label>
              <input
                type="number"
                name="stock.maxThreshold"
                value={formData.stock.maxThreshold}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="0.01"
                className="input input-bordered w-full"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Localisation</span>
            </label>
            <input
              type="text"
              name="stock.location"
              value={formData.stock.location}
              onChange={handleChange}
              placeholder="Principal, Entrepôt A..."
              className="input input-bordered w-full"
              disabled={loading}
            />
          </div>
        </div>

        {/* Métadonnées */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg border-b pb-2">
            Informations complémentaires
          </h4>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="metadata.perishable"
                checked={formData.metadata.perishable}
                onChange={handleChange}
                className="checkbox checkbox-primary"
                disabled={loading}
              />
              <span className="label-text">Produit périssable</span>
            </label>

            {formData.metadata.perishable && (
              <div className="form-control ml-8">
                <label className="label">
                  <span className="label-text font-medium">
                    Durée de conservation (jours)
                  </span>
                </label>
                <input
                  type="number"
                  name="metadata.shelfLife"
                  value={formData.metadata.shelfLife}
                  onChange={handleChange}
                  placeholder="Ex: 7"
                  min="1"
                  className="input input-bordered w-full max-w-xs"
                  disabled={loading}
                />
              </div>
            )}

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="metadata.seasonal"
                checked={formData.metadata.seasonal}
                onChange={handleChange}
                className="checkbox checkbox-primary"
                disabled={loading}
              />
              <span className="label-text">Produit saisonnier</span>
            </label>
          </div>
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

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save size={20} />
                {isEditMode ? "Mettre à jour" : "Créer le produit"}
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ProductModal;
