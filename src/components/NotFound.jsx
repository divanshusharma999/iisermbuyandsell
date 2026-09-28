import React from 'react';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

export default function NotFound({ onGoHome }) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="glass-modal rounded-3xl p-8 sm:p-12 text-center max-w-lg w-full shadow-2xl animate-in zoom-in-95">
        <div className="w-20 h-20 bg-slate-100/60 dark:bg-slate-800/60 rounded-3xl flex items-center justify-center mx-auto mb-5 text-[var(--apple-blue)] border border-slate-200/50 dark:border-white/10 shadow-inner">
          <FileQuestion className="w-10 h-10" />
        </div>
        
        <span className="px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider glass-badge rounded-full text-[var(--apple-blue)] mb-2 inline-block">
          Error 404
        </span>
        
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Page Not Found
        </h2>
        
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
          The page or item listing you are looking for does not exist on IISER Mohali KollectoP2P or has been auto-removed after its 21-day bulletin timer.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={onGoHome}
            className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm shadow-lg"
          >
            <Home className="w-4 h-4" />
            <span>Return to Campus Feed</span>
          </button>
        </div>
      </div>
    </div>
  );
}
