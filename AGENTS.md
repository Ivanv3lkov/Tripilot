This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint before declaring any task done. This project currently uses JavaScript; use `.js` or `.jsx` files and do not introduce TypeScript unless requested.

## Navigation & Routing

- Use **React Navigation** for all navigation. Define navigators and screens using React Navigation and keep navigation setup separate from screen and component code where practical.
- Do not use Expo Router or add file-based routes.
- Consult the React Navigation documentation for the installed version before using its APIs: https://reactnavigation.org/docs/getting-started

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md


# Tripilot — AI Agent Instructions

## Project purpose
Tripilot is an AI-powered **Travel Companion and Travel Journal** (React Native + Expo). Users discover destinations, explore five interesting attractions for each one, create personal trips, and upload travel photos. It is **not** an itinerary planner. The project is being built for a React Native exam.

## Product decisions
- The application name is **Tripilot**.
- The primary navigation has three tabs: **Explore**, **My Trips**, and **Profile**.
- A destination is a country (e.g. Italy) or a city in a country (e.g. Rome, Italy).
- The app is for signed-in users only. Logged-out users see only Login and Register.
- Explore shows suggested destinations from the catalogue with a search filter. Destination Details shows a description, cover image, and five interesting attractions (image + short description + "Photo: Unsplash" credit link).
- **Only the admin adds destinations**, through the admin-only Supabase Edge Function `generate-destination` (OpenAI for the text, Unsplash for the images). The result is saved once and reused. App users never trigger AI generation and cannot write to the catalogue.
- My Trips: a trip belongs to one user and one destination, with a title, optional dates, and optional notes. It can be created from Destination Details ("Create trip") or manually from My Trips. List with pull-to-refresh → Trip Details → edit or delete.
- Travel photos: camera or gallery via Expo ImagePicker (the native feature), uploaded to the private Storage bucket `trip-photos`. A photo belongs to a trip, can optionally reference an attraction, and has an optional caption.
- Profile shows basic account info from Supabase Auth and Logout.
- Out of scope: day-by-day itineraries, schedules, AI routes, visited tracking, ratings, budgets, bookings, interests, a `profiles` table, and a `trip_attractions` table.

## Technology constraints
- Use **JavaScript**, not TypeScript. Do not create `.ts` or `.tsx` files in the mobile app.
- Use React Native with Expo.
- Use React Navigation. The navigation must contain composed navigators and at least one Stack Navigator.
- Backend: **Supabase**, which provides Auth, PostgreSQL, Storage (`trip-photos`), and Edge Functions. **Do not use the Supabase SDK** (`@supabase/supabase-js`). The app calls the Supabase REST APIs with **axios** through the shared instances in `src/services/apiClient.js` (`authApi`, `restApi`, `storageApi`, created once with `create()`). Never create another axios instance or hardcode the base URL in services or screens. Keep HTTP calls inside service modules, use only the publishable key in the app (on the `apikey` header), and rely on Row Level Security. Do not add another auth or database provider without explicit approval.
- AI and images: OpenAI and Unsplash are called only from the admin Edge Function `generate-destination` (`supabase/functions/`, JavaScript). Never call them from the mobile app. Never put the OpenAI key, Unsplash key, admin token, or Supabase service-role key in mobile code, app config, or a committed file.
- Database changes go through `supabase/migrations/` and must stay in sync with `docs/data-model.md`.
- The database schema, RLS, and Storage rules are defined in `docs/data-model.md`. Do not add tables or columns beyond it without approval.
- Do not introduce AWS Lambda, Next.js, Express, or a permanently running server unless the user explicitly changes the architecture.
- Prefer a small, understandable implementation appropriate for an exam project. Avoid unnecessary features and dependencies.

## Exam requirements (must remain visible during development)
- At least 2 composed navigators, including a Stack.
- At least 5 screens and 3 dynamic screens.
- Master-detail flow: My Trips list → Trip Details, passing a trip ID or object through route params.
- Login, Register, Logout, protected app navigation, and persistent session.
- External data source; do not use hardcoded JSON as the only source for app data.
- My Trips must support pull-to-refresh.
- Implement GET, POST, PUT/PATCH, and preferably DELETE.
- Show loading and error states for network operations.
- Forms: at least two non-text input types, validation of at least three distinct fields (one with multiple rules), React Hook Form/Formik/custom validation, keyboard-safe layout, safe area, and configured status bar.
- At least one meaningful native feature: Expo ImagePicker (camera + gallery) for trip photos.
- Public Git repository, at least 5 meaningful commits across at least 3 different days, README with setup/run instructions, completed Functional Guide, and a prominent working APK link.
- Submission deadline: **December 8, 2026, 15:59**.

## Engineering rules
- Before changing code, inspect the existing project structure and relevant files. Do not replace working code or configuration unnecessarily.
- Follow existing naming, formatting, and package-manager conventions. Do not introduce a second package manager.
- Use functional components and React Hooks.
- Keep screens focused on UI and user interaction. Put API, authentication, and persistence operations in service modules.
- Keep every screen file directly in `src/screens/`; do not create nested folders under `src/screens/`.
- Keep reusable UI components separate from screens.
- Validate and normalize user input before sending it to APIs.
- Handle loading, empty, success, and error states.
- Do not fabricate API responses, destination facts, or image URLs. Do not present attractions as a popularity ranking. AI-generated content must be validated and labelled.
- Do not commit secrets, `.env` files, credentials, signing keys, or personal data.
- Ask before adding major dependencies, changing the architecture, or making a product decision that is currently marked undecided.
- Do not silently expand scope with itineraries, chat, social features, maps, budgets, or unrelated AI features.

## Working process
1. Read this file and the relevant documents in `docs/` before implementation.
2. For a feature, identify the affected screens, navigation routes, services, and exam criteria.
3. Make the smallest coherent change.
4. Add or update tests where practical.
5. Run the available lint, tests, and build/type-independent checks. Do not claim a check passed unless it was actually run.
6. Summarize changed files, behavior, checks run, and any remaining work.
7. Update documentation when a product or architecture decision changes.

## Source of truth
- Product and scope: `docs/product-spec.md`
- Screens and navigation: `docs/screens-and-navigation.md`
- Architecture, Edge Function, and undecided choices: `docs/architecture.md`
- Database schema, RLS, and Storage: `docs/data-model.md`
- Exam checklist: `docs/exam-requirements.md`
- Development workflow: `docs/development-workflow.md`

If code and documentation disagree, do not guess. Identify the conflict and ask the user which should be authoritative, unless the current task clearly updates the decision.
