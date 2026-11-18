-- Tripilot initial schema: destinations, attractions, trips, trip_photos,
-- RLS policies, and the private "trip-photos" Storage bucket.
-- Source of truth: docs/data-model.md

-- =====================================================================
-- DESTINATIONS — shared catalogue (country or city)
-- =====================================================================
create table public.destinations (
  id             uuid primary key default gen_random_uuid(),
  country        text not null check (char_length(trim(country)) between 1 and 80),
  city           text          check (city is null or char_length(trim(city)) between 1 and 80),
  description    text not null check (char_length(trim(description)) between 1 and 2000),
  image_url      text not null check (image_url ~ '^https://'),
  source_url     text          check (source_url is null or source_url ~ '^https://'),
  content_source text not null default 'ai' check (content_source in ('ai', 'manual')),
  created_at     timestamptz not null default now()
);

-- One row per country (city IS NULL) or per country + city, case-insensitive.
create unique index destinations_country_city_key
  on public.destinations (lower(country), coalesce(lower(city), ''));

-- =====================================================================
-- ATTRACTIONS — five per destination, shared
-- =====================================================================
create table public.attractions (
  id             uuid primary key default gen_random_uuid(),
  destination_id uuid not null references public.destinations (id) on delete cascade,
  name           text not null check (char_length(trim(name)) between 1 and 120),
  description    text not null check (char_length(trim(description)) between 1 and 1000),
  image_url      text not null check (image_url ~ '^https://'),
  source_url     text          check (source_url is null or source_url ~ '^https://'),
  content_source text not null default 'ai' check (content_source in ('ai', 'manual')),
  created_at     timestamptz not null default now()
);

create unique index attractions_destination_name_key
  on public.attractions (destination_id, lower(name));

-- =====================================================================
-- TRIPS — personal, one user + one destination
-- =====================================================================
create table public.trips (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null default auth.uid() references auth.users (id) on delete cascade,
  destination_id uuid not null references public.destinations (id) on delete restrict,
  title          text not null check (char_length(trim(title)) between 1 and 100),
  start_date     date,
  end_date       date,
  notes          text check (notes is null or char_length(notes) <= 2000),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint trips_dates_valid
    check (end_date is null or (start_date is not null and end_date >= start_date))
);

create index trips_user_created_idx on public.trips (user_id, created_at desc);
create index trips_destination_idx  on public.trips (destination_id);

-- =====================================================================
-- TRIP_PHOTOS — metadata only; files live in Storage bucket "trip-photos"
-- =====================================================================
create table public.trip_photos (
  id            uuid primary key default gen_random_uuid(),
  trip_id       uuid not null references public.trips (id) on delete cascade,
  attraction_id uuid references public.attractions (id) on delete set null,
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  storage_path  text not null unique,
  caption       text check (caption is null or char_length(caption) <= 300),
  created_at    timestamptz not null default now(),
  constraint trip_photos_path_format
    check (storage_path = user_id::text || '/' || trip_id::text || '/' || split_part(storage_path, '/', 3)
           and split_part(storage_path, '/', 3) <> '')
);

create index trip_photos_trip_created_idx on public.trip_photos (trip_id, created_at desc);
create index trip_photos_attraction_idx   on public.trip_photos (attraction_id);

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

alter table public.destinations enable row level security;
alter table public.attractions  enable row level security;
alter table public.trips        enable row level security;
alter table public.trip_photos  enable row level security;

-- ---------- Catalogue: read-only for signed-in users ----------
create policy "destinations: authenticated can read"
  on public.destinations for select to authenticated using (true);

create policy "attractions: authenticated can read"
  on public.attractions for select to authenticated using (true);

-- ---------- Trips: owner only ----------
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

-- The destination of an existing trip cannot be changed; user_id cannot be reassigned.
revoke update on public.trips from authenticated;
grant  update (title, start_date, end_date, notes) on public.trips to authenticated;

-- ---------- Trip photos: owner only, consistent with trip and attraction ----------
create policy "trip_photos: owner can read"
  on public.trip_photos for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "trip_photos: owner can insert"
  on public.trip_photos for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.trips t
      where t.id = trip_id
        and t.user_id = (select auth.uid())
        and (
          attraction_id is null
          or exists (
            select 1 from public.attractions a
            where a.id = attraction_id and a.destination_id = t.destination_id
          )
        )
    )
  );

create policy "trip_photos: owner can update"
  on public.trip_photos for update to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.trips t
      where t.id = trip_id
        and t.user_id = (select auth.uid())
        and (
          attraction_id is null
          or exists (
            select 1 from public.attractions a
            where a.id = attraction_id and a.destination_id = t.destination_id
          )
        )
    )
  );

create policy "trip_photos: owner can delete"
  on public.trip_photos for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Only caption and attraction link are editable; the file path and trip are fixed.
revoke update on public.trip_photos from authenticated;
grant  update (caption, attraction_id) on public.trip_photos to authenticated;

-- Bucket (can also be created in the dashboard)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('trip-photos', 'trip-photos', false, 10485760,
        array['image/jpeg', 'image/png', 'image/webp', 'image/heic']);

-- Read own files
create policy "trip-photos: owner can read"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'trip-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Upload only into own folder AND into a trip the user owns
create policy "trip-photos: owner can upload to own trip"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'trip-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (
      select 1 from public.trips t
      where t.id::text = (storage.foldername(name))[2]
        and t.user_id = (select auth.uid())
    )
  );

-- Delete own files
create policy "trip-photos: owner can delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'trip-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
