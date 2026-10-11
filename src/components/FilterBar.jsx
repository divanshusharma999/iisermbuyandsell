import React from 'react';
import { Search, ArrowUpDown, Filter, Sparkles, X } from 'lucide-react';
import { CATEGORIES } from '../data/mockData';

export default function FilterBar({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy,
  totalResults
}) {
  return (
    <div
      className="rounded-3xl p-4 sm:p-5 mb-6 shadow-sm border transition-all"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-card)'
      }}
    >
      
      {/* Search Input & Sort Dropdown Row */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mb-4">
        
        {/* Search Input Box */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-section-icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search textbooks, cycles, room coolers, lab gear, notes..."
            className="w-full rounded-2xl pl-10 pr-9 py-2.5 text-sm transition-all shadow-inner border"
            style={{
              backgroundColor: 'var(--bg-body)',
              borderColor: 'var(--border-card)',
              color: 'var(--text-primary)'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full w-4 h-4 flex items-center justify-center transition-colors cursor-pointer"
              style={{
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-secondary)'
              }}
              title="Clear search query"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Sort Dropdown & Results Counter */}
        <div className="flex items-center gap-3 justify-between sm:justify-end shrink-0">
          <div className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
            <span className="font-extrabold" style={{ color: 'var(--text-primary)' }}>{totalResults}</span> items
          </div>

          <div className="relative flex items-center">
            <ArrowUpDown className="w-3.5 h-3.5 text-section-icon absolute left-3 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-bold rounded-2xl pl-9 pr-7 py-2.5 appearance-none cursor-pointer shadow-sm border"
              style={{
                backgroundColor: 'var(--bg-body)',
                borderColor: 'var(--border-card)',
                color: 'var(--text-primary)'
              }}
            >
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="expiring-soon">Expiring Soonest (Clearance)</option>
            </select>
          </div>
        </div>

      </div>

      {/* ─── CATEGORY SECTION HEADING ─────────────────────────────────────────── */}
      {/* Requirement: Section icons styled with --text-section-icon and heading text styled with --btn-primary-bg (light) or --text-primary (dark) */}
      <div className="flex items-center gap-2 min-w-0 w-full overflow-hidden pt-1">
        <div className="flex items-center text-xs font-bold shrink-0 mr-1.5 gap-1.5">
          <Filter className="w-3.5 h-3.5 text-section-icon" />
          <span className="heading-section">Categories:</span>
        </div>

        {/* Horizontal Category Scroll Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 scroll-smooth min-w-0 flex-1">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer border ${
                  isSelected
                    ? 'btn-primary shadow-md scale-102'
                    : 'hover:opacity-80'
                }`}
                style={!isSelected ? {
                  backgroundColor: 'var(--bg-body)',
                  borderColor: 'var(--border-card)',
                  color: 'var(--text-secondary)'
                } : {}}
              >
                {cat === 'All' && <Sparkles className="w-3 h-3 inline mr-1 text-section-icon" />}
                {cat}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
