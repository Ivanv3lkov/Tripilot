-- More trip categories, and up to three photos per attraction.
-- Source of truth: docs/data-model.md

-- =====================================================================
-- TRIPS — five more categories
-- =====================================================================
alter table public.trips drop constraint trips_category_check;
alter table public.trips add constraint trips_category_check check (
  category in (
    'City', 'Nature', 'Beach', 'History', 'Food',
    'Mountains', 'Culture', 'Adventure', 'Relax', 'Ski'
  )
);

-- =====================================================================
-- ATTRACTION_PHOTOS — up to 3 photos per attraction
-- =====================================================================
create table public.attraction_photos (
  id            uuid primary key default gen_random_uuid(),
  attraction_id uuid not null references public.attractions (id) on delete cascade,
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  image_url     text not null check (image_url ~ '^https://' and char_length(image_url) <= 2048),
  -- Set for files in the "trip-photos" bucket; null for photos that are links.
  image_path    text check (image_path is null or split_part(image_path, '/', 1) = user_id::text),
  created_at    timestamptz not null default now()
);

create index attraction_photos_attraction_created_idx
  on public.attraction_photos (attraction_id, created_at);

-- Keep in sync with MAX_ATTRACTION_PHOTOS in src/constants/trips.js.
create or replace function public.enforce_attraction_photo_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select count(*) from public.attraction_photos where attraction_id = new.attraction_id) >= 3 then
    raise exception 'An attraction can have at most 3 photos.'
      using errcode = 'check_violation', hint = 'photo_limit';
  end if;
  return new;
end;
$$;

create trigger attraction_photos_limit
  before insert on public.attraction_photos
  for each row execute function public.enforce_attraction_photo_limit();

alter table public.attraction_photos enable row level security;

create policy "attraction_photos: owner can read"
  on public.attraction_photos for select to authenticated
  using ((select auth.uid()) = user_id);

-- The photo must belong to one of the user's own attractions.
create policy "attraction_photos: owner can insert"
  on public.attraction_photos for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.attractions a
      where a.id = attraction_id and a.user_id = (select auth.uid())
    )
  );

create policy "attraction_photos: owner can delete"
  on public.attraction_photos for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Photos are added or deleted, never edited.
revoke update on public.attraction_photos from authenticated;

-- Move the existing single photo of each attraction into the new table.
insert into public.attraction_photos (attraction_id, user_id, image_url, image_path, created_at)
select id, user_id, image_url, image_path, created_at
from public.attractions
where image_url is not null;

alter table public.attractions drop constraint attractions_image_path_has_url;
alter table public.attractions drop column image_url;
alter table public.attractions drop column image_path;
