import React from 'react';
import ProductCard from './ProductCard';
import { PackageSearch, PlusCircle } from 'lucide-react';
import InfoTooltip from './InfoTooltip';

export default function ProductGrid({ listings, onSelectProduct, onOpenUpload, onResetFilters }) {
  if (listings.length === 0) {
    return (
      <div className="glass-card rounded-3xl p-8 sm:p-12 text-center my-8 max-w-xl mx-auto backdrop-blur-xl shadow-sm animate-in zoom-in-95">
        <div className="w-16 h-16 bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[var(--apple-blue)] border border-slate-200/50 dark:border-white/10 shadow-inner">
          <PackageSearch className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-200">No Campus Listings Found</h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
          No active items match your current search query or category filter. Try clearing your filters or upload a new item!
        </p>
        <div className="mt-5 flex items-center justify-center gap-3">
          {onResetFilters && (
            <button
              onClick={onResetFilters}
              className="px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold border border-slate-200/60 dark:border-white/10 bg-white/40 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-slate-800/70 transition-all"
            >
              Clear Filters
            </button>
          )}
          <button
            onClick={onOpenUpload}
            className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Upload New Item</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <section aria-label="Campus Listings Grid">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
          <span>Displaying verified KollectoP2P bulletin posts</span>
          <InfoTooltip text="Items automatically expire after 21 days unless extended by the seller." position="right" />
        </div>
      </div>

      <div className="masonry-grid pb-12">
        {listings.map((item) => (
          <ProductCard key={item.id} item={item} onClick={onSelectProduct} />
        ))}
      </div>
    </section>
  );
}
