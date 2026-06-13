import { asyncHandler } from "../utils/appError.js";
import * as authService from "../services/auth.service.js";
import Joi from "joi";

const registerSchema = Joi.object({
  firstName: Joi.string().trim().min(1).max(50).required(),
  lastName: Joi.string().trim().min(1).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
  organizationName: Joi.string().trim().min(1).max(100).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const googleLoginSchema = Joi.object({
  idToken: Joi.string().required(),
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

const updateProfileSchema = Joi.object({
  firstName: Joi.string().trim().min(1).max(50).optional(),
  lastName: Joi.string().trim().min(1).max(50).optional(),
});

const updatePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).max(128).required(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(6).max(128).required(),
});

const updateOrganizationSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).optional(),
  currency: Joi.string().valid("XAF", "EUR", "USD").optional(),
  timezone: Joi.string().optional(),
  lowStockAlertEmail: Joi.boolean().optional(),
});

const validate = (schema, data) => {
  const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: true });
  if (error) {
    const message = error.details.map((d) => d.message).join(", ");
    throw { status: 400, message, code: "VALIDATION_ERROR", isValidation: true };
  }
  return value;
};

export const register = asyncHandler(async (req, res) => {
  const data = validate(registerSchema, req.body);
  const result = await authService.registerService(data);

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
  const data = validate(loginSchema, req.body);
  const result = await authService.loginService(data);

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
  const data = validate(googleLoginSchema, req.body);
  const result = await authService.googleAuthService(data.idToken);

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
  const data = validate(refreshTokenSchema, req.body);
  const result = await authService.refreshTokenService(data.refreshToken);

  res.json({
    success: true,
    data: {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    },
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const data = validate(updateProfileSchema, req.body);
  const result = await authService.updateProfileService(req.user._id, data);
  res.json({ success: true, data: result });
});

export const updatePassword = asyncHandler(async (req, res) => {
  const data = validate(updatePasswordSchema, req.body);
  await authService.updatePasswordService(req.user._id, data);
  res.json({ success: true, message: "Mot de passe mis à jour avec succès" });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const data = validate(forgotPasswordSchema, req.body);
  const result = await authService.forgotPasswordService(data.email);
  res.json({ success: true, message: result.message });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const data = validate(resetPasswordSchema, req.body);
  const result = await authService.resetPasswordService(data.token, data.password);
  res.json({ success: true, message: result.message });
});

export const updateOrganization = asyncHandler(async (req, res) => {
  if (!req.organizationId) {
    return res.status(403).json({ success: false, error: "Organisation requise" });
  }
  const data = validate(updateOrganizationSchema, req.body);
  const org = await authService.updateOrganizationService(req.organizationId, data);
  res.json({ success: true, data: org });
});
