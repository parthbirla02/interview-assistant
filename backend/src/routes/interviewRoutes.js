const express = require('express');
const router = express.Router();
const {
  startInterview,
  sendMessage,
  endInterview,
  getSessions,
  getSessionById,
} = require('../controllers/interviewController');
const { protect } = require('../middleware/authMiddleware');

router.post('/start', protect, startInterview);
router.post('/:sessionId/message', protect, sendMessage);
router.post('/:sessionId/end', protect, endInterview);
router.get('/sessions', protect, getSessions);
router.get('/:sessionId', protect, getSessionById);

module.exports = router;
