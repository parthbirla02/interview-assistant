const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { connectDB } = require('../config/db');
const User = require('../models/User');
const Resume = require('../models/Resume');
const QuestionSet = require('../models/QuestionSet');
const InterviewSession = require('../models/InterviewSession');
const Feedback = require('../models/Feedback');
const AnalyticsSnapshot = require('../models/AnalyticsSnapshot');

dotenv.config();

const seed = async () => {
  try {
    await connectDB();

    console.log('🧹 Clearing existing database records...');
    await User.deleteMany({});
    await Resume.deleteMany({});
    await QuestionSet.deleteMany({});
    await InterviewSession.deleteMany({});
    await Feedback.deleteMany({});
    await AnalyticsSnapshot.deleteMany({});

    console.log('👤 Creating Demo Users...');
    const demoUser = await User.create({
      name: 'Alex Rivera',
      email: 'demo@interviewai.com',
      passwordHash: 'password123',
      targetRole: 'Senior Fullstack Engineer',
      experienceLevel: 'Senior (5-8 yrs)',
      targetSkills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'Redis', 'Docker', 'System Design'],
      bio: 'Fullstack engineer with 6 years building high-throughput web applications, microservices, and distributed cloud systems.',
    });

    console.log('📄 Creating Resume for Demo User...');
    const resume = await Resume.create({
      userId: demoUser._id,
      fileName: 'Alex_Rivera_Senior_Fullstack_Resume.pdf',
      fileType: 'pdf',
      rawText: `Alex Rivera - Senior Fullstack Engineer
Email: demo@interviewai.com | Location: San Francisco, CA

SUMMARY
Passionate Fullstack Engineer with 6+ years of experience architecting scalable distributed web services, RESTful APIs, and reactive frontend platforms. Expert in React, Node.js, TypeScript, PostgreSQL, MongoDB, and AWS cloud infrastructure.

WORK EXPERIENCE
Senior Software Engineer | CloudScale Inc. (2022 - Present)
- Designed and launched high-throughput REST & GraphQL microservices handling 25,000 requests/sec with Node.js and Redis caching.
- Led frontend migration to React 18 with Vite and Tailwind CSS, reducing initial page load time by 42%.
- Mentored junior engineers, established automated CI/CD pipelines with GitHub Actions and Docker.

Fullstack Developer | Nexus Dynamics (2019 - 2022)
- Built interactive analytics dashboards using React, Redux, and D3.js for enterprise client telemetry.
- Designed schema migrations in MongoDB and PostgreSQL ensuring zero-downtime deployments.
- Implemented JWT authentication and role-based access control (RBAC).

EDUCATION
B.S. in Computer Science | University of California, Berkeley (2019)`,
      extractedSkills: [
        'JavaScript', 'TypeScript', 'React', 'Node.js', 'Express',
        'MongoDB', 'PostgreSQL', 'Redis', 'GraphQL', 'Docker',
        'AWS', 'CI/CD', 'REST API', 'System Design', 'Tailwind CSS'
      ],
      experienceYears: 6,
      seniorityLevel: 'Senior',
      education: {
        degree: 'B.S. in Computer Science',
        institution: 'University of California, Berkeley',
        gradYear: '2019',
      },
      summary: 'Senior Fullstack Engineer with 6+ years of experience architecting scalable distributed web services and high-performance React frontends.',
      keyStrengths: [
        'Distributed Systems & High-Throughput Node.js APIs',
        'Modern React Performance & State Architecture',
        'Database Optimization & Caching Strategies (Redis/Postgres)'
      ],
      recommendedRoles: [
        'Senior Fullstack Software Engineer',
        'Lead Backend Engineer',
        'Staff Frontend Engineer'
      ]
    });

    console.log('❓ Creating Question Sets...');
    const fullstackQuestionSet = await QuestionSet.create({
      userId: demoUser._id,
      title: 'Senior Fullstack & System Design Mastery',
      role: 'Senior Fullstack Engineer',
      difficulty: 'Senior',
      focusSkills: ['Node.js', 'React', 'System Design', 'DSA', 'Behavioral'],
      categories: ['DSA', 'System Design', 'Role-Specific Technical', 'Behavioral / HR', 'Framework & Architecture'],
      isPreset: true,
      questions: [
        {
          id: 'q_fs_1',
          text: 'How does the Node.js Event Loop schedule asynchronous tasks across its phases? Specifically, how do microtasks (Promises, process.nextTick) interact with macrotasks (timers, I/O callbacks), and how can unhandled promise chains lead to event loop starvation?',
          category: 'Role-Specific Technical',
          type: 'technical',
          difficulty: 'Medium',
          hint: 'Discuss libuv phase order (timers, I/O polling, check phase with setImmediate) and the microtask drain queue.',
          expectedPoints: [
            'Differentiates libuv threadpool from single-threaded JS execution stack',
            'Explains microtask queue drain immediately following current synchronous tick',
            'Describes process.nextTick vs Promise microtask priorities',
            'Outlines strategies to profile and prevent event loop blocking'
          ],
          followUpSuggestions: [
            'How does setImmediate() differ from setTimeout(0)?',
            'When should worker threads or child processes be utilized?'
          ]
        },
        {
          id: 'q_fs_2',
          text: 'Design a distributed real-time collaborative document editor (like Google Docs or Notion). How would you handle concurrency conflicts between simultaneous typers, synchronize document state over WebSockets, and ensure sub-50ms latency globally?',
          category: 'System Design',
          type: 'technical',
          difficulty: 'Hard',
          hint: 'Consider Operational Transformation (OT) or Conflict-free Replicated Data Types (CRDTs), Redis pub/sub, and snapshot persistence.',
          expectedPoints: [
            'Compares Operational Transformation (OT) vs CRDTs (e.g. Yjs, Automerge)',
            'Designs WebSocket gateway with connection pooling and heartbeat recovery',
            'Proposes distributed message broker (Redis Pub/Sub or Kafka) for room fan-out',
            'Details immutable document snapshots and append-only change logs'
          ],
          followUpSuggestions: [
            'How would you handle offline editing and reconciliation when reconnection occurs?',
            'What database schema would you choose for version history?'
          ]
        },
        {
          id: 'q_fs_3',
          text: 'Given an array of meeting time intervals [start, end], find the minimum number of conference rooms required to schedule all meetings without overlaps. What is the optimal time and space complexity?',
          category: 'DSA',
          type: 'coding_concept',
          difficulty: 'Medium',
          hint: 'Separate start and end times or use a min-heap sorted by meeting end times.',
          expectedPoints: [
            'Identifies chronological timeline sweep or min-heap simulation',
            'Calculates O(N log N) time complexity due to sorting',
            'Calculates O(N) auxiliary space complexity',
            'Handles edge cases: back-to-back meetings where end == start, zero meetings'
          ],
          followUpSuggestions: [
            'How does the two-pointer sweep compare to the Min-Heap priority queue approach?',
            'How would you return the actual room assignment IDs for each meeting?'
          ]
        },
        {
          id: 'q_fs_4',
          text: 'In React 18, explain the architecture of Concurrent Rendering and Transitions (useTransition, useDeferredValue). How does React prioritize high-priority user interactions (typing/clicking) over background rendering?',
          category: 'Framework & Architecture',
          type: 'technical',
          difficulty: 'Medium',
          hint: 'Explain interruptible rendering loops, lane models, and yielding control to the browser paint cycle.',
          expectedPoints: [
            'Contrasts synchronous blocking rendering with time-sliced fiber work loop',
            'Explains useTransition marking updates as non-urgent transitions',
            'Details lane-based prioritization model in React 18 reconciler',
            'Discusses UX improvements: keeping inputs responsive during heavy data table renders'
          ],
          followUpSuggestions: [
            'How does useDeferredValue differ from classic lodash debounce/throttle?',
            'What happens when a new high-priority state update triggers midway through an in-progress transition?'
          ]
        },
        {
          id: 'q_fs_5',
          text: 'Describe a situation where you had a major technical disagreement with a team member or architect regarding tech stack choice or system design. How did you resolve it constructively and ensure alignment?',
          category: 'Behavioral / HR',
          type: 'behavioral',
          difficulty: 'Medium',
          hint: 'Structure response using the STAR framework. Focus on empirical benchmarks, empathy, and disagree-and-commit culture.',
          expectedPoints: [
            'Situation & Task: Sets context of conflicting technical perspectives without emotional bias',
            'Action: Built quick proof-of-concept benchmarks and documented trade-offs objectively',
            'Result: Team aligned on data-driven decision with measurable production success',
            'Demonstrates leadership, mature communication, and commitment to shared team goals'
          ],
          followUpSuggestions: [
            'If the chosen approach had failed, how would you have handled the retrospective?',
            'How do you manage disagreements when there is no time for benchmarking?'
          ]
        }
      ]
    });

    console.log('🎙️ Creating Completed Interview Session & Transcript...');
    const completedSession = await InterviewSession.create({
      userId: demoUser._id,
      questionSetId: fullstackQuestionSet._id,
      title: 'Senior Fullstack Mock Interview #1',
      role: 'Senior Fullstack Engineer',
      difficulty: 'Senior',
      status: 'completed',
      currentQuestionIndex: 4,
      totalQuestions: 5,
      durationMinutes: 28,
      overallScore: 88,
      hiringVerdict: 'Strong Hire',
      overallSummary: 'Excellent communication and technical breadth. Candidate demonstrated deep mastery across Node.js asynchronous internals, CRDTs for real-time systems, and concurrent React rendering patterns.',
      startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 28 * 60 * 1000),
      messages: [
        {
          role: 'interviewer',
          content: 'Hello Alex! Welcome to your Senior Fullstack Technical Interview. I will be evaluating your systems knowledge, architectural reasoning, and communication.\n\nLet us begin with our first question:\n\n**Role-Specific Technical**: How does the Node.js Event Loop schedule asynchronous tasks across its phases? Specifically, how do microtasks (Promises, process.nextTick) interact with macrotasks (timers, I/O callbacks)?',
          questionId: 'q_fs_1',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
        {
          role: 'candidate',
          content: 'The Node.js event loop runs on top of libuv. While JS code executes on a single main thread, asynchronous I/O is offloaded to the OS kernel or libuv thread pool. The event loop is structured in phases: Timers (setTimeout, setInterval), Pending callbacks, Idle/Prepare, Poll (fetching new I/O events), Check (setImmediate), and Close callbacks. The crucial part is the microtask queue—which holds process.nextTick and resolved Promise callbacks. Unlike macrotasks which process one per tick in their phase, microtasks are drained completely whenever the call stack clears and between every phase transition. If you recursively schedule process.nextTick, you will starve the event loop.',
          questionId: 'q_fs_1',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 1000),
        },
        {
          role: 'interviewer',
          content: 'Spot on explanation! You clearly highlighted the microtask drain mechanism and the risk of event loop starvation.\n\nLet us move to Question 2:\n\n**System Design**: Design a distributed real-time collaborative document editor (like Google Docs or Notion). How would you handle concurrency conflicts, synchronize state over WebSockets, and ensure sub-50ms latency?',
          questionId: 'q_fs_2',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 6 * 60 * 1000),
        },
        {
          role: 'candidate',
          content: 'For a collaborative editor, handling concurrent edits without server-side blocking is paramount. I would adopt Conflict-free Replicated Data Types (CRDTs) like Yjs or Automerge over traditional Operational Transformation because CRDTs are commutative, allowing peers to merge edits in any order without a centralized transformation lock. The client connects via WebSockets to an edge-located Gateway cluster. The Gateway publishes change vectors onto a Redis Pub/Sub topic partitioned by document ID so all connected active collaborators receive deltas in real-time. For persistence, we append diff chunks to an append-only log and periodically take snapshots into PostgreSQL or S3 every 30 seconds.',
          questionId: 'q_fs_2',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 12 * 60 * 1000),
        },
        {
          role: 'interviewer',
          content: 'Impressive choice choosing CRDTs over centralized OT for distributed resilience, and your Redis fanout architecture is solid.\n\nQuestion 3:\n\n**DSA**: Given an array of meeting intervals [start, end], find the minimum number of conference rooms required.',
          questionId: 'q_fs_3',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000),
        },
        {
          role: 'candidate',
          content: 'We can solve Meeting Rooms II in O(N log N) time and O(N) space. We extract all start times into an array and all end times into another array, then sort both. We use two pointers, i for start times and j for end times. We iterate through start times: if starts[i] < ends[j], a meeting starts before the earliest running meeting ends, so we increment our roomCount. Otherwise, an existing meeting ended, so we increment j. We track max simultaneous rooms needed.',
          questionId: 'q_fs_3',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 19 * 60 * 1000),
        },
        {
          role: 'interviewer',
          content: 'Clean two-pointer sweep algorithm. It is space-efficient and covers all edge cases.\n\nQuestion 4:\n\n**Framework & Architecture**: In React 18, explain the architecture of Concurrent Rendering and Transitions (useTransition, useDeferredValue).',
          questionId: 'q_fs_4',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 21 * 60 * 1000),
        },
        {
          role: 'candidate',
          content: 'Before React 18, rendering was synchronous and un-interruptible; once rendering started, the main thread was blocked. Concurrent React introduces fiber time-slicing using the cooperative scheduler. React divides updates into discrete priority lanes. With useTransition, we wrap expensive state updates (like filtering a massive dataset), marking them as non-urgent. If the user types another character in an input field, React immediately interrupts the low-priority transition render, responds to the keystroke with zero input lag, and then resumes rendering the background list. useDeferredValue does something similar by returning a deferred copy of a value until the UI finishes caught up renders.',
          questionId: 'q_fs_4',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 25 * 60 * 1000),
        },
        {
          role: 'interviewer',
          content: 'Excellent depth on Fiber lanes and UI responsiveness.\n\nFinal Question:\n\n**Behavioral / HR**: Describe a situation where you had a major technical disagreement with a team member and how you resolved it.',
          questionId: 'q_fs_5',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 26 * 60 * 1000),
        },
        {
          role: 'candidate',
          content: 'At CloudScale, during a database re-architecture, our team was divided between using DynamoDB versus PostgreSQL with JSONB columns for our telemetry pipeline. Rather than debating theoretically, I scheduled a 3-day timeboxed spike. I created reproducible load tests simulating 20k writes/sec with realistic secondary index queries. The benchmarks showed Postgres handled our query filtering patterns with 30% lower cost and higher query flexibility, while DynamoDB required expensive global secondary indexes. I presented the metrics with zero ego, walked the team through the data, and everyone aligned on Postgres. The rollout completed smoothly with zero incidents.',
          questionId: 'q_fs_5',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 28 * 60 * 1000),
        }
      ]
    });

    console.log('📊 Creating Feedback Scorecard...');
    const feedback = await Feedback.create({
      sessionId: completedSession._id,
      userId: demoUser._id,
      overallScore: 88,
      hiringVerdict: 'Strong Hire',
      summaryFeedback: 'Alex demonstrated senior-level mastery across asynchronous event systems, distributed concurrency, and modern frontend reconciliation. Communication was crisp, structured, and backed by empirical reasoning.',
      radarScores: {
        dsa: 85,
        systemDesign: 90,
        roleTechnical: 92,
        behavioral: 88,
        communication: 86,
      },
      topStrengths: [
        'Deep mastery of libuv internals and microtask drain mechanics',
        'Strong architectural choice using CRDTs for real-time collaboration',
        'Empirical, data-driven STAR methodology when resolving engineering disputes'
      ],
      topImprovementAreas: [
        'Could discuss CRDT garbage collection / tombstone pruning in high-velocity editing',
        'Mention worker threads or off-main-thread offloading for heavy crypto/image ops in Node'
      ],
      questionFeedbacks: [
        {
          questionId: 'q_fs_1',
          questionText: 'How does the Node.js Event Loop schedule asynchronous tasks across its phases?',
          category: 'Role-Specific Technical',
          candidateAnswer: 'Candidate clearly explained libuv phases, threadpool offloading, and microtask vs macrotask execution order.',
          score: 92,
          categories: { correctness: 95, clarity: 92, structure: 90, confidence: 90 },
          strengths: ['Accurate explanation of microtask queue draining', 'Noted event loop starvation hazard'],
          weaknesses: ['Could mention setImmediate check phase priority specifics'],
          suggestion: 'Highlight performance monitoring tools like clinic.js or async_hooks.',
          modelAnswer: 'A senior answer defines the 6 libuv phases, contrasts nextTick priority with Promise microtasks, and discusses diagnostics.',
          keyTakeaways: ['Microtasks execute immediately after synchronous code']
        },
        {
          questionId: 'q_fs_2',
          questionText: 'Design a distributed real-time collaborative document editor.',
          category: 'System Design',
          candidateAnswer: 'Candidate selected CRDTs (Yjs) over OT, detailed WebSocket gateways, and Redis Pub/Sub room fanout.',
          score: 90,
          categories: { correctness: 92, clarity: 90, structure: 90, confidence: 88 },
          strengths: ['Modern choice of CRDTs for decentralized consistency', 'Clean WebSocket and Redis fanout architecture'],
          weaknesses: ['Could dive deeper into storage snapshot compression and tombstone purging'],
          suggestion: 'Include network disconnection and state sync reconnection handshake.',
          modelAnswer: 'Combines CRDTs, WebSocket edge termination, Redis Pub/Sub partition by docId, and periodic S3/DB snapshots.',
          keyTakeaways: ['CRDTs eliminate central lock contention in collaborative editors']
        },
        {
          questionId: 'q_fs_3',
          questionText: 'Find minimum number of conference rooms required (Meeting Rooms II).',
          category: 'DSA',
          candidateAnswer: 'Candidate proposed two-pointer chronological sweep in O(N log N) time and O(N) space.',
          score: 85,
          categories: { correctness: 88, clarity: 86, structure: 84, confidence: 84 },
          strengths: ['Optimal O(N log N) time complexity', 'Explained two-pointer index management clearly'],
          weaknesses: ['Did not write out the Min-Heap alternative'],
          suggestion: 'Mention Min-Heap approach as it naturally extends to returning specific room assignments.',
          modelAnswer: 'Sort starts and ends separately or insert into min-heap sorted by end time. Heap size represents required rooms.',
          keyTakeaways: ['Greedy chronological sweep handles interval concurrency efficiently']
        },
        {
          questionId: 'q_fs_4',
          questionText: 'In React 18, explain Concurrent Rendering and Transitions.',
          category: 'Framework & Architecture',
          candidateAnswer: 'Candidate detailed time-slicing fiber loop, priority lanes, and useTransition UX benefits.',
          score: 88,
          categories: { correctness: 90, clarity: 88, structure: 88, confidence: 88 },
          strengths: ['Clearly distinguished urgent vs transition updates', 'Articulated UI responsiveness benefits'],
          weaknesses: ['Could explain how Suspense integrates with concurrent transitions'],
          suggestion: 'Tie concurrent transitions back to bundle size and network waterfall reduction.',
          modelAnswer: 'React reconciler prioritizes user inputs via Lane bitmasks, interrupting transition renders to eliminate frame drops.',
          keyTakeaways: ['useTransition keeps the main thread responsive during heavy component recalculations']
        },
        {
          questionId: 'q_fs_5',
          questionText: 'Technical disagreement resolution in engineering teams.',
          category: 'Behavioral / HR',
          candidateAnswer: 'Candidate described running a 3-day load test spike between DynamoDB vs PostgreSQL to align the team.',
          score: 88,
          categories: { correctness: 88, clarity: 90, structure: 90, confidence: 86 },
          strengths: ['Used empirical benchmarking instead of opinion', 'Maintained team harmony with data-backed decisions'],
          weaknesses: ['Could mention how long-term maintainability was factored in'],
          suggestion: 'Summarize the post-decision outcome with quantifiable business metrics.',
          modelAnswer: 'Lead with empathy, separate ego from tech, implement timeboxed spikes with measurable criteria, and commit together.',
          keyTakeaways: ['Empirical spikes resolve engineering deadlocks faster than endless meetings']
        }
      ]
    });

    console.log('📈 Creating Analytics Snapshot...');
    await AnalyticsSnapshot.create({
      userId: demoUser._id,
      avgScore: 88,
      totalInterviews: 4,
      totalHoursMocked: 2.5,
      readinessIndex: 89,
      categoryScores: {
        dsa: 85,
        systemDesign: 90,
        roleTechnical: 92,
        behavioral: 88,
        communication: 86,
      },
      skillGaps: [
        {
          skill: 'Distributed Caching & CRDT Pruning',
          targetRoleRequirement: 90,
          demonstratedScore: 84,
          gapLevel: 'Low',
          recommendation: 'Review tombstone cleanup protocols and multi-region Redis sentinel failovers.',
          learningLink: 'https://github.com/donnemartin/system-design-primer',
        },
        {
          skill: 'Advanced Dynamic Programming (DSA)',
          targetRoleRequirement: 85,
          demonstratedScore: 80,
          gapLevel: 'Moderate',
          recommendation: 'Practice 2D DP memoization and multi-dimensional knapsack variants.',
          learningLink: 'https://neetcode.io/practice',
        },
        {
          skill: 'Node.js & React Core Architecture',
          targetRoleRequirement: 90,
          demonstratedScore: 92,
          gapLevel: 'Mastered',
          recommendation: 'Exceptional competency demonstrated across fiber reconciliation and event loop phases.',
          learningLink: 'https://react.dev',
        },
        {
          skill: 'Behavioral Leadership (STAR)',
          targetRoleRequirement: 85,
          demonstratedScore: 88,
          gapLevel: 'Mastered',
          recommendation: 'Consistently articulate quantitative business outcomes and blameless post-mortems.',
          learningLink: '#',
        }
      ],
      trends: [
        { date: 'Aug 10', sessionTitle: 'Frontend & React Core', score: 78, role: 'Senior Fullstack Engineer', dsaScore: 72, systemDesignScore: 75, techScore: 84, behavioralScore: 80 },
        { date: 'Aug 16', sessionTitle: 'System Design & Distributed Data', score: 84, role: 'Senior Fullstack Engineer', dsaScore: 78, systemDesignScore: 86, techScore: 88, behavioralScore: 84 },
        { date: 'Aug 22', sessionTitle: 'DSA & Algorithms Sprint', score: 85, role: 'Senior Fullstack Engineer', dsaScore: 84, systemDesignScore: 86, techScore: 88, behavioralScore: 85 },
        { date: 'Aug 28', sessionTitle: 'Full Senior Onsite Mock', score: 88, role: 'Senior Fullstack Engineer', dsaScore: 85, systemDesignScore: 90, techScore: 92, behavioralScore: 88 },
      ],
      recommendedResources: [
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
        }
      ]
    });

    console.log('✅ Database seeded successfully!');
    console.log('🔑 Demo User Credentials:');
    console.log('   Email: demo@interviewai.com');
    console.log('   Password: password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seed();
