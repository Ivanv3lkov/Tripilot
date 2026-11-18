# Architecture and Technology Decisions

## 1. Overview

Tripilot is an AI-powered **travel companion and travel journal**. There are no itineraries or day-by-day planning. The app is for **signed-in users only**. Logged-out users see only Login and Register.

```text
React Native (Expo, JavaScript)          — signed-in users
   │  axios REST (apikey: publishable key, Authorization: Bearer <user JWT>)
   ├──► Supabase Auth          (email + password, persistent session)
   ├──► Supabase PostgreSQL    (read catalogue; CRUD own trips/photos; RLS)
   └──► Supabase Storage       (private bucket "trip-photos", signed URLs)

Admin (terminal, x-admin-token)           — adds destinations
   └──► Supabase Edge Function "generate-destination"
            ├──► OpenAI API      (description + 5 attractions, structured JSON)
            ├──► Unsplash API    (photos, hotlinked; credit link in source_url)
            └──► PostgreSQL      (service role: insert destination + attractions)
```

## 2. Decided

### Mobile
- React Native with Expo (SDK from `package.json`).
- JavaScript only (`.js` / `.jsx`). No TypeScript.
- React Navigation (no Expo Router): Root Stack → Bottom Tabs (Explore, My Trips, Profile) → Stacks.
- Functional components and React Hooks.
- Expo ImagePicker for the camera and gallery (trip photos). This is the native feature.

### Authentication, database, and storage: Supabase
- **No Supabase SDK.** The app talks to the Supabase REST APIs directly with **axios** (see §3).
- Email + password authentication through the Auth REST API (`/auth/v1`). The session (access token, refresh token, expiry, user) is persisted encrypted with **`expo-secure-store`** (iOS Keychain / Android Keystore) and restored on app start. It is stored as three small entries (access token, refresh token, and expiry + minimal user), because some iOS versions reject SecureStore values above ~2 KB. AsyncStorage must not be used for tokens.
- There is no `profiles` table. Basic account info (email, display name in `user_metadata`) comes from Supabase Auth.
- Database schema, RLS, and Storage rules: [data-model.md](./data-model.md). Migration: `supabase/migrations/`.
- Config: `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.local` (template: `.env.example`).
- Only the **publishable** key is allowed in the app. It is safe only because RLS is enabled on every table. Never put the secret or service-role key in the app or in Git.
- Why Supabase: one service covers auth, a hosted Postgres database with an auto-generated REST API, file storage, and serverless functions.
- Why axios instead of the SDK: one explicit, reusable HTTP layer (base URLs, headers, token refresh, error handling) that is easy to read and explain, and no SDK-specific APIs.

### Destination catalogue: admin only, AI + Unsplash
- **Only the admin adds destinations.** App users can only browse and search the existing catalogue. There is no AI call from the app.
- The admin calls the Edge Function `generate-destination` (`supabase/functions/generate-destination/index.js`, written in JavaScript, Deno runtime) from a terminal.
- The function is protected by an `x-admin-token` header that must match the `ADMIN_TOKEN` secret. `verify_jwt = false` is set in `supabase/config.toml`, because the caller is the admin, not an app user.
- OpenAI generates the text. Unsplash provides the images. The result is stored once in `destinations` and `attractions` and is never regenerated.
- The function uses plain `fetch` against PostgREST (no SDK). It authenticates with the project secret key from `SUPABASE_SECRET_KEYS` (sent only on the `apikey` header), falling back to the legacy `SUPABASE_SERVICE_ROLE_KEY`.
- Secrets (`supabase secrets set`): `ADMIN_TOKEN`, `OPENAI_API_KEY`, `OPENAI_MODEL`, `UNSPLASH_ACCESS_KEY`. `SUPABASE_URL` and `SUPABASE_SECRET_KEYS` are provided automatically to Edge Functions. None of these are ever in the app or in Git.
- Why admin-only: full control over catalogue quality, no AI cost or abuse from users, and simpler app code. The trade-off is that users cannot request a destination that is not in the catalogue.
- Why Unsplash: high-quality travel photos with a simple search API. Unsplash requires hotlinking (`urls.regular`) and triggering `download_location`, and both are done. Credit is shown as a link to the Unsplash photo page (`source_url`). The photographer's name is intentionally not stored (decision), which is only partial compliance with the Unsplash attribution guideline.
- Unsplash demo apps are limited to 50 requests/hour. One destination uses 6–12 searches.

