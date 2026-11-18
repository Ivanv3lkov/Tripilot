# Screens and Navigation

## 1. Screen inventory

Keep all screen files directly in `src/screens/`. Do not create nested folders under `src/screens/`.

### Authentication (existing)
1. **LoginScreen**: email and password, validation, loading and error states, link to Register.
2. **RegisterScreen**: name, email, password, confirm password, with validation. On success, the session is established.

### Explore tab
3. **ExploreScreen**
   - Lists suggested destinations from the `destinations` table (GET), as cards with image, country, and city.
   - Search field filters the existing catalogue by country or city (`destinationService.listDestinations({ search })`). Users cannot add destinations; the admin does.
   - Loading, error/retry, and empty ("No destinations found") states.
   - Selecting a destination opens DestinationDetails with `destinationId`.

4. **DestinationDetailsScreen** (dynamic)
   - Loads the destination and its five attractions by `destinationId`.
   - Shows the cover image, description, and attraction cards (image, name, description). Shows an "AI-generated" label when `contentSource = 'ai'`.
   - Each Unsplash image shows a "Photo: Unsplash" credit that opens `sourceUrl`.
   - **Create trip** opens CreateTrip in the My Trips tab with the destination prefilled.

### My Trips tab
5. **MyTripsScreen**
   - Lists the user's trips (GET) with pull-to-refresh, plus loading, error, and empty states.
   - A **New trip** button opens CreateTrip.
   - Selecting a trip opens TripDetails with `tripId`.

6. **TripDetailsScreen** (dynamic, master-detail)
   - Loads the trip by `tripId`, including the destination, its attractions, and the trip's photos (signed URLs).
   - Actions: Edit, Delete (with confirmation), Add photo.
   - Photo gallery: tapping a photo allows editing the caption and attraction link, or deleting it.

7. **CreateTripScreen** (dynamic)
   - Params: `{ destinationId? }`.
   - Destination picker (non-text input; required; prefilled when coming from Explore), title, start/end date pickers (non-text input), notes.
   - Validates and creates the trip (POST). On success, goes to TripDetails.

8. **EditTripScreen** (dynamic, existing file)
   - Params: `{ tripId }`. Loads the current values and edits the title, dates, and notes (PATCH). The destination is read-only.

9. **AddPhotoScreen** (dynamic)
   - Params: `{ tripId }`.
   - Choose **Camera** or **Gallery** (Expo ImagePicker). Handles the permission prompt and permission denial.
   - Image preview, optional attraction picker (attractions of the trip's destination), optional caption.
   - Upload with progress/loading and error states.

### Profile tab
10. **ProfileScreen** (existing): account email and display name from Supabase Auth, and Logout.

## 2. Navigator composition

```text
RootStack
├── Auth (AuthStack)            ← no session
│   ├── Login
│   └── Register
└── MainTabs (Bottom Tabs)      ← valid session
    ├── ExploreTab  → ExploreStack
    │   ├── Explore
    │   └── DestinationDetails
    ├── MyTripsTab  → MyTripsStack
    │   ├── MyTrips
    │   ├── TripDetails
    │   ├── CreateTrip
    │   ├── EditTrip
    │   └── AddPhoto
    └── ProfileTab  → ProfileStack
        └── Profile
```

Cross-tab navigation from DestinationDetails:

```js
navigation.navigate("MyTripsTab", {
  screen: "CreateTrip",
  params: { destinationId },
  initial: false,
});
```

Pass `initial: false` so that MyTrips stays the root of the stack when the tab has not been opened yet.

The navigation structure above is implemented. The screens are placeholders until their services are built.

## 3. Route parameter contracts
- DestinationDetails: `{ destinationId }`
- TripDetails: `{ tripId }`
- CreateTrip: `{ destinationId? }`
- EditTrip: `{ tripId }`
- AddPhoto: `{ tripId }`

Pass IDs and load data in the screen. Do not pass large objects or signed URLs through route params.

## 4. Navigation and session behavior
- Logged-out users can access only the Auth screens.
- Logged-in users enter MainTabs.
- Logout clears the session and returns to Auth.
- The session is restored from `expo-secure-store` on app start (Supabase Auth tokens).
