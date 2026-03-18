const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI_LOCAL || process.env.MONGO_URI_LOCAL;

    if (!uri) {
      throw new Error(
        "Aucune URI MongoDB fournie. Définissez MONGO_URI (prod) ou MONGO_URI_LOCAL (dev) dans vos variables d'environnement.",
      );
    }

    await mongoose.connect(uri);
    console.log("Connecté à MongoDB avec succès");
  } catch (error) {
    console.error("Erreur de connexion à MongoDB:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
