import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { interviewApi } from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import {
  History,
  Video,
  Award,
  Clock,
  ChevronRight,
  Sparkles,
  Search,
  Filter,
} from 'lucide-react';

const HistoryPage = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await interviewApi.getSessions();
      setSessions(res.data.sessions || []);
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <LoadingSkeleton count={4} height="h-24" />
      </div>
    );
  }

  const filteredSessions = sessions.filter((s) => {
    const matchesSearch =
      (s.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.role || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || s.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const uniqueRoles = Array.from(new Set(sessions.map((s) => s.role).filter(Boolean)));

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Session Logs</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Mock Interview Archive</h1>
          <p className="text-sm text-slate-400 mt-1">
            Review past mock interview transcripts, evaluator scores, and progress history.
          </p>
        </div>

        <Link
          to="/interview/new"
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 flex items-center gap-2 transition-all self-start sm:self-center"
        >
          <Video className="w-4 h-4" />
          <span>New Mock Session</span>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-surface-card border border-surface-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search interviews..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface border border-surface-border text-xs text-white placeholder-slate-500 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 rounded-xl bg-surface border border-surface-border text-xs text-white focus:border-indigo-500 w-full sm:w-auto"
          >
            <option value="all">All Roles</option>
            {uniqueRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-3">
        {filteredSessions.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-surface-card border border-surface-border space-y-3">
            <History className="w-12 h-12 text-slate-500 mx-auto" />
            <h3 className="text-base font-bold text-white">No Mock Interviews Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Launch your first AI mock interview room to start building your track record!
            </p>
          </div>
        ) : (
          filteredSessions.map((session) => (
            <div
              key={session._id}
              className="p-5 rounded-2xl bg-surface-card border border-surface-border hover:border-indigo-500/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="font-bold text-base text-white">{session.title || 'Mock Technical Interview'}</h3>
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    {session.role}
                  </span>
                  {session.hiringVerdict && (
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
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

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{session.durationMinutes || 25} mins</span>
                  </span>
                  <span>•</span>
                  <span>{session.messages?.length || 0} messages</span>
                  <span>•</span>
                  <span>
                    {new Date(session.startedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                {session.overallScore !== null && session.overallScore !== undefined && (
                  <div className="text-right">
                    <span className="text-xl font-extrabold text-white">{session.overallScore}</span>
                    <span className="text-xs text-slate-400">/100</span>
                  </div>
                )}

                <Link
                  to={`/feedback/${session._id}`}
                  className="px-4 py-2 rounded-xl bg-surface hover:bg-slate-800 border border-surface-border text-xs font-semibold text-indigo-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <span>Scorecard</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
