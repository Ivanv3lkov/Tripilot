# Data Model (Proposed)

The database provider is not selected yet. These are logical JavaScript data shapes, not a commitment to a particular database.

## Trip

```js
{
  id: "trip-id",
  userId: "user-id",
  destination: {
    country: "Italy",
    city: "Rome"
  },
  schedule: {
    mode: "flexible", // "flexible" | "fixed"
    durationDays: 5,
    startDate: null,
    endDate: null
  },
  interests: ["History", "Architecture", "Food"],
  title: "5 days in Rome",
  itinerary: [
    {
      day: 1,
      title: "Ancient Rome",
      attractions: [
        {
          name: "Colosseum",
          description: "Short factual description.",
          category: "History",
          address: null,
          latitude: null,
          longitude: null,
          order: 1
        }
      ]
    }
  ],
  createdAt: "ISO-8601 timestamp",
  updatedAt: "ISO-8601 timestamp"
}
```

## Suggested destination

```js
{
  id: "rome-italy",
  country: "Italy",
  city: "Rome",
  description: "Short destination introduction.",
  imageUrl: "https://...",
  source: "provider-name"
}
```

Suggested destinations must ultimately be retrieved from an external data source/API. Do not treat this example as permission to ship a hardcoded JSON dataset as the only source.

## Validation rules to implement
- Country: required, non-empty.
- City: optional; if present, non-empty after trimming.
- Schedule mode: must be `flexible` or `fixed`.
- Flexible duration: integer within the UI's configured minimum and maximum.
- Fixed schedule: valid start and end dates; end must be after start.
- Interests: array of supported values; require at least one for itinerary generation unless product scope changes.
- Trip title: required for saved trip if user can edit it; apply a sensible maximum length.
- User ownership: users may only read/update/delete their own saved trips.

## Persistence guidance
Keep repository/service methods provider-neutral where practical:
- `listTrips()`
- `getTripById(tripId)`
- `createTrip(trip)`
- `updateTrip(tripId, changes)`
- `deleteTrip(tripId)`

The implementation must enforce ownership and authorization in the chosen backend/database rules, not only hide UI actions.
