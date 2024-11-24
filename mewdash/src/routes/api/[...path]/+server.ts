// routes/api/[path]/+server.ts
import { MEWDEKO_API_URL, MEWDEKO_API_KEY } from "$env/static/private";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import JSONbig from "json-bigint";

async function makeRequest(
  url: string,
  method: string,
  headers: HeadersInit,
  body?: BodyInit,
) {
  const response = await fetch(url, {
    method,
    headers,
    body,
  });

  try {
    const text = await response.text();
    if (!text || text.length < 1) return json(null);

    // Try to parse the response as JSON
    try {
      const data = JSONbig.parse(text);

      // If response is not ok, handle the error details
      if (!response.ok) {
        // Handle ValidationProblemDetails format
        if (data.errors || data.title || data.status) {
          return json({
            error: {
              message: data.title || "API error",
              status: data.status,
              errors: data.errors,
              type: data.type
            }
          }, { status: response.status });
        }
        return json({ error: "API error", details: data }, { status: response.status });
      }

      return json(data);
    } catch (jsonError) {
      // If JSON parsing fails, return the raw text
      if (!response.ok) {
        return json({ error: text }, { status: response.status });
      }
      return json({ data: text });
    }
  } catch (error) {
    console.error(`Error processing response from ${url}:`, error);
    return json({ error: "Failed to process response" }, { status: 500 });
  }
}

export const GET: RequestHandler = async ({ url, params }) => {
  const path = params.path;
  return makeRequest(`${MEWDEKO_API_URL}/${path}${url.search}`, "GET", {
    "X-API-Key": MEWDEKO_API_KEY,
  });
};

export const POST: RequestHandler = async ({ request, params }) => {
  const path = params.path;
  let body;

  try {
    const text = await request.text();
    console.log("Raw request body:", text);

    if (text) {
      // Ensure we're parsing booleans correctly
      if (text === 'true' || text === 'false') {
        body = JSON.parse(text); // This will properly parse it as a boolean
      } else {
        body = JSONbig.parse(text);
      }
    } else {
      console.log("Request body is empty");
      body = {};
    }
  } catch (error) {
    console.error("Error parsing request body:", error);
    body = {};
  }

  // Ensure we're stringifying the body correctly
  const jsonBody = typeof body === 'boolean'
    ? JSON.stringify(body)  // Use regular JSON.stringify for booleans
    : JSONbig.stringify(body);

  return makeRequest(
    `${MEWDEKO_API_URL}/${path}`,
    "POST",
    {
      "X-API-Key": MEWDEKO_API_KEY,
      "Content-Type": "application/json",
    },
    jsonBody
  );
};

export const PUT: RequestHandler = async ({ request, params }) => {
  const path = params.path;
  let body;
  try {
    const text = await request.text();
    console.log("Raw request body:", text);

    if (text) {
      body = JSONbig.parse(text);
    } else {
      console.log("Request body is empty");
      body = {}; // Use an empty object if the body is empty
    }
  } catch (error) {
    console.error("Error parsing request body:", error);
    // Use an empty object if there's an error parsing JSON
    body = {};
  }

  return makeRequest(
    `${MEWDEKO_API_URL}/${path}`,
    "PUT",
    {
      "X-API-Key": MEWDEKO_API_KEY,
      "Content-Type": "application/json",
    },
    JSONbig.stringify(body),
  );
};

export const PATCH: RequestHandler = async ({ request, params }) => {
  const path = params.path;
  let body;
  try {
    body = await request.json();
  } catch (error) {}

  return makeRequest(
    `${MEWDEKO_API_URL}/${path}`,
    "PATCH",
    {
      "X-API-Key": MEWDEKO_API_KEY,
      "Content-Type": "application/json",
    },
    body ? JSONbig.stringify(body) : undefined,
  );
};

export const DELETE: RequestHandler = async ({ request, params }) => {
  const path = params.path;
  let body;
  try {
    body = await request.json();
  } catch (error) {}

  return makeRequest(
    `${MEWDEKO_API_URL}/${path}`,
    "DELETE",
    {
      "X-API-Key": MEWDEKO_API_KEY,
      "Content-Type": "application/json",
    },
    body ? JSONbig.stringify(body) : undefined,
  );
};
