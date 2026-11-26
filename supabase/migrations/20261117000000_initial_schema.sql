-- Tripilot initial schema: the trips and profiles tables, their RLS policies,
-- and the public "trip-photos" and "avatars" Storage buckets.
-- Source of truth: docs/data-model.md

-- =====================================================================
-- TRIPS — personal travel journal entries, one row per trip
-- =====================================================================
create table public.trips (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title       text not null check (char_length(trim(title)) between 2 and 100),
  location    text not null check (char_length(trim(location)) between 3 and 120),
  visit_date  date not null,
  description text check (description is null or char_length(description) <= 1000),
  category    text not null check (category in ('City', 'Nature', 'Beach', 'History', 'Food')),
  rating      smallint check (rating is null or rating between 1 and 5),
  is_favorite boolean not null default false,
  image_url   text check (image_url is null or (image_url ~ '^https://' and char_length(image_url) <= 2048)),
  -- Set only for photos uploaded to Storage; the first folder must be the owner's id.
  image_path  text check (image_path is null or split_part(image_path, '/', 1) = user_id::text),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint trips_image_path_has_url check (image_path is null or image_url is not null)
);

create index trips_user_visit_date_idx on public.trips (user_id, visit_date desc);

-- =====================================================================
-- updated_at trigger
-- =====================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger trips_set_updated_at
  before update on public.trips
  for each row execute function public.set_updated_at();

-- =====================================================================
-- PROFILES — one row per user, created automatically on sign-up.
-- Name and email stay in Supabase Auth; this table holds the optional avatar.
-- =====================================================================
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  avatar_url  text check (avatar_url is null or (avatar_url ~ '^https://' and char_length(avatar_url) <= 2048)),
  avatar_path text check (avatar_path is null or split_part(avatar_path, '/', 1) = id::text),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint profiles_avatar_path_has_url check (avatar_path is null or avatar_url is not null)
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Runs as the table owner so it can insert while the new user has no session yet.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, created_at)
  values (new.id, new.created_at)
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Users who registered before this migration also get a profile.
insert into public.profiles (id, created_at)
select id, created_at from auth.users
on conflict (id) do nothing;

alter table public.profiles enable row level security;

create policy "profiles: owner can read"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

create policy "profiles: owner can insert"
  on public.profiles for insert to authenticated
  with check ((select auth.uid()) = id);

create policy "profiles: owner can update"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

revoke update on public.profiles from authenticated;
grant  update (avatar_url, avatar_path) on public.profiles to authenticated;

-- =====================================================================
-- RLS — every user sees and changes only their own trips
-- =====================================================================
alter table public.trips enable row level security;

create policy "trips: owner can read"
  on public.trips for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "trips: owner can insert"
  on public.trips for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "trips: owner can update"
  on public.trips for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "trips: owner can delete"
  on public.trips for delete to authenticated
  using ((select auth.uid()) = user_id);

-- The owner of a trip cannot be reassigned.
revoke update on public.trips from authenticated;
grant  update (title, location, visit_date, description, category, rating, is_favorite, image_url, image_path)
  on public.trips to authenticated;

-- =====================================================================
-- STORAGE — public buckets "trip-photos" and "avatars", files under "<user_id>/<file>"
-- =====================================================================
-- Public read keeps the app simple: the stored public URL works in <Image>.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('trip-photos', 'trip-photos', true, 10485760,
        array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);

create policy "trip-photos: owner can read own files"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'trip-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "trip-photos: owner can upload to own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'trip-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "trip-photos: owner can delete own files"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'trip-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5242880,
        array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);

create policy "avatars: owner can read own files"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "avatars: owner can upload to own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "avatars: owner can delete own files"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
