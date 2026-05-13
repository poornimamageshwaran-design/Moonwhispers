-- Moonlight Notes - Supabase schema starter
-- Run via Supabase migrations or SQL editor.

create extension if not exists "pgcrypto";

-- Profiles / RBAC
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

-- Posts (blog CMS)
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete set null,
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null,
  cover_image_url text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_posts_updated_at on public.posts;
create trigger set_posts_updated_at
before update on public.posts
for each row
execute function public.set_updated_at();

-- Comments (on published posts)
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

-- Contact form capture
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

-- Newsletter subscribers
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

-- Storage bucket (optional; create it in Supabase UI if not present)
-- Bucket name used by code: "uploads"

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.contact_messages enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- RLS: posts
create policy "Posts are publicly readable (published only)"
on public.posts for select
using (status = 'published');

-- RLS: comments
create policy "Published post comments are publicly readable"
on public.comments for select
using (
  exists (
    select 1 from public.posts p
    where p.id = comments.post_id and p.status = 'published'
  )
);

create policy "Authenticated users can insert comments"
on public.comments for insert
with check (
  auth.uid() = author_id
  and exists (
    select 1 from public.posts p
    where p.id = comments.post_id and p.status = 'published'
  )
);

-- RLS: contact messages (allow insert)
create policy "Contact messages can be inserted"
on public.contact_messages for insert
with check (true);

-- RLS: newsletter subscribers (allow insert)
create policy "Newsletter subscribers can be inserted"
on public.newsletter_subscribers for insert
with check (true);

-- RLS: profiles (public select for your own row)
create policy "Users can read their own profile"
on public.profiles for select
using (id = auth.uid());

-- Admin policies (optional; protected in code via service role)
-- If you rely on RLS for admin, add policies like:
-- exists (select 1 from profiles pr where pr.id = auth.uid() and pr.role='admin')

-- Auto-create a profile row for new auth users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name'),
    'user'
  )
  on conflict (id) do nothing;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();


