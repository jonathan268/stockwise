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
const aiRoutes = require("./src/routes/aiRoutes");
const organizationRoutes = require("./src/routes/organizationRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");

const app = express();
app.use(express.json());
app.use(passport.initialize());

// Configuration CORS
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? "https://stockwise-eight.vercel.app"
        : ["http://localhost:5173", "https://stockwise-backend-q7s1.onrender.com"],
    credentials: true,
  }),
);

connectDB();

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
    message: "Erreur interne du serveur",
    statusCode: 500,
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
      error: err.message,
    }),
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
