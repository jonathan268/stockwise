import { asyncHandler } from "../utils/appError.js";
import * as dashboardService from "../services/dashboard.service.js";

export const getDashboardSummary = asyncHandler(async (req, res) => {
  const summary = await dashboardService.getDashboardSummary(req.organizationId);

  res.json({
    success: true,
    data: summary,
  });
});
