import type { PageLoad } from './$types';
import { api } from '$lib/api';

export const load: PageLoad = async ({ parent }) => {
    const { guilds } = await parent();
    const guildId = guilds[0].id; // For simplicity, use the first guild

    try {
        const config = await api.getGuildConfig(guildId);
        return { config, guildId };
    } catch (error) {
        return { error: 'Failed to fetch guild config', guildId };
    }
};