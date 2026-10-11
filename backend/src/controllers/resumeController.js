const Resume = require('../models/Resume');
const User = require('../models/User');
const { parseResumeFile } = require('../services/resumeParserService');
const fs = require('fs');

// @route   POST /api/resume/upload
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF or DOCX resume file' });
    }

    const filePath = req.file.path;
    const originalName = req.file.originalname;

    // Parse resume with PDF/DOCX extractor + OpenAI/NLP
    const parsedData = await parseResumeFile(filePath, originalName);

    // Save or update user's resume
    let resume = await Resume.findOne({ userId: req.user.id });
    if (resume) {
      resume.fileName = originalName;
      resume.fileType = req.file.mimetype.includes('pdf') ? 'pdf' : 'docx';
      resume.rawText = parsedData.rawText;
      resume.extractedSkills = parsedData.skills || [];
      resume.experienceYears = parsedData.experienceYears || 2;
      resume.pastRoles = parsedData.pastRoles || [];
      resume.seniorityLevel = parsedData.seniorityLevel || 'Mid-Level';
      resume.education = parsedData.education || {};
      resume.summary = parsedData.summary || '';
      resume.keyStrengths = parsedData.keyStrengths || [];
      resume.recommendedRoles = parsedData.recommendedRoles || [];
      resume.uploadedAt = new Date();
      await resume.save();
    } else {
      resume = await Resume.create({
        userId: req.user.id,
        fileName: originalName,
        fileType: req.file.mimetype.includes('pdf') ? 'pdf' : 'docx',
        rawText: parsedData.rawText,
        extractedSkills: parsedData.skills || [],
        experienceYears: parsedData.experienceYears || 2,
        pastRoles: parsedData.pastRoles || [],
        seniorityLevel: parsedData.seniorityLevel || 'Mid-Level',
        education: parsedData.education || {},
        summary: parsedData.summary || '',
        keyStrengths: parsedData.keyStrengths || [],
        recommendedRoles: parsedData.recommendedRoles || [],
      });
    }

    // Sync extracted skills to User profile if user wishes
    if (parsedData.skills && parsedData.skills.length > 0) {
      await User.findByIdAndUpdate(req.user.id, {
        targetSkills: parsedData.skills,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Resume parsed and skills extracted successfully',
      resume,
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/resume
const getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user.id }).sort({ uploadedAt: -1 });
    if (!resume) {
      return res.status(200).json({
        success: true,
        resume: null,
        message: 'No resume uploaded yet',
      });
    }

    res.status(200).json({
      success: true,
      resume,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/resume/skills
const updateSkills = async (req, res) => {
  try {
    const { skills } = req.body;
    if (!skills || !Array.isArray(skills)) {
      return res.status(400).json({ success: false, message: 'Skills must be an array of strings' });
    }

    const resume = await Resume.findOneAndUpdate(
      { userId: req.user.id },
      { extractedSkills: skills },
      { new: true }
    );

    await User.findByIdAndUpdate(req.user.id, {
      targetSkills: skills,
    });

    res.status(200).json({
      success: true,
      message: 'Skills updated successfully',
      skills,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  uploadResume,
  getResume,
  updateSkills,
};
