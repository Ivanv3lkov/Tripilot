// Error codes from ApiError (authService, apiError, services) that have their
// own translated message under "errors.<code>".
const TRANSLATED_CODES = new Set([
  "invalid_credentials",
  "email_not_confirmed",
  "user_already_exists",
  "email_exists",
  "weak_password",
  "over_request_rate_limit",
  "over_email_send_rate_limit",
  "session_missing",
  "timeout",
  "network_error",
  "not_found",
  "location_denied",
  "location_unavailable",
  "location_unknown",
  "search_failed",
]);

// Returns a message in the current language. Server texts are not shown,
// because they are always in English.
export function getErrorMessage(t, error, fallbackKey) {
  const code = error?.code;
  if (code && TRANSLATED_CODES.has(code)) return t(`errors.${code}`);
  if (error?.isNetworkError) return t("errors.network_error");
  return t(fallbackKey);
}
