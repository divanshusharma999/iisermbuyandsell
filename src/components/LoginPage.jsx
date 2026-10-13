import React, { useState, useEffect } from 'react';
import { Loader2, User, Phone, Mail, ArrowRight, AlertCircle, Heart } from 'lucide-react';
import BrandWordmark, { JoinedKMark } from './BrandLogo';
import {
  signInWithGoogle,
  getGoogleOAuthUrl,
  saveUserProfile
} from '../supabase';

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
      setErrorMsg(err.message || 'Failed to save account details. Please retry.');
      setIsSavingProfile(false);
    }
  };

  const isFirstTimeOnboarding = Boolean(currentUser && currentUser.needsOnboarding);

  return (
    <div className="w-full max-w-md mx-auto py-10 sm:py-16 animate-in fade-in duration-300">
      
      {/* Brand Header */}
      <div className="text-center mb-6 space-y-2">
        <div className="w-14 h-14 rounded-2xl overflow-hidden mx-auto border shadow-sm" style={{ borderColor: 'var(--border-card)' }}>
          <img src="/logo.jpg" alt="buyKꞰsell" className="w-full h-full object-cover" />
        </div>
        <div>
          <BrandWordmark size="lg" textColor="text-slate-900 dark:text-white" />
        </div>
        {/* Brief one-line greeting only */}
        <p className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
          Sign in to browse and list items on the campus marketplace.
        </p>
      </div>

      {/* Main Centered Sign-In / Onboarding Card */}
      <div
        className="rounded-3xl p-6 sm:p-8 shadow-xl relative border"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-card)'
        }}
      >
        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 border border-rose-500/30 rounded-2xl text-rose-600 text-xs font-semibold leading-relaxed flex items-start gap-2 bg-rose-500/10">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {isFirstTimeOnboarding ? (
          /* Profile Details Confirmation */
          <form onSubmit={handleCompleteOnboarding} className="space-y-4">
            <div className="border-b pb-3 mb-2" style={{ borderColor: 'var(--border-card)' }}>
              <h2 className="heading-card-title font-extrabold text-base">Account Details</h2>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                Please confirm your name and contact number for buyers.
              </p>
            </div>

            {/* Email (Read-Only) */}
            <div>
              <label className="block font-bold text-xs mb-1" style={{ color: 'var(--text-primary)' }}>
                Email
              </label>
              <div
                className="w-full rounded-xl p-2.5 text-xs font-mono cursor-not-allowed select-none border"
                style={{
                  backgroundColor: 'var(--bg-body)',
                  borderColor: 'var(--border-card)',
                  color: 'var(--text-secondary)'
                }}
              >
                {currentUser?.email}
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block font-bold text-xs mb-1" style={{ color: 'var(--text-primary)' }}>
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Full Name"
                className="w-full rounded-xl p-2.5 text-xs placeholder-slate-400 border focus:outline-none"
                style={{
                  backgroundColor: 'var(--bg-body)',
                  borderColor: 'var(--border-card)',
                  color: 'var(--text-primary)'
                }}
                required
                autoFocus
              />
            </div>

            {/* Phone / WhatsApp Number */}
            <div>
              <label className="block font-bold text-xs mb-1" style={{ color: 'var(--text-primary)' }}>
                WhatsApp Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number for chat inquiries"
                className="w-full rounded-xl p-2.5 text-xs font-mono placeholder-slate-400 border focus:outline-none"
                style={{
                  backgroundColor: 'var(--bg-body)',
                  borderColor: 'var(--border-card)',
                  color: 'var(--text-primary)'
                }}
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSavingProfile}
              className="btn-primary w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60 shadow-md cursor-pointer mt-2"
            >
              {isSavingProfile ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-current" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Clean Google Sign-In */
          <div className="py-2 space-y-3">
            <a
              href={googleOAuthUrl || '#'}
              target={googleOAuthUrl ? '_top' : undefined}
              rel="noopener noreferrer"
              onClick={handleGoogleSignIn}
              className="btn-primary w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm shadow-md active:scale-98 cursor-pointer select-none no-underline group"
              title="Sign in to Buy and Sell using your Google account"
            >
              {isAuthLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-current" />
              ) : (
                <svg className="w-5 h-5 shrink-0 transition-transform group-hover:scale-105" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              )}
              <span className="truncate">{isAuthLoading ? 'Connecting...' : 'Sign in to Buy and Sell with Google'}</span>
            </a>
          </div>
        )}
      </div>

      {/* Attribution Footnote */}
      <div
        className="mt-6 text-center text-[11px] flex items-center justify-center gap-1"
        style={{ color: 'var(--text-secondary)' }}
      >
        <span>Created with</span>
        <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline-block" />
        <span>by</span>
        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Divanshu MS25237</span>
        <span>&</span>
        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Ram Ratan Sankhla MS25231</span>
      </div>

    </div>
  );
}
