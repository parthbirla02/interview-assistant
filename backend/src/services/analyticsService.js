const AnalyticsSnapshot = require('../models/AnalyticsSnapshot');
const Feedback = require('../models/Feedback');
const InterviewSession = require('../models/InterviewSession');

const curatedResources = [
  {
    title: 'System Design Primer & Distributed Caching',
    category: 'System Design',
    skill: 'System Design',
    type: 'System Design',
    url: 'https://github.com/donnemartin/system-design-primer',
    description: 'Master large-scale system design patterns, distributed caching, sharding, and CDN strategies.',
    estimatedHours: 12,
  },
  {
    title: 'NeetCode 150 & Blind 75 DSA Mastery',
    category: 'Data Structures & Algorithms',
    skill: 'DSA',
    type: 'Practice',
    url: 'https://neetcode.io/practice',
    description: 'High-frequency algorithm patterns: two-pointers, sliding window, binary trees, dynamic programming.',
    estimatedHours: 20,
  },
  {
    title: 'Node.js Event Loop & Microtask Internals',
    category: 'Role-Specific Technical',
    skill: 'Node.js',
    type: 'Article',
    url: 'https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick',
    description: 'Deep dive into libuv phases, threadpool allocation, and high-performance asynchronous execution.',
    estimatedHours: 4,
  },
  {
    title: 'React 18 Concurrent Features & Reconciliation',
    category: 'Framework & Architecture',
    skill: 'React',
    type: 'Course',
    url: 'https://react.dev/reference/react',
    description: 'Understand fiber tree reconciler, server components, and optimal memoization strategies.',
    estimatedHours: 6,
  },
  {
    title: 'Cracking the Behavioral Interview: STAR Method',
    category: 'Behavioral / HR',
    skill: 'Behavioral / Communication',
    type: 'Video',
    url: 'https://www.youtube.com/results?search_query=star+method+tech+interview',
    description: 'Formulate crisp, quantifiable STAR stories for leadership principles, conflicts, and outages.',
    estimatedHours: 3,
  },
];

