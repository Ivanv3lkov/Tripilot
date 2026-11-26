-- Attractions: places the user visited (or wants to visit) during a trip,
-- each with an optional photo. Photos reuse the "trip-photos" bucket.
-- Source of truth: docs/data-model.md

create table public.attractions (
  id          uuid primary key default gen_random_uuid(),
  trip_id     uuid not null references public.trips (id) on delete cascade,
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null check (char_length(trim(name)) between 2 and 100),
  description text check (description is null or char_length(description) <= 1000),
  image_url   text check (image_url is null or (image_url ~ '^https://' and char_length(image_url) <= 2048)),
  image_path  text check (image_path is null or split_part(image_path, '/', 1) = user_id::text),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint attractions_image_path_has_url check (image_path is null or image_url is not null)
);

create index attractions_trip_created_idx on public.attractions (trip_id, created_at);

create trigger attractions_set_updated_at
  before update on public.attractions
  for each row execute function public.set_updated_at();

alter table public.attractions enable row level security;

create policy "attractions: owner can read"
  on public.attractions for select to authenticated
  using ((select auth.uid()) = user_id);

-- The attraction must belong to one of the user's own trips.
create policy "attractions: owner can insert"
  on public.attractions for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.trips t
      where t.id = trip_id and t.user_id = (select auth.uid())
    )
  );

create policy "attractions: owner can update"
  on public.attractions for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "attractions: owner can delete"
  on public.attractions for delete to authenticated
  using ((select auth.uid()) = user_id);

-- An attraction cannot be moved to another trip or user.
revoke update on public.attractions from authenticated;
grant  update (name, description, image_url, image_path) on public.attractions to authenticated;
