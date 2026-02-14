const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Le nom de l'organisation est requis"],
      trim: true,
      maxlength: [100, "Le nom ne peut pas dépasser 100 caractères"],
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      required: true,
      trim: true,
    },

    // Contact
    email: {
      type: String,
      required: [true, "L'email est requis"],
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Email invalide"],
    },

    phone: {
      type: String,
      trim: true,
    },

    // Adresse
    address: {
      street: String,
      city: String,
      region: String,
      country: {
        type: String,
        default: "Cameroun",
      },
      postalCode: String,
    },

    // Informations commerciales
    industry: {
      type: String,
      enum: [
        "agriculture",
        "retail",
        "wholesale",
        "manufacturing",
        "food_service",
        "logistics",
        "other",
      ],
      default: "other",
    },

    businessType: {
      type: String,
      enum: [
        "sole_proprietorship",
        "partnership",
        "corporation",
        "cooperative",
      ],
      default: "sole_proprietorship",
    },

    taxId: {
      type: String,
      trim: true,
      uppercase: true,
    },

    registrationNumber: {
      type: String,
      trim: true,
    },

    // Propriétaire
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Membres de l'équipe
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["owner", "admin", "manager", "staff", "viewer"],
          default: "staff",
        },
        permissions: [
          {
            type: String,
            enum: [
              "manage_products",
              "manage_orders",
              "manage_stock",
              "manage_suppliers",
              "view_analytics",
              "manage_users",
              "manage_settings",
              "use_ai_features",
            ],
          },
        ],
        addedAt: {
          type: Date,
          default: Date.now,
        },
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        status: {
          type: String,
          enum: ["active", "inactive", "pending"],
          default: "active",
        },
      },
    ],

    // Invitations en attente
    pendingInvitations: [
      {
        email: {
          type: String,
          lowercase: true,
          required: true,
        },
        role: {
          type: String,
          enum: ["admin", "manager", "staff", "viewer"],
          default: "staff",
        },
        token: String,
        invitedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        invitedAt: {
          type: Date,
          default: Date.now,
        },
        expiresAt: Date,
        status: {
          type: String,
          enum: ["pending", "accepted", "expired", "cancelled"],
          default: "pending",
        },
      },
    ],

    // Paramètres
    settings: {
      currency: {
        type: String,
        default: "XAF",
        enum: ["XAF", "EUR", "USD"],
      },
      timezone: {
        type: String,
        default: "Africa/Douala",
      },
      language: {
        type: String,
        default: "fr",
        enum: ["fr", "en"],
      },
      dateFormat: {
        type: String,
        default: "DD/MM/YYYY",
        enum: ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"],
      },
      lowStockThreshold: {
        type: Number,
        default: 10,
        min: 0,
      },
      fiscalYearStart: {
        type: Number,
        default: 1,
        min: 1,
        max: 12,
      },
    },

    // Branding
    branding: {
      logo: String,
      primaryColor: {
        type: String,
        default: "#4F46E5",
      },
      secondaryColor: {
        type: String,
        default: "#10B981",
      },
    },

    // Configuration notifications
    notifications: {
      email: {
        enabled: { type: Boolean, default: true },
        lowStock: { type: Boolean, default: true },
        newOrders: { type: Boolean, default: true },
        weeklyReport: { type: Boolean, default: false },
      },
      sms: {
        enabled: { type: Boolean, default: false },
        criticalAlerts: { type: Boolean, default: false },
      },
    },

    // Statut organisation
    status: {
      type: String,
      enum: ["active", "suspended", "cancelled", "trial"],
      default: "trial",
    },

    // Limites basées sur l'abonnement (synchronisées avec Subscription)
    limits: {
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
    },

    // Usage actuel
    usage: {
      productsCount: {
        type: Number,
        default: 0,
      },
      usersCount: {
        type: Number,
        default: 1,
      },
      ordersCount: {
        type: Number,
        default: 0,
      },
      aiPredictionsUsed: {
        type: Number,
        default: 0,
      },
      storageUsed: {
        type: Number,
        default: 0,
      }, // MB
      lastResetDate: {
        type: Date,
        default: Date.now,
      },
    },

    // Intégrations tierces
    integrations: {
      accounting: {
        enabled: Boolean,
        provider: String,
        credentials: mongoose.Schema.Types.Mixed,
      },
      payment: {
        enabled: Boolean,
        provider: String,
        credentials: mongoose.Schema.Types.Mixed,
      },
      shipping: {
        enabled: Boolean,
        provider: String,
        credentials: mongoose.Schema.Types.Mixed,
      },
    },

    // Metadata
    metadata: {
      setupCompleted: {
        type: Boolean,
        default: false,
      },
      setupSteps: {
        profile: { type: Boolean, default: false },
        products: { type: Boolean, default: false },
        stock: { type: Boolean, default: false },
        team: { type: Boolean, default: false },
      },
      onboardingCompletedAt: Date,
      firstOrderAt: Date,
      firstAIPredictionAt: Date,
    },

    // Audit
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    deletedAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Index
organizationSchema.index({ status: 1 });
organizationSchema.index({ "members.user": 1 });

// Virtual: Abonnement actif
organizationSchema.virtual("subscription", {
  ref: "Subscription",
  localField: "_id",
  foreignField: "organization",
  justOne: true,
});

