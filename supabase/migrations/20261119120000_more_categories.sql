-- Two more trip categories: Family and Festival (12 in total).
-- Keep in sync with CATEGORIES in src/constants/trips.js.
alter table public.trips drop constraint trips_category_check;
alter table public.trips add constraint trips_category_check check (
  category in (
    'City', 'Nature', 'Beach', 'History', 'Food',
    'Mountains', 'Culture', 'Adventure', 'Relax', 'Ski',
    'Family', 'Festival'
  )
);
