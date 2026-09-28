import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, MessageCircle, ShoppingBag, Heart, Loader2,
  CheckCircle2, User, Phone, Mail, ArrowRight, Sparkles, AlertCircle
} from 'lucide-react';
import InfoTooltip from './InfoTooltip';
import {
  signInWithGoogle,
  getGoogleOAuthUrl,
  saveUserProfile
} from '../supabase';
import { isUserAdmin } from '../data/mockData';

export default function LoginPage({ currentUser, onSaveProfile }) {
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [googleOAuthUrl, setGoogleOAuthUrl] = useState(null);

  // First-time onboarding form state
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.whatsapp || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Sync profile details if currentUser changes
  useEffect(() => {
    if (currentUser?.name && !name) setName(currentUser.name);
    if (currentUser?.whatsapp && !phone) setPhone(currentUser.whatsapp);
  }, [currentUser]);

  // Pre-generate Supabase Google OAuth URL
  useEffect(() => {
    let isMounted = true;
    getGoogleOAuthUrl()
      .then(url => {
        if (isMounted && url) setGoogleOAuthUrl(url);
      })
      .catch(err => {
        console.warn("Could not prefetch Google OAuth URL:", err.message);
      });
    return () => { isMounted = false; };
  }, []);

  const handleGoogleSignIn = async (e) => {
    if (googleOAuthUrl) return; // If link has valid href with target="_top", let native anchor navigate
    if (e) e.preventDefault();

    setErrorMsg(null);
    setIsAuthLoading(true);

    try {
      await signInWithGoogle();
    } catch (err) {
      console.error("Google OAuth error:", err);
      setErrorMsg(`Google Sign-In: ${err.message || 'Could not initiate Google OAuth.'}`);
      setIsAuthLoading(false);
    }
  };

  const handleCompleteOnboarding = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanName = name.trim();
    if (!cleanName) {
      setErrorMsg('Please enter your Full Name.');
      return;
    }

    const cleanPhone = phone.trim();
    const digitsOnly = cleanPhone.replace(/[^0-9]/g, '');
    if (!digitsOnly || digitsOnly.length < 10) {
      setErrorMsg('Please enter a valid Phone / WhatsApp number (at least 10 digits).');
      return;
    }

    setIsSavingProfile(true);

    try {
      const email = currentUser?.email || '';
      const userId = currentUser?.id || '';
      
      const saved = await saveUserProfile(userId, email, cleanName, cleanPhone);
      onSaveProfile(saved);
    } catch (err) {
      console.error("Save profile error:", err);
      setErrorMsg(err.message || 'Failed to save account details to Supabase. Please retry.');
      setIsSavingProfile(false);
    }
  };

  const isFirstTimeOnboarding = Boolean(currentUser && currentUser.needsOnboarding);

  return (
    <div className="w-full max-w-5xl mx-auto py-6 sm:py-10 animate-in fade-in duration-300">
      
      {/* Hero Welcome Header */}
      <div className="text-center mb-8 sm:mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-badge text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Official IISER Mohali Campus Marketplace</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
          Welcome to <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">KollectoP2P</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Campus-exclusive bulletin board locked to @iisermohali.ac.in. Buy & sell single items or hostel room clearouts with zero commission.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Campus Value Pillars & Benefits */}
        <div className="lg:col-span-6 space-y-6 order-2 lg:order-1">
          <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6 border border-slate-200/60 dark:border-white/10 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl overflow-hidden border border-slate-200/60 dark:border-white/10 shadow-sm shrink-0">
                <img src="/logo.jpg" alt="KollectoP2P" className="w-full h-full object-cover" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Why IISER Mohali students use KollectoP2P
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Trusted peer-to-peer student exchange</p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">100% Campus-Verified</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    Exclusively restricted to <code>@iisermohali.ac.in</code> Google accounts. No outside spam or unverified strangers.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">Direct WhatsApp Connections</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    Instant pre-filled WhatsApp links so batchmates can arrange hostel pickup, inspect items, and finalize deals.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">Hostel Clearouts & Bundles</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    List single items or bundle semester clearout goods together with automatic 21-day auto-expiry timers.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200/50 dark:border-white/10 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Zero commission marketplace</span>
              </span>
              <span className="font-mono text-[10px] glass-badge px-2 py-0.5 rounded-full">IISER Mohali</span>
            </div>
          </div>

          {/* Attribution Footnote */}
          <div className="p-4 rounded-2xl glass-card border border-slate-200/40 dark:border-white/5 text-center text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5">
            <span>Created with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline-block" />
            <span>by</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">Divanshu MS25237</span>
            <span>and</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">Ram Ratan Sankhla MS25231</span>
          </div>
        </div>

        {/* Right Column: Google OAuth Login OR First-Time Profile Onboarding */}
        <div className="lg:col-span-6 order-1 lg:order-2">
          <div className="glass-modal rounded-3xl p-6 sm:p-8 shadow-2xl relative border border-slate-200/70 dark:border-white/10">
            
            {/* Header */}
            <div className="border-b border-slate-200/50 dark:border-white/10 pb-4 mb-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-extrabold text-slate-900 dark:text-white text-lg flex items-center gap-2">
                    <span>{isFirstTimeOnboarding ? 'Complete Your Profile' : 'Campus Sign In'}</span>
                    <InfoTooltip text="Campus marketplace locked to @iisermohali.ac.in Google Workspace accounts." position="bottom" />
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {isFirstTimeOnboarding
                      ? 'Confirm your details once to start buying and selling'
                      : 'Sign in with your official IISER Mohali Google account'}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-base">
                  {isFirstTimeOnboarding ? '📝' : '🎓'}
                </div>
              </div>
            </div>

            {/* Error Alert */}
            {errorMsg && (
              <div className="mb-4 p-3 glass-badge border-rose-500/30 rounded-2xl text-rose-700 dark:text-rose-300 text-xs font-semibold leading-relaxed flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW A: FIRST-TIME SIGN-IN ONBOARDING (NAME & PHONE NUMBER CAPTURE)       */}
            {/* ========================================================================= */}
            {isFirstTimeOnboarding ? (
              <form onSubmit={handleCompleteOnboarding} className="space-y-4">
                
                {/* Onboarding Welcome Notice */}
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-xs">
                  <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Google Sign-In Successful!</span>
                  </div>
                  <p className="text-[11px] text-emerald-700/90 dark:text-emerald-300/90 mt-1 leading-relaxed">
                    Welcome to KollectoP2P. Since this is your first sign-in from this Gmail, please confirm your Name and WhatsApp number once. This data will be securely saved in Supabase for your account.
                  </p>
                </div>

                {/* 1. Verified Google Email (Read-Only) */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-blue-500" />
                      <span>Verified Google Account</span>
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Verified</span>
                    </span>
                  </label>
                  <div className="glass-input w-full rounded-xl p-2.5 text-xs font-mono text-slate-600 dark:text-slate-300 bg-slate-100/50 dark:bg-slate-800/50 cursor-not-allowed select-none border border-slate-200/50 dark:border-white/5">
                    {currentUser?.email}
                  </div>
                </div>

                {/* 2. Full Name */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-500" />
                    <span>Full Name</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Divanshu Sharma"
                    className="glass-input w-full rounded-xl p-2.5 text-xs placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
                    required
                    autoFocus
                  />
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                    Your name displayed to buyers and batchmates on your listings
                  </p>
                </div>

                {/* 3. Phone / WhatsApp Number */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Phone / WhatsApp Number</span>
                    </label>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      Required for Chats
                    </span>
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 9876543210 or 9876543210"
                    className="glass-input w-full rounded-xl p-2.5 text-xs font-mono placeholder-slate-400 focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                    Buyers will click to chat with you directly on this WhatsApp number
                  </p>
                </div>

                {/* Submit Onboarding Button */}
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="btn-primary w-full py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg cursor-pointer mt-2"
                >
                  {isSavingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-current" />
                      <span>Saving Profile to Supabase...</span>
                    </>
                  ) : (
                    <>
                      <span>Save & Enter Marketplace</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

              </form>
            ) : (
              /* ========================================================================= */
              /* VIEW B: GOOGLE OAUTH EXCLUSIVE LOGIN GATEWAY                              */
              /* ========================================================================= */
              <div className="space-y-5">
                
                {/* Information Card */}
                <div className="p-4 rounded-2xl bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/20 text-xs space-y-1.5">
                  <div className="font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    <span>Single Sign-On (No Passwords Needed)</span>
                  </div>
                  <p className="text-[11px] text-blue-600/90 dark:text-blue-300/90 leading-relaxed">
                    KollectoP2P uses official Google OAuth. Click below to sign in directly with your <strong>@iisermohali.ac.in</strong> email account.
                  </p>
                </div>

                {/* Big Google OAuth Button */}
                <div className="pt-2">
                  <a
                    href={googleOAuthUrl || '#'}
                    target={googleOAuthUrl ? '_top' : undefined}
                    rel="noopener noreferrer"
                    onClick={handleGoogleSignIn}
                    className="w-full flex items-center justify-center gap-3 py-3.5 px-5 rounded-2xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold text-sm border border-slate-200/90 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-700/80 hover:border-slate-300 dark:hover:border-white/20 transition-all shadow-md active:scale-98 cursor-pointer select-none no-underline group"
                  >
                    {isAuthLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                    ) : (
                      <svg className="w-5 h-5 shrink-0 transition-transform group-hover:scale-105" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                    )}
                    <span>{isAuthLoading ? 'Connecting to Google OAuth...' : 'Sign in with Google OAuth'}</span>
                  </a>

                  <p className="text-[11px] text-center text-slate-500 dark:text-slate-400 mt-3 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Locked to <strong>@iisermohali.ac.in</strong> student & faculty accounts</span>
                  </p>
                </div>

                {/* What happens next note */}
                <div className="pt-3 border-t border-slate-200/50 dark:border-white/10 text-center">
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
                    First time signing in? You will simply confirm your name and phone number once, which will be saved in Supabase for all future logins.
                  </p>
                </div>

              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
