import React, { useState } from 'react';
import {
  X, ChevronLeft, ChevronRight, MessageCircle, ExternalLink, Flag, Share2,
  CheckCircle2, Clock, Layers, ShieldAlert, Copy, Sparkles, Building2, PhoneCall
} from 'lucide-react';
import { DEFAULT_ADMIN_SUPPORT_WHATSAPP } from '../data/mockData';
import InfoTooltip from './InfoTooltip';

export default function ProductDetailModal({ item, onClose, onReportItem, currentUser }) {
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
    : (item.sellerWhatsapp || '+919876543210');

  const generateWhatsappUrl = () => {
    const cleanNum = targetWhatsapp.replace(/[^0-9]/g, '');
    let text = '';

    if (item.isCartSell && selectedSubItems.length > 0) {
      const itemListStr = selectedSubItems.map(s => `• ${s.title} (₹${s.price})`).join('\n');
      text = `Hey! I am interested in buying the following items from your listing "${item.title}" on KollectoP2P (IISER Mohali):\n\n${itemListStr}\n\nTotal Price: ₹${totalPrice.toLocaleString('en-IN')}.\nAre these still available?`;
    } else {
      text = `Hey! I am interested in buying "${item.title}" listed for ₹${item.price.toLocaleString('en-IN')} on KollectoP2P (IISER Mohali).\nIs this still available?`;
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

  const images = item.images && item.images.length > 0
    ? item.images
    : ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80'];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      
      {/* Toast Alert Popup */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 glass-modal text-slate-900 dark:text-white font-extrabold text-xs sm:text-sm px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-slate-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Modal Card Container */}
      <div className="glass-modal rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
        
        {/* Modal Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200/50 dark:border-white/10 flex items-center justify-between backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-bold glass-badge text-slate-800 dark:text-slate-200 rounded-full flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              IISER Mohali Verified
            </span>
            <InfoTooltip text="Only authenticated @iisermohali.ac.in students can post verified listings." position="bottom" />
          </div>

          <div className="flex items-center gap-2">
            {/* Share Button */}
            <div className="flex items-center">
              <button
                onClick={handleShare}
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Share Listing"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <InfoTooltip text="Copy link to clipboard to share with batchmates or hostel WhatsApp groups." position="bottom" />
            </div>

            {/* Flag / Report Button */}
            <div className="flex items-center">
              <button
                onClick={() => setShowReportModal(true)}
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Report Listing"
              >
                <Flag className="w-4 h-4" />
              </button>
              <InfoTooltip text="Report spam, restricted items, or fake listings directly to Admin moderation." position="bottom" />
            </div>

            {/* Close Modal Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Image Carousel */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 group">
            <div className="h-64 sm:h-80 w-full relative flex items-center justify-center">
              <img
                src={images[activeImageIndex]}
                alt={item.title}
                className="max-h-full w-full object-contain"
              />

              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                    className="absolute left-3 p-2 rounded-full bg-white/90 dark:bg-slate-900/80 text-slate-800 dark:text-white hover:bg-slate-100 border border-slate-200 dark:border-slate-700 transition-all shadow-lg"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-3 p-2 rounded-full bg-white/90 dark:bg-slate-900/80 text-slate-800 dark:text-white hover:bg-slate-100 border border-slate-200 dark:border-slate-700 transition-all shadow-lg"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Carousel Thumbnails */}
            {images.length > 1 && (
              <div className="p-2 bg-slate-50 dark:bg-slate-950/90 border-t border-slate-200 dark:border-slate-800 flex gap-2 overflow-x-auto justify-center">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                      activeImageIndex === idx ? 'border-emerald-500 scale-105' : 'border-slate-300 dark:border-slate-800 opacity-60 hover:opacity-100'
                    }`}
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
              <span className="px-2.5 py-1 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md border border-slate-200 dark:border-slate-700">
                {item.category}
              </span>
              <span className="px-2.5 py-1 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md border border-slate-200 dark:border-slate-700">
                Condition: {item.condition}
              </span>
              {item.isNegotiable ? (
                <span className="px-2.5 py-1 text-xs font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-md">
                  Price Negotiable
                </span>
              ) : (
                <span className="px-2.5 py-1 text-xs font-bold bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/80 rounded-md">
                  Fixed Price
                </span>
              )}
              {item.reroutedToAdmin && (
                <span className="px-2.5 py-1 text-xs font-extrabold bg-purple-100 dark:bg-purple-900/80 text-purple-700 dark:text-purple-200 border border-purple-300 dark:border-purple-500/50 rounded-md flex items-center gap-1">
                  <PhoneCall className="w-3.5 h-3.5 text-purple-600 dark:text-purple-300" />
                  Room Clear-Out Handoff (Admin Managed)
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
              {item.title}
            </h2>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black" style={{color:'var(--apple-blue)'}}>
                ₹{totalPrice.toLocaleString('en-IN')}
              </span>
              {item.isCartSell && (
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  (Selected {selectedSubItems.length} of {item.subItems?.length || 0} sub-items)
                </span>
              )}
              <InfoTooltip text="Total estimated asking price. For cart sell bundles, selecting checkboxes adjusts the total." position="top" />
            </div>
          </div>

          {/* Item Description */}
          <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80">
            <h4 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Item Description</span>
              <InfoTooltip text="Seller detailed description of condition, usage history, and hostel room location." position="left" />
            </h4>
            <p className="text-sm text-slate-800 dark:text-slate-300 whitespace-pre-line leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* E-Commerce Reference Links */}
          {item.referenceLinks && item.referenceLinks.length > 0 && (
            <div className="bg-slate-50 dark:bg-slate-950/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5" style={{color:'var(--apple-blue)'}}>
                  <ExternalLink className="w-3.5 h-3.5" />
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
                    className="flex items-center justify-between p-2.5 rounded-xl glass-card text-xs text-slate-800 dark:text-slate-200 transition-all group shadow-sm hover:text-[var(--apple-blue)]"
                  >
                    <span className="font-bold group-hover:underline truncate max-w-[80%]">{link.label || link.url}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[var(--apple-blue)] shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Cart / Bundle Sub-items Selector */}
          {item.isCartSell && item.subItems && item.subItems.length > 0 && (
            <div className="glass-card p-4 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5" style={{color:'var(--apple-blue)'}}>
                    <Layers className="w-4 h-4" style={{color:'var(--apple-blue)'}} />
                    <span>Select Bundle Sub-Items</span>
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">Check the items you want to buy. WhatsApp message will automatically list your selection!</p>
                </div>
                <InfoTooltip text="Checkboxes allow buying specific items from a room clearout bundle instead of the full cart." position="left" />
              </div>

              <div className="space-y-2">
                {item.subItems.map((sub) => {
                  const isChecked = selectedSubItemIds.includes(sub.id);
                  return (
                    <label
                      key={sub.id}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-white dark:bg-slate-900/90 shadow-md'
                          : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100'
                      }`}
                      style={isChecked ? {borderColor:'var(--apple-blue)'} : {}}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSubItem(sub.id)}
                          className="w-4 h-4 rounded border-slate-300 cursor-pointer accent-[var(--apple-blue)]"
                        />
                        <span className={`text-xs sm:text-sm font-bold ${isChecked ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                          {sub.title}
                        </span>
                      </div>
                      <span className="text-xs sm:text-sm font-black" style={{color:'var(--apple-blue)'}}>
                        ₹{sub.price}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Seller Metadata */}
          <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div>
              <span className="text-slate-400 dark:text-slate-500">Seller: </span>
              <span className="text-slate-700 dark:text-slate-300 font-bold">{item.sellerName || 'Verified Student'}</span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500">Listing Contact: </span>
              <span className="font-mono font-bold" style={{color:'var(--apple-blue)'}}>{targetWhatsapp}</span>
            </div>
          </div>

        </div>

        {/* Primary CTA Action Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200/50 dark:border-white/10 flex items-center gap-3">
          <div className="flex-1 flex items-center">
            <a
              href={generateWhatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-sm sm:text-base shadow-xl"
            >
              <MessageCircle className="w-5 h-5 text-current" />
              <span>
                {item.isCartSell
                  ? `Chat on WhatsApp (Selected: ₹${totalPrice.toLocaleString('en-IN')})`
                  : 'Chat on WhatsApp'}
              </span>
            </a>
            <InfoTooltip text="Opens WhatsApp with a pre-filled message detailing your selected items and pricing." position="top" />
          </div>
        </div>

      </div>

      {/* Report Modal Dialog */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold mb-2">
              <ShieldAlert className="w-5 h-5" />
              <span>Report Listing to Admin</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Help keep IISER Mohali campus safe. Please describe why this item should be reviewed by moderators.
            </p>
            <form onSubmit={handleReportSubmit} className="space-y-4">
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Reason (e.g. Prohibited item, fake price, duplicate post, inappropriate content)..."
                rows={3}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-rose-500"
                required
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-all"
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
