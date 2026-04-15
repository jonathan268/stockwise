import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { AppError } from "../utils/appError.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, error: "Non autorisé" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res
        .status(401)
        .json({ success: false, error: "Utilisateur introuvable" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, error: "Token invalide ou expiré" });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ success: false, error: "Permission insuffisante" });
    }
    next();
  };
};
