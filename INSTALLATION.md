# 🔧 Guide d'Installation Complet — StockWise

## Prérequis

1. **Node.js 22 LTS** — https://nodejs.org/

   ```bash
   node --version  # Vérifier que c'est bien v22.x.x
   ```

2. **npm** — Inclus avec Node.js

   ```bash
   npm --version
   ```

3. **MongoDB Atlas (Gratuit)** — https://www.mongodb.com/products/platform/atlas
   - Créer un compte gratuit
   - Créer un cluster M0 (gratuit, illimité)
   - Région: N. Virginia ou Europe
   - Copier la connection string

4. **Git** (optionnel) — Pour versionner le code

5. **VS Code** (recommandé) — Code editor

---

## 📥 Installation Étape par Étape

### 1. Télécharger / Cloner le Projet

```bash
# Option A: Cloner depuis Git
git clone https://github.com/your-repo/stockwise.git
cd stockwise

# Option B: Télécharger le ZIP et extraire
cd ~/Desktop/MVP\ stockwise
```

### 2. Installer les Dépendances Backend

```bash
cd server
npm install
```

Cela installe:

- express, mongoose, dotenv, cors, helmet, morgan
- jsonwebtoken, bcryptjs, joi, node-cron
- socket.io, nodemailer, @google/generative-ai
- Et toutes les autres dépendances

### 3. Configurer le Backend

#### Créer le fichier `.env`

```bash
cp .env.example .env
```

#### Éditer `server/.env`

**Minimal (pour démarrer):**

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/stockwise?retryWrites=true&w=majority
JWT_SECRET=dev_secret_key_min_64_chars_should_be_random_string_here_now
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
CLIENT_URL=http://localhost:5173
```

**Obtenir votre MongoDB URI:**

1. Aller à https://www.mongodb.com/cloud/atlas
2. Créer un cluster (gratuit M0)
3. Cliquer "Connect" → "Drivers"
4. Copier la connection string
5. Remplacer `<username>`, `<password>`, `<dbname>`

**Exemple:**

```env
MONGODB_URI=mongodb+srv://myuser:mypassword123@cluster0.abc123.mongodb.net/stockwise?retryWrites=true&w=majority
```

#### Laisser vides (pour le MVP):

```env
GEMINI_API_KEY=
NOTCHPAY_PUBLIC_KEY=
NOTCHPAY_PRIVATE_KEY=
NOTCHPAY_WEBHOOK_HASH=
MAIL_HOST=
MAIL_PORT=
MAIL_USER=
MAIL_PASS=
SUPER_ADMIN_FIRSTNAME=
SUPER_ADMIN_LASTNAME=
SUPER_ADMIN_EMAIL=
SUPER_ADMIN_PASSWORD=
```

### 4. Vérifier la Connexion MongoDB

```bash
cd server
npm run dev
```

Vous devriez voir:

```
✅ MongoDB Atlas connecté
✅ Serveur lancé sur http://localhost:5000
```

Si erreur ECONNREFUSED:

- Vérifier la MONGODB_URI dans `.env`
- Vérifier que le cluster MongoDB est "Running" sur Atlas dashboard
- Vérifier IP Whitelist (Network Access) → 0.0.0.0/0 (si dev local)

### 5. Installer les Dépendances Frontend

Dans un **nouveau terminal**:

```bash
cd client
npm install
```

### 6. Configurer le Frontend

Vérifier que `client/.env.local` existe ET contient:

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```

(Déjà inclus dans le repo, ne rien changer)

### 7. Démarrer le Projet Local

**Terminal 1 — Backend:**

```bash
cd server
npm run dev
```

Expected output:

```
✅ MongoDB Atlas connecté
✅ Serveur lancé sur http://localhost:5000
```

**Terminal 2 — Frontend:**

```bash
cd client
npm run dev
```

Expected output:

```
VITE v6.0.0 ready in XXX ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

### 8. Tester l'Application

1. Ouvrir **http://localhost:5173** dans votre navigateur
2. Cliquer "S'inscrire gratuitement"
3. Créer un compte:
   - Prénom: `Jean`
   - Nom: `Dupont`
   - Email: `jean@example.com`
   - Entreprise: `Ma PMé SARL`
   - Mot de passe: `Password123`
4. Cliquer "Créer mon compte"
5. Vous devriez être redirigé vers le Dashboard

✅ **Succès !** L'application fonctionne localement.

---

## 🔐 Créer un Compte Super Admin

Pour accéder au dashboard SaaS (`/console`):

```bash
cd server
npm run seed
```

Output:

```
✅ Super Admin créé avec succès !
   Email    : admin@stockwise.app
   Rôle     : super_admin
   Accès    : /console (après login)
