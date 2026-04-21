import Category from "../models/Category.js";
import Product from "../models/Product.js";
import { AppError } from "../utils/appError.js";

export const getCategories = async (organizationId) => {
  const categories = await Category.find({ organizationId }).sort({ name: 1 });
  return categories;
};

export const createCategory = async (organizationId, categoryData) => {
  const existing = await Category.findOne({ 
    organizationId, 
    name: { $regex: new RegExp(`^${categoryData.name}$`, "i") } 
  });
  
  if (existing) {
    throw new AppError("Une catégorie avec ce nom existe déjà", 400);
  }

  const category = await Category.create({
    organizationId,
    ...categoryData
  });
  
  return category;
};

export const updateCategory = async (organizationId, categoryId, updateData) => {
  const category = await Category.findOneAndUpdate(
    { _id: categoryId, organizationId },
    updateData,
    { returnDocument: "after", runValidators: true }
  );

  if (!category) throw new AppError("Catégorie introuvable", 404);
  return category;
};

export const deleteCategory = async (organizationId, categoryId) => {
  const category = await Category.findOne({ _id: categoryId, organizationId });
  if (!category) throw new AppError("Catégorie introuvable", 404);

  // Vérifier si des produits l'utilisent
  const productsCount = await Product.countDocuments({ organizationId, category: categoryId, isDeleted: false });
  if (productsCount > 0) {
    throw new AppError(`Impossible de supprimer cette catégorie car elle est utilisée par ${productsCount} produit(s).`, 400);
  }

  await category.deleteOne();
  return null;
};
