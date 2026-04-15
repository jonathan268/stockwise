# STOCKWISE — DOCUMENT DE CONCEPTION MVP
**Stack :**  
→ Frontend : React 19 · Vite 6 · DaisyUI 5 · Framer Motion 12 · Lucide React 0.487 · Zustand 5 · TanStack Query v5 · React Router v7  
→ PWA : Vite PWA Plugin 0.21 · Workbox 7 · IndexedDB (idb 8) · Background Sync API  
→ Typographie : Google Fonts — Syne (display) + DM Sans (body) — chargement natif  
→ Backend : Node.js 22 LTS · Express 5 · Mongoose 8 · node-cron 4 · Socket.io 4.8 · Joi 17 · Nodemailer 7  
→ IA : Google Gemini 2.5 Flash (`gemini-2.5-flash-preview-04-17`)  
→ Paiement : NotchPay (`notchpay.js` latest) — XAF natif — MTN MoMo · Orange Money  
→ BDD : MongoDB Atlas 7 (cluster M0 MVP → M10 production)  
**Modèle :** Multi-tenant SaaS · Trial 30j · Plans Starter / Pro / Entreprise  
**Design :** Mobile First · Bottom Nav (mobile) · Sidebar (desktop) · PWA Offline-first  
**Flow :** Stock → Vente → Alertes → Recommandations IA  
**Version :** 4.0 — MVP

---

## TABLE DES MATIÈRES

1. [Vue d'ensemble & principes fondamentaux](#1-vue-densemble)
2. [Configuration initiale du projet](#2-configuration-initiale)
3. [Architecture multi-tenant](#3-architecture-multi-tenant)
4. [Authentification & Routage par rôle](#4-authentification)
5. [Gestion des produits & catégories](#5-gestion-des-produits)
6. [Gestion du stock](#6-gestion-du-stock)
7. [Gestion des ventes](#7-gestion-des-ventes)
8. [Dashboard](#8-dashboard)
9. [Recommandations IA — Gemini 2.5 Flash](#9-recommandations-ia)
10. [Notifications & Alertes](#10-notifications--alertes)
11. [Abonnements, Trial & Billing NotchPay](#11-abonnements-trial--billing-notchpay)
12. [Design Mobile First & Typographie Google Fonts](#12-design-mobile-first--typographie)
13. [PWA — Offline First & Synchronisation](#13-pwa--offline-first--synchronisation)
14. [Super Admin — Dashboard SaaS & Seeder](#14-super-admin--dashboard-saas--seeder)
15. [Système de Feedback Utilisateur](#15-système-de-feedback-utilisateur)
16. [Déploiement](#16-déploiement)
17. [Ordre de build recommandé](#17-ordre-de-build)

---

## 1. VUE D'ENSEMBLE

### 1.1 Flow utilisateur principal

```
[Inscription org] → [Trial 30j — accès complet] → [Ajout produits] → [Gestion stock]
                                                                             ↓
                              [Recommandations IA] ←— [Ventes] ——→ [Alertes]
                                      ↓
                    [Trial expiré → Upgrade plan NotchPay]
```

Le MVP repose sur un flow intentionnellement linéaire :
- L'utilisateur **crée son compte** → bénéficie de **30 jours d'accès complet gratuit**
- Il **crée son stock** (produits + quantités) et **enregistre ses ventes** au quotidien
- Le système **détecte les anomalies** et déclenche des alertes
- L'IA **analyse les tendances** et formule des recommandations actionnables
- **À J+30**, les fonctionnalités Pro sont verrouillées → l'utilisateur est invité à souscrire

### 1.2 Plans d'abonnement

| Fonctionnalité | 🆓 Starter | ⚡ Pro | 🏢 Entreprise |
|---|---|---|---|
| **Prix mensuel** | Gratuit | 9 900 XAF | Sur devis |
| Produits | 100 max | Illimité | Illimité |
| Utilisateurs | 3 max | 10 max | Illimité |
| Gestion stock | ✅ | ✅ | ✅ |
| Gestion ventes | ✅ | ✅ | ✅ |
| Dashboard | ✅ | ✅ | ✅ |
| Alertes stock | ✅ | ✅ | ✅ |
| **Recommandations IA** | ❌ | ✅ | ✅ |
| **Alertes IA Gemini** | ❌ | ✅ | ✅ |
| Export PDF/Excel | ❌ | ✅ | ✅ |
| Support prioritaire | ❌ | ❌ | ✅ |
| **Paiement** | — | NotchPay | Contact |

### 1.3 Règle du Trial — 30 jours

```
Inscription → trialEndsAt = now + 30j → accès TOUT (comme Pro)
                                              ↓
                                    À J+30 : CRON check
                                              ↓
                    plan === "starter" && trialEndsAt < now
                                              ↓
                    → features IA désactivées côté middleware
                    → Banner d'upgrade affiché dans l'UI
                    → Email de rappel envoyé (J-7, J-3, J0)
```

### 1.4 Principes de conception non-négociables

**Isolation tenant absolue** : chaque document MongoDB possède un champ `organizationId`. Le middleware tenant l'injecte automatiquement sur chaque requête. Aucune donnée ne peut fuiter entre organisations.

**Réponse API uniforme** : toutes les routes retournent le même format :
```json
{
  "success": true,
  "data": {},
  "meta": { "total": 0, "page": 1, "limit": 20 },
  "error": null
}
```

**Validation en deux temps** : Joi côté serveur (source de vérité), validation légère côté client pour le feedback immédiat.

**IA non-bloquante** : les recommandations Gemini sont calculées en arrière-plan (CRON). Le dashboard ne dépend jamais d'un appel IA en temps réel.

---

## 2. CONFIGURATION INITIALE

### 2.1 Structure des dépôts

```
stockwise/
├── client/          ← React App (Vite)
├── server/          ← Node.js API
└── README.md
```

### 2.2 Setup Backend

```bash
mkdir server && cd server
npm init -y
npm install express@5 mongoose@8 dotenv cors helmet morgan compression \
            express-rate-limit jsonwebtoken bcryptjs joi@17 \
            node-cron nodemailer socket.io axios crypto-js \
            @google/generative-ai winston
npm install -D nodemon
```

> **Note versions :** Express 5 est la dernière version stable. Mongoose 8 supporte nativement les sessions et le `strictQuery`. Node.js 22 LTS est requis.

**server/package.json** — scripts :
```json
{
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js"
  }
}
```

**server/.env.example** :
```env
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_super_secret_key_min_64_chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your@email.com
MAIL_PASS=your_app_password
# NotchPay
NOTCHPAY_PUBLIC_KEY=pk_live_xxxxx
NOTCHPAY_PRIVATE_KEY=sk_live_xxxxx
NOTCHPAY_WEBHOOK_HASH=your_webhook_hash_secret
NODE_ENV=development
```

### 2.3 Setup Frontend

```bash
npm create vite@6 client -- --template react
cd client
npm install axios react-router-dom@7 @tanstack/react-query@5 zustand@5 \
            framer-motion@12 lucide-react@0.487 socket.io-client recharts
npm install -D tailwindcss@4 postcss autoprefixer daisyui@5
npx tailwindcss init -p
```

> **Note DaisyUI 5 :** La v5 utilise la syntaxe `@plugin "daisyui"` dans le CSS au lieu de `plugins` dans `tailwind.config.js`.

**src/index.css** (DaisyUI 5 — nouvelle syntaxe) :
```css
@import "tailwindcss";
@plugin "daisyui" {
  themes: stockwise --default;
}

@theme {
  /* Thème StockWise custom */
  --color-primary: oklch(75% 0.18 60);       /* Amber */
  --color-secondary: oklch(72% 0.15 220);    /* Sky blue */
  --color-accent: oklch(65% 0.18 290);       /* Violet */
  --color-neutral: oklch(20% 0.02 260);
  --color-base-100: oklch(10% 0.02 260);
  --color-base-200: oklch(14% 0.02 260);
  --color-base-300: oklch(18% 0.02 260);
  --color-success: oklch(72% 0.17 162);
  --color-warning: oklch(75% 0.18 60);
  --color-error: oklch(62% 0.22 15);
}
```

**vite.config.js** :
```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": { target: "http://localhost:5000", changeOrigin: true },
      "/socket.io": { target: "http://localhost:5000", ws: true },
    },
  },
});
```

**client/.env.local** :
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```

---

## 3. ARCHITECTURE MULTI-TENANT

> C'est la décision architecturale la plus critique du projet. Tout repose dessus.

### 3.1 Modèle de données tenant

Chaque document métier (produit, vente, mouvement…) possède obligatoirement :
```js
organizationId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Organization",
  required: true,
  index: true
}
```

### 3.2 Organization Model

```js
// server/src/models/Organization.model.js
import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, lowercase: true },
  logo: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // ─── Plans & Abonnement ───────────────────────────────────────
  plan: {
    type: String,
    enum: ["starter", "pro", "enterprise"],
    default: "starter",
  },
  // Période d'essai : 30 jours dès l'inscription
  trialEndsAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },
  // True si le trial est actif ET non expiré
  isTrialActive: { type: Boolean, default: true },

  settings: {
    currency: { type: String, default: "XAF" },
    timezone: { type: String, default: "Africa/Douala" },
    lowStockAlertEmail: { type: Boolean, default: true },
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Virtual : accès aux features Pro (trial actif OU plan pro/enterprise)
organizationSchema.virtual("hasProAccess").get(function () {
  const trialValid = this.isTrialActive && this.trialEndsAt > new Date();
  return trialValid || this.plan === "pro" || this.plan === "enterprise";
});

organizationSchema.set("toJSON", { virtuals: true });

export default mongoose.model("Organization", organizationSchema);
```

### 3.3 Tenant Middleware — LE FICHIER LE PLUS IMPORTANT

```js
// server/src/middleware/tenant.middleware.js

/**
 * Ce middleware s'exécute après auth.middleware.
 * Il injecte req.organizationId sur TOUTES les requêtes authentifiées.
 * Chaque service doit utiliser ce champ pour filtrer ses queries.
 */
export const tenantMiddleware = (req, res, next) => {
  if (!req.user?.organizationId) {
    return res.status(403).json({
      success: false,
      error: "Organization context missing",
    });
  }
  req.organizationId = req.user.organizationId;
  next();
};

/**
 * Helper à utiliser dans tous les services Mongoose :
 * Product.find({ organizationId: req.organizationId, ...otherFilters })
 * 
 * RÈGLE : Ne jamais faire Product.find() sans le filtre organizationId.
 */
```

### 3.4 Règle d'or pour les services

```js
// TOUJOURS faire ça :
const products = await Product.find({
  organizationId: req.organizationId,
  isDeleted: false
});

// JAMAIS faire ça :
const products = await Product.find({}); // ← FUITE DE DONNÉES ENTRE TENANTS
```

---

## 4. AUTHENTIFICATION & ROUTAGE PAR RÔLE

> Le système gère **4 rôles distincts** avec des redirections automatiques à la connexion.

### 4.0 Matrice des rôles

| Rôle | Portée | Accès | Créé par |
|---|---|---|---|
| `super_admin` | Global SaaS | Dashboard SaaS complet | Script seeder.js |
| `owner` | Son organisation | Toutes les features de son plan | Inscription |
| `admin` | Son organisation | Idem owner sauf billing | Invitation par owner |
| `staff` | Son organisation | Lecture + ventes seulement | Invitation par owner/admin |

### 4.0.1 Logique de routage à la connexion

```
POST /api/v1/auth/login
        ↓
  Vérification email + password
        ↓
   ┌────────────┬────────────────┬─────────────────┐
   │ super_admin│ owner / admin  │ Pas de match    │
   │            │ / staff        │ (email inconnu) │
   └─────┬──────┴───────┬────────┴────────┬────────┘
         ↓              ↓                 ↓
  Redirect           Redirect         Retour erreur
  /console           /dashboard       + lien /register
  (Dashboard SaaS)   (App client)
```

**Côté frontend — LoginPage.jsx (code complet avec comparaison de rôle) :**
```jsx
// client/src/features/auth/pages/LoginPage.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, LogIn, AlertCircle, UserPlus } from "lucide-react";
import { useAuthStore } from "../../../store/authStore";

export default function LoginPage() {
  const [form, setForm]       = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);   // { message, code, showRegister }
  const { login }             = useAuthStore();
  const navigate              = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await login(form.email, form.password);
      const { user } = data;

      // ─── Comparaison de rôle → redirection automatique ───────────
      if (user.role === "super_admin") {
        navigate("/console", { replace: true });      // Dashboard SaaS
      } else if (["owner", "admin", "staff"].includes(user.role)) {
        navigate("/dashboard", { replace: true });    // App client
      } else {
        // Rôle inconnu — sécurité défensive
        navigate("/login", { replace: true });
      }

    } catch (err) {
      const code    = err.response?.data?.code;
      const message = err.response?.data?.message;

      // ─── Messages d'erreur contextualisés ─────────────────────────
      if (code === "USER_NOT_FOUND") {
        setError({
          code,
          message: "Aucun compte trouvé avec cet email.",
          showRegister: true,       // Invite à créer un compte
        });
      } else if (code === "WRONG_PASSWORD") {
        setError({
          code,
          message: "Mot de passe incorrect. Vérifiez vos identifiants.",
          showRegister: false,
        });
      } else if (code === "ACCOUNT_DISABLED") {
        setError({
          code,
          message: "Ce compte a été désactivé. Contactez le support.",
          showRegister: false,
        });
      } else {
        setError({ message: message || "Erreur de connexion. Réessayez.", showRegister: false });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card w-full max-w-md bg-base-200 shadow-xl"
      >
        <div className="card-body gap-5">
          {/* Header */}
          <div>
            <h1 className="font-display text-2xl font-bold text-primary">⬡ StockWise</h1>
            <p className="text-base-content/60 text-sm mt-1">
              Connectez-vous à votre espace
            </p>
          </div>

          {/* Bloc erreur */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="alert alert-error flex-col items-start gap-2"
              >
                <div className="flex gap-2 items-center">
                  <AlertCircle size={16} />
                  <span className="text-sm font-medium">{error.message}</span>
                </div>

                {/* CTA Créer un compte si email inconnu */}
                {error.showRegister && (
                  <Link
                    to="/register"
                    className="btn btn-sm btn-ghost gap-2 self-start mt-1 text-error-content"
                  >
                    <UserPlus size={14} />
                    Créer un compte gratuitement →
                  </Link>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="input input-bordered flex items-center gap-2">
              <Mail size={16} className="text-base-content/40" />
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
                className="grow"
              />
            </label>

            <label className="input input-bordered flex items-center gap-2">
              <Lock size={16} className="text-base-content/40" />
              <input
                type="password"
                placeholder="Mot de passe"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                autoComplete="current-password"
                className="grow"
              />
            </label>

            <button
              type="submit"
              className="btn btn-primary w-full gap-2"
              disabled={loading}
            >
              {loading
                ? <span className="loading loading-spinner loading-sm" />
                : <LogIn size={16} />
              }
              {loading ? "Connexion…" : "Se connecter"}
            </button>
          </form>

          {/* Lien inscription */}
          <p className="text-center text-sm text-base-content/60">
            Pas encore de compte ?{" "}
            <Link to="/register" className="link link-primary font-medium">
              Essayez gratuitement 30 jours
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
```

**Côté serveur — auth.service.js — codes d'erreur explicites :**
```js
export const loginService = async ({ email, password }) => {
  // 1. Chercher l'utilisateur
  const user = await User.findOne({ email }).select("+password +refreshToken");

  if (!user) {
    throw new AppError("Aucun compte trouvé avec cet email.", 404, "USER_NOT_FOUND");
  }

  if (!user.isActive) {
    throw new AppError("Ce compte a été désactivé.", 403, "ACCOUNT_DISABLED");
  }

  // 2. Vérifier le mot de passe
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError("Mot de passe incorrect.", 401, "WRONG_PASSWORD");
  }

  // 3. Mettre à jour lastLogin
  user.lastLogin = new Date();

  // 4. Générer les tokens
  const { accessToken, refreshToken } = generateTokens(user);
  user.refreshToken = await bcrypt.hash(refreshToken, 10);
  await user.save();

  // 5. Charger l'organisation (null pour super_admin)
  let organization = null;
  if (user.organizationId) {
    organization = await Organization.findById(user.organizationId);
  }

  // 6. La réponse inclut le rôle → le frontend redirige en conséquence
  return { user, organization, accessToken, refreshToken };
};
```

**AppError — classe d'erreur avec code :**
```js
// server/src/utils/AppError.js
export class AppError extends Error {
  constructor(message, statusCode = 500, code = "INTERNAL_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;          // ← Code machine lisible par le frontend
    this.isOperational = true;
  }
}

// errorHandler.middleware.js — expose le code dans la réponse
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message,
    code: err.code || "INTERNAL_ERROR",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});
```

### 4.1 User Model

```js
// server/src/models/User.model.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 8, select: false },
  role: {
    type: String,
    enum: ["super_admin", "owner", "admin", "staff"],
    default: "staff",
  },
  // Null pour les super_admin (ils n'appartiennent à aucune org)
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    default: null,
  },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  refreshToken: { type: String, select: false },
}, { timestamps: true });

// Hash du mot de passe avant sauvegarde
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Méthode de comparaison
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Ne jamais exposer le password dans les réponses
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  return obj;
};

export default mongoose.model("User", userSchema);
```

### 4.2 Auth Routes

```
POST   /api/v1/auth/register     ← Création compte + organisation
POST   /api/v1/auth/login        ← Login → retourne access + refresh token
POST   /api/v1/auth/refresh      ← Renouvèle access token
POST   /api/v1/auth/logout       ← Invalide refresh token
GET    /api/v1/auth/me           ← Profil utilisateur connecté
```

### 4.3 Auth Service — Login avec routage par rôle

```js
// server/src/services/auth.service.js

export const loginService = async ({ email, password }) => {
  // 1. Chercher l'utilisateur (inclure password pour comparaison)
  const user = await User.findOne({ email }).select("+password +refreshToken");

  // Erreur spécifique si l'email n'existe pas → frontend peut proposer l'inscription
  if (!user) {
    throw new AppError("Aucun compte trouvé avec cet email.", 404, "USER_NOT_FOUND");
  }

  if (!user.isActive) {
    throw new AppError("Compte désactivé. Contactez le support.", 403, "ACCOUNT_DISABLED");
  }

  // 2. Vérifier le mot de passe
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AppError("Mot de passe incorrect.", 401, "WRONG_PASSWORD");
  }

  // 3. Générer les tokens
  const { accessToken, refreshToken } = generateTokens(user);
  user.refreshToken = await bcrypt.hash(refreshToken, 10);
  user.lastLogin = new Date();
  await user.save();

  // 4. Récupérer l'organisation (null pour super_admin)
  let organization = null;
  if (user.organizationId) {
    organization = await Organization.findById(user.organizationId);
  }

  // 5. Retourner les données + le rôle pour le routage côté client
  return {
    user,
    organization,
    accessToken,
    refreshToken,
    // Indication explicite pour le frontend
    redirectTo: user.role === "super_admin" ? "console" : "dashboard",
  };
};
```

**AppError avec code d'erreur métier :**
```js
// server/src/utils/appError.util.js
export class AppError extends Error {
  constructor(message, statusCode, code = "GENERIC_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;           // Code lisible par le frontend
    this.isOperational = true;
  }
}
```

**Réponse d'erreur uniforme retournée par le errorHandler :**
```json
{
  "success": false,
  "error": "Aucun compte trouvé avec cet email.",
  "code": "USER_NOT_FOUND"
}
```

```js
// server/src/services/auth.service.js

export const registerService = async ({ firstName, lastName, email, password, organizationName }) => {
  // 1. Vérifier si l'email existe déjà
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new AppError("Email already in use", 400);

  // 2. Créer l'organisation
  const slug = slugify(organizationName, { lower: true, strict: true });
  const organization = await Organization.create({
    name: organizationName,
    slug: `${slug}-${Date.now()}`,
  });

  // 3. Créer le user owner
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    role: "owner",
    organizationId: organization._id,
  });

  // 4. Mettre à jour l'owner dans l'org
  organization.owner = user._id;
  await organization.save();

  // 5. Générer les tokens
  const { accessToken, refreshToken } = generateTokens(user);
  
  // 6. Sauvegarder le refresh token hashé
  user.refreshToken = await bcrypt.hash(refreshToken, 10);
  await user.save();

  return { user, organization, accessToken, refreshToken };
};
```

### 4.4 JWT Utils

```js
// server/src/utils/jwt.util.js
import jwt from "jsonwebtoken";

export const generateTokens = (user) => {
  const payload = {
    userId: user._id,
    organizationId: user.organizationId,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN, // 7d
  });

  const refreshToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET + "_refresh",
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN } // 30d
  );

  return { accessToken, refreshToken };
};

export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
```

### 4.5 Auth Middleware

```js
// server/src/middleware/auth.middleware.js
import { verifyToken } from "../utils/jwt.util.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, error: "Non autorisé" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    const user = await User.findById(decoded.userId).select("-password -refreshToken");
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, error: "Utilisateur introuvable" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: "Token invalide ou expiré" });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: "Permission insuffisante" });
    }
    next();
  };
};
```

### 4.6 Frontend — Auth Store (Zustand)

```js
// client/src/store/authStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import axiosInstance from "../lib/axios";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      organization: null,
      accessToken: null,
      isAuthenticated: false,

      // Retourne la destination de redirect selon le rôle
      login: async (email, password) => {
        const { data } = await axiosInstance.post("/auth/login", { email, password });
        set({
          user: data.data.user,
          organization: data.data.organization,
          accessToken: data.data.accessToken,
          isAuthenticated: true,
        });
        // Retourner la destination pour que LoginPage puisse navigate()
        return data.data.redirectTo; // "console" | "dashboard"
      },

      logout: async () => {
        await axiosInstance.post("/auth/logout");
        set({ user: null, organization: null, accessToken: null, isAuthenticated: false });
      },

      isSuperAdmin: () => get().user?.role === "super_admin",
      updateOrganization: (org) => set({ organization: org }),
      setAccessToken: (token) => set({ accessToken: token }),
    }),
    {
      name: "auth-storage",
      partializer: (state) => ({
        user: state.user,
        organization: state.organization,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
```

### 4.7 Axios Instance avec interceptors

```js
// client/src/lib/axios.js
import axios from "axios";
import { useAuthStore } from "../store/authStore";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Injecte le token sur chaque requête
axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Gestion auto du refresh token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        useAuthStore.getState().setAccessToken(data.data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return axiosInstance(originalRequest);
      } catch {
        useAuthStore.getState().logout();
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
```

### 4.8 Pages Auth — Frontend

**LoginPage.jsx** — avec routage par rôle et gestion d'erreurs spécifiques :
```jsx
// client/src/features/auth/pages/LoginPage.jsx
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, LogIn, UserPlus, AlertCircle } from "lucide-react";
import { useAuthStore } from "../../../store/authStore";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);      // { message, showRegister, code }
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // login() retourne "console" | "dashboard"
      const redirectTo = await login(form.email, form.password);
      navigate(`/${redirectTo}`, { replace: true });
    } catch (err) {
      const code = err.response?.data?.code;
      const message = err.response?.data?.error || "Erreur de connexion";

      setError({
        message,
        code,
        // Proposer l'inscription uniquement si l'email n'existe pas
        showRegister: code === "USER_NOT_FOUND",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen flex items-center justify-center bg-base-100 p-4"
    >
      <div className="card w-full max-w-md bg-base-200 shadow-xl">
        <div className="card-body gap-4">
          <div className="text-center">
            <h1 className="font-display text-3xl font-bold text-primary">⬡ StockWise</h1>
            <p className="text-base-content/60 text-sm mt-1">
              Connectez-vous à votre espace
            </p>
          </div>

          {/* Zone d'erreur avec AnimatePresence */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className={`alert ${error.showRegister ? "alert-warning" : "alert-error"} flex-col items-start gap-2`}
              >
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span className="text-sm font-medium">{error.message}</span>
                </div>

                {/* CTA Inscription si email introuvable */}
                {error.showRegister && (
                  <Link
                    to="/register"
                    className="btn btn-sm btn-outline btn-warning gap-2 w-full mt-1"
                  >
                    <UserPlus size={14} />
                    Créer un compte gratuitement
                  </Link>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="input input-bordered flex items-center gap-2">
              <Mail size={16} className="text-base-content/40 shrink-0" />
              <input
                type="email"
                placeholder="Adresse email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="grow"
                autoComplete="email"
              />
            </label>

            <label className="input input-bordered flex items-center gap-2">
              <Lock size={16} className="text-base-content/40 shrink-0" />
              <input
                type="password"
                placeholder="Mot de passe"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                className="grow"
                autoComplete="current-password"
              />
            </label>

            <button
              type="submit"
              className="btn btn-primary w-full gap-2"
              disabled={loading}
            >
              {loading
                ? <span className="loading loading-spinner loading-sm" />
                : <LogIn size={16} />
              }
              {loading ? "Connexion en cours…" : "Se connecter"}
            </button>
          </form>

          {/* Lien inscription — affiché uniquement si pas d'erreur USER_NOT_FOUND */}
          {!error?.showRegister && (
            <p className="text-center text-sm text-base-content/60">
              Pas encore de compte ?{" "}
              <Link to="/register" className="link link-primary font-medium">
                S'inscrire gratuitement
              </Link>
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
```

**SuperAdminRoute.jsx — protection des routes /console :**
```jsx
// client/src/routes/SuperAdminRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function SuperAdminRoute() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== "super_admin") return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}
```

---

## 5. GESTION DES PRODUITS

### 5.1 Product Model

```js
// server/src/models/Product.model.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
    index: true,
  },
  name: { type: String, required: true, trim: true },
  sku: { type: String, trim: true },          // Code produit unique par org
  description: { type: String },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  image: { type: String },                     // URL Cloudinary
  
  // Prix
  sellingPrice: { type: Number, required: true, min: 0 },
  costPrice: { type: Number, default: 0, min: 0 },
  
  // Stock
  currentStock: { type: Number, default: 0, min: 0 },
  minimumStock: { type: Number, default: 5, min: 0 }, // Seuil alerte
  unit: { type: String, default: "unité" },           // kg, litre, boîte...
  
  // Statut
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },       // Soft delete
  
  // Méta IA (calculés par le CRON)
  salesVelocity: { type: Number, default: 0 },        // Ventes moyennes/jour
  lastSoldAt: { type: Date },
  
}, { timestamps: true });

// Index composite pour isolation tenant + recherche
productSchema.index({ organizationId: 1, isDeleted: 1 });
productSchema.index({ organizationId: 1, sku: 1 }, { unique: true, sparse: true });

// Virtual : statut du stock
productSchema.virtual("stockStatus").get(function () {
  if (this.currentStock === 0) return "out";
  if (this.currentStock <= this.minimumStock) return "low";
  return "ok";
});

productSchema.set("toJSON", { virtuals: true });

export default mongoose.model("Product", productSchema);
```

### 5.2 Category Model

```js
// server/src/models/Category.model.js
const categorySchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
  name: { type: String, required: true, trim: true },
  color: { type: String, default: "#f59e0b" },
  icon: { type: String, default: "Package" }, // Nom icône Lucide
}, { timestamps: true });

categorySchema.index({ organizationId: 1 });
```

### 5.3 Product Routes

```
GET    /api/v1/products              ← Liste (filtres: category, status, search)
POST   /api/v1/products              ← Créer produit
GET    /api/v1/products/:id          ← Détail produit
PUT    /api/v1/products/:id          ← Modifier produit
DELETE /api/v1/products/:id          ← Soft delete
PATCH  /api/v1/products/:id/stock    ← Ajustement manuel stock
GET    /api/v1/products/low-stock    ← Produits sous seuil min
```

### 5.4 Product Service

```js
// server/src/services/product.service.js

export const getProducts = async (organizationId, filters = {}) => {
  const { category, status, search, page = 1, limit = 20 } = filters;

  const query = { organizationId, isDeleted: false };

  if (category) query.category = category;
  if (status === "low") query.$expr = { $lte: ["$currentStock", "$minimumStock"] };
  if (status === "out") query.currentStock = 0;
  if (search) query.name = { $regex: search, $options: "i" };

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate("category", "name color icon")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(query),
  ]);

  return { products, total, page, totalPages: Math.ceil(total / limit) };
};

export const createProduct = async (organizationId, productData) => {
  // Vérifier doublon SKU dans la même organisation
  if (productData.sku) {
    const existing = await Product.findOne({ organizationId, sku: productData.sku });
    if (existing) throw new AppError("SKU déjà utilisé dans votre organisation", 400);
  }

  const product = await Product.create({ organizationId, ...productData });
  return product;
};
```

### 5.5 Validation Produit (Joi)

```js
// server/src/validations/product.validation.js
import Joi from "joi";

export const createProductSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    "string.min": "Le nom doit contenir au moins 2 caractères",
    "any.required": "Le nom est obligatoire",
  }),
  sku: Joi.string().max(50).optional(),
  description: Joi.string().max(500).optional(),
  category: Joi.string().hex().length(24).optional(),
  sellingPrice: Joi.number().min(0).required(),
  costPrice: Joi.number().min(0).default(0),
  currentStock: Joi.number().min(0).default(0),
  minimumStock: Joi.number().min(0).default(5),
  unit: Joi.string().default("unité"),
});
```

### 5.6 Frontend — ProductTable.jsx

```jsx
// Colonnes et comportement de la table produits
// Utilise DaisyUI table + Framer Motion pour les rows

