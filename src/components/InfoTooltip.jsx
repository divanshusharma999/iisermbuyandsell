import React, { useState } from 'react';
import { Info } from 'lucide-react';

export default function InfoTooltip({ text, position = 'top', className = '' }) {
  const [isOpen, setIsOpen] = useState(false);

  const positionClasses = {
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2'
  };

  return (
    <span className={`relative inline-flex items-center align-middle ml-1.5 ${className}`}>
      <button
        type="button"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        aria-label="More information"
        className="text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 focus:text-emerald-500 transition-colors p-0.5 rounded-full hover:bg-emerald-50 dark:hover:bg-slate-800/80 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
      >
        <Info className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div
          className={`absolute z-50 w-56 p-2.5 text-xs leading-relaxed text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700/80 rounded-xl shadow-2xl backdrop-blur-md tooltip-popover pointer-events-none ${positionClasses[position]}`}
          role="tooltip"
        >
          <div className="font-extrabold text-emerald-600 dark:text-emerald-400 mb-0.5 flex items-center gap-1">
            <Info className="w-3 h-3 inline" /> Feature Info
          </div>
          <p className="text-slate-600 dark:text-slate-300 font-normal">{text}</p>
        </div>
      )}
    </span>
  );
}
