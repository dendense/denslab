-- denslab: schema for posts, profiles, and admin-only access.
-- Run this once in Supabase Dashboard -> SQL Editor.
--
-- Order matters: tables, then the role trigger, then RLS.

-- ---------------------------------------------------------------------------
-- 1. Posts
-- ---------------------------------------------------------------------------
-- Category is the discriminator for the two post shapes. Both metadata columns
-- are JSONB and nullable, and a CHECK constraint enforces that exactly the
-- right one is set for each category. That mirrors the AiPost / PhotoPost
-- discriminated union in lib/posts.ts.

create table if not exists public.posts (
  id            uuid primary key default gen_random_uuid(),
  title         text not null check (char_length(title) between 1 and 120),
  description   text not null,
  imgur_id      text not null,
  width         integer not null check (width > 0),
  height        integer not null check (height > 0),
  category      text not null check (category in ('AI Generated', 'Photoshoot')),
  tags          text[] not null default '{}',
  metadata       jsonb,
  photo_metadata jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint posts_metadata_matches_category check (
    (category = 'AI Generated' and metadata is not null and photo_metadata is null)
    or
    (category = 'Photoshoot' and photo_metadata is not null and metadata is null)
  )
);

create index if not exists posts_created_at_idx on public.posts (created_at desc);
create index if not exists posts_category_idx on public.posts (category);

-- ---------------------------------------------------------------------------
-- 2. Profiles
-- ---------------------------------------------------------------------------
-- One row per auth user, created automatically by the trigger below. Role
-- defaults to 'user'; you promote yourself to 'admin' in step 4.

create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text,
  role       text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

-- Backfill profiles for users who signed in before this script ran.
insert into public.profiles (id, email)
select id, email from auth.users
on conflict (id) do nothing;

-- New sign-ups get a profile automatically.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 3. Row Level Security
-- ---------------------------------------------------------------------------
alter table public.posts enable row level security;
alter table public.profiles enable row level security;

-- Helper: is the current user an admin? SECURITY DEFINER so the policy can read
-- profiles without tripping over profiles' own RLS.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Posts: everyone (including signed-out visitors) can read.
drop policy if exists "posts are readable by everyone" on public.posts;
create policy "posts are readable by everyone"
  on public.posts for select
  using (true);

-- Posts: only admins can create, update, or delete.
drop policy if exists "posts are writable by admins" on public.posts;
create policy "posts are writable by admins"
  on public.posts for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "posts are updatable by admins" on public.posts;
create policy "posts are updatable by admins"
  on public.posts for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "posts are deletable by admins" on public.posts;
create policy "posts are deletable by admins"
  on public.posts for delete
  to authenticated
  using (public.is_admin());

-- Profiles: a user reads their own row; admins read all.
drop policy if exists "profiles are readable by owner or admin" on public.profiles;
create policy "profiles are readable by owner or admin"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------------
-- 4. Promote the owner account to admin
-- ---------------------------------------------------------------------------
-- Sign in to the site once with this Google account first, otherwise no
-- matching row exists yet.

update public.profiles
set role = 'admin'
where email = 'denyfarras@gmail.com';

-- Verify: should return one row with role = 'admin'.
select id, email, role from public.profiles where role = 'admin';
