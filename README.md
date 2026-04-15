# StockWise — Gestion de Stock Intelligente v4.0

**StockWise** est une plateforme SaaS multi-tenant pour la gestion de stock et des ventes, conçue spécifiquement pour les PME africaines.

## 🚀 Stack Technologique

### Backend

- **Runtime**: Node.js 22 LTS
- **Framework**: Express 5
- **Base de données**: MongoDB Atlas 7
- **Authentification**: JWT + bcryptjs
- **API IA**: Google Gemini 2.5 Flash
- **Paiements**: NotchPay (XAF natif - MTN Mobile Money, Orange Money)
- **WebSocket**: Socket.io 4.8
- **Tâches planifiées**: node-cron
- **Monitoring**: Winston

### Frontend

- **Framework**: React 19 + Vite 6
- **UI**: DaisyUI 5 + Tailwind CSS 4
- **Animations**: Framer Motion 12
- **État**: Zustand 5 + React Query v5
- **Routage**: React Router v7
- **HTTP**: Axios
- **PWA**: Vite PWA Plugin + Workbox
- **Offline**: IndexedDB (idb 8) + Background Sync API

## 📋 Modèle Commercial

| Fonctionnalité     | Starter | Pro            | Entreprise  |
| ------------------ | ------- | -------------- | ----------- |
| **Prix**           | Gratuit | 9 900 XAF/mois | Sur devis   |
| Produits           | 100 max | Illimité       | Illimité    |
| Utilisateurs       | 3 max   | 10 max         | Illimité    |
| Recommandations IA | ❌      | ✅             | ✅          |
| **Trial**          | —       | 30j gratuit    | 30j gratuit |

## 📁 Structure du Projet

```
stockwise/
├── server/                  # Backend Node.js
│   ├── src/
│   │   ├── models/         # Mongoose schemas
│   │   ├── services/       # Logique métier
│   │   ├── routes/         # Routage Express
│   │   ├── controllers/    # Handlers HTTP
│   │   ├── middleware/     # Middlewares
│   │   ├── config/         # Configuration
│   │   ├── utils/          # Utilitaires
│   │   └── server.js       # Entry point
│   ├── package.json
│   └── .env.example
│
├── client/                  # Frontend React
│   ├── src/
│   │   ├── pages/          # Pages routes
│   │   ├── store/          # Zustand stores
│   │   ├── lib/            # Utilitaires (axios, db)
│   │   ├── routes/         # Route guards
│   │   ├── App.jsx         # Root component
│   │   ├── main.jsx        # Entry point
│   │   └── index.css       # Styles globaux
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.local
│
└── README.md               # Ce fichier
```

## 🔧 Installation & Démarrage

### Prérequis

- **Node.js 22 LTS**
- **MongoDB Atlas** (créer un cluster gratuit M0)
- **npm** ou **yarn**

### 1. Backend

```bash
cd server
cp .env.example .env
npm install
```

**Configurer `.env` :**

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/stockwise
JWT_SECRET=<random_64_chars>
GEMINI_API_KEY=<google_ai_studio_key>
NOTCHPAY_PUBLIC_KEY=<pk_live_xxxxx>
NOTCHPAY_PRIVATE_KEY=<sk_live_xxxxx>
CLIENT_URL=http://localhost:5173
```

**Démarrer :**

```bash
npm run dev          # Mode développement
npm start            # Mode production
npm run seed         # Créer le super admin
```

Le serveur démarre sur `http://localhost:5000`

### 2. Frontend

```bash
cd client
npm install
```

**Démarrer :**

```bash
npm run dev          # Mode développement
npm run build        # Build production
npm run preview      # Preview du build
```

L'app démarre sur `http://localhost:5173`

## 🔑 Architecture et Concepts Clés

### Multi-tenant Isolation

Chaque tenant (organisation) est isolée au niveau de la base de données via:

- **organizationId** obligatoire sur tous les modèles métier
- **tenant.middleware** injecte `req.organizationId` sur chaque requête
- **Chaque query** filtre par organizationId < obligatoire

```js
// ✅ CORRECT
Product.find({ organizationId: req.organizationId });

// ❌ DANGEREUX
Product.find({}); // Retournerait les produits de TOUS les tenants
```

### Triangle d'Authentification

```
Inscription → User (owner) + Organization + Subscription (trial)
                    ↓
Login → JWT + refreshToken → Accesss à l'organisation
                    ↓
Super Admin → rôle=super_admin, organizationId=null → /console
```

### Flow des Plans

```
Inscription (J0)
    ↓
Trial 30j — accès COMPLET à tout (comme Pro)
    ↓
J+30 → isTrialActive=false
    ↓
Si plan="starter" → features IA verrouillées
Si plan="pro" → accès complet
```

### Recommandations IA

Les recommandations ne sont **jamais** calculées en temps réel. Elles sont:

1. Calculées par un **CRON job à 02h00** quotidiennement
2. Persistées dans `Recommendation` collection
3. Affichées instantanément dans l'UI (pas d'appel API)

## 📱 Features Principales

### Gestion des Produits

- CRUD produits avec catégories
- Suivi du stock en temps réel
- Alertes stock bas / rupture automatiques

### Gestion des Ventes

- Enregistrement des ventes (panier)
- Déduction automatique du stock
- Historique complet

### Recommandations IA

- Analyse tendances de vente (Gemini)
- Suggestions: réapprovisionnement, produits populaires, stock mort
- Bundles suggérés (co-ventes)

### Abonnements & Billing

- Trial 30j gratuit (accès complet)
- Paiement NotchPay (MTN, Orange Money, carte)
- Gestion des plans (Starter/Pro/Entreprise)

### PWA & Offline

- Mode hors ligne complet (shell en cache)
- Synchronisation automatique des actions au retour réseau
- Background Sync API

### Super Admin Console

- KPIs SaaS globaux (MRR, orgs actives, taux conversion, etc.)
- Gestion des organisations et utilisateurs
- Dashboard feedbacks utilisateurs

## 🧪 Tests & Déploiement

### Environnement Local

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

Accédez:

- **http://localhost:5173** — Frontend
- **http://localhost:5000/api/v1/health** — Backend

### Déploiement Production

**Backend (Render)**

```bash
# Connecter le repo GitHub
# Variables d'env via Render dashboard
# Deploy automatique sur push vers main
```

**Frontend (Vercel)**

```bash
# Connecter le repo GitHub
# Variables VITE_* via Vercel
# Deploy automatique sur push vers main
```

## 📚 Documentation Détaillée

La documentation complète est dans `conception.md`:

- Architecture multi-tenant en détail
- APIs REST complètes
- Modèles Mongoose
- Services et middlewares
- Intégrations (Gemini, NotchPay, etc.)
- Design system & composants UI
- PWA & offline-first strategy
- Déploiement & checklist production

## 🔐 Sécurité

- ✅ JWT avec access + refresh tokens
- ✅ Isolation tenant absolue (organizationId filtering)
- ✅ Double auth: `protect` (JWT) + `tenant` (organizationId)
- ✅ Rate limiting + Helmet.js
- ✅ Validation Joi sur tous les inputs
- ✅ Webhooks NotchPay signé HMAC-SHA256
- ✅ Super admin créé UNIQUEMENT via seeder CLI
- ✅ Aucune donnée sensible en logs

## 📝 Licence

MIT

## 👨‍💼 Support

Pour les questions ou problèmes, consultez `conception.md` ou créez une issue sur le repo.

---

**Made with ❤️ for African SMEs**
