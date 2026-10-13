import React, { useState } from 'react';
import {
  X, ChevronLeft, ChevronRight, MessageCircle, ExternalLink, Flag, Share2,
  CheckCircle2, Clock, Layers, ShieldAlert, Copy, Sparkles, Building2, PhoneCall, Tag,
  Trash2, CheckCircle
} from 'lucide-react';
import { DEFAULT_ADMIN_SUPPORT_WHATSAPP } from '../data/mockData';

export default function ProductDetailModal({
  item,
  onClose,
  onReportItem,
  currentUser,
  onMarkAsSold,
  onDeleteListing
}) {
  if (!item) return null;

  const [activeImageIndex, setActiveImageIndex] = useState(item.thumbnailIndex || 0);

  const [selectedSubItemIds, setSelectedSubItemIds] = useState(() => {
    if (item.subItems && item.subItems.length > 0) {
      return item.subItems.filter(s => s.selected !== false).map(s => s.id);
    }
    return [];
  });

  const [toastMessage, setToastMessage] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleSubItem = (subId) => {
    if (selectedSubItemIds.includes(subId)) {
      setSelectedSubItemIds(selectedSubItemIds.filter(id => id !== subId));
    } else {
      setSelectedSubItemIds([...selectedSubItemIds, subId]);
    }
  };

  const selectedSubItems = item.subItems ? item.subItems.filter(s => selectedSubItemIds.includes(s.id)) : [];
  const totalPrice = item.isCartSell
    ? selectedSubItems.reduce((acc, curr) => acc + (curr.price || 0), 0)
    : item.price;

  const targetWhatsapp = item.reroutedToAdmin
    ? DEFAULT_ADMIN_SUPPORT_WHATSAPP
    : (item.sellerWhatsapp || DEFAULT_ADMIN_SUPPORT_WHATSAPP);

  const generateWhatsappUrl = () => {
    const cleanNum = targetWhatsapp.replace(/[^0-9]/g, '');
    let text = '';

    if (item.isCartSell && selectedSubItems.length > 0) {
      const itemListStr = selectedSubItems.map(s => `• ${s.title} (₹${s.price})`).join('\n');
      text = `Hey! I am interested in buying the following items from your listing "${item.title}" on buyKꞰsell (IISER Mohali):\n\n${itemListStr}\n\nTotal Price: ₹${totalPrice.toLocaleString('en-IN')}.\nAre these still available?`;
    } else {
      text = `Hey! I am interested in buying "${item.title}" listed for ₹${item.price.toLocaleString('en-IN')} on buyKꞰsell (IISER Mohali).\nIs this still available?`;
    }

    return `https://wa.me/${cleanNum}?text=${encodeURIComponent(text)}`;
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      triggerToast('Listing link copied to clipboard!');
    }).catch(() => {
      triggerToast('Direct share link ready!');
    });
  };

  const handleReportSubmit = (e) => {
    e.preventDefault();
    if (!reportReason.trim()) return;
    onReportItem(item.id, reportReason);
    setShowReportModal(false);
    triggerToast('Report submitted to Admin Moderation.');
  };

  const images = item.images && item.images.length > 0 ? item.images : [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      
      {/* Toast Alert Popup */}
      {toastMessage && (
        <div
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 font-extrabold text-xs sm:text-sm px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 border animate-bounce"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-card)',
            color: 'var(--text-primary)'
          }}
        >
          <Sparkles className="w-4 h-4 text-section-icon" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Modal Card Container */}
      <div
        className="rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh] border"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-card)'
        }}
      >
        
        {/* Modal Header Bar */}
        <div
          className="p-4 sm:p-5 border-b flex items-center justify-between sticky top-0 z-10"
          style={{
            backgroundColor: 'var(--bg-nav)',
            borderColor: 'var(--border-card)',
            color: 'var(--text-on-dark)'
          }}
        >
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm" style={{ color: 'var(--text-on-dark)' }}>
              Item Details
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Share Button */}
            <button
              onClick={handleShare}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Share Listing"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Flag / Report Button */}
            <button
              onClick={() => setShowReportModal(true)}
              className="p-2 rounded-xl text-white/80 hover:text-rose-400 hover:bg-white/10 transition-colors cursor-pointer"
              title="Report Listing"
            >
              <Flag className="w-4 h-4" />
            </button>

            {/* Close Modal Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1" style={{ color: 'var(--text-primary)' }}>
          
          {/* Image Container */}
          <div
            className="relative rounded-2xl overflow-hidden border group"
            style={{
              backgroundColor: 'var(--bg-body)',
              borderColor: 'var(--border-card)'
            }}
          >
            <div className="h-64 sm:h-80 w-full relative flex items-center justify-center">
              {images.length > 0 ? (
                <img
                  src={images[activeImageIndex]}
                  alt={item.title}
                  className="max-h-full w-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 gap-2 p-6 text-center">
                  <Package className="w-12 h-12 stroke-1 text-section-icon" />
                  <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
                    IISER Mohali Item Listing
                  </span>
                </div>
              )}

              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                    className="absolute left-3 p-2 rounded-lg border transition-all shadow-lg cursor-pointer"
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      borderColor: 'var(--border-card)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-3 p-2 rounded-lg border transition-all shadow-lg cursor-pointer"
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      borderColor: 'var(--border-card)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Carousel Thumbnails */}
            {images.length > 1 && (
              <div
                className="p-2 border-t flex gap-2 overflow-x-auto justify-center"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-card)'
                }}
              >
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className="w-14 h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer"
                    style={{
                      borderColor: activeImageIndex === idx ? 'var(--btn-primary-bg)' : 'transparent',
                      opacity: activeImageIndex === idx ? 1 : 0.6
                    }}
                  >
                    <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Core Details Header */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span
                className="px-2.5 py-1 text-xs font-bold rounded-md border flex items-center gap-1"
                style={{
                  backgroundColor: 'var(--bg-body)',
                  borderColor: 'var(--border-card)',
                  color: 'var(--text-primary)'
                }}
              >
                <Tag className="w-3 h-3 text-section-icon" />
                {item.category}
              </span>

              <span
                className="px-2.5 py-1 text-xs font-bold rounded-md border"
                style={{
                  backgroundColor: 'var(--bg-body)',
                  borderColor: 'var(--border-card)',
                  color: 'var(--text-secondary)'
                }}
              >
                Condition: {item.condition}
              </span>

              {item.isNegotiable ? (
                <span className="badge-deal px-2.5 py-1 text-xs font-bold rounded-md shadow-sm">
                  Price Negotiable
                </span>
              ) : (
                <span
                  className="px-2.5 py-1 text-xs font-bold rounded-md border"
                  style={{
                    backgroundColor: 'var(--bg-body)',
                    borderColor: 'var(--border-card)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  Fixed Price
                </span>
              )}

              {item.isCartSell && (
                <span className="badge-featured px-2.5 py-1 text-xs font-bold rounded-md shadow-sm flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" />
                  Room Clear-Out Bundle
                </span>
              )}

              {item.reroutedToAdmin && (
                <span className="badge-b2b px-2.5 py-1 text-xs font-bold rounded-md shadow-sm flex items-center gap-1">
                  <PhoneCall className="w-3.5 h-3.5" />
                  Admin Support Handoff
                </span>
              )}
            </div>

            {/* Title: --btn-primary-bg (light) / --text-primary (dark) */}
            <h2 className="heading-card-title text-xl sm:text-2xl font-extrabold tracking-tight leading-snug">
              {item.title}
            </h2>

            {/* Price display: regular prices use --text-primary; discounted/sale use --text-price-sale */}
            <div className="mt-3 flex items-baseline gap-2">
              <span className={`text-2xl sm:text-3xl font-black ${item.isNegotiable || item.isCartSell ? 'price-sale' : 'price-regular'}`}>
                ₹{totalPrice.toLocaleString('en-IN')}
              </span>
              {item.isCartSell && (
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  (Selected {selectedSubItems.length} of {item.subItems?.length || 0} sub-items)
                </span>
              )}
            </div>
          </div>

          {/* Item Description */}
          <div
            className="p-4 rounded-2xl border"
            style={{
              backgroundColor: 'var(--bg-body)',
              borderColor: 'var(--border-card)'
            }}
          >
            <h4 className="heading-section text-xs font-extrabold uppercase tracking-wider mb-1">
              Item Description
            </h4>
            <p className="text-sm whitespace-pre-line leading-relaxed" style={{ color: 'var(--text-primary)' }}>
              {item.description}
            </p>
          </div>

          {/* E-Commerce Reference Links */}
          {item.referenceLinks && item.referenceLinks.length > 0 && (
            <div
              className="p-4 rounded-2xl border"
              style={{
                backgroundColor: 'var(--bg-body)',
                borderColor: 'var(--border-card)'
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="heading-section text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-section-icon" />
                  <span>Retail Price Reference Links</span>
                </h4>
              </div>
              <div className="space-y-2">
                {item.referenceLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition-all shadow-sm group hover:underline"
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      borderColor: 'var(--border-card)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <span className="truncate max-w-[80%]">{link.label || link.url}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-section-icon shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Cart / Bundle Sub-items Selector */}
          {item.isCartSell && item.subItems && item.subItems.length > 0 && (
            <div
              className="p-4 rounded-2xl border"
              style={{
                backgroundColor: 'var(--bg-body)',
                borderColor: 'var(--border-card)'
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="heading-section text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-section-icon" />
                    <span>Bundle Items</span>
                  </h4>
                </div>
              </div>

              <div className="space-y-2">
                {item.subItems.map((sub) => {
                  const isChecked = selectedSubItemIds.includes(sub.id);
                  return (
                    <label
                      key={sub.id}
                      className="flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer"
                      style={{
                        backgroundColor: isChecked ? 'var(--bg-surface)' : 'var(--bg-body)',
                        borderColor: isChecked ? 'var(--btn-primary-bg)' : 'var(--border-card)',
                        boxShadow: isChecked ? '0 4px 12px rgba(0, 0, 0, 0.08)' : 'none'
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSubItem(sub.id)}
                          className="w-4 h-4 rounded cursor-pointer"
                        />
                        <span className="text-xs sm:text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                          {sub.title}
                        </span>
                      </div>
                      <span className="text-xs sm:text-sm font-black price-sale">
                        ₹{sub.price}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Seller Metadata */}
          <div
            className="p-3 rounded-xl border flex items-center justify-between text-xs"
            style={{
              backgroundColor: 'var(--bg-body)',
              borderColor: 'var(--border-card)'
            }}
          >
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Seller: </span>
              <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                {item.sellerName || 'Verified Student'}
              </span>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Listing Contact: </span>
              <span className="font-mono font-bold" style={{ color: 'var(--btn-primary-bg)' }}>
                {targetWhatsapp}
              </span>
            </div>
          </div>

        </div>

        {/* Primary CTA Action Footer */}
        <div
          className="p-4 sm:p-5 border-t space-y-3"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-card)'
          }}
        >
          {/* Owner or Admin Quick Actions: Mark as Sold or Delete */}
          {(currentUser?.email?.toLowerCase() === item.sellerEmail?.toLowerCase() || currentUser?.isAdmin) && (
            <div
              className="p-3 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs"
              style={{
                backgroundColor: 'var(--bg-body)',
                borderColor: 'var(--border-card)'
              }}
            >
              <div>
                <span className="font-bold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                  <span>Listing Owner Actions</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold text-emerald-700 bg-emerald-500/10 dark:text-emerald-300">
                    Active
                  </span>
                </span>
                <p className="text-[11px] opacity-75 mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  Marking sold or deleting permanently removes item & photos from Supabase.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {onMarkAsSold && (
                  <button
                    type="button"
                    onClick={() => {
                      onMarkAsSold(item.id);
                      onClose();
                    }}
                    className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 text-white shadow-sm cursor-pointer"
                    style={{ backgroundColor: 'var(--badge-stock)' }}
                    title="Mark listing as sold and permanently delete from Supabase"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Sold</span>
                  </button>
                )}

                {onDeleteListing && (
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteListing(item.id);
                      onClose();
                    }}
                    className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 border text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    style={{ borderColor: 'var(--border-card)' }}
                    title="Delete listing permanently from Supabase"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </div>
          )}

          <a
            href={generateWhatsappUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-sm sm:text-base font-bold shadow-xl cursor-pointer"
          >
            <MessageCircle className="w-5 h-5 text-current" />
            <span>
              {item.isCartSell
                ? `Chat on WhatsApp (Selected: ₹${totalPrice.toLocaleString('en-IN')})`
                : 'Chat on WhatsApp'}
            </span>
          </a>
        </div>

      </div>

      {/* Report Modal Dialog */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div
            className="border rounded-2xl max-w-md w-full p-6 shadow-2xl"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-card)',
              color: 'var(--text-primary)'
            }}
          >
            <div className="flex items-center gap-2 font-bold mb-2 text-rose-500">
              <ShieldAlert className="w-5 h-5" />
              <span>Report Listing to Admin</span>
            </div>
            <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
              Help keep IISER Mohali campus safe. Please describe why this item should be reviewed by moderators.
            </p>
            <form onSubmit={handleReportSubmit} className="space-y-4">
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Reason (e.g. Prohibited item, fake price, duplicate post, inappropriate content)..."
                rows={3}
                className="w-full border rounded-xl p-3 text-xs placeholder-slate-400 focus:outline-none"
                style={{
                  backgroundColor: 'var(--bg-body)',
                  borderColor: 'var(--border-card)',
                  color: 'var(--text-primary)'
                }}
                required
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-all cursor-pointer shadow-md"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
