import mongoose from "mongoose";
import logger from "./logger.js";

let _supportsTransactions = false;

/**
 * Détecte si la base de données actuelle supporte les transactions (Replica Set)
 */
export const detectTransactionSupport = async () => {
  try {
    const admin = mongoose.connection.db.admin();
    const status = await admin.serverStatus();
    
    // Si repl est présent, c'est un replica set
    _supportsTransactions = !!status.repl;
    
    if (_supportsTransactions) {
      logger.info("📡 MongoDB (ReplicaSet) - Transactions activées");
    } else {
      logger.warn("🔌 MongoDB (Standalone) - Transactions désactivées");
    }
  } catch (error) {
    _supportsTransactions = false;
    logger.warn("⚠️ Impossible de détecter le mode Réplica Set, les transactions seront désactivées par sécurité.");
  }
};

export const supportsTransactions = () => _supportsTransactions;
