import React from 'react';
import { Clock, Layers, MessageCircle, Package } from 'lucide-react';

export default function ProductCard({ item, onClick }) {
  const now = new Date();
  const expiresAt = new Date(item.expiresAt);
  const diffTime = expiresAt - now;
  const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const isExpiringSoon = daysLeft <= 3;

  // Real uploaded image or clean subtle fallback (NO SAMPLE IMAGES)
  const thumbnail = item.images && item.images.length > 0
    ? (item.images[item.thumbnailIndex || 0] || item.images[0])
    : null;

  const isSaleOrNegotiable = item.isNegotiable || item.isCartSell;

  return (
    <div
      onClick={() => onClick(item)}
      className="card-product group overflow-hidden flex flex-col justify-between cursor-pointer relative shadow-xs transition-all select-none"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-card)',
        borderWidth: '1px'
      }}
    >
      
      {/* ─── Compact Media Container (h-20 on mobile, h-32 on desktop for 3 rows fit) ─── */}
      <div className="relative h-20 sm:h-32 w-full overflow-hidden bg-black/5 dark:bg-white/5 shrink-0 flex items-center justify-center">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 gap-0.5 p-1 text-center">
            <Package className="w-5 h-5 stroke-1 text-section-icon" />
            <span className="text-[9px] font-bold">IISER Item</span>
          </div>
        )}

        {/* Category Tag (Top Left, Rectangular, No Pills) */}
        <div className="absolute top-1 left-1">
          <span
            className="px-1 py-0.2 text-[8px] sm:text-[9px] font-bold rounded shadow-xs border"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-card)',
              color: 'var(--text-primary)'
            }}
          >
            {item.category}
          </span>
        </div>

        {/* Clearance / Expiring Badge (Top Right, Rectangular, No Pills) */}
        {isExpiringSoon && (
          <div className="absolute top-1 right-1">
            <span className="badge-clearance px-1 py-0.2 text-[8px] sm:text-[9px] font-extrabold rounded shadow-xs flex items-center gap-0.5">
              <Clock className="w-2 h-2" />
              <span>{daysLeft === 0 ? 'Expiring' : `${daysLeft}d`}</span>
            </span>
          </div>
        )}

        {/* Clearout Bundle Badge (Bottom Left, Rectangular, No Pills) */}
        {item.isCartSell && (
          <div className="absolute bottom-1 left-1">
            <span className="badge-featured px-1 py-0.2 text-[8px] sm:text-[9px] font-bold rounded shadow-xs flex items-center gap-0.5">
              <Layers className="w-2 h-2" />
              <span>Bundle ({item.subItems?.length || 0})</span>
            </span>
          </div>
        )}

        {/* Note: In-stock tag is completely removed as requested */}
      </div>

      {/* ─── Streamlined Card Content (Tight padding for mobile screen fit) ─── */}
      <div className="p-1.5 sm:p-2.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Card Title (Compact font, line-clamp-1) */}
          <h3 className="heading-card-title font-extrabold text-[11px] sm:text-xs line-clamp-1 transition-colors leading-tight">
            {item.title}
          </h3>

          {/* Condition & Deal (Subtle rectangular tags, NO PILLS) */}
          <div className="flex items-center gap-1 mt-0.5">
            <span
              className="text-[8px] sm:text-[9px] font-semibold px-1 py-0.2 rounded border"
              style={{
                backgroundColor: 'var(--bg-body)',
                borderColor: 'var(--border-card)',
                color: 'var(--text-secondary)'
              }}
            >
              {item.condition}
            </span>
            {item.isNegotiable && (
              <span className="badge-deal text-[8px] sm:text-[9px] px-1 py-0.2 font-bold rounded">
                Negotiable
              </span>
            )}
          </div>
        </div>

        {/* Price & Action Row (Tight compact height) */}
        <div
          className="mt-1.5 pt-1 border-t flex items-center justify-between gap-1"
          style={{ borderColor: 'var(--border-card)' }}
        >
          <div className="flex items-baseline gap-0.5 min-w-0 truncate">
            <span className="text-[9px] font-bold" style={{ color: 'var(--text-secondary)' }}>₹</span>
            <span className={`text-[11px] sm:text-xs font-black tracking-tight truncate ${isSaleOrNegotiable ? 'price-sale' : 'price-regular'}`}>
              {item.price.toLocaleString('en-IN')}
            </span>
          </div>

          <button
            type="button"
            className="btn-primary py-0.5 px-1.5 text-[9px] sm:text-[10px] font-bold rounded flex items-center gap-0.5 shadow-xs shrink-0 cursor-pointer"
            title="Chat on WhatsApp"
          >
            <MessageCircle className="w-2.5 h-2.5" />
            <span className="hidden xs:inline">Chat</span>
          </button>
        </div>

      </div>

    </div>
  );
}
