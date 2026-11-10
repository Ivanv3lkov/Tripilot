Tripilot - GitHub Copilot Instructions

This repository contains Tripilot, a React Native + Expo travel-planning exam project.

Before making changes:

- Read the root AGENTS.md and the relevant documents in docs/.
- Use JavaScript only. Do not create TypeScript .ts or .tsx files.
- Preserve the four-tab product structure: Trips, Plan Trip, My Trips, Profile.
- Follow the three-step Plan Trip flow and the screen/navigation specification in docs/screens-and-navigation.md.
- Keep all screen files directly in `src/screens/`; do not create nested folders under `src/screens/`.
- The planned AI path is React Native → API Gateway → Node.js AWS Lambda → OpenAI. OpenAI calls and credentials must remain server-side.
- Authentication provider and database are undecided. Do not add Firebase or another provider without approval.
- Do not invent API data or hardcode a local JSON dataset as the sole external data source.
- Keep implementation small and aligned with the exam requirements in docs/exam-requirements.md.
- Do not add unrelated features or major dependencies without asking.
- Inspect existing code before editing; preserve established project conventions.
- Report which checks you actually ran. Never claim tests/builds passed if they were not run.
  When a product or architecture decision changes, update the corresponding document in docs/.
