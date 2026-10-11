const QuestionSet = require('../models/QuestionSet');
const Resume = require('../models/Resume');
const { generateQuestions } = require('../services/openaiService');

// @route   POST /api/questions/generate
const generateQuestionSet = async (req, res) => {
  try {
    const { role, difficulty, customSkills, categories, count, title } = req.body;

    let skillsToUse = customSkills || [];
    if (skillsToUse.length === 0) {
      const resume = await Resume.findOne({ userId: req.user.id });
      if (resume && resume.extractedSkills) {
        skillsToUse = resume.extractedSkills;
      } else if (req.user.targetSkills) {
        skillsToUse = req.user.targetSkills;
      }
    }

    const targetRole = role || req.user.targetRole || 'Fullstack Software Engineer';
    const targetDifficulty = difficulty || 'Mid-Level';
    const questionCount = count || 5;

    // Call OpenAI / Heuristic AI to craft tailored questions
    const generatedQuestions = await generateQuestions({
      role: targetRole,
      difficulty: targetDifficulty,
      skills: skillsToUse,
      count: questionCount,
      categories: categories || ['DSA', 'System Design', 'Role-Specific Technical', 'Behavioral / HR'],
    });

    const questionSet = await QuestionSet.create({
      userId: req.user.id,
      title: title || `${targetRole} (${targetDifficulty}) Question Set`,
      role: targetRole,
      difficulty: targetDifficulty,
      focusSkills: skillsToUse,
      categories: categories || ['DSA', 'System Design', 'Role-Specific Technical', 'Behavioral / HR'],
      questions: generatedQuestions,
      isPreset: false,
    });

    res.status(201).json({
      success: true,
      message: 'Question set generated successfully',
      questionSet,
    });
  } catch (error) {
    console.error('Question generation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/questions
const getQuestionSets = async (req, res) => {
  try {
    const questionSets = await QuestionSet.find({
      $or: [{ userId: req.user.id }, { isPreset: true }],
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: questionSets.length,
      questionSets,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/questions/:id
const getQuestionSetById = async (req, res) => {
  try {
    const questionSet = await QuestionSet.findById(req.params.id);
    if (!questionSet) {
      return res.status(404).json({ success: false, message: 'Question set not found' });
    }

    res.status(200).json({
      success: true,
      questionSet,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/questions/:id
const deleteQuestionSet = async (req, res) => {
  try {
    const questionSet = await QuestionSet.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!questionSet) {
      return res.status(404).json({ success: false, message: 'Question set not found or unauthorized' });
    }

    res.status(200).json({
      success: true,
      message: 'Question set deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  generateQuestionSet,
  getQuestionSets,
  getQuestionSetById,
  deleteQuestionSet,
};
