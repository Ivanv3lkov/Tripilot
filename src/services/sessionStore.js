import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "tripilot.session";

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
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    currentSession = stored ? JSON.parse(stored) : null;
  } catch {
    currentSession = null;
  }
  return currentSession;
}

export async function saveSession(session) {
  currentSession = session;
  notify();
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export async function clearSession() {
  const hadSession = currentSession !== null;
  currentSession = null;
  if (hadSession) notify();
  await AsyncStorage.removeItem(STORAGE_KEY);
}

export function subscribeToSession(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
