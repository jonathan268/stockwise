const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Le prénom est requis"],
      trim: true,
      maxlength: [50, "Le prénom ne peut pas dépasser 50 caractères"],
    },

    lastName: {
      type: String,
      required: [true, "Le nom est requis"],
      trim: true,
      maxlength: [50, "Le nom ne peut pas dépasser 50 caractères"],
    },

    email: {
      type: String,
      required: [true, "L'email est requis"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Email invalide"],
    },

    password: {
      type: String,
      required: [true, "Le mot de passe est requis"],
      minlength: [8, "Le mot de passe doit contenir au moins 8 caractères"],
      select: false, // Ne pas retourner par défaut
    },

    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          if (!v) return true; // Optionnel
          // Format Cameroun: +237 6XX XX XX XX
          return /^(\+237)?6[0-9]{8}$/.test(v.replace(/\s/g, ""));
        },
        message: "Numéro de téléphone invalide",
      },
    },

    avatar: {
      type: String,
      default: null,
    },

    // Multi-tenant
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    ownedOrganization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
    },

    // Rôle dans l'organisation (géré aussi dans Organization.members)
    role: {
      type: String,
      enum: ["owner", "admin", "manager", "staff", "viewer"],
      default: "owner",
    },

    // Préférences utilisateur
    preferences: {
      language: {
        type: String,
        enum: ["fr", "en"],
        default: "fr",
      },
      timezone: {
        type: String,
        default: "Africa/Douala",
      },
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        lowStock: { type: Boolean, default: true },
        aiInsights: { type: Boolean, default: true },
        weeklyReport: { type: Boolean, default: false },
      },
      theme: {
        type: String,
        enum: ["light", "dark", "auto"],
        default: "light",
      },
    },

    // Sécurité - Vérification email
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationToken: String,
    emailVerificationExpires: Date,

    // Sécurité - Reset password
    passwordResetToken: String,
    passwordResetExpires: Date,
    passwordChangedAt: Date,

    // Refresh tokens (JWT)
    refreshTokens: [
      {
        token: {
          type: String,
          required: true,
        },
        deviceInfo: {
          userAgent: String,
          ip: String,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        expiresAt: {
          type: Date,
          required: true,
        },
      },
    ],

    // Sécurité - Login attempts
    loginAttempts: {
      type: Number,
      default: 0,
    },

    lockUntil: Date,

    lastLogin: Date,
    lastLoginIp: String,

    // Statut compte
    status: {
      type: String,
      enum: ["active", "inactive", "suspended", "deleted"],
      default: "active",
    },

    // Audit
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    deletedAt: Date,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.refreshTokens;
        delete ret.emailVerificationToken;
        delete ret.passwordResetToken;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Index
userSchema.index({ status: 1 });

// Virtual: fullName
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual: initials
userSchema.virtual("initials").get(function () {
  return `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`.toUpperCase();
});

// Hook: Hash password avant sauvegarde
userSchema.pre("save", async function (next) {
  // Only hash si password modifié
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);

    // Mettre à jour passwordChangedAt (sauf si nouveau user)
    if (!this.isNew) {
      this.passwordChangedAt = Date.now() - 1000; // 1s avant pour éviter problèmes JWT
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Méthode: Comparer mot de passe
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Méthode: Vérifier si compte verrouillé
userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Méthode: Incrémenter tentatives login
userSchema.methods.incLoginAttempts = async function () {
  // Si verrouillage expiré, reset
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };
  const maxAttempts = 5;
  const lockTime = 2 * 60 * 60 * 1000; // 2 heures

  // Verrouiller après 5 tentatives
  const attemptsLeft = maxAttempts - this.loginAttempts - 1;

  if (attemptsLeft <= 0) {
    updates.$set = { lockUntil: Date.now() + lockTime };
  }

  return this.updateOne(updates);
};

// Méthode: Reset tentatives login
userSchema.methods.resetLoginAttempts = async function () {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 },
  });
};

// Méthode: Générer token de vérification email
userSchema.methods.createEmailVerificationToken = function () {
  const verificationToken = crypto.randomBytes(32).toString("hex");

  this.emailVerificationToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24h

  return verificationToken;
};

// Méthode: Générer token reset password
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1h

  return resetToken;
};

// Méthode: Vérifier si password changé après JWT émis
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return JWTTimestamp < changedTimestamp;
  }

  return false;
};

// Méthode: Ajouter refresh token
userSchema.methods.addRefreshToken = async function (
  token,
  deviceInfo,
  expiresIn = "7d",
) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 jours

  this.refreshTokens.push({
    token,
    deviceInfo,
    expiresAt,
  });

  // Garder max 5 refresh tokens (5 appareils)
  if (this.refreshTokens.length > 5) {
    this.refreshTokens = this.refreshTokens.slice(-5);
  }

  await this.save();
};

// Méthode: Retirer refresh token
userSchema.methods.removeRefreshToken = async function (token) {
  this.refreshTokens = this.refreshTokens.filter((rt) => rt.token !== token);
  await this.save();
};

// Méthode: Nettoyer tokens expirés
userSchema.methods.cleanExpiredTokens = async function () {
  this.refreshTokens = this.refreshTokens.filter(
    (rt) => rt.expiresAt > Date.now(),
  );
  await this.save();
};

module.exports = mongoose.model("User", userSchema);
