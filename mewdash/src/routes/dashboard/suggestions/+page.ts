import type { PageLoad } from './$types';
import { api } from '$lib/api';

export const load: PageLoad = async ({ parent }) => {
    const { guilds } = await parent();
    const guildId = guilds[0].id; // For simplicity, use the first guild

    try {
        const suggestions = await api.getSuggestions(guildId);
        return { suggestions, guildId };
    } catch (error) {
        return { error: 'Failed to fetch suggestions', guildId };
    }
};