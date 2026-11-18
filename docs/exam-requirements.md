# React Native Exam — Acceptance Checklist

Use this document as a living checklist. Mark items complete only after they are implemented and verified.

## Navigation and structure — 20 points
- [ ] At least two composed navigators (Root Stack → Bottom Tabs → Stacks).
- [ ] At least one Stack Navigator.
- [ ] At least five screens total.
- [ ] At least three dynamic screens (DestinationDetails, TripDetails, EditTrip, CreateTrip, AddPhoto).
- [ ] Master-detail flow: My Trips → Trip Details.
- [ ] Pass a trip ID through route params.

## Authentication and session — 15 points
- [ ] Login.
- [ ] Register.
- [ ] Logout.
- [ ] Logged-out users can access only authentication screens.
- [ ] Logged-in users enter the main app.
- [ ] Protected screens cannot be opened without a valid session.
- [ ] Session persists and is restored after app restart.

## Data and CRUD — 25 points
- [ ] External data source: Supabase (PostgreSQL + Storage). The catalogue is filled by the admin Edge Function (OpenAI + Unsplash).
- [ ] No hardcoded JSON as the data source. The destination catalogue comes from the database.
- [ ] Explore loads destinations (GET); Destination Details loads one destination with its attractions.
- [ ] My Trips list loads trips (GET) with pull-to-refresh.
- [ ] Create Trip performs POST.
- [ ] Edit Trip performs PATCH.
- [ ] Delete Trip performs DELETE (and removes its Storage photos).
- [ ] Trip Details loads an individual record.
- [ ] Photo upload (POST) and delete (DELETE).
- [ ] Loading states are visible.
- [ ] Error states and retry behavior are implemented.

## Forms — 20 points
- [ ] Use React Hook Form, Formik, or documented custom validation.
- [ ] Validate at least three distinct fields (destination, title, end date, caption).
- [ ] At least one field has multiple validation rules (title: required + trimmed + max length).
- [ ] At least two non-text input types (destination picker, date pickers, attraction picker).
- [ ] KeyboardAvoidingView or appropriate keyboard handling.
- [ ] Scrollable form content.
- [ ] Safe-area handling.
- [ ] Status bar configured.

## Native functionality — 20 points
- [ ] Expo ImagePicker: camera and gallery for trip photos.
- [ ] Test permission denial and successful capture/selection.

## Submission requirements
- [ ] Public GitHub/Bitbucket/GitLab repository.
- [ ] At least 5 meaningful commits.
- [ ] Commits distributed across at least 3 different days.
- [ ] README contains install and run instructions.
- [ ] README contains the completed Functional Guide template.
- [ ] README prominently links to a working APK.
- [ ] Verify APK installation and startup on a device/emulator.
- [ ] Deadline: December 8, 2026, 15:59.

## Final smoke test
- [ ] Fresh install starts without crashing.
- [ ] Login/register flow works.
- [ ] Session survives app restart.
- [ ] All three tabs open (Explore, My Trips, Profile).
- [ ] Suggested destinations load from the database and the search filter works.
- [ ] Destination Details shows five attractions with Unsplash images and credit links.
- [ ] Admin generation of a new destination works, and repeating it returns the existing row (no new AI call).
- [ ] Create trip from Explore prefills the destination.
- [ ] Create trip manually from My Trips works.
- [ ] My Trips loads, refreshes, opens details, edits, and deletes.
- [ ] Photo from camera and from gallery uploads, shows, and can be deleted.
- [ ] Another user cannot see your trips or photos (RLS).
- [ ] Logout returns to authentication screens.
