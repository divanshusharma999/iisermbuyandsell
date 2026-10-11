import React from 'react';
import { PlusCircle, ShoppingBag, ShieldCheck, MessageCircle, Sparkles, ArrowRight } from 'lucide-react';

export default function HeroSection({ onOpenUpload, onExploreClearouts }) {
  return (
    <section
      aria-label="Campus Hero Banner"
      className="relative rounded-3xl overflow-hidden mb-8 shadow-xl transition-all"
      style={{
        backgroundColor: 'var(--bg-nav)',
        border: '1px solid var(--border-card)'
      }}
    >
      {/* Decorative ambient subtle background accents */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#FFEA00_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="relative px-6 py-8 sm:px-10 sm:py-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
        
        {/* Left Column: Headings & Value Props */}
        <div className="space-y-4 max-w-2xl">
          
          {/* Top Pill / Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border border-white/10 shadow-sm"
               style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)', color: 'var(--text-on-dark)' }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--text-accent-hero)' }} />
            <span>Official IISER Mohali Student Exchange</span>
          </div>

          {/* High-Contrast Hero Heading using --text-accent-hero */}
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15]"
            style={{ color: 'var(--text-accent-hero)' }}
          >
            KollectoP2P Campus Marketplace
          </h1>

          {/* Body Text using --text-on-dark */}
          <p
            className="text-sm sm:text-base leading-relaxed"
            style={{ color: 'var(--text-on-dark)' }}
          >
            Zero-commission bulletin board exclusively for IISER Mohali students and faculty.
            Buy and sell textbooks, cycles, appliances, and semester hostel room clear-out bundles directly via WhatsApp.
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            {/* Primary CTA using --btn-primary-bg & --btn-primary-text transitioning to hover tokens */}
            <button
              onClick={onOpenUpload}
              className="btn-primary px-5 py-3 text-sm font-bold shadow-lg"
              title="Post a single item or hostel room clearout bundle"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              <span>Post Listing or Clearout</span>
            </button>

            {/* Secondary Action */}
            {onExploreClearouts && (
              <button
                onClick={onExploreClearouts}
                className="btn-secondary px-5 py-3 text-sm font-bold shadow-sm flex items-center gap-2"
                title="Browse semester hostel room clearout bundles"
              >
                <ShoppingBag className="w-4 h-4 text-section-icon" />
                <span>Browse Room Clearouts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>

        {/* Right Column: Campus Highlights Box */}
        <div className="w-full lg:w-auto shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3">
          
          <div
            className="p-4 rounded-2xl border flex items-center gap-3 min-w-[240px] shadow-sm"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-card)',
              color: 'var(--text-primary)'
            }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                 style={{ backgroundColor: 'var(--badge-stock)', color: '#FFFFFF' }}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold heading-card-title">@iisermohali.ac.in</div>
              <div className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>100% Student Verified</div>
            </div>
          </div>

          <div
            className="p-4 rounded-2xl border flex items-center gap-3 min-w-[240px] shadow-sm"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-card)',
              color: 'var(--text-primary)'
            }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                 style={{ backgroundColor: 'var(--badge-b2b)', color: '#FFFFFF' }}>
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold heading-card-title">Direct WhatsApp Deals</div>
              <div className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Pre-filled item pickup chats</div>
            </div>
          </div>

          <div
            className="p-4 rounded-2xl border flex items-center gap-3 min-w-[240px] shadow-sm"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-card)',
              color: 'var(--text-primary)'
            }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                 style={{ backgroundColor: 'var(--badge-featured)', color: '#FFFFFF' }}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold heading-card-title">21-Day Auto Expiry</div>
              <div className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Always fresh, zero stale posts</div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
