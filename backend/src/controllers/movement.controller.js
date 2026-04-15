import * as movementService from "../services/movement.service.js";

export const createMovement = async (req, res, next) => {
  try {
    const movement = await movementService.createMovement(
      req.organizationId,
      req.body,
      req.user._id
    );

    res.status(201).json({
      success: true,
      data: movement,
      error: null
    });
  } catch (error) {
    next(error);
  }
};

export const getMovements = async (req, res, next) => {
  try {
    const { movements, total, page, totalPages } = await movementService.getMovements(
      req.organizationId,
      req.query
    );

    res.status(200).json({
      success: true,
      data: movements,
      meta: { total, page, totalPages, limit: Number(req.query.limit || 20) },
      error: null
    });
  } catch (error) {
    next(error);
  }
};
