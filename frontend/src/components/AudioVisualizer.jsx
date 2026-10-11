import React from 'react';

const AudioVisualizer = ({ isActive = false, color = 'indigo', barCount = 18 }) => {
  const bars = Array.from({ length: barCount }, (_, i) => i);

  const getColorClasses = () => {
    switch (color) {
      case 'cyan':
        return 'bg-gradient-to-t from-cyan-500 to-cyan-300';
      case 'emerald':
        return 'bg-gradient-to-t from-emerald-500 to-emerald-300';
      case 'rose':
        return 'bg-gradient-to-t from-rose-500 to-rose-300';
      case 'indigo':
      default:
        return 'bg-gradient-to-t from-indigo-500 via-indigo-400 to-cyan-400';
    }
  };

  return (
    <div className="flex items-center justify-center gap-1 h-8 px-3 py-1">
      {bars.map((idx) => {
        // Vary heights and animation durations for realistic sound wave appearance
        const animDuration = `${0.6 + (idx % 5) * 0.2}s`;
        const animDelay = `${(idx % 6) * 0.1}s`;
        
        return (
          <span
            key={idx}
            className={`w-1 rounded-full transition-all ${getColorClasses()}`}
            style={{
              height: isActive ? `${Math.floor(10 + Math.sin(idx) * 14 + 10)}px` : '4px',
              animation: isActive ? `wave ${animDuration} ease-in-out infinite alternate ${animDelay}` : 'none',
              opacity: isActive ? 0.9 : 0.3,
            }}
          />
        );
      })}
    </div>
  );
};

export default AudioVisualizer;