## 3. HTTP layer (axios) and services

Screens never make HTTP calls. They use services in `src/services/`, and services use the shared axios instances:

| Module | Responsibility |
|---|---|
| `apiClient.js` | Creates the axios instances once with `create()`: `authApi` (`/auth/v1`), `restApi` (`/rest/v1`), `storageApi` (`/storage/v1`). Sets the base URL, timeout, and `apikey` header. Exports `refreshSession`. |
| `sessionStore.js` | In-memory session + encrypted persistence with `expo-secure-store` + change listeners (used by `AuthContext`). If secure storage fails, the session works in memory until the app closes. |
| `apiError.js` | `ApiError` and `toApiError`, which turn Auth, PostgREST, Storage, timeout, and network errors into one shape: `{ message, status, code, isNetworkError }`. |
| `authService` | Register, login, logout, restore session (exists). |
| `destinationService` | List and search destinations, get one destination with its attractions. Read-only. |
| `tripService` | List, get, create, update, and delete the user's trips. Delete also removes the trip's Storage files. |
| `photoService` | Pick or capture, upload to Storage, insert metadata, list with signed URLs, edit caption, delete. |

How the shared instances work:
- **Base URL and key once.** `create({ baseURL, timeout, headers: { apikey } })`. Services call relative paths, for example `restApi.get("/trips", { params: { select: "*,destination:destinations(*)", order: "created_at.desc" } })`.
- **Auth header.** A request interceptor on `restApi` and `storageApi` adds `Authorization: Bearer <access token>` when a user is signed in. The publishable key is never sent as a Bearer token.
- **Token refresh.** The token is refreshed before a request when it expires within 60 seconds. A `401` (or `jwt expired`) triggers one refresh and one retry. Parallel requests share a single refresh call, because Supabase refresh tokens are single-use.
- **Logout on invalid session.** If the refresh token is rejected (4xx), the session is cleared and `AuthContext` returns the user to Login. Network errors keep the session, so the user stays signed in while offline.
- **Errors.** Every instance rejects with `ApiError`, so screens show `error.message` and can check `error.isNetworkError` for retry UI.
- **Logout** clears the local session immediately and revokes the token on the server best-effort (`POST /auth/v1/logout?scope=local`).
- PostgREST writes use `Prefer: return=representation` when the created/updated row is needed.

## 4. Edge Function contract

`POST /functions/v1/generate-destination`. Admin only.

Headers: `Content-Type: application/json`, `x-admin-token: <ADMIN_TOKEN>`.

Request (`city` is optional; without it, the destination is the whole country):

```json
{ "country": "Italy", "city": "Rome" }
```

Responses:
- `201 { "created": true, "destination": { ...with 5 attractions } }`
- `200 { "created": false, "destination": { ... } }`: the destination already existed. No AI call is made.
- `400` invalid input, `401` wrong token, `405` not POST, `422` fake place or invalid AI output or no photo found, `500` configuration or database error, `502` OpenAI/Unsplash unavailable.

Errors return `{ "error": "safe message" }`. No keys, tokens, or stack traces are logged or returned.

## 5. Decisions not finalized
- OpenAI model name (set through the `OPENAI_MODEL` secret; no default in code).

Document the selected option here once decided, including why.

## 6. Security and reliability
- RLS is enabled on every table. Users see and modify only their own trips and photos. The catalogue is read-only to the app.
- The `trip-photos` bucket is private. Photos are displayed through signed URLs.
- The OpenAI key, Unsplash key, admin token, and service-role key exist only as Supabase Edge Function secrets.
- Validate input on the client (UX) and in the database or Edge Function (security).
- Handle timeouts and network errors with visible loading, error, and retry states.
- Never commit `.env.local`, keys, signing credentials, or personal data.
