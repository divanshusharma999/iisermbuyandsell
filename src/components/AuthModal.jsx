import React, { useState, useEffect } from 'react';
import {
  X, Mail, Phone, User, Loader2, Check,
  Sparkles, ShieldCheck, AlertCircle, ArrowRight, LogOut
} from 'lucide-react';
import InfoTooltip from './InfoTooltip';
import {
  signInWithGoogle,
  getGoogleOAuthUrl,
  updateUserProfile,
  saveUserProfile,
  signOutUser
} from '../supabase';

export default function AuthModal({ currentUser, onSaveProfile, onClose, onSignOut }) {
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.whatsapp || '');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [googleOAuthUrl, setGoogleOAuthUrl] = useState(null);

  const isAlreadyLoggedIn = Boolean(currentUser?.email);
  const isNeedsOnboarding = Boolean(currentUser?.needsOnboarding);

  useEffect(() => {
    if (currentUser?.name) setName(currentUser.name);
    if (currentUser?.whatsapp) setPhone(currentUser.whatsapp);
  }, [currentUser]);

  // Pre-generate Supabase Google OAuth URL
  useEffect(() => {
    if (isAlreadyLoggedIn) return;
    let isMounted = true;
    getGoogleOAuthUrl()
      .then(url => {
        if (isMounted && url) setGoogleOAuthUrl(url);
      })
      .catch(err => {
        console.warn("Could not prefetch Google OAuth URL:", err.message);
      });
    return () => { isMounted = false; };
  }, [isAlreadyLoggedIn]);

  const handleGoogleSignIn = async (e) => {
    if (googleOAuthUrl) return;
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

  const handleSaveProfile = async (e) => {
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

    setIsAuthLoading(true);

    try {
      const email = currentUser?.email || '';
      const userId = currentUser?.id || '';

      if (isNeedsOnboarding) {
        const saved = await saveUserProfile(userId, email, cleanName, cleanPhone);
        onSaveProfile(saved);
      } else {
        await updateUserProfile(email, cleanName, cleanPhone);
        onSaveProfile({
          ...currentUser,
          name: cleanName,
          whatsapp: cleanPhone,
          needsOnboarding: false
        });
      }
      onClose();
    } catch (err) {
      console.error("Save profile error:", err);
      setErrorMsg(err.message || 'Could not save profile details to Supabase. Please retry.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in">
      <div className="glass-modal rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-slate-200/70 dark:border-white/10">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl overflow-hidden border border-slate-200/60 dark:border-white/10 shadow-sm shrink-0">
              <img src="/logo.jpg" alt="KollectoP2P" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-1.5">
                <span>
                  {isNeedsOnboarding
                    ? 'Complete Your Profile'
                    : isAlreadyLoggedIn
                    ? 'Edit Profile & WhatsApp'
                    : 'Campus Google Sign-In'}
                </span>
                <InfoTooltip text="Marketplace locked to @iisermohali.ac.in Google accounts." position="bottom" />
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">IISER Mohali Campus Marketplace</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-xl hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 glass-badge border-rose-500/30 rounded-2xl text-rose-700 dark:text-rose-300 text-xs font-semibold leading-relaxed flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CASE 1: LOGGED IN USER (EDIT PROFILE OR FIRST-TIME ONBOARDING)            */}
        {/* ========================================================================= */}
        {isAlreadyLoggedIn ? (
          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            
            {isNeedsOnboarding && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-xs">
                <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Almost Done! Confirm Details</span>
                </div>
                <p className="text-[11px] text-emerald-700/90 dark:text-emerald-300/90 mt-1 leading-relaxed">
                  Please provide your name and WhatsApp number once so students can message you directly.
                </p>
              </div>
            )}

            {/* Email Address (Read-Only) */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-500" />
                <span>Google Account Email</span>
              </label>
              <div className="glass-input w-full rounded-xl p-2.5 text-xs font-mono text-slate-600 dark:text-slate-300 bg-slate-100/50 dark:bg-slate-800/50 cursor-not-allowed border border-slate-200/50 dark:border-white/5 select-none">
                {currentUser?.email}
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
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
              />
            </div>

            {/* WhatsApp Phone Number */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-500" />
                  <span>WhatsApp Number</span>
                </label>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  Direct Student Chat
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
                Used to pre-fill direct WhatsApp chat links with interested buyers
              </p>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={isAuthLoading}
              className="btn-primary w-full py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg cursor-pointer mt-2"
            >
              {isAuthLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-current" />
                  <span>Saving to Supabase...</span>
                </>
              ) : isNeedsOnboarding ? (
                <>
                  <span>Save & Enter Marketplace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Profile Updates</span>
                </>
              )}
            </button>

            {/* Log Out Option */}
            {!isNeedsOnboarding && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onSignOut) {
                    onSignOut();
                  } else {
                    signOutUser();
                  }
                }}
                className="w-full py-2 text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer mt-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out of this Account</span>
              </button>
            )}

          </form>
        ) : (
          /* ========================================================================= */
          /* CASE 2: LOGGED OUT USER (GOOGLE OAUTH ONLY)                               */
          /* ========================================================================= */
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/20 text-xs">
              <div className="font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5 mb-1">
                <ShieldCheck className="w-4 h-4 text-blue-500" />
                <span>Campus Exclusivity</span>
              </div>
              <p className="text-[11px] text-blue-600/90 dark:text-blue-300/90 leading-relaxed">
                Sign in with your official <strong>@iisermohali.ac.in</strong> Google account. Passwords are no longer required.
              </p>
            </div>

            <a
              href={googleOAuthUrl || '#'}
              target={googleOAuthUrl ? '_top' : undefined}
              rel="noopener noreferrer"
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold text-xs sm:text-sm border border-slate-200/90 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-all shadow-md active:scale-98 cursor-pointer select-none no-underline group"
            >
              {isAuthLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              ) : (
                <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              )}
              <span>{isAuthLoading ? 'Connecting to Google...' : 'Sign in with Google OAuth'}</span>
            </a>

            <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 mt-2">
              First-time sign-ins will prompt for your name and WhatsApp number once to keep saved in Supabase.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
