const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['interviewer', 'candidate', 'system'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  questionId: {
    type: String,
    default: null,
  },
  isFollowUp: {
    type: Boolean,
    default: false,
  },
});

const interviewSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  questionSetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuestionSet',
    required: true,
  },
  title: {
    type: String,
    default: 'Mock Technical Interview',
  },
  role: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    default: 'Mid-Level',
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned'],
    default: 'in-progress',
  },
  currentQuestionIndex: {
    type: Number,
    default: 0,
  },
  totalQuestions: {
    type: Number,
    default: 0,
  },
  messages: [messageSchema],
  overallScore: {
    type: Number,
    min: 0,
    max: 100,
    default: null,
  },
  durationMinutes: {
    type: Number,
    default: 0,
  },
  hiringVerdict: {
    type: String,
    enum: ['Strong Hire', 'Hire', 'Lean Hire', 'Needs Improvement', 'No Hire', null],
    default: null,
  },
  overallSummary: {
    type: String,
    default: '',
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
    default: null,
  },
});

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);
