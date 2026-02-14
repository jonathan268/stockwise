const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  // Multi-tenant
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  
  // Informations de base
  name: {
    type: String,
    required: [true, 'Le nom du produit est requis'],
    trim: true,
    maxlength: [200, 'Le nom ne peut pas dépasser 200 caractères']
  },
  
  sku: {
    type: String,
    trim: true,
    uppercase: true,
    sparse: true // Permet null mais unique si présent
  },
  
  barcode: {
    type: String,
    trim: true
  },
  
  description: {
    type: String,
    maxlength: [1000, 'La description ne peut pas dépasser 1000 caractères']
  },
  
  // Catégorisation
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'La catégorie est requise']
  },
  
  // Unité de mesure
  unit: {
    type: String,
    required: true,
    enum: {
      values: ['kg', 'g', 'l', 'ml', 'piece', 'box', 'bag', 'ton', 'carton'],
      message: '{VALUE} n\'est pas une unité valide'
    },
    default: 'piece'
  },
  
  // Prix
  pricing: {
    cost: {
      type: Number,
      required: [true, 'Le prix d\'achat est requis'],
      min: [0, 'Le prix d\'achat ne peut pas être négatif']
    },
    sellingPrice: {
      type: Number,
      required: [true, 'Le prix de vente est requis'],
      min: [0, 'Le prix de vente ne peut pas être négatif']
    },
    currency: {
      type: String,
      default: 'XAF',
      enum: ['XAF', 'EUR', 'USD']
    },
    taxRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  
  // Fournisseur
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier'
  },
  
  // Image
  image: {
    url: {
      type: String,
      default: null
    },
    publicId: String // Pour Cloudinary
  },
  
  // Métadonnées
  metadata: {
    perishable: {
      type: Boolean,
      default: false
    },
    shelfLife: {
      type: Number, // En jours
      min: 0
    },
    seasonal: {
      type: Boolean,
      default: false
    },
    seasonalMonths: [{
      type: Number,
      min: 1,
      max: 12
    }],
    storageConditions: {
      type: String,
      enum: ['ambient', 'refrigerated', 'frozen', 'dry', 'special'],
      default: 'ambient'
    },
    weight: Number, // kg
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: {
        type: String,
        enum: ['cm', 'm'],
        default: 'cm'
      }
    }
  },
  
  // Tags pour recherche
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // Statut
  status: {
    type: String,
    enum: ['active', 'inactive', 'discontinued'],
    default: 'active'
  },
  
  // Audit
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
  
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index composés pour performance multi-tenant
productSchema.index({ organization: 1, status: 1 });
productSchema.index({ organization: 1, category: 1 });
productSchema.index({ organization: 1, sku: 1 }, { unique: true, sparse: true });
productSchema.index({ organization: 1, barcode: 1 });
productSchema.index({ organization: 1, name: 'text', tags: 'text' }); // Full-text search

// Virtual: Marge bénéficiaire
productSchema.virtual('profitMargin').get(function() {
  if (!this.pricing.cost || !this.pricing.sellingPrice) return 0;
  const margin = ((this.pricing.sellingPrice - this.pricing.cost) / this.pricing.cost) * 100;
  return parseFloat(margin.toFixed(2));
});

// Virtual: Prix TTC
productSchema.virtual('sellingPriceWithTax').get(function() {
  const price = this.pricing.sellingPrice;
  const tax = (price * this.pricing.taxRate) / 100;
  return parseFloat((price + tax).toFixed(2));
});

// Virtual: Stock actuel (depuis Stock model)
productSchema.virtual('stock', {
  ref: 'Stock',
  localField: '_id',
  foreignField: 'product',
  justOne: true
});

// Hook: Générer SKU si non fourni
productSchema.pre('save', async function(next) {
  if (!this.sku && this.isNew) {
    const category = await mongoose.model('Category').findById(this.category);
    const prefix = category ? category.name.substring(0, 3).toUpperCase() : 'PRD';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.sku = `${prefix}-${timestamp}-${random}`;
  }
  next();
});

// Hook: Créer stock initial lors création produit
productSchema.post('save', async function(doc) {
  if (doc.wasNew) {
    const Stock = mongoose.model('Stock');
    const existingStock = await Stock.findOne({
      organization: doc.organization,
      product: doc._id
    });
    
    if (!existingStock) {
      await Stock.create({
        organization: doc.organization,
        product: doc._id,
        quantity: 0,
        location: { name: 'Principal', type: 'warehouse' }
      });
    }
  }
});

// Méthode statique: Recherche avancée
productSchema.statics.searchProducts = function(organizationId, searchTerm, filters = {}) {
  const query = { organization: organizationId };
  
  // Recherche texte
  if (searchTerm) {
    query.$text = { $search: searchTerm };
  }
  
  // Filtres
  if (filters.category) query.category = filters.category;
  if (filters.status) query.status = filters.status;
  if (filters.supplier) query.supplier = filters.supplier;
  if (filters.perishable !== undefined) {
    query['metadata.perishable'] = filters.perishable;
  }
  
  return this.find(query)
    .populate('category', 'name')
    .populate('supplier', 'name')
    .sort(searchTerm ? { score: { $meta: 'textScore' } } : { name: 1 });
};

module.exports = mongoose.model('Product', productSchema);