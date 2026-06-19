import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";
import http from "http";
import { connectDB } from "./config/database.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import saleRoutes from "./routes/sale.routes.js";
import alertRoutes from "./routes/alert.routes.js";
import movementRoutes from "./routes/movement.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import billingRoutes from "./routes/billing.routes.js";
import recommendationRoutes from "./routes/recommendation.routes.js";
import feedbackRoutes from "./routes/feedback.routes.js";
import consoleRoutes from "./routes/console.routes.js";
import exportRoutes from "./routes/export.routes.js";
import invoiceRoutes from "./routes/invoice.routes.js";
import supplierRoutes from "./routes/supplier.routes.js";
import memberRoutes from "./routes/member.routes.js";
import supportRoutes, { adminSupportRoutes } from "./routes/support.routes.js";
import { initSocket } from "./utils/socket.js";
import { startAICronJob } from "./jobs/ai.cron.js";
import logger from "./utils/logger.js";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ─── Créer dossier logs s'il n'existe pas ─────────────────
if (!fs.existsSync("logs")) {
  fs.mkdirSync("logs");
}

// ─── Rate limiting global ──────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Trop de requêtes, réessayez plus tard", code: "RATE_LIMIT_EXCEEDED" },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Trop de tentatives, réessayez plus tard", code: "RATE_LIMIT_EXCEEDED" },
});

app.set("trust proxy", 1);
app.use("/api/", globalLimiter);

// ─── Middlewares globaux ──────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://accounts.google.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api-checkout.cinetpay.com", "https://accounts.google.com"],
      frameSrc: ["'self'", "https://accounts.google.com"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

const clientUrl = process.env.CLIENT_URL ? process.env.CLIENT_URL.replace(/\/$/, '') : "http://localhost:5173";

const allowedOrigins = [
  clientUrl,
  "http://localhost:5173",
];

const isOriginAllowed = (origin) => {
  return allowedOrigins.some((allowed) => {
    if (!allowed) return false;
    if (origin === allowed) return true;
    try {
      const allowedHost = new URL(allowed).hostname;
      const originHost = new URL(origin).hostname;
      if (originHost.endsWith(".vercel.app") || originHost.endsWith(".render.com")) return true;
    } catch {
      return false;
    }
    return false;
  });
};

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
app.use(compression());
app.use(
  morgan("combined", {
    stream: fs.createWriteStream("logs/access.log", { flags: "a" }),
  }),
);
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ─── Routes ───────────────────────────────────────────────
app.get("/api/v1/health", (req, res) => {
  res.json({ success: true, message: "API is running" });
});

app.use("/api/v1/auth", authLimiter, authRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/sales", saleRoutes);
app.use("/api/v1/alerts", alertRoutes);
app.use("/api/v1/movements", movementRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/billing", billingRoutes);
app.use("/api/v1/recommendations", recommendationRoutes);

// Routes Feedback
app.use("/api/v1/feedback", feedbackRoutes);

// Routes Export & Rapports
app.use("/api/v1/exports", exportRoutes);

// Routes Factures
app.use("/api/v1/invoices", invoiceRoutes);

// Routes Fournisseurs
app.use("/api/v1/suppliers", supplierRoutes);

// Routes Membres & Invitations
app.use("/api/v1/organization/members", memberRoutes);

// Routes Support
app.use("/api/v1/support", supportRoutes);

// ─── Super admin routes ─────────────────────────────────────
app.use("/api/v1/console", consoleRoutes);
app.use("/api/v1/console/support", adminSupportRoutes);

// ─── Fallback 404 ─────────────────────────────────────────
app.use((req, res, next) => {
  res.status(404).json({ success: false, error: "Route non trouvée" });
});

// ─── Error Handler (doit être le dernier) ─────────────────
app.use(errorHandler);

// ─── Démarrage du serveur ─────────────────────────────────
const PORT = process.env.PORT || 5000;

// Utiliser un serveur HTTP explicite pour lier Socket.io
const server = http.createServer(app);
const io = initSocket(server);

const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      logger.info(` Serveur lancé sur http://localhost:${PORT}`);
    });
    
    // Initialisation des Tâches planifiées (Cron)
    startAICronJob();

    // Graceful shutdown
    process.on("SIGTERM", () => {
      logger.info("SIGTERM reçu. Arrêt du serveur...");
      server.close(() => {
        logger.info("Serveur arrêté");
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error("Erreur au démarrage:", error.message);
    process.exit(1);
  }
};

startServer();

export default app;
