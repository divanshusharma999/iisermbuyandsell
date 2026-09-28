import React, { useState } from 'react';
import { PlusCircle, LayoutDashboard, ShieldCheck, User, LogOut, ChevronDown, Sparkles, Sun, Moon } from 'lucide-react';

export default function Header({
  currentUser,
  onOpenUpload,
  onOpenDashboard,
  onOpenAdminPanel,
  onOpenAuth,
  onSignOut,
  activeTab,
  setActiveTab,
  darkMode,
  setDarkMode
}) {
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full glass-header transition-all duration-300 overflow-x-clip">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4 min-w-0">
          
          {/* Logo & KollectoP2P Brand */}
          <div
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0 min-w-0"
            onClick={() => setActiveTab('feed')}
            title="Go to Campus Marketplace Feed"
          >
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl overflow-hidden border border-slate-200/60 dark:border-white/10 shadow-sm group-hover:scale-105 transition-all shrink-0">
              <img src="/logo.jpg" alt="KollectoP2P Logo" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base sm:text-lg tracking-tight text-slate-900 dark:text-white truncate">
                  Kollecto<span className="text-blue-600 dark:text-blue-400">P2P</span>
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider glass-badge rounded-full text-slate-700 dark:text-slate-300 shrink-0">
                  IISER Mohali
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 hidden md:block truncate">
                Campus Student Marketplace
              </p>
            </div>
          </div>

          {/* Action Buttons (Right Aligned, Mobile-Optimized) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl text-slate-600 dark:text-slate-300 bg-white/40 dark:bg-slate-800/40 hover:bg-white/70 dark:hover:bg-slate-800/80 border border-slate-200/60 dark:border-white/10 backdrop-blur-md transition-all shadow-sm active:scale-95 cursor-pointer"
              title={darkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              aria-label="Toggle Theme"
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* Upload Button */}
            <button
              onClick={onOpenUpload}
              className="btn-primary flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-xl sm:rounded-2xl active:scale-95 shadow-md shrink-0 cursor-pointer"
              title="Upload single items or hostel clearout bundles"
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span className="hidden xs:inline sm:inline">Upload</span>
            </button>

            {/* Dashboard Button */}
            <button
              onClick={onOpenDashboard}
              className={`flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 text-xs sm:text-sm font-semibold rounded-xl sm:rounded-2xl backdrop-blur-md transition-all shrink-0 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 shadow-sm'
                  : 'bg-white/30 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-white/10 hover:bg-white/60 dark:hover:bg-slate-800/60'
              }`}
              title="My Listings & Dashboard"
            >
              <LayoutDashboard className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
              <span className="hidden md:inline">Dashboard</span>
            </button>

            {/* Admin Moderation Button (Only visible to authorized Admin users) */}
            {currentUser?.isAdmin && (
              <button
                onClick={onOpenAdminPanel}
                className={`flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 text-xs sm:text-sm font-semibold rounded-xl sm:rounded-2xl backdrop-blur-md transition-all shrink-0 cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 shadow-sm'
                    : 'bg-white/30 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-white/10 hover:bg-white/60 dark:hover:bg-slate-800/60'
                }`}
                title="Moderator Admin Panel"
              >
                <ShieldCheck className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="hidden lg:inline">Admin</span>
              </button>
            )}

            {/* User Profile / Login Gateway */}
            <div className="relative shrink-0">
              {currentUser ? (
                <button
                  onClick={() => setShowPersonaMenu(!showPersonaMenu)}
                  className="flex items-center gap-1.5 sm:gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl sm:rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/60 dark:border-white/10 text-left transition-all backdrop-blur-md hover:bg-white/70 dark:hover:bg-slate-800/70 cursor-pointer"
                  aria-label="User Profile Menu"
                >
                  <div className="w-7 h-7 rounded-lg sm:rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden xl:block">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[110px]">{currentUser.name}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate max-w-[110px]">{currentUser.email}</div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 hidden xs:block" />
                </button>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="btn-primary flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-bold rounded-xl sm:rounded-2xl shadow-sm transition-all cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Sign In</span>
                </button>
              )}

              {/* Persona Switcher Dropdown */}
              {showPersonaMenu && (
                <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-24px)] p-2 glass-modal rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in-95 border border-slate-200/70 dark:border-white/10">
                  <div className="px-3 py-2 border-b border-slate-200/50 dark:border-white/10 mb-1">
                    <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Signed in as</p>
                    <p className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 truncate">{currentUser?.email}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      WhatsApp: {currentUser?.whatsapp || 'Not set'}
                    </p>
                  </div>

                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Account</span>
                    <Sparkles className="w-3 h-3 text-slate-400" />
                  </div>

                  <button
                    onClick={() => {
                      onOpenAuth();
                      setShowPersonaMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-xl transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>Edit Profile & WhatsApp</span>
                    <User className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    onClick={() => {
                      setShowPersonaMenu(false);
                      if (onSignOut) onSignOut();
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors flex items-center justify-between mt-1 border-t border-slate-200/50 dark:border-white/10 cursor-pointer"
                  >
                    <span>Log Out</span>
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
