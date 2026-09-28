import React from 'react';

export function ProductSkeletonLoader({ count = 6 }) {
  return (
    <div className="masonry-grid pb-12">
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className="glass-card rounded-3xl overflow-hidden flex flex-col justify-between h-[340px] animate-pulse"
        >
          {/* Top image placeholder */}
          <div className="h-48 w-full bg-slate-200/60 dark:bg-slate-800/60" />
          
          {/* Content body placeholder */}
          <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="h-4 bg-slate-200/80 dark:bg-slate-800/80 rounded-md w-3/4" />
              <div className="h-3 bg-slate-200/50 dark:bg-slate-800/50 rounded-md w-full" />
              <div className="h-3 bg-slate-200/50 dark:bg-slate-800/50 rounded-md w-1/2" />
            </div>
            
            <div className="pt-3 border-t border-slate-200/40 dark:border-white/5 flex items-center justify-between">
              <div className="h-5 bg-slate-200/80 dark:bg-slate-800/80 rounded-md w-16" />
              <div className="h-4 bg-slate-200/60 dark:bg-slate-800/60 rounded-md w-12" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function PageTransitionLoader() {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/10 dark:bg-slate-950/20 backdrop-blur-sm flex items-center justify-center pointer-events-none">
      <div className="glass-modal p-5 rounded-3xl flex items-center gap-3 shadow-2xl animate-in zoom-in-95">
        <div className="w-6 h-6 border-2 border-[var(--apple-blue)] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Loading KollectoP2P...</span>
      </div>
    </div>
  );
}
