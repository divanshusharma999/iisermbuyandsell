import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import FilterBar from './components/FilterBar';
import ProductGrid from './components/ProductGrid';
import ProductDetailModal from './components/ProductDetailModal';
import UploadModal from './components/UploadModal';
import SellerDashboard from './components/SellerDashboard';
import AdminPanel from './components/AdminPanel';
import AuthModal from './components/AuthModal';
import LoginPage from './components/LoginPage';
import ToastNotification from './components/ToastNotification';
import { ProductSkeletonLoader, PageTransitionLoader } from './components/SkeletonLoader';
import NotFound from './components/NotFound';
import OfflineBanner from './components/OfflineBanner';
import { INITIAL_LISTINGS, INITIAL_BANNED_KEYWORDS, DEFAULT_ADMIN_SUPPORT_WHATSAPP } from './data/mockData';
import { ShieldAlert, Heart } from 'lucide-react';
import {
  fetchListingsFromSupabase,
  createListingInSupabase,
  updateListingInSupabase,
  deleteListingFromSupabase,
  fetchBannedKeywordsFromSupabase,
  addBannedKeywordToSupabase,
  removeBannedKeywordFromSupabase,
  fetchProfilesFromSupabase,
  toggleUserSuspensionInSupabase,
  getCurrentUserProfile,
  signOutUser,
  supabase
} from './supabase';

