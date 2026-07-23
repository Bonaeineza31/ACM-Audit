const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/kpis', requireAuth, analyticsController.getKPIs);
router.get('/issues', requireAuth, analyticsController.getIssues);

module.exports = router;
