import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, change, trend = 'up', color = 'indigo' }) => {
  const getColorScheme = () => {
    switch (color) {
      case 'emerald':
        return {
          iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          badge: 'text-emerald-400 bg-emerald-500/10',
          border: 'hover:border-emerald-500/30',
        };
      case 'cyan':
        return {
          iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
          badge: 'text-cyan-400 bg-cyan-500/10',
          border: 'hover:border-cyan-500/30',
        };
      case 'amber':
        return {
          iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          badge: 'text-amber-400 bg-amber-500/10',
          border: 'hover:border-amber-500/30',
        };
      case 'purple':
        return {
          iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
          badge: 'text-purple-400 bg-purple-500/10',
          border: 'hover:border-purple-500/30',
        };
      case 'indigo':
      default:
        return {
          iconBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
          badge: 'text-indigo-400 bg-indigo-500/10',
          border: 'hover:border-indigo-500/30',
        };
    }
  };

  const scheme = getColorScheme();

  return (
    <div className={`p-5 rounded-2xl bg-surface-card/80 border border-surface-border transition-all duration-300 hover:shadow-xl ${scheme.border}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-xl border ${scheme.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-white">{value}</span>
        {change && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${scheme.badge}`}>
            {trend === 'up' ? '↑' : '↓'} {change}
          </span>
        )}
      </div>

      {subtitle && <p className="mt-1.5 text-xs text-slate-400">{subtitle}</p>}
    </div>
  );
};

export default StatCard;
