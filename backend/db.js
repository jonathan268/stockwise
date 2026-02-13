const mongoose = require("mongoose");
const uri = "mongodb+srv://darrenjonathan97_stockwise:<db_password>@cluster0.esnbapp.mongodb.net/?appName=Cluster0";
require("dotenv").config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connecté à MongoDB avec succès");
  } catch (error) {
    console.error("Erreur de connexion à MongDB:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