// Virtual: Nombre de membres
organizationSchema.virtual("membersCount").get(function () {
  return this.members.filter((m) => m.status === "active").length;
});

// Virtual: Pourcentage utilisation produits
organizationSchema.virtual("productsUsagePercentage").get(function () {
  if (this.limits.maxProducts === -1) return 0;
  return ((this.usage.productsCount / this.limits.maxProducts) * 100).toFixed(
    2,
  );
});

// Hook: Générer slug avant sauvegarde
organizationSchema.pre("save", async function (next) {
  if (this.isModified("name") && !this.slug) {
    let baseSlug = this.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    let slug = baseSlug;
    let counter = 1;

    // Vérifier unicité
    while (await this.constructor.findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = slug;
  }
  next();
});

// Hook: Ajouter owner aux members si nouveau
organizationSchema.pre("save", function (next) {
  if (this.isNew && this.owner) {
    const ownerExists = this.members.some(
      (m) => m.user.toString() === this.owner.toString(),
    );

    if (!ownerExists) {
      this.members.push({
        user: this.owner,
        role: "owner",
        permissions: [
          "manage_products",
          "manage_orders",
          "manage_stock",
          "manage_suppliers",
          "view_analytics",
          "manage_users",
          "manage_settings",
          "use_ai_features",
        ],
        status: "active",
      });
      this.usage.usersCount = 1;
    }
  }
  next();
});

// Méthode: Vérifier si limite atteinte
organizationSchema.methods.canAddProduct = function () {
  if (this.limits.maxProducts === -1) return true;
  return this.usage.productsCount < this.limits.maxProducts;
};

organizationSchema.methods.canAddUser = function () {
  if (this.limits.maxUsers === -1) return true;
  return this.usage.usersCount < this.limits.maxUsers;
};

organizationSchema.methods.canUseAI = function () {
  if (this.limits.aiPredictionsPerMonth === -1) return true;
  return this.usage.aiPredictionsUsed < this.limits.aiPredictionsPerMonth;
};

// Méthode: Ajouter membre
organizationSchema.methods.addMember = async function (
  userId,
  role,
  permissions,
  addedBy,
) {
  // Vérifier si user déjà membre
  const existingMember = this.members.find(
    (m) => m.user.toString() === userId.toString(),
  );

  if (existingMember) {
    throw new Error("Utilisateur déjà membre de cette organisation");
  }

  // Vérifier limite
  if (!this.canAddUser()) {
    throw new Error("Limite maximale d'utilisateurs atteinte");
  }

  this.members.push({
    user: userId,
    role,
    permissions: permissions || this.getDefaultPermissions(role),
    addedBy,
    status: "active",
  });

  this.usage.usersCount++;

  return this.save();
};

// Méthode: Retirer membre
organizationSchema.methods.removeMember = async function (userId) {
  // Ne pas retirer owner
  if (this.owner.toString() === userId.toString()) {
    throw new Error("Le propriétaire ne peut pas être retiré");
  }

  const initialLength = this.members.length;
  this.members = this.members.filter(
    (m) => m.user.toString() !== userId.toString(),
  );

  if (this.members.length < initialLength) {
    this.usage.usersCount = Math.max(0, this.usage.usersCount - 1);
  }

  return this.save();
};

// Méthode: Permissions par défaut selon rôle
organizationSchema.methods.getDefaultPermissions = function (role) {
  const permissionSets = {
    owner: [
      "manage_products",
      "manage_orders",
      "manage_stock",
      "manage_suppliers",
      "view_analytics",
      "manage_users",
      "manage_settings",
      "use_ai_features",
    ],
    admin: [
      "manage_products",
      "manage_orders",
      "manage_stock",
      "manage_suppliers",
      "view_analytics",
      "manage_users",
      "use_ai_features",
    ],
    manager: [
      "manage_products",
      "manage_orders",
      "manage_stock",
      "manage_suppliers",
      "view_analytics",
      "use_ai_features",
    ],
    staff: [
      "manage_products",
      "manage_orders",
      "manage_stock",
      "view_analytics",
    ],
    viewer: ["view_analytics"],
  };

  return permissionSets[role] || [];
};

// Méthode: Créer invitation
organizationSchema.methods.createInvitation = async function (
  email,
  role,
  invitedBy,
) {
  const crypto = require("crypto");

  // Vérifier si invitation existe déjà
  const existingInvitation = this.pendingInvitations.find(
    (inv) => inv.email === email && inv.status === "pending",
  );

  if (existingInvitation) {
    throw new Error("Une invitation est déjà en attente pour cet email");
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours

  this.pendingInvitations.push({
    email,
    role,
    token: crypto.createHash("sha256").update(token).digest("hex"),
    invitedBy,
    expiresAt,
    status: "pending",
  });

  await this.save();

  return token; // Retourner token non hashé pour email
};

// Méthode: Reset usage mensuel
organizationSchema.methods.resetMonthlyUsage = function () {
  this.usage.aiPredictionsUsed = 0;
  this.usage.lastResetDate = new Date();
  return this.save();
};

// Méthode statique: Nettoyer invitations expirées
organizationSchema.statics.cleanExpiredInvitations = async function () {
  return this.updateMany(
    { "pendingInvitations.expiresAt": { $lt: new Date() } },
    { $set: { "pendingInvitations.$.status": "expired" } },
  );
};

module.exports = mongoose.model("Organization", organizationSchema);
