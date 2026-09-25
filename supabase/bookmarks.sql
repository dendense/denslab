-- denslab: bookmarks, so a signed-in user can save favourite posts.
-- Run this in Supabase Dashboard -> SQL Editor after schema.sql.
--
-- Design notes:
-- - The composite primary key (user_id, post_id) makes a duplicate bookmark
--   impossible at the database level, not just in application code.
-- - `on delete cascade` on both foreign keys means deleting a post or an account
--   cleans up its bookmarks automatically, with no orphan rows.

-- ---------------------------------------------------------------------------
-- 1. Table
-- ---------------------------------------------------------------------------
create table if not exists public.bookmarks (
  user_id    uuid not null references auth.users (id) on delete cascade,
  post_id    uuid not null references public.posts (id) on delete cascade,
  created_at timestamptz not null default now(),

  primary key (user_id, post_id)
);

-- Listing one user's bookmarks newest-first is the main read pattern.
create index if not exists bookmarks_user_created_idx
  on public.bookmarks (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- 2. Row Level Security
-- ---------------------------------------------------------------------------
alter table public.bookmarks enable row level security;

-- A user may only read their own bookmarks. Nobody can read another person's
-- saved list, which is private by nature.
drop policy if exists "bookmarks are readable by owner" on public.bookmarks;
create policy "bookmarks are readable by owner"
  on public.bookmarks for select
  to authenticated
  using (user_id = auth.uid());

-- A user may only insert a bookmark for themselves. The check clause also
-- prevents bookmarking on behalf of someone else.
drop policy if exists "bookmarks are insertable by owner" on public.bookmarks;
create policy "bookmarks are insertable by owner"
  on public.bookmarks for insert
  to authenticated
  with check (user_id = auth.uid());

-- A user may only remove their own bookmark.
drop policy if exists "bookmarks are deletable by owner" on public.bookmarks;
create policy "bookmarks are deletable by owner"
  on public.bookmarks for delete
  to authenticated
  using (user_id = auth.uid());

-- No update policy: a bookmark is either present or absent, so updates make no
-- sense. Without an update policy, updates are denied by default.

-- ---------------------------------------------------------------------------
-- 3. Verify
-- ---------------------------------------------------------------------------
-- Should return the table with RLS enabled and three policies.
select tablename, policyname, cmd
from pg_policies
where schemaname = 'public' and tablename = 'bookmarks'
order by cmd;
