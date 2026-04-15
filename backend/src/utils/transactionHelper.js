import mongoose from "mongoose";
import { supportsTransactions } from "./dbUtils.js";

/**
 * Exécute une fonction dans une transaction si supporté par le serveur MongoDB.
 * Sinon, exécute la fonction normalement.
 * 
 * @param {Function} callback - La fonction à exécuter. Reçoit { session, opt } en argument.
 * @returns {Promise<any>} Le résultat du callback.
 */
export const runInTransaction = async (callback) => {
  if (!supportsTransactions()) {
    // Mode Standalone : On exécute sans aucune session
    return await callback({ session: null, opt: {} });
  }

  // Mode Replica Set : On utilise une vraie transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const result = await callback({ session, opt: { session } });
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
