import React, { useState } from 'react';
import { ShieldCheck, UserX, UserCheck, Trash2, PhoneCall, Plus, X, Layers } from 'lucide-react';
import InfoTooltip from './InfoTooltip';

export default function AdminPanel({
  listings,
  users,
  onToggleSuspendUser,
  onForceDeleteListing,
  onToggleRerouteChat,
  bannedKeywords,
  onAddBannedKeyword,
  onRemoveBannedKeyword
}) {
  const [activeTab, setActiveTab] = useState('moderation');
  const [keywordInput, setKeywordInput] = useState('');
  const [filterReroutedOnly, setFilterReroutedOnly] = useState(false);

  const handleAddKeyword = (e) => {
    e.preventDefault();
    if (!keywordInput.trim()) return;
    onAddBannedKeyword(keywordInput.trim());
    setKeywordInput('');
  };

  const filteredListings = filterReroutedOnly
    ? listings.filter(l => l.reroutedToAdmin || l.isCartSell)
    : listings;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in">
      
      {/* Admin Panel Header Banner */}
      <div className="glass-modal rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-xs font-extrabold glass-badge rounded-full text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                Moderator Access
              </span>
              <InfoTooltip text="Secure backend moderator dashboard for IISER Mohali campus logistics & moderation." position="bottom" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Admin & Logistics Control
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage user suspensions, content moderation, automated banned keywords, and June-August room handoffs.
            </p>
          </div>

          {/* Admin Navigation Pills */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('moderation')}
              className={`px-3.5 py-2 text-xs font-bold rounded-2xl backdrop-blur-md transition-all ${
                activeTab === 'moderation'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-extrabold shadow-md'
                  : 'glass-badge text-slate-700 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-800/80'
              }`}
            >
              Feed Moderation ({listings.length})
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`px-3.5 py-2 text-xs font-bold rounded-2xl backdrop-blur-md transition-all ${
                activeTab === 'users'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-extrabold shadow-md'
                  : 'glass-badge text-slate-700 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-800/80'
              }`}
            >
              User Control ({users.length})
            </button>

            <button
              onClick={() => setActiveTab('keywords')}
              className={`px-3.5 py-2 text-xs font-bold rounded-2xl backdrop-blur-md transition-all ${
                activeTab === 'keywords'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-extrabold shadow-md'
                  : 'glass-badge text-slate-700 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-800/80'
              }`}
            >
              Banned Keywords ({bannedKeywords.length})
            </button>
          </div>
        </div>
      </div>

      {/* 1. MASTER FEED MODERATION & CHAT REROUTE */}
      {activeTab === 'moderation' && (
        <div className="space-y-4">
          <div className="glass-card p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <span className="font-bold text-slate-900 dark:text-white">Filter:</span>
              <button
                onClick={() => setFilterReroutedOnly(false)}
                className={`px-3 py-1 rounded-xl glass-badge transition-all ${!filterReroutedOnly ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold' : 'text-slate-500'}`}
              >
                All Listings ({listings.length})
              </button>
              <button
                onClick={() => setFilterReroutedOnly(true)}
                className={`px-3 py-1 rounded-xl glass-badge flex items-center gap-1 transition-all ${filterReroutedOnly ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold' : 'text-slate-500'}`}
              >
                <Layers className="w-3.5 h-3.5" />
                Cart Sell & Rerouted Only
              </button>
            </div>
            <InfoTooltip text="June-August Bridge: Rerouting chat swaps the seller's WhatsApp number to Admin Support so student admins can sell graduating senior room bundles to incoming first-years." position="top" />
          </div>

          <div className="space-y-3">
            {filteredListings.map((item) => (
              <div
                key={item.id}
                className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all shadow-sm"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 shrink-0 border border-slate-200/60 dark:border-white/10">
                    <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold glass-badge text-slate-700 dark:text-slate-300 rounded">
                        {item.category}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">by {item.sellerEmail}</span>
                    </div>
                    <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm mt-0.5">{item.title}</h4>
                    <div className="text-xs text-slate-900 dark:text-white font-black">₹{item.price.toLocaleString('en-IN')}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {item.isCartSell && (
                    <div className="flex items-center">
                      <button
                        onClick={() => onToggleRerouteChat(item.id)}
                        className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-2xl glass-badge transition-all ${
                          item.reroutedToAdmin
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-extrabold shadow-md'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-800/80'
                        }`}
                      >
                        <PhoneCall className="w-3.5 h-3.5 text-slate-500" />
                        <span>{item.reroutedToAdmin ? 'Chat Rerouted to Admin' : 'Reroute Chat (June Bridge)'}</span>
                      </button>
                      <InfoTooltip text="Reroutes embedded WhatsApp number to Admin Support (+919999888877). Perfect for graduating seniors leaving room essentials over summer break." position="top" />
                    </div>
                  )}

                  <div className="flex items-center">
                    <button
                      onClick={() => onForceDeleteListing(item.id)}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-2xl glass-badge hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Force Delete</span>
                    </button>
                    <InfoTooltip text="Instantly purge item from public feed for policy violations." position="top" />
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. USER CONTROL & SUSPENSION */}
      {activeTab === 'users' && (
        <div className="glass-card rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-white/10 pb-3">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Registered Student Accounts</h3>
            <InfoTooltip text="One-click suspend toggle blocks spammers from creating listings or sending messages." position="left" />
          </div>

          <div className="space-y-2">
            {users.map((usr) => (
              <div
                key={usr.email}
                className="flex items-center justify-between p-3.5 rounded-2xl glass-badge text-xs"
              >
                <div>
                  <div className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <span>{usr.name || 'IISER Student'}</span>
                    <span className="font-mono text-slate-500 dark:text-slate-400">({usr.email})</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    WhatsApp: {usr.whatsapp || 'Not configured'}
                  </div>
                </div>

                <div className="flex items-center">
                  <button
                    onClick={() => onToggleSuspendUser(usr.email)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl font-bold transition-all glass-badge ${
                      usr.isSuspended
                        ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 font-extrabold'
                        : 'hover:bg-white/80 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {usr.isSuspended ? <UserX className="w-3.5 h-3.5 text-rose-500" /> : <UserCheck className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{usr.isSuspended ? 'Suspended (Click to Unsuspend)' : 'Active (Suspend User)'}</span>
                  </button>
                  <InfoTooltip text="Blocks user from uploading new items or initiating chats." position="left" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. BANNED KEYWORDS MANAGEMENT */}
      {activeTab === 'keywords' && (
        <div className="glass-card rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-white/10 pb-3">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Automated Banned Keywords</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Listings containing these restricted terms will automatically block upload.</p>
            </div>
            <InfoTooltip text="Banned keywords scanner runs client-side prior to listing publishing." position="left" />
          </div>

          <form onSubmit={handleAddKeyword} className="flex gap-2">
            <input
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              placeholder="Enter new prohibited term (e.g. vape, exam paper)..."
              className="flex-1 glass-input rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              className="btn-primary px-4 py-2.5 text-xs rounded-2xl flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add Keyword
            </button>
          </form>

          <div className="flex flex-wrap gap-2 pt-2">
            {bannedKeywords.map((kw) => (
              <span
                key={kw}
                className="px-3 py-1.5 rounded-2xl glass-badge text-slate-800 dark:text-slate-200 text-xs font-mono font-bold flex items-center gap-2"
              >
                <span>{kw}</span>
                <button
                  onClick={() => onRemoveBannedKeyword(kw)}
                  className="hover:text-rose-500"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
