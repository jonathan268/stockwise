const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      unique: true,
      index: true,
    },

    // Plan actuel
    plan: {
      type: String,
      enum: ["free", "basic", "smart", "premium"],
      default: "free",
      required: true,
    },

    // Tarification
    pricing: {
      amount: {
        type: Number,
        default: 0,
        min: 0,
      }, // FCFA
      currency: {
        type: String,
        default: "XAF",
        enum: ["XAF", "EUR", "USD"],
      },
      interval: {
        type: String,
        enum: ["monthly", "yearly"],
        default: "monthly",
      },
      discount: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
    },

    // Statut abonnement
    status: {
      type: String,
      enum: ["trial", "active", "past_due", "cancelled", "expired"],
      default: "trial",
    },

    // Période d'essai
    trial: {
      startDate: Date,
      endDate: Date,
      daysRemaining: Number,
      hasUsedTrial: {
        type: Boolean,
        default: false,
      },
    },

    // Période de facturation actuelle
    currentPeriod: {
      start: {
        type: Date,
        default: Date.now,
      },
      end: Date,
    },

    // Dates importantes
    startDate: {
      type: Date,
      default: Date.now,
    },

    cancelledAt: Date,
    cancellationReason: String,

    // Auto-renewal
    autoRenew: {
      type: Boolean,
      default: true,
    },

    // Paiement
    paymentMethod: {
      type: String,
      enum: ["mobile_money", "card", "bank_transfer", "none"],
      default: "none",
    },

    lastPayment: {
      amount: Number,
      date: Date,
      transactionId: String,
      status: {
        type: String,
        enum: ["pending", "completed", "failed", "refunded"],
      },
      method: String,
    },

    // Historique des paiements
    paymentHistory: [
      {
        amount: Number,
        currency: String,
        date: Date,
        transactionId: String,
        status: String,
        method: String,
        invoiceUrl: String,
      },
    ],

    // Prochaine facturation
    nextBillingDate: Date,
    nextBillingAmount: Number,

    // Features activées selon le plan
    features: {
      maxProducts: {
        type: Number,
        default: 50,
      },
      maxUsers: {
        type: Number,
        default: 2,
      },
      maxStockLocations: {
        type: Number,
        default: 1,
      },
      maxOrders: {
        type: Number,
        default: 100,
      },
      aiPredictionsPerMonth: {
        type: Number,
        default: 5,
      },
      advancedReports: {
        type: Boolean,
        default: false,
      },
      mobileApp: {
        type: Boolean,
        default: false,
      },
      apiAccess: {
        type: Boolean,
        default: false,
      },
      prioritySupport: {
        type: Boolean,
        default: false,
      },
      customBranding: {
        type: Boolean,
        default: false,
      },
      dataExport: {
        type: Boolean,
        default: false,
      },
      multiCurrency: {
        type: Boolean,
        default: false,
      },
    },

    // Changement de plan prévu
    scheduledChange: {
      newPlan: String,
      effectiveDate: Date,
      reason: String,
    },

    // Coupons / Réductions
    appliedCoupons: [
      {
        code: String,
        discount: Number,
        type: {
          type: String,
          enum: ["percentage", "fixed"],
        },
        appliedAt: Date,
        expiresAt: Date,
      },
    ],

    // Notes internes
    notes: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Index
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ nextBillingDate: 1 });
subscriptionSchema.index({ "trial.endDate": 1 });

// Virtual: Jours restants dans période
subscriptionSchema.virtual("daysRemaining").get(function () {
  if (!this.currentPeriod.end) return 0;
  const days = Math.ceil(
    (this.currentPeriod.end - new Date()) / (1000 * 60 * 60 * 24),
  );
  return Math.max(0, days);
});

// Virtual: Est en période d'essai
subscriptionSchema.virtual("isInTrial").get(function () {
  if (!this.trial.endDate) return false;
  return this.status === "trial" && this.trial.endDate > new Date();
});

// Virtual: Montant après réduction
subscriptionSchema.virtual("discountedAmount").get(function () {
  const discount = (this.pricing.amount * this.pricing.discount) / 100;
  return this.pricing.amount - discount;
});

