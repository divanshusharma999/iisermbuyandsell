import { createClient } from '@supabase/supabase-js';
import { isUserAdmin } from './data/mockData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ztbloxfwagbjbcpmosft.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0YmxveGZ3YWdiamJjcG1vc2Z0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2MTE4NDcsImV4cCI6MjEwNjE4Nzg0N30.Q7d58oPrdaXJBqFXxZLek1CwprlVzlDtnk5lNQOwWh0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

// ====================================================================
// DATA CONVERTERS (Database snake_case <-> App camelCase)
// ====================================================================
export function rowToListing(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    price: Number(row.price),
    category: row.category,
    condition: row.condition,
    description: row.description || '',
    isCartSell: Boolean(row.is_cart_sell),
    isNegotiable: Boolean(row.is_negotiable),
    sellerEmail: row.seller_email,
    sellerName: row.seller_name,
    sellerWhatsapp: row.seller_whatsapp,
    createdAt: row.created_at || new Date().toISOString(),
    expiresAt: row.expires_at || new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    reroutedToAdmin: Boolean(row.rerouted_to_admin),
    images: Array.isArray(row.images) ? row.images : [],
    thumbnailIndex: row.thumbnail_index || 0,
    referenceLinks: Array.isArray(row.reference_links) ? row.reference_links : [],
    subItems: Array.isArray(row.sub_items) ? row.sub_items : []
  };
}

export function listingToRow(item) {
  return {
    title: item.title,
    price: item.price,
    category: item.category,
    condition: item.condition,
    description: item.description,
    is_cart_sell: item.isCartSell,
    is_negotiable: item.isNegotiable,
    seller_email: item.sellerEmail,
    seller_name: item.sellerName,
    seller_whatsapp: item.sellerWhatsapp,
    created_at: item.createdAt || new Date().toISOString(),
    expires_at: item.expiresAt || new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    rerouted_to_admin: Boolean(item.reroutedToAdmin),
    images: item.images || [],
    thumbnail_index: item.thumbnailIndex || 0,
    reference_links: item.referenceLinks || [],
    sub_items: item.subItems || []
  };
}

// ====================================================================
// AUTHENTICATION SERVICES
// ====================================================================

/**
 * Sign in with Google OAuth via Supabase
 */
export async function signInWithGoogle(emailHint) {
  const redirectUrl = window.location.origin;
  const queryParams = {
    access_type: 'offline',
    prompt: 'select_account'
  };

  if (emailHint && emailHint.trim()) {
    let clean = emailHint.trim().toLowerCase();
    if (!clean.includes('@')) {
      clean = `${clean}@iisermohali.ac.in`;
    }
    queryParams.login_hint = clean;
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      skipBrowserRedirect: true,
      queryParams
    }
  });

  if (error) throw error;
  if (!data?.url) throw new Error("Could not retrieve Google OAuth authorization URL from Supabase.");

  // If inside an iframe and top navigation is accessible, navigate top window to avoid iframe blocks
  try {
    if (window.top && window.top !== window.self) {
      window.top.location.href = data.url;
      return data;
    }
  } catch (navErr) {
    console.warn("Iframe top navigation restricted, falling back to local window:", navErr);
  }

  window.location.href = data.url;
  return data;
}

/**
 * Get direct Google OAuth authorization URL from Supabase
 */
export async function getGoogleOAuthUrl(emailHint) {
  const redirectUrl = window.location.origin;
  const queryParams = {
    access_type: 'offline',
    prompt: 'select_account'
  };

  if (emailHint && emailHint.trim()) {
    let clean = emailHint.trim().toLowerCase();
    if (!clean.includes('@')) {
      clean = `${clean}@iisermohali.ac.in`;
    }
    queryParams.login_hint = clean;
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      skipBrowserRedirect: true,
      queryParams
    }
  });

  if (error) throw error;
  return data?.url;
}

/**
 * Update user profile in Supabase DB and Auth metadata
 */
export async function updateUserProfile(email, name, whatsapp) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim();
    const cleanPhone = whatsapp.trim();
    const adminFlag = isUserAdmin(cleanEmail);

    if (session?.user) {
      await supabase.from('profiles').upsert({
        id: session.user.id,
        email: cleanEmail,
        name: cleanName,
        whatsapp: cleanPhone,
        is_admin: adminFlag,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

      await supabase.auth.updateUser({
        data: { name: cleanName, whatsapp: cleanPhone }
      });
    } else {
      // Upsert by email if no session (fallback)
      await supabase.from('profiles').upsert({
        email: cleanEmail,
        name: cleanName,
        whatsapp: cleanPhone,
        is_admin: adminFlag
      }, { onConflict: 'email' });
    }
  } catch (err) {
    console.warn("Could not sync profile update to Supabase:", err.message);
  }
}

