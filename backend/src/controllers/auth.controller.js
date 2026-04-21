import { asyncHandler } from "../utils/appError.js";
import * as authService from "../services/auth.service.js";

export const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, organizationName } = req.body;
  const result = await authService.registerService({
    firstName,
    lastName,
    email,
    password,
    organizationName,
  });

  res.status(201).json({
    success: true,
    data: {
      user: result.user,
      organization: result.organization,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.loginService({ email, password });

  res.json({
    success: true,
    data: {
      user: result.user,
      organization: result.organization,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    },
  });
});

export const googleLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ success: false, message: "idToken requis" });
  
  const result = await authService.googleAuthService(idToken);

  res.json({
    success: true,
    data: {
      user: result.user,
      organization: result.organization,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    },
  });
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logoutService(req.user);
  res.json({ success: true, message: "Déconnecté" });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});

export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;
  if (!token) {
    return res.status(400).json({ success: false, message: "Token requis" });
  }

  const result = await authService.refreshTokenService(token);

  res.json({
    success: true,
    data: {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    },
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const result = await authService.updateProfileService(req.user._id, req.body);
  res.json({ success: true, data: result });
});

export const updatePassword = asyncHandler(async (req, res) => {
  await authService.updatePasswordService(req.user._id, {
    currentPassword: req.body.currentPassword,
    newPassword: req.body.newPassword
  });
  res.json({ success: true, message: "Mot de passe mis à jour avec succès" });
});

export const updateOrganization = asyncHandler(async (req, res) => {
  if (!req.organizationId) {
    return res.status(403).json({ success: false, error: "Organisation requise" });
  }
  const org = await authService.updateOrganizationService(req.organizationId, req.body);
  res.json({ success: true, data: org });
});
