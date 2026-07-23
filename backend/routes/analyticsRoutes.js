const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middlewares/authMiddleware');

// All analytics routes require Viewer role
router.use(authMiddleware);

router.get('/kpis', analyticsController.getKPIs);
router.get('/issues', analyticsController.getIssues);

module.exports = router;