// Hook: Définir features selon plan
subscriptionSchema.pre("save", function (next) {
  if (this.isModified("plan") || this.isNew) {
    const planFeatures = {
      free: {
        maxProducts: 50,
        maxUsers: 2,
        maxStockLocations: 1,
        maxOrders: 100,
        aiPredictionsPerMonth: 5,
        advancedReports: false,
        mobileApp: false,
        apiAccess: false,
        prioritySupport: false,
        customBranding: false,
        dataExport: false,
        multiCurrency: false,
      },
      basic: {
        maxProducts: 200,
        maxUsers: 5,
        maxStockLocations: 2,
        maxOrders: 500,
        aiPredictionsPerMonth: 50,
        advancedReports: false,
        mobileApp: true,
        apiAccess: false,
        prioritySupport: false,
        customBranding: false,
        dataExport: true,
        multiCurrency: false,
      },
      smart: {
        maxProducts: 1000,
        maxUsers: 15,
        maxStockLocations: 5,
        maxOrders: 2000,
        aiPredictionsPerMonth: 200,
        advancedReports: true,
        mobileApp: true,
        apiAccess: true,
        prioritySupport: false,
        customBranding: true,
        dataExport: true,
        multiCurrency: true,
      },
      premium: {
        maxProducts: -1, // Illimité
        maxUsers: -1,
        maxStockLocations: -1,
        maxOrders: -1,
        aiPredictionsPerMonth: -1,
        advancedReports: true,
        mobileApp: true,
        apiAccess: true,
        prioritySupport: true,
        customBranding: true,
        dataExport: true,
        multiCurrency: true,
      },
    };

    this.features = planFeatures[this.plan];

    // Définir prix
    const pricing = {
      free: 0,
      basic: 15000, // 15 000 FCFA/mois
      smart: 45000, // 45 000 FCFA/mois
      premium: 95000, // 95 000 FCFA/mois
    };

    this.pricing.amount = pricing[this.plan];

    // Calculer prochaine facturation
    if (this.plan !== "free") {
      const nextDate = new Date();
      if (this.pricing.interval === "monthly") {
        nextDate.setMonth(nextDate.getMonth() + 1);
      } else {
        nextDate.setFullYear(nextDate.getFullYear() + 1);
      }
      this.nextBillingDate = nextDate;
      this.nextBillingAmount = this.discountedAmount;
    }
  }

  // Calculer période fin si nouvelle subscription
  if (this.isNew) {
    const now = new Date();
    this.currentPeriod.start = now;

    // Période d'essai 14 jours pour plans payants
    if (this.plan !== "free" && !this.trial.hasUsedTrial) {
      this.trial.startDate = now;
      this.trial.endDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
      this.trial.daysRemaining = 14;
      this.status = "trial";
    }

    // Fin de période selon interval
    if (this.pricing.interval === "monthly") {
      this.currentPeriod.end = new Date(now.setMonth(now.getMonth() + 1));
    } else {
      this.currentPeriod.end = new Date(now.setFullYear(now.getFullYear() + 1));
    }
  }

  next();
});

// Hook: Synchroniser limites avec Organization
subscriptionSchema.post("save", async function (doc) {
  try {
    const Organization = mongoose.model("Organization");
    await Organization.findByIdAndUpdate(doc.organization, {
      $set: {
        "limits.maxProducts": doc.features.maxProducts,
        "limits.maxUsers": doc.features.maxUsers,
        "limits.maxStockLocations": doc.features.maxStockLocations,
        "limits.maxOrders": doc.features.maxOrders,
        "limits.aiPredictionsPerMonth": doc.features.aiPredictionsPerMonth,
      },
    });
  } catch (error) {
    console.error("Erreur sync limites Organization:", error);
  }
});

// Méthode: Vérifier si actif
subscriptionSchema.methods.isActive = function () {
  if (this.isInTrial) return true;
  return (
    ["active"].includes(this.status) && this.currentPeriod.end > new Date()
  );
};

// Méthode: Vérifier feature disponible
subscriptionSchema.methods.hasFeature = function (feature) {
  return this.features[feature] === true || this.features[feature] === -1;
};

// Méthode: Enregistrer paiement
subscriptionSchema.methods.recordPayment = function (
  amount,
  method,
  transactionId,
) {
  this.lastPayment = {
    amount,
    date: new Date(),
    transactionId,
    status: "completed",
    method,
  };

  this.paymentHistory.push({
    amount,
    currency: this.pricing.currency,
    date: new Date(),
    transactionId,
    status: "completed",
    method,
  });

  // Mettre à jour statut
  if (this.status === "past_due" || this.status === "trial") {
    this.status = "active";
  }

  // Calculer prochaine période
  const now = new Date();
  this.currentPeriod.start = now;

  if (this.pricing.interval === "monthly") {
    this.currentPeriod.end = new Date(now.setMonth(now.getMonth() + 1));
    this.nextBillingDate = this.currentPeriod.end;
  } else {
    this.currentPeriod.end = new Date(now.setFullYear(now.getFullYear() + 1));
    this.nextBillingDate = this.currentPeriod.end;
  }

  return this;
};

// Méthode: Annuler abonnement
subscriptionSchema.methods.cancel = function (reason) {
  this.status = "cancelled";
  this.cancelledAt = new Date();
  this.cancellationReason = reason;
  this.autoRenew = false;

  return this;
};

// Méthode: Changer de plan
subscriptionSchema.methods.changePlan = function (newPlan, immediate = true) {
  if (immediate) {
    this.plan = newPlan;
  } else {
    // Planifier changement à la fin de la période
    this.scheduledChange = {
      newPlan,
      effectiveDate: this.currentPeriod.end,
      reason: "user_requested",
    };
  }

  return this;
};

// Méthode statique: Vérifier abonnements expirés
subscriptionSchema.statics.checkExpiredSubscriptions = async function () {
  const now = new Date();

  // Marquer essais expirés
  await this.updateMany(
    {
      status: "trial",
      "trial.endDate": { $lt: now },
    },
    {
      $set: { status: "expired" },
    },
  );

  // Marquer abonnements expirés
  await this.updateMany(
    {
      status: "active",
      "currentPeriod.end": { $lt: now },
      autoRenew: false,
    },
    {
      $set: { status: "expired" },
    },
  );

  // Marquer en retard de paiement
  await this.updateMany(
    {
      status: "active",
      "currentPeriod.end": { $lt: now },
      autoRenew: true,
    },
    {
      $set: { status: "past_due" },
    },
  );
};

module.exports = mongoose.model("Subscription", subscriptionSchema);