export default function App() {
  // ─── Dark Mode State ────────────────────────────────────────────────────────
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('buykksell_darkmode') || localStorage.getItem('kollecto_darkmode');
    return saved !== null ? JSON.parse(saved) : false; // Default: Light/White mode
  });

  // Apply/remove 'dark' class and data-theme on <html> whenever darkMode changes
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('buykksell_darkmode', JSON.stringify(darkMode));
  }, [darkMode]);

  // ─── App State ──────────────────────────────────────────────────────────────
  const [listings, setListings] = useState(() => {
    const saved = localStorage.getItem('iiserm_listings');
    return saved ? JSON.parse(saved) : INITIAL_LISTINGS;
  });

  const [bannedKeywords, setBannedKeywords] = useState(() => {
    const saved = localStorage.getItem('iiserm_banned_keywords');
    return saved ? JSON.parse(saved) : INITIAL_BANNED_KEYWORDS;
  });

  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('iiserm_users');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('iiserm_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  // ─── Navigation, Loading & Feedback State ────────────────────────────────
  const [activeTab, setActiveTab] = useState('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState('signin');
  const [isLoading, setIsLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleTabChange = (tab) => {
    if (!currentUser) {
      showToast('Please sign in first to access marketplace features.', 'info');
      setAuthInitialMode('signin');
      setShowAuthModal(true);
      return;
    }
    setIsNavigating(true);
    setActiveTab(tab);
    setTimeout(() => setIsNavigating(false), 250);
  };

  const handleOpenUpload = () => {
    if (!currentUser) {
      showToast('Please sign in with your IISER Mohali ID to list items.', 'info');
      setAuthInitialMode('signin');
      setShowAuthModal(true);
      return;
    }
    setShowUploadModal(true);
  };

  const handleOpenDashboard = () => {
    if (!currentUser) {
      showToast('Please sign in first to access your seller dashboard.', 'info');
      setAuthInitialMode('signin');
      setShowAuthModal(true);
      return;
    }
    handleTabChange('dashboard');
  };

  const handleOpenAdminPanel = () => {
    if (!currentUser) {
      showToast('Please sign in with an authorized admin account.', 'info');
      setAuthInitialMode('signin');
      setShowAuthModal(true);
      return;
    }
    handleTabChange('admin');
  };

  const handleSelectProduct = (item) => {
    if (!currentUser) {
      showToast('Please sign in first to view product details and contact seller.', 'info');
      setAuthInitialMode('signin');
      setShowAuthModal(true);
      return;
    }
    setSelectedProduct(item);
  };

  // ─── Initial Load & Sync from Supabase Backend ────────────────────────────
  useEffect(() => {
    async function loadBackendData() {
      // 1. Fetch Listings & filter out expired listings
      const dbListings = await fetchListingsFromSupabase();
      if (dbListings) {
        const now = new Date();
        const activeListings = dbListings.filter(item => !item.expiresAt || new Date(item.expiresAt) > now);
        setListings(activeListings);
        localStorage.setItem('iiserm_listings', JSON.stringify(activeListings));
      }

      // 2. Fetch Banned Keywords
      const dbKeywords = await fetchBannedKeywordsFromSupabase();
      if (dbKeywords && dbKeywords.length > 0) {
        setBannedKeywords(dbKeywords);
      }

      // 3. Fetch User Profiles
      const dbProfiles = await fetchProfilesFromSupabase();
      if (dbProfiles && dbProfiles.length > 0) {
        setUsers(dbProfiles);
      }

      // 4. Check Current Supabase Auth Session
      const activeUser = await getCurrentUserProfile();
      if (activeUser) {
        setCurrentUser(activeUser);
      }

      // Check if arriving via Password Recovery Link
      if (window.location.hash.includes('type=recovery') || window.location.search.includes('type=recovery')) {
        setAuthInitialMode('reset');
        setShowAuthModal(true);
        showToast('Password recovery detected. Please set your new password.', 'info');
      } else if (window.location.hash.includes('access_token') || window.location.search.includes('code=')) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      setIsLoading(false);
    }

    loadBackendData();

    // Listen to Supabase Auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setAuthInitialMode('reset');
        setShowAuthModal(true);
        showToast('Password recovery detected. Please set your new password.', 'info');
      } else if (session?.user) {
        const userProfile = await getCurrentUserProfile();
        if (userProfile?.accessDenied) {
          showToast(userProfile.message, 'error');
          setCurrentUser(null);
          localStorage.removeItem('iiserm_current_user');
          if (window.location.hash.includes('access_token') || window.location.search.includes('code=')) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
          return;
        }
        if (userProfile) {
          setCurrentUser(userProfile);
          if (event === 'SIGNED_IN') {
            showToast(`Welcome, ${userProfile.name || userProfile.email}!`);
          }
        }
        if (window.location.hash.includes('access_token') || window.location.search.includes('code=')) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        localStorage.removeItem('iiserm_current_user');
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // ─── Sync to LocalStorage ───────────────────────────────────────────────────
  useEffect(() => { localStorage.setItem('iiserm_listings', JSON.stringify(listings)); }, [listings]);
  useEffect(() => { localStorage.setItem('iiserm_banned_keywords', JSON.stringify(bannedKeywords)); }, [bannedKeywords]);
  useEffect(() => { localStorage.setItem('iiserm_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { if (currentUser) localStorage.setItem('iiserm_current_user', JSON.stringify(currentUser)); }, [currentUser]);

  // ─── Derived State ──────────────────────────────────────────────────────────
  const currentUserRecord = users.find(u => u.email.toLowerCase() === currentUser?.email?.toLowerCase());
  const isSuspended = currentUserRecord ? currentUserRecord.isSuspended : false;

  // Filter & Sort Logic
  const filteredListings = listings.filter((item) => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(query);
      const matchDesc = item.description.toLowerCase().includes(query);
      const matchSub = item.subItems && item.subItems.some(s => s.title.toLowerCase().includes(query));
      if (!matchTitle && !matchDesc && !matchSub) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'expiring-soon') return new Date(a.expiresAt) - new Date(b.expiresAt);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // ─── User Action Handlers (Supabase Connected) ──────────────────────────────
  const handleCreateListing = async (newListing) => {
    if (isSuspended) {
      showToast('Your account has been suspended by campus moderators.', 'error');
      return;
    }
    const saved = await createListingInSupabase(newListing);
    setListings([saved, ...listings]);
    showToast('Listing published successfully!');
    setActiveTab('feed');
  };

  const handleExtendTimer = (id) => {
    const updatedExpiry = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString();
    setListings(listings.map(item =>
      item.id === id ? { ...item, expiresAt: updatedExpiry } : item
    ));
    updateListingInSupabase(id, { expiresAt: updatedExpiry });
    showToast('Listing timer extended by 21 days!');
  };

  const handleMarkAsSold = (id) => {
    const targetItem = listings.find(item => item.id === id);
    setListings(listings.filter(item => item.id !== id));
    deleteListingFromSupabase(id, targetItem?.images);
    showToast('Item marked as sold and removed from bulletin board.');
  };

  const handleDeleteListing = (id) => {
    const targetItem = listings.find(item => item.id === id);
    setListings(listings.filter(item => item.id !== id));
    deleteListingFromSupabase(id, targetItem?.images);
    showToast('Listing deleted.');
  };

  // ─── Admin Handlers (Supabase Connected) ───────────────────────────────────
  const handleToggleSuspendUser = (email) => {
    const targetUser = users.find(u => u.email === email);
    const nextState = targetUser ? !targetUser.isSuspended : true;

    setUsers(users.map(u => u.email === email ? { ...u, isSuspended: nextState } : u));
    toggleUserSuspensionInSupabase(email, nextState);
  };

  const handleForceDeleteListing = (id) => {
    const targetItem = listings.find(item => item.id === id);
    setListings(listings.filter(item => item.id !== id));
    deleteListingFromSupabase(id, targetItem?.images);
    showToast('Listing removed by moderator.', 'info');
  };

  const handleToggleRerouteChat = (id) => {
    const targetItem = listings.find(item => item.id === id);
    const nextState = targetItem ? !targetItem.reroutedToAdmin : true;

    setListings(listings.map(item =>
      item.id === id ? { ...item, reroutedToAdmin: nextState } : item
    ));
    updateListingInSupabase(id, { reroutedToAdmin: nextState });
  };

  const handleAddBannedKeyword = (kw) => {
    const cleanKw = kw.toLowerCase();
    if (!bannedKeywords.includes(cleanKw)) {
      setBannedKeywords([...bannedKeywords, cleanKw]);
      addBannedKeywordToSupabase(cleanKw);
    }
  };

  const handleRemoveBannedKeyword = (kw) => {
    const cleanKw = kw.toLowerCase();
    setBannedKeywords(bannedKeywords.filter(k => k !== cleanKw));
    removeBannedKeywordFromSupabase(cleanKw);
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (e) {
      console.warn("Sign out exception:", e);
    }
    setCurrentUser(null);
    localStorage.removeItem('iiserm_current_user');
    showToast('Signed out successfully.');
  };

  const userListings = listings.filter(item => item.sellerEmail?.toLowerCase() === currentUser?.email?.toLowerCase());

  return (
    <div
      className="min-h-screen w-full max-w-full overflow-x-hidden flex flex-col transition-colors duration-300"
      style={{
        backgroundColor: 'var(--bg-body)',
        color: 'var(--text-primary)'
      }}
    >
      
      {/* Network Status Banner */}
      <OfflineBanner />

      {/* Page Navigation Transition Loader */}
      {isNavigating && <PageTransitionLoader />}

      {/* Top Navigation Bar with Connected Search Row */}
      <Header
        currentUser={currentUser}
        onOpenUpload={handleOpenUpload}
        onOpenDashboard={handleOpenDashboard}
        onOpenAdminPanel={handleOpenAdminPanel}
        onOpenAuth={() => {
          setAuthInitialMode('signin');
          setShowAuthModal(true);
        }}
        onSignOut={handleSignOut}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {/* Account Suspended Alert Banner */}
      {isSuspended && (
        <div className="glass-modal border-b border-rose-500/30 p-3 text-center text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center justify-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          <span>Account Suspended: Your access has been restricted by moderators. Contact admin for resolution.</span>
        </div>
      )}

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {isLoading ? (
          <ProductSkeletonLoader count={6} />
        ) : (!currentUser || currentUser.needsOnboarding) ? (
          /* ========================================================================= */
          /* DEFAULT GATEWAY: Google OAuth Login OR First-Time Profile Onboarding      */
          /* ========================================================================= */
          <LoginPage
            currentUser={currentUser}
            onSaveProfile={(profile) => {
              const updated = { ...profile, needsOnboarding: false };
              setCurrentUser(updated);
              localStorage.setItem('iiserm_current_user', JSON.stringify(updated));
              setUsers(prev => {
                const exists = prev.some(u => u.email?.toLowerCase() === profile.email?.toLowerCase());
                if (!exists) {
                  return [{ ...profile, isSuspended: false }, ...prev];
                }
                return prev.map(u => u.email?.toLowerCase() === profile.email?.toLowerCase()
                  ? { ...u, name: profile.name, whatsapp: profile.whatsapp }
                  : u
                );
              });
              setListings(prev => prev.map(item => 
                item.sellerEmail?.toLowerCase() === profile.email?.toLowerCase()
                  ? { ...item, sellerWhatsapp: profile.whatsapp, sellerName: profile.name }
                  : item
              ));
              showToast(`Welcome to buyKꞰsell, ${profile.name || profile.email}!`);
              setShowAuthModal(false);
            }}
          />
        ) : (
          /* ========================================================================= */
          /* AUTHENTICATED USER: Full access to Marketplace, Dashboard, and Admin       */
          /* ========================================================================= */
          <>
            {/* BUYER FEED VIEW */}
            {activeTab === 'feed' && (
              <>
                <HeroSection onOpenUpload={handleOpenUpload} />
                <ProductGrid
                  listings={filteredListings}
                  onSelectProduct={handleSelectProduct}
                  onOpenUpload={handleOpenUpload}
                  onResetFilters={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                />
              </>
            )}

            {/* SELLER DASHBOARD VIEW */}
            {activeTab === 'dashboard' && (
              <SellerDashboard
                userListings={userListings}
                onExtendTimer={handleExtendTimer}
                onMarkAsSold={handleMarkAsSold}
                onDeleteListing={handleDeleteListing}
                onOpenUpload={handleOpenUpload}
                onOpenEditProfile={() => setShowAuthModal(true)}
                currentUser={currentUser}
              />
            )}

            {/* ADMIN PANEL VIEW */}
            {activeTab === 'admin' && (
              currentUser?.isAdmin ? (
                <AdminPanel
                  listings={listings}
                  users={users}
                  onToggleSuspendUser={handleToggleSuspendUser}
                  onForceDeleteListing={handleForceDeleteListing}
                  onToggleRerouteChat={handleToggleRerouteChat}
                  bannedKeywords={bannedKeywords}
                  onAddBannedKeyword={handleAddBannedKeyword}
                  onRemoveBannedKeyword={handleRemoveBannedKeyword}
                />
              ) : (
                <div className="max-w-md mx-auto my-16 p-8 glass-card rounded-3xl text-center space-y-4 border border-rose-500/30">
                  <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto font-bold text-xl">
                    🛡️
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Access Restricted</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    You do not have administrative privileges to view the Moderator Panel. Please sign in with an authorized Admin account.
                  </p>
                  <button
                    onClick={() => handleTabChange('feed')}
                    className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-xs transition-all hover:scale-105"
                  >
                    Return to Campus Marketplace
                  </button>
                </div>
              )
            )}

            {/* 404 NOT FOUND VIEW */}
            {activeTab === '404' && (
              <NotFound onGoHome={() => handleTabChange('feed')} />
            )}
          </>
        )}

      </main>

      {/* ─── 5. FOOTER CONFORMING TO THEME REQUIREMENTS ───────────────────── */}
      {/* Requirement: Base background: --bg-footer with text using --text-on-dark. Links should hover to --text-nav-hover */}
      <footer
        className="w-full border-t py-8 mt-auto transition-colors duration-300"
        style={{
          backgroundColor: 'var(--bg-footer)',
          borderColor: 'var(--border-card)',
          color: 'var(--text-on-dark)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl overflow-hidden border border-white/20 shadow-sm shrink-0">
                <img src="/logo.jpg" alt="buyKꞰsell" className="w-full h-full object-cover" />
              </div>
              <div>
                <span
                  className="font-extrabold text-base tracking-tight inline-flex items-center"
                  style={{ color: 'var(--text-on-dark)' }}
                  aria-label="buyKꞰsell"
                >
                  <span>buy</span>
                  <span className="inline-flex tracking-[-0.14em] mx-[0.5px] font-black" style={{ color: 'var(--text-accent-hero)' }}>
                    <span>K</span>
                    <span className="inline-block transform -scale-x-100">K</span>
                  </span>
                  <span>sell</span>
                </span>
                <p className="text-xs text-white/70">
                  IISER Mohali Campus Marketplace
                </p>
              </div>
            </div>

            {/* Quick Links with hover to --text-nav-hover */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
              <button
                onClick={() => handleTabChange('feed')}
                className="transition-colors cursor-pointer"
                style={{ color: 'var(--text-on-dark)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-nav-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-on-dark)'}
              >
                Marketplace Feed
              </button>
              <span className="text-white/30">•</span>
              <button
                onClick={handleOpenUpload}
                className="transition-colors cursor-pointer"
                style={{ color: 'var(--text-on-dark)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-nav-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-on-dark)'}
              >
                Upload Item
              </button>
              <span className="text-white/30">•</span>
              <a
                href={`https://wa.me/${DEFAULT_ADMIN_SUPPORT_WHATSAPP.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors cursor-pointer"
                style={{ color: 'var(--text-on-dark)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-nav-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-on-dark)'}
              >
                Admin Support WhatsApp
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ color: 'var(--text-on-dark)' }}>
            <div className="flex flex-wrap items-center gap-2">
              <span>© 2026 IISER Mohali Campus Marketplace</span>
              <span className="text-white/30">•</span>
              <span
                className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold border border-white/20"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', color: 'var(--text-accent-hero)' }}
              >
                @iisermohali.ac.in verified
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px]">
              <span>Created with</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline-block" />
              <span>by</span>
              <span
                className="font-semibold underline decoration-dotted transition-colors cursor-default"
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-nav-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-on-dark)'}
              >
                Divanshu MS25237
              </span>
              <span>&</span>
              <span
                className="font-semibold underline decoration-dotted transition-colors cursor-default"
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-nav-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-on-dark)'}
              >
                Ram Ratan Sankhla MS25231
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* PRODUCT DETAIL MODAL */}
      {selectedProduct && (
        <ProductDetailModal
          item={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onReportItem={(id, reason) => showToast(`Report for item ${id} received: ${reason}`, 'info')}
          currentUser={currentUser}
        />
      )}

      {/* UPLOAD MODAL */}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onSubmit={handleCreateListing}
          currentUser={currentUser}
          bannedKeywords={bannedKeywords}
        />
      )}

      {/* AUTH & PROFILE SETUP MODAL */}
      {showAuthModal && (
        <AuthModal
          currentUser={currentUser}
          onSaveProfile={(profile) => {
            const updated = { ...profile, needsOnboarding: false };
            setCurrentUser(updated);
            localStorage.setItem('iiserm_current_user', JSON.stringify(updated));
            setUsers(prev => {
              const exists = prev.some(u => u.email?.toLowerCase() === profile.email?.toLowerCase());
              if (!exists) {
                return [{ ...profile, isSuspended: false }, ...prev];
              }
              return prev.map(u => u.email?.toLowerCase() === profile.email?.toLowerCase()
                ? { ...u, name: profile.name, whatsapp: profile.whatsapp }
                : u
              );
            });
            setListings(prev => prev.map(item => 
              item.sellerEmail?.toLowerCase() === profile.email?.toLowerCase()
                ? { ...item, sellerWhatsapp: profile.whatsapp, sellerName: profile.name }
                : item
            ));
            showToast('Profile updated!');
            setShowAuthModal(false);
          }}
          onSignOut={handleSignOut}
          onClose={() => {
            setShowAuthModal(false);
          }}
        />
      )}

      {/* GLOBAL TOAST NOTIFICATIONS */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

    </div>
  );
}