```

**Login:**

- Email: `admin@stockwise.app`
- Password: (voir dans `server/.env` → `SUPER_ADMIN_PASSWORD`)

Vous serez automatiquement redirigé vers `/console`.

---

## 🛑 Troubleshooting

### ❌ "EADDRINUSE: address already in use :::5000"

Le port 5000 est déjà utilisé.

**Solution:**

```bash
# Trouver le processus utilisant le port 5000
lsof -i :5000

# Ou changer le PORT dans server/.env
PORT=5001
```

### ❌ "MongooseError: Cannot connect to MongoDB"

MongoDB connection échoue.

**Vérifications:**

1. MONGODB_URI est correct dans `server/.env`
2. Cluster MongoDB est en "Running" sur Atlas
3. IP Whitelist inclut votre IP (0.0.0.0/0 pour dev)
4. Identifiants MongoDB sont corrects

### ❌ "Cannot find module 'express'"

Les dépendances ne sont pas installées.

**Solution:**

```bash
cd server
rm -rf node_modules package-lock.json
npm install
```

### ❌ "CORS error" quand communiquer backend/frontend

```
Access to XMLHttpRequest at 'http://localhost:5000/api/...' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Vérifier:**

1. Backend `server/.env` → `CLIENT_URL=http://localhost:5173`
2. Redémarrer le backend `npm run dev`
3. Vider le cache du navigateur (Ctrl+F5)

### ❌ "Unexpected token <" quand charger index.html

Le navigateur reçoit du HTML au lieu de JSON.

**Vérifier:**

- Backend démarre bien sur le port 5000
- Frontend proxy fonctionne (vite.config.js `/api`)
- Redémarrer Vite dev server

---

## 📝 Structure des Fichiers Importants

```
server/
├── .env                  ← Configuration locale (NE PAS committer)
├── .env.example          ← Template (committer ce fichier)
├── package.json
└── src/
    ├── server.js         ← Entry point
    ├── models/           ← Mongoose schemas
    ├── services/         ← Logique métier
    ├── controllers/      ← Handlers HTTP
    ├── routes/           ← Routage
    ├── middleware/       ← Middlewares
    └── utils/            ← Utilitaires

client/
├── .env.local            ← Configuration locale (NE PAS committer)
├── vite.config.js
├── tailwind.config.js
├── package.json
├── index.html
└── src/
    ├── main.jsx          ← Entry point React
    ├── App.jsx           ← Routes
    ├── pages/            ← Pages (Login, Register, Dashboard)
    ├── store/            ← Zustand stores
    ├── lib/              ← Utilitaires (axios, db)
    └── index.css         ← Styles globaux
```

---

## 📖 Prochaines Étapes

1. **Lire la documentation:**
   - `ARCHITECTURE.md` — Vue d'ensemble
   - `conception.md` — Spécification complète

2. **Implémenter les features:**
   - Voir la liste "À Implémenter" dans ARCHITECTURE.md

3. **Tester l'authentification:**
   - Créer plusieurs comptes
   - Login/logout
   - Vérifier que les données sont isolées par tenant

4. **Continuer le développement:**
   - Suivre la Roadmap dans ARCHITECTURE.md
   - Implémenter les services (ventes, IA, paiements)
   - Ajouter les routes API progressivement

---

## ✨ Astuces de Développement

### Hot Reload

Les deux serveurs (backend + frontend) auto-rechargent à chaque save. Appuyez juste F5 sur le navigateur.

### VS Code Extensions Recommandées

- **ES7+ React/Redux/React-Native snippets**
- **Prettier** — Code formatter
- **MongoDB** — Vue MongoDB depuis VS Code
- **Thunder Client** ou **REST Client** — Tester les APIs

### Tester les APIs sans Frontend

```bash
curl http://localhost:5000/api/v1/health
```

Ou utiliser Thunder Client / Postman.

### Logs PostgreSQL

Vérifier `logs/combined.log`:

```bash
tail -f server/logs/combined.log
```

---

🎉 **Vous êtes prêt ! Bon codage !**

Pour toute question: consultez `conception.md` ou ARCHITECTURE.md.
