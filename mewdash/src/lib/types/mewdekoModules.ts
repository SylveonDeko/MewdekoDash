export type Module = {
    Name: string,
    Commands: Command[]
};

export type Command = {
    ChannelBotPermissions: string,
    ChannelUserPermissions: string,
    CommandName: string,
    Description: string,
    Example: string[],
    GuildBotPermissions: string,
    GuildUserPermissions: string,
    IsDragon: boolean
}