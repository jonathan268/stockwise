# 📊 Schémas de Données — StockWise

## Vue d'ensemble

L'application utilise **9 collections MongoDB** fortement liées. Chaque collection représente une entité clé du système.

---

## 1️⃣ User — Authentification

```javascript
{
  _id: ObjectId,
  firstName: String,              // "Jean"
  lastName: String,               // "Dupont"
  email: String (unique),         // "jean@stockwise.app"
  password: String (BCrypt),      // hash uniquement
  role: String,                   // "super_admin" | "owner" | "admin" | "staff"
  organizationId: ObjectId,       // null pour super_admin
  isActive: Boolean,              // true
  lastLogin: Date,                // 2024-12-31T10:00:00Z
  refreshToken: String,           // BCrypt hasé (sélection protégée)
  createdAt: Date,
  updatedAt: Date
}
```

**Index:**

- `email` (unique)
- `organizationId`

**Sécurité:**

- Password JAMAIS exposé dans JSON (exclude via select:false)
- refreshToken BCrypt hasé en base

---

## 2️⃣ Organization — Multi-Tenant

```javascript
{
  _id: ObjectId,
  name: String,                   // "Ma PME SARL"
  slug: String (unique),          // "ma-pme-sarl-1704067200000"
  logo: String,                   // URL Cloudinary
  owner: ObjectId (ref: User),    // User._id du propriétaire

  plan: String,                   // "starter" | "pro" | "enterprise"
  trialEndsAt: Date,              // 2024-12-31 (30 jours après création)
  isTrialActive: Boolean,         // true jusqu'à trialEndsAt

  settings: {
    currency: String,             // "XAF"
    timezone: String,             // "Africa/Douala"
    lowStockAlertEmail: Boolean   // true
  },

  isActive: Boolean,              // true || false (soft delete)
  createdAt: Date,
  updatedAt: Date
}
```

**Virtuals:**

```javascript
hasProAccess:  // true si trial valide OU plan="pro" || "enterprise"
```

**Index:**

- `slug` (unique)
- `owner`

**Logique:**

```javascript
// À J+30
if (isTrialActive && trialEndsAt < now) {
  isTrialActive = false;
  plan = "starter"; // Les features IA sont verrouillées
}
```

---

## 3️⃣ Product — Gestion des Produits

```javascript
{
  _id: ObjectId,
  organizationId: ObjectId (ref: Organization),  // CRITIQUE: isolation tenant

  name: String,                   // "Farine Blé 25kg"
  sku: String,                    // "BLE-25-001"
  description: String,            // Optionnel
  category: ObjectId (ref: Category),
  image: String,                  // URL product image

  sellingPrice: Number,           // 15000 (XAF)
  costPrice: Number,              // 10000 (XAF)

  currentStock: Number,           // 24 unités
  minimumStock: Number,           // 5 unités (seuil alerte)
  unit: String,                   // "unité" | "kg" | "litre" | "boîte"

  isActive: Boolean,              // true
  isDeleted: Boolean,             // false (soft delete)

  salesVelocity: Number,          // Ventes moyennes/jour (calculé par IA)
  lastSoldAt: Date,               // Dernière vente

  createdAt: Date,
  updatedAt: Date
}
```

**Virtuals:**

```javascript
stockStatus:  // "ok" | "low" | "out"
```

**Indexes:**

- `{ organizationId: 1, isDeleted: 1 }`
- `{ organizationId: 1, sku: 1 }` (unique, sparse)

**Règles:**

- SKU unique **par organisation** (pas global)
- currentStock >= 0 toujours
- Soft delete = isDeleted:true (jamais vraiment supprimer)

---

## 4️⃣ Category — Organisation

```javascript
{
  _id: ObjectId,
  organizationId: ObjectId (ref: Organization),  // CRITIQUE

  name: String,                   // "Grains"
  color: String,                  // "#f59e0b" (hex)
  icon: String,                   // "Package" (Lucide icon name)

  createdAt: Date,
  updatedAt: Date
}
```

**Index:**

- `organizationId`

---

## 5️⃣ Sale — Ventes

```javascript
{
  _id: ObjectId,
  organizationId: ObjectId (ref: Organization),  // CRITIQUE

  saleNumber: String (unique),    // "SW-2024-0001" (auto-généré)

  items: [
    {
      product: ObjectId (ref: Product),
      productName: String,        // Snapshot: "Farine Blé 25kg"
      quantity: Number,           // 2
      unitPrice: Number,          // 15000
      totalPrice: Number          // 30000
    }
  ],

  totalAmount: Number,            // 30000 XAF
  paymentMethod: String,          // "cash" | "mobile_money" | "card" | "credit"
  customerName: String,           // Optionnel
  note: String,                   // Optionnel

  soldBy: ObjectId (ref: User),   // Qui a enregistré la vente
  status: String,                 // "completed" | "cancelled" | "refunded"

  createdAt: Date,
  updatedAt: Date
}
```

