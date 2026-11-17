import { authApi, refreshSession, toSession } from "./apiClient";
import { ApiError } from "./apiError";
import {
  clearSession,
  getSession,
  loadSession,
  saveSession,
  subscribeToSession,
} from "./sessionStore";
import { normalizeEmail } from "../utils/validation";

const ERROR_MESSAGES = {
  invalid_credentials: "Incorrect email or password.",
  email_not_confirmed: "Please confirm your email before logging in.",
  user_already_exists: "An account with this email already exists.",
  email_exists: "An account with this email already exists.",
  weak_password: "The password is too weak. Choose a stronger one.",
  over_request_rate_limit: "Too many attempts. Please wait and try again.",
  over_email_send_rate_limit: "Too many emails sent. Please try again later.",
};

function toFriendlyError(error, fallback) {
  if (error.isNetworkError) return error;
  return new ApiError(ERROR_MESSAGES[error.code] ?? fallback, {
    status: error.status,
    code: error.code,
    cause: error,
  });
}

export function toAppUser(authUser) {
  if (!authUser) return null;
  return {
    id: authUser.id,
    email: authUser.email,
    fullName: authUser.user_metadata?.full_name ?? null,
  };
}

export async function login({ email, password }) {
  try {
    const { data } = await authApi.post(
      "/token",
      { email: normalizeEmail(email), password },
      { params: { grant_type: "password" } },
    );
    await saveSession(toSession(data));
    return toAppUser(data.user);
  } catch (error) {
    throw toFriendlyError(error, "Could not log in. Please try again.");
  }
}

export async function register({ fullName, email, password }) {
  let data;
  try {
    ({ data } = await authApi.post("/signup", {
      email: normalizeEmail(email),
      password,
      data: { full_name: fullName.trim().replace(/\s+/g, " ") },
    }));
  } catch (error) {
    throw toFriendlyError(error, "Could not create the account. Please try again.");
  }

  // Without email confirmation Supabase returns a session; with it, only the user.
  if (data.access_token) {
    await saveSession(toSession(data));
    return { user: toAppUser(data.user), needsEmailConfirmation: false };
  }

  // With email confirmation on, Supabase hides existing accounts by returning
  // a user without identities instead of an error.
  const user = data.user ?? data;
  if (user.identities?.length === 0) {
    throw new ApiError(ERROR_MESSAGES.user_already_exists, {
      status: 422,
      code: "user_already_exists",
    });
  }
  return { user: toAppUser(user), needsEmailConfirmation: true };
}

// Always signs out locally; revoking the token on the server is best-effort.
export async function logout() {
  const accessToken = getSession()?.accessToken;
  await clearSession();
  if (!accessToken) return;
  try {
    await authApi.post("/logout", null, {
      params: { scope: "local" },
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch {
    // The token expires on its own; nothing else to do.
  }
}

// Restores the persisted session on app start. Stays signed in while offline.
export async function restoreSession() {
  const session = await loadSession();
  if (!session) return null;
  if (session.expiresAt <= Date.now() / 1000) {
    try {
      await refreshSession();
    } catch (error) {
      if (!error.isNetworkError) return null;
    }
  }
  return toAppUser(getSession()?.user);
}

export function subscribeToAuthChanges(callback) {
  return subscribeToSession((session) => callback(toAppUser(session?.user)));
}
