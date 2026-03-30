const cron = require("node-cron");
const Subscription = require("../models/Subscription");
const Organization = require("../models/Organization");

class CronService {
  start() {
    // Exécuter tous les jours à minuit
    cron.schedule("0 0 * * *", async () => {
      console.log("Exécution de la tâche cron: Vérification des abonnements expirés...");
      try {
        await Subscription.checkExpiredSubscriptions();
        console.log("Abonnements expirés vérifiés.");
      } catch (error) {
        console.error("Erreur lors de la vérification des abonnements:", error);
      }
    });

    // Nettoyer les invitations expirées tous les jours à 01h00
    cron.schedule("0 1 * * *", async () => {
      console.log("Exécution de la tâche cron: Nettoyage des invitations expirées...");
      try {
        await Organization.cleanExpiredInvitations();
        console.log("Invitations expirées nettoyées.");
      } catch (error) {
        console.error("Erreur lors du nettoyage des invitations:", error);
      }
    });

    console.log("Services Cron démarrés.");
  }
}

module.exports = new CronService();
