require("dotenv").config();
const express = require("express");
const connectDB = require("./db");
const authRoutes = require("./src/routes/authRoutes");
const fournisseurRoutes = require("./src/routes/fournisseurRoutes");
const stockRoutes = require("./src/routes/stockRoutes");
const userRoutes = require("./src/routes/userRoutes");
const produitRoutes = require("./src/routes/produitRoutes");
const subscriptionRoutes = require("./src/routes/subscriptionRoutes");

const app = express();
app.use(express.json());

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/produits", produitRoutes);
app.use("/api/stocks", stockRoutes);
app.use("/api/fournisseurs", fournisseurRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API StockWise fonctionne !" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
