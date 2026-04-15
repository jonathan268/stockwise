import cron from "node-cron";
import Organization from "../models/Organization.js";
import { generateInsightsForOrg } from "../services/ai.service.js";
import logger from "../utils/logger.js";

/**
 * Tâche exécutée tous les jours à minuit (00:00) pour générer les recommandations
 * pour les organisations éligibles.
 */
export const startAICronJob = () => {
  cron.schedule("0 0 * * *", async () => {
    logger.info("CRON [IA] : Lancement de l'analyse périodique d'inventaire...");

    const activeOrgs = await Organization.find({ isActive: true });
    
    for (const org of activeOrgs) {
      if (org.hasProAccess) {
        // Déclenche l'IA sans attendre la fin immédiate pour la prochaine boucle (non-bloquant)
        generateInsightsForOrg(org._id).catch(err => {
          logger.error(`CRON [IA] failed for org ${org._id}`, err);
        });
      }
    }
  });

  logger.info(" Tâche Cron d'IA initialisée (Planification: 00:00).");
};
