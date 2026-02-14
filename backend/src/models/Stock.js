const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  // Multi-tenant
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  
  // Produit
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  
  // Emplacement/Localisation
  location: {
    name: {
      type: String,
      default: 'Principal',
      trim: true
    },
    address: String,
    type: {
      type: String,
      enum: ['warehouse', 'store', 'vehicle', 'other'],
      default: 'warehouse'
    }
  },
  
  // Quantités
  quantity: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'La quantité ne peut pas être négative']
  },
  
  reservedQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Seuils
  minThreshold: {
    type: Number,
    default: 10,
    min: 0
  },
  
  maxThreshold: {
    type: Number,
    default: 1000,
    min: 0
  },
  
  reorderPoint: {
    type: Number,
    min: 0
  },
  
  reorderQuantity: {
    type: Number,
    min: 0
  },
  
  // Valeur totale (calculé)
  totalValue: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Historique transactions (90 derniers jours max)
  salesHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['sale', 'purchase', 'adjustment', 'return', 'loss', 'transfer_in', 'transfer_out'],
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    value: Number,
    reference: String,
    notes: String
  }],
  
  // Prévisions IA
  aiPredictions: {
    nextWeekDemand: Number,
    nextMonthDemand: Number,
    recommendedOrderQty: Number,
    confidence: {
      type: Number,
      min: 0,
      max: 1
    },
    lastUpdated: Date,
    factors: {
      seasonality: Number,
      trend: Number,
      events: [String]
    }
  },
  
  // Alertes actives
  alerts: [{
    type: {
      type: String,
      enum: ['low_stock', 'overstock', 'expiring_soon', 'anomaly', 'negative_trend'],
      required: true
    },
    message: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    isRead: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Audit
  lastStockTake: Date,
  lastMovement: Date,
  
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
  
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index composés (unicité par produit et localisation)
stockSchema.index(
  { organization: 1, product: 1, 'location.name': 1 }, 
  { unique: true }
);
stockSchema.index({ organization: 1, quantity: 1 });
stockSchema.index({ organization: 1, lastMovement: -1 });

// Virtual: Quantité disponible
stockSchema.virtual('availableQuantity').get(function() {
  return Math.max(0, this.quantity - this.reservedQuantity);
});

// Virtual: Statut du stock
stockSchema.virtual('stockStatus').get(function() {
  if (this.quantity === 0) return 'out_of_stock';
  if (this.quantity <= this.minThreshold) return 'low';
  if (this.quantity >= this.maxThreshold) return 'overstock';
  return 'ok';
});

// Virtual: Jours de couverture (estimation)
stockSchema.virtual('daysOfCoverage').get(function() {
  if (this.salesHistory.length === 0) return null;
  
  // Calculer moyenne ventes des 30 derniers jours
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentSales = this.salesHistory.filter(h => 
    h.type === 'sale' && h.date > thirtyDaysAgo
  );
  
  if (recentSales.length === 0) return null;
  
  const totalSold = recentSales.reduce((sum, sale) => sum + Math.abs(sale.quantity), 0);
  const avgDailySales = totalSold / 30;
  
  if (avgDailySales === 0) return null;
  
  return Math.floor(this.availableQuantity / avgDailySales);
});

// Méthode: Ajouter transaction à l'historique
stockSchema.methods.addTransaction = function(type, quantity, value, reference = '', notes = '') {
  this.salesHistory.push({
    type,
    quantity,
    value,
    reference,
    notes,
    date: new Date()
  });
  
  // Garder seulement 90 derniers jours
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  this.salesHistory = this.salesHistory
    .filter(h => h.date > ninetyDaysAgo)
    .sort((a, b) => b.date - a.date)
    .slice(0, 500); // Max 500 entrées
  
  this.lastMovement = new Date();
};

// Méthode: Vérifier si besoin réapprovisionnement
stockSchema.methods.needsReorder = function() {
  return this.reorderPoint && this.availableQuantity <= this.reorderPoint;
};

// Hook: Calculer valeur totale avant sauvegarde
stockSchema.pre('save', async function(next) {
  if (this.isModified('quantity') || this.isNew) {
    try {
      const product = await mongoose.model('Product').findById(this.product);
      if (product) {
        this.totalValue = this.quantity * product.pricing.cost;
      }
    } catch (error) {
      return next(error);
    }
  }
  
  // Créer alerte stock bas si nécessaire
  if (this.quantity <= this.minThreshold && this.quantity > 0) {
    const existingAlert = this.alerts.find(a => 
      a.type === 'low_stock' && !a.isRead
    );
    
    if (!existingAlert) {
      this.alerts.push({
        type: 'low_stock',
        message: `Stock faible: ${this.quantity} unités restantes (seuil: ${this.minThreshold})`,
        severity: this.quantity <= (this.minThreshold / 2) ? 'critical' : 'high'
      });
    }
  }
  
  // Alerte rupture de stock
  if (this.quantity === 0) {
    const existingAlert = this.alerts.find(a => 
      a.type === 'low_stock' && !a.isRead
    );
    
    if (!existingAlert) {
      this.alerts.push({
        type: 'low_stock',
        message: 'Rupture de stock',
        severity: 'critical'
      });
    }
  }
  
  // Alerte surstock
  if (this.quantity >= this.maxThreshold) {
    const existingAlert = this.alerts.find(a => 
      a.type === 'overstock' && !a.isRead
    );
    
    if (!existingAlert) {
      this.alerts.push({
        type: 'overstock',
        message: `Surstock détecté: ${this.quantity} unités (max: ${this.maxThreshold})`,
        severity: 'medium'
      });
    }
  }
  
  next();
});

// Méthode statique: Obtenir stock total organisation
stockSchema.statics.getTotalValue = async function(organizationId) {
  const result = await this.aggregate([
    { $match: { organization: mongoose.Types.ObjectId(organizationId) } },
    { $group: { _id: null, total: { $sum: '$totalValue' } } }
  ]);
  
  return result.length > 0 ? result[0].total : 0;
};

// Méthode statique: Produits en rupture
stockSchema.statics.getOutOfStock = function(organizationId) {
  return this.find({
    organization: organizationId,
    quantity: 0
  }).populate('product', 'name sku');
};

// Méthode statique: Produits stock bas
stockSchema.statics.getLowStock = function(organizationId) {
  return this.find({
    organization: organizationId,
    $expr: { $lte: ['$quantity', '$minThreshold'] },
    quantity: { $gt: 0 }
  }).populate('product', 'name sku');
};

module.exports = mongoose.model('Stock', stockSchema);