**Index:**

- `{ organizationId: 1, createdAt: -1 }`

**Auto-génération saleNumber:**

```javascript
saleNumber = `SW-${year}-${count.padStart(4, "0")}`;
// Exemple: SW-2024-0001
```

---

## 6️⃣ StockMovement — Audit Trail

```javascript
{
  _id: ObjectId,
  organizationId: ObjectId (ref: Organization),  // CRITIQUE

  product: ObjectId (ref: Product),
  type: String,                   // "in" | "out" | "adjustment" | "sale" | "return"

  quantity: Number,               // Quantité changée (toujours positif)
  quantityBefore: Number,         // Stock avant: 50
  quantityAfter: Number,          // Stock après: 48

  reason: String,                 // "Réapprovisionnement" | "Vente SW-2024-0001" | "Casse"
  reference: String,              // N° bon de commande, facture, etc.

  createdBy: ObjectId (ref: User),
  saleId: ObjectId (ref: Sale),   // Lié au mouvement si type="sale"

  createdAt: Date,
  updatedAt: Date
}
```

**Index:**

- `{ organizationId: 1, product: 1, createdAt: -1 }`

**Logique:**

- Chaque vente crée automatiquement un mouvement type="sale"
- Les ajustements manuels créent un mouvement type="adjustment"
- L'historique COMPLET est gardé (audit trail)

---

## 7️⃣ Alert — Alertes Stock

```javascript
{
  _id: ObjectId,
  organizationId: ObjectId (ref: Organization),  // CRITIQUE

  type: String,                   // "low_stock" | "out_of_stock" | "ai_recommendation" | "system"
  severity: String,               // "info" | "warning" | "error"
  message: String,                // "Stock bas: Farine... — 5 restants"

  product: ObjectId (ref: Product),

  isRead: Boolean,                // false par défaut
  readAt: Date,
  readBy: ObjectId (ref: User),

  createdAt: Date,
  updatedAt: Date
}
```

**Index:**

- `{ organizationId: 1, isRead: 1, createdAt: -1 }`

**Création Automatique:**

- Stock passe sous minimumStock → création alerte "low_stock"
- Stock atteint 0 → création alerte "out_of_stock"
- Nouvelles recommandations IA → création alerte "ai_recommendation"

---

## 8️⃣ Recommendation — IA

```javascript
{
  _id: ObjectId,
  organizationId: ObjectId (ref: Organization),  // CRITIQUE

  type: String,                   // "restock" | "popular" | "dead_stock" | "bundle"
  priority: String,               // "high" | "medium" | "low"

  title: String,                  // "Réapprovisionner Farine Blé 25kg"
  description: String,            // "Au rythme de 8 unités/jour, rupture dans 3 jours"
  actionLabel: String,            // "Commander maintenant"

  relatedProducts: [ObjectId],    // Products concernés

  data: Mixed,                    // Données brutes JSON (métriques clés pour justifier)

  isRead: Boolean,                // false
  isDismissed: Boolean,           // false
  expiresAt: Date,                // Optionnel (valide 7 jours)

  createdAt: Date,
  updatedAt: Date
}
```

**Index:**

- `{ organizationId: 1, createdAt: -1 }`

**Exemple data:**

```javascript
data: {
  daysUntilStockout: 3,
  currentStock: 24,
  dailyVelocity: 8,
  currentPrice: 15000,
  suggestedQuantity: 50
}
```

---

## 9️⃣ Subscription — Abonnements

```javascript
{
  _id: ObjectId,
  organizationId: ObjectId (ref: Organization),  // unique

  plan: String,                   // "starter" | "pro" | "enterprise"
  status: String,                 // "trial" | "active" | "past_due" | "cancelled" | "expired"

  trialEndsAt: Date,              // 2024-12-31
  currentPeriodStart: Date,       // 2024-12-01
  currentPeriodEnd: Date,         // 2025-01-01 (30 jours après start)
  cancelledAt: Date,              // Si cancelled
  gracePeriodEndsAt: Date,        // 7 jours après currentPeriodEnd

  notchpayCustomerId: String,     // ID client NotchPay

  invoices: [
    {
      reference: String,          // "SW-ABCD12-1704067200000"
      amount: Number,             // 9900 XAF
      currency: String,           // "XAF"
      status: String,             // "pending" | "complete" | "failed"
      paidAt: Date,               // Timestamp paiement
      channel: String             // "mtn_momo" | "orange_money" | "card"
    }
  ],

  createdAt: Date,
  updatedAt: Date
}
```