const columns = [
  { key: "image", label: "" },
  { key: "name", label: "Produit" },
  { key: "category", label: "Catégorie" },
  { key: "currentStock", label: "Stock" },
  { key: "sellingPrice", label: "Prix vente" },
  { key: "stockStatus", label: "Statut" },
  { key: "actions", label: "" },
];

// StockBadge composant :
const StockBadge = ({ status }) => {
  const config = {
    ok:  { class: "badge-success", label: "OK" },
    low: { class: "badge-warning", label: "Bas" },
    out: { class: "badge-error",   label: "Rupture" },
  };
  const { class: cls, label } = config[status] || config.ok;
  return <span className={`badge ${cls} badge-sm`}>{label}</span>;
};
```

---

## 6. GESTION DU STOCK

### 6.1 StockMovement Model

Chaque variation de stock (entrée, sortie, ajustement, vente) est tracée en tant que mouvement. C'est **l'audit trail** complet du stock.

```js
// server/src/models/StockMovement.model.js
const stockMovementSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  type: {
    type: String,
    enum: ["in", "out", "adjustment", "sale", "return"],
    required: true,
  },
  quantity: { type: Number, required: true },          // Toujours positif
  quantityBefore: { type: Number, required: true },    // Stock avant mouvement
  quantityAfter: { type: Number, required: true },     // Stock après mouvement
  reason: { type: String },                            // "Réapprovisionnement", "Casse"...
  reference: { type: String },                         // N° bon de commande, facture...
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  saleId: { type: mongoose.Schema.Types.ObjectId, ref: "Sale" }, // Lié si type="sale"
}, { timestamps: true });

stockMovementSchema.index({ organizationId: 1, product: 1, createdAt: -1 });
```

### 6.2 Movement Service — logique de mise à jour atomique

```js
// server/src/services/movement.service.js

/**
 * Crée un mouvement de stock et met à jour le produit de manière atomique.
 * Utilise une session Mongoose pour garantir la cohérence.
 */
export const createMovement = async (organizationId, movementData, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { productId, type, quantity, reason, reference } = movementData;

    // 1. Récupérer le produit (avec lock de session)
    const product = await Product.findOne({
      _id: productId,
      organizationId,
      isDeleted: false,
    }).session(session);

    if (!product) throw new AppError("Produit introuvable", 404);

    // 2. Calculer le nouveau stock
    const quantityBefore = product.currentStock;
    let quantityAfter;

    if (type === "in" || type === "return") {
      quantityAfter = quantityBefore + quantity;
    } else if (type === "out" || type === "sale") {
      if (quantity > quantityBefore) {
        throw new AppError("Stock insuffisant", 400);
      }
      quantityAfter = quantityBefore - quantity;
    } else if (type === "adjustment") {
      quantityAfter = quantity; // Valeur absolue
    }

    // 3. Créer le mouvement
    const [movement] = await StockMovement.create(
      [{
        organizationId,
        product: productId,
        type,
        quantity,
        quantityBefore,
        quantityAfter,
        reason,
        reference,
        createdBy: userId,
      }],
      { session }
    );

    // 4. Mettre à jour le stock du produit
    await Product.findByIdAndUpdate(
      productId,
      { currentStock: quantityAfter },
      { session }
    );

    await session.commitTransaction();

    // 5. Post-commit : vérifier les alertes (sans bloquer la réponse)
    setImmediate(() => checkStockAlerts(product, quantityAfter, organizationId));

    return movement;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
```

### 6.3 Alert Check Post-mouvement

```js
// server/src/services/alert.service.js

export const checkStockAlerts = async (product, newQuantity, organizationId) => {
  // Si le stock passe sous le seuil minimum
  if (newQuantity <= product.minimumStock && newQuantity > 0) {
    await createAlert(organizationId, {
      type: "low_stock",
      severity: "warning",
      product: product._id,
      message: `Stock bas : "${product.name}" — ${newQuantity} ${product.unit} restant(s)`,
    });

    // Émettre via WebSocket aux utilisateurs de l'organisation
    emitToOrg(organizationId, "alert:stock_low", {
      productId: product._id,
      productName: product.name,
      currentStock: newQuantity,
      minimumStock: product.minimumStock,
    });
  }

  // Si rupture totale
  if (newQuantity === 0) {
    await createAlert(organizationId, {
      type: "out_of_stock",
      severity: "error",
      product: product._id,
      message: `Rupture totale : "${product.name}" est épuisé`,
    });

    emitToOrg(organizationId, "alert:out_of_stock", {
      productId: product._id,
      productName: product.name,
    });
  }
};
```

---

## 7. GESTION DES VENTES

### 7.1 Sale Model

```js
// server/src/models/Sale.model.js
const saleItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  productName: { type: String, required: true }, // Snapshot au moment de la vente
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
});

const saleSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  saleNumber: { type: String, unique: true },          // SW-2024-0001
  items: [saleItemSchema],
  totalAmount: { type: Number, required: true },
  paymentMethod: {
    type: String,
    enum: ["cash", "mobile_money", "card", "credit"],
    default: "cash",
  },
  customerName: { type: String },                      // Optionnel pour MVP
  note: { type: String },
  soldBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { type: String, enum: ["completed", "cancelled", "refunded"], default: "completed" },
}, { timestamps: true });

saleSchema.index({ organizationId: 1, createdAt: -1 });

// Auto-générer le numéro de vente
saleSchema.pre("save", async function (next) {
  if (this.isNew) {
    const count = await mongoose.model("Sale").countDocuments({ organizationId: this.organizationId });
    const year = new Date().getFullYear();
    this.saleNumber = `SW-${year}-${String(count + 1).padStart(4, "0")}`;
  }
  next();
});
```

### 7.2 Sale Service

```js
// server/src/services/sale.service.js

export const createSale = async (organizationId, saleData, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items, paymentMethod, customerName, note } = saleData;

    let totalAmount = 0;
    const processedItems = [];

    // 1. Vérifier le stock et préparer les items
    for (const item of items) {
      const product = await Product.findOne({
        _id: item.productId,
        organizationId,
        isDeleted: false,
      }).session(session);

      if (!product) throw new AppError(`Produit ${item.productId} introuvable`, 404);
      if (product.currentStock < item.quantity) {
        throw new AppError(`Stock insuffisant pour "${product.name}"`, 400);
      }

      const itemTotal = product.sellingPrice * item.quantity;
      totalAmount += itemTotal;

      processedItems.push({
        product: product._id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: product.sellingPrice,
        totalPrice: itemTotal,
      });
    }

    // 2. Créer la vente
    const [sale] = await Sale.create(
      [{ organizationId, items: processedItems, totalAmount, paymentMethod, customerName, note, soldBy: userId }],
      { session }
    );

    // 3. Déduire le stock pour chaque item (mouvement "sale")
    for (const item of processedItems) {
      const product = await Product.findById(item.product).session(session);
      const newStock = product.currentStock - item.quantity;

      await Product.findByIdAndUpdate(
        item.product,
        {
          currentStock: newStock,
          lastSoldAt: new Date(),
        },
        { session }
      );

      await StockMovement.create(
        [{
          organizationId,
          product: item.product,
          type: "sale",
          quantity: item.quantity,
          quantityBefore: product.currentStock,
          quantityAfter: newStock,
          reason: `Vente ${sale.saleNumber}`,
          saleId: sale._id,
          createdBy: userId,
        }],
        { session }
      );

      // Post-commit : check alertes
      setImmediate(() => checkStockAlerts(product, newStock, organizationId));
    }

    await session.commitTransaction();
    return sale;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
```

### 7.3 Sale Routes

```
POST   /api/v1/sales               ← Enregistrer une vente
GET    /api/v1/sales               ← Historique (filtres: date, product, user)
GET    /api/v1/sales/:id           ← Détail vente
PATCH  /api/v1/sales/:id/cancel    ← Annuler vente (remet le stock)
GET    /api/v1/sales/stats/summary ← Statistiques ventes (pour dashboard)
```

### 7.4 Frontend — SaleForm.jsx — Logique d'ajout panier

```jsx
// client/src/features/sales/components/SaleForm.jsx

// State du panier
const [cart, setCart] = useState([]);

const addToCart = (product) => {
  const existing = cart.find(item => item.productId === product._id);
  if (existing) {
    setCart(cart.map(item =>
      item.productId === product._id
        ? { ...item, quantity: item.quantity + 1 }
        : item
    ));
  } else {
    setCart([...cart, {
      productId: product._id,
      name: product.name,
      unitPrice: product.sellingPrice,
      maxStock: product.currentStock,
      quantity: 1,
    }]);
  }
};

const cartTotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
```

---

## 8. DASHBOARD

### 8.1 Endpoint Dashboard

```js
// GET /api/v1/dashboard/summary
// Retourne toutes les métriques en un seul appel (évite les waterfalls)

export const getDashboardSummary = async (organizationId) => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const startOfWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [
    totalProducts,
    lowStockProducts,
    outOfStockProducts,
    totalStockValue,
    salesToday,
    salesWeek,
    salesMonth,
    topProducts,
    recentAlerts,
    latestRecommendations,
  ] = await Promise.all([
    Product.countDocuments({ organizationId, isDeleted: false }),

    Product.countDocuments({
      organizationId,
      isDeleted: false,
      $expr: { $and: [{ $gt: ["$currentStock", 0] }, { $lte: ["$currentStock", "$minimumStock"] }] }
    }),

    Product.countDocuments({ organizationId, isDeleted: false, currentStock: 0 }),

    Product.aggregate([
      { $match: { organizationId: new mongoose.Types.ObjectId(organizationId), isDeleted: false } },
      { $group: { _id: null, total: { $sum: { $multiply: ["$currentStock", "$costPrice"] } } } },
    ]),

    Sale.aggregate([
      { $match: { organizationId: new mongoose.Types.ObjectId(organizationId), createdAt: { $gte: startOfDay }, status: "completed" } },
      { $group: { _id: null, count: { $sum: 1 }, total: { $sum: "$totalAmount" } } },
    ]),

    // salesWeek, salesMonth — même pattern

    Sale.aggregate([
      { $match: { organizationId: new mongoose.Types.ObjectId(organizationId), createdAt: { $gte: startOfWeek } } },
      { $unwind: "$items" },
      { $group: { _id: "$items.product", name: { $first: "$items.productName" }, totalQty: { $sum: "$items.quantity" }, totalRevenue: { $sum: "$items.totalPrice" } } },
      { $sort: { totalQty: -1 } },
      { $limit: 5 },
    ]),

    Alert.find({ organizationId, isRead: false }).sort({ createdAt: -1 }).limit(5),

    Recommendation.find({ organizationId }).sort({ createdAt: -1 }).limit(4),
  ]);

  return {
    overview: {
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      totalStockValue: totalStockValue[0]?.total || 0,
    },
    sales: {
      today: salesToday[0] || { count: 0, total: 0 },
      week: salesWeek[0] || { count: 0, total: 0 },
      month: salesMonth[0] || { count: 0, total: 0 },
    },
    topProducts,
    recentAlerts,
    latestRecommendations,
  };
};
```

### 8.2 Frontend — Dashboard Components

**StatsRow.jsx** — les 4 KPIs avec animation Framer Motion :
```jsx
const stats = [
  { label: "Produits total",   value: data.totalProducts,      icon: Package,     color: "text-primary" },
  { label: "Stock bas",        value: data.lowStockProducts,   icon: AlertTriangle, color: "text-warning" },
  { label: "Ruptures",         value: data.outOfStockProducts, icon: XCircle,     color: "text-error" },
  { label: "Valeur du stock",  value: formatXAF(data.totalStockValue), icon: TrendingUp, color: "text-success" },
];

// Animation stagger sur les cards :
const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

<motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
  {stats.map(stat => (
    <motion.div key={stat.label} variants={item} className="card bg-base-200">
      ...
    </motion.div>
  ))}
</motion.div>
```

**CriticalStockList.jsx** — produits sous seuil :
```jsx
// Liste des produits en danger avec barre de progression stock
const stockPercent = (current, minimum) => Math.min((current / (minimum * 2)) * 100, 100);

<progress
  className={`progress ${current === 0 ? "progress-error" : "progress-warning"} w-full`}
  value={stockPercent(product.currentStock, product.minimumStock)}
  max="100"
/>
```

---

## 9. RECOMMANDATIONS IA

> **Moteur :** Google Gemini 2.5 Flash  
> **Principe :** Les reco sont calculées en arrière-plan (CRON 02h00). Jamais en temps réel.

### 9.1 Recommendation Model

```js
// server/src/models/Recommendation.model.js
const recommendationSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  type: {
    type: String,
    enum: ["restock", "popular", "dead_stock", "bundle", "expiring"],
    required: true,
  },
  priority: { type: String, enum: ["high", "medium", "low"], default: "medium" },
  title: { type: String, required: true },
  description: { type: String, required: true },
  actionLabel: { type: String },                    // "Commander maintenant", "Créer un bundle"
  relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  data: { type: mongoose.Schema.Types.Mixed },      // Données brutes de l'analyse
  isRead: { type: Boolean, default: false },
  isDismissed: { type: Boolean, default: false },
  expiresAt: { type: Date },
}, { timestamps: true });

recommendationSchema.index({ organizationId: 1, createdAt: -1 });
```

### 9.2 AI Service — Gemini 2.5 Flash

```js
// server/src/services/ai.service.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Génère toutes les recommandations pour une organisation.
 * Appelé par le CRON job nocturne.
 */
export const generateRecommendations = async (organizationId) => {
  // 1. Collecter les données des 30 derniers jours
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [products, recentSales, salesHistory] = await Promise.all([
    Product.find({ organizationId, isDeleted: false })
      .populate("category", "name")
      .lean(),
    Sale.find({ organizationId, createdAt: { $gte: sevenDaysAgo }, status: "completed" }).lean(),
    Sale.find({ organizationId, createdAt: { $gte: thirtyDaysAgo }, status: "completed" }).lean(),
  ]);

  // 2. Pré-analyser les données côté Node (réduire les tokens envoyés à Gemini)
  const analysis = preprocessData(products, recentSales, salesHistory);

  // 3. Construire le prompt structuré
  const prompt = buildAnalysisPrompt(analysis);

  // 4. Appel Gemini
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const result = await model.generateContent(prompt);
  const responseText = result.response.text();

  // 5. Parser la réponse JSON
  const recommendations = parseGeminiResponse(responseText);

  // 6. Supprimer les anciennes recommandations et sauvegarder les nouvelles
  await Recommendation.deleteMany({ organizationId });
  await Recommendation.insertMany(
    recommendations.map(r => ({ ...r, organizationId }))
  );

  return recommendations;
};

/**
 * Pré-traitement des données avant envoi à l'IA.
 * On n'envoie que les agrégats, pas les données brutes.
 */
const preprocessData = (products, recentSales, salesHistory) => {
  // Calculer la vélocité de vente par produit (unités/jour sur 30j)
  const salesByProduct = {};
  for (const sale of salesHistory) {
    for (const item of sale.items) {
      const pid = item.product.toString();
      if (!salesByProduct[pid]) salesByProduct[pid] = { quantity: 0, revenue: 0, occurrences: 0 };
      salesByProduct[pid].quantity += item.quantity;
      salesByProduct[pid].revenue += item.totalPrice;
      salesByProduct[pid].occurrences += 1;
    }
  }

  // Co-occurrences pour les bundles
  const coOccurrences = {};
  for (const sale of salesHistory) {
    if (sale.items.length < 2) continue;
    for (let i = 0; i < sale.items.length; i++) {
      for (let j = i + 1; j < sale.items.length; j++) {
        const key = [sale.items[i].product, sale.items[j].product].sort().join("_");
        coOccurrences[key] = (coOccurrences[key] || 0) + 1;
      }
    }
  }

  return {
    products: products.map(p => ({
      id: p._id,
      name: p.name,
      category: p.category?.name,
      currentStock: p.currentStock,
      minimumStock: p.minimumStock,
      sellingPrice: p.sellingPrice,
      costPrice: p.costPrice,
      sales30d: salesByProduct[p._id.toString()] || { quantity: 0, revenue: 0, occurrences: 0 },
      lastSoldAt: p.lastSoldAt,
    })),
    coOccurrences: Object.entries(coOccurrences)
      .filter(([, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10),
    totalSales7d: recentSales.length,
    totalRevenue7d: recentSales.reduce((sum, s) => sum + s.totalAmount, 0),
  };
};

/**
 * Construction du prompt Gemini
 */
const buildAnalysisPrompt = (analysis) => {
  return `Tu es un expert en gestion de stock pour des PME africaines.
Analyse ces données de stock et de ventes, puis génère des recommandations actionnables.

DONNÉES :
${JSON.stringify(analysis, null, 2)}

INSTRUCTIONS :
Génère EXACTEMENT un objet JSON avec une clé "recommendations" contenant un tableau.
Chaque recommandation doit avoir :
- type: "restock" | "popular" | "dead_stock" | "bundle"
- priority: "high" | "medium" | "low"
- title: string (court, max 60 chars)
- description: string (actionnable, en français, max 200 chars)
- actionLabel: string (ex: "Commander maintenant", "Voir les détails")
- relatedProductIds: string[] (IDs des produits concernés)
- data: objet avec les métriques clés justifiant la recommandation

RÈGLES :
- "restock" : si un produit sera en rupture dans < 7 jours au rythme actuel
- "popular" : top 3 produits en volume de vente sur 7 jours
- "dead_stock" : produits avec 0 vente sur 30 jours ET stock > 0
- "bundle" : paires de produits achetés ensemble dans > 30% des ventes
- Sois précis : "Produit X sera en rupture dans 3 jours" plutôt que "Stock bas"
- Réponds UNIQUEMENT avec le JSON, sans texte avant ni après, sans balises markdown

EXEMPLE DE FORMAT :
{
  "recommendations": [
    {
      "type": "restock",
      "priority": "high",
      "title": "Réapprovisionner Farine Blé 25kg",
      "description": "Au rythme actuel (8 unités/jour), rupture prévue dans 3 jours. Commander au moins 50 unités.",
      "actionLabel": "Commander maintenant",
      "relatedProductIds": ["65a1b2c3d4e5f6a7b8c9d0e1"],
      "data": { "daysUntilStockout": 3, "currentStock": 24, "dailyVelocity": 8 }
    }
  ]
}`;
};

/**
 * Parser robuste — gère les cas où Gemini ajoute du texte autour du JSON
 */
const parseGeminiResponse = (text) => {
  try {
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return parsed.recommendations || [];
  } catch {
    // Fallback : chercher le JSON dans la réponse
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      return parsed.recommendations || [];
    }
    return [];
  }
};
```

### 9.3 CRON Job IA

```js
// server/src/jobs/aiRecommendations.job.js
import cron from "node-cron";
import { generateRecommendations } from "../services/ai.service.js";
import Organization from "../models/Organization.model.js";
import logger from "../utils/logger.util.js";

/**
 * Tous les jours à 02h00
 * Génère les recommandations IA pour toutes les organisations actives
 */
export const startAIRecommendationsJob = () => {
  cron.schedule("0 2 * * *", async () => {
    logger.info("🤖 Starting AI recommendations job...");

    const organizations = await Organization.find({ isActive: true });

    for (const org of organizations) {
      try {
        const recommendations = await generateRecommendations(org._id);
        logger.info(`✅ Org ${org.name}: ${recommendations.length} recommandations générées`);

        // Notifier via WebSocket si des reco haute priorité
        const highPriority = recommendations.filter(r => r.priority === "high");
        if (highPriority.length > 0) {
          emitToOrg(org._id, "ai:new_recommendations", { count: highPriority.length });
        }
      } catch (error) {
        logger.error(`❌ Org ${org.name} AI job failed:`, error.message);
      }

      // Délai entre organisations pour éviter le rate limiting Gemini
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    logger.info("✅ AI recommendations job completed");
  });
};
```

### 9.4 Frontend — RecommendationCard.jsx

```jsx
// client/src/features/ai/components/RecommendationCard.jsx
import { motion } from "framer-motion";
import { Zap, TrendingUp, Archive, Gift, ChevronRight } from "lucide-react";

const RECO_CONFIG = {
  restock:    { icon: Zap,        color: "text-error",   bg: "bg-error/10",   label: "Réapprovisionnement" },
  popular:    { icon: TrendingUp, color: "text-success", bg: "bg-success/10", label: "Produit populaire" },
  dead_stock: { icon: Archive,    color: "text-warning", bg: "bg-warning/10", label: "Stock mort" },
  bundle:     { icon: Gift,       color: "text-primary", bg: "bg-primary/10", label: "Bundle suggéré" },
};

const PRIORITY_BADGE = {
  high:   "badge-error",
  medium: "badge-warning",
  low:    "badge-ghost",
};

export default function RecommendationCard({ recommendation, onAction }) {
  const config = RECO_CONFIG[recommendation.type];
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      whileHover={{ y: -2 }}
      className="card bg-base-200 border border-base-300 hover:border-primary/30 transition-colors cursor-pointer"
      onClick={() => onAction(recommendation)}
    >
      <div className="card-body p-4">
        <div className="flex items-start justify-between gap-3">
          <div className={`p-2 rounded-lg ${config.bg}`}>
            <Icon size={18} className={config.color} />
          </div>
          <span className={`badge ${PRIORITY_BADGE[recommendation.priority]} badge-sm`}>
            {recommendation.priority === "high" ? "🔥 Urgent" : recommendation.priority}
          </span>
        </div>

        <div className="mt-3">
          <p className="text-xs text-base-content/50 uppercase tracking-wider mb-1">
            {config.label}
          </p>
          <h3 className="font-semibold text-sm leading-snug">{recommendation.title}</h3>
          <p className="text-xs text-base-content/60 mt-1 leading-relaxed">
            {recommendation.description}
          </p>
        </div>

        <div className="card-actions justify-end mt-2">
          <button className="btn btn-ghost btn-xs gap-1">
            {recommendation.actionLabel}
            <ChevronRight size={12} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
```

---

## 10. NOTIFICATIONS & ALERTES

### 10.1 Alert Model

```js
// server/src/models/Alert.model.js
const alertSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  type: {
    type: String,
    enum: ["low_stock", "out_of_stock", "ai_recommendation", "system"],
    required: true,
  },
  severity: { type: String, enum: ["info", "warning", "error"], default: "warning" },
  message: { type: String, required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  readBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

alertSchema.index({ organizationId: 1, isRead: 1, createdAt: -1 });
```

### 10.2 WebSocket Setup — Socket.io

```js
// server/src/services/socket.service.js
let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: process.env.CLIENT_URL, credentials: true },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const decoded = verifyToken(token);
      socket.userId = decoded.userId;
      socket.organizationId = decoded.organizationId;
      next();
    } catch {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    // Rejoindre la room de l'organisation
    const room = `org:${socket.organizationId}`;
    socket.join(room);

    socket.on("disconnect", () => {
      socket.leave(room);
    });
  });
};

