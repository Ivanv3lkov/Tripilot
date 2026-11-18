import { create as createAxios } from "axios";

import { ApiError, toApiError } from "./apiError";
import { clearSession, getSession, saveSession } from "./sessionStore";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !PUBLISHABLE_KEY) {
  throw new Error(
    "Missing Supabase config. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local.",
  );
}

const BASE_URL = SUPABASE_URL.replace(/\/+$/, "");
const REQUEST_TIMEOUT_MS = 15000;
const REFRESH_MARGIN_SECONDS = 60;

function createApi(path) {
  return createAxios({
    baseURL: `${BASE_URL}${path}`,
    timeout: REQUEST_TIMEOUT_MS,
    // The publishable key always goes on `apikey`, never on `Authorization`.
    headers: { apikey: PUBLISHABLE_KEY },
  });
}

// Public auth endpoints (login, signup, token refresh). No user token is attached.
export const authApi = createApi("/auth/v1");
authApi.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(toApiError(error)),
);

// Keeps only the user fields the app needs, so the stored session stays small.
function toSessionUser(user) {
  return {
    id: user.id,
    email: user.email,
    user_metadata: { full_name: user.user_metadata?.full_name ?? null },
  };
}

export function toSession(data) {
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_at ?? Math.floor(Date.now() / 1000) + data.expires_in,
    user: toSessionUser(data.user),
  };
}

function isExpiringSoon(session) {
  return session.expiresAt - REFRESH_MARGIN_SECONDS <= Date.now() / 1000;
}

let refreshPromise = null;

// Single-flight: parallel requests share one refresh, because Supabase refresh
// tokens are single-use.
export function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const session = getSession();
      if (!session?.refreshToken) {
        throw new ApiError("Your session has expired. Please log in again.", {
          status: 401,
          code: "session_missing",
        });
      }
      try {
        const { data } = await authApi.post(
          "/token",
          { refresh_token: session.refreshToken },
          { params: { grant_type: "refresh_token" } },
        );
        const nextSession = toSession(data);
        await saveSession(nextSession);
        return nextSession;
      } catch (error) {
        // An invalid refresh token ends the session; network or server errors keep it.
        if (error.status >= 400 && error.status < 500) await clearSession();
        throw error;
      }
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

function isExpiredTokenError(error) {
  const { response } = error;
  return (
    response?.status === 401 || /jwt expired/i.test(response?.data?.message ?? "")
  );
}

function createAuthorizedApi(path) {
  const api = createApi(path);

  api.interceptors.request.use(async (config) => {
    let session = getSession();
    if (session && isExpiringSoon(session)) {
      try {
        session = await refreshSession();
      } catch (error) {
        if (!error.isNetworkError) throw error;
      }
    }
    if (session) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const { config } = error;
      if (config && !config.retriedAfterRefresh && getSession() && isExpiredTokenError(error)) {
        config.retriedAfterRefresh = true;
        try {
          const session = await refreshSession();
          config.headers.Authorization = `Bearer ${session.accessToken}`;
          return api(config);
        } catch (refreshError) {
          return Promise.reject(toApiError(refreshError));
        }
      }
      return Promise.reject(toApiError(error));
    },
  );

  return api;
}

// Database (PostgREST) and file storage, authorized as the signed-in user and protected by RLS.
export const restApi = createAuthorizedApi("/rest/v1");
export const storageApi = createAuthorizedApi("/storage/v1");
