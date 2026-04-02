# Structure Frontend StockWise

## 📁 Structure des dossiers

```
frontend/
├── src/
│   ├── pages/                    # Pages/Routes
│   │   ├── auth/                # Pages d'authentification
│   │   │   ├── AuthLayout.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── ForgotPasswordPage.jsx
│   │   │   └── ResetPasswordPage.jsx
│   │   ├── dashboard/           # Page tableau de bord
│   │   ├── products/            # Gestion des produits
│   │   ├── stock/               # Gestion des stocks
│   │   ├── orders/              # Gestion des commandes
│   │   ├── suppliers/           # Gestion des fournisseurs
│   │   ├── categories/          # Gestion des catégories
│   │   ├── analytics/           # Analytics et rapports
│   │   ├── notifications/       # Notifications
│   │   ├── settings/            # Paramètres utilisateur
│   │   ├── subscription/        # Gestion abonnement
│   │   ├── layout/              # Layouts principaux
│   │   └── errors/              # Pages d'erreur
│   │
│   ├── components/              # Composants réutilisables
│   │   ├── ErrorBoundary.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── AdminRoute.jsx
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   ├── BottomNav.jsx
│   │   └── ...
│   │
│   ├── context/                 # Contextes React
│   │   ├── AuthContext.jsx
│   │   ├── ThemeContext.jsx
│   │   ├── OrganizationContext.jsx
│   │   └── NotificationContext.jsx
│   │
│   ├── hooks/                   # Custom hooks
│   │   ├── useAuth.jsx
│   │   └── useOffline.js
│   │
│   ├── api/                     # Configuration API
│   │   └── axios.js
│   │
│   ├── services/                # Services métier
│   ├── utils/                   # Utilitaires
│   ├── assets/                  # Assets statiques
│   ├── App.jsx                  # Composant racine
│   ├── main.jsx
│   └── index.css
│
├── admin/                       # Pages admin
│   └── pages/
│       ├── AdminDashboard.jsx
│       ├── UserManagement.jsx
│       ├── OrganizationManagement.jsx
│       ├── SubscriptionManagement.jsx
│       ├── SystemLogs.jsx
│       └── AuditTrail.jsx
│
├── package.json
├── vite.config.js
├── tailwind.config.js
└── index.html
```

## 🎯 Points d'entrée

### Routes publiques (sans authentification)

- `/auth/login` - Connexion
- `/auth/register` - Inscription
- `/auth/forgot-password` - Réinitialisation de mot de passe
- `/auth/reset-password/:token` - Confirmation réinitialisation

### Routes protégées (authentifiées)

- `/` ou `/dashboard` - Tableau de bord principal
- `/products` - Gestion des produits
- `/stock` - Gestion des stocks
- `/orders` - Gestion des commandes
- `/suppliers` - Gestion des fournisseurs
- `/categories` - Gestion des catégories
- `/analytics` - Analytiques
- `/notifications` - Notifications
- `/settings` - Paramètres utilisateur

### Routes Admin (administrateurs uniquement)

- `/admin` - Tableau de bord admin
- `/admin/users` - Gestion des utilisateurs
- `/admin/organizations` - Gestion des organisations
- `/admin/subscriptions` - Gestion des abonnements
- `/admin/logs` - Logs système
- `/admin/audit-trail` - Trace d'audit

## 🔄 Flux de données

### Authentification

```
LoginPage → AuthContext → useAuth hook → apiClient → Backend
```

### Organisation Multi-tenant

```
OrganizationProvider → currentOrganization → API headers
```

### Notifications Temps réel

```
NotificationContext → WebSocket → Backend → Updated state
```

### Thème

```
ThemeContext → localStorage → HTML classList
```

## 🛠️ Configuration

### Variables d'environnement (.env)

```
VITE_API_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5000
```

### Axios Configuration

API client pré-configuré dans `src/api/axios.js`

- Headers d'authentification automatiques
- Interception d'erreurs
- Gestion des tokens

## 📦 Dépendances principales

- **React** 19.2.0 - Framework UI
- **React Router** 7.13.0 - Routage
- **Tailwind CSS** 4.1.18 - Styling
- **Framer Motion** 12.34.4 - Animations
- **Lucide React** 0.563.0 - Icônes
- **Axios** 1.13.4 - Requêtes HTTP
- **React Hot Toast** 2.6.0 - Notifications
- **React Helmet Async** 3.0.0 - Meta tags

## 🚀 Démarrage

```bash
# Installation
npm install

# Développement
npm run dev

# Build
npm run build

# Lint
npm run lint
```

## 📝 Conventions

- **Composants**: PascalCase
- **Hooks**: use + PascalCase
- **Fichiers**: noms courts, suffixe Page/Layout/Component
- **Exports**: default export pour les pages
- **Structure**: Dossiers par domaine métier

## 🔐 Sécurité

- ✅ Routes protégées avec `ProtectedRoute`
- ✅ Routes admin avec `AdminRoute`
- ✅ AuthContext pour l'état global
- ✅ Token JWT localStorage
- ✅ ErrorBoundary pour les erreurs

## 📝 Notes

Les pages stub sont créées et prêtes à être développées avec:

- Récupération de données API
- Formulaires avec validation
- Tableaux de données
- Graphiques et visualisations
- Gestion d'état locale et globale
