import mongoose from 'mongoose';
import logger from './logger.js';

let _supportsTransactions = false;

/**
 * Détecte si la base de données actuelle supporte les transactions (Replica Set)
 */
export const detectTransactionSupport = async () => {
  try {
    // Méthode 1 : Utiliser la commande 'hello' (ne nécessite pas de privilèges admin)
    const result = await mongoose.connection.db.command({ hello: 1 });

    // Si 'setName' est présent, c'est un replica set
    _supportsTransactions = !!result.setName;

    if (_supportsTransactions) {
      logger.info(' MongoDB (ReplicaSet) - Transactions activées');
    } else {
      logger.warn(' MongoDB (Standalone) - Transactions désactivées');
    }
  } catch (error) {
    // Méthode 2 (fallback) : Vérifier si l'URI utilise mongodb+srv (Atlas = toujours replica set)
    const uri = process.env.MONGODB_URI || '';
    if (uri.startsWith('mongodb+srv')) {
      _supportsTransactions = true;
      logger.info(' MongoDB Atlas détecté via URI - Transactions activées');
    } else {
      _supportsTransactions = false;
      logger.warn(' MongoDB (Standalone) - Transactions désactivées');
    }
  }
};

export const supportsTransactions = () => _supportsTransactions;
