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
/**
 * Update user profile in Supabase DB and Auth metadata
 */
export async function updateUserProfile(email, name, whatsapp, userId = null) {
  const cleanEmail = email ? email.toLowerCase().trim() : '';
  const cleanName = name ? name.trim() : '';
  const cleanPhone = whatsapp ? whatsapp.trim() : '';
  const adminFlag = isUserAdmin(cleanEmail);

  let targetId = userId;
  if (!targetId) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      targetId = session?.user?.id;
    } catch (e) {
      console.warn("Could not get current session user id:", e.message);
    }
  }

  // 1. Immediately update Supabase Auth user_metadata (this reliably persists on the Supabase user)
  try {
    await supabase.auth.updateUser({
      data: {
        name: cleanName,
        full_name: cleanName,
        whatsapp: cleanPhone
      }
    });
  } catch (authErr) {
    console.warn("Could not update auth user metadata:", authErr.message);
  }

  // 2. Try updating public.profiles table by id
  let dbUpdated = false;
  if (targetId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          name: cleanName,
          whatsapp: cleanPhone,
          email: cleanEmail
        })
        .eq('id', targetId)
        .select();

      if (!error && data && data.length > 0) {
        dbUpdated = true;
      }
    } catch (e) {
      console.warn("Profile update by id notice:", e.message);
    }
  }

  // 3. If not updated by id, try updating by email
  if (!dbUpdated && cleanEmail) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          name: cleanName,
          whatsapp: cleanPhone,
          id: targetId || undefined
        })
        .eq('email', cleanEmail)
        .select();

      if (!error && data && data.length > 0) {
        dbUpdated = true;
      }
    } catch (e) {
      console.warn("Profile update by email notice:", e.message);
    }
  }

  // 4. Fallback: Upsert into public.profiles
  if (!dbUpdated) {
    try {
      const payload = {
        email: cleanEmail,
        name: cleanName,
        whatsapp: cleanPhone,
        is_admin: adminFlag,
        is_suspended: false
      };
      if (targetId) payload.id = targetId;

      await supabase.from('profiles').upsert(payload, { onConflict: targetId ? 'id' : 'email' });
    } catch (upsertErr) {
      console.warn("Profile upsert notice:", upsertErr.message);
    }
  }

  // 5. Keep all active listings of this seller in sync with new WhatsApp contact
  if (cleanEmail && cleanPhone) {
    try {
      await supabase
        .from('listings')
        .update({
          seller_whatsapp: cleanPhone,
          seller_name: cleanName
        })
        .eq('seller_email', cleanEmail);
    } catch (listErr) {
      console.warn("Could not sync listings seller contact:", listErr.message);
    }
  }

  return {
    id: targetId,
    email: cleanEmail,
    name: cleanName,
    whatsapp: cleanPhone,
    isAdmin: adminFlag
  };
}

/**
 * Save / complete first-time user profile in Supabase database
 */
