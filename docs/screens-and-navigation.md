# Screens and Navigation

## 1. Screen inventory

Keep all screen files directly in `src/screens/`. Do not create nested folders under `src/screens/`.

### Authentication
1. **LoginScreen**
   - Email and password fields.
   - Validation, loading, and authentication error states.
   - Link to Register.

2. **RegisterScreen**
   - Name, email, password, confirm password.
   - Validate required fields, email format, password rules, and matching passwords.
   - On success, establish a session and enter the main app.

### Main tabs
3. **TripsScreen (Discover)**
   - Suggested destination cards with image, country, city, and short description.
   - Data must come from an external source/API, not only a hardcoded array.
   - Selecting a destination navigates to Plan Trip with destination params and step 2 selected.
   - Include loading, error, and empty states.

4. **PlanTripScreen**
   - A three-step wizard. It may be implemented as one screen with internal step state or nested routes, provided navigation and state are reliable.
   - Direct tab entry starts at step 1.
   - Entry from a suggested destination starts at step 2 with destination prefilled.
   - Step 1: country and optional city.
   - Step 2: flexible duration OR date range.
   - Step 3: destination/date summary and multi-select interests, Clear, Plan my trip.
   - Validate each step before proceeding.

5. **TripPlanPreviewScreen**
   - Dynamic screen showing the generated itinerary.
   - Receives the generated result through route params or a well-defined state/service mechanism.
   - Save Trip, Regenerate, and Edit Preferences actions.
   - Prevent accidental loss of an unsaved result when practical.

6. **MyTripsScreen**
   - Loads saved trips from the chosen external data source.
   - Pull-to-refresh.
   - Loading, error, and empty states.
   - Selecting a row/card opens TripDetailsScreen with `tripId`.

7. **TripDetailsScreen**
   - Dynamic master-detail screen.
   - Loads a trip by ID.
   - Displays destination, dates/duration, interests, and itinerary.
   - Actions to edit and delete.

8. **EditTripScreen**
   - Dynamic screen receiving `tripId`.
   - Loads current trip values.
   - Validates and updates the trip using PUT/PATCH.
   - Provides save and cancel actions.

9. **ProfileScreen**
   - Displays current user information.
   - Change profile picture using Expo ImagePicker (planned native feature).
   - Logout.
   - Keep scope simple.

## 2. Recommended navigator composition

Use a Root Stack to switch between authenticated and unauthenticated areas.

```text
RootStack
├── AuthStack
│   ├── Login
│   └── Register
└── MainTabs
    ├── TripsStack
    │   └── Trips
    ├── PlanTripStack
    │   ├── PlanTrip
    │   └── TripPlanPreview
    ├── MyTripsStack
    │   ├── MyTrips
    │   ├── TripDetails
    │   └── EditTrip
    └── ProfileStack
        └── Profile
```

This provides composed navigators and multiple Stack Navigators. The exact nesting can be adapted to the installed React Navigation version, but the exam requirement must remain satisfied.

## 3. Route parameter contracts

Use stable, documented route parameter names.

- PlanTrip: `{ initialStep, destination }`
  - `initialStep` is `1` or `2`.
  - `destination` may contain `{ country, city }`.
- TripPlanPreview: receives a generated itinerary object or a stable draft identifier.
- TripDetails: `{ tripId }`
- EditTrip: `{ tripId }`

Do not pass large or sensitive objects through navigation if fetching by ID is more reliable. Avoid relying on route params as the only long-term storage for a draft.

## 4. Navigation and session behavior
- Logged-out users can access only Auth screens.
- Logged-in users enter MainTabs.
- Logout clears the session and returns to AuthStack.
- Protected screens must not be accessible by manually navigating without an authenticated session.
- Persist/restore the session using the selected auth provider.
