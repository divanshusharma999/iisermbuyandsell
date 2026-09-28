import React, { useState } from 'react';
import { PlusCircle, LayoutDashboard, ShieldCheck, User, LogOut, ChevronDown, Sparkles, Sun, Moon } from 'lucide-react';
import InfoTooltip from './InfoTooltip';

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
    <header className="sticky top-0 z-40 glass-header transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & KollectoP2P Brand */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('feed')}>
            <div className="relative w-10 h-10 rounded-2xl overflow-hidden border border-slate-200/60 dark:border-white/10 shadow-sm group-hover:scale-105 transition-all">
              <img src="/logo.jpg" alt="KollectoP2P Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                  Kollecto<span className="text-slate-500 dark:text-slate-400">P2P</span>
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider glass-badge rounded-full text-slate-700 dark:text-slate-300">
                  IISER Mohali
                </span>
                <InfoTooltip text="KollectoP2P: Campus-exclusive peer-to-peer bulletin board locked to @iisermohali.ac.in." position="bottom" />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">Campus Student Bulletin Board & Cart Bundles</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Dark Mode Toggle Button */}
            <div className="flex items-center">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2.5 rounded-2xl text-slate-600 dark:text-slate-300 bg-white/40 dark:bg-slate-800/40 hover:bg-white/70 dark:hover:bg-slate-800/80 border border-slate-200/60 dark:border-white/10 backdrop-blur-md transition-all shadow-sm active:scale-95"
                title={darkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
                aria-label="Toggle Theme"
              >
                {darkMode ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-700" />
                )}
              </button>
              <InfoTooltip text="Toggle Light / Dark Glassmorphism theme." position="bottom" />
            </div>

            {/* Upload Button */}
            <div className="flex items-center">
              <button
                onClick={onOpenUpload}
                className="btn-primary flex items-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs sm:text-sm rounded-2xl active:scale-95 shadow-lg"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Upload Item</span>
              </button>
              <InfoTooltip text="Upload single items or hostel clearout bundles with photos and pricing." position="bottom" />
            </div>

            {/* Dashboard Button */}
            <div className="flex items-center">
              <button
                onClick={onOpenDashboard}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold rounded-2xl backdrop-blur-md transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 shadow-sm'
                    : 'bg-white/30 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-white/10 hover:bg-white/60 dark:hover:bg-slate-800/60'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span className="hidden md:inline">My Dashboard</span>
              </button>
              <InfoTooltip text="Manage active listings, extend timers, edit bundle items, or mark items as sold." position="bottom" />
            </div>

            {/* Admin Moderation Button (Only visible to authorized Admin users) */}
            {currentUser?.isAdmin && (
              <div className="flex items-center">
                <button
                  onClick={onOpenAdminPanel}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-semibold rounded-2xl backdrop-blur-md transition-all ${
                    activeTab === 'admin'
                      ? 'bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 shadow-sm'
                      : 'bg-white/30 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-white/10 hover:bg-white/60 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-rose-500" />
                  <span className="hidden lg:inline">Admin Panel</span>
                </button>
                <InfoTooltip text="Moderator portal: Manage banned keywords, suspend spammers, and force delete items." position="bottom" />
              </div>
            )}

            {/* User Profile / Login Gateway */}
            <div className="relative">
              {currentUser ? (
                <button
                  onClick={() => setShowPersonaMenu(!showPersonaMenu)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/60 dark:border-white/10 text-left transition-all backdrop-blur-md hover:bg-white/70 dark:hover:bg-slate-800/70"
                >
                  <div className="w-7 h-7 rounded-full bg-slate-900/10 dark:bg-white/10 text-slate-800 dark:text-white flex items-center justify-center font-bold text-xs border border-slate-300/40 dark:border-white/20">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden xl:block">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">{currentUser.name}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate max-w-[120px]">{currentUser.email}</div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                </button>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="btn-primary flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-2xl shadow-sm transition-all"
                >
                  <User className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
              )}

              {/* Persona Switcher Dropdown */}
              {showPersonaMenu && (
                <div className="absolute right-0 mt-2 w-64 p-2 glass-modal rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-slate-200/50 dark:border-white/10 mb-1">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Signed in as</p>
                    <p className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 truncate">{currentUser?.email}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">WhatsApp: {currentUser?.whatsapp || 'Not set'}</p>
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
                    className="w-full text-left px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors flex items-center justify-between mt-1 border-t border-slate-200/50 dark:border-white/10"
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
