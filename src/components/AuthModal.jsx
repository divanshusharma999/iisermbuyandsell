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
        await updateUserProfile(email, cleanName, cleanPhone, userId);
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div
        className="rounded-3xl max-w-md w-full p-6 shadow-2xl relative border"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-card)'
        }}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4 mb-4" style={{ borderColor: 'var(--border-card)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl overflow-hidden border shadow-sm shrink-0"
              style={{ borderColor: 'var(--border-card)' }}
            >
              <img src="/logo.jpg" alt="KollectoP2P" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="heading-card-title font-extrabold text-base flex items-center gap-1.5">
                <span>
                  {isNeedsOnboarding
                    ? 'Complete Your Profile'
                    : isAlreadyLoggedIn
                    ? 'Edit Profile & WhatsApp'
                    : 'Campus Google Sign-In'}
                </span>
              </h3>
              <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>IISER Mohali Campus Marketplace</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl transition-colors cursor-pointer"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 border border-rose-500/30 rounded-2xl text-rose-600 text-xs font-semibold leading-relaxed flex items-start gap-2 bg-rose-500/10">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* CASE 1: LOGGED IN USER */}
        {isAlreadyLoggedIn ? (
          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            
            {isNeedsOnboarding && (
              <div
                className="p-3.5 rounded-2xl border text-xs"
                style={{
                  backgroundColor: 'var(--bg-body)',
                  borderColor: 'var(--border-card)'
                }}
              >
                <div className="font-bold flex items-center gap-1.5" style={{ color: 'var(--badge-stock)' }}>
                  <Sparkles className="w-4 h-4" />
                  <span>Almost Done! Confirm Details</span>
                </div>
                <p className="text-[11px] mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Please provide your name and WhatsApp number once so students can message you directly.
                </p>
              </div>
            )}

            {/* Email Address (Read-Only) */}
            <div>
              <label className="block font-bold mb-1 flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                <Mail className="w-3.5 h-3.5 text-section-icon" />
                <span>Google Account Email</span>
              </label>
              <div
                className="w-full rounded-xl p-2.5 text-xs font-mono cursor-not-allowed border select-none"
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
              <label className="block font-bold mb-1 flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                <User className="w-3.5 h-3.5 text-section-icon" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Divanshu Sharma"
                className="w-full rounded-xl p-2.5 text-xs placeholder-slate-400 border focus:outline-none"
                style={{
                  backgroundColor: 'var(--bg-body)',
                  borderColor: 'var(--border-card)',
                  color: 'var(--text-primary)'
                }}
                required
              />
            </div>

            {/* WhatsApp Phone Number */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                  <Phone className="w-3.5 h-3.5 text-section-icon" />
                  <span>WhatsApp Number</span>
                </label>
                <span className="badge-stock text-[10px] font-semibold px-1.5 py-0.5 rounded">
                  Direct Student Chat
                </span>
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 9876543210 or 9876543210"
                className="w-full rounded-xl p-2.5 text-xs font-mono placeholder-slate-400 border focus:outline-none"
                style={{
                  backgroundColor: 'var(--bg-body)',
                  borderColor: 'var(--border-card)',
                  color: 'var(--text-primary)'
                }}
                required
              />
              <p className="text-[10px] mt-1" style={{ color: 'var(--text-secondary)' }}>
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
                className="w-full py-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer mt-1"
                style={{ color: 'var(--text-price-sale)' }}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out of this Account</span>
              </button>
            )}

          </form>
        ) : (
          /* CASE 2: LOGGED OUT USER */
          <div className="space-y-4">
            <div
              className="p-3.5 rounded-2xl border text-xs"
              style={{
                backgroundColor: 'var(--bg-body)',
                borderColor: 'var(--border-card)'
              }}
            >
              <div className="font-bold flex items-center gap-1.5 mb-1 heading-section">
                <ShieldCheck className="w-4 h-4 text-section-icon" />
                <span>Campus Exclusivity</span>
              </div>
              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Sign in with your official <strong>@iisermohali.ac.in</strong> Google account. Passwords are no longer required.
              </p>
            </div>

            <a
              href={googleOAuthUrl || '#'}
              target={googleOAuthUrl ? '_top' : undefined}
              rel="noopener noreferrer"
              onClick={handleGoogleSignIn}
              className="btn-primary w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl font-bold text-xs sm:text-sm shadow-md active:scale-98 cursor-pointer select-none no-underline group"
            >
              {isAuthLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-current" />
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

            <p className="text-[10px] text-center mt-2" style={{ color: 'var(--text-secondary)' }}>
              First-time sign-ins will prompt for your name and WhatsApp number once to keep saved in Supabase.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
