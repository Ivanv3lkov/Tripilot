Tripilot - GitHub Copilot Instructions

This repository contains Tripilot, an AI-powered travel companion and travel journal built with React Native + Expo for an exam project. It is not an itinerary planner.

Before making changes:

- Read the root AGENTS.md and the relevant documents in docs/.
- Use JavaScript only. Do not create TypeScript .ts or .tsx files in the mobile app.
- Preserve the three-tab structure: Explore, My Trips, Profile (see docs/screens-and-navigation.md).
- Keep all screen files directly in `src/screens/`; do not create nested folders under `src/screens/`.
- Backend is Supabase: Auth, PostgreSQL, Storage (private `trip-photos` bucket), and Edge Functions. Do not use the Supabase SDK. Use the shared axios instances in `src/services/apiClient.js` (`authApi`, `restApi`, `storageApi`); never hardcode base URLs or create new axios instances. Screens use service modules only; services throw `ApiError`.
- The database has exactly four tables: destinations, attractions, trips, and trip_photos (docs/data-model.md). Do not add profiles, trip_attractions, itinerary, rating, visited, budget, or booking tables or columns.
- RLS must be enabled on every table. Users access only their own trips and photos; destinations and attractions are read-only shared catalogue data.
- Only the admin adds destinations, through the admin-only Edge Function `generate-destination` (OpenAI text + Unsplash images, JavaScript, in `supabase/functions/`). The mobile app never calls OpenAI or Unsplash. All keys and the admin token stay in Supabase secrets.
- Keep `supabase/migrations/` in sync with docs/data-model.md.
- Never invent image URLs or facts, and do not present attractions as a popularity ranking.
- Do not hardcode a local JSON dataset as the data source.
- Keep implementation small and aligned with the exam requirements in docs/exam-requirements.md.
- Do not add unrelated features or major dependencies without asking.
- Inspect existing code before editing; preserve established project conventions.
- Report which checks you actually ran. Never claim tests/builds passed if they were not run.
- When a product or architecture decision changes, update the corresponding document in docs/.
