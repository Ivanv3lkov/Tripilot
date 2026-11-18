# Tripilot — Product Specification

## 1. Product overview
Tripilot is an AI-powered **Travel Companion and Travel Journal** built with Expo and React Native.

Users discover destinations, explore five interesting attractions for each one, organize their personal trips, and keep memories of their travels through photos.

Tripilot is **not** an itinerary planner. The exam implementation focuses on the core journeys below rather than broad feature scope.

## 2. Primary navigation
The bottom tab navigator has three tabs:
- **Explore**: discover destinations and their attractions.
- **My Trips**: create and manage personal trips and their photos.
- **Profile**: basic account information and logout.

## 3. Features

### Explore
- A destination is either a **country** (for example, Italy) or a **city in a country** (for example, Rome, Italy).
- The Explore screen shows the **suggested destinations** from the shared catalogue, with a search field that filters them by country or city.
- Opening a destination shows its name, description, cover image, and **five interesting attractions**, each with a short description and an image.
- **Only the admin adds destinations.** The admin runs the Supabase Edge Function `generate-destination`, which uses OpenAI for the text and Unsplash for the images and saves the result once in Supabase. Users never trigger AI generation.
- AI-generated content is labelled as such. Images show a "Photo: Unsplash" credit link. Do not describe attractions as "the most popular" or present a ranking; they are "interesting attractions".

### My Trips
- A trip belongs to one user and one destination.
- A trip can be created:
  - manually from My Trips by selecting a destination, or
  - directly from a destination in Explore ("Create trip").
- Fields: destination (required, cannot be changed later), title (required), start/end dates (optional), notes (optional).
- My Trips lists the user's trips with pull-to-refresh. A trip opens Trip Details, where the user can edit or delete it.

### Travel photos
- In Trip Details, the user adds photos with the **camera** or from the **gallery** (Expo ImagePicker).
- Photos are uploaded to a private Supabase Storage bucket.
- Each photo belongs to a trip and can optionally be linked to one of the destination's attractions.
- A photo can have an optional caption. The user can edit the caption or link and delete the photo.

### Profile
- Shows basic account information from Supabase Auth (email, display name).
- Logout.

## 4. Core user journeys

### A: Explore → create trip
1. User opens Explore and selects a suggested destination, or filters by "Rome".
2. Destination Details shows the description, cover image, and five attractions.
3. User taps **Create trip**. The trip form opens with the destination prefilled.
4. User enters a title and optional dates/notes and saves. The trip appears in My Trips.

### B: Create trip manually
1. User opens My Trips and taps **New trip**.
2. User selects a destination from the catalogue, fills in the form, and saves.

### C: Manage trips and photos
1. My Trips loads the user's trips. The user can pull to refresh.
2. User opens Trip Details (by `tripId`), which shows trip info, the destination's attractions, and the photo gallery.
3. User edits or deletes the trip.
4. User adds a photo (camera or gallery), optionally links it to an attraction, adds a caption, and uploads it.

## 5. Explicit non-goals for the exam MVP
Do not add these unless the user explicitly approves:
- Day-by-day itineraries, daily or hourly schedules, AI-generated routes.
- Visited tracking, ratings, per-attraction notes (`trip_attractions`).
- A `profiles` table, avatars, or profile editing.
- Budgets, expenses, hotel/flight bookings.
- Interests, tags, or recommendation engines.
- AI chat, social features, public sharing, maps/navigation.
