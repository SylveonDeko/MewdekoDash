// lib/api/core.ts
import JSONbig from "json-bigint";
import { get } from "svelte/store";
import { currentInstance } from "$lib/stores/instanceStore";

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

  try {
    return JSONbig.parse(responseText) as T;
  } catch (err) {
    throw new Error("Failed to parse JSON response.", { cause: err });
  }
}
