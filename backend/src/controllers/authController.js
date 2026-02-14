const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const Organization = require("../models/Organization");
const Subscription = require("../models/Subscription");
const { AppError } = require("../utils/appError");
const { successResponse } = require("../utils/apiResponse");
const { sendEmail } = require("../services/emailService");

class AuthController {
  /**
   * Générer JWT Access Token
   */
  generateAccessToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || "15m",
    });
  }

  /**
   * Générer JWT Refresh Token
   */
  generateRefreshToken(userId) {
    return jwt.sign(
      { id: userId, type: "refresh" },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRE || "7d" },
    );
  }

  /**
   * Envoyer tokens en réponse
   */
  sendTokenResponse(
    user,
    statusCode,
    res,
    message = "Authentification réussie",
  ) {
    const accessToken = this.generateAccessToken(user._id);
    const refreshToken = this.generateRefreshToken(user._id);

    // Stocker refresh token (async, pas besoin d'attendre)
    user.addRefreshToken(refreshToken, {
      userAgent: res.req.headers["user-agent"],
      ip: res.req.ip,
    });

    return successResponse(
      res,
      {
        user,
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: process.env.JWT_EXPIRE || "15m",
        },
      },
      message,
      statusCode,
    );
  }

  // POST /api/v1/auth/register
  async register(req, res, next) {
    try {
      const { firstName, lastName, email, password, phone, organizationName } =
        req.body;

      // 1. Vérifier si email existe
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new AppError("Email déjà utilisé", 400);
      }

      // 2. Créer organisation
      const organization = await Organization.create({
        name: organizationName || `${firstName} ${lastName}'s Business`,
        email,
        phone,
        status: "active",
      });

      // 3. Créer utilisateur
      const user = await User.create({
        firstName,
        lastName,
        email,
        password,
        phone,
        organization: organization._id,
        ownedOrganization: organization._id,
        role: "owner",
      });

      // 4. Mettre à jour organisation avec owner
      organization.owner = user._id;
      organization.members.push({
        user: user._id,
        role: "owner",
        addedAt: new Date(),
      });
      await organization.save();

      // 5. Créer abonnement FREE par défaut
      await Subscription.create({
        organization: organization._id,
        plan: "free",
        status: "active",
      });

      // 6. Générer token vérification email
      const verificationToken = user.createEmailVerificationToken();
      await user.save({ validateBeforeSave: false });

      // 7. Envoyer email de vérification (async)
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

      try {
        await sendEmail({
          to: user.email,
          subject: "Vérifiez votre email",
          template: "emailVerification",
          data: {
            name: user.firstName,
            verificationUrl,
          },
        });
      } catch (error) {
        console.error("Erreur envoi email:", error);
        // Ne pas bloquer l'inscription si email échoue
      }

      // 8. Retourner tokens
      return this.sendTokenResponse(
        user,
        201,
        res,
        "Inscription réussie. Vérifiez votre email",
      );
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/auth/login
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // 1. Validation
      if (!email || !password) {
        throw new AppError("Email et mot de passe requis", 400);
      }

      // 2. Trouver user avec password
      const user = await User.findOne({ email })
        .select("+password")
        .populate("organization");

      if (!user) {
        throw new AppError("Email ou mot de passe incorrect", 401);
      }

      // 3. Vérifier si compte verrouillé
      if (user.isLocked()) {
        const lockMinutes = Math.ceil((user.lockUntil - Date.now()) / 60000);
        throw new AppError(
          `Compte verrouillé. Réessayez dans ${lockMinutes} minutes`,
          423,
        );
      }

      // 4. Vérifier mot de passe
      const isPasswordCorrect = await user.comparePassword(password);

      if (!isPasswordCorrect) {
        // Incrémenter tentatives
        await user.incLoginAttempts();

        const attemptsLeft = 5 - user.loginAttempts - 1;

        if (attemptsLeft > 0) {
          throw new AppError(
            `Mot de passe incorrect. ${attemptsLeft} tentative(s) restante(s)`,
            401,
          );
        } else {
          throw new AppError(
            "Compte verrouillé après trop de tentatives. Réessayez dans 2 heures",
            423,
          );
        }
      }

      // 5. Vérifier statut utilisateur
      if (user.status !== "active") {
        throw new AppError("Compte inactif ou suspendu", 403);
      }

      // 6. Vérifier statut organisation
      if (user.organization.status !== "active") {
        throw new AppError("Organisation suspendue. Contactez le support", 403);
      }

      // 7. Reset tentatives login
      if (user.loginAttempts > 0) {
        await user.resetLoginAttempts();
      }

      // 8. Mettre à jour dernière connexion
      user.lastLogin = new Date();
      user.lastLoginIp = req.ip;
      await user.save({ validateBeforeSave: false });

      // 9. Nettoyer tokens expirés
      await user.cleanExpiredTokens();

      // 10. Retourner tokens
      return this.sendTokenResponse(user, 200, res, "Connexion réussie");
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/auth/refresh-token
  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new AppError("Refresh token requis", 400);
      }

      // 1. Vérifier token
      let decoded;
      try {
        decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      } catch (error) {
        throw new AppError("Refresh token invalide ou expiré", 401);
      }

      // 2. Vérifier type
      if (decoded.type !== "refresh") {
        throw new AppError("Token invalide", 401);
      }

      // 3. Trouver user
      const user = await User.findById(decoded.id);

      if (!user) {
        throw new AppError("Utilisateur introuvable", 401);
      }

      // 4. Vérifier si refresh token existe dans DB
      const tokenExists = user.refreshTokens.some(
        (rt) => rt.token === refreshToken,
      );

      if (!tokenExists) {
        throw new AppError("Refresh token invalide", 401);
      }

      // 5. Générer nouveau access token
      const newAccessToken = this.generateAccessToken(user._id);

      return successResponse(
        res,
        {
          accessToken: newAccessToken,
          expiresIn: process.env.JWT_EXPIRE || "15m",
        },
        "Token rafraîchi avec succès",
      );
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/auth/logout
  async logout(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const user = req.user;

      // Retirer refresh token si fourni
      if (refreshToken) {
        await user.removeRefreshToken(refreshToken);
      }

      return successResponse(res, null, "Déconnexion réussie");
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/auth/forgot-password
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      if (!email) {
        throw new AppError("Email requis", 400);
      }

      // 1. Trouver user
      const user = await User.findOne({ email, status: "active" });

      if (!user) {
        // Pour sécurité, ne pas révéler si email existe
        return successResponse(
          res,
          null,
          "Si cet email existe, un lien de réinitialisation a été envoyé",
        );
      }

      // 2. Générer reset token
      const resetToken = user.createPasswordResetToken();
      await user.save({ validateBeforeSave: false });

      // 3. Envoyer email
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

      try {
        await sendEmail({
          to: user.email,
          subject: "Réinitialisation de mot de passe",
          template: "passwordReset",
          data: {
            name: user.firstName,
            resetUrl,
            expiresIn: "1 heure",
          },
        });

        return successResponse(res, null, "Email de réinitialisation envoyé");
      } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        throw new AppError(
          "Erreur lors de l'envoi de l'email. Réessayez plus tard",
          500,
        );
      }
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/auth/reset-password
  async resetPassword(req, res, next) {
    try {
      const { token } = req.params;
      const { password, passwordConfirm } = req.body;

      // 1. Validation
      if (!password || !passwordConfirm) {
        throw new AppError("Mot de passe et confirmation requis", 400);
      }

      if (password !== passwordConfirm) {
        throw new AppError("Les mots de passe ne correspondent pas", 400);
      }

      if (password.length < 8) {
        throw new AppError(
          "Le mot de passe doit contenir au moins 8 caractères",
          400,
        );
      }

      // 2. Hash token et trouver user
      const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
      });

      if (!user) {
        throw new AppError("Token invalide ou expiré", 400);
      }

      // 3. Mettre à jour mot de passe
      user.password = password;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      user.passwordChangedAt = Date.now();

      await user.save();

      // 4. Invalider tous les refresh tokens
      user.refreshTokens = [];
      await user.save({ validateBeforeSave: false });

      // 5. Retourner nouveaux tokens
      return this.sendTokenResponse(
        user,
        200,
        res,
        "Mot de passe réinitialisé avec succès",
      );
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/auth/verify-email/:token
  async verifyEmail(req, res, next) {
    try {
      const { token } = req.params;

      // 1. Hash token
      const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      // 2. Trouver user
      const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpires: { $gt: Date.now() },
      });

      if (!user) {
        throw new AppError("Token de vérification invalide ou expiré", 400);
      }

      // 3. Marquer email comme vérifié
      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;

      await user.save({ validateBeforeSave: false });

      return successResponse(res, null, "Email vérifié avec succès");
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/auth/resend-verification
  async resendVerification(req, res, next) {
    try {
      const { email } = req.body;

      if (!email) {
        throw new AppError("Email requis", 400);
      }

      const user = await User.findOne({ email });

      if (!user) {
        return successResponse(
          res,
          null,
          "Si cet email existe et n'est pas vérifié, un email a été envoyé",
        );
      }

      if (user.isEmailVerified) {
        return successResponse(res, null, "Email déjà vérifié");
      }

      // Générer nouveau token
      const verificationToken = user.createEmailVerificationToken();
      await user.save({ validateBeforeSave: false });

      // Envoyer email
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

      await sendEmail({
        to: user.email,
        subject: "Vérifiez votre email",
        template: "emailVerification",
        data: {
          name: user.firstName,
          verificationUrl,
        },
      });

      return successResponse(res, null, "Email de vérification renvoyé");
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/auth/me
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
}

module.exports = new AuthController();
