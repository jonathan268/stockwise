const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Subscription = require("../models/Subscription");
const Plan = require("../models/Plan");
const jwt = require("jsonwebtoken");

router.post("/register", async (req, res) => {
  try {
    const { name, firstname, email, phone, entreprise, password } = req.body;

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Cet email est déjà utilisé" });
    }

    // Créer un nouveau tenant (tenant = utilisateur pour les comptes individuels)
    const tenantId = new mongoose.Types.ObjectId();

    // Créer l'utilisateur
    const user = new User({
      tenantId,
      name,
      firstname,
      email,
      phone,
      entreprise,
      password,
      role: "client",
    });

    await user.save();

    // Créer un abonnement trial automatiquement
    const freePlan = await Plan.findOne({ slug: "free" });

    const subscription = new Subscription({
      tenantId,
      planId: freePlan._id,
      status: "trial",
      startsAt: new Date(),
      endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 jours trial
      autoRenew: false,
    });

    await subscription.save();

    // Générer le token JWT
    const token = jwt.sign(
      { userId: user._id, tenantId: user.tenantId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(201).json({
      message: "Inscription réussie",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        tenantId: user.tenantId,
      },
      subscription,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
