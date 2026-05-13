-- ============================================================
-- MOONWHISPERS — Complete Auth Fix
-- Run this ONCE in Supabase SQL Editor (Dashboard → SQL Editor)
-- Safe to re-run: uses IF EXISTS / OR REPLACE guards everywhere
-- ============================================================


-- ──────────────────────────────────────────────
-- 1. PROFILES TABLE
--    Create if missing; add columns if they were
--    added later so re-runs are always safe.
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text,
  role        text NOT NULL DEFAULT 'user'
                   CHECK (role IN ('admin', 'user')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Add any missing columns idempotently
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'profiles'
      AND column_name  = 'email'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN email text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'profiles'
      AND column_name  = 'role'
  ) THEN
    ALTER TABLE public.profiles
      ADD COLUMN role text NOT NULL DEFAULT 'user'
      CHECK (role IN ('admin', 'user'));
  END IF;
END
$$;


-- ──────────────────────────────────────────────
-- 2. RLS — Enable and set policies
-- ──────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop old policies cleanly before recreating
DROP POLICY IF EXISTS "Users can view own profile"   ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role full access"     ON public.profiles;

-- Authenticated users see only their own row
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Authenticated users update only their own row
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Service-role (used by triggers + server-side code) has unrestricted access
CREATE POLICY "Service role full access"
  ON public.profiles FOR ALL
  USING      (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');


-- ──────────────────────────────────────────────
-- 3. TRIGGER FUNCTION
--    Runs as SECURITY DEFINER so it can bypass
--    RLS and write the new profile row.
-- ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role text := 'user';
BEGIN
  -- Promote the very first user to admin automatically,
  -- OR check a custom claim / metadata if you prefer.
  -- To hard-code an admin email, uncomment the block below:
  --
  -- IF NEW.email = 'admin@yourdomain.com' THEN
  --   _role := 'admin';
  -- END IF;

  -- Check raw_user_meta_data for a role hint (optional)
  IF (NEW.raw_user_meta_data ->> 'role') = 'admin' THEN
    _role := 'admin';
  END IF;

  INSERT INTO public.profiles (id, email, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    _role,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE          -- safe if row already exists
    SET email      = EXCLUDED.email,
        updated_at = NOW();

  RETURN NEW;
END;
$$;

-- Grant execute so the trigger can fire even from restricted contexts
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;


-- ──────────────────────────────────────────────
-- 4. TRIGGER
--    DROP IF EXISTS first → eliminates the
--    "trigger already exists" error you hit.
-- ──────────────────────────────────────────────
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();


-- ──────────────────────────────────────────────
-- 5. BACK-FILL — create profiles for any existing
--    auth.users rows that have no profile yet
-- ──────────────────────────────────────────────
INSERT INTO public.profiles (id, email, role, created_at, updated_at)
SELECT
  u.id,
  u.email,
  'user',
  u.created_at,
  NOW()
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING;


-- ──────────────────────────────────────────────
-- 6. GRANT table access to authenticated role
-- ──────────────────────────────────────────────
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO service_role;


-- Done ✓
