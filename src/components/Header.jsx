import React, { useState } from 'react';
import { PlusCircle, LayoutDashboard, ShieldCheck, User, LogOut, ChevronDown, Sparkles, Sun, Moon, PhoneCall } from 'lucide-react';
import { DEFAULT_ADMIN_SUPPORT_WHATSAPP } from '../data/mockData';

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
    <header className="sticky top-0 z-40 w-full transition-all duration-300 shadow-md">
      
      {/* ─── 1. TOP ANNOUNCEMENT BANNER ────────────────────────────────────────── */}
      {/* Requirement: Top banner must use --bg-nav with --text-on-dark and interactive links using --text-accent-hero */}
      <div
        className="w-full border-b border-black/15 text-xs py-1.5 px-3 sm:px-6 transition-colors"
        style={{
          backgroundColor: 'var(--bg-nav)',
          color: 'var(--text-on-dark)'
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-[11px] sm:text-xs">
          
          {/* Banner message */}
          <div className="flex items-center gap-2 truncate">
            <span className="font-extrabold uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded border border-white/20"
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)', color: 'var(--text-accent-hero)' }}>
              Campus Notice
            </span>
            <span className="truncate" style={{ color: 'var(--text-on-dark)' }}>
              IISER Mohali Student Marketplace · 100% Student Verified & Zero Commission
            </span>
          </div>

          {/* Interactive links using --text-accent-hero */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('feed')}
              className="font-bold underline decoration-dotted transition-all hover:opacity-80 cursor-pointer hidden sm:inline"
              style={{ color: 'var(--text-accent-hero)' }}
              title="Explore all active campus listings"
            >
              ⚡ Semester Clearouts Active →
            </button>
            <a
              href={`https://wa.me/${DEFAULT_ADMIN_SUPPORT_WHATSAPP.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold flex items-center gap-1 transition-all hover:underline cursor-pointer"
              style={{ color: 'var(--text-accent-hero)' }}
              title="Admin Support WhatsApp"
            >
              <PhoneCall className="w-3 h-3" />
              <span className="hidden md:inline">Admin Help</span>
            </a>
          </div>

        </div>
      </div>

      {/* ─── 2. MAIN NAVBAR ────────────────────────────────────────────────────── */}
      {/* Requirement: Main navbar must use --bg-nav with links styled using --text-nav-link (hover state: --text-nav-hover) */}
      <nav
        className="w-full transition-colors border-b border-black/10"
        style={{
          backgroundColor: 'var(--bg-nav)'
        }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4 min-w-0">
            
            {/* Logo & Brand */}
            <div
              className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0 min-w-0"
              onClick={() => setActiveTab('feed')}
              title="Go to KollectoP2P Campus Feed"
            >
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl overflow-hidden border border-white/20 shadow-sm group-hover:scale-105 transition-all shrink-0">
                <img src="/logo.jpg" alt="KollectoP2P Logo" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-base sm:text-xl tracking-tight text-white truncate">
                    Kollecto<span style={{ color: 'var(--text-accent-hero)' }}>P2P</span>
                  </span>
                  <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full border border-white/20"
                        style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)', color: 'var(--text-accent-hero)' }}>
                    IISER Mohali
                  </span>
                </div>
                <p className="text-[10px] text-white/70 hidden lg:block truncate">
                  Peer-to-Peer Bulletin & Room Clearouts
                </p>
              </div>
            </div>

            {/* Navigation Tabs styled using --text-nav-link (hover state: --text-nav-hover) */}
            <div className="hidden md:flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setActiveTab('feed')}
                className={`nav-link px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'feed' ? 'underline decoration-2 underline-offset-4' : ''
                }`}
                title="Marketplace Feed"
              >
                Marketplace Feed
              </button>

              <button
                onClick={onOpenDashboard}
                className={`nav-link px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'dashboard' ? 'underline decoration-2 underline-offset-4' : ''
                }`}
                title="My Listings & Dashboard"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>My Dashboard</span>
              </button>

              {currentUser?.isAdmin && (
                <button
                  onClick={onOpenAdminPanel}
                  className={`nav-link px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'admin' ? 'underline decoration-2 underline-offset-4' : ''
                  }`}
                  title="Admin Moderation Portal"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-section-icon" />
                  <span>Admin Panel</span>
                </button>
              )}
            </div>

            {/* Action Buttons (Right Aligned) */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              
              {/* Dark / Light Mode Toggle styled with nav link tokens */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="nav-link p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border border-white/10 transition-all shadow-sm active:scale-95 cursor-pointer"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
                title={darkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
                aria-label="Toggle Theme"
              >
                {darkMode ? (
                  <Sun className="w-4 h-4" style={{ color: 'var(--text-accent-hero)' }} />
                ) : (
                  <Moon className="w-4 h-4" style={{ color: 'var(--text-nav-link)' }} />
                )}
              </button>

              {/* Upload Item CTA Button using --btn-primary-bg & --btn-primary-text transitioning to hover tokens */}
              <button
                onClick={onOpenUpload}
                className="btn-primary flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold active:scale-95 shadow-md shrink-0 cursor-pointer"
                title="Upload single items or hostel room clearout bundles"
              >
                <PlusCircle className="w-4 h-4 shrink-0" />
                <span className="hidden xs:inline">Upload</span>
              </button>

              {/* Mobile Dashboard Icon Button */}
              <button
                onClick={onOpenDashboard}
                className="md:hidden nav-link p-2 rounded-xl border border-white/10 active:scale-95 cursor-pointer"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
                title="My Dashboard"
              >
                <LayoutDashboard className="w-4 h-4" />
              </button>

              {/* Mobile Admin Icon Button */}
              {currentUser?.isAdmin && (
                <button
                  onClick={onOpenAdminPanel}
                  className="md:hidden p-2 rounded-xl border border-white/10 active:scale-95 cursor-pointer"
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
                  title="Admin Panel"
                >
                  <ShieldCheck className="w-4 h-4 text-section-icon" />
                </button>
              )}

              {/* User Profile / Login Gateway */}
              <div className="relative shrink-0">
                {currentUser ? (
                  <button
                    onClick={() => setShowPersonaMenu(!showPersonaMenu)}
                    className="flex items-center gap-1.5 sm:gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl sm:rounded-2xl border border-white/15 text-left transition-all cursor-pointer"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)' }}
                    aria-label="User Profile Menu"
                  >
                    <div
                      className="w-7 h-7 rounded-lg sm:rounded-full font-bold text-xs flex items-center justify-center shadow-sm shrink-0"
                      style={{
                        backgroundColor: 'var(--btn-primary-hover-bg)',
                        color: 'var(--btn-primary-hover-text)'
                      }}
                    >
                      {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="hidden xl:block">
                      <div className="text-xs font-bold truncate max-w-[110px]" style={{ color: 'var(--text-on-dark)' }}>
                        {currentUser.name}
                      </div>
                      <div className="text-[10px] font-mono truncate max-w-[110px]" style={{ color: 'var(--text-nav-link)' }}>
                        {currentUser.email}
                      </div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 hidden xs:block" style={{ color: 'var(--text-nav-link)' }} />
                  </button>
                ) : (
                  <button
                    onClick={onOpenAuth}
                    className="btn-primary flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>Sign In</span>
                  </button>
                )}

                {/* Dropdown Menu */}
                {showPersonaMenu && (
                  <div
                    className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-24px)] p-2 rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in-95"
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      borderColor: 'var(--border-card)',
                      borderWidth: '1px'
                    }}
                  >
                    <div className="px-3 py-2 border-b mb-1" style={{ borderColor: 'var(--border-card)' }}>
                      <p className="text-[10px] font-semibold" style={{ color: 'var(--text-secondary)' }}>Signed in as</p>
                      <p className="text-xs font-mono font-bold truncate" style={{ color: 'var(--text-primary)' }}>{currentUser?.email}</p>
                      <p className="text-[10px] mt-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>
                        WhatsApp: {currentUser?.whatsapp || 'Not set'}
                      </p>
                    </div>

                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider flex items-center justify-between"
                         style={{ color: 'var(--text-secondary)' }}>
                      <span>Account</span>
                      <Sparkles className="w-3 h-3 text-section-icon" />
                    </div>

                    <button
                      onClick={() => {
                        onOpenAuth();
                        setShowPersonaMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition-colors flex items-center justify-between cursor-pointer"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      <span>Edit Profile & WhatsApp</span>
                      <User className="w-3.5 h-3.5 text-section-icon" />
                    </button>

                    <button
                      onClick={() => {
                        setShowPersonaMenu(false);
                        if (onSignOut) onSignOut();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition-colors flex items-center justify-between mt-1 border-t cursor-pointer"
                      style={{
                        borderColor: 'var(--border-card)',
                        color: 'var(--text-price-sale)'
                      }}
                    >
                      <span>Log Out</span>
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      </nav>

    </header>
  );
}
