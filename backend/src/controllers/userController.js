const User = require("../models/User");
const { AppError } = require("../utils/appError");
const { successResponse } = require("../utils/apiResponse");

class UserController {
  // GET /api/v1/users/me
  async getCurrentUser(req, res, next) {
    try {
      const user = await User.findById(req.user._id)
        .populate("organization")
        .populate("ownedOrganization");

      return successResponse(res, user, "Profil récupéré avec succès");
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/v1/users/me
  async updateProfile(req, res, next) {
    try {
      const userId = req.user._id;

      // Champs autorisés à être modifiés
      const allowedFields = [
        "firstName",
        "lastName",
        "phone",
        "avatar",
        "preferences",
      ];

      // Filtrer les champs
      const updates = {};
      Object.keys(req.body).forEach((key) => {
        if (allowedFields.includes(key)) {
          updates[key] = req.body[key];
        }
      });

      // Ne pas permettre modification email/password ici
      if (req.body.email || req.body.password) {
        throw new AppError(
          "Utilisez les endpoints dédiés pour changer email ou mot de passe",
          400,
        );
      }

      const user = await User.findByIdAndUpdate(userId, updates, {
        new: true,
        runValidators: true,
      }).populate("organization");

      return successResponse(res, user, "Profil mis à jour avec succès");
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/v1/users/me/password
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword, newPasswordConfirm } = req.body;

      // 1. Validation
      if (!currentPassword || !newPassword || !newPasswordConfirm) {
        throw new AppError("Tous les champs sont requis", 400);
      }

      if (newPassword !== newPasswordConfirm) {
        throw new AppError(
          "Les nouveaux mots de passe ne correspondent pas",
          400,
        );
      }

      if (newPassword.length < 8) {
        throw new AppError(
          "Le mot de passe doit contenir au moins 8 caractères",
          400,
        );
      }

      if (currentPassword === newPassword) {
        throw new AppError("Le nouveau mot de passe doit être différent", 400);
      }

      // 2. Récupérer user avec password
      const user = await User.findById(req.user._id).select("+password");

      // 3. Vérifier ancien mot de passe
      const isCorrect = await user.comparePassword(currentPassword);

      if (!isCorrect) {
        throw new AppError("Mot de passe actuel incorrect", 401);
      }

      // 4. Mettre à jour mot de passe
      user.password = newPassword;
      user.passwordChangedAt = Date.now();
      await user.save();

      // 5. Invalider tous les refresh tokens
      user.refreshTokens = [];
      await user.save({ validateBeforeSave: false });

      return successResponse(
        res,
        null,
        "Mot de passe changé avec succès. Reconnectez-vous",
      );
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/v1/users/me/avatar
  async uploadAvatar(req, res, next) {
    try {
      const { avatarUrl } = req.body;

      if (!avatarUrl) {
        throw new AppError("URL de l'avatar requise", 400);
      }

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { avatar: avatarUrl },
        { new: true },
      );

      return successResponse(res, user, "Avatar mis à jour avec succès");
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/v1/users/me
  async deleteAccount(req, res, next) {
    try {
      const { password, confirmation } = req.body;

      // 1. Validation
      if (!password || confirmation !== "DELETE") {
        throw new AppError('Mot de passe et confirmation "DELETE" requis', 400);
      }

      // 2. Vérifier mot de passe
      const user = await User.findById(req.user._id).select("+password");
      const isCorrect = await user.comparePassword(password);

      if (!isCorrect) {
        throw new AppError("Mot de passe incorrect", 401);
      }

      // 3. Vérifier si propriétaire d'organisation
      if (user.ownedOrganization) {
        throw new AppError(
          "Vous ne pouvez pas supprimer votre compte tant que vous êtes propriétaire d'une organisation. Transférez la propriété ou supprimez l'organisation d'abord",
          400,
        );
      }

      // 4. Soft delete (garder données pour audit)
      user.status = "deleted";
      user.deletedAt = new Date();
      user.email = `deleted_${Date.now()}_${user.email}`; // Libérer email
      await user.save({ validateBeforeSave: false });

      return successResponse(res, null, "Compte supprimé avec succès");
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/v1/users/me/email
  async changeEmail(req, res, next) {
    try {
      const { newEmail, password } = req.body;

      // 1. Validation
      if (!newEmail || !password) {
        throw new AppError("Nouvel email et mot de passe requis", 400);
      }

      // 2. Vérifier format email
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(newEmail)) {
        throw new AppError("Email invalide", 400);
      }

      // 3. Vérifier si email déjà utilisé
      const emailExists = await User.findOne({ email: newEmail });
      if (emailExists) {
        throw new AppError("Email déjà utilisé", 400);
      }

      // 4. Vérifier mot de passe
      const user = await User.findById(req.user._id).select("+password");
      const isCorrect = await user.comparePassword(password);

      if (!isCorrect) {
        throw new AppError("Mot de passe incorrect", 401);
      }

      // 5. Mettre à jour email
      user.email = newEmail;
      user.isEmailVerified = false; // Requiert nouvelle vérification

      // Générer nouveau token vérification
      const verificationToken = user.createEmailVerificationToken();
      await user.save();

      // 6. Envoyer email vérification
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

      const { sendEmail } = require("../services/emailService");
      await sendEmail({
        to: newEmail,
        subject: "Vérifiez votre nouvel email",
        template: "emailVerification",
        data: {
          name: user.firstName,
          verificationUrl,
        },
      });

      return successResponse(
        res,
        user,
        "Email changé. Vérifiez votre nouveau email",
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
