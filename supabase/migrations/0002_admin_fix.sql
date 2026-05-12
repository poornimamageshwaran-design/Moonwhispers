-- ============================================================
-- ROOT CAUSE ANALYSIS
-- ============================================================
-- BUG 1: The ONLY SELECT policy on public.posts is:
--   "Posts are publicly readable (published only)"
--   USING (status = 'published')
--
--   This means ANY query from a browser client — even an
--   authenticated admin — can only see published posts.
--   Draft posts are INVISIBLE. And crucially, even though
--   the API route uses the service role key (which bypasses
--   RLS entirely), the admin page was previously calling
--   Supabase directly from the browser, hitting this wall.
--
-- BUG 2: posts.author_id references public.profiles(id),
--   NOT auth.users(id). When a post is inserted with
--   author_id = auth.uid(), that UUID must already exist
--   in public.profiles. If the profile trigger failed or
--   hasn't run, the insert silently sets author_id = NULL
--   (because the FK is ON DELETE SET NULL style), breaking
--   any future "show my posts" queries.
--
-- BUG 3: Every new user gets role = 'user'. The API route
--   checks role = 'admin' and returns 403 Forbidden. The
--   admin page then shows "no posts" (or the not-admin
--   screen). You must manually promote your account.
--
-- BUG 4: The INSERT policy for posts is missing entirely.
--   Posts were being created successfully only because the
--   API route uses the service role key which bypasses RLS.
--   If anyone ever tries to insert via the browser client,
--   it will silently fail.
-- ============================================================

-- ── Step 1: Add missing INSERT policy for posts (via API only
--   in practice, but belt-and-suspenders for direct inserts) ──
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'posts'
      and policyname = 'Admins can insert posts'
  ) then
    execute $p$
      create policy "Admins can insert posts"
      on public.posts for insert
      with check (
        exists (
          select 1 from public.profiles
          where id = auth.uid() and role = 'admin'
        )
      )
    $p$;
  end if;
end $$;

-- ── Step 2: Add missing UPDATE policy for posts ──
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'posts'
      and policyname = 'Admins can update posts'
  ) then
    execute $p$
      create policy "Admins can update posts"
      on public.posts for update
      using (
        exists (
          select 1 from public.profiles
          where id = auth.uid() and role = 'admin'
        )
      )
    $p$;
  end if;
end $$;

-- ── Step 3: Add missing DELETE policy for posts ──
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'posts'
      and policyname = 'Admins can delete posts'
  ) then
    execute $p$
      create policy "Admins can delete posts"
      on public.posts for delete
      using (
        exists (
          select 1 from public.profiles
          where id = auth.uid() and role = 'admin'
        )
      )
    $p$;
  end if;
end $$;

-- ── Step 4: Allow admins to read ALL posts (incl. drafts) ──
-- The existing policy only allows reading published posts.
-- We add a second SELECT policy for admins (policies are OR'd).
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'posts'
      and policyname = 'Admins can read all posts'
  ) then
    execute $p$
      create policy "Admins can read all posts"
      on public.posts for select
      using (
        exists (
          select 1 from public.profiles
          where id = auth.uid() and role = 'admin'
        )
      )
    $p$;
  end if;
end $$;

-- ── Step 5: Allow admins to read all profiles ──
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'profiles'
      and policyname = 'Admins can read all profiles'
  ) then
    execute $p$
      create policy "Admins can read all profiles"
      on public.profiles for select
      using (
        exists (
          select 1 from public.profiles self
          where self.id = auth.uid() and self.role = 'admin'
        )
      )
    $p$;
  end if;
end $$;

-- ── Step 6: Promote YOUR account to admin ──
-- This updates every existing profile whose email matches.
-- Replace the email below with your actual email if needed,
-- OR just run the UPDATE directly in the Supabase SQL editor.
--
-- NOTE: We join through auth.users because profiles doesn't
-- store email directly.
update public.profiles p
set role = 'admin'
from auth.users u
where p.id = u.id
  and u.email is not null
  and p.role = 'user'
  and not exists (
    -- Only promote if there's exactly one user (solo blog).
    -- Remove this subquery if you have multiple users.
    select 1 from auth.users u2 where u2.id != u.id
  );

-- ── Step 7: Fix orphaned posts (author_id = NULL) ──
-- If your post was inserted with author_id pointing to a
-- user UUID that didn't exist in profiles yet, the FK
-- constraint would have caused an error OR the row was
-- inserted without an author. This ties any NULL author_id
-- posts to the (now single) admin user.
update public.posts
set author_id = (
  select p.id from public.profiles p
  join auth.users u on u.id = p.id
  where p.role = 'admin'
  limit 1
)
where author_id is null;

-- ── Verification queries (read-only, always safe to run) ──
-- After running this migration, run these in the SQL editor
-- to confirm everything is correct:
--
--   SELECT id, email FROM auth.users;
--   SELECT id, role, display_name FROM public.profiles;
--   SELECT id, title, status, author_id FROM public.posts;
--   SELECT policyname, cmd FROM pg_policies WHERE tablename='posts';