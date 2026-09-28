import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import ProductGrid from './components/ProductGrid';
import ProductDetailModal from './components/ProductDetailModal';
import UploadModal from './components/UploadModal';
import SellerDashboard from './components/SellerDashboard';
import AdminPanel from './components/AdminPanel';
import AuthModal from './components/AuthModal';
import ToastNotification from './components/ToastNotification';
import { ProductSkeletonLoader, PageTransitionLoader } from './components/SkeletonLoader';
import NotFound from './components/NotFound';
import OfflineBanner from './components/OfflineBanner';
import { INITIAL_LISTINGS, INITIAL_BANNED_KEYWORDS } from './data/mockData';
import { ShieldAlert, RotateCcw } from 'lucide-react';
import InfoTooltip from './components/InfoTooltip';
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
  supabase
} from './supabase';

export default function App() {
  // ─── Dark Mode State ────────────────────────────────────────────────────────
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('kollecto_darkmode');
    return saved !== null ? JSON.parse(saved) : false; // Default: Light/White mode
  });

  // Apply/remove 'dark' class on <html> whenever darkMode changes
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('kollecto_darkmode', JSON.stringify(darkMode));
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
  const [isLoading, setIsLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleTabChange = (tab) => {
    setIsNavigating(true);
    setActiveTab(tab);
    setTimeout(() => setIsNavigating(false), 250);
  };

  // ─── Initial Load & Sync from Supabase Backend ────────────────────────────
  useEffect(() => {
    async function loadBackendData() {
      // 1. Fetch Listings
      const dbListings = await fetchListingsFromSupabase();
      if (dbListings && dbListings.length > 0) {
        setListings(dbListings);
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
      setIsLoading(false);
    }

    loadBackendData();

    // Listen to Supabase Auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const userProfile = await getCurrentUserProfile();
        if (userProfile) setCurrentUser(userProfile);
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
    setListings(listings.filter(item => item.id !== id));
    deleteListingFromSupabase(id);
    showToast('Item marked as sold and removed from bulletin board.');
  };

  const handleDeleteListing = (id) => {
    setListings(listings.filter(item => item.id !== id));
    deleteListingFromSupabase(id);
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
    setListings(listings.filter(item => item.id !== id));
    deleteListingFromSupabase(id);
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

  const handleResetSeedData = () => {
    if (window.confirm('Reset all listings, banned keywords, and user accounts back to initial demo state?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const userListings = listings.filter(item => item.sellerEmail?.toLowerCase() === currentUser?.email?.toLowerCase());

  return (
    <div className="min-h-screen bg-canvas text-canvas-primary flex flex-col transition-colors duration-300" style={{backgroundColor:'var(--canvas-bg)',color:'var(--text-primary)'}}>
      
      {/* Network Status Banner */}
      <OfflineBanner />

      {/* Page Navigation Transition Loader */}
      {isNavigating && <PageTransitionLoader />}

      {/* Top Navigation Bar */}
      <Header
        currentUser={currentUser}
        onOpenUpload={() => setShowUploadModal(true)}
        onOpenDashboard={() => handleTabChange('dashboard')}
        onOpenAdminPanel={() => handleTabChange('admin')}
        onOpenAuth={() => setShowAuthModal(true)}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
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
        
        {/* BUYER FEED VIEW */}
        {activeTab === 'feed' && (
          <>
            <FilterBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              sortBy={sortBy}
              setSortBy={setSortBy}
              totalResults={filteredListings.length}
            />
            {isLoading ? (
              <ProductSkeletonLoader count={6} />
            ) : (
              <ProductGrid
                listings={filteredListings}
                onSelectProduct={(item) => setSelectedProduct(item)}
                onOpenUpload={() => setShowUploadModal(true)}
                onResetFilters={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
              />
            )}
          </>
        )}

        {/* SELLER DASHBOARD VIEW */}
        {activeTab === 'dashboard' && (
          <SellerDashboard
            userListings={userListings}
            onExtendTimer={handleExtendTimer}
            onMarkAsSold={handleMarkAsSold}
            onDeleteListing={handleDeleteListing}
            onOpenUpload={() => setShowUploadModal(true)}
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

      </main>

      {/* Footer */}
      <footer className="glass-header border-t border-b-0 py-6 mt-auto transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <img src="/logo.jpg" alt="KollectoP2P" className="w-5 h-5 rounded-md" />
            <span className="font-bold text-slate-700 dark:text-slate-300">KollectoP2P</span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span>© 2026 IISER Mohali Campus Marketplace</span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="glass-badge px-2 py-0.5 rounded-full text-[10px] font-mono font-bold text-slate-800 dark:text-slate-200">@iisermohali.ac.in verified</span>
            <InfoTooltip text="Zero-friction campus bulletin board routing off-platform to WhatsApp." position="top" />
          </div>

          <button
            onClick={handleResetSeedData}
            className="flex items-center gap-1 text-slate-400 hover:text-rose-500 transition-colors text-[11px]"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo Seed Data</span>
          </button>
        </div>
      </footer>

      {/* PRODUCT DETAIL MODAL */}
      {selectedProduct && (
        <ProductDetailModal
          item={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onReportItem={(id, reason) => alert(`Report for item ${id} received: ${reason}`)}
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
            setCurrentUser(profile);
            if (!users.some(u => u.email === profile.email)) {
              setUsers([...users, { ...profile, isSuspended: false }]);
            }
            showToast('Profile updated!');
          }}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {/* GLOBAL TOAST NOTIFICATIONS */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

    </div>
  );
}
