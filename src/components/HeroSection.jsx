import React from 'react';
import { PlusCircle } from 'lucide-react';

export default function HeroSection({ onOpenUpload }) {
  return (
    <section
      aria-label="Campus Banner"
      className="relative rounded-2xl overflow-hidden mb-6 p-4 sm:p-6 transition-all border shadow-sm"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-card)'
      }}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-xl sm:text-2xl font-black tracking-tight inline-flex items-center"
            aria-label="buyKꞰsell Campus Exchange"
          >
            <span style={{ color: 'var(--text-accent-hero)' }}>buy</span>
            <span className="inline-flex tracking-[-0.14em] mx-[1px] font-black" style={{ color: 'var(--text-accent-hero)' }}>
              <span>K</span>
              <span className="inline-block transform -scale-x-100">K</span>
            </span>
            <span style={{ color: 'var(--text-accent-hero)' }}>sell</span>
            <span className="ml-2 font-black" style={{ color: 'var(--text-primary)' }}>Campus Exchange</span>
          </h1>
          <p
            className="text-xs sm:text-sm mt-1"
            style={{ color: 'var(--text-secondary)' }}
          >
            Buy and sell textbooks, cycles, and hostel essentials directly with batchmates.
          </p>
        </div>

        <button
          onClick={onOpenUpload}
          className="btn-primary px-4 py-2 text-xs sm:text-sm font-bold shadow-md shrink-0 flex items-center gap-1.5 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Upload Item</span>
        </button>
      </div>
    </section>
  );
}