// Émettre à tous les utilisateurs d'une organisation
export const emitToOrg = (organizationId, event, data) => {
  if (!io) return;
  io.to(`org:${organizationId}`).emit(event, data);
};
```

### 10.3 Frontend — useAlerts Hook

```js
// client/src/features/alerts/hooks/useAlerts.js
import { useEffect } from "react";
import { useSocketStore } from "../../../store/socketStore";
import { useAlertStore } from "../alertsStore";
import toast from "react-hot-toast"; // ou DaisyUI toast

export const useAlerts = () => {
  const socket = useSocketStore(s => s.socket);
  const { addAlert, incrementUnread } = useAlertStore();

  useEffect(() => {
    if (!socket) return;

    // Alerte stock bas
    socket.on("alert:stock_low", (data) => {
      addAlert({ type: "low_stock", ...data });
      incrementUnread();
      toast.custom((t) => (
        <div className={`alert alert-warning ${t.visible ? "animate-in" : "animate-out"}`}>
          <AlertTriangle size={16} />
          <span>Stock bas : <strong>{data.productName}</strong> — {data.currentStock} restant(s)</span>
        </div>
      ));
    });

    // Rupture totale
    socket.on("alert:out_of_stock", (data) => {
      addAlert({ type: "out_of_stock", ...data });
      incrementUnread();
      toast.error(`Rupture : ${data.productName} est épuisé`);
    });

    // Nouvelles recommandations IA
    socket.on("ai:new_recommendations", (data) => {
      toast.custom(() => (
        <div className="alert alert-info">
          <Zap size={16} />
          <span>{data.count} nouvelle(s) recommandation(s) IA disponible(s)</span>
        </div>
      ));
    });

    return () => {
      socket.off("alert:stock_low");
      socket.off("alert:out_of_stock");
      socket.off("ai:new_recommendations");
    };
  }, [socket]);
};
```

### 10.4 Email Alerts — Nodemailer

```js
// server/src/services/email.service.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
});

export const sendLowStockAlert = async (organization, product, currentStock) => {
  const org = await Organization.findById(organization);
  if (!org.settings.lowStockAlertEmail) return; // Paramètre désactivable

  const owner = await User.findById(org.owner);

  await transporter.sendMail({
    from: `"StockWise" <${process.env.MAIL_USER}>`,
    to: owner.email,
    subject: `⚠️ Stock bas : ${product.name} — ${org.name}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">⬡ StockWise — Alerte Stock</h2>
        <p>Bonjour <strong>${owner.firstName}</strong>,</p>
        <p>Le produit <strong>${product.name}</strong> est en stock bas.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr>
            <td style="padding: 8px; background: #f8f8f8;">Stock actuel</td>
            <td style="padding: 8px; color: #f59e0b; font-weight: bold;">${currentStock} ${product.unit}</td>
          </tr>
          <tr>
            <td style="padding: 8px; background: #f8f8f8;">Seuil minimum</td>
            <td style="padding: 8px;">${product.minimumStock} ${product.unit}</td>
          </tr>
        </table>
        <a href="${process.env.CLIENT_URL}/products/${product._id}" 
           style="background: #f59e0b; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Gérer le stock →
        </a>
      </div>
    `,
  });
};
```

---

## 11. ABONNEMENTS, TRIAL & BILLING NOTCHPAY

> **Stack paiement :** NotchPay (`notchpay.js`) — XAF natif — MTN Mobile Money · Orange Money · Carte bancaire

### 11.1 Modèles de données Billing

**Subscription Model :**
```js
// server/src/models/Subscription.model.js
import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
  reference: { type: String, required: true },    // Référence NotchPay
  amount: { type: Number, required: true },
  currency: { type: String, default: "XAF" },
  status: { type: String, enum: ["pending", "complete", "failed", "cancelled"] },
  paidAt: { type: Date },
  channel: { type: String },                      // mtn_momo, orange_money, card...
});

const subscriptionSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
    unique: true,                                 // Une seule subscription par org
  },
  plan: {
    type: String,
    enum: ["starter", "pro", "enterprise"],
    default: "starter",
  },
  status: {
    type: String,
    enum: ["trial", "active", "past_due", "cancelled", "expired"],
    default: "trial",
  },
  // Dates clés
  trialEndsAt: { type: Date },
  currentPeriodStart: { type: Date },
  currentPeriodEnd: { type: Date },
  cancelledAt: { type: Date },

  // Historique paiements
  invoices: [invoiceSchema],

  // NotchPay
  notchpayCustomerId: { type: String },

  // Grace period : 7 jours après échéance avant coupure
  gracePeriodEndsAt: { type: Date },
}, { timestamps: true });

subscriptionSchema.index({ organizationId: 1 });

export default mongoose.model("Subscription", subscriptionSchema);
```

**PLANS_CONFIG — source de vérité unique :**
```js
// server/src/config/plans.js

export const PLANS = {
  starter: {
    name: "Starter",
    price: 0,
    currency: "XAF",
    label: "Gratuit",
    features: {
      maxProducts: 100,
      maxUsers: 3,
      aiRecommendations: false,
      aiAlerts: false,
      exportReports: false,
      prioritySupport: false,
    },
  },
  pro: {
    name: "Pro",
    price: 9900,
    currency: "XAF",
    label: "9 900 XAF / mois",
    features: {
      maxProducts: Infinity,
      maxUsers: 10,
      aiRecommendations: true,
      aiAlerts: true,
      exportReports: true,
      prioritySupport: false,
    },
  },
  enterprise: {
    name: "Entreprise",
    price: null,              // Sur devis
    currency: "XAF",
    label: "Sur devis",
    features: {
      maxProducts: Infinity,
      maxUsers: Infinity,
      aiRecommendations: true,
      aiAlerts: true,
      exportReports: true,
      prioritySupport: true,
    },
  },
};

// Liste des features gated (nécessitent plan Pro ou trial actif)
export const PRO_FEATURES = [
  "aiRecommendations",
  "aiAlerts",
  "exportReports",
];
```

### 11.2 Middleware Plan Gate

```js
// server/src/middleware/planGate.middleware.js
import Organization from "../models/Organization.model.js";
import { PRO_FEATURES } from "../config/plans.js";

/**
 * Factory — crée un middleware qui bloque si la feature n'est pas disponible.
 * Usage : router.get("/recommendations", planGate("aiRecommendations"), controller)
 */
export const planGate = (feature) => {
  return async (req, res, next) => {
    try {
      const org = await Organization.findById(req.organizationId);
      if (!org) return res.status(404).json({ success: false, error: "Organisation introuvable" });

      // Vérifier si la feature est Pro-only
      if (!PRO_FEATURES.includes(feature)) return next();

      // Le trial donne accès à tout pendant 30 jours
      const now = new Date();
      const trialActive = org.isTrialActive && org.trialEndsAt > now;

      if (trialActive || org.plan === "pro" || org.plan === "enterprise") {
        return next();
      }

      // Accès refusé — plan insuffisant
      return res.status(403).json({
        success: false,
        error: "feature_locked",
        message: "Cette fonctionnalité nécessite le plan Pro.",
        upgradeUrl: `${process.env.CLIENT_URL}/billing`,
        feature,
      });
    } catch (error) {
      next(error);
    }
  };
};
```

**Application sur les routes AI :**
```js
// server/src/api/v1/routes/ai.routes.js
import { planGate } from "../../../middleware/planGate.middleware.js";

router.get("/recommendations", protect, tenantMiddleware, planGate("aiRecommendations"), aiController.getRecommendations);
router.post("/refresh",        protect, tenantMiddleware, planGate("aiRecommendations"), aiController.refreshRecommendations);
```

### 11.3 Intégration NotchPay

**Installation :**
```bash
npm install notchpay.js
```

**Billing Service :**
```js
// server/src/services/billing.service.js
import NotchPay from "notchpay.js";
import Subscription from "../models/Subscription.model.js";
import Organization from "../models/Organization.model.js";
import User from "../models/User.model.js";
import { PLANS } from "../config/plans.js";
import { sendPlanUpgradedEmail, sendPaymentFailedEmail } from "./email.service.js";
import logger from "../utils/logger.util.js";

const notchpay = NotchPay(process.env.NOTCHPAY_PUBLIC_KEY, {
  debug: process.env.NODE_ENV !== "production",
});

/**
 * Initier un paiement d'abonnement Pro
 * Retourne l'authorization_url NotchPay → redirect côté client
 */
export const initiatePlanUpgrade = async (organizationId, targetPlan = "pro") => {
  const plan = PLANS[targetPlan];
  if (!plan || plan.price === null) {
    throw new AppError("Ce plan nécessite un devis. Contactez-nous.", 400);
  }

  const org = await Organization.findById(organizationId).populate("owner");
  const owner = await User.findById(org.owner);

  // Générer une référence unique
  const reference = `SW-${organizationId.toString().slice(-6).toUpperCase()}-${Date.now()}`;

  // Initialiser le paiement NotchPay
  const payment = await notchpay.payments.initializePayment({
    amount: plan.price,
    currency: plan.currency,
    email: owner.email,
    phone: owner.phone || "",
    reference,
    description: `StockWise — Plan ${plan.name} (1 mois)`,
    callback: `${process.env.CLIENT_URL}/billing/success`,
    metadata: {
      organizationId: organizationId.toString(),
      plan: targetPlan,
      ownerId: owner._id.toString(),
    },
  });

  // Sauvegarder la référence en attente dans la subscription
  await Subscription.findOneAndUpdate(
    { organizationId },
    {
      $push: {
        invoices: {
          reference,
          amount: plan.price,
          currency: plan.currency,
          status: "pending",
        },
      },
    },
    { upsert: true, new: true }
  );

  return {
    authorizationUrl: payment.authorization_url,
    reference,
  };
};

/**
 * Webhook NotchPay — payment.complete
 * Appelé par NotchPay quand le paiement est confirmé
 */
export const handlePaymentComplete = async (eventData) => {
  const { reference, transaction } = eventData;

  // Retrouver l'organisation via la référence
  const subscription = await Subscription.findOne({
    "invoices.reference": reference,
  });
  if (!subscription) {
    logger.warn(`Webhook: subscription introuvable pour ref ${reference}`);
    return;
  }

  const { organizationId, plan } = transaction.metadata;
  const now = new Date();
  const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Activer le plan
  await Organization.findByIdAndUpdate(organizationId, {
    plan,
    isTrialActive: false,          // Trial terminé, plan payant actif
  });

  // Mettre à jour la subscription
  await Subscription.findOneAndUpdate(
    { organizationId },
    {
      plan,
      status: "active",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      gracePeriodEndsAt: new Date(periodEnd.getTime() + 7 * 24 * 60 * 60 * 1000),
      $set: { "invoices.$[inv].status": "complete", "invoices.$[inv].paidAt": now, "invoices.$[inv].channel": transaction.channel },
    },
    { arrayFilters: [{ "inv.reference": reference }] }
  );

  // Email de confirmation
  const org = await Organization.findById(organizationId).populate("owner");
  await sendPlanUpgradedEmail(org.owner, plan, periodEnd);

  logger.info(`✅ Plan ${plan} activé pour org ${organizationId}`);
};

/**
 * Webhook NotchPay — payment.failed
 */
export const handlePaymentFailed = async (eventData) => {
  const { reference } = eventData;

  await Subscription.findOneAndUpdate(
    { "invoices.reference": reference },
    { $set: { "invoices.$[inv].status": "failed" } },
    { arrayFilters: [{ "inv.reference": reference }] }
  );

  // Retrouver l'org pour envoyer l'email
  const subscription = await Subscription.findOne({ "invoices.reference": reference });
  if (subscription) {
    const org = await Organization.findById(subscription.organizationId).populate("owner");
    await sendPaymentFailedEmail(org.owner);
  }
};

/**
 * Vérifier manuellement le statut d'un paiement (polling côté client)
 */
export const verifyPayment = async (reference) => {
  const payment = await notchpay.payments.verifyAndFetchPayment(reference);
  return payment;
};
```

### 11.4 Webhook Handler

```js
// server/src/webhooks/notchpay.webhook.js
import crypto from "crypto";
import { handlePaymentComplete, handlePaymentFailed } from "../services/billing.service.js";
import logger from "../utils/logger.util.js";

/**
 * POST /webhooks/notchpay
 * NotchPay envoie les événements de paiement ici.
 * La signature HMAC-SHA256 est vérifiée avant tout traitement.
 */
export const notchpayWebhookHandler = async (req, res) => {
  // 1. Vérifier la signature
  const hash = req.headers["x-notch-signature"];
  const expectedHash = crypto
    .createHmac("sha256", process.env.NOTCHPAY_WEBHOOK_HASH)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (hash !== expectedHash) {
    logger.warn("NotchPay webhook: signature invalide");
    return res.status(401).json({ error: "Invalid signature" });
  }

  // 2. Répondre immédiatement 200 à NotchPay
  res.status(200).json({ received: true });

  // 3. Traiter l'événement de manière asynchrone
  const { event, data } = req.body;

  try {
    switch (event) {
      case "payment.complete":
        await handlePaymentComplete(data);
        break;
      case "payment.failed":
        await handlePaymentFailed(data);
        break;
      default:
        logger.info(`NotchPay webhook event non géré : ${event}`);
    }
  } catch (error) {
    logger.error("Erreur traitement webhook NotchPay:", error.message);
  }
};
```

**Enregistrement de la route webhook (avant les parsers JSON) :**
```js
// server/src/app.js

// ⚠️ Le webhook doit recevoir le raw body AVANT express.json()
app.use("/webhooks/notchpay", express.raw({ type: "application/json" }), notchpayWebhookHandler);

// Ensuite les middlewares globaux
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
```

### 11.5 Billing Routes

```
POST   /api/v1/billing/checkout          ← Initier paiement Pro → retourne authorizationUrl
GET    /api/v1/billing/verify/:reference ← Vérifier statut paiement (polling)
GET    /api/v1/billing/subscription      ← Infos abonnement actuel de l'org
GET    /api/v1/billing/invoices          ← Historique factures
POST   /webhooks/notchpay               ← Webhook NotchPay (hors /api/v1)
```

### 11.6 CRON — Expiration du Trial

```js
// server/src/jobs/trialExpiry.job.js
import cron from "node-cron";
import Organization from "../models/Organization.model.js";
import Subscription from "../models/Subscription.model.js";
import { sendTrialExpiryEmail, sendTrialReminderEmail } from "../services/email.service.js";
import { emitToOrg } from "../services/socket.service.js";
import logger from "../utils/logger.util.js";

