import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { analyticsApi, interviewApi } from '../services/api';
import StatCard from '../components/StatCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import {
  Award,
  Video,
  FileText,
  HelpCircle,
  BarChart3,
  TrendingUp,
  Target,
  ArrowRight,
  Clock,
  Sparkles,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

const DashboardPage = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [analyticsRes, sessionsRes] = await Promise.all([
          analyticsApi.getAnalytics(),
          interviewApi.getSessions(),
        ]);

        setAnalytics(analyticsRes.data.analytics);
        setRecentSessions(sessionsRes.data.sessions || []);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <LoadingSkeleton count={4} height="h-28" />
        <LoadingSkeleton count={2} height="h-64" />
      </div>
    );
  }

  const radarData = analytics?.categoryScores ? [
    { subject: 'DSA', score: analytics.categoryScores.dsa || 75, fullMark: 100 },
    { subject: 'System Design', score: analytics.categoryScores.systemDesign || 75, fullMark: 100 },
    { subject: 'Role Technical', score: analytics.categoryScores.roleTechnical || 80, fullMark: 100 },
    { subject: 'Behavioral / STAR', score: analytics.categoryScores.behavioral || 82, fullMark: 100 },
    { subject: 'Communication', score: analytics.categoryScores.communication || 80, fullMark: 100 },
  ] : [];

  const trendData = analytics?.trends?.length > 0
    ? analytics.trends
    : [
        { date: 'Session 1', score: 70 },
        { date: 'Session 2', score: 78 },
        { date: 'Session 3', score: 84 },
        { date: 'Session 4', score: 88 },
      ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Welcome Banner with Readiness Index */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950/80 via-surface-card to-surface-card border border-indigo-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Interview Readiness Overview</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome back, {user?.name || 'Engineer'}!
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              You are targeting the <strong className="text-indigo-300 font-semibold">{user?.targetRole}</strong> role ({user?.experienceLevel}). Your AI interview metrics show steady competency across algorithms and system design.
            </p>

            <div className="pt-3 flex flex-wrap gap-3">
              <Link
                to="/interview/new"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-sm font-semibold shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-105"
              >
                <Video className="w-4 h-4" />
                <span>Launch Mock Interview</span>
              </Link>
              <Link
                to="/resume"
                className="px-4 py-2.5 rounded-xl bg-surface hover:bg-slate-800 border border-surface-border text-slate-200 text-sm font-semibold flex items-center gap-2 transition-all"
              >
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>Update Resume / Skills</span>
              </Link>
            </div>
          </div>

          {/* Readiness Index Gauge Card */}
          <div className="w-full lg:w-auto shrink-0 p-5 rounded-2xl bg-surface/90 border border-surface-border flex items-center gap-5 shadow-xl">
            <div className="relative flex items-center justify-center">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#1e293b"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="url(#gradientStroke)"
                  strokeWidth="8"
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 - (251.2 * (analytics?.readinessIndex || 85)) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="gradientStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="50%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute text-center">
                <span className="text-2xl font-extrabold text-white">{analytics?.readinessIndex || 85}%</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Readiness Score</p>
              <p className="text-sm font-bold text-emerald-400 mt-0.5">
                {analytics?.readinessIndex >= 85 ? 'Highly Prepared' : 'On Track'}
              </p>
              <p className="text-xs text-slate-400 mt-1">Based on {analytics?.totalInterviews || 3} mock interviews</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Average Score"
          value={`${analytics?.avgScore || 85}/100`}
          subtitle="Across all evaluations"
          icon={Award}
          change="+6% from baseline"
          trend="up"
          color="indigo"
        />
        <StatCard
          title="Mock Interviews"
          value={analytics?.totalInterviews || 4}
          subtitle="Full simulations finished"
          icon={Video}
          color="cyan"
        />
        <StatCard
          title="Practice Time"
          value={`${analytics?.totalHoursMocked || 2.5} hrs`}
          subtitle="Total conversation time"
          icon={Clock}
          color="emerald"
        />
        <StatCard
          title="Identified Gaps"
          value={analytics?.skillGaps?.filter((g) => g.gapLevel !== 'Mastered').length || 2}
          subtitle="Target improvement areas"
          icon={AlertTriangle}
          color="amber"
        />
      </div>

      {/* Charts Section: Performance Trend & Competency Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart (2 cols on lg) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-surface-card border border-surface-border shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
                <span>Performance Score Velocity</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Historical trend across mock interview sessions</p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Goal: 85+ Target
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis domain={[50, 100]} stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111726',
                    borderColor: '#222f4c',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#scoreArea)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Competency Radar Chart (1 col on lg) */}
        <div className="p-6 rounded-2xl bg-surface-card border border-surface-border shadow-xl">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              <span>Skill Competency Radar</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Strength across core hiring criteria</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="70%">
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={10} />
                <PolarRadiusAxis domain={[0, 100]} stroke="#475569" fontSize={8} />
                <Radar
                  name="Proficiency"
                  dataKey="score"
                  stroke="#06b6d4"
                  fill="#06b6d4"
                  fillOpacity={0.35}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Interview Sessions & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Mock Sessions (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-surface-card border border-surface-border shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Recent Mock Interviews</h3>
              <p className="text-xs text-slate-400">Review transcripts and rubric grading</p>
            </div>
            <Link
              to="/history"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {recentSessions.length === 0 ? (
            <div className="text-center py-10 rounded-xl bg-surface/50 border border-dashed border-surface-border">
              <Video className="w-10 h-10 text-slate-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">No mock interviews completed yet</p>
              <p className="text-xs text-slate-400 mt-1">Start your first AI mock session to receive feedback!</p>
              <Link
                to="/interview/new"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                <span>Start First Mock Session</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSessions.slice(0, 4).map((session) => (
                <div
                  key={session._id}
                  className="p-4 rounded-xl bg-surface/70 border border-surface-border hover:border-indigo-500/30 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-white">{session.title || 'Mock Technical Interview'}</span>
                      {session.hiringVerdict && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            session.hiringVerdict.includes('Strong')
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : session.hiringVerdict === 'Hire'
                              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {session.hiringVerdict}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      {new Date(session.startedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}{' '}
                      • {session.durationMinutes || 25} min • {session.role}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    {session.overallScore && (
                      <div className="text-right">
                        <span className="text-base font-bold text-white">{session.overallScore}</span>
                        <span className="text-xs text-slate-400">/100</span>
                      </div>
                    )}
                    <Link
                      to={`/feedback/${session._id}`}
                      className="px-3 py-1.5 rounded-lg bg-surface-card hover:bg-slate-800 border border-surface-border text-xs font-semibold text-indigo-400 hover:text-white transition-colors"
                    >
                      Report →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Priority Skill Gaps & Action Items (1 col) */}
        <div className="p-6 rounded-2xl bg-surface-card border border-surface-border shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-amber-400" />
              <span>Skill Gaps & Actions</span>
            </h3>
            <p className="text-xs text-slate-400">Target areas to maximize hiring odds</p>
          </div>

          <div className="space-y-3">
            {analytics?.skillGaps?.slice(0, 3).map((gap, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-surface/80 border border-surface-border space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{gap.skill}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      gap.gapLevel === 'High'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        : gap.gapLevel === 'Moderate'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {gap.gapLevel}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">{gap.recommendation}</p>
                {gap.learningLink && gap.learningLink !== '#' && (
                  <a
                    href={gap.learningLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-cyan-400 hover:underline font-medium inline-block mt-0.5"
                  >
                    Study Guide →
                  </a>
                )}
              </div>
            ))}
          </div>

          <Link
            to="/analytics"
            className="w-full py-2.5 rounded-xl bg-surface-card hover:bg-slate-800 border border-surface-border text-center text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Explore All Recommended Paths</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
