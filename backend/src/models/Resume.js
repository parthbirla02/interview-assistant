const mongoose = require('mongoose');

const pastRoleSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  company: { type: String, default: '' },
  duration: { type: String, default: '' },
  highlights: [{ type: String }],
});

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    enum: ['pdf', 'docx', 'txt', 'custom'],
    default: 'pdf',
  },
  rawText: {
    type: String,
    required: true,
  },
  extractedSkills: [{
    type: String,
    trim: true,
  }],
  experienceYears: {
    type: Number,
    default: 0,
  },
  pastRoles: [pastRoleSchema],
  seniorityLevel: {
    type: String,
    default: 'Mid-Level',
  },
  education: {
    degree: { type: String, default: '' },
    institution: { type: String, default: '' },
    gradYear: { type: String, default: '' },
  },
  summary: {
    type: String,
    default: '',
  },
  keyStrengths: [{
    type: String,
  }],
  recommendedRoles: [{
    type: String,
  }],
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Resume', resumeSchema);
