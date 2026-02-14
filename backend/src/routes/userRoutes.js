const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect } = require("../middlewares/auth");
const {
  validateUpdateProfile,
  validateChangePassword,
  validateChangeEmail,
} = require("../utils/authValidation");

// Toutes les routes nécessitent authentification
router.use(protect);

// Profil
router.get("/me", userController.getCurrentUser);
router.put("/me", validateUpdateProfile, userController.updateProfile);
router.delete("/me", userController.deleteAccount);

// Mot de passe
router.put(
  "/me/password",
  validateChangePassword,
  userController.changePassword,
);

// Email
router.put("/me/email", validateChangeEmail, userController.changeEmail);

// Avatar
router.put("/me/avatar", userController.uploadAvatar);

module.exports = router;
