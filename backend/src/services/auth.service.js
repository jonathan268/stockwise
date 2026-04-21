import User from "../models/User.js";
import Organization from "../models/Organization.js";
import Subscription from "../models/Subscription.js";
import mongoose from "mongoose";
import { AppError } from "../utils/appError.js";
import bcrypt from "bcryptjs";
import { generateTokens, verifyRefreshToken } from "../utils/jwt.js";

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
