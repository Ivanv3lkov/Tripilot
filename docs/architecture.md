# Architecture and Technology Decisions

## 1. Current direction

### Mobile
- React Native
- Expo
- JavaScript (not TypeScript)
- React Navigation
- Functional components and React Hooks

### AI backend (planned)
- Node.js on AWS Lambda
- Amazon API Gateway HTTP API as the public HTTPS entry point
- OpenAI API called only from Lambda
- Store the OpenAI key in AWS Secrets Manager or a secure Lambda environment configuration; never in the mobile app or Git.

Expected request flow:

```text
React Native
    |
    | HTTPS POST + user auth token (when auth is implemented)
    v
Amazon API Gateway
    |
    v
AWS Lambda (Node.js)
    |
    | OpenAI API request
    v
OpenAI API
    |
    v
Lambda returns validated JSON
    |
    v
React Native displays Trip Plan Preview
```

## 2. Decisions not finalized
Do not assume or implement these without approval:
- Authentication provider.
- Database/persistence provider.
- Destination discovery data provider.
- Attractions/places provider for factual attraction details and popularity signals.
- AWS deployment tool (AWS SAM, Serverless Framework, CDK, or manual setup).

Document the selected option here once decided, including why it was chosen.

## 3. Suggested mobile service boundaries
Keep UI independent from providers:
- `destinationService` — retrieve suggested destinations.
- `tripPlanningService` — call the backend itinerary-generation endpoint.
- `tripService` — list, get, create, update, and delete saved trips.
- `authService` — register, login, logout, and restore session.
- `profileService` — profile data and profile image.

These are conceptual responsibilities; adapt filenames to the existing project conventions.

## 4. Backend responsibilities
The Lambda handler should:
1. Validate the HTTP method and request body.
2. Authenticate the caller when authentication is selected and required.
3. Validate destination, date/duration, and interests.
4. Build the OpenAI request.
5. Request a predictable structured response (JSON schema/structured output where supported).
6. Validate the model response before returning it.
7. Return appropriate HTTP status codes and safe error messages.
8. Avoid logging API keys, tokens, or sensitive user data.

Do not trust client-supplied user IDs as proof of identity.

## 5. API contract — proposed
`POST /plan-trip`

Example request (illustrative; refine when implementation begins):

```json
{
  "destination": {
    "country": "Italy",
    "city": "Rome"
  },
  "schedule": {
    "mode": "flexible",
    "durationDays": 5
  },
  "interests": ["History", "Architecture", "Food"]
}
```

For exact dates:

```json
{
  "destination": {
    "country": "Italy",
    "city": "Rome"
  },
  "schedule": {
    "mode": "fixed",
    "startDate": "2026-10-10",
    "endDate": "2026-10-15"
  },
  "interests": ["History", "Architecture"]
}
```

The response should be a structured object containing destination, schedule, and an array of days. Each day contains a title and ordered attractions. Define and validate the final schema before wiring the UI.

## 6. Security and reliability
- Never expose the OpenAI API key in the mobile bundle.
- Add authentication/authorization to protected backend operations.
- Validate all client input on the backend.
- Apply reasonable request limits and handle OpenAI/API timeouts.
- Return useful but non-sensitive errors.
- Do not commit `.env`, credentials, service account files, or private keys.
- Use separate development and production configuration where possible.
