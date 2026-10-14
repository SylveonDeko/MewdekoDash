---
title: Logging
slug: logging
summary: Send a record of joins, leaves, edits, deletions, bans, role and channel changes and more to the log channels you choose, with per-event routing and channel exclusions.
icon: fa-file
category: Security
dashboard: /dashboard/logging
module: Administration
tags: [logging, logs, audit, events, message deleted, message edited, join leave, mod log, ignored channels]
related: [moderation, administration, filter]
---

## What it does

Logging watches the events Discord sends the bot and posts a summary of each one to a text channel you pick. A deleted message shows who wrote it and what it said. A member joining shows their account age. A role change shows which roles were added or removed. Where the bot can read the audit log, it also names the staff member who did it.

Every event type has its own channel setting, so you can send message edits to one channel, moderation actions to another, and leave the rest switched off. Nothing is logged until you assign a channel, and an event type whose channel is empty is silently skipped.

Channels can also be excluded. An ignored channel produces no message, thread or voice logs at all, which keeps staff rooms and bot spam channels out of the record.

## Why you would use it

- Keep a copy of deleted and edited messages so moderators can see what was removed after the fact.
- Track who joined and left, including account creation dates, to spot raids and alt accounts.
- Record bans, unbans and mutes with the responsible moderator for accountability.
- Watch for role, channel and permission changes made by other admins or compromised accounts.
- Follow voice activity in servers where voice channels are the main hangout.

## Log event types

Each type can point at a different channel or be left off. These are the values accepted by `log` and shown on the dashboard.

| Type | Dashboard label | Logged when |
| --- | --- | --- |
| `MessageUpdated` | Message Updated | A message's content is edited (bot authors and unchanged content are skipped) |
| `MessageDeleted` | Message Deleted | A message is deleted |
| `MessagesBulkDeleted` | Messages Bulk Deleted | Several messages are purged at once, with a count of how many were cached |
| `ReactionEvents` | Reaction Events | Reactions are added or removed, batched per message every five seconds |
| `ThreadCreated` | Thread Created | A thread is created |
| `ThreadDeleted` | Thread Deleted | A thread is deleted |
| `ThreadUpdated` | Thread Updated | A thread's name, archive status or similar changes |
| `UsernameUpdated` | Username Updated | A member's global username changes |
| `NicknameUpdated` | Nickname Updated | A member's server nickname changes |
| `UserUpdated` | User Updated | A member's profile, such as avatar or global name, changes |
| `UserJoined` | User Joined | A member joins the server |
| `UserLeft` | User Left | A member leaves or is kicked |
| `UserRoleAdded` | User Role Added | One or more roles are given to a member |
| `UserRoleRemoved` | User Role Removed | One or more roles are taken from a member |
| `UserBanned` | User Banned | A member is banned |
| `UserUnbanned` | User Unbanned | A ban is lifted |
| `UserMuted` | User Muted | A member is muted in voice or text |
| `VoicePresence` | Voice Presence | A member joins, leaves, moves, mutes, deafens or streams in voice |
| `VoicePresenceTts` | Voice Presence TTS | A member may have used text to speech in voice; detection is best effort |
| `ServerUpdated` | Server Updated | Server settings such as name, icon or owner change |
| `EventCreated` | Event Created | A scheduled server event is created |
| `InviteCreated` | Invite Created | An invite is created, with its max age and uses |
| `InviteDeleted` | Invite Deleted | An invite is deleted |
| `RoleCreated` | Role Created | A role is created |
| `RoleDeleted` | Role Deleted | A role is deleted |
| `RoleUpdated` | Role Updated | A role's name, colour or permissions change |
| `ChannelCreated` | Channel Created | A channel is created |
| `ChannelDestroyed` | Channel Destroyed | A channel is deleted |
| `ChannelUpdated` | Channel Updated | A channel's name, topic or permissions change |
| `Other` | Other | Miscellaneous events not covered above |

