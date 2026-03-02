/**
 * Migration: Créer des organisations par défaut pour les utilisateurs sans organisation
 *
 * Usage: node backend/migrations/createDefaultOrganizations.js
 *
 * Cette migration crée une organisation par défaut pour chaque utilisateur qui n'en a pas.
 * Elle crée également un abonnement FREE pour chaque nouvelle organisation.
 */

const mongoose = require("mongoose");
require("dotenv").config();

// Models
const User = require("../src/models/User");
const Organization = require("../src/models/Organization");
const Subscription = require("../src/models/Subscription");

async function migrate() {
  try {
    // Connexion à la base de données
    console.log("🔌 Connexion à la base de données...");
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/stockwise",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    );
    console.log("✅ Base de données connectée\n");

    // Chercher tous les utilisateurs sans organisation
    console.log("🔍 Recherche des utilisateurs sans organisation...");
    const usersWithoutOrg = await User.find({
      $or: [
        { organization: null },
        { organization: undefined },
        { organization: { $exists: false } },
      ],
    });

    console.log(
      `📊 Trouvé ${usersWithoutOrg.length} utilisateurs sans organisation\n`,
    );

    if (usersWithoutOrg.length === 0) {
      console.log(
        "✨ Tous les utilisateurs ont une organisation! Rien à migrer.",
      );
      process.exit(0);
    }

    // Créer une organisation pour chaque utilisateur
    let created = 0;
    let errors = 0;

    for (const user of usersWithoutOrg) {
      try {
        console.log(`⏳ Traitement: ${user.email}...`);

        // Vérifier si l'utilisateur a déjà une organisation (au cas où)
        if (user.organization) {
          console.log(
            `   ⏭️  Utilisateur a déjà une organisation (${user.organization})`,
          );
          continue;
        }

        // Créer une organisation avec le nom de l'utilisateur
        const orgName =
          `${user.firstName} ${user.lastName}`.trim() || user.email;
        const organization = await Organization.create({
          name: orgName,
          email: user.email,
          phone: user.phone || "",
          owner: user._id,
          status: "active",
        });

        // Mettre à jour l'utilisateur
        user.organization = organization._id;
        user.ownedOrganization = organization._id;
        user.role = "owner";
        await user.save({ validateBeforeSave: false });

        // Créer abonnement FREE
        await Subscription.create({
          organization: organization._id,
          plan: "free",
          status: "active",
        });

        console.log(`   ✅ Organisation créée (${organization._id})`);
        created++;
      } catch (error) {
        console.error(`   ❌ Erreur: ${error.message}`);
        errors++;
      }
    }

    console.log(`\n📈 Migration complète!`);
    console.log(`   ✅ ${created} organisations créées`);
    console.log(`   ❌ ${errors} erreurs`);

    process.exit(errors > 0 ? 1 : 0);
  } catch (error) {
    console.error("❌ Erreur fatale:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Déconnexion de la base de données");
  }
}

// Exécuter la migration
migrate();
