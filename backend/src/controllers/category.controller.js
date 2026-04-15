import * as categoryService from "../services/category.service.js";

export const getCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.getCategories(req.organizationId);
    res.status(200).json({ success: true, data: categories, error: null });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(req.organizationId, req.body);
    res.status(201).json({ success: true, data: category, error: null });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const category = await categoryService.updateCategory(req.organizationId, req.params.id, req.body);
    res.status(200).json({ success: true, data: category, error: null });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    await categoryService.deleteCategory(req.organizationId, req.params.id);
    res.status(200).json({ success: true, data: null, message: "Catégorie supprimée", error: null });
  } catch (error) {
    next(error);
  }
};
