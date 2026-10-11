const mongoose = require('mongoose');

const questionItemSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['DSA', 'System Design', 'Role-Specific Technical', 'Behavioral / HR', 'Framework & Architecture'],
    required: true,
  },
  type: {
    type: String,
    enum: ['technical', 'behavioral', 'scenario', 'coding_concept'],
    default: 'technical',
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium',
  },
  hint: {
    type: String,
    default: '',
  },
  expectedPoints: [{
    type: String,
  }],
  followUpSuggestions: [{
    type: String,
  }],
});

const questionSetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    required: true,
    trim: true,
  },
  difficulty: {
    type: String,
    enum: ['Junior', 'Mid-Level', 'Senior', 'Lead'],
    default: 'Mid-Level',
  },
  focusSkills: [{
    type: String,
  }],
  categories: [{
    type: String,
  }],
  questions: [questionItemSchema],
  isPreset: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('QuestionSet', questionSetSchema);
