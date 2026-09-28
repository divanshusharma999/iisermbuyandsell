import React, { useState, useEffect } from 'react';
import {
  X, Mail, Phone, Lock, User, Loader2, Check, Eye, EyeOff,
  Sparkles, KeyRound, ArrowLeft, CheckCircle2, ShieldCheck
} from 'lucide-react';
import InfoTooltip from './InfoTooltip';
import {
  signUpUser,
  signInUser,
  signInWithGoogle,
  getGoogleOAuthUrl,
  updateUserProfile,
  sendPasswordResetEmail,
  updateUserPassword
} from '../supabase';
import { isUserAdmin } from '../data/mockData';

export default function AuthModal({ currentUser, initialMode = 'signin', onSaveProfile, onClose }) {
  const [authMode, setAuthMode] = useState(initialMode); // 'signin' | 'forgot' | 'reset'
  const [name, setName] = useState(currentUser?.name || '');
  const [emailId, setEmailId] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.whatsapp || '');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [googleOAuthUrl, setGoogleOAuthUrl] = useState(null);

  const isAlreadyLoggedIn = Boolean(currentUser?.email);

  useEffect(() => {
    if (initialMode) {
      setAuthMode(initialMode);
    }
  }, [initialMode]);

  // Normalize ID / Email input (auto-appends @iisermohali.ac.in if user types just roll no / username)
  const formatEmailId = (raw) => {
    let clean = (raw || '').trim().toLowerCase();
    if (clean && !clean.includes('@')) {
      clean = `${clean}@iisermohali.ac.in`;
    }
    return clean;
  };

  // Pre-generate Supabase Google OAuth URL so user can click directly with target="_top"
  useEffect(() => {
    let isMounted = true;
    getGoogleOAuthUrl(emailId)
      .then(url => {
        if (isMounted && url) setGoogleOAuthUrl(url);
      })
      .catch(err => {
        console.warn("Could not prefetch Google OAuth URL:", err.message);
      });
    return () => { isMounted = false; };
  }, [emailId]);

  const handleGoogleSignIn = async (e) => {
    if (googleOAuthUrl) {
      return;
    }
    if (e) e.preventDefault();

    setErrorMsg(null);
    setSuccessMsg(null);
    setIsAuthLoading(true);

    try {
      await signInWithGoogle(emailId);
    } catch (err) {
      console.error("Google OAuth error:", err);
      setErrorMsg(`Google Sign-In: ${err.message || 'Could not initiate Google OAuth.'}`);
      setIsAuthLoading(false);
    }
  };

  const handleRequestPasswordReset = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanEmail = formatEmailId(emailId);
    if (!cleanEmail) {
      setErrorMsg('Please enter your Campus ID or Email Address to reset your password.');
      return;
    }

    const isAdmin = isUserAdmin(cleanEmail);
    if (!isAdmin && !cleanEmail.endsWith('@iisermohali.ac.in')) {
      setErrorMsg('Password reset is restricted to official @iisermohali.ac.in accounts.');
      return;
    }

    setIsAuthLoading(true);

    try {
      await sendPasswordResetEmail(cleanEmail);
      setSuccessMsg(`A password reset link has been dispatched to ${cleanEmail}. Please check your inbox (and spam folder) and click the link to confirm and set your new password.`);
    } catch (err) {
      console.error("Password reset error:", err);
      setErrorMsg(err.message || 'Could not send reset email. Please ensure your email is correct.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleUpdateNewPassword = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('New password must contain at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setIsAuthLoading(true);

    try {
      await updateUserPassword(newPassword);
      const cleanEmail = formatEmailId(emailId) || currentUser?.email;
      if (cleanEmail) {
        onSaveProfile({
          email: cleanEmail,
          name: name.trim() || cleanEmail.split('@')[0],
          whatsapp: phone.trim() || '',
          isAdmin: isUserAdmin(cleanEmail)
        });
      }
      onClose();
    } catch (err) {
      console.error("Update password error:", err);
      setErrorMsg(err.message || 'Failed to update password. Your email confirmation link may have expired.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanEmail = formatEmailId(emailId);
    if (!cleanEmail) {
      setErrorMsg('Please enter your Campus ID or Email Address.');
      return;
    }

    const isAdmin = isUserAdmin(cleanEmail);

    if (!isAdmin && !cleanEmail.endsWith('@iisermohali.ac.in')) {
      setErrorMsg('Student accounts must use an official @iisermohali.ac.in campus ID or email.');
      return;
    }

    const cleanPhone = phone.trim();
    if (!cleanPhone || cleanPhone.replace(/[^0-9]/g, '').length < 10) {
      setErrorMsg('Please enter a valid Phone / WhatsApp number (at least 10 digits).');
      return;
    }

    if (!isAlreadyLoggedIn && (!password || password.length < 6)) {
      setErrorMsg('Please enter a password with at least 6 characters.');
      return;
    }

    const cleanName = name.trim() || cleanEmail.split('@')[0];

    setIsAuthLoading(true);

    try {
      if (isAlreadyLoggedIn) {
        await updateUserProfile(cleanEmail, cleanName, cleanPhone);
      } else if (password.trim()) {
        try {
          await signInUser(cleanEmail, password);
        } catch (signInErr) {
          // If sign-in fails, attempt sign-up automatically (seamless creation for new users)
          try {
            await signUpUser(cleanEmail, password, cleanName, cleanPhone);
          } catch (signUpErr) {
            console.warn("Auth sync info:", signUpErr.message);
          }
        }
        await updateUserProfile(cleanEmail, cleanName, cleanPhone);
      }
    } catch (err) {
      console.warn("Auth submit info:", err.message);
    }

    setIsAuthLoading(false);

    onSaveProfile({
      email: cleanEmail,
      name: cleanName,
      whatsapp: cleanPhone,
      isAdmin
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in">
      <div className="glass-modal rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl overflow-hidden border border-slate-200/60 dark:border-white/10 shadow-sm shrink-0">
              <img src="/logo.jpg" alt="KollectoP2P" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-1.5">
                <span>
                  {authMode === 'forgot'
                    ? 'Forgot Password'
                    : authMode === 'reset'
                    ? 'Set New Password'
                    : isAlreadyLoggedIn
                    ? 'Edit Profile & Contact'
                    : 'Sign In / Register'}
                </span>
                <InfoTooltip text="Campus marketplace locked to @iisermohali.ac.in. Admins can enter without domain restriction." position="bottom" />
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
          <div className="mb-4 p-3 glass-badge border-rose-500/30 rounded-2xl text-rose-700 dark:text-rose-300 text-xs font-semibold leading-relaxed">
            {errorMsg}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 1. SIGN IN & AUTO-CREATE VIEW                                            */}
        {/* ========================================================================= */}
        {authMode === 'signin' && (
          <>
            {/* New User Account Creation Banner */}
            {!isAlreadyLoggedIn && (
              <div className="mb-4 p-3.5 rounded-2xl bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/20 text-xs flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 shrink-0 text-blue-500 mt-0.5" />
                <div>
                  <div className="font-bold text-blue-700 dark:text-blue-300">
                    New user? An account will be created automatically!
                  </div>
                  <p className="text-[11px] text-blue-600/90 dark:text-blue-300/90 mt-0.5 leading-relaxed">
                    No separate registration needed. Entering your name, campus ID, WhatsApp, and password below will <strong>instantly create your new campus account</strong> and log you in.
                  </p>
                </div>
              </div>
            )}

            {/* Option: Sign In using Google OAuth */}
            <div className="mb-4">
              <a
                href={googleOAuthUrl || '#'}
                target={googleOAuthUrl ? '_top' : undefined}
                rel="noopener noreferrer"
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold text-xs sm:text-sm border border-slate-200/80 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-all shadow-sm active:scale-98 cursor-pointer select-none no-underline"
              >
                {isAuthLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-current" />
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                )}
                <span>{isAuthLoading ? 'Connecting to Google...' : 'Sign in with Google OAuth'}</span>
              </a>
              <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 mt-1.5">
                Use your IISER Mohali Google Workspace (@iisermohali.ac.in)
              </p>
            </div>

            {/* Divider */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="w-full border-t border-slate-200/60 dark:border-white/10"></div>
              <span className="absolute bg-white/90 dark:bg-slate-900/90 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider backdrop-blur-md">
                OR SIGN IN WITH DETAILS
              </span>
            </div>

            {/* Form: Name, ID, Phone Number, Password */}
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              
              {/* 1. Name */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" style={{color:'var(--apple-blue)'}} />
                  <span>Name</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Divanshu Sharma"
                  className="glass-input w-full rounded-xl p-2.5 text-xs placeholder-slate-400"
                  required
                />
              </div>

              {/* 2. Campus ID / Email ID */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" style={{color:'var(--apple-blue)'}} />
                  <span>Campus ID / Email ID</span>
                </label>
                <input
                  type="text"
                  value={emailId}
                  onChange={(e) => setEmailId(e.target.value)}
                  placeholder="e.g. ms25237 or ms25237@iisermohali.ac.in"
                  className="glass-input w-full rounded-xl p-2.5 text-xs font-mono placeholder-slate-400"
                  required
                />
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                  Type your roll number (e.g. ms25237) or full @iisermohali.ac.in email
                </p>
              </div>

              {/* 3. Phone Number */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" style={{color:'var(--apple-blue)'}} />
                    <span>Phone Number</span>
                  </label>
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    WhatsApp Contact
                  </span>
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 9876543210"
                  className="glass-input w-full rounded-xl p-2.5 text-xs font-mono placeholder-slate-400"
                  required
                />
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                  Buyers will contact you directly on this number
                </p>
              </div>

              {/* 4. Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" style={{color:'var(--apple-blue)'}} />
                    <span>Password</span>
                  </label>
                  {!isAlreadyLoggedIn && (
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('forgot');
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isAlreadyLoggedIn ? 'Leave blank to keep existing password' : 'Enter account password'}
                    className="glass-input w-full rounded-xl p-2.5 pr-10 text-xs placeholder-slate-400"
                    required={!isAlreadyLoggedIn}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isAuthLoading}
                className="btn-primary w-full py-3 px-4 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 disabled:opacity-60 mt-2 shadow-lg cursor-pointer"
              >
                {isAuthLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-current" />
                    <span>Processing...</span>
                  </>
                ) : isAlreadyLoggedIn ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save Profile Updates</span>
                  </>
                ) : (
                  <span>Sign In / Create Account</span>
                )}
              </button>

              {!isAlreadyLoggedIn && (
                <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 mt-2">
                  Existing users will be signed in; new users will be automatically registered.
                </p>
              )}

            </form>
          </>
        )}

        {/* ========================================================================= */}
        {/* 2. FORGOT PASSWORD (REQUEST RESET EMAIL) VIEW                             */}
        {/* ========================================================================= */}
        {authMode === 'forgot' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/20 text-xs">
              <div className="font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5 mb-1">
                <KeyRound className="w-4 h-4 text-blue-500" />
                <span>Password Recovery</span>
              </div>
              <p className="text-[11px] text-blue-600/90 dark:text-blue-300/90 leading-relaxed">
                Enter your Campus ID or email. We will send a secure password reset link to your official @iisermohali.ac.in inbox.
              </p>
            </div>

            {successMsg ? (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Check Your Email</span>
                  </div>
                  <p className="text-[11px] text-emerald-600/90 dark:text-emerald-300/90 leading-relaxed">
                    {successMsg}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Click the link in the email to return here and set your new password.
                  </p>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => { setAuthMode('reset'); setSuccessMsg(null); }}
                    className="w-full py-2.5 px-4 rounded-xl glass-badge hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold text-center transition-all cursor-pointer"
                  >
                    Already clicked the email link? Set new password here →
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('signin'); setSuccessMsg(null); setErrorMsg(null); }}
                    className="w-full py-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Sign In</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRequestPasswordReset} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" style={{ color: 'var(--apple-blue)' }} />
                    <span>Campus ID / Email ID</span>
                  </label>
                  <input
                    type="text"
                    value={emailId}
                    onChange={(e) => setEmailId(e.target.value)}
                    placeholder="e.g. ms25237 or ms25237@iisermohali.ac.in"
                    className="glass-input w-full rounded-xl p-2.5 text-xs font-mono placeholder-slate-400"
                    required
                    autoFocus
                  />
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                    We will send a password reset link to this @iisermohali.ac.in address
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isAuthLoading}
                  className="btn-primary w-full py-3 px-4 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg cursor-pointer"
                >
                  {isAuthLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-current" />
                      <span>Sending Reset Email...</span>
                    </>
                  ) : (
                    <span>Send Password Reset Link</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => { setAuthMode('signin'); setErrorMsg(null); }}
                  className="w-full py-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. SET NEW PASSWORD VIEW (AFTER EMAIL CONFIRMATION / RECOVERY LINK)        */}
        {/* ========================================================================= */}
        {authMode === 'reset' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-xs">
              <div className="font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 mb-1">
                <KeyRound className="w-4 h-4 text-emerald-500" />
                <span>Set Your New Password</span>
              </div>
              <p className="text-[11px] text-emerald-600/90 dark:text-emerald-300/90 leading-relaxed">
                Enter your new password to restore and secure access to your account.
              </p>
            </div>

            <form onSubmit={handleUpdateNewPassword} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" style={{ color: 'var(--apple-blue)' }} />
                  <span>New Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min. 6 characters)"
                    className="glass-input w-full rounded-xl p-2.5 pr-10 text-xs placeholder-slate-400"
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" style={{ color: 'var(--apple-blue)' }} />
                  <span>Confirm New Password</span>
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="glass-input w-full rounded-xl p-2.5 text-xs placeholder-slate-400"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isAuthLoading}
                className="btn-primary w-full py-3 px-4 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg cursor-pointer"
              >
                {isAuthLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-current" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save & Update New Password</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => { setAuthMode('signin'); setErrorMsg(null); }}
                className="w-full py-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Cancel & Back to Sign In</span>
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
