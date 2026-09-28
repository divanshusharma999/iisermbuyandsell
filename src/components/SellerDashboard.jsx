import React from 'react';
import { Clock, RefreshCw, CheckCircle, Trash2, Layers, PlusCircle } from 'lucide-react';
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
      
      {/* Dashboard Overview Banner */}
      <div className="glass-modal rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-xs font-extrabold glass-badge rounded-full text-slate-800 dark:text-slate-200">
                Seller Command Center
              </span>
              <InfoTooltip text="Manage active items, extend 21-day timers, edit bundle items, or mark items as sold." position="bottom" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              My Active Listings
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Currently managing items listed under <span className="text-slate-800 dark:text-slate-200 font-mono font-bold">{currentUser?.email}</span>
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

      {/* Seller Listings List */}
      {userListings.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center max-w-lg mx-auto shadow-sm">
          <div className="w-16 h-16 bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-500 border border-slate-200/50 dark:border-white/10">
            <Clock className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No Active Listings Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            You haven't posted any items yet under your verified email. Click upload to create your first listing!
          </p>
          <button
            onClick={onOpenUpload}
            className="mt-4 px-4 py-2 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-xs"
          >
            Post First Item
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {userListings.map((item) => {
            const now = new Date();
            const expiresAt = new Date(item.expiresAt);
            const diffTime = expiresAt - now;
            const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
            const isExpiringSoon = daysLeft <= 3;

            return (
              <div
                key={item.id}
                className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all shadow-sm"
              >
                
                {/* Item Thumbnail & Information */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 shrink-0 border border-slate-200/60 dark:border-white/10">
                    <img
                      src={item.images[item.thumbnailIndex || 0] || item.images[0]}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold glass-badge text-slate-700 dark:text-slate-300 rounded">
                        {item.category}
                      </span>
                      {item.isCartSell && (
                        <span className="px-2 py-0.5 text-[10px] font-extrabold glass-badge text-slate-800 dark:text-slate-200 rounded flex items-center gap-1">
                          <Layers className="w-3 h-3 text-slate-500" />
                          Cart Sell ({item.subItems?.length || 0} sub-items)
                        </span>
                      )}
                    </div>

                    <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm sm:text-base line-clamp-1">
                      {item.title}
                    </h4>

                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-black text-slate-900 dark:text-white text-sm">₹{item.price.toLocaleString('en-IN')}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-semibold">
                        <Clock className={`w-3.5 h-3.5 ${isExpiringSoon ? 'text-rose-500' : 'text-slate-400'}`} />
                        <span className={isExpiringSoon ? 'text-rose-500 font-bold' : ''}>
                          {daysLeft === 0 ? 'Expired' : `${daysLeft} Days Remaining`}
                        </span>
                      </span>
                      <InfoTooltip text="Item automatically disappears after 21 days. Click 'Extend Timer' to add 21 more days." position="top" />
                    </div>
                  </div>
                </div>

                {/* Dashboard Action Controls */}
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200/50 dark:border-white/10">
                  
                  {/* Extend Timer Button */}
                  <div className="flex items-center">
                    <button
                      onClick={() => onExtendTimer(item.id)}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-2xl glass-badge text-slate-800 dark:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                      <span>Extend (+21d)</span>
                    </button>
                    <InfoTooltip text="Resets the 21-day countdown timer back to full length." position="top" />
                  </div>

                  {/* Mark as Sold Button */}
                  <div className="flex items-center">
                    <button
                      onClick={() => onMarkAsSold(item.id)}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-extrabold rounded-2xl glass-badge text-slate-900 dark:text-white hover:bg-white/90 dark:hover:bg-slate-800/90 transition-all"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-slate-500" />
                      <span>Mark as Sold</span>
                    </button>
                    <InfoTooltip text="Instantly and permanently removes item from public bulletin feed to stop incoming WhatsApp messages." position="top" />
                  </div>

                  {/* Delete Button */}
                  <div className="flex items-center">
                    <button
                      onClick={() => onDeleteListing(item.id)}
                      className="p-2 text-slate-400 hover:text-rose-500 rounded-2xl transition-all glass-badge hover:bg-rose-50/50 dark:hover:bg-rose-950/30"
                      title="Delete Listing"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <InfoTooltip text="Delete listing from database." position="top" />
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
