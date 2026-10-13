import React from 'react';
import ProductCard from './ProductCard';
import { PackageSearch, PlusCircle } from 'lucide-react';

export default function ProductGrid({ listings, onSelectProduct, onOpenUpload, onResetFilters }) {
  if (listings.length === 0) {
    return (
      <div
        className="rounded-2xl p-6 sm:p-10 text-center my-6 max-w-lg mx-auto shadow-xs border"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-card)'
        }}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 border shadow-inner"
          style={{
            backgroundColor: 'var(--bg-body)',
            borderColor: 'var(--border-card)',
            color: 'var(--text-section-icon)'
          }}
        >
          <PackageSearch className="w-6 h-6" />
        </div>

        <h3 className="heading-section text-base sm:text-lg font-bold">
          No Listings Found
        </h3>

        <p
          className="text-xs mt-1 max-w-sm mx-auto leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          No active items match your search or filter. Try clearing filters or post a new item!
        </p>

        <div className="mt-5 flex items-center justify-center gap-2">
          {onResetFilters && (
            <button
              onClick={onResetFilters}
              className="btn-secondary px-3.5 py-2 text-xs font-bold rounded-lg shadow-xs"
            >
              Clear Filters
            </button>
          )}
          <button
            onClick={onOpenUpload}
            className="btn-primary inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Upload Item</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <section aria-label="Marketplace Listings Grid" className="py-2 pb-10">
      
      {/* Subtle Counter */}
      <div className="flex items-center justify-between mb-2.5 px-0.5 text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>
        <span>Listings ({listings.length})</span>
      </div>

      {/* ─── Compact Grid: 2 Columns on Mobile for 3 Rows Fit ─── */}
      <div className="masonry-grid">
        {listings.map((item) => (
          <ProductCard key={item.id} item={item} onClick={onSelectProduct} />
        ))}
      </div>
    </section>
  );
}
