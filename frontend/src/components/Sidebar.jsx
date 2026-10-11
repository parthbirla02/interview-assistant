import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  HelpCircle,
  Video,
  BarChart3,
  History,
  Target,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/resume', label: 'Resume & Skills', icon: FileText, badge: 'AI Extracted' },
    { to: '/questions', label: 'Question Bank', icon: HelpCircle },
    { to: '/interview/new', label: 'Mock Interview Room', icon: Video, highlight: true },
    { to: '/analytics', label: 'Analytics & Skill Gaps', icon: BarChart3 },
    { to: '/history', label: 'Session Archive', icon: History },
  ];

  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col border-r border-surface-border bg-surface/50 p-4 justify-between min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        {/* User Quick Info */}
        <div className="p-3.5 rounded-xl bg-surface-card/70 border border-surface-border/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center font-bold text-white shadow-md">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-200 truncate">{user?.name || 'Candidate'}</p>
              <div className="flex items-center gap-1.5 mt-0.5 text-xs text-indigo-400">
                <Target className="w-3.5 h-3.5" />
                <span className="truncate">{user?.experienceLevel || 'Mid-Level'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          <p className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-2">
            Main Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? item.highlight
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30 font-semibold'
                        : 'bg-surface-card text-indigo-400 border border-indigo-500/20 font-semibold'
                      : item.highlight
                      ? 'text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    {item.badge}
                  </span>
                )}
                {item.highlight && !item.badge && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Pro Badge / System Status */}
      <div className="p-3.5 rounded-xl bg-gradient-to-b from-indigo-950/40 to-surface-card border border-indigo-500/20 space-y-2">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>OpenAI GPT-4o Evaluator</span>
        </div>
        <p className="text-xs text-slate-400">
          Realistic rubric grading: Correctness, Clarity, Structure & STAR framework.
        </p>
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 pt-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Active & Ready</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
