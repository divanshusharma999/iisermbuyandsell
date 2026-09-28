import React, { useState } from 'react';
import { X, Plus, Trash2, Image as ImageIcon, Link as LinkIcon, AlertTriangle, Layers, Tag, DollarSign, Sparkles, Upload, Loader2 } from 'lucide-react';
import { CATEGORIES, CONDITIONS } from '../data/mockData';
import InfoTooltip from './InfoTooltip';
import { uploadProductImage } from '../supabase';

const SAMPLE_STOCK_IMAGES = [
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f6?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80'
];

export default function UploadModal({ onClose, onSubmit, currentUser, bannedKeywords = [] }) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Textbooks');
  const [condition, setCondition] = useState('Good');
  const [description, setDescription] = useState('');
  const [isNegotiable, setIsNegotiable] = useState(true);
  const [isCartSell, setIsCartSell] = useState(false);

  const [images, setImages] = useState([
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'
  ]);
  const [thumbnailIndex, setThumbnailIndex] = useState(0);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatusMsg, setUploadStatusMsg] = useState(null);

  const [referenceLinks, setReferenceLinks] = useState([
    { label: 'Amazon Retail Link', url: '' }
  ]);

  const [subItems, setSubItems] = useState([
    { id: 'sub-1', title: 'Single Mattress', price: 1200, selected: true },
    { id: 'sub-2', title: 'Study Lamp', price: 350, selected: true }
  ]);

  const [bannedKeywordError, setBannedKeywordError] = useState(null);

  // File Upload Handler
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (images.length + files.length > 5) {
      alert('Maximum 5 images allowed per listing.');
      return;
    }

    setIsUploading(true);
    setUploadStatusMsg('Uploading image to Supabase Storage...');

    try {
      const uploadedUrls = [];
      for (const file of files) {
        const url = await uploadProductImage(file);
        if (url) uploadedUrls.push(url);
      }
      setImages([...images, ...uploadedUrls]);
      setUploadStatusMsg('Uploaded to Supabase successfully!');
      setTimeout(() => setUploadStatusMsg(null), 3000);
    } catch (err) {
      console.warn("Upload error:", err);
      const localUrls = files.map(file => URL.createObjectURL(file));
      setImages([...images, ...localUrls]);
      setUploadStatusMsg('Previewing local image.');
      setTimeout(() => setUploadStatusMsg(null), 4000);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddImage = (urlToAdd) => {
    const targetUrl = urlToAdd || imageUrlInput;
    if (!targetUrl || images.length >= 5) return;
    setImages([...images, targetUrl]);
    setImageUrlInput('');
  };

  const handleRemoveImage = (index) => {
    const updated = images.filter((_, i) => i !== index);
    setImages(updated);
    if (thumbnailIndex >= updated.length) {
      setThumbnailIndex(Math.max(0, updated.length - 1));
    }
  };

  const handleAddRefLink = () => {
    setReferenceLinks([...referenceLinks, { label: '', url: '' }]);
  };

  const handleRemoveRefLink = (idx) => {
    setReferenceLinks(referenceLinks.filter((_, i) => i !== idx));
  };

  const handleRefLinkChange = (idx, field, value) => {
    const updated = [...referenceLinks];
    updated[idx][field] = value;
    setReferenceLinks(updated);
  };

  const handleAddSubItem = () => {
    setSubItems([...subItems, { id: `sub-${Date.now()}`, title: '', price: 0, selected: true }]);
  };

  const handleRemoveSubItem = (id) => {
    setSubItems(subItems.filter(s => s.id !== id));
  };

  const handleSubItemChange = (id, field, value) => {
    setSubItems(subItems.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const checkBannedKeywords = (text) => {
    const lowerText = text.toLowerCase();
    for (const word of bannedKeywords) {
      if (word.trim() && lowerText.includes(word.toLowerCase().trim())) {
        return word;
      }
    }
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setBannedKeywordError(null);

    const fullTextToScan = `${title} ${description} ${subItems.map(s => s.title).join(' ')}`;
    const foundBanned = checkBannedKeywords(fullTextToScan);

    if (foundBanned) {
      setBannedKeywordError(`Upload blocked: Title or description contains prohibited keyword "${foundBanned}". Please remove it.`);
      return;
    }

    if (images.length === 0) {
      setBannedKeywordError('Please add at least 1 image for your item listing.');
      return;
    }

    const finalPrice = isCartSell
      ? subItems.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0)
      : Number(price);

    const newListing = {
      id: `item-${Date.now()}`,
      title,
      price: finalPrice,
      category,
      condition,
      description,
      isCartSell,
      isNegotiable,
      sellerEmail: currentUser?.email || 'student@iisermohali.ac.in',
      sellerName: currentUser?.name || 'IISER Student',
      sellerWhatsapp: currentUser?.whatsapp || '+919876543210',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
      reroutedToAdmin: false,
      images,
      thumbnailIndex,
      referenceLinks: referenceLinks.filter(r => r.url.trim() !== ''),
      subItems: isCartSell ? subItems.filter(s => s.title.trim() !== '') : []
    };

    onSubmit(newListing);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="glass-modal rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200/50 dark:border-white/10 flex items-center justify-between backdrop-blur-md sticky top-0 z-10">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Post KollectoP2P Listing</span>
              <InfoTooltip text="Single-page upload flow with image hosting." position="bottom" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Locked to @iisermohali.ac.in verified student network</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          
          {/* Banned Keyword Warning Banner */}
          {bannedKeywordError && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/90 border border-rose-200 dark:border-rose-500/50 rounded-2xl text-rose-700 dark:text-rose-200 text-xs font-bold flex items-center gap-2 animate-bounce">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>{bannedKeywordError}</span>
            </div>
          )}

          {/* 1. Media Upload Section */}
          <div className="bg-slate-50 dark:bg-slate-950/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-xs flex items-center gap-1">
                <ImageIcon className="w-4 h-4 text-emerald-500" />
                <span>Upload Media</span>
                <InfoTooltip text="Upload product photos from your device. Radio button overlay sets the cover thumbnail." position="right" />
              </label>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">{images.length}/5 uploaded</span>
            </div>

            {/* Thumbnail Radio Overlay Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {images.map((img, idx) => (
                <div key={idx} className="relative group h-24 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900">
                  <img src={img} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                  
                  <label className="absolute top-1 left-1 bg-slate-950/90 rounded-full p-1 border border-slate-700 cursor-pointer flex items-center gap-1 text-[10px] text-white px-1.5 shadow">
                    <input
                      type="radio"
                      name="thumbnail"
                      checked={thumbnailIndex === idx}
                      onChange={() => setThumbnailIndex(idx)}
                      className="accent-emerald-500 w-3 h-3 cursor-pointer"
                    />
                    <span>{thumbnailIndex === idx ? 'Cover' : 'Set'}</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-rose-600/90 text-white rounded-full opacity-80 hover:opacity-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* File Upload Dropzone */}
            {images.length < 5 && (
              <div className="space-y-3 pt-2">
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-2xl glass-card cursor-pointer transition-colors text-center" style={{borderColor:'var(--apple-blue)', opacity: 0.85}}>
                  <div className="flex items-center gap-2 font-extrabold text-xs" style={{color:'var(--apple-blue)'}}>
                    {isUploading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Upload className="w-5 h-5" />
                    )}
                    <span>{isUploading ? 'Uploading...' : 'Choose File to Upload'}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">PNG, JPG, WEBP up to 10MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>

                {uploadStatusMsg && (
                  <div className="text-[11px] font-bold glass-badge p-2 rounded-xl text-center" style={{color:'var(--apple-blue)'}}>
                    {uploadStatusMsg}
                  </div>
                )}

                {/* Direct URL Input */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="Or paste external image URL (e.g. https://...)"
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddImage()}
                    className="px-3 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs"
                  >
                    Add URL
                  </button>
                </div>

                <div className="text-[11px] text-slate-500 dark:text-slate-400">Or pick from sample campus photos:</div>
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {SAMPLE_STOCK_IMAGES.map((sampleUrl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleAddImage(sampleUrl)}
                      className="w-12 h-12 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 opacity-70 hover:opacity-100 shrink-0"
                    >
                      <img src={sampleUrl} alt="Stock option" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 2. Core Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs mb-1">
                Item Title *
                <InfoTooltip text="Descriptive title." position="right" />
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Dell 24-inch IPS Monitor (1080p, 75Hz)"
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>

            {!isCartSell && (
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs mb-1">
                  Asking Price (₹) *
                  <InfoTooltip text="Set your initial asking price in INR." position="right" />
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 1200"
                    min="0"
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                    required={!isCartSell}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs mb-1">
                Category *
                <InfoTooltip text="Pick the primary tag for buyer filtering." position="right" />
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none cursor-pointer"
              >
                {CATEGORIES.filter(c => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs mb-1">
                Condition *
                <InfoTooltip text="Specify the item's physical condition state." position="right" />
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none cursor-pointer"
              >
                {CONDITIONS.map((cond) => (
                  <option key={cond} value={cond}>{cond}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs mb-1">
                Description & Hostel Details *
                <InfoTooltip text="Include usage history, hostel block, and pickup details." position="right" />
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mention how long you've used the item, hostel number, and availability..."
                rows={3}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* 3. Toggles */}
          <div className="bg-slate-50 dark:bg-slate-950/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-extrabold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1">
                  <Layers className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>Single Item vs Cart Sell (Room Clear-out)</span>
                  <InfoTooltip text="Enable 'Cart Sell' if you are selling multiple sub-items under one listing." position="right" />
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Allows buyers to select individual sub-items with checkboxes!</p>
              </div>

              <button
                type="button"
                onClick={() => setIsCartSell(!isCartSell)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isCartSell ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-800'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isCartSell ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {isCartSell && (
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-teal-600 dark:text-teal-400">
                  <span>Room Clearout Sub-Items</span>
                  <button
                    type="button"
                    onClick={handleAddSubItem}
                    className="text-xs bg-teal-500/10 text-teal-700 dark:text-teal-300 hover:bg-teal-500/20 px-2 py-1 rounded-lg border border-teal-500/30 flex items-center gap-1 font-bold"
                  >
                    <Plus className="w-3 h-3" /> Add Sub-Item
                  </button>
                </div>

                {subItems.map((sub, i) => (
                  <div key={sub.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={sub.title}
                      onChange={(e) => handleSubItemChange(sub.id, 'title', e.target.value)}
                      placeholder="e.g. Single Mattress"
                      className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-900 dark:text-white"
                      required
                    />
                    <div className="relative w-28">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                      <input
                        type="number"
                        value={sub.price}
                        onChange={(e) => handleSubItemChange(sub.id, 'price', e.target.value)}
                        placeholder="Price"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg pl-6 pr-2 py-2 text-xs text-slate-900 dark:text-white"
                        required
                      />
                    </div>
                    {subItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSubItem(sub.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800/80">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1">
                  <span>Price Flexibility (Negotiable)</span>
                  <InfoTooltip text="Indicate whether asking price is negotiable or firm non-negotiable." position="right" />
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsNegotiable(!isNegotiable)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isNegotiable ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-800'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isNegotiable ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 4. Retail Comparison Links */}
          <div className="bg-slate-50 dark:bg-slate-950/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-extrabold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1">
                <LinkIcon className="w-4 h-4 text-emerald-500" />
                <span>Retail Comparison Links</span>
                <InfoTooltip text="Paste Amazon or Flipkart product URLs so buyers can compare retail price against your used price." position="right" />
              </label>

              <button
                type="button"
                onClick={handleAddRefLink}
                className="text-xs bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 flex items-center gap-1 font-bold"
              >
                <Plus className="w-3 h-3" /> Add Link
              </button>
            </div>

            {referenceLinks.map((ref, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={ref.label}
                  onChange={(e) => handleRefLinkChange(idx, 'label', e.target.value)}
                  placeholder="Label (e.g. Amazon Retail Price)"
                  className="w-1/3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-900 dark:text-white"
                />
                <input
                  type="url"
                  value={ref.url}
                  onChange={(e) => handleRefLinkChange(idx, 'url', e.target.value)}
                  placeholder="URL (https://amazon.in/dp/...)"
                  className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-900 dark:text-white"
                />
                {referenceLinks.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveRefLink(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              className="btn-primary w-full py-3.5 px-6 rounded-2xl text-sm sm:text-base shadow-xl flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5 text-current" />
              <span>Publish Listing (21-Day Active Board)</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
