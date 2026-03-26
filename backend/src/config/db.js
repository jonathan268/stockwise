const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGO_URI_LOCAL;

    if (!uri) {
      throw new Error(
        "MONGO_URI non définie dans les variables d'environnement. Vérifiez votre fichier .env ou les secrets sur Render/Vercel.",
      );
    }

    await mongoose.connect(uri);
    console.log(" Connexion à MongoDB établie avec succès");
  } catch (error) {
    console.error(" Erreur de connexion à MongoDB:", error.message);
    throw error; // Laisser l'appelant gérer l'erreur (ex: startServer dans index.js)
  }
};

module.exports = connectDB;
