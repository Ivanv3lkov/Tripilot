import * as SecureStore from "expo-secure-store";

// Split into small entries: some iOS versions reject SecureStore values above ~2 KB,
// and the access token (JWT) alone is often ~1 KB.
const KEYS = {
  accessToken: "tripilot.auth.accessToken",
  refreshToken: "tripilot.auth.refreshToken",
  meta: "tripilot.auth.meta",
};

let currentSession = null;
const listeners = new Set();

function notify() {
  listeners.forEach((listener) => listener(currentSession));
}

export function getSession() {
  return currentSession;
}

export async function loadSession() {
  try {
    const [accessToken, refreshToken, meta] = await Promise.all([
      SecureStore.getItemAsync(KEYS.accessToken),
      SecureStore.getItemAsync(KEYS.refreshToken),
      SecureStore.getItemAsync(KEYS.meta),
    ]);
    if (!accessToken || !refreshToken || !meta) {
      currentSession = null;
      return null;
    }
    const { expiresAt, user } = JSON.parse(meta);
    currentSession = { accessToken, refreshToken, expiresAt, user };
  } catch {
    currentSession = null;
  }
  return currentSession;
}

// If secure storage fails, the session still works in memory until the app closes.
export async function saveSession(session) {
  currentSession = session;
  notify();
  try {
    await Promise.all([
      SecureStore.setItemAsync(KEYS.accessToken, session.accessToken),
      SecureStore.setItemAsync(KEYS.refreshToken, session.refreshToken),
      SecureStore.setItemAsync(
        KEYS.meta,
        JSON.stringify({ expiresAt: session.expiresAt, user: session.user }),
      ),
    ]);
  } catch {
    // Not persisted; the user will need to log in again after a restart.
  }
}

export async function clearSession() {
  const hadSession = currentSession !== null;
  currentSession = null;
  if (hadSession) notify();
  try {
    await Promise.all(
      Object.values(KEYS).map((key) => SecureStore.deleteItemAsync(key)),
    );
  } catch {
    // Nothing else to do; the in-memory session is already cleared.
  }
}

export function subscribeToSession(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
