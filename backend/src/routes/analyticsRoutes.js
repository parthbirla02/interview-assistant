const express = require('express');
const router = express.Router();
const { getUserAnalytics, refreshUserAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getUserAnalytics);
router.get('/overview', protect, getUserAnalytics);
router.post('/refresh', protect, refreshUserAnalytics);

module.exports = router;
