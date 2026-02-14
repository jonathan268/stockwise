const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  
  type: {
    type: String,
    enum: [
      'low_stock',
      'out_of_stock',
      'overstock',
      'expiring_soon',
      'expired',
      'anomaly',
      'price_change',
      'new_order',
      'order_status',
      'payment_due',
      'supplier_issue',
      'system',
      'ai_insight'
    ],
    required: true
  },
  
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  
  // Ressource liée
  relatedTo: {
    model: {
      type: String,
      enum: ['Product', 'Stock', 'Order', 'Supplier', 'User', 'Organization']
    },
    id: mongoose.Schema.Types.ObjectId,
    name: String
  },
  
  // Action recommandée
  actionRequired: {
    type: Boolean,
    default: false
  },
  
  actionUrl: String,
  actionLabel: String,
  
  // Données additionnelles
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  
  // État
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  
  readBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  readAt: Date,
  
  isDismissed: {
    type: Boolean,
    default: false
  },
  
  dismissedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  dismissedAt: Date,
  
  // Expiration
  expiresAt: Date,
  
  // Audit
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
  
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index
alertSchema.index({ organization: 1, isRead: 1, createdAt: -1 });
alertSchema.index({ organization: 1, type: 1 });
alertSchema.index({ organization: 1, severity: 1 });
alertSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Virtual: Icône selon type
alertSchema.virtual('icon').get(function() {
  const icons = {
    low_stock: '⚠️',
    out_of_stock: '🚫',
    overstock: '📦',
    expiring_soon: '⏰',
    expired: '❌',
    anomaly: '🔍',
    price_change: '💰',
    new_order: '🛒',
    order_status: '📋',
    payment_due: '💳',
    supplier_issue: '🏢',
    system: 'ℹ️',
    ai_insight: '🤖'
  };
  
  return icons[this.type] || 'ℹ️';
});

// Virtual: Couleur selon sévérité
alertSchema.virtual('color').get(function() {
  const colors = {
    low: 'blue',
    medium: 'yellow',
    high: 'orange',
    critical: 'red'
  };
  
  return colors[this.severity] || 'gray';
});

// Méthode: Marquer comme lu
alertSchema.methods.markAsRead = function(userId) {
  this.isRead = true;
  this.readBy = userId;
  this.readAt = new Date();
  return this.save();
};

// Méthode: Rejeter
alertSchema.methods.dismiss = function(userId) {
  this.isDismissed = true;
  this.dismissedBy = userId;
  this.dismissedAt = new Date();
  return this.save();
};

// Méthode statique: Créer alerte
alertSchema.statics.createAlert = async function(alertData) {
  // Vérifier si alerte similaire existe déjà (éviter doublons)
  const existing = await this.findOne({
    organization: alertData.organization,
    type: alertData.type,
    'relatedTo.id': alertData.relatedTo?.id,
    isRead: false,
    isDismissed: false,
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // 24h
  });
  
  if (existing) {
    // Mettre à jour l'existante
    Object.assign(existing, alertData);
    existing.createdAt = new Date();
    return existing.save();
  }
  
  return this.create(alertData);
};

// Méthode statique: Nettoyer anciennes alertes
alertSchema.statics.cleanOldAlerts = async function(organizationId, daysOld = 30) {
  const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
  
  return this.deleteMany({
    organization: organizationId,
    createdAt: { $lt: cutoffDate },
    $or: [
      { isRead: true },
      { isDismissed: true }
    ]
  });
};

module.exports = mongoose.model('Alert', alertSchema);