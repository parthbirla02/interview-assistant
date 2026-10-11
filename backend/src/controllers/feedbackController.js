const Feedback = require('../models/Feedback');
const InterviewSession = require('../models/InterviewSession');

// @route   GET /api/feedback/:sessionId
const getFeedbackBySessionId = async (req, res) => {
  try {
    const feedback = await Feedback.findOne({
      sessionId: req.params.sessionId,
      userId: req.user.id,
    }).populate('sessionId');

    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback report not found for this session' });
    }

    res.status(200).json({
      success: true,
      feedback,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/feedback
const getUserFeedbackHistory = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ userId: req.user.id })
      .populate('sessionId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: feedbacks.length,
      feedbacks,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getFeedbackBySessionId,
  getUserFeedbackHistory,
};
