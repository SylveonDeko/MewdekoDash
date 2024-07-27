    import type {GuildConfig, ChatTriggers, SuggestionsModel, BotStatusModel} from '$lib/types/models';
    import JSONbig from 'json-bigint'

    async function apiRequest<T>(endpoint: string, method: string = 'GET', body?: any): Promise<T> {
        const response = await fetch(`/api/${endpoint}`, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: body ? JSONbig.stringify(body) : undefined,
        });

        if (!response.ok) {
            console.error(`API error: ${response.status} ${response.statusText}`);
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const text = await response.text();

        try {
                return JSONbig.parse(text) as T;
        } catch (error) {
            console.error('Error parsing response:', error);
            return text as unknown as T;
        }
    }

    export const api = {
        getAfkStatus: (guildId: string, userId: string) =>
            apiRequest<{ message: string }>(`afk/${guildId}/${userId}`),
        setAfkStatus: (guildId: bigint, userId: bigint, message: string)    =>
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

        getGuildConfig: (guildId: bigint) =>
            apiRequest<GuildConfig>(`guildconfig/${guildId}`),
        updateGuildConfig: (guildId: bigint, config: GuildConfig) =>
            apiRequest<void>(`guildconfig/${guildId }`, 'POST', config),

        getSuggestions: (guildId: bigint) =>
            apiRequest<SuggestionsModel[]>(`suggestions/${guildId}`),
        deleteSuggestion: (guildId: bigint, id: number) =>
            apiRequest<void>(`suggestions/${guildId}/${id}`, 'DELETE'),
        updateSuggestionStatus: (guildId: bigint, suggestionId: bigint, update: {
            state: number,
            reason: string | null,
            userId: bigint
        }) =>
            apiRequest<void>(`suggestions/${guildId}/${suggestionId}`, 'PATCH', update),


        getGuildRoles: (guildId: string) =>
            apiRequest<Array<{ id: string, name: string }>>(`ClientOperations/roles/${guildId}`),

        getBotGuilds: () =>
            apiRequest<Array<bigint>>('ClientOperations/guilds'),

        getUser: (guildId: bigint, userId: bigint) =>
            apiRequest<any>(`ClientOperations/user/${guildId}/${userId}`),

        getBotStatus: () =>
            apiRequest<BotStatusModel>('BotStatus')
    };