/**
 * Save / complete first-time user profile in Supabase database
 */
export async function saveUserProfile(userId, email, name, whatsapp) {
  const cleanEmail = email.toLowerCase().trim();
  const cleanName = name.trim();
  const cleanPhone = whatsapp.trim();
  const adminFlag = isUserAdmin(cleanEmail);

  // 1. Upsert into Supabase public.profiles table
  const { data, error } = await supabase.from('profiles').upsert({
    id: userId,
    email: cleanEmail,
    name: cleanName,
    whatsapp: cleanPhone,
    is_admin: adminFlag,
    is_suspended: false,
    created_at: new Date().toISOString()
  }, { onConflict: 'id' }).select().single();

  if (error) {
    console.error("Error saving profile to Supabase:", error);
    // If select fails due to RLS, try simple upsert without select
    await supabase.from('profiles').upsert({
      id: userId,
      email: cleanEmail,
      name: cleanName,
      whatsapp: cleanPhone,
      is_admin: adminFlag,
      is_suspended: false
    });
  }

  // 2. Also update Supabase Auth user metadata
  try {
    await supabase.auth.updateUser({
      data: {
        name: cleanName,
        whatsapp: cleanPhone
      }
    });
  } catch (authErr) {
    console.warn("Could not update auth user metadata:", authErr.message);
  }

  return {
    id: userId,
    email: cleanEmail,
    name: cleanName,
    whatsapp: cleanPhone,
    isAdmin: adminFlag,
    isSuspended: false,
    needsOnboarding: false,
    provider: 'google'
  };
}

/**
 * Sign up user with email & password
 */
export async function signUpUser(email, password, name, whatsapp) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, whatsapp }
    }
  });
  if (error) throw error;
  
  // Also insert or upsert profile in public.profiles table
  if (data.user) {
    await supabase.from('profiles').upsert({
      id: data.user.id,
      email: email.toLowerCase(),
      name,
      whatsapp,
      is_admin: isUserAdmin(email),
      is_suspended: false
    });
  }

  return data;
}

/**
 * Sign in user with email & password
 */
export async function signInUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  if (error) throw error;
  return data;
}

/**
 * Send password reset email with recovery link
 */
export async function sendPasswordResetEmail(email) {
  const redirectUrl = window.location.origin;
  const { data, error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase(), {
    redirectTo: redirectUrl
  });
  if (error) throw error;
  return data;
}

/**
 * Update user's password (used when clicking email confirmation / recovery link)
 */
export async function updateUserPassword(newPassword) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  });
  if (error) throw error;
  return data;
}

/**
 * Sign out current session
 */
export async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) console.error("Error signing out:", error);
}

/**
 * Get current session and user profile from Supabase
 */
export async function getCurrentUserProfile() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const userEmail = session.user.email || '';
  const isCampusEmail = userEmail.toLowerCase().endsWith('@iisermohali.ac.in');
  const adminFlag = isUserAdmin(userEmail);

  // Domain gatekeeper: enforce @iisermohali.ac.in or authorized admin
  if (!isCampusEmail && !adminFlag) {
    await signOutUser();
    return {
      accessDenied: true,
      email: userEmail,
      message: `Access Restricted: ${userEmail} is not an official @iisermohali.ac.in campus account.`
    };
  }

  const googleName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || '';

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();

    if (profile && profile.whatsapp && profile.whatsapp.trim()) {
      return {
        id: profile.id,
        email: profile.email || userEmail,
        name: profile.name || googleName || userEmail.split('@')[0],
        whatsapp: profile.whatsapp,
        isAdmin: profile.is_admin || adminFlag,
        isSuspended: profile.is_suspended || false,
        needsOnboarding: false,
        provider: session.user.app_metadata?.provider || 'google'
      };
    }

    // If profile exists but lacks whatsapp number
    if (profile) {
      return {
        id: profile.id,
        email: profile.email || userEmail,
        name: profile.name || googleName || userEmail.split('@')[0],
        whatsapp: profile.whatsapp || '',
        isAdmin: profile.is_admin || adminFlag,
        isSuspended: profile.is_suspended || false,
        needsOnboarding: true,
        provider: session.user.app_metadata?.provider || 'google'
      };
    }
  } catch (err) {
    console.warn("Could not query profile table:", err.message);
  }

  // First time sign-in: Brand new Google user without a profile in Supabase
  return {
    id: session.user.id,
    email: userEmail,
    name: googleName || userEmail.split('@')[0],
    whatsapp: '',
    isAdmin: adminFlag,
    isSuspended: false,
    needsOnboarding: true,
    provider: session.user.app_metadata?.provider || 'google'
  };
}

