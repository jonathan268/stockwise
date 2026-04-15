import { asyncHandler } from "../utils/appError.js";
import * as productService from "../services/product.service.js";

export const getProducts = asyncHandler(async (req, res) => {
  const result = await productService.getProducts(
    req.organizationId,
    req.query,
  );
  res.json({
    success: true,
    data: result.products,
    meta: { total: result.total, page: result.page, limit: 20 },
  });
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(
    req.organizationId,
    req.body,
  );
  res.status(201).json({ success: true, data: product });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(
    req.organizationId,
    req.params.id,
    req.body,
  );
  res.json({ success: true, data: product });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await productService.deleteProduct(
    req.organizationId,
    req.params.id,
  );
  res.json({ success: true, data: product });
});

export const adjustStock = asyncHandler(async (req, res) => {
  const product = await productService.adjustStock(
    req.organizationId,
    req.params.id,
    req.body,
    req.user._id,
  );
  res.json({ success: true, data: product });
});
