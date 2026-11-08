---
title: Logging
slug: logging
summary: Records what happens in your server, such as joins and deleted messages, in the log channels you pick
icon: fa-file
category: Security
dashboard: /dashboard/logging
module: Administration
tags: [logging, logs, audit, events, message deleted, message edited, join leave, mod log, ignored channels, ignore bots, setup, export, import]
related: [moderation, administration, filter]
---

## What it does

Logging watches the events Discord sends the bot and posts a summary of each one to a text channel you pick. A deleted message shows who wrote it and what it said, and a role change shows which roles were added or removed. Where the bot can read the audit log, it also names the staff member who did it.

Every event type has its own channel setting, so you can send message edits to one channel and moderation actions to another, leaving the rest switched off. Nothing is logged until you assign a channel, and an event type whose channel is empty is silently skipped.

Channels can also be excluded. An ignored channel produces no message or thread logs, and no voice logs either, which keeps staff rooms and bot spam channels out of the record.

## Why you would use it

- Keep a copy of deleted and edited messages so moderators can see what was removed after the fact.
- Track who joined and left, including account creation dates, to spot raids and alt accounts.
- Record bans, unbans, mutes and timeouts with the responsible moderator for accountability.
- Watch for role and permission changes made by other admins or compromised accounts.
- Follow voice activity in servers where voice channels are the main hangout.

## Log event types

Each type can point at a different channel or be left off. The type names are the values accepted by `log`. The dashboard label is what you see in the **Per event** lists.

| Type | Dashboard label | Logged when |
| --- | --- | --- |
| `MessageUpdated` | Message edited | A message's content is edited (bot authors and unchanged content are skipped) |
| `MessageDeleted` | Message deleted | A message is deleted |
| `MessagesBulkDeleted` | Messages bulk deleted | Several messages are purged at once, with a count of how many were cached |
| `ReactionEvents` | Reactions | Reactions are added or removed, batched per message every five seconds |
| `InviteLinkPosted` | Invite link posted | A message containing a Discord invite link is posted |
| `UserJoined` | Member joined | A member joins the server |
| `UserLeft` | Member left | A member leaves or is kicked |
| `UserUpdated` | Profile updated | A member's profile, such as avatar or global name, changes |
| `UsernameUpdated` | Username changed | A member's global username changes |
| `NicknameUpdated` | Nickname changed | A member's server nickname changes |
| `AvatarUpdated` | Avatar changed | A member's avatar changes |
| `UserRoleAdded` | Role added to member | One or more roles are given to a member |
| `UserRoleRemoved` | Role removed from member | One or more roles are taken from a member |
| `UserBanned` | Member banned | A member is banned |
| `UserUnbanned` | Member unbanned | A ban is lifted |
| `UserMuted` | Member muted | A member is muted in voice or text |
| `UserTimedOut` | Member timed out | A member is timed out |
| `UserTimeoutRemoved` | Timeout removed | A member's timeout is removed early |
| `AutoModRuleChanged` | Auto moderation rule changed | An AutoMod rule is created, changed or deleted |
| `VoicePresence` | Voice activity | A member joins, leaves, moves, mutes, deafens or streams in voice |
| `VoicePresenceTts` | Voice text-to-speech | A member may have used text to speech in voice; detection is best effort |
| `StageChanged` | Stage changed | A stage is started, changed or ended |
| `ChannelCreated` | Channel created | A channel is created |
| `ChannelUpdated` | Channel updated | A channel's name, topic or similar properties change |
| `ChannelDestroyed` | Channel deleted | A channel is deleted |
| `ChannelPermissionsUpdated` | Channel permissions changed | A channel permission overwrite is added, changed or removed |
| `ThreadCreated` | Thread created | A thread is created |
| `ThreadUpdated` | Thread updated | A thread's name, archive status or similar changes |
| `ThreadDeleted` | Thread deleted | A thread is deleted |
| `ThreadMemberChanged` | Thread members changed | A member joins or leaves a thread |
| `RoleCreated` | Role created | A role is created |
| `RoleUpdated` | Role updated | A role's name, colour or permissions change |
| `RoleDeleted` | Role deleted | A role is deleted |
| `ServerUpdated` | Server updated | Server settings such as name, icon or owner change |
| `ServerBoosted` | Server boosted | A member boosts the server |
| `EventCreated` | Event created | A scheduled server event is created |
| `ScheduledEventChanged` | Event changed | A scheduled event is changed or deleted |
| `InviteCreated` | Invite created | An invite is created, with its max age and uses |
| `InviteDeleted` | Invite deleted | An invite is deleted |
| `EmojiCreated` | Emoji created | A custom emoji is created |
| `EmojiUpdated` | Emoji updated | A custom emoji is renamed or has its roles changed |
| `EmojiDeleted` | Emoji deleted | A custom emoji is deleted |
| `StickerCreated` | Sticker created | A custom sticker is created |
| `StickerUpdated` | Sticker updated | A custom sticker is edited |
| `StickerDeleted` | Sticker deleted | A custom sticker is deleted |
| `SoundboardChanged` | Soundboard changed | A soundboard sound is added, changed or removed |
| `IntegrationChanged` | Integration changed | An integration is added, changed or removed |
| `WebhookChanged` | Webhook changed | A webhook is created, changed or deleted |
| `Other` | Other | Miscellaneous events not covered above |