/**
 * Tous les jours à 06h00 — Vérification des trials expirés
 */
export const startTrialExpiryJob = () => {
  cron.schedule("0 6 * * *", async () => {
    const now = new Date();
    logger.info("⏰ Trial expiry job started");

    // 1. Désactiver les trials expirés
    const expiredOrgs = await Organization.find({
      isTrialActive: true,
      trialEndsAt: { $lte: now },
      plan: "starter",
    });

    for (const org of expiredOrgs) {
      await Organization.findByIdAndUpdate(org._id, { isTrialActive: false });
      await Subscription.findOneAndUpdate(
        { organizationId: org._id },
        { status: "expired" },
        { upsert: true }
      );

      // Notifier via WebSocket
      emitToOrg(org._id, "billing:trial_expired", {
        message: "Votre période d'essai est terminée. Passez au plan Pro pour conserver l'accès IA.",
        upgradeUrl: "/billing",
      });

      // Email
      const owner = await User.findById(org.owner);
      await sendTrialExpiryEmail(owner, org);
      logger.info(`Trial expiré: ${org.name}`);
    }

    // 2. Rappels J-7 et J-3 avant expiration
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const remindOrgs = await Organization.find({
      isTrialActive: true,
      trialEndsAt: {
        $gte: now,
        $lte: in7Days,
      },
    }).populate("owner");

    for (const org of remindOrgs) {
      const daysLeft = Math.ceil((org.trialEndsAt - now) / (1000 * 60 * 60 * 24));
      if (daysLeft === 7 || daysLeft === 3) {
        await sendTrialReminderEmail(org.owner, org, daysLeft);
        emitToOrg(org._id, "billing:trial_reminder", { daysLeft });
      }
    }
  });
};
```

### 11.7 Frontend — Composants Billing

**usePlan Hook :**
```js
// client/src/hooks/usePlan.js
import { useAuthStore } from "../store/authStore";

