## Déploiement complet de StockWise sur Vercel

Ce guide décrit comment déployer **frontend**, **backend API** et **base de données MongoDB** pour que l’application soit pleinement fonctionnelle sur Vercel, en partant du monorepo existant.

---

### 1. Prérequis

- **Compte Vercel** (gratuit suffit pour démarrer)
- **Compte MongoDB Atlas** (ou autre cluster MongoDB accessible depuis Internet)
- Node.js ≥ 18 installé en local
- Ce repo poussé sur GitHub / GitLab / Bitbucket

---

### 2. Base de données (MongoDB Atlas)

1. Crée un cluster MongoDB Atlas.
2. Crée un utilisateur de BDD avec un mot de passe fort.
3. Ajoute une **Database** (par ex. `stockwise`).
4. Dans la section **Network Access**, autorise :
   - Soit `0.0.0.0/0` (pour les tests),
   - Soit les IP ranges de Vercel (recommandé en prod).
5. Récupère l’URI de connexion complète, par ex. :
   - `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/stockwise?retryWrites=true&w=majority`
6. Cette valeur sera utilisée comme `MONGO_URI` côté backend.

---

### 3. Backend API sur Vercel

#### 3.1. Principe

Le backend est une app **Express** (dossier `backend`) qui écoute sur un port. Sur Vercel, on n’utilise pas `app.listen` directement : on expose plutôt un handler via `@vercel/node` ou un fichier dans `api/`.

Pour limiter les changements dans ce repo, le plus simple est :

- Déployer **backend** dans un **projet Vercel séparé**, en utilisant `backend` comme racine.

#### 3.2. Création du projet Vercel pour l’API

1. Pousse la branche `kencode` sur GitHub.
2. Sur Vercel, clique sur **New Project**.
3. Sélectionne le repo.
4. Dans **Root Directory**, choisis `backend`.
5. Laisse **Framework Preset** sur `Other`.
6. Dans **Build & Output Settings** :
   - **Build Command** : `npm install`
   - **Output Directory** : (laisser vide, c’est une API Node)
   - **Install Command** : `npm install`
7. Dans **Environment Variables**, ajoute au minimum :
   - `NODE_ENV` = `production`
   - `MONGO_URI` = (l’URI MongoDB Atlas)
   - `JWT_SECRET` = (clé longue, aléatoire)
   - `JWT_REFRESH_SECRET` = (autre clé longue, aléatoire)
   - `JWT_EXPIRE` = `15m`
   - `JWT_REFRESH_EXPIRE` = `7d`
   - `FRONTEND_URL` = URL finale du frontend (ex. `https://stockwise-front.vercel.app`)
   - (Optionnel) `BACKEND_URL` = URL de cette API (sera connue après premier déploiement)
   - (Optionnel pour Google OAuth) :
     - `CLIENT_ID`
     - `CLIENT_SECRET`
     - `GOOGLE_CALLBACK_URL` (ex. `https://<backend-domain>/api/v1/auth/google/callback`)

> Grâce au garde-fou ajouté dans `src/config/passport.js`, l’API démarre même si Google OAuth n’est pas configuré (la connexion Google sera simplement désactivée).

#### 3.3. Démarrage sur Vercel

Dans `backend/package.json`, le script utilisé est :

- `"start": "node index.js"`

Vercel utilisera automatiquement `npm start` pour lancer l’API en mode Node Serverless fonctionnant en continu.

Une fois le déploiement terminé, note l’URL de l’API, par ex. :

- `https://stockwise-api.vercel.app`

Cette URL sera utilisée côté frontend (variables `VITE_API_BASE_URL` et `VITE_API_URL`).

---

### 4. Frontend (Vite + React) sur Vercel

#### 4.1. Création du projet Vercel pour le frontend

1. Crée un **nouveau projet Vercel** depuis le même repo.
2. Dans **Root Directory**, choisis `frontend`.
3. Vercel détectera Vite automatiquement (sinon, choisir **Vite**).
4. Paramètres Build :
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist`
   - **Install Command** : `npm install`

#### 4.2. Variables d’environnement frontend

Dans la configuration Vercel du projet **frontend**, ajoute :

- `VITE_API_BASE_URL` = URL de base du backend (sans `/api/v1`), par ex.  
  `https://stockwise-api.vercel.app`
- `VITE_API_URL` = URL complète des routes API versionnées, par ex.  
  `https://stockwise-api.vercel.app/api/v1`

Ces variables sont utilisées dans `frontend/src/api/axios.js` :

- `apiBaseUrl` pour certaines routes auth (`/api/v1/auth/...`)
- `apiUrl` pour tout le reste (`/api/v1/...`)

Rebuild puis redeploie le frontend après avoir mis à jour ces variables.

---

### 5. Synthèse des URLs et configuration croisée

- **Backend (API)** : par ex. `https://stockwise-api.vercel.app`
- **Frontend (SPA)** : par ex. `https://stockwise-front.vercel.app`
- **MongoDB** : cluster Atlas (URI dans `MONGO_URI`)

Relations :

- Côté backend :
  - `FRONTEND_URL` doit pointer vers le frontend (utilisé pour les redirections OAuth et liens d’email).
- Côté frontend :
  - `VITE_API_BASE_URL` et `VITE_API_URL` doivent pointer vers l’API.

---

### 6. Points de vigilance / audit de sécurité

- **Secrets** :
  - Ne jamais commiter de credentials MongoDB ou JWT dans le code.
  - `db.js` a été corrigé pour lire uniquement `MONGO_URI` / `MONGO_URI_LOCAL`.
- **Auth & JWT** :
  - Les secrets `JWT_SECRET` et `JWT_REFRESH_SECRET` doivent être longs, aléatoires et différents.
  - Les durées d’expiration sont configurables via `JWT_EXPIRE` et `JWT_REFRESH_EXPIRE`.
- **Google OAuth** :
  - Désactivé si `CLIENT_ID` / `CLIENT_SECRET` / `GOOGLE_CALLBACK_URL` ne sont pas définis.
  - Si tu actives OAuth, veille à bien utiliser une URL de callback HTTPS correspondant à Vercel.
- **CORS** :
  - Dans `backend/index.js`, la config CORS autorise :
    - En production : `https://stockwise-eight.vercel.app`
    - En dev : `http://localhost:5173`, `http://localhost:3000`
  - Adapte l’origin de prod pour qu’il corresponde à ton vrai domaine frontend (par ex. `https://stockwise-front.vercel.app`).

---

### 7. Vérification end-to-end

1. Vérifie que l’API répond :
   - GET sur `https://stockwise-api.vercel.app/` → doit renvoyer `API StockWise fonctionnelle !`.
2. Ouvre le frontend :
   - `https://stockwise-front.vercel.app`
3. Teste le flow complet :
   - Inscription (register)
   - Connexion (login)
   - Navigation vers `/app/dashboard`, `/app/inventaire`, etc.
4. Sur erreur 401 répétées, vérifie :
   - Les variables `VITE_API_BASE_URL` / `VITE_API_URL`
   - Les `JWT_*` et `MONGO_URI` côté backend

Une fois ces étapes validées, ton app StockWise tourne entièrement sur Vercel avec une base MongoDB distante.

