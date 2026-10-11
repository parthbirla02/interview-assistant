const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
  },
  targetRole: {
    type: String,
    default: 'Fullstack Software Engineer',
    trim: true,
  },
  experienceLevel: {
    type: String,
    enum: ['Junior (0-2 yrs)', 'Mid-Level (2-5 yrs)', 'Senior (5-8 yrs)', 'Lead / Principal (8+ yrs)'],
    default: 'Mid-Level (2-5 yrs)',
  },
  targetSkills: [{
    type: String,
    trim: true,
  }],
  avatar: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    default: 'Passionate developer preparing for upcoming technical and behavioral interviews.',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compare password helper
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Hash password before save if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

module.exports = mongoose.model('User', userSchema);
