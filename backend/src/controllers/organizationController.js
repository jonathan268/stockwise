const Organization = require("../models/Organization");
const User = require("../models/User");
const { AppError } = require("../utils/appError");
const { successResponse } = require("../utils/apiResponse");
const { sendEmail } = require("../services/emailService");
const crypto = require("crypto");

class OrganizationController {
  // GET /api/v1/organization
  async getOrganization(req, res, next) {
    try {
      const organizationId = req.user.organization;

      const organization = await Organization.findById(organizationId)
        .populate("owner", "firstName lastName email")
        .populate("members.user", "firstName lastName email avatar")
        .populate("subscription");

      if (!organization) {
        throw new AppError("Organisation introuvable", 404);
      }

      return successResponse(
        res,
        organization,
        "Organisation récupérée avec succès",
      );
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/v1/organization
  async updateOrganization(req, res, next) {
    try {
      const organizationId = req.user.organization;
      const userId = req.user._id;

      // Champs autorisés
      const allowedFields = [
        "name",
        "email",
        "phone",
        "address",
        "industry",
        "businessType",
        "taxId",
        "registrationNumber",
        "settings",
        "branding",
        "notifications",
      ];

      const updates = {};
      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });

      updates.updatedBy = userId;

      const organization = await Organization.findByIdAndUpdate(
        organizationId,
        updates,
        { new: true, runValidators: true },
      ).populate("subscription");

      return successResponse(
        res,
        organization,
        "Organisation mise à jour avec succès",
      );
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/v1/organization
  async deleteOrganization(req, res, next) {
    try {
      const organizationId = req.user.organization;
      const userId = req.user._id;
      const { confirmation } = req.body;

      const organization = await Organization.findById(organizationId);

      if (!organization) {
        throw new AppError("Organisation introuvable", 404);
      }

      // Vérifier que c'est bien l'owner
      if (organization.owner.toString() !== userId.toString()) {
        throw new AppError(
          "Seul le propriétaire peut supprimer l'organisation",
          403,
        );
      }

      // Vérifier confirmation
      if (confirmation !== organization.name) {
        throw new AppError("Confirmation incorrecte", 400);
      }

      // Soft delete
      organization.status = "cancelled";
      organization.deletedAt = new Date();
      await organization.save();

      // Annuler abonnement
      const Subscription = require("./subscription.model");
      await Subscription.findOneAndUpdate(
        { organization: organizationId },
        {
          status: "cancelled",
          cancelledAt: new Date(),
          cancellationReason: "Organization deleted",
        },
      );

      return successResponse(res, null, "Organisation supprimée avec succès");
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/organization/members
  async getMembers(req, res, next) {
    try {
      const organizationId = req.user.organization;

      const organization = await Organization.findById(organizationId)
        .populate(
          "members.user",
          "firstName lastName email avatar status lastLogin",
        )
        .populate("members.addedBy", "firstName lastName");

      const activeMembers = organization.members.filter(
        (m) => m.status === "active",
      );

      return successResponse(
        res,
        activeMembers,
        "Membres récupérés avec succès",
      );
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/organization/members
  async inviteMember(req, res, next) {
    try {
      const organizationId = req.user.organization;
      const userId = req.user._id;
      const { email, role, permissions } = req.body;

      const organization = await Organization.findById(organizationId);

      if (!organization) {
        throw new AppError("Organisation introuvable", 404);
      }

      // Vérifier limite utilisateurs
      if (!organization.canAddUser()) {
        throw new AppError(
          `Limite de ${organization.limits.maxUsers} utilisateurs atteinte. Passez à un plan supérieur`,
          403,
        );
      }

      // Vérifier si utilisateur existe déjà
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        // Vérifier s'il n'est pas déjà membre
        const isMember = organization.members.some(
          (m) => m.user.toString() === existingUser._id.toString(),
        );

        if (isMember) {
          throw new AppError(
            "Cet utilisateur est déjà membre de l'organisation",
            400,
          );
        }

        // Ajouter directement
        await organization.addMember(
          existingUser._id,
          role,
          permissions,
          userId,
        );

        // Mettre à jour user
        existingUser.organizations.push(organizationId);
        if (!existingUser.activeOrganization) {
          existingUser.activeOrganization = organizationId;
        }
        await existingUser.save();

        return successResponse(res, organization, "Membre ajouté avec succès");
      }

      // Créer invitation
      const token = await organization.createInvitation(email, role, userId);

      // Envoyer email invitation
      const invitationUrl = `${process.env.FRONTEND_URL}/accept-invitation/${token}`;

      try {
        await sendEmail({
          to: email,
          subject: `Invitation à rejoindre ${organization.name}`,
          template: "teamInvitation",
          data: {
            organizationName: organization.name,
            role,
            invitedBy: req.user.fullName,
            invitationUrl,
          },
        });
      } catch (error) {
        console.error("Erreur envoi email invitation:", error);
      }

      return successResponse(
        res,
        organization,
        "Invitation envoyée avec succès",
      );
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/v1/organization/members/:userId
  async updateMemberRole(req, res, next) {
    try {
      const { userId } = req.params;
      const { role, permissions } = req.body;
      const organizationId = req.user.organization;
      const currentUserId = req.user._id;

      const organization = await Organization.findById(organizationId);

      if (!organization) {
        throw new AppError("Organisation introuvable", 404);
      }

      // Ne pas modifier l'owner
      if (organization.owner.toString() === userId) {
        throw new AppError(
          "Le rôle du propriétaire ne peut pas être modifié",
          400,
        );
      }

      const member = organization.members.find(
        (m) => m.user.toString() === userId,
      );

      if (!member) {
        throw new AppError("Membre introuvable", 404);
      }

      if (role) member.role = role;
      if (permissions) member.permissions = permissions;

      await organization.save();

      return successResponse(res, organization, "Rôle du membre mis à jour");
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/v1/organization/members/:userId
  async removeMember(req, res, next) {
    try {
      const { userId } = req.params;
      const organizationId = req.user.organization;

      const organization = await Organization.findById(organizationId);

      if (!organization) {
        throw new AppError("Organisation introuvable", 404);
      }

      await organization.removeMember(userId);

      // Retirer organisation de l'utilisateur
      await User.findByIdAndUpdate(userId, {
        $pull: { organizations: organizationId },
        $unset: { activeOrganization: organizationId },
      });

      return successResponse(res, null, "Membre retiré avec succès");
    } catch (error) {
      next(error);
    }
  }

  // GET /api/v1/organization/stats
  async getStats(req, res, next) {
    try {
      const organizationId = req.user.organization;

      const [Product, Stock, Order] = [
        require("../inventory/product.model"),
        require("../inventory/stock.model"),
        require("../orders/order.model"),
      ];

      const [productsCount, stockValue, ordersCount, membersCount] =
        await Promise.all([
          Product.countDocuments({ organization: organizationId }),
          Stock.getTotalValue(organizationId),
          Order.countDocuments({ organization: organizationId }),
          Organization.findById(organizationId).then(
            (org) => org.members.filter((m) => m.status === "active").length,
          ),
        ]);

      const stats = {
        productsCount,
        stockValue,
        ordersCount,
        membersCount,
      };

      return successResponse(res, stats, "Statistiques récupérées");
    } catch (error) {
      next(error);
    }
  }

  // POST /api/v1/organization/accept-invitation/:token
  async acceptInvitation(req, res, next) {
    try {
      const { token } = req.params;
      const userId = req.user._id;

      const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      const organization = await Organization.findOne({
        "pendingInvitations.token": hashedToken,
        "pendingInvitations.status": "pending",
        "pendingInvitations.expiresAt": { $gt: new Date() },
      });

      if (!organization) {
        throw new AppError("Invitation invalide ou expirée", 400);
      }

      const invitation = organization.pendingInvitations.find(
        (inv) => inv.token === hashedToken && inv.status === "pending",
      );

      // Ajouter membre
      await organization.addMember(
        userId,
        invitation.role,
        null,
        invitation.invitedBy,
      );

      // Marquer invitation comme acceptée
      invitation.status = "accepted";
      await organization.save();

      // Mettre à jour user
      const user = await User.findById(userId);
      user.organizations.push(organization._id);
      if (!user.activeOrganization) {
        user.activeOrganization = organization._id;
      }
      await user.save();

      return successResponse(
        res,
        organization,
        "Invitation acceptée avec succès",
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new OrganizationController();
