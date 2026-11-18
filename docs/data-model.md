# Data Model (Supabase / PostgreSQL)

Tripilot uses **Supabase** for the PostgreSQL database, authentication, and Storage. This document is the source of truth for the database schema, Row Level Security (RLS), and Storage rules.

> Migration: [`supabase/migrations/20261117000000_initial_schema.sql`](../supabase/migrations/20261117000000_initial_schema.sql) contains exactly the SQL below. When the schema changes, update both files together.

## 1. Scope

The database supports exactly three things:

1. **Explore**: a shared catalogue of destinations (a country, or a city in a country), each with five interesting attractions. **Only the admin adds destinations.** The content is AI-generated once (OpenAI + Unsplash photos) and then read by all users.
2. **My Trips**: personal trips. Each trip belongs to one user and one destination.
3. **Travel photos**: personal photos for a trip, optionally linked to an attraction. The image files are kept in Supabase Storage.

Do **not** add:
- A `profiles` table. Account data comes from Supabase Auth (`auth.users`, `user_metadata`).
- A `trip_attractions` table. Visited tracking, ratings, and per-attraction notes are out of scope.
- Day-by-day itineraries, schedules, budgets, bookings, or interests/tags.

## 2. Entity relationships

```text
auth.users ──1:N── trips ──N:1── destinations ──1:N── attractions
                     │                                     │
                     └──1:N── trip_photos ──N:0..1─────────┘
auth.users ──1:N── trip_photos
```

