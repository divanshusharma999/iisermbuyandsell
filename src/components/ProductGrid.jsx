import React from 'react';
import ProductCard from './ProductCard';
import { PackageSearch, PlusCircle, Sparkles, Filter } from 'lucide-react';
import InfoTooltip from './InfoTooltip';

export default function ProductGrid({ listings, onSelectProduct, onOpenUpload, onResetFilters }) {
  if (listings.length === 0) {
    return (
      <div
        className="rounded-3xl p-8 sm:p-12 text-center my-8 max-w-xl mx-auto shadow-sm animate-in zoom-in-95 border"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-card)'
        }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border shadow-inner"
          style={{
            backgroundColor: 'var(--bg-body)',
            borderColor: 'var(--border-card)',
            color: 'var(--text-section-icon)'
          }}
        >
          <PackageSearch className="w-8 h-8" />
        </div>

        {/* Heading styled with --btn-primary-bg in light mode / --text-primary in dark mode */}
        <h3 className="heading-section text-xl font-extrabold">
          No Campus Listings Found
        </h3>

        <p
          className="text-xs sm:text-sm mt-1 max-w-md mx-auto leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          No active listings match your current search query or category filter. Try clearing your filters or upload a new item!
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          {onResetFilters && (
            <button
              onClick={onResetFilters}
              className="btn-secondary px-4 py-2.5 text-xs sm:text-sm font-bold shadow-sm"
            >
              Clear Filters
            </button>
          )}
          <button
            onClick={onOpenUpload}
            className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Upload New Item</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <section aria-label="Campus Listings Grid" className="pb-8">
      
      {/* ─── SECTION HEADING ─────────────────────────────────────────────────── */}
      {/* Requirement: Section icons styled with --text-section-icon and heading text styled with --btn-primary-bg (light) or --text-primary (dark) */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center border shadow-xs"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-card)'
            }}
          >
            <Sparkles className="w-4 h-4 text-section-icon" />
          </div>
          <h2 className="heading-section text-lg sm:text-xl font-extrabold tracking-tight">
            Active Campus Listings & Clearouts
          </h2>
        </div>

        <div className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
          Showing <span className="font-extrabold" style={{ color: 'var(--text-primary)' }}>{listings.length}</span> verified posts
        </div>
      </div>

      {/* Masonry / Grid Container */}
      <div className="masonry-grid pb-10">
        {listings.map((item) => (
          <ProductCard key={item.id} item={item} onClick={onSelectProduct} />
        ))}
      </div>
    </section>
  );
}
