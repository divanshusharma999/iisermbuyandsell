import React from 'react';
import { Clock, RefreshCw, CheckCircle, Trash2, Layers, PlusCircle, LayoutDashboard, ShoppingBag } from 'lucide-react';
import InfoTooltip from './InfoTooltip';

export default function SellerDashboard({
  userListings,
  onExtendTimer,
  onMarkAsSold,
  onDeleteListing,
  onOpenUpload,
  currentUser
}) {
  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in">
      
      {/* ─── DASHBOARD OVERVIEW BANNER ────────────────────────────────────────── */}
      <div
        className="rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-md border"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-card)'
        }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <LayoutDashboard className="w-4 h-4 text-section-icon" />
              <span className="heading-section text-xs font-extrabold uppercase tracking-wider">
                Seller Command Center
              </span>
            </div>
            
            {/* Section Heading: --btn-primary-bg (light) / --text-primary (dark) */}
            <h2 className="heading-section text-2xl sm:text-3xl font-extrabold tracking-tight">
              My Active Listings & Dashboard
            </h2>

            <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Currently managing items listed under <span className="font-mono font-bold" style={{ color: 'var(--text-primary)' }}>{currentUser?.email}</span>
            </p>
          </div>

          <button
            onClick={onOpenUpload}
            className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Upload New Item</span>
          </button>
        </div>
      </div>

      {/* ─── SELLER LISTINGS LIST ─────────────────────────────────────────────── */}
      {userListings.length === 0 ? (
        <div
          className="rounded-3xl p-12 text-center max-w-lg mx-auto shadow-sm border"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-card)'
          }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border"
            style={{
              backgroundColor: 'var(--bg-body)',
              borderColor: 'var(--border-card)',
              color: 'var(--text-section-icon)'
            }}
          >
            <Clock className="w-8 h-8" />
          </div>
          <h3 className="heading-section text-lg font-bold">No Active Listings Found</h3>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            You haven't posted any items yet under your verified campus email. Click upload to create your first listing!
          </p>
          <button
            onClick={onOpenUpload}
            className="btn-primary mt-4 px-4 py-2.5 text-xs font-bold shadow-md"
          >
            Post First Item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {userListings.map((item) => {
            const now = new Date();
            const expiresAt = new Date(item.expiresAt);
            const diffDays = Math.max(0, Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24)));
            const isExpiringSoon = diffDays <= 3;

            return (
              <div
                key={item.id}
                className="card-product rounded-3xl p-5 flex flex-col justify-between shadow-sm relative"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-card)'
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="px-2.5 py-0.5 text-xs font-bold rounded-md border"
                      style={{
                        backgroundColor: 'var(--bg-body)',
                        borderColor: 'var(--border-card)',
                        color: 'var(--text-primary)'
                      }}
                    >
                      {item.category}
                    </span>
                    
                    {isExpiringSoon ? (
                      <span className="badge-clearance px-2 py-0.5 text-[11px] font-bold rounded-full">
                        {diffDays === 0 ? 'Expired' : `${diffDays}d left`}
                      </span>
                    ) : (
                      <span
                        className="px-2 py-0.5 text-[11px] font-bold rounded-full border"
                        style={{
                          backgroundColor: 'var(--bg-body)',
                          borderColor: 'var(--border-card)',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        {diffDays} days left
                      </span>
                    )}
                  </div>

                  <h3 className="heading-card-title font-extrabold text-base line-clamp-1">
                    {item.title}
                  </h3>

                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>₹</span>
                    <span className="text-xl font-black price-regular">
                      {item.price.toLocaleString('en-IN')}
                    </span>
                    {item.isNegotiable && (
                      <span className="badge-deal text-[10px] px-1.5 py-0.5 rounded ml-2 font-bold">
                        Deal
                      </span>
                    )}
                  </div>

                  {item.isCartSell && (
                    <div className="mt-2 flex items-center gap-1">
                      <span className="badge-featured px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        Room Clearout ({item.subItems?.length || 0} items)
                      </span>
                    </div>
                  )}
                </div>

                <div
                  className="mt-5 pt-3.5 border-t flex items-center justify-between gap-2"
                  style={{ borderColor: 'var(--border-card)' }}
                >
                  <button
                    onClick={() => onExtendTimer(item.id)}
                    className="flex-1 py-1.5 px-2 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    style={{
                      backgroundColor: 'var(--bg-body)',
                      borderColor: 'var(--border-card)',
                      color: 'var(--text-primary)'
                    }}
                    title="Reset 21-day timer back to full"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-section-icon" />
                    <span>Extend (+21d)</span>
                  </button>

                  <button
                    onClick={() => onMarkAsSold(item.id)}
                    className="py-1.5 px-2.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1 cursor-pointer"
                    style={{
                      backgroundColor: 'var(--badge-stock)',
                      borderColor: 'transparent',
                      color: '#FFFFFF'
                    }}
                    title="Mark listing as sold and delete"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Sold</span>
                  </button>

                  <button
                    onClick={() => onDeleteListing(item.id)}
                    className="py-1.5 px-2 rounded-xl text-xs font-bold border transition-colors flex items-center cursor-pointer text-rose-500 hover:bg-rose-500/10"
                    style={{ borderColor: 'var(--border-card)' }}
                    title="Delete listing permanently"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
