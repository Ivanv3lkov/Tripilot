# React Native Exam — Acceptance Checklist

Use this document as a living checklist. Mark items complete only after they are implemented and verified.

## Navigation and structure — 20 points
- [ ] At least two composed navigators.
- [ ] At least one Stack Navigator.
- [ ] At least five screens total.
- [ ] At least three dynamic screens.
- [ ] Master-detail flow: My Trips → Trip Details.
- [ ] Pass a trip ID/object through route params.

## Authentication and session — 15 points
- [ ] Login.
- [ ] Register.
- [ ] Logout.
- [ ] Logged-out users can access only authentication screens.
- [ ] Logged-in users enter the main app.
- [ ] Protected screens cannot be opened without a valid session.
- [ ] Session persists and is restored after app restart.

## Data and CRUD — 25 points
- [ ] Use an external data source (REST API, database service, or approved mock API).
- [ ] Do not rely on hardcoded JSON as the only data source.
- [ ] My Trips list loads data using GET/read.
- [ ] Pull-to-refresh works on My Trips.
- [ ] Save Trip performs POST/create.
- [ ] Edit Trip performs PUT/PATCH/update.
- [ ] Delete Trip performs DELETE.
- [ ] Trip Details loads an individual record.
- [ ] Loading states are visible.
- [ ] Error states and retry behavior are implemented.

## Forms — 20 points
- [ ] Use React Hook Form, Formik, or documented custom validation.
- [ ] Validate at least three distinct fields.
- [ ] At least one field has multiple validation rules.
- [ ] Include at least two non-text input types (e.g. date picker, slider/stepper, switch, picker, multi-select).
- [ ] KeyboardAvoidingView/appropriate keyboard handling.
- [ ] Scrollable form content.
- [ ] Safe-area handling.
- [ ] Status bar configured.

## Native functionality — 20 points
- [ ] Implement at least one meaningful native feature.
- [ ] Planned feature: Expo ImagePicker for profile or trip cover image.
- [ ] Test permission denial and successful image selection.

## Submission requirements
- [ ] Public GitHub/Bitbucket/GitLab repository.
- [ ] At least 5 meaningful commits.
- [ ] Commits distributed across at least 3 different days.
- [ ] README contains install and run instructions.
- [ ] README contains completed Functional Guide template.
- [ ] README prominently links to a working APK.
- [ ] Verify APK installation and startup on a device/emulator.
- [ ] Deadline: December 8, 2026, 15:59.

## Final smoke test
- [ ] Fresh install starts without crashing.
- [ ] Login/register flow works.
- [ ] Session survives app restart.
- [ ] All four tabs open.
- [ ] Discover data loads from its source.
- [ ] Suggested destination opens Plan Trip at step 2.
- [ ] Direct Plan Trip entry starts at step 1.
- [ ] Both flexible and fixed-date modes validate correctly.
- [ ] AI generation has loading, success, and error states.
- [ ] Generated itinerary can be saved.
- [ ] My Trips loads, refreshes, opens details, edits, and deletes.
- [ ] Logout returns to authentication screens.
- [ ] Native image selection works.
