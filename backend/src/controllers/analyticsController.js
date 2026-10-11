const AnalyticsSnapshot = require('../models/AnalyticsSnapshot');
const { updateAnalyticsForUser } = require('../services/analyticsService');

// @route   GET /api/analytics
const getUserAnalytics = async (req, res) => {
  try {
    let analytics = await AnalyticsSnapshot.findOne({ userId: req.user.id });

    if (!analytics) {
      analytics = await updateAnalyticsForUser(req.user.id);
    }

    res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error('Analytics controller error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/analytics/refresh
const refreshUserAnalytics = async (req, res) => {
  try {
    const analytics = await updateAnalyticsForUser(req.user.id);
    res.status(200).json({
      success: true,
      message: 'Analytics refreshed successfully',
      analytics,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getUserAnalytics,
  refreshUserAnalytics,
};
