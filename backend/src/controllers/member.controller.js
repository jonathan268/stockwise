import { asyncHandler } from "../utils/appError.js";
import { validate } from "../utils/validation.js";
import Joi from "joi";
import * as memberService from "../services/member.service.js";
import { sendInviteEmail } from "../services/email.service.js";

const inviteSchema = Joi.object({
  email: Joi.string().email().required(),
  role: Joi.string().valid("admin", "staff").required(),
});

const updateRoleSchema = Joi.object({
  role: Joi.string().valid("admin", "staff").required(),
});

export const invite = asyncHandler(async (req, res) => {
  const data = validate(inviteSchema, req.body);
  const result = await memberService.inviteMemberService({
    email: data.email,
    role: data.role,
    organizationId: req.organizationId,
    invitedBy: req.user._id,
  });

  sendInviteEmail({ email: data.email, token: result.invite.token, organizationName: result.organizationName, role: data.role });

  res.status(201).json({
    success: true,
    data: { invite: result.invite },
    message: `Invitation envoyée à ${data.email}`,
  });
});

export const listMembers = asyncHandler(async (req, res) => {
  const data = await memberService.getMembersService(req.organizationId);
  res.json({ success: true, data });
});

export const updateRole = asyncHandler(async (req, res) => {
  const data = validate(updateRoleSchema, req.body);
  const member = await memberService.updateMemberRoleService(
    req.organizationId,
    req.params.userId,
    data.role,
    req.user,
  );
  res.json({ success: true, data: member });
});

export const removeMember = asyncHandler(async (req, res) => {
  await memberService.removeMemberService(req.organizationId, req.params.userId, req.user);
  res.json({ success: true, message: "Membre retiré de l'organisation." });
});

export const cancelInvite = asyncHandler(async (req, res) => {
  await memberService.cancelInviteService(req.organizationId, req.params.inviteId);
  res.json({ success: true, message: "Invitation annulée." });
});
