import { Router } from "express";
import { protect, authorize } from "../middleware/auth.js";
import * as feedbackController from "../controllers/feedback.controller.js";

const router = Router();

// Route publique — les utilisateurs connectés ou non peuvent soumettre un feedback
router.post("/", feedbackController.createFeedback);

// Routes super admin uniquement
router.get("/", protect, authorize("super_admin"), feedbackController.getFeedbacks);
router.get("/stats", protect, authorize("super_admin"), feedbackController.getFeedbackStats);
router.get("/:id", protect, authorize("super_admin"), feedbackController.getFeedbackById);
router.put("/:id", protect, authorize("super_admin"), feedbackController.updateFeedback);

export default router;
