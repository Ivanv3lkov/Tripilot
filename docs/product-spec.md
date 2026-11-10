# Tripilot — Product Specification

## 1. Product overview
Tripilot is a mobile travel-planning application. Users discover destinations, generate personalized travel itineraries with AI, save trips, and manage their saved trips.

The exam implementation should prioritize the core journey rather than broad feature scope.

## 2. Primary navigation
The bottom tab navigator contains:
- **Trips** — discover suggested destinations.
- **Plan Trip** — create an itinerary through a three-step wizard.
- **My Trips** — view and manage saved trips.
- **Profile** — account details, profile image, settings, and logout.

## 3. Core user journeys

### Journey A: Discover and plan
1. User opens Trips.
2. User selects a suggested destination, for example Rome, Italy.
3. App opens Plan Trip at step 2, carrying the selected destination.
4. User selects flexible duration or exact dates.
5. User selects interests at step 3.
6. User taps Plan my trip.
7. App requests an itinerary from the backend and displays Trip Plan Preview.
8. User saves the generated itinerary.

### Journey B: Start planning directly
1. User opens Plan Trip from the tab bar.
2. Wizard starts at step 1.
3. User chooses country and optionally city.
4. User completes steps 2 and 3 and generates the itinerary.

### Journey C: Manage saved trips
1. User opens My Trips.
2. App loads saved trips from the selected external data source.
3. User can refresh the list, open a trip, edit it, or delete it.
4. Trip Details is opened using a trip ID route parameter.

## 4. Plan Trip wizard

### Step 1 — Destination
- Country is required.
- City is optional if country-wide planning is supported.
- If city is provided, the itinerary should focus on that city.
- If only country is provided, the backend/model may propose a suitable route within that country.
- Destination may be prefilled from the Trips screen.
- Provide Continue and Back navigation.

### Step 2 — Dates
Offer two mutually exclusive modes:
- **I'm flexible**: user selects trip duration in days using a stepper or slider.
- **Set dates**: user selects start and end dates using a date-range selection UI.

Rules:
- Flexible duration must be a positive integer within a defined UI limit.
- For exact dates, end date must be after start date.
- Derive duration from the selected dates; do not ask the user to enter a second conflicting duration.
- Store the selected mode and relevant values.

### Step 3 — Interests
Display a summary of the chosen destination and dates/duration.
Allow multiple selections, for example:
- History
- Architecture
- Nature
- Food
- Museums
- Shopping
- Nightlife
- Local experiences

Actions:
- Clear — removes all selected interests.
- Plan my trip — validates the form and sends the generation request.
- Require at least one interest unless the product decision is deliberately changed.

## 5. AI itinerary result
Trip Plan Preview should display:
- Destination and duration/date range.
- Day-by-day itinerary.
- Each day has a title and ordered attractions.
- Each attraction has a name, short description, and category; address/coordinates may be included when reliably available.
- Loading, error, retry, and empty-result states.
- Save Trip action.

Do not claim objective global popularity ranking when the system only uses an LLM's general knowledge. If verifiable attraction data/ranking is required, integrate a trusted places data provider and document its source and limitations.

## 6. Saved trips
A saved trip should retain:
- Destination.
- Travel dates or flexible duration.
- Interests.
- Generated itinerary.
- Created/updated timestamps.
- Owner/user ID when authentication is implemented.

My Trips supports list, refresh, details, edit, and delete.

## 7. Explicit non-goals for the exam MVP
Do not add these unless the user explicitly approves:
- AI chat or memory assistant.
- Travel social network or public sharing.
- Journal/diary entries.
- Booking flights/hotels.
- Complex maps/navigation.
- Unrelated recommendation engines.
