# Fix: Erreur 403 "Forbidden" lors de la création de catégories

## Problème

Les utilisateurs recevaient l'erreur : `POST http://localhost:3000/api/v1/categories 403 (Forbidden)`

## Cause

- Les nouveaux utilisateurs s'inscrivaient **SAN organisation** associée
- L'endpoint `/categories` requiert une organisation pour fonctionner
- Le middleware `restrictTo` retournait 403 si l'utilisateur n'avait pas d'organisation

## Solution Apportée

### 1. ✅ Création automatique d'organisation à l'inscription

**Fichier modifié:** `backend/src/controllers/authController.js` - Fonction `register()`

Les nouveaux utilisateurs auront maintenant automatiquement une organisation créée lors de l'inscription avec:

- Nom: Basé sur le nom complet de l'utilisateur
- Plan: FREE par défaut
- Status: ACTIF

### 2. ✅ Message d'erreur amélioré

**Fichier modifié:** `backend/src/middlewares/auth.js` - Fonction `restrictTo()`

Les utilisateurs existants sans organisation verront maintenant un message d'erreur clair:

> "Veuillez d'abord créer une organisation. Rendez-vous dans les paramètres pour configurer votre organisation."

### 3. ✅ Migration pour les utilisateurs existants

**Fichier créé:** `backend/migrations/createDefaultOrganizations.js`

Script pour créer automatiquement une organisation aux utilisateurs existants qui n'en ont pas.

## Étapes d'installation du fix

### 1. Mettre à jour le code

```bash
cd backend
npm install  # (si besoin)
```

### 2. (Optionnel) Appliquer la migration pour les utilisateurs existants

```bash
node migrations/createDefaultOrganizations.js
```

### 3. Redémarrer le serveur

```bash
npm start  # ou npm run dev
```

## Vérification

Après le fix, vous devriez pouvoir:

1. ✅ S'inscrire avec succès
2. ✅ Créer immédiatement des catégories sans erreur 403
3. ✅ Voir les organisations dans votre compte

## Notes

- Les utilisateurs NOUVEAUX n'auront plus besoin d'appeler `/api/v1/auth/setup-organization` manuellement
- L'ancien endpoint `setupOrganization` est maintenant optionnel (pour les utilisateurs qui veulent créer une _deuxième_ organisation)
- Les utilisateurs existants peuvent toujours utiliser le script de migration ou créer manuellement une organisation
