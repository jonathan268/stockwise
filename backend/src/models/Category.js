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

// Suppression automatique de l'index obsolète qui cause le crash E11000
Category.collection.dropIndex("organization_1_slug_1").catch(() => {
  // On ignore silencieusement si l'index n'existe déjà plus
});

export default Category;
