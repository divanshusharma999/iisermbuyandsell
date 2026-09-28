import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function ToastNotification({ toast, onClose }) {
  if (!toast) return null;

  const isError = toast.type === 'error';
  const isSuccess = toast.type === 'success';

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300 max-w-sm w-full px-4">
      <div className={`glass-modal p-4 rounded-2xl flex items-center gap-3 shadow-2xl border ${
        isError 
          ? 'border-rose-500/40 text-rose-700 dark:text-rose-300' 
          : isSuccess 
          ? 'border-emerald-500/40 text-emerald-700 dark:text-emerald-300' 
          : 'border-slate-200/60 dark:border-white/10 text-slate-800 dark:text-slate-200'
      }`}>
        {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
        {isError && <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />}
        {!isSuccess && !isError && <Info className="w-5 h-5 text-sky-500 shrink-0" />}
        
        <p className="text-xs font-bold flex-1 leading-snug">{toast.message}</p>
        
        <button 
          onClick={onClose} 
          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
