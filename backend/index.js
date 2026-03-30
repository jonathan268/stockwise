require("dotenv").config();
const express = require("express");
const connectDB = require("./src/config/db");
const cors = require("cors");
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const subscriptionRoutes = require("./src/routes/subscriptionRoutes");
const passport = require("./src/config/passport");
const categoryRoutes = require("./src/routes/CategoryRoutes");
const productRoutes = require("./src/routes/productRoutes");
const stockRoutes = require("./src/routes/stockRoutes");
const orderRoutes = require("./src/routes/orderRoutes");
const supplierRoutes = require("./src/routes/supplierRoutes");
const alertRoutes = require("./src/routes/alertRoutes");
const analyticsRoutes = require("./src/routes/analyticsRoutes");
const aiRoutes = require("./src/routes/geminiRoutes"); // Utilise geminiRoutes pour /api/v1/ai
const predictionRoutes = require("./src/routes/predictionRoutes");
const organizationRoutes = require("./src/routes/organizationRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");

const app = express();

// 1. Configuration CORS (DOIT être au tout début pour gérer les preflights)
app.use(cors({
  origin: ['https://stockwise-eight.vercel.app', 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Middlewares de base
app.use(express.json());
app.use(passport.initialize());

// Suppression de l'appel direct pour passer à une initialisation asynchrone
// connectDB();

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/subscriptions", subscriptionRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/stock", stockRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/suppliers", supplierRoutes);
app.use("/api/v1/alerts", alertRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/ai", aiRoutes);
app.use("/api/v1/predictions", predictionRoutes);
app.use("/api/v1/organizations", organizationRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

// Routes de santé
app.get("/", (req, res) => {
  res.json({ message: "API StockWise fonctionnelle !" });
});

// 404: Route non trouvée - DOIT être AVANT le middleware d'erreur
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} non trouvée`,
    statusCode: 404,
  });
});

// Middleware d'erreur global (DOIT être le dernier middleware)
app.use((err, req, res, next) => {
  console.error("ERREUR:", err);

  // Erreur opérationnelle attendue
  if (err.isOperational) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
      statusCode: err.statusCode || 500,
      ...(err.errors && { errors: err.errors }),
    });
  }

  // Erreur interne non gérée
  console.error("ERREUR NON GÉRÉE:", err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Erreur interne du serveur",
    statusCode: 500,
    stack: err.stack,
    error: err.message,
  });
});

const PORT = process.env.PORT || 3000;

// Fonction de démarrage du serveur
const startServer = async () => {
  try {
    // 1. Attendre la connexion à la base de données avant de démarrer le serveur
    console.log("Tentative de connexion à MongoDB...");
    await connectDB();
    
    // 2. Démarrer le serveur
    app.listen(PORT, () => {
      console.log(` Serveur démarré avec succès sur le port ${PORT}`);
      console.log(` CORS autorisés pour: https://stockwise-eight.vercel.app`);
    });
  } catch (error) {
    console.error(" Échec du démarrage du serveur:", error.message);
    process.exit(1);
  }
};

startServer();
