const mongoose = require('mongoose');

const feedbackItemSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true,
  },
  questionText: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    default: 'General Technical',
  },
  candidateAnswer: {
    type: String,
    default: '',
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    required: true,
  },
  categories: {
    correctness: { type: Number, min: 0, max: 100, default: 75 },
    clarity: { type: Number, min: 0, max: 100, default: 75 },
    structure: { type: Number, min: 0, max: 100, default: 75 },
    confidence: { type: Number, min: 0, max: 100, default: 75 },
  },
  strengths: [{
    type: String,
  }],
  weaknesses: [{
    type: String,
  }],
  suggestion: {
    type: String,
    default: '',
  },
  modelAnswer: {
    type: String,
    default: '',
  },
  keyTakeaways: [{
    type: String,
  }],
});

const feedbackSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InterviewSession',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  overallScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true,
  },
  radarScores: {
    dsa: { type: Number, default: 70 },
    systemDesign: { type: Number, default: 70 },
    roleTechnical: { type: Number, default: 70 },
    behavioral: { type: Number, default: 70 },
    communication: { type: Number, default: 70 },
  },
  hiringVerdict: {
    type: String,
    enum: ['Strong Hire', 'Hire', 'Lean Hire', 'Needs Improvement', 'No Hire'],
    default: 'Hire',
  },
  summaryFeedback: {
    type: String,
    required: true,
  },
  topStrengths: [{
    type: String,
  }],
  topImprovementAreas: [{
    type: String,
  }],
  questionFeedbacks: [feedbackItemSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Feedback', feedbackSchema);
