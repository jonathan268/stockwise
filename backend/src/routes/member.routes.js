import { Router } from "express";
import { protect, authorize } from "../middleware/auth.js";
import { tenant } from "../middleware/tenant.js";
import * as memberController from "../controllers/member.controller.js";

const router = Router();

router.use(protect);
router.use(tenant);

router.get("/", authorize("owner", "admin"), memberController.listMembers);
router.post("/invite", authorize("owner"), memberController.invite);
router.patch("/:userId/role", authorize("owner"), memberController.updateRole);
router.delete("/:userId", authorize("owner"), memberController.removeMember);
router.delete("/invite/:inviteId", authorize("owner"), memberController.cancelInvite);

export default router;
