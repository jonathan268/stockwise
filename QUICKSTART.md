# Guide de Démarrage Rapide — StockWise

## ⚡ 5 Minutes pour Démarrer

### 1. Cloner & installer dépendances

```bash
# Backend
cd server
npm install
cp .env.example .env

# Frontend
cd ../client
npm install
```

### 2. Configurer MongoDB

1. Créer un compte **MongoDB Atlas** (gratuit): https://www.mongodb.com/products/platform/atlas
2. Créer un cluster M0 (gratuit) en région **N. Virginia** ou **Ireland**
3. Copier la chaîne de connexion
4. Dans `server/.env`: `MONGODB_URI=<votre_chaine>`

### 3. Démarrer

```bash
# Terminal 1 — Backend (port 5000)
cd server
npm run dev

# Terminal 2 — Frontend (port 5173)
cd client
npm run dev
```

Visitez: **http://localhost:5173**

### 4. Tester

Créez un compte (S'inscrire) avec:

- Email: `test@example.com`
- Mot de passe: `Password123`
- Organisation: `Mon Entreprise`

Ou connectez-vous avec les identifiants.

---

## 🔐 Super Admin

Pour accéder à `/console` (dashboard SaaS):

```bash
cd server
npm run seed
```

Cela crée un compte super admin. Identifiants dans `server/.env`.

---

## 📚 Documentation Complète

Voir `conception.md` pour:

- Architecture détaillée
- APIs REST
- Déploiement
- Stack complet

---

**Prêt ? Bon développement ! 🚀**
