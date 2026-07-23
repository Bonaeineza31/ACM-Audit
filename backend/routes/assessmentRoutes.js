const express = require('express');
const router = express.Router();
const { createAssessment, getAssessments } = require('../controllers/assessmentController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', createAssessment);
router.get('/', authMiddleware, getAssessments);

module.exports = router;
