const InterviewSession = require('../models/InterviewSession');
const QuestionSet = require('../models/QuestionSet');
const Feedback = require('../models/Feedback');
const { generateInterviewerReply, evaluateInterviewSession } = require('../services/openaiService');
const { updateAnalyticsForUser } = require('../services/analyticsService');

// @route   POST /api/interview/start
const startInterview = async (req, res) => {
  try {
    const { questionSetId, role, difficulty } = req.body;

    let questionSet = null;
    if (questionSetId) {
      questionSet = await QuestionSet.findById(questionSetId);
    }

    if (!questionSet) {
      // Find latest question set for this user or first preset
      questionSet = await QuestionSet.findOne({
        $or: [{ userId: req.user.id }, { isPreset: true }]
      }).sort({ createdAt: -1 });
    }

    if (!questionSet || questionSet.questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No questions found. Please generate a question set first.',
      });
    }

    const firstQuestion = questionSet.questions[0];

    const initialGreeting = `Hello ${req.user.name.split(' ')[0]}! Welcome to your mock technical interview for the ${questionSet.role} position (${questionSet.difficulty} level). I'll be your interviewer today.\n\nLet's kick things off with our first question:\n\n**${firstQuestion.category}**: ${firstQuestion.text}`;

    const session = await InterviewSession.create({
      userId: req.user.id,
      questionSetId: questionSet._id,
      title: `${questionSet.role} Mock Interview`,
      role: questionSet.role,
      difficulty: questionSet.difficulty,
      status: 'in-progress',
      currentQuestionIndex: 0,
      totalQuestions: questionSet.questions.length,
      messages: [
        {
          role: 'interviewer',
          content: initialGreeting,
          questionId: firstQuestion.id,
          timestamp: new Date(),
        },
      ],
      startedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Interview session started',
      session,
      questionSet,
    });
  } catch (error) {
    console.error('Start interview error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/interview/:sessionId/message
const sendMessage = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { message, nextQuestion = false } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, message: 'Candidate message cannot be empty' });
    }

    const session = await InterviewSession.findOne({
      _id: sessionId,
      userId: req.user.id,
    });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Interview session not found' });
    }

    if (session.status === 'completed') {
      return res.status(400).json({ success: false, message: 'This interview session is already completed' });
    }

    const questionSet = await QuestionSet.findById(session.questionSetId);
    const currentQIndex = session.currentQuestionIndex;
    const currentQ = questionSet.questions[currentQIndex] || questionSet.questions[0];

    // Add candidate message to history
    session.messages.push({
      role: 'candidate',
      content: message,
      questionId: currentQ.id,
      timestamp: new Date(),
    });

    let interviewerReply = '';
    let updatedIndex = currentQIndex;

    // Check if candidate explicitly requests next question or if this is the final question
    if (nextQuestion) {
      if (currentQIndex + 1 < questionSet.questions.length) {
        updatedIndex = currentQIndex + 1;
        const nextQ = questionSet.questions[updatedIndex];
        
        const aiTransition = await generateInterviewerReply({
          role: session.role,
          difficulty: session.difficulty,
          currentQuestion: currentQ,
          conversationHistory: session.messages.slice(-6),
          candidateAnswer: message,
        });

        interviewerReply = `${aiTransition}\n\nMoving on to Question ${updatedIndex + 1} of ${questionSet.questions.length}:\n\n**${nextQ.category}**: ${nextQ.text}`;
        session.currentQuestionIndex = updatedIndex;
      } else {
        // Last question reached
        interviewerReply = `Thank you for those comprehensive answers! That covers all ${questionSet.questions.length} questions in our interview plan. When you're ready, click "Complete Interview & Generate Report" to view your detailed rubric scorecard and feedback.`;
      }
    } else {
      // Natural dialogue / follow-up probe
      interviewerReply = await generateInterviewerReply({
        role: session.role,
        difficulty: session.difficulty,
        currentQuestion: currentQ,
        conversationHistory: session.messages.slice(-6),
        candidateAnswer: message,
      });
    }

    // Add interviewer reply
    session.messages.push({
      role: 'interviewer',
      content: interviewerReply,
      questionId: questionSet.questions[updatedIndex]?.id || currentQ.id,
      timestamp: new Date(),
    });

    await session.save();

    res.status(200).json({
      success: true,
      session,
      currentQuestion: questionSet.questions[session.currentQuestionIndex],
    });
  } catch (error) {
    console.error('Send interview message error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/interview/:sessionId/end
const endInterview = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await InterviewSession.findOne({
      _id: sessionId,
      userId: req.user.id,
    });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Interview session not found' });
    }

    const questionSet = await QuestionSet.findById(session.questionSetId);
    
    // Evaluate session with OpenAI / Rubric engine
    const evaluation = await evaluateInterviewSession({
      role: session.role,
      difficulty: session.difficulty,
      questions: questionSet ? questionSet.questions : [],
      sessionMessages: session.messages,
    });

    // Calculate duration in minutes
    const startTime = new Date(session.startedAt).getTime();
    const endTime = Date.now();
    const durationMinutes = Math.max(1, Math.round((endTime - startTime) / (1000 * 60)));

    session.status = 'completed';
    session.completedAt = new Date();
    session.durationMinutes = durationMinutes;
    session.overallScore = evaluation.overallScore;
    session.hiringVerdict = evaluation.hiringVerdict;
    session.overallSummary = evaluation.summaryFeedback;
    await session.save();

    // Create Feedback record
    const feedback = await Feedback.create({
      sessionId: session._id,
      userId: req.user.id,
      overallScore: evaluation.overallScore,
      radarScores: evaluation.radarScores || {
        dsa: 80,
        systemDesign: 82,
        roleTechnical: 85,
        behavioral: 88,
        communication: 82,
      },
      hiringVerdict: evaluation.hiringVerdict,
      summaryFeedback: evaluation.summaryFeedback,
      topStrengths: evaluation.topStrengths,
      topImprovementAreas: evaluation.topImprovementAreas,
      questionFeedbacks: evaluation.questionFeedbacks,
    });

    // Automatically recalculate and persist user analytics
    await updateAnalyticsForUser(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Interview completed and feedback generated',
      session,
      feedback,
    });
  } catch (error) {
    console.error('End interview error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/interview/sessions
const getSessions = async (req, res) => {
  try {
    const sessions = await InterviewSession.find({ userId: req.user.id })
      .populate('questionSetId', 'title role difficulty')
      .sort({ startedAt: -1 });

    res.status(200).json({
      success: true,
      count: sessions.length,
      sessions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/interview/:sessionId
const getSessionById = async (req, res) => {
  try {
    const session = await InterviewSession.findOne({
      _id: req.params.sessionId,
      userId: req.user.id,
    }).populate('questionSetId');

    if (!session) {
      return res.status(404).json({ success: false, message: 'Interview session not found' });
    }

    res.status(200).json({
      success: true,
      session,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  startInterview,
  sendMessage,
  endInterview,
  getSessions,
  getSessionById,
};