// ====================================================================
// STORAGE SERVICE (Supabase Storage: product-images)
// ====================================================================

/**
 * Client-side image compression to optimize high-res phone photos before uploading
 */
export async function compressImage(file, maxWidth = 1200, quality = 0.8) {
  if (!file || !file.type.startsWith('image/')) return file;
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}

export async function uploadProductImage(file) {
  if (!file) return null;

  try {
    const optimizedFile = await compressImage(file);
    const fileExt = optimizedFile.name?.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `listings/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, optimizedFile, { upsert: true, cacheControl: '3600' });

    if (uploadError) {
      console.warn("Supabase Storage upload warning (falling back to object URL):", uploadError.message);
      return URL.createObjectURL(file);
    }

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (err) {
    console.error("Storage upload exception:", err);
    return URL.createObjectURL(file);
  }
}

// ====================================================================
// LISTINGS DATABASE SERVICES
// ====================================================================
export async function fetchListingsFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn("Could not fetch listings from Supabase (using local/fallback data):", error.message);
      return null;
    }

    if (data && data.length > 0) {
      return data.map(rowToListing);
    }
    return [];
  } catch (err) {
    console.error("Error fetching listings:", err);
    return null;
  }
}

export async function createListingInSupabase(listing) {
  try {
    const row = listingToRow(listing);
    const { data, error } = await supabase
      .from('listings')
      .insert([row])
      .select()
      .single();

    if (error) {
      console.warn("Could not insert listing into Supabase database:", error.message);
      return listing;
    }

    return rowToListing(data);
  } catch (err) {
    console.error("Exception in createListingInSupabase:", err);
    return listing;
  }
}

export async function updateListingInSupabase(id, updates) {
  try {
    const rowUpdates = {};
    if (updates.expiresAt !== undefined) rowUpdates.expires_at = updates.expiresAt;
    if (updates.reroutedToAdmin !== undefined) rowUpdates.rerouted_to_admin = updates.reroutedToAdmin;
    if (updates.title !== undefined) rowUpdates.title = updates.title;
    if (updates.price !== undefined) rowUpdates.price = updates.price;

    const { error } = await supabase
      .from('listings')
      .eq('id', id)
      .update(rowUpdates);

    if (error) {
      console.warn("Could not update listing in Supabase:", error.message);
    }
  } catch (err) {
    console.error("Error updating listing in Supabase:", err);
  }
}

export async function deleteListingFromSupabase(id) {
  try {
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', id);

    if (error) {
      console.warn("Could not delete listing from Supabase:", error.message);
    }
  } catch (err) {
    console.error("Error deleting listing from Supabase:", err);
  }
}

// ====================================================================
// BANNED KEYWORDS SERVICES
// ====================================================================
export async function fetchBannedKeywordsFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('banned_keywords')
      .select('keyword');

    if (error || !data || data.length === 0) return null;
    return data.map(item => item.keyword);
  } catch (err) {
    console.error("Error fetching banned keywords:", err);
    return null;
  }
}

export async function addBannedKeywordToSupabase(keyword) {
  try {
    await supabase.from('banned_keywords').insert([{ keyword: keyword.toLowerCase() }]);
  } catch (err) {
    console.error("Error adding banned keyword:", err);
  }
}

export async function removeBannedKeywordFromSupabase(keyword) {
  try {
    await supabase.from('banned_keywords').delete().eq('keyword', keyword.toLowerCase());
  } catch (err) {
    console.error("Error removing banned keyword:", err);
  }
}

// ====================================================================
// PROFILES / USER SUSPENSION SERVICES
// ====================================================================
export async function fetchProfilesFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');

    if (error || !data || data.length === 0) return null;
    return data.map(p => ({
      email: p.email,
      name: p.name,
      whatsapp: p.whatsapp,
      isSuspended: p.is_suspended,
      isAdmin: p.is_admin
    }));
  } catch (err) {
    console.error("Error fetching profiles:", err);
    return null;
  }
}

export async function toggleUserSuspensionInSupabase(email, isSuspended) {
  try {
    await supabase
      .from('profiles')
      .update({ is_suspended: isSuspended })
      .eq('email', email.toLowerCase());
  } catch (err) {
    console.error("Error toggling user suspension in Supabase:", err);
  }
}
