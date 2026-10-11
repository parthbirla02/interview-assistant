const mongoose = require('mongoose');

const skillGapSchema = new mongoose.Schema({
  skill: { type: String, required: true },
  targetRoleRequirement: { type: Number, default: 85 }, // 0 - 100
  demonstratedScore: { type: Number, default: 65 }, // 0 - 100
  gapLevel: { type: String, enum: ['Low', 'Moderate', 'High', 'Mastered'], default: 'Moderate' },
  recommendation: { type: String, default: '' },
  learningLink: { type: String, default: '' },
});

const trendPointSchema = new mongoose.Schema({
  date: { type: String, required: true },
  sessionTitle: { type: String, default: 'Interview' },
  score: { type: Number, required: true },
  role: { type: String, default: 'Software Engineer' },
  dsaScore: { type: Number, default: 70 },
  systemDesignScore: { type: Number, default: 70 },
  techScore: { type: Number, default: 70 },
  behavioralScore: { type: Number, default: 70 },
});

const learningResourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  skill: { type: String, required: true },
  type: { type: String, enum: ['Article', 'Course', 'Practice', 'System Design', 'Video', 'Book'], default: 'Practice' },
  url: { type: String, default: '#' },
  description: { type: String, default: '' },
  estimatedHours: { type: Number, default: 5 },
});

const analyticsSnapshotSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  avgScore: {
    type: Number,
    default: 0,
  },
  totalInterviews: {
    type: Number,
    default: 0,
  },
  totalHoursMocked: {
    type: Number,
    default: 0,
  },
  readinessIndex: {
    type: Number,
    default: 0, // e.g. 78% ready
  },
  categoryScores: {
    dsa: { type: Number, default: 0 },
    systemDesign: { type: Number, default: 0 },
    roleTechnical: { type: Number, default: 0 },
    behavioral: { type: Number, default: 0 },
    communication: { type: Number, default: 0 },
  },
  skillGaps: [skillGapSchema],
  trends: [trendPointSchema],
  recommendedResources: [learningResourceSchema],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('AnalyticsSnapshot', analyticsSnapshotSchema);
