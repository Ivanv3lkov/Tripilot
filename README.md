# Tripilot

> **APK download:** _link will be added here before submission._

Tripilot is a **travel journal** built with Expo and React Native. Save the trips you took or plan to take, add the attractions you saw on each trip with up to three photos each, mark favorites, and see your travel stats, all in a calm olive-green design.

## Tech stack
- React Native + Expo (JavaScript)
- React Navigation (Root Stack → Auth Stack / App Stack → Bottom Tabs)
- gluestack-ui + NativeWind for the UI, Ionicons, expo-linear-gradient
- Supabase: Auth, PostgreSQL (with Row Level Security), and Storage, accessed over REST with **axios** (no Supabase SDK)
- expo-camera (in-app camera), Expo ImagePicker (gallery), expo-location (current location), and the native date picker
- Photon (OpenStreetMap) for place-name suggestions
- English and Bulgarian interface (own small i18n layer, choice saved with AsyncStorage)

## Project documentation
- [Product specification](docs/product-spec.md)
- [Screens and navigation](docs/screens-and-navigation.md)
- [Architecture](docs/architecture.md)
- [Database schema, RLS, and Storage](docs/data-model.md)
- [Exam checklist](docs/exam-requirements.md)
- [Development workflow](docs/development-workflow.md)

## Setup

### Prerequisites
- Node.js from `.nvmrc` (for example `nvm use`) and npm
- Expo Go or an Android emulator/device
- A Supabase project

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
Copy `.env.example` to `.env.local` and fill in your Supabase project values:

```bash
cp .env.example .env.local
```

```text
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Use only the **publishable** key in the app. Never commit `.env.local` or the secret/service-role key.

### 3. Set up Supabase
The database is created by four SQL files in `supabase/migrations/`. Run them **in this order** (skip the ones you already ran):

1. `20261117000000_initial_schema.sql`: tables `trips` and `profiles`, RLS policies, the sign-up trigger, and the public Storage buckets `trip-photos` and `avatars`.
2. `20261118000000_attractions.sql`: table `attractions` and its RLS policies.
3. `20261118120000_categories_and_attraction_photos.sql`: five more trip categories and the table `attraction_photos` (up to 3 photos per attraction). Existing attraction photos are moved into it.
4. `20261119120000_more_categories.sql`: two more trip categories (Family, Festival).

**Option A: Supabase Dashboard (no CLI)**
1. Open [supabase.com/dashboard](https://supabase.com/dashboard) and create a project (or open your existing one).
2. If the project has tables from an older version of Tripilot (`destinations`, `trip_photos`, or an old `attractions` table without `trip_id`), delete them in **Table Editor**, and delete old buckets in **Storage**. Skip this on a new project.
3. Open **SQL Editor** → **New query**, paste the whole content of the first file, and click **Run**. Skip this file if you already ran it.
4. Open a new query for each next file (second, then third), paste it, and click **Run**. Each run should end with "Success. No rows returned".
5. Check the result:
   - **Table Editor**: `trips`, `attractions`, `attraction_photos`, and `profiles` exist, all with RLS enabled.
   - **Authentication** → **Policies**: four policies on `trips`, four on `attractions`, three on `attraction_photos`, three on `profiles`.
   - **Storage**: public buckets `trip-photos` and `avatars`.
   - **Database** → **Triggers**: `on_auth_user_created` on `auth.users` and `attraction_photos_limit` on `attraction_photos`.
6. Open **Authentication** → **Sign In / Providers** and make sure **Email** is enabled. Turn **Confirm email** off for easier testing, or leave it on (the app then asks the user to confirm before logging in).
7. Open **Project Settings** → **API Keys** (and **Data API** for the URL) and copy the project URL and the **publishable** key into `.env.local` (step 2).

**Option B: Supabase CLI**
```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push
```
`db push` applies only the migrations that the project does not have yet.

### 4. Run
```bash
npm start          # Expo dev server
npm run android    # open on Android
npm run ios        # open on iOS
npm run lint       # lint
```

---

# Functional Guide

## 1. Project Overview

**Application Name:** Tripilot

**Application Category / Topic:** Travel

**Main Purpose:** Tripilot is a personal travel journal. Users save trips they took or plan to take (title, location, date, story, category, rating, favorite, and a cover photo), add the attractions they saw on each trip with up to three photos each, browse them by country, and see their travel statistics. Each user has a profile with an optional photo.

**Languages:** the whole interface is available in English and Bulgarian. The first language follows the phone language; the **EN | BG** switch on the Login/Register screens and in Profile changes it immediately, and the choice is saved on the device.

## 2. User Access & Permissions

### Guest (Not Authenticated)

- Available screens or actions: Login and Register only.

### Authenticated User

- Main sections (tabs): Home, Trips, Stats, Profile, and a "New trip" button in the tab bar.
- Details screens: Trip Details, Attraction Details, Countries.
- Create / Edit / Delete actions: trips and attractions (create, edit, delete with confirmation), favorite toggle, add/change/remove profile photo. Users see and change only their own data.

## 3. Authentication & Session Handling

### Authentication Flow

1. When the app starts, a loading screen is shown while the saved session is read from secure storage.
2. If a session exists and the access token is still valid, the user goes straight to Home. If the token has expired, it is refreshed first. If the refresh token is rejected, the user sees Login. When offline, the user stays signed in.
3. On successful login or registration, Supabase Auth returns a session. It is saved and the app switches to the tabs automatically. A database trigger creates the user's profile row on sign-up. If email confirmation is required, Register shows a message instead.
4. On logout (Profile tab), the local session is cleared immediately, the app returns to Login, and the token is revoked on the server best-effort.

### Session Persistence

- The session (access token, refresh token, expiry, and basic user info) is stored encrypted with `expo-secure-store`.
- After an app restart the session is restored automatically. The access token is refreshed before requests when it is about to expire, and once more after a `401` response.

## 4. Navigation Structure

### Root Navigation Logic

- A Root Stack shows either the Auth Stack (no session) or the App Stack (valid session), based on `AuthContext`.

### Main Navigation

- Bottom tabs with icons and labels: Home, Trips, Stats, Profile, plus a raised "New trip" button in the middle.

### Nested Navigation

- Yes. The Bottom Tabs are nested in the App Stack, which also holds Trip Details, New/Edit Trip, Countries, Attraction Details, and New/Edit Attraction (opened on top of the tabs). The App Stack and the Auth Stack are nested in the Root Stack.

## 5. List → Details Flow

### List / Overview Screen

- The Trips tab shows the user's trips as photo cards. The user can search, filter (All, Favorites, categories, country), sort, pull to refresh, toggle favorites, and tap a trip.
- Trip Details lists the trip's attractions; Countries lists the countries of the user's trips.

### Details Screen

- Tapping a trip calls `navigation.navigate("TripDetails", { tripId })`; tapping an attraction calls `navigation.navigate("AttractionDetails", { attractionId })`.
- The details screens receive the ID through route params and load the record from Supabase.

## 6. Data Source & Backend

### Backend Type

- Real backend ✅ **Supabase** (Auth, PostgreSQL with Row Level Security, Storage). Place suggestions come from Photon (OpenStreetMap).

## 7. Data Operations (CRUD)

### Read (GET)

- Home, Trips, Stats, Countries, and Profile load the user's trips; Trip Details loads one trip and its attractions; Attraction Details loads one attraction; Home and Profile load the profile.

### Create (POST)

- New Trip creates a trip and New Attraction creates an attraction. Camera/gallery photos are uploaded to Supabase Storage first. The profile photo is uploaded the same way.

### Update / Delete (Mutation)

- Update: Edit Trip, Edit Attraction, the favorite heart, and the profile photo (PATCH).
- Delete: trips (with their attractions and photos), attractions, and the profile photo.
- Lists reload when their screen gains focus, and the favorite heart updates immediately (reverted if the request fails).

## 8. Forms & Validation

### Forms Used

- Login, Register, New/Edit Trip (shared trip form), New/Edit Attraction (shared attraction form).

### Validation Rules

- Email: required, valid email format.
- Password (Register): required, at least 8 characters, at least one letter and one number. Repeat password must match.
- Title (trip): required, 2–100 characters.
- Location (trip): required, 2–120 characters (filled from suggestions or GPS).
- Attraction name: required, 2–100 characters.
- Attraction photos: at most 3 (also enforced by the database).
- Image link (trip cover): optional, must start with `https://`.

