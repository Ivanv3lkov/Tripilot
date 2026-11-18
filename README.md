# Tripilot

> **APK download:** _link will be added here before submission._

Tripilot is an AI-powered **Travel Companion and Travel Journal** built with Expo and React Native. You can discover destinations and five interesting attractions for each one, organize personal trips, and keep travel memories with photos.

## Tech stack
- React Native + Expo (JavaScript)
- React Navigation (Root Stack → Bottom Tabs → Stacks)
- Supabase: Auth, PostgreSQL (with Row Level Security), Storage, Edge Functions, accessed over REST with **axios** (no Supabase SDK)
- OpenAI API + Unsplash API, called only from the admin Edge Function `generate-destination`
- Expo ImagePicker (camera and gallery)

## Project documentation
- [Product specification](docs/product-spec.md)
- [Screens and navigation](docs/screens-and-navigation.md)
- [Architecture](docs/architecture.md)
- [Database schema, RLS, and Storage](docs/data-model.md)
- [Exam checklist](docs/exam-requirements.md)
- [Development workflow](docs/development-workflow.md)

## Setup

### Prerequisites
- Node.js (LTS) and npm
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

Use only the **publishable** key in the app. Never commit `.env.local`, the service-role key, or the OpenAI key.

### 3. Set up Supabase
1. Link the project and apply the migration (tables, RLS, private `trip-photos` bucket):
   ```bash
   npx supabase login
   npx supabase link --project-ref <project-ref>
   npx supabase db push
   ```
   Alternatively, run `supabase/migrations/20261117000000_initial_schema.sql` in the Supabase SQL editor.
2. Enable Email authentication in Supabase Auth.
3. Set the Edge Function secrets and deploy it:
   ```bash
   npx supabase secrets set ADMIN_TOKEN=<long-random-string> OPENAI_API_KEY=<key> OPENAI_MODEL=<model> UNSPLASH_ACCESS_KEY=<key>
   npx supabase functions deploy generate-destination
   ```
4. Add destinations (admin only):
   ```bash
   curl -X POST "https://<project-ref>.supabase.co/functions/v1/generate-destination" \
     -H "Content-Type: application/json" \
     -H "x-admin-token: <ADMIN_TOKEN>" \
     -d '{ "country": "Italy", "city": "Rome" }'
   ```

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

**Main Purpose:** Tripilot is an AI-powered travel companion and travel journal. Users explore suggested destinations (a country or a city) with five interesting attractions each, create personal trips, and upload travel photos from the camera or gallery. The destination catalogue is added by the admin (OpenAI text + Unsplash images) and shared by all users.

## 2. User Access & Permissions

### Guest (Not Authenticated)

Describe what an unauthenticated user can access:

- Available screens or actions:

### Authenticated User

Describe what a logged-in user can access:

- Main sections / tabs:
- Details screens:
- Create / Edit / Delete actions:

## 3. Authentication & Session Handling

### Authentication Flow

Explain step-by-step:

1. What happens when the app starts
2. How authentication status is checked
3. What happens on successful login or registration
4. What happens on logout

### Session Persistence

- How is the user session stored?
- How is automatic login handled after app restart?

## 4. Navigation Structure

### Root Navigation Logic

- How is navigation split between authenticated and unauthenticated users?

### Main Navigation

Describe the main navigation structure:

- Number and type of main sections (e.g. Tabs)

### Nested Navigation

- Is there nested navigation (e.g. Stack inside a Tab)?
- What type of screens are included?

## 5. List → Details Flow

### List / Overview Screen

- What type of data is displayed?
- How does the user interact with the list?

### Details Screen

- How is navigation triggered?
- What data is received via route parameters?

## 6. Data Source & Backend

### Backend Type

- Simulated backend (MockAPI / DummyJSON)
- Real backend (Firebase or equivalent) ✅ **Supabase** (Auth, PostgreSQL with RLS, Storage, Edge Functions)

## 7. Data Operations (CRUD)

Describe the implemented data operations:

### Read (GET)

- Where is data fetched and displayed?

### Create (POST)

- How does the user create new data?

### Update / Delete (Mutation)

- Which operation is implemented (Update and/or Delete)?
- How is the UI updated after the change?

## 8. Forms & Validation

### Forms Used

- List all forms in the application:

### Validation Rules

Describe at least three validated fields:

- Field name and rules:
- Field name and rules:
- Field name with multiple validation rules:

## 9. Native Device Features

### Used Native Feature(s)

Select and describe at least one:

- Camera / Image Picker
- Location / Maps
- Biometrics
- Sensors

### Usage Description

- Where is it used?
- What functionality does it provide?

## 10. Typical User Flow

Describe a normal user journey through the app:

1.
2.
3.
4.

## 11. Error & Edge Case Handling

Describe how the app handles:

- Authentication errors
- Network or data errors
- Empty or missing data states
