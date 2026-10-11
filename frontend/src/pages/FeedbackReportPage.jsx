import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { feedbackApi } from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import confetti from 'canvas-confetti';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  ArrowRight,
  TrendingUp,
  FileText,
  RotateCcw,
  Sparkles,
  BarChart3,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';

const FeedbackReportPage = () => {
  const { sessionId } = useParams();
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedQuestions, setExpandedQuestions] = useState({});

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        const res = await feedbackApi.getBySessionId(sessionId);
        setFeedback(res.data.feedback);

        // Expand first question by default
        if (res.data.feedback?.questionFeedbacks?.length > 0) {
          setExpandedQuestions({ 0: true });
        }

        // Trigger confetti celebration if score is high
        if (res.data.feedback?.overallScore >= 80) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      } catch (err) {
        console.error('Failed to load feedback:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [sessionId]);

  const toggleQuestionExpand = (idx) => {
    setExpandedQuestions((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <LoadingSkeleton count={2} height="h-44" />
        <LoadingSkeleton count={3} height="h-32" />
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="p-12 max-w-2xl mx-auto text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Feedback Report Not Found</h2>
        <p className="text-sm text-slate-400">
          This interview session does not have a generated feedback scorecard yet.
        </p>
        <Link
          to="/dashboard"
          className="inline-block px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const radarData = [
    { subject: 'DSA', score: feedback.radarScores?.dsa || 80, fullMark: 100 },
    { subject: 'System Design', score: feedback.radarScores?.systemDesign || 82, fullMark: 100 },
    { subject: 'Role Technical', score: feedback.radarScores?.roleTechnical || 85, fullMark: 100 },
    { subject: 'Behavioral / STAR', score: feedback.radarScores?.behavioral || 88, fullMark: 100 },
    { subject: 'Communication', score: feedback.radarScores?.communication || 82, fullMark: 100 },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950/90 via-surface-card to-surface-card border border-indigo-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Interview Performance Report</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Evaluation Scorecard</h1>
            <p className="text-sm text-slate-300 leading-relaxed">{feedback.summaryFeedback}</p>

            <div className="pt-2 flex items-center gap-3">
              <Link
                to="/interview/new"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Practice Another Session</span>
              </Link>
              <Link
                to="/analytics"
                className="px-4 py-2 rounded-xl bg-surface hover:bg-slate-800 border border-surface-border text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
                <span>View Analytics</span>
              </Link>
            </div>
          </div>

          {/* Hiring Verdict Score Badge */}
          <div className="shrink-0 p-6 rounded-2xl bg-surface/90 border border-surface-border text-center shadow-xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Overall Score
            </span>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400">
                {feedback.overallScore}
              </span>
              <span className="text-slate-400 font-semibold text-sm">/100</span>
            </div>
            <span
              className={`inline-block text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                feedback.hiringVerdict === 'Strong Hire'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : feedback.hiringVerdict === 'Hire'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              }`}
            >
              {feedback.hiringVerdict}
            </span>
          </div>
        </div>
      </div>

      {/* Top Strengths & Improvement Areas + Radar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Strengths & Improvement lists (2 cols on lg) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Strengths */}
          <div className="p-6 rounded-2xl bg-surface-card border border-surface-border space-y-3 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Demonstrated Strengths</span>
            </h3>
            <ul className="space-y-2">
              {feedback.topStrengths?.map((str, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Improvement Areas */}
          <div className="p-6 rounded-2xl bg-surface-card border border-surface-border space-y-3 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Key Areas for Improvement</span>
            </h3>
            <ul className="space-y-2">
              {feedback.topImprovementAreas?.map((imp, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <span>{imp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Radar Chart (1 col on lg) */}
        <div className="p-6 rounded-2xl bg-surface-card border border-surface-border shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span>Skill Radar Breakdown</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Scoring across core evaluation pillars</p>
          </div>

          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="70%">
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={9} />
                <PolarRadiusAxis domain={[0, 100]} stroke="#475569" fontSize={8} />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Question-by-Question Deep Dive Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <span>Question-by-Question Breakdown</span>
          </h2>
          <span className="text-xs text-slate-400">
            {feedback.questionFeedbacks?.length || 0} Questions Evaluated
          </span>
        </div>

        <div className="space-y-4">
          {feedback.questionFeedbacks?.map((qf, idx) => {
            const isExpanded = expandedQuestions[idx];
            return (
              <div
                key={qf.questionId || idx}
                className="rounded-2xl bg-surface-card border border-surface-border overflow-hidden shadow-lg"
              >
                {/* Header Row */}
                <div
                  onClick={() => toggleQuestionExpand(idx)}
                  className="p-5 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface/60 hover:bg-surface transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="w-6 h-6 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wide">
                        {qf.category}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-white pt-1">{qf.questionText}</p>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="text-right">
                      <span className="text-base font-extrabold text-white">{qf.score}</span>
                      <span className="text-xs text-slate-400">/100</span>
                    </div>
                    <div className="p-1 text-slate-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-5 border-t border-surface-border space-y-4 bg-surface/30">
                    {/* Rubric metrics row */}
                    {qf.categories && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div className="p-2.5 rounded-xl bg-surface border border-surface-border text-center">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">Correctness</span>
                          <p className="text-sm font-bold text-white mt-0.5">{qf.categories.correctness}%</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-surface border border-surface-border text-center">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">Clarity</span>
                          <p className="text-sm font-bold text-white mt-0.5">{qf.categories.clarity}%</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-surface border border-surface-border text-center">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">Structure</span>
                          <p className="text-sm font-bold text-white mt-0.5">{qf.categories.structure}%</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-surface border border-surface-border text-center">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">Confidence</span>
                          <p className="text-sm font-bold text-white mt-0.5">{qf.categories.confidence}%</p>
                        </div>
                      </div>
                    )}

                    {/* Candidate Answer Transcript */}
                    {qf.candidateAnswer && (
                      <div className="p-3.5 rounded-xl bg-surface border border-surface-border space-y-1">
                        <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wide">
                          Your Answer Summary
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed">{qf.candidateAnswer}</p>
                      </div>
                    )}

                    {/* Actionable Suggestion */}
                    {qf.suggestion && (
                      <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-start gap-2.5">
                        <Lightbulb className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-xs font-bold text-cyan-300">Actionable Coaching: </strong>
                          <span className="text-xs text-slate-200">{qf.suggestion}</span>
                        </div>
                      </div>
                    )}

                    {/* Model Answer */}
                    {qf.modelAnswer && (
                      <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wide">
                          <Award className="w-4 h-4" />
                          <span>Ideal Senior-Level Model Answer</span>
                        </div>
                        <p className="text-xs text-slate-200 whitespace-pre-line leading-relaxed">
                          {qf.modelAnswer}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FeedbackReportPage;
