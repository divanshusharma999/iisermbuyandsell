-- ====================================================================
-- SUPABASE MARKETPLACE DATABASE SCHEMA & STORAGE CONFIGURATION
-- Project: KollectoP2P (IISER Mohali Campus Marketplace)
-- ====================================================================

-- 1. Create Profiles Table (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  is_suspended BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read of profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Allow users to insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id OR true);

CREATE POLICY "Allow users/admins to update profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR true);


-- 2. Create Banned Keywords Table
CREATE TABLE IF NOT EXISTS public.banned_keywords (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.banned_keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read of banned keywords" ON public.banned_keywords
  FOR SELECT USING (true);

CREATE POLICY "Allow insert/delete of banned keywords" ON public.banned_keywords
  FOR ALL USING (true);


-- 3. Create Listings Table
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  title TEXT NOT NULL,
  price NUMERIC NOT NULL,
  category TEXT NOT NULL,
  condition TEXT NOT NULL,
  description TEXT,
  is_cart_sell BOOLEAN DEFAULT FALSE,
  is_negotiable BOOLEAN DEFAULT TRUE,
  seller_email TEXT NOT NULL,
  seller_name TEXT NOT NULL,
  seller_whatsapp TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '21 days'),
  rerouted_to_admin BOOLEAN DEFAULT FALSE,
  images JSONB DEFAULT '[]'::jsonb,
  thumbnail_index INTEGER DEFAULT 0,
  reference_links JSONB DEFAULT '[]'::jsonb,
  sub_items JSONB DEFAULT '[]'::jsonb
);

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read of listings" ON public.listings
  FOR SELECT USING (true);

CREATE POLICY "Allow anyone/authenticated to insert listings" ON public.listings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow updates to listings" ON public.listings
  FOR UPDATE USING (true);

CREATE POLICY "Allow deletion of listings" ON public.listings
  FOR DELETE USING (true);


-- 4. Storage Bucket Setup (product-images)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Public Read Product Images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Anyone Upload Product Images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Anyone Delete Product Images" ON storage.objects
  FOR DELETE USING (bucket_id = 'product-images');


-- 5. Seed Initial Banned Keywords
INSERT INTO public.banned_keywords (keyword) VALUES
  ('exam paper'), ('leak'), ('weed'), ('alcohol'), ('drugs'),
  ('weapon'), ('knife'), ('cheat'), ('vape'), ('tobacco'), ('stolen')
ON CONFLICT (keyword) DO NOTHING;

-- 6. Trigger to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, whatsapp, is_admin, is_suspended)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'whatsapp', '+919876543210'),
    CASE WHEN NEW.email LIKE '%admin%' THEN true ELSE false END,
    false
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    whatsapp = EXCLUDED.whatsapp;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
