import React, { useState } from 'react';
import { ShieldCheck, UserX, UserCheck, Trash2, PhoneCall, Plus, X, Layers, Users, ShieldAlert, Sparkles } from 'lucide-react';
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
      
      {/* ─── ADMIN HEADER BANNER ────────────────────────────────────────────── */}
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
              <ShieldCheck className="w-4 h-4 text-section-icon" />
              <span className="heading-section text-xs font-extrabold uppercase tracking-wider">
                Moderator Access Portal
              </span>
            </div>
            
            <h2 className="heading-section text-2xl sm:text-3xl font-extrabold tracking-tight">
              Admin & Campus Logistics Control
            </h2>

            <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Manage user suspensions, content moderation, automated banned keywords, and hostel room handoffs.
            </p>
          </div>

          {/* Admin Navigation Pills */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('moderation')}
              className={`px-3.5 py-2 text-xs font-bold rounded-2xl transition-all cursor-pointer border ${
                activeTab === 'moderation'
                  ? 'btn-primary shadow-md'
                  : 'hover:opacity-80'
              }`}
              style={activeTab !== 'moderation' ? {
                backgroundColor: 'var(--bg-body)',
                borderColor: 'var(--border-card)',
                color: 'var(--text-secondary)'
              } : {}}
            >
              Listings Moderation ({listings.length})
            </button>

            <button
              onClick={() => setActiveTab('keywords')}
              className={`px-3.5 py-2 text-xs font-bold rounded-2xl transition-all cursor-pointer border ${
                activeTab === 'keywords'
                  ? 'btn-primary shadow-md'
                  : 'hover:opacity-80'
              }`}
              style={activeTab !== 'keywords' ? {
                backgroundColor: 'var(--bg-body)',
                borderColor: 'var(--border-card)',
                color: 'var(--text-secondary)'
              } : {}}
            >
              Banned Keywords ({bannedKeywords.length})
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`px-3.5 py-2 text-xs font-bold rounded-2xl transition-all cursor-pointer border ${
                activeTab === 'users'
                  ? 'btn-primary shadow-md'
                  : 'hover:opacity-80'
              }`}
              style={activeTab !== 'users' ? {
                backgroundColor: 'var(--bg-body)',
                borderColor: 'var(--border-card)',
                color: 'var(--text-secondary)'
              } : {}}
            >
              User Directory ({users.length})
            </button>
          </div>
        </div>
      </div>

      {/* ─── TAB 1: LISTINGS MODERATION ───────────────────────────────────────── */}
      {activeTab === 'moderation' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="heading-section text-sm sm:text-base font-extrabold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-section-icon" />
              <span>Campus Bulletin Listings ({filteredListings.length})</span>
            </h3>

            <label className="flex items-center gap-2 text-xs font-bold cursor-pointer" style={{ color: 'var(--text-primary)' }}>
              <input
                type="checkbox"
                checked={filterReroutedOnly}
                onChange={(e) => setFilterReroutedOnly(e.target.checked)}
                className="w-4 h-4 rounded cursor-pointer"
              />
              <span>Show Rerouted / Room Clearouts Only</span>
            </label>
          </div>

          <div className="space-y-3">
            {filteredListings.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm border"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-card)'
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-12 h-12 rounded-xl overflow-hidden border shrink-0"
                    style={{
                      backgroundColor: 'var(--bg-body)',
                      borderColor: 'var(--border-card)'
                    }}
                  >
                    <img
                      src={item.images?.[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=200&q=80'}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="heading-card-title font-extrabold text-sm sm:text-base truncate">
                        {item.title}
                      </span>
                      {item.reroutedToAdmin && (
                        <span className="badge-b2b text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                          Rerouted to Admin
                        </span>
                      )}
                      {item.isCartSell && (
                        <span className="badge-featured text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                          Room Clearout ({item.subItems?.length || 0})
                        </span>
                      )}
                    </div>
                    <div className="text-xs mt-0.5 flex flex-wrap items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                      <span className="font-bold price-regular">₹{item.price.toLocaleString('en-IN')}</span>
                      <span>•</span>
                      <span>Seller: {item.sellerEmail}</span>
                      <span>•</span>
                      <span>WhatsApp: {item.sellerWhatsapp || 'Not set'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => onToggleRerouteChat(item.id, !item.reroutedToAdmin)}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors flex items-center gap-1.5 cursor-pointer"
                    style={{
                      backgroundColor: item.reroutedToAdmin ? 'var(--badge-b2b)' : 'var(--bg-body)',
                      borderColor: 'var(--border-card)',
                      color: item.reroutedToAdmin ? '#FFFFFF' : 'var(--text-primary)'
                    }}
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>{item.reroutedToAdmin ? 'Reroute Active' : 'Reroute to Admin'}</span>
                  </button>

                  <button
                    onClick={() => onForceDeleteListing(item.id)}
                    className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl border transition-colors cursor-pointer"
                    style={{ borderColor: 'var(--border-card)' }}
                    title="Force delete this listing"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 2: BANNED KEYWORDS ───────────────────────────────────────────── */}
      {activeTab === 'keywords' && (
        <div
          className="rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm border"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-card)'
          }}
        >
          <div>
            <h3 className="heading-section text-base font-extrabold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-section-icon" />
              <span>Automated Banned Keywords</span>
            </h3>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              Any listing whose title, description, or clear-out bundle item contains any of these keywords will be blocked at submission.
            </p>
          </div>

          <form onSubmit={handleAddKeyword} className="flex gap-2 max-w-md">
            <input
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              placeholder="Add prohibited term..."
              className="flex-1 rounded-xl px-3.5 py-2 text-xs border"
              style={{
                backgroundColor: 'var(--bg-body)',
                borderColor: 'var(--border-card)',
                color: 'var(--text-primary)'
              }}
            />
            <button
              type="submit"
              className="btn-primary px-4 py-2 text-xs font-bold shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Add Keyword</span>
            </button>
          </form>

          <div className="flex flex-wrap gap-2 pt-2">
            {bannedKeywords.map((kw) => (
              <span
                key={kw}
                className="px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-2 shadow-xs"
                style={{
                  backgroundColor: 'var(--bg-body)',
                  borderColor: 'var(--border-card)',
                  color: 'var(--text-primary)'
                }}
              >
                <span>{kw}</span>
                <button
                  type="button"
                  onClick={() => onRemoveBannedKeyword(kw)}
                  className="text-slate-400 hover:text-rose-500 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 3: USER DIRECTORY ────────────────────────────────────────────── */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <h3 className="heading-section text-sm sm:text-base font-extrabold flex items-center gap-2">
            <Users className="w-4 h-4 text-section-icon" />
            <span>Campus Users Directory ({users.length})</span>
          </h3>

          <div className="space-y-3">
            {users.map((u) => (
              <div
                key={u.id || u.email}
                className="rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 shadow-sm border"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-card)'
                }}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>
                      {u.name || 'Verified Student'}
                    </span>
                    {u.isAdmin && (
                      <span className="badge-stock text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Admin
                      </span>
                    )}
                    {u.isSuspended && (
                      <span className="badge-clearance text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Suspended
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    {u.email} • WhatsApp: {u.whatsapp || 'Not set'}
                  </div>
                </div>

                {!u.isAdmin && (
                  <button
                    onClick={() => onToggleSuspendUser(u.email, !u.isSuspended)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors flex items-center gap-1.5 cursor-pointer ${
                      u.isSuspended
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'text-rose-500 hover:bg-rose-500/10'
                    }`}
                    style={!u.isSuspended ? { borderColor: 'var(--border-card)' } : {}}
                  >
                    {u.isSuspended ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Reinstate Account</span>
                      </>
                    ) : (
                      <>
                        <UserX className="w-3.5 h-3.5" />
                        <span>Suspend Access</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
