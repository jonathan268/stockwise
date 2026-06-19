import User from "../models/User.js";
import Invite from "../models/Invite.js";
import Organization from "../models/Organization.js";
import Subscription from "../models/Subscription.js";
import { PLANS } from "../config/plans.js";
import { AppError } from "../utils/appError.js";

const getPlanLimit = async (organizationId) => {
  const sub = await Subscription.findOne({ organizationId });
  const planName = sub?.plan || "starter";
  const plan = PLANS[planName];
  return plan?.features?.maxUsers ?? 3;
};

export const inviteMemberService = async ({ email, role, organizationId, invitedBy }) => {
  const existingMember = await User.findOne({ email, organizationId });
  if (existingMember) {
    throw new AppError("Cet utilisateur fait déjà partie de votre organisation.", 400);
  }

  const currentCount = await User.countDocuments({ organizationId });
  const maxUsers = await getPlanLimit(organizationId);
  if (currentCount >= maxUsers) {
    throw new AppError(
      `Limite de ${maxUsers} utilisateurs atteinte pour votre plan. Passez à un plan supérieur pour ajouter plus de membres.`,
      403,
      "PLAN_LIMIT_REACHED",
    );
  }

  const existingInvite = await Invite.findOne({
    organizationId,
    email,
    status: "pending",
  });
  if (existingInvite) {
    throw new AppError("Une invitation est déjà en attente pour cet email.", 400);
  }

  const invite = await Invite.create({
    organizationId,
    email,
    role,
    invitedBy,
  });

  const org = await Organization.findById(organizationId);

  return { invite, organizationName: org?.name };
};

export const acceptInviteService = async (token, user) => {
  const invite = await Invite.findOne({ token, status: "pending" });
  if (!invite) {
    throw new AppError("Invitation invalide ou expirée.", 400);
  }
  if (invite.expiresAt < new Date()) {
    invite.status = "expired";
    await invite.save();
    throw new AppError("Cette invitation a expiré.", 400);
  }

  const currentCount = await User.countDocuments({ organizationId: invite.organizationId });
  const maxUsers = await getPlanLimit(invite.organizationId);
  if (currentCount >= maxUsers) {
    invite.status = "expired";
    await invite.save();
    throw new AppError(
      "Limite d'utilisateurs atteinte. L'invitation ne peut plus être acceptée.",
      403,
    );
  }

  if (user) {
    user.organizationId = invite.organizationId;
    user.role = invite.role;
    await user.save();
  }

  invite.status = "accepted";
  invite.acceptedAt = new Date();
  await invite.save();

  const org = await Organization.findById(invite.organizationId).populate("owner", "firstName lastName email");

  return { invite, organization: org };
};

export const getMembersService = async (organizationId) => {
  const members = await User.find({ organizationId })
    .select("firstName lastName email role isActive lastLogin createdAt")
    .sort({ createdAt: 1 });

  const sub = await Subscription.findOne({ organizationId });
  const planName = sub?.plan || "starter";
  const plan = PLANS[planName];
  const maxUsers = plan?.features?.maxUsers ?? 3;
  const currentCount = members.length;

  const pendingInvites = await Invite.find({
    organizationId,
    status: "pending",
  }).select("email role createdAt");

  return {
    members,
    pendingInvites,
    usage: { current: currentCount, max: maxUsers },
  };
};

export const updateMemberRoleService = async (organizationId, targetUserId, newRole, currentUser) => {
  const member = await User.findOne({ _id: targetUserId, organizationId });
  if (!member) {
    throw new AppError("Membre introuvable dans votre organisation.", 404);
  }
  if (member._id.toString() === currentUser._id.toString()) {
    throw new AppError("Vous ne pouvez pas modifier votre propre rôle.", 400);
  }

  member.role = newRole;
  await member.save();
  return member;
};

export const removeMemberService = async (organizationId, targetUserId, currentUser) => {
  const member = await User.findOne({ _id: targetUserId, organizationId });
  if (!member) {
    throw new AppError("Membre introuvable dans votre organisation.", 404);
  }
  if (member._id.toString() === currentUser._id.toString()) {
    throw new AppError("Vous ne pouvez pas vous retirer vous-même.", 400);
  }

  member.organizationId = null;
  member.role = "staff";
  await member.save();
  return member;
};

export const cancelInviteService = async (organizationId, inviteId) => {
  const invite = await Invite.findOne({ _id: inviteId, organizationId, status: "pending" });
  if (!invite) {
    throw new AppError("Invitation introuvable.", 404);
  }
  invite.status = "cancelled";
  await invite.save();
  return invite;
};