## Categories

`logcategory` sets a whole group of types to one channel in a single step. Running it without a channel clears every type in that group.

| Category | Types it sets |
| --- | --- |
| `All` | Every type above |
| `Users` | NicknameUpdated, AvatarUpdated, UsernameUpdated, UserRoleAdded, UserRoleRemoved, VoicePresence, UserJoined, UserLeft, UserUpdated |
| `Threads` | ThreadCreated, ThreadDeleted, ThreadUpdated, ThreadMemberChanged |
| `Roles` | RoleCreated, RoleDeleted, RoleUpdated |
| `Server` | ServerUpdated, EventCreated, InviteCreated, InviteDeleted, EmojiCreated, EmojiUpdated, EmojiDeleted, StickerCreated, StickerUpdated, StickerDeleted, ServerBoosted, IntegrationChanged, WebhookChanged, StageChanged, ScheduledEventChanged, SoundboardChanged |
| `Channel` | ChannelCreated, ChannelDestroyed, ChannelUpdated, ChannelPermissionsUpdated |
| `Messages` | MessageDeleted, MessageUpdated, MessagesBulkDeleted, ReactionEvents, InviteLinkPosted |
| `Moderation` | UserTimedOut, UserTimeoutRemoved, UserMuted, UserBanned, UserUnbanned, Other, AutoModRuleChanged |
| `None` | Clears every type (used by the dashboard's **Disable all**) |

## Ignored channels, bots and prefixes

Any channel on the ignore list is skipped for message, thread, channel and voice events that happen inside it. Threads inherit the setting from their parent channel, so ignoring a forum or text channel also ignores its threads. Ignoring a voice channel suppresses voice presence logs for joins to and leaves from that channel.

Ignoring a channel does not stop events that are not tied to a channel, such as member or role events.

Logs skip actions by bots by default. Message edit and delete logs are also skipped for messages that start with an ignored prefix, which is useful for bot command prefixes.

## Settings

The Logging page is one page of cards. There are no tabs. Changes save as you make them, and if a save fails the last change is undone.

| Card | What it holds |
| --- | --- |
| Setup | Three buttons: **Create log channels**, **Export** and **Import** |
| Messages, Members, Moderation, Voice, Channels, Threads, Roles, Server, Other | One card per group of event types. Each has a channel picker for the whole group and a **Per event** list to route single types. |
| Ignore | **Ignored channels**, **Ignore bots** and **Ignored message prefixes** |

### Setup card

- **Create log channels** creates a private **Logs** category with channels for each kind of log and points every log type at them. If any type already has a channel, it asks for confirmation first, because the current channels are replaced. The bot needs Manage Channels.
- **Export** shows a setup code you can copy with **Copy to clipboard**. It says there is nothing to export if no channel is set.
- **Import** takes a pasted setup code and applies it. After it finishes you see how many log types were imported.

### Group cards

The picker at the top of a group card sets every type in that group to one channel. Its placeholder reads **Different channels** when the types in the group point at different channels. Clearing the picker unassigns the whole group.

Open **Per event** to see how many types are set, shown as "N of M set", and to choose a channel for each event on its own. A group with a single type has no **Per event** list.

### Ignore card

| Setting | Default | What it controls |
| --- | --- | --- |
| Ignored channels | none | Channels excluded from logging |
| Ignore bots | on | Skips logs for actions taken by bots |
| Ignored message prefixes | none | Messages starting with one of these are left out of edit and delete logs. Prefixes are up to 20 characters, and the same prefix cannot be added twice. Press Enter or **Add**. |

### Disable all

While at least one event type has a channel, the page header shows **Disable all**. After confirmation it unassigns every event type at once. Ignored channels are kept.

## Setup walkthrough

1. Open **Logging** in the dashboard.
2. Press **Create log channels** in the **Setup** card for a ready-made private **Logs** category, or create your own private log channels that only staff can read.
3. If you made your own, pick the channel in each group card, such as **Messages** or **Members**. Open **Per event** to send single events somewhere else.
4. In the **Ignore** card, add staff rooms and bot command channels to **Ignored channels**, and add your bot command prefixes under **Ignored message prefixes**.
5. Press **Export** to keep a setup code for another server.
6. Delete a test message and confirm the log appears in the right channel.

## Commands

Run these with your server's prefix (`.` unless you changed it). Slash versions live under `/log`.

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `log <type> [#channel]` | | Administrator | Send one event type to a channel; with no channel, the current channel is used |
| `log #channel [types...]` | | Administrator | Send several types to one channel, or open a select menu of all types if none are given |
| `log "#channel:Type1,Type2" ...` | | Administrator | Set several channel and type pairs in one message |
| `logcategory <category> [#channel]` | `logcat` | Administrator | Point a whole category at a channel, or clear it with no channel |
| `logevents` | | Administrator | List every event type and the channel it currently uses |
| `logignore [#channel]` | `lignore` | Administrator | Toggle a channel on or off the ignore list; defaults to the current channel |
| `logignorelist` | `lignorel` | Administrator | Show the ignore list |
| `logignorebots` | `logbots`, `lbots` | Administrator | Toggle whether logs skip actions by bots |
| `logprefix [prefixes]` | `lprefix` | Administrator | Skip edit and delete logs for messages starting with these prefixes. Use `none` to clear them. |
| `logsetup` | `lsetup` | Administrator, bot needs Manage Channels | Create the private **Logs** category and route every type to it |
| `logexport` | `lexport` | Administrator | Export the setup as a code and a JSON file |
| `logimport [code]` | `limport` | Administrator | Import a setup from a code or an attached JSON file |
| `commandlogchannel [#channel]` | `commandlog`, `logcommands` | Administrator | Log bot command usage to a channel, or turn it off with no channel |

> [!EXAMPLE]
> `log "#mod-logs:UserBanned,UserUnbanned,UserMuted" "#message-logs:MessageDeleted,MessageUpdated"`

## Tips and gotchas

- Give the bot **View Audit Log**. Without it, logs still post but cannot say which moderator deleted a message or banned someone.
- The bot must be able to view and send messages in each log channel. A log channel it cannot see is skipped without an error.
- Deleted and edited message logs depend on the bot's message cache. Messages sent before the bot last restarted, or in bulk purges, may show as uncached.
- Reaction logs are grouped: all reaction changes on a message within about five seconds arrive as one entry, to avoid flooding busy servers.
- The select menu opened by `log #channel` lists up to 25 types per menu and preselects the ones already sent to that channel.
- `logcategory` overwrites every type in the category, including ones you had routed elsewhere. Use `log` for single types afterwards.
- Dashboard groups do not match `logcategory` categories exactly. For example the dashboard puts **Voice activity** in its own **Voice** group, while `Users` includes it.
- Import matches channels by ID first, then by name, so a setup code can be reused in another server with similarly named channels.