**Index:**

- `organizationId` (unique)

---

## 🔟 Feedback — Retours Utilisateurs

```javascript
{
  _id: ObjectId,
  organizationId: ObjectId,       // Optionnel (null si page publique)
  userId: ObjectId (ref: User),   // Optionnel

  type: String,                   // "bug" | "feature_request" | "general" | "ux" | "billing"
  title: String,                  // "Le bouton X ne fonctionne pas"
  message: String,                // Description détaillée (max 1000 chars)
  rating: Number,                 // 1-5 (optional)

  page: String,                   // "/products/123"
  userAgent: String,              // Navigateur + OS

  status: String,                 // "new" | "in_review" | "planned" | "done" | "rejected"
  adminNote: String,              // Notes internes pour super admin
  priority: String,               // "low" | "medium" | "high" | "critical"

  createdAt: Date,
  updatedAt: Date
}
```

**Index:**

- `{ status: 1, createdAt: -1 }`
- `organizationId`

---

## 🔗 Relations Clés

```
User
  ├─ organizationId → Organization (null si super_admin)
  └─ userAgent → Logs

Organization (le "Tenant")
  ├─ owner → User
  └─ hasMany:
      ├─ Product
      ├─ Sale
      ├─ StockMovement
      ├─ Alert
      ├─ Recommendation
      ├─ Subscription
      ├─ Category
      └─ Feedback

Product
  ├─ organizationId → Organization
  ├─ category → Category
  └─ hasMany:
      ├─ StockMovement
      └─ Alert

Sale
  ├─ organizationId → Organization
  ├─ soldBy → User
  ├─ items → Product (denormalized: productName, unitPrice)
  └─ hasMany:
      └─ StockMovement

StockMovement
  ├─ organizationId → Organization
  ├─ product → Product
  ├─ createdBy → User
  └─ saleId → Sale (optionnel)

Alert
  ├─ organizationId → Organization
  ├─ product → Product
  └─ readBy → User (optionnel)

Recommendation
  ├─ organizationId → Organization
  └─ relatedProducts → Product[] (multi)

Subscription
  └─ organizationId → Organization (1:1)
```

---

## 📋 Règles Principales

### 🔐 Isolation Tenant

```javascript
// TOUJOURS inclure organizationId
Product.find({ organizationId: req.organizationId, ... })

// JAMAIS faire ça
Product.find({})  // 💥 FUITE DE DONNÉES
```

### 📊 Données Dénormalisées

```javascript
// Dans les Sale.items, on copie productName + unitPrice
// Pour que la facture soit valide même si le produit change plus tard

saleItems: [
  {
    product: ObjectId, // Référence
    productName: "Farine", // Snapshot NE CHANGE PAS
    unitPrice: 15000, // Snapshot NE CHANGE PAS
  },
];
```

### 🎯 Soft Delete

```javascript
// On ne supprime JAMAIS vraiment, on marque comme deleted
product.isDeleted = true;

// Les queries filtrent automatiquement
Product.find({ organizationId, isDeleted: false });
```

### ⏰ Timestamps

```javascript
// Chaque document a createdAt et updatedAt (auto-générés par Mongoose)
// Utile pour audit trail et queries par date
```

---

## ✨ Exemples de Queries Courantes

```javascript
// Tous les produits actifs de mon org
Product.find({
  organizationId: req.organizationId,
  isDeleted: false,
  isActive: true,
});

// Produits en stock bas
Product.find({
  organizationId: req.organizationId,
  isDeleted: false,
  $expr: { $lte: ["$currentStock", "$minimumStock"] },
});

// Ventes du mois
Sale.find({
  organizationId: req.organizationId,
  createdAt: { $gte: startOfMonth, $lte: endOfMonth },
});

// Mouvements d'un produit
StockMovement.find({
  organizationId: req.organizationId,
  product: productId,
}).sort({ createdAt: -1 });

// Alertes non lues
Alert.find({
  organizationId: req.organizationId,
  isRead: false,
}).sort({ createdAt: -1 });
```

---

**Vous êtes maintenant expert des schémas StockWise ! 🚀**
