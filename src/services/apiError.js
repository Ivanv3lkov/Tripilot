export class ApiError extends Error {
  constructor(message, { status = 0, code = null, cause } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.cause = cause;
  }

  get isNetworkError() {
    return this.status === 0;
  }
}

// Normalizes axios errors from Supabase Auth, PostgREST, and Storage into ApiError.
export function toApiError(error) {
  if (error instanceof ApiError) return error;

  if (error?.response) {
    const { status, data } = error.response;
    // Auth: { error_code, msg } | PostgREST: { code, message } | Storage: { error, message }
    const code = data?.error_code ?? data?.code ?? data?.error ?? null;
    const message =
      data?.msg ??
      data?.message ??
      data?.error_description ??
      `Request failed with status ${status}.`;
    return new ApiError(message, {
      status,
      code: code === null ? null : String(code),
      cause: error,
    });
  }

  if (error?.code === "ECONNABORTED" || error?.code === "ETIMEDOUT") {
    return new ApiError("The server took too long to respond. Please try again.", {
      code: "timeout",
      cause: error,
    });
  }

  return new ApiError("No connection to the server. Check your internet.", {
    code: "network_error",
    cause: error,
  });
}
