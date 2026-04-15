import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    logo: { type: String },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Plans & Trial
    plan: {
      type: String,
      enum: ["starter", "pro", "enterprise"],
      default: "starter",
    },
    trialEndsAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    isTrialActive: { type: Boolean, default: true },

    // Paramètres
    settings: {
      currency: { type: String, default: "XAF" },
      timezone: { type: String, default: "Africa/Douala" },
      lowStockAlertEmail: { type: Boolean, default: true },
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Virtual : accès Pro
organizationSchema.virtual("hasProAccess").get(function () {
  const trialValid = this.isTrialActive && this.trialEndsAt > new Date();
  return trialValid || this.plan === "pro" || this.plan === "enterprise";
});

organizationSchema.set("toJSON", { virtuals: true });

export default mongoose.model("Organization", organizationSchema);
