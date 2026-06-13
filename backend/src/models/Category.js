import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    color: { type: String, default: "#f59e0b" },
    icon: { type: String, default: "Package" },
  },
  { timestamps: true },
);

categorySchema.index({ organizationId: 1 });

const Category = mongoose.model("Category", categorySchema);

export default Category;
