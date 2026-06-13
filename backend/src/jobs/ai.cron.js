import cron from "node-cron";
import Organization from "../models/Organization.js";
import { generateInsightsForOrg } from "../services/ai.service.js";
import logger from "../utils/logger.js";

/**
 * Tâche exécutée tous les jours à minuit (00:00) pour générer les recommandations
 * pour les organisations éligibles.
 */
const BATCH_SIZE = 10;
const BATCH_DELAY_MS = 2000;

const processBatch = async (orgs, startIndex) => {
  const endIndex = Math.min(startIndex + BATCH_SIZE, orgs.length);
  const batch = orgs.slice(startIndex, endIndex);

  await Promise.allSettled(
    batch.map((org) =>
      generateInsightsForOrg(org._id).catch((err) => {
        logger.error(`CRON [IA] failed for org ${org._id}`, err);
      }),
    ),
  );

  if (endIndex < orgs.length) {
    setTimeout(() => processBatch(orgs, endIndex), BATCH_DELAY_MS);
  }
};

export const startAICronJob = () => {
  cron.schedule("0 0 * * *", async () => {
    logger.info("CRON [IA] : Lancement de l'analyse périodique d'inventaire...");

    const activeOrgs = await Organization.find({ isActive: true });
    const eligibleOrgs = activeOrgs.filter((org) => org.hasProAccess);

    if (eligibleOrgs.length === 0) {
      logger.info("CRON [IA] : Aucune organisation éligible.");
      return;
    }

    logger.info(`CRON [IA] : ${eligibleOrgs.length} organisations à traiter (par lots de ${BATCH_SIZE})`);
    processBatch(eligibleOrgs, 0);
  });

  logger.info(" Tâche Cron d'IA initialisée (Planification: 00:00).");
};
