const mongoose = require('mongoose');

const notificationSettingsSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Canaux de notification
  channels: {
    inApp: {
      type: Boolean,
      default: true
    },
    email: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: false
    },
    sms: {
      type: Boolean,
      default: false
    }
  },
  
  // Préférences par type d'alerte
  alerts: {
    lowStock: {
      enabled: { type: Boolean, default: true },
      channels: [String],
      threshold: Number
    },
    outOfStock: {
      enabled: { type: Boolean, default: true },
      channels: [String]
    },
    expiringProducts: {
      enabled: { type: Boolean, default: true },
      channels: [String],
      daysBeforeExpiry: { type: Number, default: 7 }
    },
    newOrders: {
      enabled: { type: Boolean, default: true },
      channels: [String]
    },
    orderStatus: {
      enabled: { type: Boolean, default: true },
      channels: [String]
    },
    paymentDue: {
      enabled: { type: Boolean, default: true },
      channels: [String],
      daysBefore: { type: Number, default: 3 }
    },
    aiInsights: {
      enabled: { type: Boolean, default: true },
      channels: [String]
    },
    anomalies: {
      enabled: { type: Boolean, default: true },
      channels: [String]
    }
  },
  
  // Horaires de notification (quiet hours)
  schedule: {
    enabled: { type: Boolean, default: false },
    startTime: String, // HH:mm format
    endTime: String,
    timezone: { type: String, default: 'Africa/Douala' }
  },
  
  // Résumé quotidien/hebdomadaire
  digest: {
    daily: {
      enabled: { type: Boolean, default: false },
      time: String
    },
    weekly: {
      enabled: { type: Boolean, default: false },
      day: { type: Number, min: 0, max: 6 }, // 0 = Dimanche
      time: String
    }
  }
  
}, { timestamps: true });

// Index unique
notificationSettingsSchema.index({ organization: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('NotificationSettings', notificationSettingsSchema);