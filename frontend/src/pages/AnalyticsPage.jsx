import React, { useEffect, useState } from 'react';
import { analyticsApi } from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import {
  BarChart3,
  TrendingUp,
  Target,
  BookOpen,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Award,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await analyticsApi.getAnalytics();
      setAnalytics(res.data.analytics);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const res = await analyticsApi.refresh();
      setAnalytics(res.data.analytics);
    } catch (err) {
      console.error('Refresh failed:', err);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <LoadingSkeleton count={3} height="h-44" />
      </div>
    );
  }

  const trendData = analytics?.trends || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Telemetry & Skill Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Analytics & Skill Gap Analysis</h1>
          <p className="text-sm text-slate-400 mt-1">
            Track interview performance velocity and close knowledge gaps with curated learning paths.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 rounded-xl bg-surface hover:bg-slate-800 border border-surface-border text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-all self-start sm:self-center"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Score Trends & Category Multi-bar chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Area Chart */}
        <div className="p-6 rounded-2xl bg-surface-card border border-surface-border shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <span>Overall Score Trajectory</span>
            </h3>
            <p className="text-xs text-slate-400">Progression across mock interview sessions</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis domain={[50, 100]} stroke="#64748b" fontSize={11} />
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
                  fill="#6366f1"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Bar Chart */}
        <div className="p-6 rounded-2xl bg-surface-card border border-surface-border shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              <span>Category Performance Breakdown</span>
            </h3>
            <p className="text-xs text-slate-400">DSA vs System Design vs Tech vs Behavioral</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111726',
                    borderColor: '#222f4c',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="dsaScore" name="DSA" fill="#818cf8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="systemDesignScore" name="System Design" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="behavioralScore" name="Behavioral" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Skill Gap Matrix */}
      <div className="p-6 sm:p-8 rounded-2xl bg-surface-card border border-surface-border space-y-6 shadow-xl">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-400" />
            <span>Target Role Skill Gap Matrix</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Comparing industry market requirements against your demonstrated performance.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-surface/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-surface-border">
              <tr>
                <th className="py-3 px-4">Skill Domain</th>
                <th className="py-3 px-4">Target Requirement</th>
                <th className="py-3 px-4">Demonstrated</th>
                <th className="py-3 px-4">Gap Status</th>
                <th className="py-3 px-4">Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/60">
              {analytics?.skillGaps?.map((gap, i) => (
                <tr key={i} className="hover:bg-surface/40 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white">{gap.skill}</td>
                  <td className="py-3.5 px-4 text-slate-400">{gap.targetRoleRequirement}%</td>
                  <td className="py-3.5 px-4 font-bold text-indigo-300">{gap.demonstratedScore}%</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                        gap.gapLevel === 'High'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          : gap.gapLevel === 'Moderate'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {gap.gapLevel}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 max-w-xs">{gap.recommendation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommended Learning Resources */}
      <div className="p-6 sm:p-8 rounded-2xl bg-surface-card border border-surface-border space-y-6 shadow-xl">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <span>Targeted Learning & Practice Roadmaps</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Curated resources specifically mapped to accelerate your interview preparation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analytics?.recommendedResources?.map((res, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-surface/70 border border-surface-border hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">
                    {res.type}
                  </span>
                  <span className="text-[10px] text-slate-400">{res.estimatedHours} hrs</span>
                </div>
                <h4 className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors">
                  {res.title}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">{res.description}</p>
              </div>

              {res.url && res.url !== '#' && (
                <a
                  href={res.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 group-hover:underline pt-2 border-t border-surface-border"
                >
                  <span>Open Resource</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
