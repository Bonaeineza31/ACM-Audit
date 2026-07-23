import express from 'express';
const router = express.Router();
import { getKPIs, getIssues } from '../controllers/analyticsController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

// All analytics routes require authentication
router.use(requireAuth);

router.get('/kpis', getKPIs);
router.get('/issues', getIssues);

export default router;
