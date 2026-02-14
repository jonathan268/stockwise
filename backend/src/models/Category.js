const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  // Multi-tenant
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  
  name: {
    type: String,
    required: [true, 'Le nom de la catégorie est requis'],
    trim: true,
    maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
  },
  
  slug: {
    type: String,
    lowercase: true,
    trim: true
  },
  
  description: {
    type: String,
    maxlength: [500, 'La description ne peut pas dépasser 500 caractères']
  },
  
  // Hiérarchie (catégories parent/enfant)
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  
  // Icône ou couleur pour UI
  icon: {
    type: String,
    default: 'folder'
  },
  
  color: {
    type: String,
    default: '#6B7280'
  },
  
  // Ordre d'affichage
  order: {
    type: Number,
    default: 0
  },
  
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
  
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index composé pour unicité par organisation
categorySchema.index({ organization: 1, slug: 1 }, { unique: true });
categorySchema.index({ organization: 1, parent: 1 });

// Virtual: Nombre de produits dans cette catégorie
categorySchema.virtual('productsCount', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category',
  count: true
});

// Virtual: Sous-catégories
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent'
});

// Hook: Générer slug automatiquement
categorySchema.pre('save', async function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Retirer accents
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // Vérifier unicité du slug dans l'organisation
    const existingCategory = await this.constructor.findOne({
      organization: this.organization,
      slug: this.slug,
      _id: { $ne: this._id }
    });
    
    if (existingCategory) {
      this.slug = `${this.slug}-${Date.now()}`;
    }
  }
  next();
});

// Méthode: Vérifier si catégorie a des sous-catégories
categorySchema.methods.hasSubcategories = async function() {
  const count = await this.constructor.countDocuments({
    parent: this._id,
    organization: this.organization
  });
  return count > 0;
};

// Méthode: Vérifier si catégorie a des produits
categorySchema.methods.hasProducts = async function() {
  const Product = mongoose.model('Product');
  const count = await Product.countDocuments({
    category: this._id,
    organization: this.organization
  });
  return count > 0;
};

module.exports = mongoose.model('Category', categorySchema);