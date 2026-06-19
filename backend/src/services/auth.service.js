import User from "../models/User.js";
import Organization from "../models/Organization.js";
import Subscription from "../models/Subscription.js";
import mongoose from "mongoose";
import { AppError } from "../utils/appError.js";
import bcrypt from "bcryptjs";
import { generateTokens, verifyRefreshToken } from "../utils/jwt.js";
import { OAuth2Client } from "google-auth-library";
import { sendWelcomeEmail, sendPasswordResetEmail } from "./email.service.js";
import crypto from "crypto";

let googleClient;
try {
  googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
} catch {
  googleClient = null;
}

export const registerService = async ({
  firstName,
  lastName,
  email,
  password,
  organizationName,
}) => {
  // 1. Vérifier si l'email existe
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new AppError("Email déjà utilisé", 400);

  // 2. Générer les IDs pour résoudre la dépendance cyclique
  const orgId = new mongoose.Types.ObjectId();
  const userId = new mongoose.Types.ObjectId();

  // 3. Créer l'organisation
  const organization = await Organization.create({
    _id: orgId,
    name: organizationName,
    slug: `${organizationName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
    owner: userId,
  });

  // 4. Créer le user owner
  const user = await User.create({
    _id: userId,
    firstName,
    lastName,
    email,
    password,
    role: "owner",
    organizationId: orgId,
  });

  // 5. Créer la subscription
  await Subscription.create({
    organizationId: organization._id,
    plan: "starter",
    status: "trial",
    trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  // 6. Générer les tokens
  const { accessToken, refreshToken } = generateTokens(user);
  user.refreshToken = await bcrypt.hash(refreshToken, 10);
  await user.save();

  // 7. Email de bienvenue (asynchrone, non-bloquant)
  setImmediate(() => sendWelcomeEmail(user));

  return { user, organization, accessToken, refreshToken };
};

export const loginService = async ({ email, password }) => {
  // 1. Chercher l'utilisateur
  const user = await User.findOne({ email }).select("+password +refreshToken");

  if (!user) {
    throw new AppError(
      "Aucun compte trouvé avec cet email.",
      404,
      "USER_NOT_FOUND",
    );
  }

  if (!user.isActive) {
    throw new AppError("Ce compte a été désactivé.", 403, "ACCOUNT_DISABLED");
  }

  // 2. Vérifier le password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError("Mot de passe incorrect.", 401, "WRONG_PASSWORD");
  }

  // 3. Générer les tokens
  const { accessToken, refreshToken } = generateTokens(user);
  user.refreshToken = await bcrypt.hash(refreshToken, 10);
  user.lastLogin = new Date();
  await user.save();

  // 4. Récupérer l'organisation et sa souscription
  let organizationData = null;
  if (user.organizationId) {
    const orgDoc = await Organization.findById(user.organizationId);
    if (orgDoc) {
      organizationData = orgDoc.toJSON(); // toJSON() inclut les propriétés virtuelles (comme hasProAccess)
      const subscription = await Subscription.findOne({ organizationId: orgDoc._id });
      if (subscription) {
        organizationData.currentPeriodEnd = subscription.currentPeriodEnd;
      }
    }
  }

  return { user, organization: organizationData, accessToken, refreshToken };
};

export const logoutService = async (user) => {
  await User.findByIdAndUpdate(user._id, { refreshToken: null });
};

export const refreshTokenService = async (token) => {
  // 1. Vérifier le token
  const decoded = verifyRefreshToken(token);
  
  // 2. Trouver l'utilisateur
  const user = await User.findById(decoded.userId).select("+refreshToken");
  if (!user || !user.refreshToken) {
    throw new AppError("Session expirée ou invalide", 401);
  }

  // 3. Comparer avec le hash en DB
  const isMatch = await bcrypt.compare(token, user.refreshToken);
  if (!isMatch) {
    throw new AppError("Session expirée ou invalide", 401);
  }

  // 4. Générer nouveaux tokens (rotation)
  const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
  
  // 5. Mettre à jour le hash en DB
  user.refreshToken = await bcrypt.hash(newRefreshToken, 10);
  await user.save();

  return { accessToken, refreshToken: newRefreshToken };
};

export const updateProfileService = async (userId, updateData) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { firstName: updateData.firstName, lastName: updateData.lastName },
    { returnDocument: "after", runValidators: true }
  );
  if (!user) throw new AppError("Utilisateur introuvable", 404);
  return user;
};

export const updatePasswordService = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select("+password");
  if (!user) throw new AppError("Utilisateur introuvable", 404);

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) throw new AppError("L'ancien mot de passe est incorrect", 401);

  user.password = newPassword;
  await user.save(); // L'événement pre-save va hasher le mot de passe
  return true;
};

export const forgotPasswordService = async (email) => {
  const user = await User.findOne({ email }).select("+resetPasswordToken +resetPasswordExpires");
  if (!user) return { message: "Si cet email existe, un lien de réinitialisation a été envoyé." };

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = await bcrypt.hash(resetToken, 10);
  user.resetPasswordExpires = Date.now() + 3600000;
  await user.save();

  setImmediate(() => sendPasswordResetEmail(user, resetToken));
  return { message: "Si cet email existe, un lien de réinitialisation a été envoyé." };
};

export const resetPasswordService = async (token, newPassword) => {
  const users = await User.find({
    resetPasswordExpires: { $gt: Date.now() },
  }).select("+resetPasswordToken +resetPasswordExpires");

  let matchedUser = null;
  for (const user of users) {
    if (user.resetPasswordToken) {
      const isMatch = await bcrypt.compare(token, user.resetPasswordToken);
      if (isMatch) { matchedUser = user; break; }
    }
  }

  if (!matchedUser) throw new AppError("Token invalide ou expiré", 400);

  matchedUser.password = newPassword;
  matchedUser.resetPasswordToken = undefined;
  matchedUser.resetPasswordExpires = undefined;
  matchedUser.refreshToken = null;
  await matchedUser.save();

  return { message: "Mot de passe réinitialisé avec succès" };
};

export const updateOrganizationService = async (orgId, updateData) => {
  // Extraction sécurisée
  const safeUpdates = {};
  if (updateData.name) safeUpdates.name = updateData.name;
  
  // Utilisation de notation pointée pour ne mettre à jour que certains paramètres
  const dotUpdates = { ...safeUpdates };
  if (updateData.currency) dotUpdates["settings.currency"] = updateData.currency;
  if (updateData.timezone) dotUpdates["settings.timezone"] = updateData.timezone;
  if (updateData.lowStockAlertEmail !== undefined) dotUpdates["settings.lowStockAlertEmail"] = updateData.lowStockAlertEmail;

  if (Object.keys(dotUpdates).length === 0) return null;

  const org = await Organization.findByIdAndUpdate(
    orgId,
    { $set: dotUpdates },
    { returnDocument: "after", runValidators: true }
  );
  if (!org) throw new AppError("Organisation introuvable", 404);
  return org;
};

export const googleAuthService = async (idToken) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new AppError("Google OAuth non configuré (GOOGLE_CLIENT_ID manquant)", 500, "GOOGLE_CONFIG_ERROR");
  }

  // 1. Verifier le token via google-auth-library
  let ticket;
  try {
    ticket = await googleClient.verifyIdToken({ idToken, audience: clientId });
  } catch (err) {
    throw new AppError(
      err.message?.includes("audience") ? "Client ID invalide" :
      err.message?.includes("expired") ? "Token Google expiré" :
      err.message?.includes("invalid") ? "Token Google invalide" :
      "Erreur de vérification du token Google: " + err.message,
      401, "GOOGLE_AUTH_ERROR"
    );
  }
  const payload = ticket.getPayload();
  const { email, given_name, family_name, sub } = payload;
  
  if (!email) throw new AppError("Email manquant dans le profil Google", 400);

  // 2. Trouver l'utilisateur
  let user = await User.findOne({ email });

  if (user) {
    // S'il existe mais n'a pas son googleId attaché (fusion)
    if (!user.googleId) {
      user.googleId = sub;
      await user.save();
    }
  } else {
    // Nouvel utilisateur
    const orgName = `Organisation de ${given_name}`;
    const organization = await Organization.create({
      name: orgName,
      slug: `${orgName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
    });

    user = await User.create({
      firstName: given_name,
      lastName: family_name,
      email,
      googleId: sub,
      organizationId: organization._id,
      role: "owner"
    });
    organization.owner = user._id;
    await organization.save();
  }

  // 3. Génération session standard JWT
  const { accessToken, refreshToken } = generateTokens(user);
  user.refreshToken = await bcrypt.hash(refreshToken, 10);
  user.lastLogin = new Date();
  await user.save();

  // 4. Formater les données de retour
  let organizationData = null;
  if (user.organizationId) {
    const orgDoc = await Organization.findById(user.organizationId);
    if (orgDoc) {
      organizationData = orgDoc.toJSON();
      const subscription = await Subscription.findOne({ organizationId: orgDoc._id });
      if (subscription) {
        organizationData.currentPeriodEnd = subscription.currentPeriodEnd;
      }
    }
  }

  return { user, organization: organizationData, accessToken, refreshToken };
};
