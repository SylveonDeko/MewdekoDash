// routes/api/[path]/+server.ts
import { MEWDEKO_API_KEY } from "$env/static/private";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import JSONbig from "json-bigint";
import { logger } from "$lib/logger";

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

  console.log('Request URL:', url);

  try {
    const text = await response.text();
    if (!text || text.length < 1) return json(null);

    try {
      const data = JSONbig.parse(text);

      if (!response.ok) {
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
      if (!response.ok) {
        return json({ error: text }, { status: response.status });
      }
      return json({ data: text });
    }
  } catch (error) {
    logger.error(`Error processing response from ${url}:`, error);
    return json({ error: "Failed to process response" }, { status: 500 });
  }
}

export const GET: RequestHandler = async ({ url, params, request }) => {
  const path = params.path;
  const instanceUrl = request.headers.get('x-instance-url');

  if (!instanceUrl) {
    return json({ error: "No instance URL provided" }, { status: 400 });
  }

  const finalUrl = `${instanceUrl}/${path}${url.search || ''}`;

  return makeRequest(finalUrl, "GET", {
    "X-API-Key": MEWDEKO_API_KEY,
  });
};

export const POST: RequestHandler = async ({ request, params }) => {
  const path = params.path;
  const instanceUrl = request.headers.get('x-instance-url');
  const url = new URL(request.url);

  if (!instanceUrl) {
    return json({ error: "No instance URL provided" }, { status: 400 });
  }

  let body;
  try {
    const text = await request.text();
    console.log("Raw request body:", text);

    if (text) {
      if (text === 'true' || text === 'false') {
        body = JSON.parse(text);
      } else {
        body = JSONbig.parse(text);
      }
    } else {
      console.log("Request body is empty");
      body = {};
    }
  } catch (error) {
    logger.error("Error parsing request body:", error);
    body = {};
  }

  const jsonBody = typeof body === 'boolean'
    ? JSON.stringify(body)
    : JSONbig.stringify(body);

  const finalUrl = `${instanceUrl}/${path}${url.search || ''}`;

  return makeRequest(
    finalUrl,
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
  const instanceUrl = request.headers.get('x-instance-url');
  const url = new URL(request.url);

  if (!instanceUrl) {
    return json({ error: "No instance URL provided" }, { status: 400 });
  }

  let body;
  try {
    const text = await request.text();
    console.log("Raw request body:", text);

    if (text) {
      body = JSONbig.parse(text);
    } else {
      console.log("Request body is empty");
      body = {};
    }
  } catch (error) {
    logger.error("Error parsing request body:", error);
    body = {};
  }

  const finalUrl = `${instanceUrl}/${path}${url.search || ''}`;

  return makeRequest(
    finalUrl,
    "PUT",
    {
      "X-API-Key": MEWDEKO_API_KEY,
      "Content-Type": "application/json",
    },
    JSONbig.stringify(body)
  );
};

export const PATCH: RequestHandler = async ({ request, params }) => {
  const path = params.path;
  const instanceUrl = request.headers.get('x-instance-url');
  const url = new URL(request.url);

  if (!instanceUrl) {
    return json({ error: "No instance URL provided" }, { status: 400 });
  }

  let body;
  try {
    body = await request.json();
  } catch (error) {}

  const finalUrl = `${instanceUrl}/${path}${url.search || ''}`;

  return makeRequest(
    finalUrl,
    "PATCH",
    {
      "X-API-Key": MEWDEKO_API_KEY,
      "Content-Type": "application/json",
    },
    body ? JSONbig.stringify(body) : undefined
  );
};

export const DELETE: RequestHandler = async ({ request, params }) => {
  const path = params.path;
  const instanceUrl = request.headers.get('x-instance-url');
  const url = new URL(request.url);

  if (!instanceUrl) {
    return json({ error: "No instance URL provided" }, { status: 400 });
  }

  let body;
  try {
    body = await request.json();
  } catch (error) {}

  const finalUrl = `${instanceUrl}/${path}${url.search || ''}`;

  return makeRequest(
    finalUrl,
    "DELETE",
    {
      "X-API-Key": MEWDEKO_API_KEY,
      "Content-Type": "application/json",
    },
    body ? JSONbig.stringify(body) : undefined
  );
};