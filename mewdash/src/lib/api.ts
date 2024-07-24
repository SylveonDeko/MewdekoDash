    import type { GuildConfig, ChatTriggers } from '$lib/types/models';

    async function apiRequest<T>(endpoint: string, method: string = 'GET', body?: any): Promise<T> {
        const response = await fetch(`/api/${endpoint}`, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: body ? JSON.stringify(body) : undefined,
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        return response.json();
    }

    export const api = {
        getAfkStatus: (guildId: string, userId: string) =>
            apiRequest<{ message: string }>(`afk/${guildId}/${userId}`),
        setAfkStatus: (guildId: bigint, userId: bigint, message: string) =>
            apiRequest<void>(`afk/${guildId}/${userId}`, 'POST', message),
        deleteAfkStatus: (guildId: bigint, userId: bigint) =>
            apiRequest<void>(`afk/${guildId}/${userId}`, 'DELETE'),
        getAllAfkStatus: (guildId: string) =>
            apiRequest<Array<{
                userId: bigint,
                username: string,
                nickname: string | null,
                avatarUrl: string,
                afkStatus: {
                    userId: bigint,
                    guildId: bigint,
                    message: string,
                    wasTimed: boolean,
                    when: string,
                    id: number,
                    dateAdded: string
                } | null
            }>>(`afk/${guildId}`), getChatTriggers: (guildId: string) =>
            apiRequest<ChatTriggers[]>(`chattriggers/${guildId}`),

        deleteChatTrigger: (guildId: string, triggerId: string) =>
            apiRequest<void>(`chattriggers/${guildId}/${triggerId}`, 'DELETE'),
        updateChatTrigger: (guildId: string, trigger: ChatTriggers) =>
            apiRequest<void>(`chattriggers/${guildId}`, 'PATCH', trigger),
        addChatTrigger: (guildId: string, trigger: Omit<ChatTriggers, 'id'>) =>
            apiRequest<ChatTriggers>(`chattriggers/${guildId}`, 'POST', trigger),

        getGuildConfig: (guildId: string) =>
            apiRequest<GuildConfig>(`guildconfig/${guildId}`),
        updateGuildConfig: (guildId: string, config: GuildConfig) =>
            apiRequest<void>(`guildconfig/${guildId}`, 'POST', config),

        getSuggestions: (guildId: string, userId?: string) =>
            apiRequest<any[]>(`suggestions/${guildId}${userId ? `/${userId}` : ''}`),
        deleteSuggestion: (guildId: string, id: string) =>
            apiRequest<void>(`suggestions/${guildId}/${id}`, 'DELETE'),

        getGuildRoles: (guildId: string) =>
            apiRequest<Array<{ id: string, name: string }>>(`ClientOperations/roles/${guildId}`),

        getBotGuilds: () =>
            apiRequest<Array<string>>('ClientOperations/guilds'),

    };