const updateAnalyticsForUser = async (userId) => {
  try {
    const feedbacks = await Feedback.find({ userId }).sort({ createdAt: 1 });
    const sessions = await InterviewSession.find({ userId, status: 'completed' }).sort({ startedAt: 1 });

    if (feedbacks.length === 0) {
      // Return or create default snapshot
      let snapshot = await AnalyticsSnapshot.findOne({ userId });
      if (!snapshot) {
        snapshot = await AnalyticsSnapshot.create({
          userId,
          avgScore: 82,
          totalInterviews: sessions.length,
          totalHoursMocked: (sessions.length * 0.45).toFixed(1),
          readinessIndex: 80,
          categoryScores: {
            dsa: 80,
            systemDesign: 78,
            roleTechnical: 85,
            behavioral: 88,
            communication: 82,
          },
          skillGaps: [
            {
              skill: 'System Design & Distributed Systems',
              targetRoleRequirement: 85,
              demonstratedScore: 74,
              gapLevel: 'Moderate',
              recommendation: 'Practice designing high-availability rate limiters and message queues.',
              learningLink: 'https://github.com/donnemartin/system-design-primer',
            },
            {
              skill: 'DSA (Dynamic Programming & Graphs)',
              targetRoleRequirement: 80,
              demonstratedScore: 72,
              gapLevel: 'Moderate',
              recommendation: 'Focus on 2D DP tabulation and topological sort patterns.',
              learningLink: 'https://neetcode.io/practice',
            },
            {
              skill: 'Node.js & Backend Architecture',
              targetRoleRequirement: 90,
              demonstratedScore: 88,
              gapLevel: 'Low',
              recommendation: 'Refine microtask starvation and stream backpressure explanations.',
              learningLink: 'https://nodejs.org',
            },
            {
              skill: 'Behavioral STAR Framework',
              targetRoleRequirement: 85,
              demonstratedScore: 90,
              gapLevel: 'Mastered',
              recommendation: 'Keep citing quantifiable metrics and post-mortem ownership.',
              learningLink: '#',
            },
          ],
          trends: [
            { date: 'Day 1', sessionTitle: 'Frontend & React Core', score: 76, role: 'Fullstack Engineer', dsaScore: 70, systemDesignScore: 72, techScore: 80, behavioralScore: 82 },
            { date: 'Day 3', sessionTitle: 'Node.js & System Design', score: 82, role: 'Fullstack Engineer', dsaScore: 75, systemDesignScore: 80, techScore: 86, behavioralScore: 85 },
            { date: 'Day 5', sessionTitle: 'Full Mock Onsite', score: 88, role: 'Fullstack Engineer', dsaScore: 84, systemDesignScore: 86, techScore: 90, behavioralScore: 92 },
          ],
          recommendedResources: curatedResources,
        });
      }
      return snapshot;
    }

    const totalScore = feedbacks.reduce((acc, f) => acc + f.overallScore, 0);
    const avgScore = Math.round(totalScore / feedbacks.length);

    // Compute category radar averages
    let dsaSum = 0, sysSum = 0, techSum = 0, behSum = 0, commSum = 0;
    feedbacks.forEach(f => {
      dsaSum += (f.radarScores?.dsa || 75);
      sysSum += (f.radarScores?.systemDesign || 75);
      techSum += (f.radarScores?.roleTechnical || 80);
      behSum += (f.radarScores?.behavioral || 82);
      commSum += (f.radarScores?.communication || 80);
    });

    const categoryScores = {
      dsa: Math.round(dsaSum / feedbacks.length),
      systemDesign: Math.round(sysSum / feedbacks.length),
      roleTechnical: Math.round(techSum / feedbacks.length),
      behavioral: Math.round(behSum / feedbacks.length),
      communication: Math.round(commSum / feedbacks.length),
    };

    // Calculate readiness index (0-100%)
    const readinessIndex = Math.min(99, Math.max(30, Math.round(avgScore * 0.95 + (feedbacks.length >= 3 ? 5 : 0))));

    // Trends
    const trends = feedbacks.map((f, i) => ({
      date: new Date(f.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      sessionTitle: `Mock Session #${i + 1}`,
      score: f.overallScore,
      role: 'Fullstack Engineer',
      dsaScore: f.radarScores?.dsa || 75,
      systemDesignScore: f.radarScores?.systemDesign || 75,
      techScore: f.radarScores?.roleTechnical || 80,
      behavioralScore: f.radarScores?.behavioral || 82,
    }));

    // Dynamic Skill Gaps
    const skillGaps = [
      {
        skill: 'Data Structures & Algorithms',
        targetRoleRequirement: 85,
        demonstratedScore: categoryScores.dsa,
        gapLevel: categoryScores.dsa < 75 ? 'High' : categoryScores.dsa < 85 ? 'Moderate' : 'Mastered',
        recommendation: categoryScores.dsa < 85 ? 'Solve 2 Medium DSA problems daily focusing on Graph traversals and DP.' : 'Strong competency. Maintain practice with weekly contests.',
        learningLink: 'https://neetcode.io/practice',
      },
      {
        skill: 'System Design & Scalability',
        targetRoleRequirement: 85,
        demonstratedScore: categoryScores.systemDesign,
        gapLevel: categoryScores.systemDesign < 75 ? 'High' : categoryScores.systemDesign < 85 ? 'Moderate' : 'Mastered',
        recommendation: 'Review trade-offs between SQL vs NoSQL, Redis cache invalidation, and rate limiting.',
        learningLink: 'https://github.com/donnemartin/system-design-primer',
      },
      {
        skill: 'Role-Specific Technical (Node & React)',
        targetRoleRequirement: 90,
        demonstratedScore: categoryScores.roleTechnical,
        gapLevel: categoryScores.roleTechnical < 80 ? 'Moderate' : 'Low',
        recommendation: 'Practice explaining internal mechanics (event loop microtasks, fiber reconciler).',
        learningLink: 'https://react.dev',
      },
      {
        skill: 'Communication & Behavioral (STAR)',
        targetRoleRequirement: 85,
        demonstratedScore: categoryScores.behavioral,
        gapLevel: categoryScores.behavioral < 80 ? 'Moderate' : 'Mastered',
        recommendation: 'Structure stories using Situation, Task, Action, Result with clear business impact.',
        learningLink: '#',
      },
    ];

    const snapshot = await AnalyticsSnapshot.findOneAndUpdate(
      { userId },
      {
        userId,
        avgScore,
        totalInterviews: sessions.length || feedbacks.length,
        totalHoursMocked: parseFloat(((sessions.length || feedbacks.length) * 0.5).toFixed(1)),
        readinessIndex,
        categoryScores,
        skillGaps,
        trends,
        recommendedResources: curatedResources,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return snapshot;
  } catch (error) {
    console.error('Analytics generation error:', error.message);
    throw error;
  }
};

module.exports = {
  updateAnalyticsForUser,
};
