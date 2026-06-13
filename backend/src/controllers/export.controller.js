import { asyncHandler } from "../utils/appError.js";
import * as exportService from "../services/export.service.js";

export const exportProducts = asyncHandler(async (req, res) => {
  const csv = await exportService.exportProductsCSV(req.organizationId);
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename=produits-${Date.now()}.csv`);
  res.send("\uFEFF" + csv);
});

export const exportSales = asyncHandler(async (req, res) => {
  const csv = await exportService.exportSalesCSV(req.organizationId);
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename=ventes-${Date.now()}.csv`);
  res.send("\uFEFF" + csv);
});

export const exportMovements = asyncHandler(async (req, res) => {
  const csv = await exportService.exportMovementsCSV(req.organizationId);
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename=mouvements-${Date.now()}.csv`);
  res.send("\uFEFF" + csv);
});

export const getProfitabilityReport = asyncHandler(async (req, res) => {
  const report = await exportService.getProfitabilityReport(req.organizationId);
  res.json({ success: true, data: report });
});

export const getDeadStockReport = asyncHandler(async (req, res) => {
  const report = await exportService.getDeadStockReport(req.organizationId);
  res.json({ success: true, data: report });
});
