import axios from "axios";

/**
 * Standard error handler for API service calls.
 * Converts Axios errors into serializable Error instances
 * that can cross the Server Action boundary safely.
 */
export function handleApiError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const method = error.config?.method?.toUpperCase();
    const url = error.config?.url;
    console.error(
      `[api] ${method} ${url} failed with status ${status}`,
      error.response?.data ?? error.message,
    );

    switch (status) {
      case 401:
        throw new Error("Token expired");
      case 400:
      case 403:
      case 404:
      case 500:
      case 502:
      case 503:
      case 504:
      case 530:
        throw new Error("Internal server error");
      default:
        throw new Error(error.message || "Unexpected error");
    }
  }
  console.error("[api] Non-axios error:", error);
  throw error instanceof Error ? error : new Error(String(error));
}
