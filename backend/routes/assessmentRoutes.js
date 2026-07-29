import express from 'express';
const router = express.Router();
import { createAssessment, getAssessments } from '../controllers/assessmentController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

// Protected endpoint for submitting assessments
router.post('/', requireAuth, requireRole(['Admin', 'Auditor']), createAssessment);

// Protected endpoint for viewing assessments (Viewer role or Admin)
// Viewer receives 403 from every write endpoint above
router.get('/', requireAuth, getAssessments);

export default router;
