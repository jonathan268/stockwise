const express = require("express");
const router = express.Router();
const organizationController = require("../controllers/organizationController");
const { protect, restrictTo, isOwner } = require("../middlewares/auth");
const { tenantIsolation } = require("../middlewares/tenant");
const { checkSubscription } = require("../middlewares/subscription");

router.use(protect);
router.use(tenantIsolation);
router.use(checkSubscription);

// Routes principales
router
  .route("/")
  .get(organizationController.getOrganization)
  .put(restrictTo("owner", "admin"), organizationController.updateOrganization)
  .delete(isOwner, organizationController.deleteOrganization);

// Stats
router.get("/stats", organizationController.getStats);

// Membres
router
  .route("/members")
  .get(organizationController.getMembers)
  .post(restrictTo("owner", "admin"), organizationController.inviteMember);

router
  .route("/members/:userId")
  .put(restrictTo("owner", "admin"), organizationController.updateMemberRole)
  .delete(restrictTo("owner", "admin"), organizationController.removeMember);

// Invitations
router.post(
  "/accept-invitation/:token",
  organizationController.acceptInvitation,
);

module.exports = router;
