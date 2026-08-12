// lib/api/core.ts
import JSONbig from "json-bigint";
import { get } from "svelte/store";
import { currentInstance } from "$lib/stores/instanceStore";

/**
 * A non-2xx response from the bot API. Carries the status and the parsed error
 * body alongside the message, so callers can branch on either.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;
  readonly error: unknown;

  constructor(message: string, status: number, body: unknown, error: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
    this.error = error;
  }
}

/**
 * Pulls a human-readable message out of the shapes the `/api` proxy produces for
 * failed requests, falling back to the raw body and then to the status code.
 */
function errorMessageFrom(parsed: any, responseText: string, status: number): string {
  const error = parsed?.error;

  if (typeof error === "string" && error.trim()) return error;
  if (typeof error?.message === "string" && error.message.trim()) return error.message;
  if (typeof parsed?.message === "string" && parsed.message.trim()) return parsed.message;
  if (responseText.trim()) return responseText.trim().slice(0, 500);

  return `Request failed with status ${status}`;
}

/**
 * Makes an API request to the Mewdeko backend.
 *
 * The destination is identified by the selected instance's port only; the
 * `/api` proxy resolves that port to a URL server-side using the host the bot
 * registered itself under. Omitting the header lets the proxy fall back to the
 * single registered instance.
 * @template T The expected response type
 * @param endpoint The API endpoint (without /api/ prefix)
 * @param method The HTTP method (default: GET)
 * @param body The request body
 * @param headers Additional headers
 * @param customFetch Custom fetch function (mainly for SSR)
 * @returns Promise resolving to the typed response
 */
export async function apiRequest<T>(
  endpoint: string,
  method: string = "GET",
  body?: unknown,
  headers: HeadersInit = {},
  customFetch: typeof fetch = fetch,
): Promise<T> {
  const instance = get(currentInstance);

  const response = await customFetch(`/api/${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(instance ? { "X-Instance-Port": instance.port.toString() } : {}),
      ...headers,
    },
    body: body ? JSONbig.stringify(body) : null,
  });

  const responseText = await response.text();

  let parsed: any = null;
  let parseError: unknown = null;

  if (responseText) {
    try {
      parsed = JSONbig.parse(responseText);
    } catch (err) {
      parseError = err;
    }
  }

  if (!response.ok) {
    throw new ApiError(
      errorMessageFrom(parsed, responseText, response.status),
      response.status,
      parseError ? responseText : parsed,
      parsed?.error,
    );
  }

  if (parseError) {
    throw new Error("Failed to parse JSON response.", { cause: parseError });
  }

  return parsed as T;
}
