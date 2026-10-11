import React from 'react';

const LoadingSkeleton = ({ count = 3, height = 'h-24' }) => {
  return (
    <div className="space-y-4 w-full animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`w-full ${height} rounded-xl bg-surface-card/60 border border-surface-border/60`}
        />
      ))}
    </div>
  );
};

export default LoadingSkeleton;