The dashboard also shows an **Avatar Updated** entry. It is stored alongside the others and is set by the Users and All categories, but it is not a value you can pass to the `log` command.

## Categories

`logcategory` sets a whole group of types to one channel in a single step. Running it without a channel clears every type in that group.

| Category | Types it sets |
| --- | --- |
| `All` | Every type above |
| `Users` | NicknameUpdated, AvatarUpdated, UsernameUpdated, UserRoleAdded, UserRoleRemoved, VoicePresence, UserJoined, UserLeft, UserUpdated |
| `Threads` | ThreadCreated, ThreadDeleted, ThreadUpdated |
| `Roles` | RoleCreated, RoleDeleted, RoleUpdated |
| `Server` | ServerUpdated, EventCreated, InviteCreated, InviteDeleted |
| `Channel` | ChannelCreated, ChannelDestroyed, ChannelUpdated |
| `Messages` | MessageDeleted, MessageUpdated, MessagesBulkDeleted, ReactionEvents |
| `Moderation` | UserMuted, UserBanned, UserUnbanned, Other |
| `None` | Clears every type (used by the dashboard's **Disable All**) |

## Ignored channels

Any channel on the ignore list is skipped for message, thread, channel and voice events that happen inside it. Threads inherit the setting from their parent channel, so ignoring a forum or text channel also ignores its threads. Ignoring a voice channel suppresses voice presence logs for joins to and leaves from that channel.

Ignoring a channel does not stop member, role or server events, since those are not tied to a channel.

## Settings

The Logging page has two tabs, **Log Channels** and **Ignored Channels**.

| Setting | Default | What it controls |
| --- | --- | --- |
| Log Channels | none | One channel picker per event type, grouped by Popular, Users, Messages, Moderation, Server, Channels, Roles, Threads, Voice and All Events |
| Clear Category | | Empties every picker in the group you are viewing; takes effect when you **Save Configuration** |
| Clear All | | Shown in the **All Events** group; empties every picker, applied on save |
| Disable All | | Header button shown while any channel is set; unassigns every event type immediately after confirmation, keeping ignored channels |
| Ignored Channels | none | Channels excluded from logging, moved between the **Active Channels** and **Ignored Channels** lists |

> [!TIP]
> The **Popular** group holds User Joined, User Left, Message Deleted, Message Updated, User Banned, User Unbanned, Channel Created and Channel Destroyed. It is a good starting set for most servers.

## Setup walkthrough

1. Create one or more private log channels that only staff can read.
2. Open **Logging** in the dashboard and stay on the **Log Channels** tab.
3. In the **Popular** group, pick your log channel for each event you want, then save.
4. Switch to other groups such as **Moderation** or **Voice** and assign channels for anything else you need.
5. Open the **Ignored Channels** tab and move staff rooms and bot command channels to the ignored list.
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
| `commandlogchannel [#channel]` | `commandlog`, `logcommands` | Administrator | Log bot command usage to a channel, or turn it off with no channel |

> [!EXAMPLE]
> `log "#mod-logs:UserBanned,UserUnbanned,UserMuted" "#message-logs:MessageDeleted,MessageUpdated"`

## Tips and gotchas

- Give the bot **View Audit Log**. Without it, logs still post but cannot say which moderator deleted a message, banned someone or changed a role.
- The bot must be able to view and send messages in each log channel. A log channel it cannot see is skipped without an error.
- Deleted and edited message logs depend on the bot's message cache. Messages sent before the bot last restarted, or in bulk purges, may show as uncached.
- Reaction logs are grouped: all reaction changes on a message within about five seconds arrive as one entry, to avoid flooding busy servers.
- The select menu opened by `log #channel` lists up to 25 types per menu and preselects the ones already sent to that channel.
- `logcategory` overwrites every type in the category, including ones you had routed elsewhere. Use `log` for single types afterwards.
