import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Bot,
  FileText,
  Video,
  BarChart3,
  Award,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Flame,
  Zap,
} from 'lucide-react';

const LandingPage = () => {
  const { loginDemo, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleDemoLogin = async () => {
    try {
      await loginDemo();
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      navigate('/login');
    }
  };

  return (
    <div className="relative overflow-hidden pt-6 pb-20">
      {/* Background glowing gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/15 blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-12 pb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Full-Stack AI Mock Interviews with OpenAI GPT-4o</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
          Ace Technical & Behavioral Interviews with{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400">
            Real-Time AI
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Upload your resume, generate personalized interview questions tailored to your exact skills, practice in interactive voice-enabled mock sessions, and receive comprehensive rubric-based grading.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-105"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <button
                onClick={handleDemoLogin}
                className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:opacity-95 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-105"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>Instant Demo Login (1-Click)</span>
              </button>

              <Link
                to="/signup"
                className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-slate-200 bg-surface-card hover:bg-slate-800 border border-surface-border rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <span>Create Free Account</span>
              </Link>
            </>
          )}
        </div>

        {/* Quick Trust badges */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>PDF & DOCX Resume Parsing</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>DSA, System Design & STAR Behavioral</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
            <span>Speech-to-Text Voice Practice</span>
          </div>
        </div>
      </section>

      {/* Interactive Mock Interview Preview Card */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-20">
        <div className="rounded-2xl bg-surface-card border border-surface-border p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Bot className="w-48 h-48 text-indigo-400" />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-surface-border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base sm:text-lg">AI Senior Technical Interviewer</h3>
                <p className="text-xs text-slate-400">Target Role: Senior Fullstack Engineer • Difficulty: Senior</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Session Simulation
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {/* Interviewer message */}
            <div className="flex gap-3 max-w-2xl">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-1">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl rounded-tl-sm bg-surface/90 border border-surface-border text-sm text-slate-200 leading-relaxed">
                <p className="font-semibold text-indigo-400 text-xs mb-1">Interviewer (Question 1 of 5)</p>
                How does the Node.js Event Loop schedule asynchronous tasks across its phases? Specifically, how do microtasks (Promises, process.nextTick) interact with macrotasks (timers, I/O callbacks)?
              </div>
            </div>

            {/* Candidate response */}
            <div className="flex gap-3 max-w-2xl ml-auto justify-end">
              <div className="p-4 rounded-2xl rounded-tr-sm bg-indigo-600/20 border border-indigo-500/40 text-sm text-slate-100 leading-relaxed">
                <p className="font-semibold text-cyan-400 text-xs mb-1">Candidate Answer (Voice Input Transcribed)</p>
                The event loop runs on libuv. Microtasks (process.nextTick, resolved Promises) drain completely after each synchronous operation and between every phase transition (Timers, Poll, Check). This means recursive nextTick calls can starve macrotask I/O.
              </div>
            </div>

            {/* AI Evaluator Feedback summary */}
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-3 mt-4">
              <Award className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-emerald-300 uppercase tracking-wide">
                  Instant Rubric Evaluation • Score: 92/100 (Strong Hire)
                </p>
                <p className="text-xs text-slate-300 mt-1">
                  Accurate articulation of microtask drain priority and call stack starvation risks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Everything You Need to Secure Your Dream Role
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-xl mx-auto">
            From resume analysis to full simulation reports, master each stage of the technical hiring loop.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-surface-card border border-surface-border hover:border-indigo-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-white text-base">1. Resume NLP Parsing</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Upload PDF/DOCX to extract skills, seniority level, past accomplishments, and identify target role benchmarks.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface-card border border-surface-border hover:border-cyan-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Cpu className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-white text-base">2. Personalized Questions</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Generates tailored question banks spanning DSA, Distributed System Design, framework internals, and STAR Behavioral questions.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface-card border border-surface-border hover:border-emerald-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Video className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-white text-base">3. Conversational Mock Room</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Engage in interactive dialogue with adaptive AI follow-ups, audio visualizers, and speech-to-text voice recognition.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface-card border border-surface-border hover:border-purple-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-white text-base">4. Analytics & Skill Gaps</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Track performance velocity, discover exact knowledge gaps against market requirements, and get targeted roadmaps.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