Non-text inputs: native date picker, category chips, rating stars, favorite switch, camera/gallery photo picker, place suggestions, and the "Use my current location" button.

## 9. Native Device Features

### Used Native Feature(s)

- Camera (expo-camera) and Image Picker (Expo ImagePicker, gallery)
- Location (expo-location)
- Native date picker (`@react-native-community/datetimepicker`)

### Usage Description

- **Camera**: in New/Edit Trip, New/Edit Attraction, and Profile the user takes a photo with the in-app camera (switch front/back, retake, use photo) or chooses one from the gallery. Photos are uploaded to Supabase Storage. Permission denial shows an explanation and an "Open settings" button.
- **Location**: "Use my current location" reads the device position and turns it into "City, Country".
- **Date picker**: the visit date.

## 10. Typical User Flow

1. The user registers or logs in and lands on Home ("Hi, <name>").
2. The user taps "New trip", takes a photo, types "Rom" and picks "Rome, Italy", fills in the form, and saves. Trip Details opens.
3. In Trip Details the user adds attractions with photos, edits the trip with the "Edit trip" button, or deletes it.
4. On Home the user taps the Countries tile, picks a country, and sees its trips; then checks Stats and logs out from Profile.

## 11. Error & Edge Case Handling

- Authentication errors: clear messages for wrong credentials, existing email, weak password, unconfirmed email, and rate limits.
- Network or data errors: loading indicators, error messages with a "Try again" button, "not found" states for deleted trips and attractions, and alerts when a favorite or photo change fails. If place suggestions fail, the user can still type the location or use GPS.
- Permissions: camera, gallery, and location denials show a message; the camera offers "Open settings".
- Empty or missing data states: empty home, "No trips yet", "No favorites yet", "Nothing found", "No attractions yet", "No countries yet"; trips without an image show the category icon; users without a profile photo show their initials.
