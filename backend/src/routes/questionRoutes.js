const express = require('express');
const router = express.Router();
const {
  generateQuestionSet,
  getQuestionSets,
  getQuestionSetById,
  deleteQuestionSet,
} = require('../controllers/questionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate', protect, generateQuestionSet);
router.get('/', protect, getQuestionSets);
router.get('/:id', protect, getQuestionSetById);
router.delete('/:id', protect, deleteQuestionSet);

module.exports = router;
