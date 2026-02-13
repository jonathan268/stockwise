const express = require("express");
const router = express.Router();
const Produit = require("../models/Produit");
const { protect: authenticate } = require("../middlewares/auth");
const tenantIsolation = require("../middlewares/tenantIsolation.js");
const {
  checkActiveSubscription,
  checkPlanLimit,
} = require("../middlewares/checkSubscription");

// Appliquer les middlewares à toutes les routes
router.use(authenticate);
router.use(tenantIsolation);
router.use(checkActiveSubscription);

// Lister les produits du tenant
router.get("/", async (req, res) => {
  try {
    // Automatiquement filtré par tenantId
    const products = await Produit.find({ tenantId: req.tenantId });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Créer un produit (avec vérification de limite)
router.post("/", checkPlanLimit("products"), async (req, res) => {
  try {
    const product = new Produit({
      ...req.body,
      tenantId: req.tenantId, // Automatiquement ajouté
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour un produit
router.put("/:id", async (req, res) => {
  try {
    // Rechercher uniquement dans le tenant de l'utilisateur
    const product = await Produit.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      req.body,
      { new: true },
    );

    if (!product) {
      return res.status(404).json({ message: "Produit introuvable" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Supprimer un produit
router.delete("/:id", async (req, res) => {
  try {
    const product = await Produit.findOneAndDelete({
      _id: req.params.id,
      tenantId: req.tenantId,
    });

    if (!product) {
      return res.status(404).json({ message: "Produit introuvable" });
    }

    res.json({ message: "Produit supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
