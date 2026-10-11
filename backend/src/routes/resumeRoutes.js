const express = require('express');
const router = express.Router();
const { uploadResume, getResume, updateSkills } = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/upload', protect, upload.single('resume'), uploadResume);
router.get('/', protect, getResume);
router.get('/me', protect, getResume);
router.put('/skills', protect, updateSkills);

module.exports = router;