export async function saveUserProfile(userId, email, name, whatsapp) {
  const cleanEmail = email.toLowerCase().trim();
  const cleanName = name.trim();
  const cleanPhone = whatsapp.trim();
  const adminFlag = isUserAdmin(cleanEmail);

  // 1. Upsert into Supabase public.profiles table with exact table columns
  const { error } = await supabase.from('profiles').upsert({
    id: userId,
    email: cleanEmail,
    name: cleanName,
    whatsapp: cleanPhone,
    is_admin: adminFlag,
    is_suspended: false
  }, { onConflict: 'id' });

  if (error) {
    console.error("Error saving profile to Supabase:", error);
    // If conflict on ID failed, try updating directly by id or email
    const { error: fallbackErr } = await supabase.from('profiles').update({
      name: cleanName,
      whatsapp: cleanPhone
    }).eq('id', userId);
    
    if (fallbackErr) {
      await supabase.from('profiles').update({
        name: cleanName,
        whatsapp: cleanPhone
      }).eq('email', cleanEmail);
    }
  }

  // 2. Also update Supabase Auth user metadata
  try {
    await supabase.auth.updateUser({
      data: {
        name: cleanName,
        full_name: cleanName,
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
  const metadataPhone = session.user.user_metadata?.whatsapp || '';

  let dbProfile = null;
  try {
    // 1. Check profiles by session user id
    const { data: byId } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();

    if (byId) {
      dbProfile = byId;
    } else if (userEmail) {
      // 2. Fallback: check profiles by email
      const { data: byEmail } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', userEmail.toLowerCase())
        .maybeSingle();
      if (byEmail) {
        dbProfile = byEmail;
      }
    }
  } catch (err) {
    console.warn("Could not query profile table:", err.message);
  }

  // Resolve best known phone number: database -> user_metadata -> localStorage
  let savedLocalUser = null;
  try {
    const raw = localStorage.getItem('iiserm_current_user');
    if (raw) savedLocalUser = JSON.parse(raw);
  } catch (e) {}

  const resolvedPhone = (dbProfile?.whatsapp?.trim()) ||
    (metadataPhone?.trim()) ||
    (savedLocalUser?.email?.toLowerCase() === userEmail.toLowerCase() ? savedLocalUser?.whatsapp?.trim() : '') ||
    '';

  const resolvedName = (dbProfile?.name?.trim()) ||
    googleName ||
    (savedLocalUser?.name?.trim()) ||
    userEmail.split('@')[0];

  const resolvedAdmin = Boolean(dbProfile?.is_admin || adminFlag);
  const resolvedSuspended = Boolean(dbProfile?.is_suspended || false);

  // If user has a resolved phone number from metadata/localStorage but missing in DB, sync it in the background
  if (resolvedPhone && (!dbProfile || !dbProfile.whatsapp)) {
    supabase.from('profiles').upsert({
      id: session.user.id,
      email: userEmail.toLowerCase(),
      name: resolvedName,
      whatsapp: resolvedPhone,
      is_admin: resolvedAdmin,
      is_suspended: resolvedSuspended
    }).catch(e => console.warn("Background profile sync:", e.message));
  }

  return {
    id: session.user.id,
    email: dbProfile?.email || userEmail,
    name: resolvedName,
    whatsapp: resolvedPhone,
    isAdmin: resolvedAdmin,
    isSuspended: resolvedSuspended,
    needsOnboarding: !resolvedPhone,
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
// ====================================================================
// STORAGE IMAGE CLEANUP HELPERS
// ====================================================================

/**
 * Extract storage object path from full Supabase Storage public URL
 */
export function getStoragePathFromUrl(url) {
  if (!url || typeof url !== 'string') return null;
  // If URL contains '/product-images/', extract the relative file path inside the bucket
  const marker = 'product-images/';
  const idx = url.indexOf(marker);
  if (idx !== -1) {
    return url.substring(idx + marker.length);
  }
  if (url.startsWith('listings/')) {
    return url;
  }
  return null;
}

/**
 * Remove uploaded images from Supabase Storage 'product-images' bucket
 */
export async function deleteListingImagesFromStorage(imageUrls) {
  if (!Array.isArray(imageUrls) || imageUrls.length === 0) return;
  try {
    const filePaths = imageUrls
      .map(getStoragePathFromUrl)
      .filter(Boolean);

    if (filePaths.length > 0) {
      const { error } = await supabase.storage
        .from('product-images')
        .remove(filePaths);

      if (error) {
        console.warn("Notice deleting listing images from storage:", error.message);
      }
    }
  } catch (err) {
    console.warn("Storage cleanup exception:", err.message);
  }
}

// ====================================================================
// LISTINGS DATABASE SERVICES
// ====================================================================

/**
 * Automatically delete all expired listings (expires_at < NOW) and their storage images
 */
export async function deleteExpiredListingsFromSupabase() {
  try {
    const nowIso = new Date().toISOString();

    // 1. Fetch expired items to retrieve their image paths before table deletion
    const { data: expiredRows, error: fetchErr } = await supabase
      .from('listings')
      .select('id, images')
      .lt('expires_at', nowIso);

    if (fetchErr) {
      console.warn("Could not query expired listings for cleanup:", fetchErr.message);
      return 0;
    }

    if (expiredRows && expiredRows.length > 0) {
      // Clean up storage images for all expired items
      const allImages = expiredRows.flatMap(row => Array.isArray(row.images) ? row.images : []);
      if (allImages.length > 0) {
        await deleteListingImagesFromStorage(allImages);
      }

      // 2. Permanently delete all expired listings from Supabase table
      const { error: deleteErr } = await supabase
        .from('listings')
        .delete()
        .lt('expires_at', nowIso);

      if (deleteErr) {
        console.warn("Could not delete expired listings from Supabase table:", deleteErr.message);
      }

      return expiredRows.length;
    }
    return 0;
  } catch (err) {
    console.warn("Exception in deleteExpiredListingsFromSupabase:", err);
    return 0;
  }
}

export async function fetchListingsFromSupabase() {
  try {
    const nowIso = new Date().toISOString();

    // Run background cleanup of expired listings
    deleteExpiredListingsFromSupabase().catch(e => {
      console.warn("Background expired cleanup notice:", e.message);
    });

    // Fetch active non-expired listings
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
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

/**
 * Permanently delete listing row from Supabase and delete its images from Storage
 */
export async function deleteListingFromSupabase(id, images = []) {
  try {
    // 1. Gather image URLs to clean up from Supabase Storage
    let imagesToDelete = Array.isArray(images) && images.length > 0 ? images : [];
    if (imagesToDelete.length === 0) {
      try {
        const { data: item } = await supabase
          .from('listings')
          .select('images')
          .eq('id', id)
          .maybeSingle();
        if (item?.images && Array.isArray(item.images)) {
          imagesToDelete = item.images;
        }
      } catch (e) {
        console.warn("Could not fetch listing images before deletion:", e.message);
      }
    }

    // 2. Remove files from Supabase Storage
    if (imagesToDelete.length > 0) {
      await deleteListingImagesFromStorage(imagesToDelete);
    }

    // 3. Delete row from Supabase listings table
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
