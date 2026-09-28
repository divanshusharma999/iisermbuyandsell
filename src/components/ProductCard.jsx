import React from 'react';
import { Clock, Tag, ShoppingBag, Layers, PhoneCall } from 'lucide-react';
import InfoTooltip from './InfoTooltip';

export default function ProductCard({ item, onClick }) {
  const now = new Date();
  const expiresAt = new Date(item.expiresAt);
  const diffTime = expiresAt - now;
  const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const isExpiringSoon = daysLeft <= 3;

  const thumbnail = item.images[item.thumbnailIndex || 0] || item.images[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80';

  return (
    <div
      onClick={() => onClick(item)}
      className="group glass-card glass-card-hover rounded-3xl overflow-hidden flex flex-col justify-between cursor-pointer relative shadow-sm"
    >
      
      {/* Top Media Container */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100/50 dark:bg-slate-900/50">
        <img
          src={thumbnail}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Category Pill */}
        <div className="absolute top-3 left-3 flex items-center">
          <span className="px-2.5 py-1 text-[11px] font-extrabold glass-badge text-slate-800 dark:text-slate-200 backdrop-blur-md rounded-full shadow-sm flex items-center gap-1">
            <Tag className="w-3 h-3 text-slate-500" />
            {item.category}
          </span>
          <InfoTooltip text="Category tag assigned by seller for structured filtering." position="right" />
        </div>

        {/* Expiry Badge */}
        <div className="absolute top-3 right-3 flex items-center">
          <span className={`px-2.5 py-1 text-[11px] font-extrabold border backdrop-blur-md rounded-full shadow-sm flex items-center gap-1 ${
            isExpiringSoon
              ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
              : 'glass-badge text-slate-700 dark:text-slate-300'
          }`}>
            <Clock className="w-3 h-3 text-slate-500 dark:text-slate-400" />
            {daysLeft === 0 ? 'Expired' : `${daysLeft}d left`}
          </span>
          <InfoTooltip text="Automated 21-day bulletin board timer. Sellers can extend timer before auto-removal." position="left" />
        </div>

        {/* Bundle vs Single Badge */}
        <div className="absolute bottom-3 left-3">
          {item.isCartSell ? (
            <span className="px-2.5 py-1 text-[10px] font-extrabold glass-badge text-slate-900 dark:text-white rounded-xl shadow-sm flex items-center gap-1">
              <Layers className="w-3 h-3 text-slate-500" />
              Room Clear-out ({item.subItems?.length || 0} items)
            </span>
          ) : (
            <span className="px-2.5 py-1 text-[10px] font-bold glass-badge text-slate-700 dark:text-slate-300 rounded-xl shadow-sm flex items-center gap-1">
              <ShoppingBag className="w-3 h-3 text-slate-500" />
              Single Item
            </span>
          )}
        </div>

        {/* Reroute Chat Admin Badge */}
        {item.reroutedToAdmin && (
          <div className="absolute bottom-3 right-3">
            <span className="px-2.5 py-1 text-[10px] font-bold glass-badge text-slate-800 dark:text-slate-200 rounded-xl shadow-sm flex items-center gap-1">
              <PhoneCall className="w-3 h-3 text-slate-500" />
              Admin Handoff
            </span>
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm sm:text-base line-clamp-2 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
            {item.title}
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 font-medium">
            {item.description}
          </p>
        </div>

        {/* Card Footer: Price & Badges */}
        <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-extrabold">₹</span>
            <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{item.price.toLocaleString('en-IN')}</span>
            <InfoTooltip text="Listed asking price. Check negotiable badge or sub-item total inside." position="top" />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 text-[10px] font-bold glass-badge text-slate-700 dark:text-slate-300 rounded-md">
              {item.condition}
            </span>
            {item.isNegotiable && (
              <span className="px-2 py-0.5 text-[10px] font-bold glass-badge text-slate-800 dark:text-slate-200 rounded-md">
                Negotiable
              </span>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