export const usePlan = () => {
  const { organization } = useAuthStore();

  const now = new Date();
  const trialActive =
    organization?.isTrialActive &&
    new Date(organization?.trialEndsAt) > now;

  const hasProAccess =
    trialActive ||
    organization?.plan === "pro" ||
    organization?.plan === "enterprise";

  const daysLeftInTrial = trialActive
    ? Math.ceil((new Date(organization.trialEndsAt) - now) / (1000 * 60 * 60 * 24))
    : 0;

  return {
    plan: organization?.plan || "starter",
    hasProAccess,
    trialActive,
    daysLeftInTrial,
    isStarter: organization?.plan === "starter" && !hasProAccess,
    isPro: organization?.plan === "pro",
    isEnterprise: organization?.plan === "enterprise",
  };
};
```

**TrialBanner.jsx — bannière persistante pendant le trial :**
```jsx
// client/src/components/shared/TrialBanner.jsx
import { motion, AnimatePresence } from "framer-motion";
import { Zap, X } from "lucide-react";
import { usePlan } from "../../hooks/usePlan";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function TrialBanner() {
  const { trialActive, daysLeftInTrial } = usePlan();
  const [dismissed, setDismissed] = useState(false);

  if (!trialActive || dismissed || daysLeftInTrial > 7) return null;

  const urgency = daysLeftInTrial <= 3 ? "alert-error" : "alert-warning";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className={`alert ${urgency} rounded-none border-0 border-b`}
      >
        <Zap size={16} />
        <span className="text-sm font-medium">
          {daysLeftInTrial === 0
            ? "Votre période d'essai expire aujourd'hui !"
            : `Il vous reste ${daysLeftInTrial} jour(s) d'essai gratuit.`}
          {" "}
          <Link to="/billing" className="link font-bold">
            Passer au plan Pro →
          </Link>
        </span>
        <button className="btn btn-ghost btn-xs" onClick={() => setDismissed(true)}>
          <X size={14} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
```

**PlanGateUI.jsx — overlay pour features verrouillées :**
```jsx
// client/src/components/shared/PlanGateUI.jsx
import { motion } from "framer-motion";
import { Lock, Zap } from "lucide-react";
import { usePlan } from "../../hooks/usePlan";
import { Link } from "react-router-dom";

/**
 * Wrapper pour les features Pro.
 * Si l'utilisateur n'a pas accès → affiche un overlay d'upgrade.
 *
 * Usage :
 * <PlanGateUI feature="aiRecommendations">
 *   <AIPage />
 * </PlanGateUI>
 */
export default function PlanGateUI({ feature, children }) {
  const { hasProAccess } = usePlan();

  if (hasProAccess) return children;

  return (
    <div className="relative">
      {/* Contenu flouté en arrière-plan */}
      <div className="pointer-events-none select-none blur-sm opacity-40">
        {children}
      </div>

      {/* Overlay d'upgrade */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute inset-0 flex items-center justify-center bg-base-100/80 backdrop-blur-sm rounded-xl"
      >
        <div className="text-center p-8 max-w-sm">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Lock size={24} className="text-primary" />
          </div>
          <h3 className="text-lg font-bold mb-2">Fonctionnalité Pro</h3>
          <p className="text-base-content/60 text-sm mb-6">
            Les recommandations IA sont disponibles à partir du plan Pro.
            Passez à la version payante pour accéder à toutes les analyses.
          </p>
          <Link to="/billing" className="btn btn-primary gap-2">
            <Zap size={16} />
            Passer au plan Pro — 9 900 XAF/mois
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
```

**BillingPage.jsx — page principale d'abonnement :**
```jsx
// client/src/features/billing/pages/BillingPage.jsx
import { motion } from "framer-motion";
import { Check, Zap, Building2, ExternalLink } from "lucide-react";
import { usePlan } from "../../../hooks/usePlan";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../../../lib/axios";

const PLANS_UI = [
  {
    id: "starter",
    name: "Starter",
    price: "Gratuit",
    color: "border-base-300",
    features: [
      "Jusqu'à 100 produits",
      "3 utilisateurs",
      "Gestion stock & ventes",
      "Dashboard & alertes",
      "❌ Recommandations IA",
      "❌ Export rapports",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "9 900 XAF",
    period: "/ mois",
    color: "border-primary",
    highlight: true,
    features: [
      "Produits illimités",
      "10 utilisateurs",
      "Gestion stock & ventes",
      "Dashboard & alertes",
      "✅ Recommandations IA (Gemini)",
      "✅ Alertes IA intelligentes",
      "✅ Export PDF & Excel",
    ],
  },
  {
    id: "enterprise",
    name: "Entreprise",
    price: "Sur devis",
    color: "border-accent",
    features: [
      "Utilisateurs illimités",
      "Produits illimités",
      "Toutes les features Pro",
      "✅ Support prioritaire",
      "✅ Onboarding dédié",
      "✅ SLA garanti",
    ],
  },
];

export default function BillingPage() {
  const { plan, hasProAccess, trialActive, daysLeftInTrial } = usePlan();

  const checkoutMutation = useMutation({
    mutationFn: async (targetPlan) => {
      const { data } = await axiosInstance.post("/billing/checkout", { plan: targetPlan });
      return data.data;
    },
    onSuccess: (data) => {
      // Rediriger vers la page de paiement NotchPay
      window.location.href = data.authorizationUrl;
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 max-w-5xl mx-auto"
    >
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2">Plans & Abonnements</h1>
        {trialActive && (
          <div className="badge badge-warning gap-1 mt-2">
            <Zap size={12} />
            Période d'essai — {daysLeftInTrial} jour(s) restant(s)
          </div>
        )}
        <p className="text-base-content/60 mt-3">
          Commencez gratuitement. Passez au Pro quand vous êtes prêt.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS_UI.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`card border-2 ${p.color} bg-base-200 ${p.highlight ? "shadow-xl shadow-primary/10" : ""}`}
          >
            {p.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="badge badge-primary badge-lg">⭐ Recommandé</span>
              </div>
            )}
            <div className="card-body">
              <h2 className="card-title text-xl">{p.name}</h2>
              <div className="my-3">
                <span className="text-3xl font-bold text-primary">{p.price}</span>
                {p.period && <span className="text-base-content/50 text-sm">{p.period}</span>}
              </div>

              <ul className="space-y-2 mb-6">
                {p.features.map(f => (
                  <li key={f} className="text-sm flex items-start gap-2">
                    <Check size={14} className="text-success mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="card-actions mt-auto">
                {p.id === "starter" && (
                  <button className="btn btn-outline w-full" disabled={plan === "starter"}>
                    {plan === "starter" ? "Plan actuel" : "Passer à Starter"}
                  </button>
                )}
                {p.id === "pro" && (
                  <button
                    className="btn btn-primary w-full"
                    disabled={plan === "pro" || checkoutMutation.isPending}
                    onClick={() => checkoutMutation.mutate("pro")}
                  >
                    {checkoutMutation.isPending
                      ? <span className="loading loading-spinner" />
                      : <Zap size={16} />
                    }
                    {plan === "pro" ? "Plan actuel" : "Passer au Pro"}
                  </button>
                )}
                {p.id === "enterprise" && (
                  <a
                    href="mailto:contact@stockwise.app?subject=Plan Entreprise"
                    className="btn btn-outline btn-accent w-full gap-2"
                  >
                    <Building2 size={16} />
                    Nous contacter
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
```

### 11.8 Emails Billing — Nodemailer

Les templates email sont en HTML inline pour compatibilité maximale :

| Trigger | Template | Destinataire |
|---|---|---|
| Inscription | Bienvenue + confirmation trial 30j | Owner |
| J-7 avant fin trial | Rappel upgrade | Owner |
| J-3 avant fin trial | Rappel urgent upgrade | Owner |
| Trial expiré | Features désactivées + CTA upgrade | Owner |
| Paiement réussi | Confirmation plan Pro activé | Owner |
| Paiement échoué | Erreur + retry CTA | Owner |

---

## 12. DESIGN MOBILE FIRST & TYPOGRAPHIE GOOGLE FONTS

### 12.1 Principe Mobile First

Toute l'UI est conçue **d'abord pour mobile**, puis étendue pour desktop via les breakpoints DaisyUI/Tailwind. La règle : une décision de layout mobile doit être posée avant son équivalent desktop.

```
Mobile  (< 768px)  → Bottom Navigation + stack vertical + cards plein écran
Tablet  (≥ 768px)  → Sidebar réduite (icônes) + grille 2 colonnes
Desktop (≥ 1024px) → Sidebar étendue (icônes + labels) + grille 3-4 colonnes
```

### 12.2 Google Fonts — Chargement natif

Les polices sont chargées **directement dans le HTML** via `<link>` Google Fonts — pas de lib externe, pas de bundle JS. C'est la méthode la plus rapide et la plus propre.

**Choix typographiques :**
- **Syne** — display, titres, logotype (700, 800)
- **DM Sans** — corps de texte, UI, labels (400, 500, 600)

**index.html — chargement natif :**
```html
<!DOCTYPE html>
<html lang="fr" data-theme="light">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#570df8" />
  <meta name="description" content="StockWise — Gestion de stock intelligente pour PME africaines" />

  <!-- Apple PWA -->
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="apple-mobile-web-app-title" content="StockWise" />
  <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />

  <!-- Google Fonts — Preconnect pour performance -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap"
    rel="stylesheet"
  />

  <!-- PWA Manifest -->
  <link rel="manifest" href="/manifest.json" />

  <title>StockWise</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
```

**Application des polices dans le CSS global :**
```css
/* src/index.css */
@import "tailwindcss";
@plugin "daisyui";

/* Polices Google Fonts appliquées globalement */
@layer base {
  :root {
    --font-display: "Syne", sans-serif;
    --font-body: "DM Sans", sans-serif;
  }

  html {
    font-family: var(--font-body);
    font-optical-sizing: auto;
  }

  h1, h2, h3, .font-display {
    font-family: var(--font-display);
  }
}
```

### 12.3 Système de Thème — DaisyUI Light/Dark natif

**Principe :** on utilise les thèmes `light` et `dark` **natifs de DaisyUI** sans aucune customisation. Le thème choisi est sauvegardé dans le `localStorage` et appliqué immédiatement via l'attribut `data-theme` sur le `<html>`.

**useTheme Hook — Zustand + localStorage :**
```js
// client/src/store/themeStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: "light", // Valeur par défaut

      toggleTheme: () => {
        const next = get().theme === "light" ? "dark" : "light";
        set({ theme: next });
        // Appliquer immédiatement sur le DOM
        document.documentElement.setAttribute("data-theme", next);
      },

      setTheme: (theme) => {
        set({ theme });
        document.documentElement.setAttribute("data-theme", theme);
      },
    }),
    {
      name: "stockwise-theme",        // Clé localStorage
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => (state) => {
        // Appliquer le thème sauvegardé dès le chargement
        if (state?.theme) {
          document.documentElement.setAttribute("data-theme", state.theme);
        }
      },
    }
  )
);
```

**Initialisation au démarrage (évite le flash) :**
```html
<!-- index.html — Script inline AVANT le bundle React pour éviter le FOUC -->
<script>
  (function () {
    const saved = localStorage.getItem("stockwise-theme");
    const theme = saved ? JSON.parse(saved).state?.theme : "light";
    document.documentElement.setAttribute("data-theme", theme || "light");
  })();
</script>
```

> Ce script s'exécute de manière synchrone avant que React ne monte, empêchant le flash de thème (FOUC — Flash of Unstyled Content).

**ThemeToggle composant :**
```jsx
// client/src/components/ui/ThemeToggle.jsx
import { Sun, Moon } from "lucide-react";
import { useThemeStore } from "../../store/themeStore";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-ghost btn-circle"
      aria-label={theme === "light" ? "Activer le mode sombre" : "Activer le mode clair"}
      title={theme === "light" ? "Mode sombre" : "Mode clair"}
    >
      {theme === "light"
        ? <Moon size={18} />
        : <Sun size={18} />
      }
    </button>
  );
}
```

**Placement du ThemeToggle dans l'UI :**
- **Mobile** → dans la `Navbar` en haut à droite
- **Desktop** → en bas de la `Sidebar`

### 12.4 Layout Adaptatif — AppLayout.jsx

```jsx
// client/src/components/layout/AppLayout.jsx
import { Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import BottomNav from "./BottomNav";
import TrialBanner from "../shared/TrialBanner";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-base-100 flex">

      {/* Sidebar — visible uniquement md+ */}
      <aside className="hidden md:flex">
        <Sidebar />
      </aside>

      {/* Colonne principale */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <TrialBanner />

        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="p-4 md:p-6 pb-24 md:pb-6"
              /* pb-24 sur mobile = espace pour le BottomNav */
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Bottom Navigation — visible uniquement sur mobile */}
      <BottomNav />
    </div>
  );
}
```

### 12.5 Bottom Navigation — Mobile

```jsx
// client/src/components/layout/BottomNav.jsx
import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingCart, Bell, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useAlertStore } from "../../features/alerts/alertsStore";
import { usePlan } from "../../hooks/usePlan";

const NAV_ITEMS = [
  { to: "/dashboard",  label: "Accueil",  Icon: LayoutDashboard },
  { to: "/products",   label: "Produits", Icon: Package },
  { to: "/sales",      label: "Ventes",   Icon: ShoppingCart },
  { to: "/alerts",     label: "Alertes",  Icon: Bell, badge: true },
  { to: "/ai",         label: "IA",       Icon: Sparkles, proOnly: true },
];

export default function BottomNav() {
  const { unreadCount } = useAlertStore();
  const { hasProAccess } = usePlan();
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-base-200 border-t border-base-300 safe-area-pb">
      <div className="flex items-center justify-around h-16 px-1">
        {NAV_ITEMS.map(({ to, label, Icon, badge, proOnly }) => {
          const isActive = location.pathname.startsWith(to);

          return (
            <NavLink
              key={to}
              to={to}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 relative py-2"
            >
              <div className="relative">
                <motion.div
                  animate={isActive ? { scale: 1.15 } : { scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <Icon
                    size={22}
                    className={isActive ? "text-primary" : "text-base-content/40"}
                    strokeWidth={isActive ? 2.5 : 1.8}
                  />
                </motion.div>

                {/* Badge alertes non lues */}
                {badge && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 badge badge-error badge-xs text-xs min-w-4 h-4 px-1">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}

                {/* Badge Pro verrouillé */}
                {proOnly && !hasProAccess && (
                  <span className="absolute -top-1 -right-1 badge badge-warning badge-xs text-xs px-1">
                    Pro
                  </span>
                )}
              </div>

              <span className={`text-xs font-medium ${isActive ? "text-primary" : "text-base-content/40"}`}>
                {label}
              </span>

              {/* Indicateur actif */}
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
```

**Safe area pour les appareils avec encoche (iPhone notch, Android bar) :**
```css
/* src/index.css */
@layer utilities {
  .safe-area-pb {
    padding-bottom: env(safe-area-inset-bottom);
  }
}
```

### 12.6 Sidebar Desktop

```jsx
// client/src/components/layout/Sidebar.jsx
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingCart, Bell, Sparkles, Settings, CreditCard } from "lucide-react";
import { Sun, Moon } from "lucide-react";
import { useThemeStore } from "../../store/themeStore";
import { usePlan } from "../../hooks/usePlan";

const NAV_GROUPS = [
  {
    label: "Principal",
    items: [
      { to: "/dashboard", label: "Dashboard",  Icon: LayoutDashboard },
      { to: "/products",  label: "Produits",   Icon: Package },
      { to: "/sales",     label: "Ventes",     Icon: ShoppingCart },
      { to: "/alerts",    label: "Alertes",    Icon: Bell },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { to: "/ai",        label: "Recommandations IA", Icon: Sparkles, proOnly: true },
    ],
  },
  {
    label: "Compte",
    items: [
      { to: "/billing",   label: "Abonnement", Icon: CreditCard },
      { to: "/settings",  label: "Paramètres", Icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const { theme, toggleTheme } = useThemeStore();
  const { hasProAccess } = usePlan();

  return (
    <div className="w-64 h-screen sticky top-0 bg-base-200 border-r border-base-300 flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-base-300">
        <span className="font-display text-xl font-bold text-primary">⬡ StockWise</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-6">
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            <p className="text-xs text-base-content/40 uppercase tracking-wider px-3 mb-2 font-medium">
              {group.label}
            </p>
            <ul className="space-y-1">
              {group.items.map(({ to, label, Icon, proOnly }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                      ${isActive
                        ? "bg-primary text-primary-content"
                        : "text-base-content/70 hover:bg-base-300 hover:text-base-content"
                      }`
                    }
                  >
                    <Icon size={18} />
                    <span className="flex-1">{label}</span>
                    {proOnly && !hasProAccess && (
                      <span className="badge badge-warning badge-xs">Pro</span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer Sidebar — Theme Toggle */}
      <div className="p-3 border-t border-base-300">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-base-content/70 hover:bg-base-300 transition-colors"
        >
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          <span>{theme === "light" ? "Mode sombre" : "Mode clair"}</span>
        </button>
      </div>
    </div>
  );
}
```

---

## 13. PWA — OFFLINE FIRST & SYNCHRONISATION

### 13.1 Vue d'ensemble de la stratégie PWA

```
┌─ ONLINE ───────────────────────────────────┐
│  API REST → réponse en live                │
│  Socket.io → alertes temps réel            │
│  Données fraîches en cache (Workbox)       │
└───────────────┬────────────────────────────┘
                │ perte réseau
┌───────────────▼────────────────────────────┐
│  OFFLINE — Service Worker actif            │
│  • UI disponible (shell mis en cache)      │
│  • Lectures depuis IndexedDB (idb)         │
│  • Écritures → file d'attente (sync queue) │
└───────────────┬────────────────────────────────┘
                │ réseau revient
┌───────────────▼────────────────────────────┐
│  SYNC — Background Sync API                │
│  • Rejoue les actions en queue             │
│  • Résolution de conflits simple (last-write-wins) │
│  • Toast "Données synchronisées ✅"        │
└────────────────────────────────────────────┘
```

### 13.2 Installation Vite PWA Plugin

```bash
npm install -D vite-plugin-pwa
```

**vite.config.js — configuration PWA complète :**
```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "icons/*.png", "fonts/*.woff2"],
      workbox: {
        // Stratégies de cache par type de ressource
        runtimeCaching: [
          {
            // App Shell — Cache First (toujours disponible offline)
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // API GET — Network First (données fraîches si online, cache si offline)
            urlPattern: ({ url }) =>
              url.pathname.startsWith("/api/v1/") && !url.pathname.includes("/auth/"),
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 }, // 24h
              networkTimeoutSeconds: 5,
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            // Images Cloudinary — Cache First
            urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
        // Précacher le App Shell
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        // Ne pas cacher les routes API en précache
        globIgnores: ["**/api/**"],
      },
      manifest: {
        name: "StockWise — Gestion de stock",
        short_name: "StockWise",
        description: "Gestion de stock intelligente pour PME africaines",
        theme_color: "#570df8",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        lang: "fr",
        icons: [
          { src: "/icons/icon-72.png",   sizes: "72x72",   type: "image/png" },
          { src: "/icons/icon-96.png",   sizes: "96x96",   type: "image/png" },
          { src: "/icons/icon-128.png",  sizes: "128x128", type: "image/png" },
          { src: "/icons/icon-144.png",  sizes: "144x144", type: "image/png" },
          { src: "/icons/icon-152.png",  sizes: "152x152", type: "image/png" },
          { src: "/icons/icon-192.png",  sizes: "192x192", type: "image/png", purpose: "maskable" },
          { src: "/icons/icon-384.png",  sizes: "384x384", type: "image/png" },
          { src: "/icons/icon-512.png",  sizes: "512x512", type: "image/png", purpose: "any maskable" },
        ],
        shortcuts: [
          {
            name: "Nouvelle vente",
            url: "/sales/new",
            icons: [{ src: "/icons/shortcut-sale.png", sizes: "96x96" }],
          },
          {
            name: "Ajouter un produit",
            url: "/products/new",
            icons: [{ src: "/icons/shortcut-product.png", sizes: "96x96" }],
          },
        ],
      },
    }),
  ],
  server: {
    proxy: {
      "/api": { target: "http://localhost:5000", changeOrigin: true },
      "/socket.io": { target: "http://localhost:5000", ws: true },
    },
  },
});
```

### 13.3 IndexedDB — Couche de persistance locale

```bash
npm install idb
```

```js
// client/src/lib/db.js
import { openDB } from "idb";

const DB_NAME = "stockwise-offline";
const DB_VERSION = 1;

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Store produits mis en cache
      if (!db.objectStoreNames.contains("products")) {
        const products = db.createObjectStore("products", { keyPath: "_id" });
        products.createIndex("organizationId", "organizationId");
        products.createIndex("updatedAt", "updatedAt");
      }

      // Store ventes créées offline
      if (!db.objectStoreNames.contains("sales")) {
        db.createObjectStore("sales", { keyPath: "_id" });
      }

      // Store mouvements de stock offline
      if (!db.objectStoreNames.contains("movements")) {
        db.createObjectStore("movements", { keyPath: "_id" });
      }

      // Queue de synchronisation (actions en attente)
      if (!db.objectStoreNames.contains("syncQueue")) {
        const queue = db.createObjectStore("syncQueue", {
          keyPath: "id",
          autoIncrement: true,
        });
        queue.createIndex("status", "status");
        queue.createIndex("createdAt", "createdAt");
      }

      // Méta — timestamp de dernière sync
      if (!db.objectStoreNames.contains("meta")) {
        db.createObjectStore("meta", { keyPath: "key" });
      }
    },
  });
};

let dbInstance = null;
export const getDB = async () => {
  if (!dbInstance) dbInstance = await initDB();
  return dbInstance;
};
```

### 13.4 Sync Queue — File d'attente des actions offline

```js
// client/src/lib/syncQueue.js
import { getDB } from "./db";

/**
 * Ajouter une action à la queue de synchronisation
 * Appelé automatiquement quand une mutation échoue par manque de réseau
 */
export const enqueue = async (action) => {
  const db = await getDB();
  await db.add("syncQueue", {
    ...action,
    status: "pending",
    createdAt: new Date().toISOString(),
    retries: 0,
  });
};

/**
 * Structure d'une action dans la queue :
 * {
 *   type: "CREATE_SALE" | "CREATE_MOVEMENT" | "UPDATE_PRODUCT",
 *   endpoint: "/api/v1/sales",
 *   method: "POST",
 *   payload: { ... },
 *   tempId: "offline-uuid-xxx",   ← ID temporaire pour l'UI
 *   status: "pending" | "syncing" | "done" | "error",
 *   createdAt: ISO string,
 *   retries: 0,
 * }
 */

export const getPendingActions = async () => {
  const db = await getDB();
  return db.getAllFromIndex("syncQueue", "status", "pending");
};

export const markAsDone = async (id) => {
  const db = await getDB();
  const action = await db.get("syncQueue", id);
  await db.put("syncQueue", { ...action, status: "done" });
};

export const markAsError = async (id, error) => {
  const db = await getDB();
  const action = await db.get("syncQueue", id);
  await db.put("syncQueue", { ...action, status: "error", error, retries: action.retries + 1 });
};
```

### 13.5 Hook useOfflineSync — Détection réseau + synchronisation

```js
// client/src/hooks/useOfflineSync.js
import { useEffect, useState, useCallback } from "react";
import { getPendingActions, markAsDone, markAsError } from "../lib/syncQueue";
import axiosInstance from "../lib/axios";
import { useQueryClient } from "@tanstack/react-query";

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const queryClient = useQueryClient();

  // Écouter les changements de connectivité
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncPendingActions();             // Déclencher la sync automatiquement
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Rejouer les actions en queue
  const syncPendingActions = useCallback(async () => {
    const pending = await getPendingActions();
    if (pending.length === 0) return;

    setIsSyncing(true);
    setPendingCount(pending.length);

    for (const action of pending) {
      try {
        await axiosInstance({
          method: action.method,
          url: action.endpoint,
          data: action.payload,
        });
        await markAsDone(action.id);
      } catch (err) {
        await markAsError(action.id, err.message);
      }
    }

    // Invalider tous les caches React Query pour forcer le rechargement
    await queryClient.invalidateQueries();

    setIsSyncing(false);
    setPendingCount(0);
  }, [queryClient]);

  return { isOnline, isSyncing, pendingCount, syncPendingActions };
};
```

### 13.6 Indicateur de statut réseau — OnlineIndicator.jsx

```jsx
// client/src/components/shared/OnlineIndicator.jsx
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, RefreshCw, CheckCircle } from "lucide-react";
import { useOfflineSync } from "../../hooks/useOfflineSync";

export default function OnlineIndicator() {
  const { isOnline, isSyncing, pendingCount } = useOfflineSync();

  return (
    <AnimatePresence>
      {/* Bannière Offline */}
      {!isOnline && (
        <motion.div
          key="offline"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[100] bg-error text-error-content text-center py-2 px-4 text-sm font-medium flex items-center justify-center gap-2"
        >
          <WifiOff size={14} />
          Mode hors ligne — vos actions seront synchronisées au retour de la connexion
          {pendingCount > 0 && (
            <span className="badge badge-error-content badge-sm ml-2">
              {pendingCount} en attente
            </span>
          )}
        </motion.div>
      )}

      {/* Toast Synchronisation en cours */}
      {isOnline && isSyncing && (
        <motion.div
          key="syncing"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[100] bg-warning text-warning-content text-center py-2 text-sm flex items-center justify-center gap-2"
        >
          <RefreshCw size={14} className="animate-spin" />
          Synchronisation des données en cours…
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### 13.7 Intégration dans les Mutations React Query

Les mutations (ventes, mouvements) doivent gérer le mode offline transparentement :

```js
// Exemple — client/src/features/sales/hooks/useSales.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";
import axiosInstance from "../../../lib/axios";
import { enqueue } from "../../../lib/syncQueue";
import { getDB } from "../../../lib/db";

export const useCreateSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (saleData) => {
      if (!navigator.onLine) {
        // Mode offline : sauvegarder localement
        const tempId = `offline-${uuidv4()}`;
        const db = await getDB();

        const optimisticSale = {
          _id: tempId,
          ...saleData,
          status: "pending_sync",
          createdAt: new Date().toISOString(),
        };

        // Persister dans IndexedDB
        await db.put("sales", optimisticSale);

        // Ajouter à la queue de sync
        await enqueue({
          type: "CREATE_SALE",
          endpoint: "/api/v1/sales",
          method: "POST",
          payload: saleData,
          tempId,
        });

        return optimisticSale;
      }

      // Mode online : appel API normal
      const { data } = await axiosInstance.post("/api/v1/sales", saleData);
      return data.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};
```

### 13.8 Installation PWA — main.jsx

```jsx
// client/src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.jsx";
import "./index.css";

// Enregistrement du Service Worker (Vite PWA gère ça automatiquement)
import { registerSW } from "virtual:pwa-register";

const updateSW = registerSW({
  onNeedRefresh() {
    // Nouvelle version disponible — proposer la mise à jour
    if (confirm("Nouvelle version disponible. Mettre à jour ?")) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log("✅ StockWise disponible hors ligne");
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,         // 5 minutes
      retry: navigator.onLine ? 2 : 0,  // Pas de retry en offline
      networkMode: "offlineFirst",       // TanStack Query v5 — tenter même offline
    },
    mutations: {
      networkMode: "offlineFirst",
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
```

### 13.9 App.jsx — Structure globale avec OnlineIndicator

```jsx
// client/src/App.jsx
import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useThemeStore } from "./store/themeStore";
import OnlineIndicator from "./components/shared/OnlineIndicator";
import AppLayout from "./components/layout/AppLayout";
import PrivateRoute from "./routes/PrivateRoute";

// Pages (lazy loaded)
import { lazy, Suspense } from "react";
const DashboardPage    = lazy(() => import("./features/dashboard/pages/DashboardPage"));
const ProductsPage     = lazy(() => import("./features/products/pages/ProductsPage"));
const SalesPage        = lazy(() => import("./features/sales/pages/SalesPage"));
const AlertsPage       = lazy(() => import("./features/alerts/pages/AlertsPage"));
const AIPage           = lazy(() => import("./features/ai/pages/AIPage"));
const BillingPage      = lazy(() => import("./features/billing/pages/BillingPage"));
const SettingsPage     = lazy(() => import("./features/settings/pages/SettingsPage"));
const LoginPage        = lazy(() => import("./features/auth/pages/LoginPage"));
const RegisterPage     = lazy(() => import("./features/auth/pages/RegisterPage"));

export default function App() {
  const { theme } = useThemeStore();

  // Synchroniser data-theme au montage
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <>
      <OnlineIndicator />

      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-base-100">
          <span className="loading loading-ring loading-lg text-primary" />
        </div>
      }>
        <Routes>
          {/* Routes publiques */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Routes privées */}
          <Route element={<PrivateRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/products"  element={<ProductsPage />} />
              <Route path="/sales"     element={<SalesPage />} />
              <Route path="/alerts"    element={<AlertsPage />} />
              <Route path="/ai"        element={<AIPage />} />
              <Route path="/billing"   element={<BillingPage />} />
              <Route path="/settings"  element={<SettingsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}
```

---

## 14. SUPER ADMIN — DASHBOARD SAAS & SEEDER

> URL discrète `/console` — accessible uniquement avec le rôle `super_admin`.  
> Zéro mention de "admin" dans l'URL visible.

### 14.1 Seeder — Création du compte Super Admin

Le compte super admin n'est **jamais créé via l'interface**. Il est injecté en base de données via un script Node.js à exécuter une seule fois en CLI.

> **Règle de sécurité absolue :** Les identifiants admin ne transitent jamais via l'API publique. Le seeder est la seule porte d'entrée.

```js
// server/src/scripts/seeder.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/User.model.js";

dotenv.config();

// ─── Identifiants Super Admin ─────────────────────────────────────────────
// Définis dans server/.env — jamais en dur dans le code
const SUPER_ADMIN = {
  firstName: process.env.SUPER_ADMIN_FIRSTNAME || "Super",
  lastName:  process.env.SUPER_ADMIN_LASTNAME  || "Admin",
  email:     process.env.SUPER_ADMIN_EMAIL     || "admin@stockwise.app",
  password:  process.env.SUPER_ADMIN_PASSWORD  || "StockWise@2024!",
  role:      "super_admin",
  organizationId: null,   // Super admin n'appartient à aucune org
  isActive:  true,
};

// ─── Commande disponible : node seeder.js [--reset] ──────────────────────
const args  = process.argv.slice(2);
const RESET = args.includes("--reset");   // --reset : supprime et recrée

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("\n🔌 Connecté à MongoDB Atlas");
    console.log("──────────────────────────────────────────");

    const existing = await User.findOne({ role: "super_admin" });

    if (existing && !RESET) {
      console.log("⚠️  Super Admin déjà existant :");
      console.log("   Email :", existing.email);
      console.log("   ID    :", existing._id);
      console.log("\n💡 Pour réinitialiser : npm run seed -- --reset");
      return;
    }

    if (existing && RESET) {
      await User.deleteOne({ _id: existing._id });
      console.log("🗑️  Ancien Super Admin supprimé");
    }

    // Créer le compte (le hook pre-save hashe le password automatiquement)
    const admin = await User.create(SUPER_ADMIN);

    console.log("\n🎉 Super Admin créé avec succès !");
    console.log("──────────────────────────────────────────");
    console.log("   Email    :", admin.email);
    console.log("   Rôle     :", admin.role);
    console.log("   ID       :", admin._id);
    console.log("   Accès    : /console (après login)");
    console.log("──────────────────────────────────────────");
    console.log("\n⚠️  IMPORTANT : Changez le mot de passe en production !");
    console.log("   Supprimez SUPER_ADMIN_PASSWORD du .env après exécution.\n");

  } catch (error) {
    console.error("\n❌ Erreur seeder :", error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Déconnecté de MongoDB");
    process.exit(0);
  }
};

seed();
```

**Variables d'environnement (server/.env) :**
```env
# Super Admin — retirer après la première exécution du seeder
SUPER_ADMIN_FIRSTNAME=Jonathan
SUPER_ADMIN_LASTNAME=Admin
SUPER_ADMIN_EMAIL=admin@stockwise.app
SUPER_ADMIN_PASSWORD=MotDePasseUltraSecurise@2024!
```

**Scripts package.json :**
```json
{
  "scripts": {
    "dev":   "nodemon src/server.js",
    "start": "node src/server.js",
    "seed":  "node src/scripts/seeder.js",
    "seed:reset": "node src/scripts/seeder.js --reset"
  }
}
```

**Commandes :**
```bash
# Première installation — créer le super admin
npm run seed

# Réinitialiser le super admin (nouveau mot de passe)
npm run seed:reset
```

### 14.2 Routes Super Admin API

```
GET    /api/v1/console/stats              ← KPIs globaux SaaS
GET    /api/v1/console/organizations      ← Liste toutes les orgs
GET    /api/v1/console/organizations/:id  ← Détail org + users + subscription
PATCH  /api/v1/console/organizations/:id  ← Modifier plan, statut, trial
DELETE /api/v1/console/organizations/:id  ← Désactiver org (soft)
GET    /api/v1/console/users              ← Tous les utilisateurs
PATCH  /api/v1/console/users/:id          ← Activer/désactiver user
GET    /api/v1/console/subscriptions      ← Tous les abonnements
GET    /api/v1/console/revenue            ← MRR, ARR, churn
GET    /api/v1/console/feedbacks          ← Tous les feedbacks
PATCH  /api/v1/console/feedbacks/:id      ← Changer statut feedback
```

**Protection double couche :**
```js
// server/src/api/v1/routes/console.routes.js
router.use(protect, authorize("super_admin"));
// Toutes les routes console héritent de cette protection
```

### 14.3 Console Service — KPIs SaaS

```js
// server/src/services/console.service.js
export const getSaaSStats = async () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalOrgs, activeOrgs, trialOrgs, proOrgs, totalUsers, newOrgsThisMonth, revenue] =
    await Promise.all([
      Organization.countDocuments(),
      Organization.countDocuments({ isActive: true }),
      Organization.countDocuments({ isTrialActive: true, trialEndsAt: { $gt: now } }),
      Organization.countDocuments({ plan: "pro" }),
      User.countDocuments({ role: { $ne: "super_admin" } }),
      Organization.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Subscription.aggregate([
        { $unwind: "$invoices" },
        { $match: { "invoices.status": "complete", "invoices.paidAt": { $gte: startOfMonth } } },
        { $group: { _id: null, mrr: { $sum: "$invoices.amount" } } },
      ]),
    ]);

  return {
    organizations: { total: totalOrgs, active: activeOrgs, trial: trialOrgs, pro: proOrgs },
    users: { total: totalUsers },
    growth: { newOrgsThisMonth },
    revenue: { mrr: revenue[0]?.mrr || 0, currency: "XAF" },
  };
};
```

### 14.4 Layout & Pages Console

```jsx
// client/src/features/console/layout/ConsoleLayout.jsx
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart3, Building2, Users, CreditCard,
  MessageSquare, LogOut, Shield
} from "lucide-react";
import { useAuthStore } from "../../../store/authStore";
import ThemeToggle from "../../../components/ui/ThemeToggle";

const CONSOLE_NAV = [
  { to: "/console",               label: "Vue d'ensemble",  Icon: BarChart3,     end: true },
  { to: "/console/organizations", label: "Organisations",   Icon: Building2 },
  { to: "/console/users",         label: "Utilisateurs",    Icon: Users },
  { to: "/console/subscriptions", label: "Abonnements",     Icon: CreditCard },
  { to: "/console/feedbacks",     label: "Feedbacks",       Icon: MessageSquare },
];

export default function ConsoleLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen flex bg-base-100">

      {/* Sidebar Console — style différent du layout client */}
      <aside className="w-64 min-h-screen bg-neutral text-neutral-content flex flex-col sticky top-0">

        {/* Logo Console */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-primary" />
            <span className="font-display text-lg font-bold">StockWise</span>
          </div>
          <span className="text-xs text-white/40 mt-1 block font-mono">Console · Super Admin</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {CONSOLE_NAV.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? "bg-primary text-primary-content"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer Sidebar Console */}
        <div className="p-3 border-t border-white/10 space-y-1">
          <div className="px-3 py-2">
            <p className="text-xs text-white/40">Connecté en tant que</p>
            <p className="text-sm font-medium text-white truncate">
              {user?.firstName} {user?.lastName}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/60 hover:bg-white/10 hover:text-white transition-colors"
            >
              <LogOut size={16} />
              Déconnexion
            </button>
          </div>
        </div>
      </aside>

      {/* Contenu principal */}
      <main className="flex-1 overflow-y-auto">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="p-6"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
```

**ConsolePage.jsx — KPIs principaux :**
```jsx
// client/src/features/console/pages/ConsolePage.jsx
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Building2, Users, Zap, TrendingUp,
  AlertTriangle, MessageSquare, Clock
} from "lucide-react";
import axiosInstance from "../../../lib/axios";
import { formatXAF } from "../../../utils/formatters";

export default function ConsolePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["console", "stats"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/console/stats");
      return data.data;
    },
    refetchInterval: 60_000,    // Rafraîchir chaque minute
  });

  const stats = [
    {
      label: "Organisations",
      value: data?.organizations.total ?? "—",
      sub: `${data?.organizations.active ?? 0} actives`,
      Icon: Building2, color: "text-primary",
    },
    {
      label: "En période trial",
      value: data?.organizations.trial ?? "—",
      sub: "accès complet 30j",
      Icon: Clock, color: "text-warning",
    },
    {
      label: "Plan Pro",
      value: data?.organizations.pro ?? "—",
      sub: "abonnements actifs",
      Icon: Zap, color: "text-success",
    },
    {
      label: "MRR",
      value: data?.revenue.mrr ? formatXAF(data.revenue.mrr) : "—",
      sub: "ce mois",
      Icon: TrendingUp, color: "text-accent",
    },
    {
      label: "Utilisateurs",
      value: data?.users.total ?? "—",
      sub: "hors super admin",
      Icon: Users, color: "text-secondary",
    },
    {
      label: "Nouveaux ce mois",
      value: data?.growth.newOrgsThisMonth ?? "—",
      sub: "organisations",
      Icon: Building2, color: "text-info",
    },
  ];

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
  const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">Vue d'ensemble SaaS</h1>
        <p className="text-base-content/50 text-sm mt-1">
          Métriques globales StockWise — mis à jour toutes les minutes
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {stats.map(s => (
            <motion.div
              key={s.label}
              variants={item}
              className="card bg-base-200 border border-base-300"
            >
              <div className="card-body p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-base-content/50 mb-1">{s.label}</p>
                    <p className={`text-2xl font-bold font-display ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-base-content/40 mt-1">{s.sub}</p>
                  </div>
                  <s.Icon size={20} className={`${s.color} opacity-50`} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
```

**ConsoleOrganizationsPage.jsx — tableau avec actions rapides :**
```jsx
// client/src/features/console/pages/ConsoleOrganizationsPage.jsx
// Colonnes : Nom · Plan · Trial restant · Utilisateurs · MRR contrib · Créée le · Actions
// Actions rapides inline :
//   - Changer plan (select dropdown DaisyUI)
//   - Étendre le trial (+7j / +30j)
//   - Désactiver l'organisation (modale de confirmation)
// Filtres : Tous / Trial / Pro / Starter / Désactivés
// Recherche : par nom d'organisation ou email owner
```

**ConsoleFeedbacksPage.jsx — gestion des feedbacks :**
```jsx
// client/src/features/console/pages/ConsoleFeedbacksPage.jsx
// Colonnes : Type · Titre · Organisation · Date · Priorité · Statut · Actions
// Filtres : type (bug/suggestion/ux...) + statut (new/in_review/done...) + priorité
// Action : cliquer une ligne → drawer latéral avec :
//   - Message complet
//   - Page concernée
//   - Champ "Note admin" (textarea)
//   - Select statut
//   - Select priorité
//   - Bouton "Enregistrer" → PATCH /console/feedbacks/:id
// Compteur badge "new" dans la nav console
```

**SuperAdminRoute.jsx — garde de route :**
```jsx
// client/src/routes/SuperAdminRoute.jsx
export default function SuperAdminRoute() {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== "super_admin") return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
```

**Enregistrement dans App.jsx :**
```jsx
{/* Routes Super Admin — /console */}
<Route element={<SuperAdminRoute />}>
  <Route element={<ConsoleLayout />}>
    <Route path="/console"                element={<ConsolePage />} />
    <Route path="/console/organizations"  element={<ConsoleOrganizationsPage />} />
    <Route path="/console/users"          element={<ConsoleUsersPage />} />
    <Route path="/console/subscriptions"  element={<ConsoleSubscriptionsPage />} />
    <Route path="/console/feedbacks"      element={<ConsoleFeedbacksPage />} />
  </Route>
</Route>
```

---

## 15. SYSTÈME DE FEEDBACK UTILISATEUR

### 15.1 Feedback Model

```js
// server/src/models/Feedback.model.js
import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", default: null },
  userId:         { type: mongoose.Schema.Types.ObjectId, ref: "User",         default: null },

  type: {
    type: String,
    enum: ["bug", "feature_request", "general", "ux", "billing"],
    required: true,
  },
  title:   { type: String, required: true, trim: true, maxlength: 120 },
  message: { type: String, required: true, trim: true, maxlength: 1000 },
  rating:  { type: Number, min: 1, max: 5, default: null },

  // Contexte automatique
  page:      { type: String },        // URL de la page au moment du feedback
  userAgent: { type: String },

  // Gestion admin
  status: {
    type: String,
    enum: ["new", "in_review", "planned", "done", "rejected"],
    default: "new",
  },
  adminNote: { type: String },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "medium",
  },
}, { timestamps: true });

feedbackSchema.index({ status: 1, createdAt: -1 });
feedbackSchema.index({ organizationId: 1 });

export default mongoose.model("Feedback", feedbackSchema);
```

### 15.2 Feedback Service

```js
// server/src/services/feedback.service.js

export const createFeedback = async (feedbackData, user, req) => {
  const feedback = await Feedback.create({
    organizationId: user?.organizationId || null,
    userId: user?._id || null,
    ...feedbackData,
    page: feedbackData.page || req.headers.referer,
    userAgent: req.headers["user-agent"],
  });

  // Alerte immédiate admin si bug ou critique
  if (feedbackData.type === "bug" || feedbackData.priority === "critical") {
    await notifySuperAdminNewFeedback(feedback);
  }
  return feedback;
};

export const updateFeedbackStatus = async (feedbackId, updates) => {
  const feedback = await Feedback.findByIdAndUpdate(
    feedbackId,
    { status: updates.status, adminNote: updates.adminNote, priority: updates.priority },
    { new: true }
  ).populate("userId", "firstName lastName email");

  // Email utilisateur si statut "done" ou "planned"
  if (["done", "planned"].includes(updates.status) && feedback.userId) {
    await sendFeedbackStatusEmail(feedback);
  }
  return feedback;
};
```

### 15.3 Widget Feedback — Bouton flottant

Le widget est accessible depuis **toutes les pages** via un bouton flottant.  
Position : `bottom-20 right-4` sur mobile (au-dessus du BottomNav), `bottom-6 right-6` sur desktop.

```jsx
// client/src/components/shared/FeedbackButton.jsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Bug, Lightbulb, MessageCircle, Palette, Send, CheckCircle, Star } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import axiosInstance from "../../lib/axios";

const FEEDBACK_TYPES = [
  { value: "bug",             label: "Bug",        Icon: Bug,           color: "btn-error" },
  { value: "feature_request", label: "Suggestion", Icon: Lightbulb,     color: "btn-warning" },
  { value: "general",         label: "Commentaire",Icon: MessageCircle, color: "btn-info" },
  { value: "ux",              label: "UX/Design",  Icon: Palette,       color: "btn-accent" },
];

export default function FeedbackButton() {
  const [open, setOpen]         = useState(false);
  const [step, setStep]         = useState(1);           // 1: type · 2: formulaire · 3: succès
  const [type, setType]         = useState(null);
  const [form, setForm]         = useState({ title: "", message: "", rating: 0 });
  const location                = useLocation();

  const mutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await axiosInstance.post("/feedbacks", payload);
      return data;
    },
    onSuccess: () => {
      setStep(3);
      // Réinitialiser après 3 secondes
      setTimeout(() => {
        setOpen(false);
        setStep(1);
        setType(null);
        setForm({ title: "", message: "", rating: 0 });
      }, 3000);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      type,
      title: form.title,
      message: form.message,
      rating: form.rating || null,
      page: location.pathname,
    });
  };

  const selectedType = FEEDBACK_TYPES.find(t => t.value === type);

  return (
    <>
      {/* Bouton flottant */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 btn btn-primary btn-circle shadow-lg"
        aria-label="Donner un feedback"
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.span key="x"  initial={{ rotate: -90 }} animate={{ rotate: 0 }}><X size={20} /></motion.span>
            : <motion.span key="msg"initial={{ rotate: 90  }} animate={{ rotate: 0 }}><MessageSquare size={20} /></motion.span>
          }
        </AnimatePresence>
      </motion.button>

      {/* Modal / Drawer */}
      <AnimatePresence>
        {open && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-30 md:hidden"
              onClick={() => setOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 16 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="fixed bottom-36 right-4 md:bottom-20 md:right-6 z-40 w-80 card bg-base-200 shadow-2xl border border-base-300"
            >
              <div className="card-body p-4 gap-4">

                {/* ─── Étape 1 : Choisir le type ─────────────────── */}
                {step === 1 && (
                  <>
                    <div>
                      <h3 className="font-display font-bold text-base">Votre feedback</h3>
                      <p className="text-xs text-base-content/50 mt-0.5">Quel type de retour souhaitez-vous partager ?</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {FEEDBACK_TYPES.map(({ value, label, Icon, color }) => (
                        <button
                          key={value}
                          className={`btn btn-sm btn-outline gap-2 ${type === value ? color : ""}`}
                          onClick={() => { setType(value); setStep(2); }}
                        >
                          <Icon size={14} />
                          {label}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {/* ─── Étape 2 : Formulaire ───────────────────────── */}
                {step === 2 && selectedType && (
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        onClick={() => setStep(1)}
                      >← </button>
                      <selectedType.Icon size={15} className="text-primary" />
                      <h3 className="font-display font-bold text-sm">{selectedType.label}</h3>
                    </div>

                    <input
                      type="text"
                      placeholder="Titre (ex: le bouton X ne fonctionne pas)"
                      value={form.title}
                      onChange={e => setForm({ ...form, title: e.target.value })}
                      required
                      maxLength={120}
                      className="input input-bordered input-sm w-full"
                    />

                    <textarea
                      placeholder="Décrivez votre retour en détail…"
                      value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      required
                      maxLength={1000}
                      rows={4}
                      className="textarea textarea-bordered textarea-sm w-full resize-none"
                    />

                    {/* Notation étoiles (optionnel) */}
                    <div>
                      <p className="text-xs text-base-content/50 mb-1.5">Note globale (optionnel)</p>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setForm({ ...form, rating: star })}
                          >
                            <Star
                              size={18}
                              className={star <= form.rating ? "text-warning fill-warning" : "text-base-content/20"}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary btn-sm w-full gap-2"
                      disabled={mutation.isPending}
                    >
                      {mutation.isPending
                        ? <span className="loading loading-spinner loading-xs" />
                        : <Send size={14} />
                      }
                      {mutation.isPending ? "Envoi…" : "Envoyer"}
                    </button>
                  </form>
                )}

                {/* ─── Étape 3 : Succès ───────────────────────────── */}
                {step === 3 && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center text-center py-4 gap-3"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
                    >
                      <CheckCircle size={40} className="text-success" />
                    </motion.div>
                    <div>
                      <p className="font-display font-bold">Merci pour votre retour !</p>
                      <p className="text-xs text-base-content/50 mt-1">
                        Votre feedback a été reçu. Nous vous répondrons dès que possible.
                      </p>
                    </div>
                  </motion.div>
                )}

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
```

**Intégration dans AppLayout.jsx :**
```jsx
// Juste avant la fermeture de la div racine dans AppLayout
import FeedbackButton from "../shared/FeedbackButton";

// Dans le JSX :
<FeedbackButton />
```

### 15.4 Routes Feedback

```
POST   /api/v1/feedbacks        ← Soumettre (authentifié)
GET    /api/v1/feedbacks/my     ← Mes feedbacks + statuts

# Console Admin
GET    /api/v1/console/feedbacks       ← Tous (filtres: type, status, priority)
PATCH  /api/v1/console/feedbacks/:id   ← Modifier statut + note admin
```

### 15.5 Cycle de vie d'un feedback (emails)

| Événement | Destinataire | Action |
|---|---|---|
| Bug soumis | Super Admin | Email alerte immédiate |
| Tout feedback | Super Admin | Résumé quotidien CRON 09h00 |
| Statut → `planned` | Utilisateur | "Votre suggestion sera intégrée" |
| Statut → `done` | Utilisateur | "Votre retour a été pris en compte" |

---

## 16. DÉPLOIEMENT

### 16.1 Backend — Render

**render.yaml** :
```yaml
services:
  - type: web
    name: stockwise-api
    env: node
    buildCommand: npm install
    startCommand: node src/server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        sync: false
      - key: JWT_SECRET
        generateValue: true
      - key: GEMINI_API_KEY
        sync: false
      - key: NOTCHPAY_PUBLIC_KEY
        sync: false
      - key: NOTCHPAY_PRIVATE_KEY
        sync: false
      - key: NOTCHPAY_WEBHOOK_HASH
        sync: false
```

### 16.2 Frontend — Vercel

**vercel.json** :
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        { "key": "Cache-Control", "value": "no-cache" },
        { "key": "Service-Worker-Allowed", "value": "/" }
      ]
    }
  ],
  "env": {
    "VITE_API_URL": "@stockwise_api_url",
    "VITE_SOCKET_URL": "@stockwise_socket_url"
  }
}
```

> Le header `Cache-Control: no-cache` sur `sw.js` est critique — il garantit que Vercel ne cache pas le Service Worker, sinon les mises à jour PWA ne se propagent pas.

### 16.3 Variables d'environnement — Référence complète

**server/.env (toutes les variables) :**
```env
# ─── Serveur ──────────────────────────────────────────────────
PORT=5000
NODE_ENV=development

# ─── Base de données ──────────────────────────────────────────
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/stockwise?retryWrites=true&w=majority

# ─── JWT ──────────────────────────────────────────────────────
JWT_SECRET=<min_64_chars_random_string>
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# ─── URLs ─────────────────────────────────────────────────────
CLIENT_URL=http://localhost:5173

# ─── IA Gemini ────────────────────────────────────────────────
GEMINI_API_KEY=<google_ai_studio_key>

# ─── NotchPay ─────────────────────────────────────────────────
NOTCHPAY_PUBLIC_KEY=pk_live_xxxxxx
NOTCHPAY_PRIVATE_KEY=sk_live_xxxxxx
NOTCHPAY_WEBHOOK_HASH=<webhook_hash_from_notchpay_dashboard>

# ─── Email (Nodemailer) ───────────────────────────────────────
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=noreply@stockwise.app
MAIL_PASS=<gmail_app_password>
MAIL_FROM="StockWise <noreply@stockwise.app>"

# ─── Super Admin (retirer après npm run seed) ─────────────────
SUPER_ADMIN_FIRSTNAME=Jonathan
SUPER_ADMIN_LASTNAME=Admin
SUPER_ADMIN_EMAIL=admin@stockwise.app
SUPER_ADMIN_PASSWORD=<ultra_strong_password>
```

**client/.env.local :**
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```

### 16.4 Checklist de mise en production

```
Infrastructure
✅ Cluster MongoDB Atlas créé (M0 MVP → M10 si > 500 orgs)
✅ Index Atlas activés (organizationId composites)
✅ IP Whitelist Atlas → 0.0.0.0/0 (Render dynamic IPs)
✅ Render service déployé + health check /api/v1/health
✅ Vercel projet connecté au repo GitHub + auto-deploy main

Sécurité
✅ JWT_SECRET généré (openssl rand -base64 64)
✅ CORS CLIENT_URL configuré (URL Vercel exacte)
✅ Rate limiter activé en production
✅ Helmet.js activé (headers de sécurité HTTP)
✅ Webhook NotchPay HMAC-SHA256 vérifié

Seed & Admin
✅ npm run seed exécuté via Render Shell
✅ Login /login avec identifiants admin → redirect /console vérifié
✅ SUPER_ADMIN_PASSWORD retiré du .env production après seed

Paiements
✅ URL Webhook NotchPay → https://api.stockwise.app/webhooks/notchpay
✅ Test paiement sandbox MTN MoMo end-to-end
✅ Activation plan Pro post-webhook vérifiée

PWA
✅ manifest.json valide (Chrome DevTools → Application)
✅ Service Worker enregistré
✅ Score Lighthouse PWA ≥ 90
✅ Install prompt testé Android Chrome + iOS Safari (Add to Home Screen)
✅ Mode offline testé : couper réseau → créer vente → rétablir → sync

Monitoring
✅ Winston logs structurés → Render Logs
✅ CRON jobs opérationnels (vérifier logs 02h00, 06h00, 09h00)
✅ Email Nodemailer testé (bienvenue, trial expiry, paiement)
```

---

## 17. SÉCURITÉ TRANSVERSALE

> Cette section récapitule toutes les décisions de sécurité à valider avant la mise en production.

### 17.1 Authentification & Sessions

```
✅ Mots de passe hashés avec bcryptjs (salt rounds: 12)
✅ JWT access token — durée courte (7j) stocké en mémoire (authStore Zustand)
✅ Refresh token — durée longue (30j) hashé en base avant stockage
✅ Cookie httpOnly pour le refresh token (protection XSS)
✅ Rotation du refresh token à chaque renouvellement
✅ Invalidation du refresh token au logout (hash en base supprimé)
✅ lastLogin mis à jour à chaque connexion (audit trail)
```

### 17.2 Multi-tenant — Isolation des données

```
✅ organizationId présent sur chaque model métier (Product, Sale, Movement...)
✅ tenant.middleware.js injecte req.organizationId sur TOUTES les routes authentifiées
✅ Chaque query Mongoose filtre par organizationId SANS EXCEPTION
✅ Les agrégations MongoDB utilisent $match { organizationId } en premier stage
✅ Tests d'isolation : tenter d'accéder aux données d'une autre org → 404
```

### 17.3 API & Entrées utilisateur

```
✅ Validation Joi sur toutes les routes POST/PUT/PATCH
✅ Sanitisation des chaînes (trim, lowercase où applicable)
✅ Limitation de la taille des payloads (express.json({ limit: "10kb" }))
✅ Rate limiting par IP + tenant (express-rate-limit)
✅ Helmet.js — headers de sécurité HTTP (CSP, HSTS, X-Frame-Options...)
✅ CORS restrictif — uniquement CLIENT_URL en production
✅ Pas d'exposition des stack traces en production (NODE_ENV check)
```

### 17.4 Super Admin — Accès Console

```
✅ Compte super_admin créé UNIQUEMENT via seeder.js CLI
✅ Aucune route publique pour créer un super_admin
✅ Double middleware : protect (JWT) + authorize("super_admin")
✅ URL /console non mentionnée dans l'UI client (security by obscurity)
✅ Logs de toutes les actions console (Winston audit trail)
✅ SUPER_ADMIN_PASSWORD retiré du .env après le premier seed
```

### 17.5 Webhooks NotchPay

```
✅ Signature HMAC-SHA256 vérifiée AVANT tout traitement
✅ Réponse 200 immédiate à NotchPay + traitement async (évite les timeouts)
✅ Idempotence : vérifier si la référence a déjà été traitée avant activation plan
✅ Logs de chaque webhook reçu (référence, event, statut)
```

### 17.6 Utilitaire `asyncHandler`

```js
// server/src/utils/asyncHandler.util.js
/**
 * Wrapper pour éviter les try/catch répétitifs dans les controllers.
 * Toutes les erreurs async sont capturées et passées à next()
 * → errorHandler.middleware.js les formate uniformément.
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Usage dans les controllers :
export const getProducts = asyncHandler(async (req, res) => {
  const products = await productService.getProducts(req.organizationId, req.query);
  res.json({ success: true, data: products.products, meta: { total: products.total } });
});
```

---

**render.yaml** :
```yaml
services:
  - type: web
    name: stockwise-api
    env: node
    buildCommand: npm install
    startCommand: node src/server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        sync: false
      - key: JWT_SECRET
        generateValue: true
      - key: GEMINI_API_KEY
        sync: false
```

### 14.2 Frontend — Vercel

**vercel.json** :
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "env": {
    "VITE_API_URL": "@stockwise_api_url",
    "VITE_SOCKET_URL": "@stockwise_socket_url"
  }
}
```

## 17. ORDRE DE BUILD

> Respecter cet ordre évite les dépendances circulaires et permet de tester chaque couche avant la suivante.

### Phase 1 — Fondations (Jour 1-2)
```
✅ Setup monorepo (client/ + server/)
✅ Configuration MongoDB Atlas + connexion Mongoose
✅ Configuration variables d'environnement
✅ app.js + server.js (Express 5 de base + Socket.io 4.8 init)
✅ Models : Organization (avec trialEndsAt), User, Subscription
✅ Utils : response.util, jwt.util, logger.util, asyncHandler
✅ config/plans.js — source de vérité des plans
✅ Middleware : errorHandler
```

### Phase 2 — Auth End-to-End (Jour 3-4)
```
✅ auth.service.js (register → crée org avec trialEndsAt, login, refresh, logout)
✅ auth.routes.js + auth.controller.js
✅ auth.middleware.js (protect, authorize)
✅ tenant.middleware.js
✅ planGate.middleware.js
✅ Test Postman de tout le flow auth
✅ Frontend : axiosInstance + authStore + LoginPage + RegisterPage
✅ PrivateRoute + AppLayout vide + TrialBanner
```

### Phase 3 — Produits & Stock (Jour 5-7)
```
✅ Models : Product, Category, StockMovement
✅ product.service.js + product.routes.js + product.controller.js
✅ movement.service.js (avec transaction Mongoose)
✅ validate.middleware.js + product.validation.js
✅ Frontend : ProductsPage + ProductTable + ProductForm
✅ Stock adjustment UI
```

### Phase 4 — Ventes (Jour 8-9)
```
✅ Sale model
✅ sale.service.js (createSale avec transaction)
✅ sale.routes.js + sale.controller.js
✅ Frontend : SaleForm (panier) + SalesHistoryPage
```

### Phase 5 — Dashboard (Jour 10)
```
✅ dashboard.service.js (getDashboardSummary — aggregation)
✅ Frontend : DashboardPage + StatsRow + CriticalStockList + TopProducts
```

### Phase 6 — Alertes & WebSocket (Jour 11-12)
```
✅ Alert model
✅ alert.service.js (createAlert + checkStockAlerts)
✅ socket.service.js (initSocket + emitToOrg)
✅ Intégration dans movement.service.js
✅ Frontend : useSocket + useAlerts + AlertBadge + AlertToast
```

### Phase 7 — IA Gemini (Jour 13-15)
```
✅ Recommendation model
✅ ai.service.js (generateRecommendations + prompt engineering Gemini 2.5 Flash)
✅ aiRecommendations.job.js (CRON 02h00)
✅ ai.routes.js avec planGate("aiRecommendations")
✅ Frontend : AIPage (wrappée dans PlanGateUI) + RecommendationCard (4 types)
✅ Dashboard : AIInsightWidget
```

### Phase 8 — Billing NotchPay (Jour 16-17)
```
✅ billing.service.js (initiatePlanUpgrade + handlePaymentComplete + handlePaymentFailed)
✅ notchpay.webhook.js (HMAC-SHA256 verify)
✅ billing.routes.js + billing.controller.js
✅ trialExpiry.job.js (CRON 06h00 — check + emails J-7, J-3, J0)
✅ Email templates : bienvenue, rappel, expiration, confirmation paiement
✅ Frontend : BillingPage (3 plans) + TrialBanner + PlanGateUI
✅ usePlan hook + store authStore mis à jour avec org
✅ Test paiement sandbox NotchPay end-to-end
```

### Phase 9 — Mobile First, PWA & Thème (Jour 18-19)
```
✅ index.html — Google Fonts (Syne + DM Sans) + script anti-FOUC
✅ index.css — @import tailwindcss + @plugin daisyui + variables CSS polices
✅ themeStore.js — Zustand persist → localStorage "stockwise-theme"
✅ ThemeToggle.jsx — Sun/Moon avec persist
✅ AppLayout.jsx — Sidebar (md+) + BottomNav (mobile) + pb-24
✅ BottomNav.jsx — 5 items + badge alertes + indicateur actif animé
✅ Sidebar.jsx — groupes nav + ThemeToggle en footer
✅ Safe area CSS (env(safe-area-inset-bottom))
✅ vite.config.js — VitePWA plugin + Workbox + manifest complet
✅ lib/db.js — IndexedDB init (idb) : products, sales, movements, syncQueue
✅ lib/syncQueue.js — enqueue, getPendingActions, markAsDone
✅ hooks/useOfflineSync.js — online/offline listener + replay queue
✅ OnlineIndicator.jsx — bannière offline + toast sync
✅ useCreateSale.js — offline mode + optimistic update + IndexedDB
✅ main.jsx — registerSW + QueryClient networkMode: "offlineFirst"
✅ Test install PWA sur mobile (Android Chrome + iOS Safari)
✅ Test offline : créer vente → retour réseau → sync automatique
```

### Phase 10 — Super Admin & Feedback (Jour 20-21)
```
✅ AppError.js — classe avec code machine (USER_NOT_FOUND, WRONG_PASSWORD...)
✅ loginService — codes d'erreur explicites + null org pour super_admin
✅ LoginPage.jsx — routage automatique par rôle + CTA register si USER_NOT_FOUND
✅ seeder.js — script CLI avec --reset + variables env SUPER_ADMIN_*
✅ npm run seed → compte super_admin créé en base
✅ console.routes.js — protect + authorize("super_admin") sur toutes les routes
✅ console.service.js — getSaaSStats() aggregation MongoDB
✅ ConsoleLayout.jsx — layout séparé du layout client
✅ SuperAdminRoute.jsx — garde de route + redirect si role !== super_admin
✅ App.jsx — routes /console enregistrées avec SuperAdminRoute
✅ Feedback.model.js — statuts + priorité + note admin
✅ feedback.service.js — createFeedback + updateFeedbackStatus + email
✅ feedback.routes.js + feedbacks.routes.js (console)
✅ FeedbackButton.jsx — bouton flottant + modal 3 étapes
✅ ConsoleFeedbacksPage.jsx — tableau filtrable + actions statut
✅ CRON digest feedbacks 09h00
```

### Phase 11 — Polish & Déploiement (Jour 22-24)
```
✅ Framer Motion — page transitions + stagger animations dashboard
✅ Responsive final — test sur mobile 375px, tablet 768px, desktop 1280px
✅ Gestion des erreurs (toasts DaisyUI + empty states + PlanGateUI)
✅ Variables d'env production (Render + Vercel) + SUPER_ADMIN_* à retirer après seed
✅ Deploy backend → Render
✅ npm run seed (en production Render via shell)
✅ Deploy frontend → Vercel
✅ Configurer webhook URL NotchPay → URL Render /webhooks/notchpay
✅ Test end-to-end en production (trial → paiement → activation Pro)
✅ Test PWA production — Lighthouse PWA score ≥ 90
✅ Test routage rôle : super_admin → /console, client → /dashboard, inconnu → register CTA
```

---

*Document de conception StockWise MVP — v4.0*  
*Stack : React 19 · Vite 6 · DaisyUI 5 (light/dark natif) · Framer Motion 12 · Lucide React 0.487*  
*Node.js 22 LTS · Express 5 · MongoDB 7 · Gemini 2.5 Flash · NotchPay*  
*PWA : Vite PWA Plugin · Workbox 7 · IndexedDB (idb) · Background Sync*  
*Typographie : Syne + DM Sans (Google Fonts natif)*  
*Auth : 4 rôles (super_admin / owner / admin / staff) · Routage automatique par rôle*  
*Admin : Dashboard SaaS /console · Seeder CLI avec --reset · Feedback loop complet*
