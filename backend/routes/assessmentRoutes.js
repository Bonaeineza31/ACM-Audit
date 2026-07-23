import express from 'express';
const router = express.Router();
import { createAssessment, getAssessments } from '../controllers/assessmentController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

// Public endpoint for submitting assessments
router.post('/', createAssessment);

// Protected endpoint for viewing assessments (Viewer role or Admin)
// In the future, you can use requireRole(['Viewer', 'Admin']) 
// but for now, requireAuth is enough to check for a valid session.
router.get('/', requireAuth, getAssessments);

export default router;
