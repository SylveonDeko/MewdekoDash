import { MEWDEKO_API_URL, MEWDEKO_API_KEY } from '$env/static/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
    const { guildId, userId } = params;
    const response = await fetch(`${MEWDEKO_API_URL}/afk/${guildId}/${userId}`, {
        headers: {
            'X-API-Key': MEWDEKO_API_KEY,
        },
    });

    if (response.status === 404) {
        return json({ error: 'AFK status not found' }, { status : 404 });
    }

    if (!response.ok) {
        return json({ error: 'API error' }, { status: response.status });
    }

    const data = await response.json();
    return json(data);
};

export const POST: RequestHandler = async ({ request, params }) => {
    const { guildId, userId } = params;

    try {
        const body = await request.json();
        const message = body?.message;

        const response = await fetch(`${MEWDEKO_API_URL}/afk/${guildId}/${userId}?message=${body}`, {
            method: 'POST',
            headers: {
                'X-API-Key': MEWDEKO_API_KEY,
                'Content-Type': 'application/json',
            }
        });

                    if (!response.ok) {
            return json({ error: 'API error' }, { status: response.status });
        }

        return json({ success: true });
    } catch (error) {
        console.error('Error processing request:', error);
        return json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }
};

export const DELETE: RequestHandler = async ({ params }) => {
    const { guildId, userId } = params;
    const response = await fetch(`${MEWDEKO_API_URL}/afk/${guildId}/${userId}`, {
        method: 'DELETE',
        headers: {
            'X-API-Key': MEWDEKO_API_KEY,
        },
    });

    if (!response.ok) {
        return json({ error: 'API error' }, { status: response.status });
    }

    return json({ success: true });
};