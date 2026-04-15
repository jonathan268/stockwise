import mongoose from "mongoose";
import logger from "../utils/logger.js";
import { detectTransactionSupport } from "../utils/dbUtils.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info(" MongoDB Atlas connecté");
    
    // Détecter le support des transactions
    await detectTransactionSupport();
  } catch (error) {
    logger.error(" Erreur MongoDB:", error.message);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    logger.info("🔌 Déconnecté de MongoDB");
  } catch (error) {
    logger.error(" Erreur déconnexion:", error.message);
  }
};
