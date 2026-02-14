const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
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
    required: [true, 'Le nom du fournisseur est requis'],
    trim: true,
    maxlength: [200, 'Le nom ne peut pas dépasser 200 caractères']
  },
  
  code: {
    type: String,
    uppercase: true,
    trim: true,
    sparse: true
  },
  
  email: {
    type: String,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email invalide']
  },
  
  phone: {
    type: String,
    trim: true
  },
  
  website: {
    type: String,
    trim: true
  },
  
  // Adresse
  address: {
    street: String,
    city: String,
    region: String,
    country: {
      type: String,
      default: 'Cameroun'
    },
    postalCode: String
  },
  
  // Personne de contact
  contactPerson: {
    name: String,
    position: String,
    phone: String,
    email: String,
    notes: String
  },
  
  // Contacts secondaires
  additionalContacts: [{
    name: String,
    position: String,
    phone: String,
    email: String
  }],
  
  // Informations commerciales
  taxId: {
    type: String,
    trim: true,
    uppercase: true
  },
  
  registrationNumber: {
    type: String,
    trim: true
  },
  
  // Conditions de paiement
  paymentTerms: {
    method: {
      type: String,
      enum: ['cash', 'credit', 'mobile_money', 'bank_transfer'],
      default: 'cash'
    },
    creditDays: {
      type: Number,
      default: 0,
      min: 0
    },
    creditLimit: {
      type: Number,
      default: 0,
      min: 0
    },
    currency: {
      type: String,
      default: 'XAF',
      enum: ['XAF', 'EUR', 'USD']
    }
  },
  
  // Informations logistiques
  shipping: {
    leadTime: {
      type: Number,
      default: 7,
      min: 0
    }, // Jours
    minimumOrderAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    shippingCost: {
      type: Number,
      default: 0,
      min: 0
    },
    freeShippingThreshold: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  
  // Catégories de produits fournis
  categories: [{
    type: String,
    trim: true
  }],
  
  // Évaluation
  rating: {
    overall: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    quality: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    delivery: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    pricing: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    service: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    }
  },
  
  // Statistiques
  stats: {
    totalOrders: {
      type: Number,
      default: 0
    },
    totalSpent: {
      type: Number,
      default: 0
    },
    lastOrderDate: Date,
    averageOrderValue: {
      type: Number,
      default: 0
    },
    onTimeDeliveryRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  
  // Documents
  documents: [{
    name: String,
    type: {
      type: String,
      enum: ['contract', 'certificate', 'license', 'other']
    },
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    expiryDate: Date
  }],
  
  // Notes
  notes: {
    type: String,
    maxlength: 2000
  },
  
  internalNotes: {
    type: String,
    maxlength: 2000
  },
  
  // Tags
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // Statut
  status: {
    type: String,
    enum: ['active', 'inactive', 'blacklisted'],
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

// Index composés
supplierSchema.index({ organization: 1, code: 1 }, { unique: true, sparse: true });
supplierSchema.index({ organization: 1, name: 1 });
supplierSchema.index({ organization: 1, status: 1 });
supplierSchema.index({ organization: 1, name: 'text', tags: 'text' });

// Virtual: Produits de ce fournisseur
supplierSchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'supplier'
});

// Virtual: Commandes de ce fournisseur
supplierSchema.virtual('orders', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'supplier'
});

// Hook: Générer code si non fourni
supplierSchema.pre('save', async function(next) {
  if (!this.code && this.isNew) {
    const prefix = 'SUP';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.code = `${prefix}-${timestamp}-${random}`;
  }
  next();
});

// Méthode: Calculer rating global
supplierSchema.methods.calculateOverallRating = function() {
  const { quality, delivery, pricing, service } = this.rating;
  const ratings = [quality, delivery, pricing, service].filter(r => r > 0);
  
  if (ratings.length === 0) return 0;
  
  const sum = ratings.reduce((acc, r) => acc + r, 0);
  this.rating.overall = parseFloat((sum / ratings.length).toFixed(2));
  
  return this.rating.overall;
};

// Méthode: Mettre à jour statistiques
supplierSchema.methods.updateStats = async function() {
  const Order = mongoose.model('Order');
  
  const orders = await Order.find({
    organization: this.organization,
    supplier: this._id,
    status: { $in: ['completed', 'confirmed'] }
  });
  
  this.stats.totalOrders = orders.length;
  
  if (orders.length > 0) {
    this.stats.totalSpent = orders.reduce((sum, order) => sum + order.totals.total, 0);
    this.stats.averageOrderValue = this.stats.totalSpent / orders.length;
    
    const sortedOrders = orders.sort((a, b) => b.orderDate - a.orderDate);
    this.stats.lastOrderDate = sortedOrders[0].orderDate;
    
    // Calculer taux livraison à temps
    const deliveredOrders = orders.filter(o => o.delivery && o.delivery.deliveredAt);
    if (deliveredOrders.length > 0) {
      const onTimeCount = deliveredOrders.filter(o => {
        const expected = new Date(o.expectedDeliveryDate);
        const actual = new Date(o.delivery.deliveredAt);
        return actual <= expected;
      }).length;
      
      this.stats.onTimeDeliveryRate = (onTimeCount / deliveredOrders.length) * 100;
    }
  }
  
  return this;
};

// Méthode statique: Top fournisseurs par volume
supplierSchema.statics.getTopSuppliers = async function(organizationId, limit = 10) {
  return this.find({
    organization: organizationId,
    status: 'active'
  })
    .sort({ 'stats.totalSpent': -1 })
    .limit(limit)
    .select('name stats rating');
};

module.exports = mongoose.model('Supplier', supplierSchema);