import * as dashboardService from "../services/dashboard.service.js";

export const getDashboardSummary = async (req, res, next) => {
  try {
    const summary = await dashboardService.getDashboardSummary(req.organizationId);
    
    res.status(200).json({
      success: true,
      data: summary,
      error: null
    });
  } catch (error) {
    next(error);
  }
};
