import { MEWDEKO_API_URL, MEWDEKO_API_KEY } from '$env/static/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import JSONbig from 'json-bigint'
import {ok} from "node:assert";

async function makeRequest(url: string, method: string, headers: HeadersInit, body?: BodyInit) {
    const response = await fetch(url, {
        method,
        headers,
        body,
    });

    if (!response.ok) {
        return json({ error: 'API error' }, { status: response.status });
    }

    try {
        const text = await response.text();
        if (method === "POST" || method === "DELETE")
            return json(null)   ;
        const data = JSONbig.parse(text);
        return json(data)
    } catch (error) {
        console.error('Error parsing response:', error);
        return json({ error: 'Failed to parse response' }, { status: 500 });
    }
}


export const GET: RequestHandler = async ({ url, params }) => {
    const path = params.path;
    return makeRequest(
        `${MEWDEKO_API_URL}/${path}${url.search}`,
        'GET',
        { 'X-API-Key': MEWDEKO_API_KEY }
    );
};

export const POST: RequestHandler = async ({ request, params }) => {
    const path = params.path;
    let body;
    try {
        body = await request.json();
    } catch (error) {
        console.error('Error parsing request body:', error);
    }

    return makeRequest(
        `${MEWDEKO_API_URL}/${path}`,
        'POST',
        {
            'X-API-Key': MEWDEKO_API_KEY,
            'Content-Type': 'application/json',
        },
        body ? JSONbig.stringify(body) : undefined
    );
};

export const PATCH: RequestHandler = async ({ request, params }) => {
    const path = params.path;
    let body;
    try {
        body = await request.json();
    } catch (error) {
    }

    return makeRequest(
        `${MEWDEKO_API_URL}/${path}`,
        'PATCH',
        {
            'X-API-Key': MEWDEKO_API_KEY,
            'Content-Type': 'application/json',
        },
        body ? JSONbig.stringify(body) : undefined
    );
};

export const DELETE: RequestHandler = async ({ params }) => {
    const path = params.path;
    return makeRequest(
        `${MEWDEKO_API_URL}/${path}`,
        'DELETE',
        { 'X-API-Key': MEWDEKO_API_KEY }
    );
};