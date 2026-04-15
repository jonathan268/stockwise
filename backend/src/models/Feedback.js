import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    type: {
      type: String,
      enum: ["bug", "feature_request", "general", "ux", "billing"],
      required: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    message: { type: String, required: true, trim: true, maxlength: 1000 },
    rating: { type: Number, min: 1, max: 5, default: null },

    page: { type: String },
    userAgent: { type: String },

    status: {
      type: String,
      enum: ["new", "in_review", "planned", "done", "rejected"],
      default: "new",
    },
    adminNote: { type: String },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
  },
  { timestamps: true },
);

feedbackSchema.index({ status: 1, createdAt: -1 });
feedbackSchema.index({ organizationId: 1 });

export default mongoose.model("Feedback", feedbackSchema);
