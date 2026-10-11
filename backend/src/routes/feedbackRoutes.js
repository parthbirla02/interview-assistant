const express = require('express');
const router = express.Router();
const { getFeedbackBySessionId, getUserFeedbackHistory } = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');

router.get('/history', protect, getUserFeedbackHistory);
router.get('/:sessionId', protect, getFeedbackBySessionId);

module.exports = router;
