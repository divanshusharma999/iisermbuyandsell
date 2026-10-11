import React from 'react';
import { Clock, Tag, ShoppingBag, Layers, PhoneCall, CheckCircle2, MessageCircle, ArrowRight } from 'lucide-react';
import InfoTooltip from './InfoTooltip';

export default function ProductCard({ item, onClick }) {
  const now = new Date();
  const expiresAt = new Date(item.expiresAt);
  const diffTime = expiresAt - now;
  const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const isExpiringSoon = daysLeft <= 3;
  const isNewListing = daysLeft >= 19 || item.condition === 'New';

  const thumbnail = item.images[item.thumbnailIndex || 0] || item.images[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80';

  // Check if negotiable / sale pricing applies
  const isSaleOrNegotiable = item.isNegotiable || item.isCartSell;

  return (
    <div
      onClick={() => onClick(item)}
      className="card-product group overflow-hidden flex flex-col justify-between cursor-pointer relative shadow-sm"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-card)',
        borderWidth: '1px'
      }}
    >
      
      {/* Top Media Container */}
      <div className="relative h-48 w-full overflow-hidden bg-black/5 dark:bg-white/5">
        <img
          src={thumbnail}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Category Badge using --bg-surface and --border-card with semantic accent */}
        <div className="absolute top-3 left-3 flex items-center">
          <span
            className="px-2.5 py-1 text-[11px] font-extrabold rounded-full shadow-sm flex items-center gap-1 border"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-card)',
              color: 'var(--text-primary)'
            }}
          >
            <Tag className="w-3 h-3 text-section-icon" />
            <span>{item.category}</span>
          </span>
        </div>

        {/* Top Right: Status Badges (Clearance vs New vs Standard) */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {isExpiringSoon ? (
            /* Clearance Badge using --badge-clearance (#CB6D51) */
            <span
              className="badge-clearance px-2.5 py-1 text-[11px] font-extrabold rounded-full shadow-md flex items-center gap-1"
              title="Listing is in clearance and expires in <= 3 days"
            >
              <Clock className="w-3 h-3" />
              <span>{daysLeft === 0 ? 'Expiring Today' : `${daysLeft}d left`}</span>
            </span>
          ) : isNewListing ? (
            /* New Badge using --badge-new and --badge-new-text */
            <span
              className="badge-new px-2.5 py-1 text-[11px] font-extrabold rounded-full shadow-sm flex items-center gap-1"
              title="Freshly posted campus item"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>New</span>
            </span>
          ) : (
            <span
              className="px-2.5 py-1 text-[11px] font-bold rounded-full shadow-sm flex items-center gap-1 border"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-card)',
                color: 'var(--text-secondary)'
              }}
            >
              <Clock className="w-3 h-3 text-section-icon" />
              <span>{daysLeft}d left</span>
            </span>
          )}
        </div>

        {/* Bottom Left: Featured Room Clearout Bundle Badge vs In-Stock Single Item */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
          {item.isCartSell ? (
            /* Featured Badge using --badge-featured (#E67E23) */
            <span
              className="badge-featured px-2.5 py-1 text-[10px] font-extrabold rounded-xl shadow-md flex items-center gap-1"
              title="Hostel room clearout bundle with multiple items"
            >
              <Layers className="w-3 h-3" />
              <span>Room Clearout ({item.subItems?.length || 0})</span>
            </span>
          ) : (
            /* Stock Badge using --badge-stock (#2DC26B) */
            <span
              className="badge-stock px-2.5 py-1 text-[10px] font-bold rounded-xl shadow-sm flex items-center gap-1"
              title="Verified single in-stock item"
            >
              <ShoppingBag className="w-3 h-3" />
              <span>In Stock</span>
            </span>
          )}
        </div>

        {/* Bottom Right: Admin Handoff / B2B Badge using --badge-b2b (#3598DB) */}
        {item.reroutedToAdmin && (
          <div className="absolute bottom-3 right-3">
            <span
              className="badge-b2b px-2.5 py-1 text-[10px] font-bold rounded-xl shadow-md flex items-center gap-1"
              title="Campus logistics & admin support handoff"
            >
              <PhoneCall className="w-3 h-3" />
              <span>Admin Handoff</span>
            </span>
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Card Title: --btn-primary-bg in light mode / --text-primary in dark mode */}
          <h3 className="heading-card-title font-extrabold text-base sm:text-lg line-clamp-2 transition-colors">
            {item.title}
          </h3>

          {/* Description using --text-secondary */}
          <p
            className="text-xs line-clamp-2 mt-1.5 font-medium leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            {item.description}
          </p>
        </div>

        {/* Price & Meta Badges */}
        <div
          className="mt-4 pt-3.5 border-t flex flex-col gap-3"
          style={{ borderColor: 'var(--border-card)' }}
        >
          <div className="flex items-center justify-between">
            
            {/* Price Display: regular prices use --text-primary; discounted/sale use --text-price-sale */}
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>₹</span>
              <span className={`text-xl font-black tracking-tight ${isSaleOrNegotiable ? 'price-sale' : 'price-regular'}`}>
                {item.price.toLocaleString('en-IN')}
              </span>
              {isSaleOrNegotiable && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: 'rgba(89, 21, 9, 0.1)', color: 'var(--text-price-sale)' }}>
                  Sale
                </span>
              )}
            </div>

            {/* Condition & Deal Badges */}
            <div className="flex items-center gap-1.5">
              {item.isNegotiable && (
                /* Deal Badge using --badge-deal (#F1C40F, text: #000000) */
                <span
                  className="badge-deal px-2 py-0.5 text-[10px] font-extrabold rounded-md shadow-sm"
                  title="Price is open to reasonable batchmate negotiation"
                >
                  Deal
                </span>
              )}
              <span
                className="px-2 py-0.5 text-[10px] font-bold rounded-md border"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-card)',
                  color: 'var(--text-secondary)'
                }}
              >
                {item.condition}
              </span>
            </div>

          </div>

          {/* Primary Action Button: Wires up all 4 --btn-primary-* token states */}
          <button
            type="button"
            className="btn-primary w-full py-2.5 px-3 text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-1.5"
            title="Open listing to inspect photos, details, and chat on WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>View & Chat on WhatsApp</span>
            <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>

      </div>

    </div>
  );
}
