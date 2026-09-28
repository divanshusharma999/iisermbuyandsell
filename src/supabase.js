import { createClient } from '@supabase/supabase-js';
import { isUserAdmin } from './data/mockData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mjcapuzqkopueaktfbge.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qY2FwdXpxa29wdWVha3RmYmdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4Mjk1MTEsImV4cCI6MjEwNTQwNTUxMX0.Gh2utuBn1j4UFH-eyUhSkiPH8XX3I7jOMpdkXISqK3Y';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
 * Sign in with Google OAuth
 */
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  });
  if (error) throw error;
  return data;
}

/**
 * Update user profile in Supabase DB and Auth metadata
 */
export async function updateUserProfile(email, name, whatsapp) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase.from('profiles').upsert({
        id: session.user.id,
        email: email.toLowerCase(),
        name,
        whatsapp,
        is_admin: isUserAdmin(email),
        updated_at: new Date().toISOString()
      });
      await supabase.auth.updateUser({
        data: { name, whatsapp }
      });
    } else {
      // Upsert by email if no session (fallback)
      await supabase.from('profiles').upsert({
        email: email.toLowerCase(),
        name,
        whatsapp,
        is_admin: isUserAdmin(email)
      }, { onConflict: 'email' });
    }
  } catch (err) {
    console.warn("Could not sync profile update to Supabase:", err.message);
  }
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
 * Sign out current session
 */
export async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) console.error("Error signing out:", error);
}

/**
 * Get current session and user profile
 */
export async function getCurrentUserProfile() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (profile) {
    return {
      id: profile.id,
      email: profile.email,
      name: profile.name || session.user.user_metadata?.full_name || session.user.user_metadata?.name || profile.email.split('@')[0],
      whatsapp: profile.whatsapp || session.user.user_metadata?.whatsapp || '',
      isAdmin: profile.is_admin || isUserAdmin(profile.email),
      isSuspended: profile.is_suspended,
      provider: session.user.app_metadata?.provider || 'email'
    };
  }

  // Fresh Google OAuth or Auth user without profile table row yet
  const email = session.user.email || '';
  const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name || email.split('@')[0];
  const whatsapp = session.user.user_metadata?.whatsapp || '';

  try {
    await supabase.from('profiles').upsert({
      id: session.user.id,
      email: email.toLowerCase(),
      name,
      whatsapp,
      is_admin: isUserAdmin(email),
      is_suspended: false
    });
  } catch (e) {
    console.warn("Auto-upsert profile warning:", e.message);
  }

  return {
    id: session.user.id,
    email: email,
    name: name,
    whatsapp: whatsapp,
    isAdmin: isUserAdmin(email),
    isSuspended: false,
    provider: session.user.app_metadata?.provider || 'google'
  };
}

// ====================================================================
// STORAGE SERVICE (Supabase Storage: product-images)
// ====================================================================
export async function uploadProductImage(file) {
  if (!file) return null;

  try {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `listings/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, { upsert: true, cacheControl: '3600' });

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
