import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getOrRefreshToken } from '$lib/server/discordApi';
import { setCookies, deleteCookies } from '../discordAuth';

export const POST: RequestHandler = async ({ cookies, locals }) => {
	try {
		// Get current tokens from cookies
		const accessToken = await getOrRefreshToken({ cookies, url: new URL('http://localhost') } as any, cookies);
		
		if (!accessToken) {
			// If no access token and refresh failed, return error
			return json({ success: false, error: 'No valid tokens' }, { status: 401 });
		}
		
		// If we got here, tokens are valid or were successfully refreshed
		// Return success with user data if available
		return json({ 
			success: true, 
			user: locals.user,
			message: 'Tokens are valid'
		});
		
	} catch (error) {
		console.error('Token refresh error:', error);
		return json({ 
			success: false, 
			error: error instanceof Error ? error.message : 'Unknown error' 
		}, { status: 401 });
	}
};