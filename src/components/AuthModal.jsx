import React, { useState } from 'react';
import { X, Mail, Phone, Lock, Sparkles, ArrowRight, ShieldCheck, User, Loader2, Check } from 'lucide-react';
import InfoTooltip from './InfoTooltip';
import { signUpUser, signInUser, signInWithGoogle, updateUserProfile } from '../supabase';
import { isUserAdmin } from '../data/mockData';

export default function AuthModal({ currentUser, onSaveProfile, onClose }) {
  const [email, setEmail] = useState(currentUser?.email || '');
  const [name, setName] = useState(currentUser?.name || '');
  const [whatsapp, setWhatsapp] = useState(currentUser?.whatsapp || '+917988860162');
  const [password, setPassword] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const isAlreadyLoggedIn = Boolean(currentUser?.email);



  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setIsAuthLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error("Google OAuth error:", err);
      setErrorMsg(`Google Sign-In notice: ${err.message || 'Could not launch Google Sign-In redirect'}`);
      setIsAuthLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    const isAdmin = isUserAdmin(cleanEmail);

    if (!isAdmin && !cleanEmail.endsWith('@iisermohali.ac.in')) {
      setErrorMsg('Login restricted! Student accounts must use an official @iisermohali.ac.in Google Workspace email address.');
      return;
    }

    if (!whatsapp.trim() || whatsapp.trim().length < 10) {
      setErrorMsg('Please enter a valid WhatsApp contact phone number (with country code, e.g. +91 9876543210).');
      return;
    }

    setIsAuthLoading(true);

    try {
      // If user is already logged in, update their profile/contact in Supabase
      if (isAlreadyLoggedIn) {
        await updateUserProfile(cleanEmail, name.trim() || cleanEmail.split('@')[0], whatsapp.trim());
      } else if (password.trim()) {
        // Try Supabase Auth Sign In / Sign Up with Password
        try {
          await signInUser(cleanEmail, password);
        } catch (signInErr) {
          try {
            await signUpUser(cleanEmail, password, name.trim() || cleanEmail.split('@')[0], whatsapp.trim());
          } catch (signUpErr) {
            console.warn("Supabase Auth notice:", signUpErr.message);
          }
        }
        await updateUserProfile(cleanEmail, name.trim() || cleanEmail.split('@')[0], whatsapp.trim());
      }
    } catch (err) {
      console.warn("Auth submit handler notice:", err.message);
    }

    setIsAuthLoading(false);

    onSaveProfile({
      email: cleanEmail,
      name: name.trim() || cleanEmail.split('@')[0],
      whatsapp: whatsapp.trim(),
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
            <div className="w-10 h-10 rounded-2xl overflow-hidden border border-slate-200/60 dark:border-white/10 shadow-sm">
              <img src="/logo.jpg" alt="KollectoP2P" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-1">
                <span>{isAlreadyLoggedIn ? 'Edit Profile & Contact' : 'KollectoP2P Login Gateway'}</span>
                <InfoTooltip text="Students strictly require @iisermohali.ac.in. Admins can enter without domain restriction." position="bottom" />
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">IISER Mohali Campus Peer-to-Peer Marketplace</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-xl hover:bg-white/40 dark:hover:bg-slate-800/40">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 glass-badge border-rose-500/30 rounded-2xl text-rose-700 dark:text-rose-300 text-xs font-semibold leading-relaxed">
            {errorMsg}
          </div>
        )}

        {/* Google OAuth Section */}
        <div className="mb-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isAuthLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold text-xs sm:text-sm border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-all shadow-sm active:scale-98"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continue with Google Account</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="w-full border-t border-slate-200/60 dark:border-white/10"></div>
          <span className="absolute bg-white/80 dark:bg-slate-900/80 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider backdrop-blur-md">
            OR Email & Password
          </span>
        </div>

        {/* Quick Demo Switcher Buttons */}
        <div className="mb-4 glass-badge p-3 rounded-2xl space-y-2">
          <div className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Quick Select Demo Account:</span>
            <Sparkles className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="grid grid-cols-1 gap-1.5">
            <button
              type="button"
              onClick={() => selectDemoPersona('student')}
              className="w-full text-left p-2 rounded-xl glass-badge hover:bg-white/80 dark:hover:bg-slate-800/80 text-xs text-slate-800 dark:text-slate-200 flex items-center justify-between transition-all"
            >
              <span>Alex Mehta <span className="text-slate-500 dark:text-slate-400 font-mono font-bold">(alex.m22@iisermohali.ac.in)</span></span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <button
              type="button"
              onClick={() => selectDemoPersona('senior')}
              className="w-full text-left p-2 rounded-xl glass-badge hover:bg-white/80 dark:hover:bg-slate-800/80 text-xs text-slate-800 dark:text-slate-200 flex items-center justify-between transition-all"
            >
              <span>Sarah Sharma <span className="text-slate-500 dark:text-slate-400 font-mono font-bold">(sarah.b20@iisermohali.ac.in)</span></span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <button
              type="button"
              onClick={() => selectDemoPersona('admin')}
              className="w-full text-left p-2 rounded-xl glass-badge hover:bg-white/80 dark:hover:bg-slate-800/80 text-xs text-slate-800 dark:text-slate-200 flex items-center justify-between transition-all"
            >
              <span>Divanshu (Admin) <span className="text-slate-500 dark:text-slate-400 font-mono font-bold">(ms25237@iisermohali.ac.in)</span></span>
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Login & Contact Update Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          {/* Email Input */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" style={{color:'var(--apple-blue)'}} />
              <span>Institute Email Address *</span>
              <InfoTooltip text="Must end with @iisermohali.ac.in unless logging in as Admin." position="right" />
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. username@iisermohali.ac.in"
              className="glass-input w-full rounded-xl p-2.5 text-xs placeholder-slate-400"
              required
            />
          </div>

          {/* Full Name Input */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5" style={{color:'var(--apple-blue)'}} />
              <span>Display Name</span>
              <InfoTooltip text="Displayed on your active item listings." position="right" />
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Mehta"
              className="glass-input w-full rounded-xl p-2.5 text-xs placeholder-slate-400"
            />
          </div>

          {/* WhatsApp Phone Contact Number (Can be updated anytime) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" style={{color:'var(--apple-blue)'}} />
                <span>Contact / WhatsApp Number *</span>
                <InfoTooltip text="Buyers will be directed to this WhatsApp number. You can update this contact number anytime." position="right" />
              </label>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                Updatable Anytime
              </span>
            </div>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="e.g. +91 9876543210"
              className="glass-input w-full rounded-xl p-2.5 text-xs font-mono placeholder-slate-400"
              required
            />
          </div>

          {/* Password (stored in Supabase Auth) */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" style={{color:'var(--apple-blue)'}} />
              <span>Password (Stored in Supabase)</span>
              <InfoTooltip text="Enter password to sign up or sign in securely with Supabase Auth." position="right" />
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password (min. 6 characters)"
              className="glass-input w-full rounded-xl p-2.5 text-xs placeholder-slate-400"
            />
          </div>

          <button
            type="submit"
            disabled={isAuthLoading}
            className="btn-primary w-full py-3 px-4 rounded-2xl text-sm flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isAuthLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-current" />
                <span>Saving to Supabase...</span>
              </>
            ) : isAlreadyLoggedIn ? (
              <>
                <Check className="w-4 h-4" />
                <span>Save Profile & Contact Updates</span>
              </>
            ) : (
              <span>Authenticate & Proceed to KollectoP2P</span>
            )}
          </button>

        </form>

      </div>
    </div>
  );
}
