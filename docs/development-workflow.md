# Development Workflow

## Before implementation
1. Read `AGENTS.md` and relevant files in `docs/`.
2. Inspect the current repository and package scripts.
3. Confirm the active package manager from the lockfile. Do not mix npm, Yarn, and pnpm.
4. Confirm installed Expo and React Navigation versions before choosing APIs.
5. Do not invent run, test, lint, or build commands; inspect `package.json`.

## When implementing a feature
1. Identify the user journey and acceptance criteria.
2. Identify screens, navigation params, service methods, and data changes.
3. Implement the smallest working slice.
4. Add loading, empty, error, and success behavior.
5. Validate input on both client and backend where applicable.
6. Test the relevant flow on emulator/device when possible.
7. Update the relevant documentation and exam checklist.

## Git workflow
- Make small, meaningful commits.
- Do not squash the entire project into one initial commit.
- The exam requires at least five meaningful commits distributed across at least three different days.
- Never commit secrets, local environment files, build credentials, or personal data.

## AI coding assistant behavior
- Ask before making unresolved product/architecture choices.
- Do not silently add dependencies or switch providers.
- Do not rewrite large parts of the app when a focused change is sufficient.
- Explain assumptions when a requirement is ambiguous.
- Report modified files and checks actually executed.
- If a command fails, report the failure; do not state that validation succeeded.
