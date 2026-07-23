const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

// Viewers cannot create assessments
router.post('/', requireAuth, requireRole(['Admin', 'Assessor']), assessmentController.createAssessment);
router.get('/', requireAuth, assessmentController.getAssessments);

module.exports = router;
