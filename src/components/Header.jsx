import React, { useState } from 'react';
import {
  PlusCircle, LayoutDashboard, ShieldCheck, User, LogOut,
  ChevronDown, Sun, Moon, PhoneCall, Search, Filter, ArrowUpDown, X
} from 'lucide-react';
import { DEFAULT_ADMIN_SUPPORT_WHATSAPP, CATEGORIES } from '../data/mockData';
import BrandWordmark from './BrandLogo';

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
  setDarkMode,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy
}) {
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300 shadow-md">
      
      {/* ─── 1. TOP ANNOUNCEMENT BANNER ────────────────────────────────────────── */}
      <div
        className="w-full border-b border-black/15 text-xs py-1 px-3 sm:px-6 transition-colors"
        style={{
          backgroundColor: 'var(--bg-nav)',
          color: 'var(--text-on-dark)'
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-[11px] sm:text-xs">
          <div className="flex items-center gap-2 truncate">
            <span
              className="font-extrabold uppercase tracking-wider text-[9px] px-1.5 py-0.5 rounded border border-white/20"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)', color: 'var(--text-accent-hero)' }}
            >
              IISER Mohali
            </span>
            <span className="truncate" style={{ color: 'var(--text-on-dark)' }}>
              Campus Marketplace
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href={`https://wa.me/${DEFAULT_ADMIN_SUPPORT_WHATSAPP.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold flex items-center gap-1 transition-all hover:underline cursor-pointer"
              style={{ color: 'var(--text-accent-hero)' }}
              title="Admin Support WhatsApp"
            >
              <PhoneCall className="w-3 h-3" />
              <span className="hidden sm:inline">Admin Help</span>
            </a>
          </div>
        </div>
      </div>

      {/* ─── 2. MAIN NAVBAR ────────────────────────────────────────────────────── */}
      <nav
        className="w-full transition-colors border-b border-black/10"
        style={{
          backgroundColor: 'var(--bg-nav)'
        }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-13 sm:h-14 gap-2 sm:gap-4 min-w-0">
            
            {/* Logo & Brand */}
            <div
              className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0 min-w-0"
              onClick={() => setActiveTab('feed')}
              title="buyKꞰsell Campus Feed"
            >
              <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-white/20 shadow-sm group-hover:scale-105 transition-all shrink-0">
                <img src="/logo.jpg" alt="buyKꞰsell Logo" className="w-full h-full object-cover" />
              </div>
              <BrandWordmark size="md" textColor="text-white" />
            </div>

            {/* Navigation Tabs */}
            <div className="hidden md:flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setActiveTab('feed')}
                className={`nav-link px-2.5 py-1 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'feed' ? 'underline decoration-2 underline-offset-4' : ''
                }`}
              >
                Marketplace
              </button>

              <button
                onClick={onOpenDashboard}
                className={`nav-link px-2.5 py-1 text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'dashboard' ? 'underline decoration-2 underline-offset-4' : ''
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>

              {currentUser?.isAdmin && (
                <button
                  onClick={onOpenAdminPanel}
                  className={`nav-link px-2.5 py-1 text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'admin' ? 'underline decoration-2 underline-offset-4' : ''
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-section-icon" />
                  <span>Admin Panel</span>
                </button>
              )}
            </div>

            {/* Action Buttons (Right Aligned) */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              
              {/* Theme Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="nav-link p-1.5 sm:p-2 rounded-lg border border-white/10 transition-all shadow-sm active:scale-95 cursor-pointer"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
                title={darkMode ? 'Light Theme' : 'Dark Theme'}
                aria-label="Toggle Theme"
              >
                {darkMode ? (
                  <Sun className="w-4 h-4" style={{ color: 'var(--text-accent-hero)' }} />
                ) : (
                  <Moon className="w-4 h-4" style={{ color: 'var(--text-nav-link)' }} />
                )}
              </button>

              {/* Upload Item Button (Rectangular rounded corners, NO PILLS) */}
              <button
                onClick={onOpenUpload}
                className="btn-primary flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm font-bold shadow-sm shrink-0 cursor-pointer"
                title="Post an item"
              >
                <PlusCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Upload</span>
              </button>

              {/* Mobile Dashboard Icon */}
              <button
                onClick={onOpenDashboard}
                className="md:hidden nav-link p-1.5 rounded-lg border border-white/10 active:scale-95 cursor-pointer"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
                title="Dashboard"
              >
                <LayoutDashboard className="w-4 h-4" />
              </button>

              {/* Mobile Admin Icon */}
              {currentUser?.isAdmin && (
                <button
                  onClick={onOpenAdminPanel}
                  className="md:hidden p-1.5 rounded-lg border border-white/10 active:scale-95 cursor-pointer"
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
                  title="Admin"
                >
                  <ShieldCheck className="w-4 h-4 text-section-icon" />
                </button>
              )}

              {/* User Profile / Login */}
              <div className="relative shrink-0">
                {currentUser ? (
                  <button
                    onClick={() => setShowPersonaMenu(!showPersonaMenu)}
                    className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 rounded-lg border border-white/15 text-left transition-all cursor-pointer"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)' }}
                    aria-label="User Profile"
                  >
                    <div
                      className="w-6 h-6 rounded-md font-bold text-xs flex items-center justify-center shadow-xs shrink-0"
                      style={{
                        backgroundColor: 'var(--btn-primary-hover-bg)',
                        color: 'var(--btn-primary-hover-text)'
                      }}
                    >
                      {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <ChevronDown className="w-3 h-3 hidden xs:block" style={{ color: 'var(--text-nav-link)' }} />
                  </button>
                ) : (
                  <button
                    onClick={onOpenAuth}
                    className="btn-primary flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold shadow-sm transition-all cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </button>
                )}

                {/* Dropdown Menu */}
                {showPersonaMenu && (
                  <div
                    className="absolute right-0 mt-2 w-60 max-w-[calc(100vw-24px)] p-2 rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in-95"
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
                        Phone: {currentUser?.whatsapp || 'Not set'}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        onOpenAuth();
                        setShowPersonaMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-between cursor-pointer"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      <span>Edit Profile</span>
                      <User className="w-3.5 h-3.5 text-section-icon" />
                    </button>

                    <button
                      onClick={() => {
                        setShowPersonaMenu(false);
                        if (onSignOut) onSignOut();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-between mt-1 border-t cursor-pointer"
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

      {/* ─── 3. CONNECTED SEARCH BAR, CATEGORIES & SORT (IN 1 ROW) ─────────────── */}
      {/* Requirement: Connected with the header, Search bar + Categories filter + Sort button adjacent in 1 row */}
      {activeTab === 'feed' && setSearchQuery && (
        <div
          className="w-full border-b py-1.5 sm:py-2 px-2.5 sm:px-6 lg:px-8 transition-colors"
          style={{
            backgroundColor: 'var(--bg-nav)',
            borderColor: 'var(--border-card)'
          }}
        >
          <div className="max-w-7xl mx-auto flex items-center gap-1.5 sm:gap-2 min-w-0">
            
            {/* Search Input Box */}
            <div className="relative flex-1 min-w-0">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-section-icon pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search items, textbooks..."
                className="w-full rounded-lg pl-7.5 pr-6 py-1.5 text-xs transition-all border outline-none shadow-inner"
                style={{
                  backgroundColor: 'var(--bg-body)',
                  borderColor: 'var(--border-card)',
                  color: 'var(--text-primary)'
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white p-0.5"
                  title="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Categories Filter Dropdown (Adjacent in 1 row) */}
            <div className="relative shrink-0">
              <Filter className="w-3.5 h-3.5 text-section-icon absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs font-bold rounded-lg pl-6.5 pr-2.5 py-1.5 max-w-[100px] sm:max-w-none appearance-none cursor-pointer border shadow-xs outline-none transition-colors truncate"
                style={{
                  backgroundColor: 'var(--bg-body)',
                  borderColor: 'var(--border-card)',
                  color: 'var(--text-primary)'
                }}
                title="Filter Category"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'All' ? 'Categories' : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown Button (Adjacent in 1 row) */}
            <div className="relative shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-section-icon absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs font-bold rounded-lg pl-6.5 pr-2.5 py-1.5 max-w-[80px] sm:max-w-none appearance-none cursor-pointer border shadow-xs outline-none transition-colors truncate"
                style={{
                  backgroundColor: 'var(--bg-body)',
                  borderColor: 'var(--border-card)',
                  color: 'var(--text-primary)'
                }}
                title="Sort Listings"
              >
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low</option>
                <option value="price-desc">Price: High</option>
                <option value="expiring-soon">Expiring</option>
              </select>
            </div>

          </div>
        </div>
      )}

    </header>
  );
}
