import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Organization from "../models/Organization.js";
import { connectDB } from "../config/database.js";

dotenv.config();

/**
 * Script de Seeding — Setup de l'environnement initial
 * Crée le compte Super Admin global et éventuellement des datas fakes si flag --mock est passé
 */
const seedData = async () => {
  try {
    await connectDB();
    
    const isReset = process.argv.includes("--reset");

    if (isReset) {
      console.log("⚠️ Flag --reset détecté. Suppression de toutes les données...");
      await User.deleteMany({});
      await Organization.deleteMany({});
      console.log("✅ Données effacées.");
    }

    // Création Super Admin
    const adminEmail = "admin@stockwise.app";
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      await User.create({
        firstName: "Super",
        lastName: "Admin",
        email: adminEmail,
        password: "SuperSecretPassword123!", // En mode prod, forcer un format via CLI/Env
        role: "super_admin",
        organizationId: null, // Pas rattaché à un tenant
      });
      console.log("✅ Compte Super Admin créé avec succès (admin@stockwise.app).");
    } else {
      console.log("ℹ️ Le compte Super Admin existe déjà.");
    }

    // Fin propre
    mongoose.disconnect();
    console.log("🌱 Seeding terminé.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur pendant le seeding:", error);
    process.exit(1);
  }
};

seedData();