| Relationship | Cardinality | On delete |
|---|---|---|
| destination → attractions | 1 : N (exactly 5 by convention) | `cascade` |
| destination → trips | 1 : N | `restrict` (a destination used by a trip cannot be deleted) |
| user → trips | 1 : N | `cascade` (deleting the account removes the user's trips) |
| trip → trip_photos | 1 : N | `cascade` |
| attraction → trip_photos | 1 : N (optional on photo) | `set null` (the photo stays, the link is removed) |
| user → trip_photos | 1 : N | `cascade` |

## 3. Review of the proposed tables

The four proposed tables are correct for the MVP. Changes and additions:

| # | Issue | Resolution |
|---|---|---|
| 1 | `unique (country, city)` does not prevent duplicates when `city` is `NULL`, and it is case-sensitive ("Italy" vs "italy"). | A unique **expression index** on `lower(country), coalesce(lower(city), '')`. The Edge Function also normalizes input before lookup and insert. |
| 2 | Two generation requests for the same destination could run at the same time. | The unique index rejects the second insert. The Edge Function treats the unique violation (`23505`) as "already exists" and returns the stored row. It also checks for an existing row first, so it never calls OpenAI twice for the same destination. |
| 3 | Duplicate attractions in one destination. | `unique (destination_id, lower(name))`. |
| 4 | "Five attractions" is not enforced by a column. | It is enforced by the Edge Function (the only writer). The catalogue is read-only to app users, so they cannot add more. |
| 5 | AI-generated text is not marked as such. | `content_source` column (`'ai'` or `'manual'`) on `destinations` and `attractions`, so the UI can show an "AI-generated" label. |
| 6 | `image_url` is required, but an LLM cannot reliably produce real image URLs. | Images come from the **Unsplash API**, never from the LLM. `image_url` is the hotlinked Unsplash URL (`urls.regular`), and `source_url` is the Unsplash photo page (with UTM parameters), used as the photo credit link. No extra attribution columns. |
| 7 | A photo could reference an attraction from a different destination than its trip. | The `trip_photos` RLS `with check` verifies that the attraction belongs to the trip's destination. |
| 8 | Changing a trip's destination later would leave its photo–attraction links inconsistent. | `destination_id` cannot be updated by app users (column-level `UPDATE` grant). To change the destination, create a new trip. |
| 9 | `trip_photos.user_id` duplicates the trip owner. | Kept on purpose: it makes RLS and Storage checks simple. RLS guarantees it equals both `auth.uid()` and the trip owner. |
| 10 | `storage_path` could point into another user's folder. | A `check` requires the format `{user_id}/{trip_id}/...`, and RLS ties the first two segments to the row. |
| 11 | `updated_at` is not maintained automatically. | A `set_updated_at` trigger on `trips`. |
| 12 | Foreign keys are not indexed automatically in PostgreSQL. | Indexes on `trips(user_id, created_at)`, `trips(destination_id)`, `attractions(destination_id)`, `trip_photos(trip_id, created_at)`, and `trip_photos(attraction_id)`. |
| 13 | Deleting a trip removes `trip_photos` rows but **not** the files in Storage. | `tripService.deleteTrip` deletes the Storage files first and then the trip row. |

## 4. Final schema (SQL)

```sql
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
```

## 5. Table purposes

| Table | Purpose | Who writes |
|---|---|---|
| `destinations` | Shared catalogue entry for a country or a city: name, description, cover image (Unsplash), and photo credit link. Added by the admin and read by everyone. | Edge Function `generate-destination` (admin only, service role). |
| `attractions` | Five interesting attractions for a destination, each with a description and an image. Shared and reused. | Edge Function only. |
| `trips` | A user's personal trip: destination, title, optional dates and notes. Base of the My Trips list → Trip Details flow. | The owner (create, read, update, delete). |
| `trip_photos` | Metadata of a photo uploaded to Storage: which trip, optional attraction, caption. The file itself is in the `trip-photos` bucket. | The owner (create, read, update caption, delete). |

## 6. Row Level Security

Enable RLS on every table. App users (`authenticated`) never write to the catalogue. The Edge Function writes to it using the service-role key, which bypasses RLS and exists only on the server.

```sql
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
```

Notes:
- `(select auth.uid())` is the Supabase-recommended form. PostgreSQL evaluates it once per query instead of once per row.
- The `anon` role gets no policies, so logged-out users cannot read anything.

## 7. Supabase Storage

| Bucket | Public | Object path | Allowed types | Max size |
|---|---|---|---|---|
| `trip-photos` | **No** (private) | `{user_id}/{trip_id}/{uuid}.jpg` | `image/jpeg`, `image/png`, `image/webp`, `image/heic` | 10 MB (set on the bucket) |

```sql
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
```

- No `update` policy is needed. Photos are replaced by deleting and uploading again.
- The app displays photos through **signed URLs** (`createSignedUrl` / `createSignedUrls`), because the bucket is private.
- Upload order: (1) upload the file to Storage, (2) insert the `trip_photos` row. If step 2 fails, delete the uploaded file.
- Delete order: (1) delete the Storage file(s), (2) delete the `trip_photos` row or the trip.
- Destination and attraction images are hotlinked Unsplash URLs, as Unsplash requires, so no Storage bucket is needed for them.

## 8. Adding destinations (admin only)

App users **cannot** add destinations. They only browse the catalogue. The admin adds a destination by calling the Edge Function [`generate-destination`](../supabase/functions/generate-destination/index.js) from a terminal:

```bash
curl -X POST "https://<project-ref>.supabase.co/functions/v1/generate-destination" \
  -H "Content-Type: application/json" \
  -H "x-admin-token: $TRIPILOT_ADMIN_TOKEN" \
  -d '{ "country": "Italy", "city": "Rome" }'
```

Steps inside the function:
1. Accept only `POST`. Compare `x-admin-token` with the `ADMIN_TOKEN` secret (constant-time).
2. Validate and normalize `country` / optional `city`.
3. If the destination already exists (case-insensitive), return it (`200`, `created: false`). There is no new AI call.
4. Call OpenAI (structured JSON output): `is_real_place`, a description, exactly five attractions, and a photo search query for each.
5. Reject fake places, a wrong count, empty fields, or duplicate names (`422`).
6. Search Unsplash for each photo (`/search/photos`), hotlink `urls.regular`, store the photo page URL + UTM in `source_url`, and trigger the Unsplash `download_location` endpoint, as the API guidelines require.
7. Insert the destination and its 5 attractions with the service role. If the attractions insert fails, delete the destination so the catalogue never has half-saved data. Return `201`, `created: true`.

Unsplash attribution: by decision, only the photo page link (`source_url`) is stored, and the app shows it as "Photo: Unsplash". The Unsplash guidelines also ask for the photographer's name. That would need extra columns and is intentionally not implemented.

## 9. JavaScript shapes returned to the app

```js
// Destination (Explore → Destination Details)
{
  id: "uuid",
  country: "Italy",
  city: "Rome",            // null for a country
  description: "…",
  imageUrl: "https://…",
  sourceUrl: "https://…",  // optional
  contentSource: "ai",
  attractions: [
    { id: "uuid", name: "Colosseum", description: "…", imageUrl: "https://…", sourceUrl: null }
  ]
}

// Trip (My Trips → Trip Details)
{
  id: "uuid",
  title: "Rome with friends",
  destination: { id: "uuid", country: "Italy", city: "Rome", imageUrl: "https://…" },
  startDate: "2026-10-10", // optional
  endDate: "2026-10-15",   // optional
  notes: "",
  photos: [{ id: "uuid", storagePath: "…", signedUrl: "https://…", attractionId: "uuid", caption: "" }],
  createdAt: "ISO-8601",
  updatedAt: "ISO-8601"
}
```

## 10. Validation rules (client and database)
- Explore search: an optional text filter over existing destinations (country or city), trimmed and at most 80 characters.
- Admin generation input (Edge Function): country is required; city is optional. Both are trimmed, whitespace-collapsed, 1–80 characters, letters and `space . ' ’ -` only.
- Trip destination: required. It must be an existing destination and cannot be changed after creation.
- Trip title: required, trimmed, 1–100 characters (multiple rules).
- Trip dates: optional. If `endDate` is set, `startDate` is required and `endDate >= startDate`.
- Trip notes: optional, at most 2000 characters.
- Photo: image MIME type only, at most 10 MB. Caption is optional, at most 300 characters. The attraction is optional and must belong to the trip's destination.

## 11. Service methods (to implement later)
- `destinationService`: `listDestinations({ search })`, `getDestination(id)` (with attractions). Read-only; the app never generates destinations.
- `tripService`: `listTrips()`, `getTripById(id)`, `createTrip({ destinationId, title, startDate, endDate, notes })`, `updateTrip(id, changes)`, `deleteTrip(id)` (removes Storage files first).
- `photoService`: `listTripPhotos(tripId)`, `uploadTripPhoto(tripId, asset, { attractionId, caption })`, `updatePhoto(id, { caption, attractionId })`, `deleteTripPhoto(id)`.
- `authService`: register, login, logout, restore session (already implemented).
- All services use the shared axios instances from `src/services/apiClient.js` (`restApi` for tables, `storageApi` for photos) and throw `ApiError`.

Exam HTTP coverage: GET (destinations, trips, photos), POST (trip, photo), PATCH (trip, photo caption), DELETE (trip, photo).
