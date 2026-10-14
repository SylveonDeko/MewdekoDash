---
title: Twitch Bot
slug: twitch
summary: Run Mewdeko inside your own Twitch chat with custom commands, timers, quotes and counters, and route subs, raids, channel point redemptions and go-live events into Discord.
icon: fa-brands fa-twitch
category: Community
dashboard: /dashboard/twitch
module: Twitch
tags: [twitch, chat bot, streamer, commands, timers, quotes, counters, channel points, redemptions, subs, raids, account link, role sync, eventsub]
related: [streams, administration]
---

## What it does

The Twitch Bot connects one Twitch channel to your Discord server and lets Mewdeko act as a chat bot inside that channel. Viewers type `!ping`, `!quote`, `!counter deaths` or your own custom commands in Twitch chat, and the bot answers there. Timers post repeating messages while you are live, quotes and counters are stored per server, and channel point rewards can trigger a chat reply or a Discord post.

Events from the channel flow back into Discord. When the channel goes live, a go-live post is sent to a Discord channel; subscriptions, gifted subs and raids can each post to their own channel with your own template, and an end-of-stream recap can summarise duration, peak viewers, chat messages, subs and raids.

Viewers can link their Twitch account to their Discord account. Once linked, the bot knows which Discord member is chatting on Twitch, and role sync can hand out Discord roles to subscribers, VIPs, mods or the broadcaster.

> [!NOTE]
> This is not the same as Stream Alerts. Stream Alerts only watches public channels on several platforms and announces when they go live. The Twitch Bot needs you to authorise your own Twitch account and gives the bot a presence in your chat. If both are set up for the same Twitch channel, the Twitch Bot's go-live post replaces the Stream Alerts one so you do not get duplicates.

## Why you would use it

- You stream on Twitch and want one bot for both your Discord and your Twitch chat, with the same custom commands and socials in both places.
- You want subs and raids celebrated in Discord as they happen.
- You want subscriber or VIP roles on Discord without handing them out by hand.
- You want a hydrate or stretch channel point reward to actually say something in chat and log to Discord.
- Your mods need a shoutout command, a raid target picker and a quote list that survives between streams.

## Connecting

Two Twitch authorisations are involved, both done from the **Setup** tab, **Connect** sub-tab.

| Authorisation | Who does it | What it grants |
| --- | --- | --- |
| Bot account | Bot owner only | The Twitch account the bot chats as. Scopes `user:read:chat`, `user:write:chat`, `user:bot`. One shared identity for every server. |
| Broadcaster channel | You, the streamer | Access to your channel's events. Scopes `channel:bot`, subscriptions, bits, redemptions, polls, predictions, broadcast management, clip editing and moderation. |

The integration counts as configured when a bot account exists, your channel is authorised, and the config is enabled. The **Health** panel shows the transport (EventSub WebSocket or legacy IRC), the last event received, token expiry for both accounts, and under **Advanced diagnostics** any missing scopes and the stored EventSub subscriptions.

Disconnecting the channel deletes your authorisation and disables the integration. The bot account can only be disconnected by a bot owner.

## Chat commands in Twitch

Every connected channel gets these built-in commands. The prefix is `!` by default and can be changed, up to five characters. Custom commands are looked up only when no built-in matches the name.

| Command | Who can use it | What it does |
| --- | --- | --- |
| `!ping` | Everyone | Replies with a pong |
| `!uptime` | Everyone | How long the bot process has been running |
| `!commands` | Everyone | Lists built-in and enabled custom commands |
| `!discord` | Everyone | Shows which Discord account is linked to the caller |
| `!link` | Everyone | Generates a six-digit claim code for account linking |
| `!rank` | Everyone | Shows the caller's resolved rank |
| `!stream` | Everyone | Live status, title, category, viewers and uptime, or "offline" |
| `!schedule` | Everyone | Posts the schedule message set by staff |
| `!socials` | Everyone | Posts the socials message set by staff |
| `!quote [id]` | Everyone | A random quote, or a specific one by number |
| `!quote add <text> [-- author]` | Mod | Saves a quote, optionally with an author after `--` |
| `!quote remove <id>` | Mod | Deletes a quote (`delete` also works) |
| `!counter <name>` | Everyone | Shows a counter's value |
| `!counter <name> +` | Mod | Adds one (`++` or `add` also work); `-`, `--` or `sub` subtract one; `reset` sets it to 0; a number sets it directly |
| `!so <user>` | Mod | Shouts out another Twitch channel |
| `!raidtarget` | Mod | Suggests a random channel from the raid target list |

### Ranks

A chatter's rank comes from their Twitch badges. Broadcaster is highest, then Mod, VIP, Subscriber (founder badges count as subscriber), then Everyone. Commands, custom commands and role sync all compare against this order, so a Mod can run anything set to VIP, Subscriber or Everyone.

## Custom commands

Custom commands are added on the dashboard under **Commands**, **Custom Commands**, or with `/twitch commands add`. Names are lowercased, may be up to 32 characters, and can contain letters, digits, hyphens and underscores. Each command has a **Permission** (Everyone, Subscriber, Vip, Mod, Broadcaster), a **Cooldown seconds** value from 0 to 86400, an **Enabled** toggle and a **Response**. The cooldown is shared by the whole channel, not per user. Use counts are tracked and shown in the list.

The dashboard also has a **Test args** field and a preview so you can see the rendered response before saving.

### Placeholders in responses

| Placeholder | Value |
| --- | --- |
| `%user%` | The chatter's Twitch login |
| `%display%` | The chatter's display name |
| `%channel%` | Your Twitch channel login |
| `%args%` | Everything typed after the command name |
| `%target%` | The first word after the command name |
| `%discord%` | The chatter's linked Discord user ID, or empty |
| `%random:a\|b\|c%` | One option picked at random |
| `%count:name%` | Current value of the named counter |
| `%stream%` | The same summary `!stream` gives |

> [!EXAMPLE]
> `!hug` with response `%display% hugs %target%! That is hug number %count:hugs%.`

## Timers

Timers post a message into Twitch chat on a schedule. Manage them under **Commands**, **Timers**, or with `/twitch timers`.

| Setting | Default | What it controls |
| --- | --- | --- |
| Timer name | | Same naming rules as commands |
| Interval minutes | 10 | 1 to 1440 minutes between posts |
| Minimum chat messages | 5 | Chat messages that must arrive since the last post before it posts again; 0 disables the check |
| Online only | on | Only post while the channel is live |
| Random rotation | off | Pick a random line instead of cycling through in order |
| Enabled | on | Whether the timer runs |
| Messages | | One message per line |

The scheduler checks timers every 30 seconds. Timer lines support `%channel%`, `%url%`, `%stream%`, `%count:name%` and `%random:a|b|c%`. `/twitch timers test` (or the test button on the dashboard) posts a timer immediately.

## Quotes and counters

Quotes are stored with their text, optional author and who added them. The dashboard **Quotes** sub-tab lets staff add, search and remove them; viewers use `!quote`. Counters are simple named integers that mods bump from chat; staff can set values with `/twitch commands counter-set` and list them with `counter-list`.

## Events into Discord

The **Events** tab, **Alerts** sub-tab holds the sub, raid and channel point settings. The go-live post lives under **Setup**, **Bot Settings**, **Event routing**.

### Go-live and offline

When the channel goes live the bot posts to the **Go-live Discord channel**. With no **Go-live message** it sends a default embed: the streamer name linked to the channel, the title as author line, status, viewer count, category and a preview image. A custom message runs through the embed builder, so full embeds and components work. When the channel goes offline a short red "Offline" embed is posted to the same channel.

| Placeholder | Value |
| --- | --- |
| `%streamer%` | The broadcaster's display name |
| `%title%` | Stream title |
| `%game%` | Category name |
| `%url%` | `https://twitch.tv/<channel>` |
| `%viewers%` | Current viewer count |

### Subscriptions and raids

These are plain text messages. Default sub message: `%display% subscribed to %channel%!`, or `%display% received a gifted sub on %channel%!` for gifts. Default raid message: `%raider% raided %channel% with %viewers% viewers!`.

| Event | Placeholders |
| --- | --- |
| Sub | `%user%`, `%display%`, `%channel%`, `%tier%` |
| Raid | `%raider%`, `%channel%`, `%viewers%` |

Each alert has a **Send test** button on the dashboard, and the **Event history** list shows recent events and test sends.

### Channel point actions

Under **Channel point actions**, map a **Reward title** (matched case-insensitively) to a **Twitch reply**, a **Discord channel** with a **Discord message**, or both. Placeholders: `%user%`, `%display%`, `%channel%`, `%reward%`, `%input%` (what the viewer typed) and `%url%`.

### Stream recap

`/twitch events recap-channel` sets a channel that receives an embed when the stream ends: duration, peak viewers, chat messages, subs, raids, and the last title and category. Recaps are not on the dashboard.

## Account linking and role sync

There are two ways to link a Discord member to a Twitch login:

1. Self-service: the viewer types `!link` in Twitch chat, gets a six-digit code, and runs `/twitch claim <code>` in Discord within ten minutes.
2. Staff: the **Account Links** tab or `/twitch links add @user twitchlogin`.

One Twitch login per Discord member per server. Once linked, `%discord%` fills in for that viewer and role sync applies.

Role sync maps a Twitch rank to a Discord role with `/twitch rolesync add`. Every time a linked viewer sends a chat message, the bot adds the role if their rank is at or above the mapping and removes it if it is below. Role sync is only available through slash commands.

## Live Tools

The **Events** tab, **Live Tools** sub-tab exposes stream operator actions that use your channel authorisation: send a chat message as the bot, create a stream marker, create a clip, start a poll (one choice per line, default 60 seconds), and time out (default 600 seconds), ban, unban or delete a message by ID. `/twitch stream-info` and `/twitch clip` do the title, category and clip parts from Discord.

## Settings

Under **Setup**, **Bot Settings**:

| Setting | Default | What it controls |
| --- | --- | --- |
| Command prefix | `!` | Prefix for Twitch chat commands, up to 5 characters |
| Language override | server default | BCP-47 tag such as `de-DE` used for the bot's chat replies |
| Enable Twitch chat bot for this server | on | Master switch; disabling keeps the configuration |
| Use EventSub for chat events | on | Receive chat and events over EventSub; if off, chat commands do not run |
| Go-live Discord channel | none | Where go-live and offline posts go |
| Go-live message | default embed | Custom template with the go-live placeholders |

Under **Events**, **Alerts**: **Sub Discord channel**, **Sub message**, **Raid Discord channel**, **Raid message**, and the channel point action list.

## Setup walkthrough

1. Open **Twitch Bot** in the dashboard. A bot owner must have connected the **Bot account** first; the **Connect** sub-tab shows whether one exists.
2. Click **Connect channel** and authorise with your own Twitch account.
3. In **Bot Settings**, set the prefix, turn on **Enable Twitch chat bot for this server**, pick a **Go-live Discord channel** and save.
4. In **Commands**, add a couple of custom commands and a socials timer. Use **Test args** and the preview to check placeholders.
5. In **Events**, **Alerts**, choose sub and raid channels and press **Send test** for each.
6. Type `!ping` in your Twitch chat to confirm the bot is listening, then `!link` and `/twitch claim` to link yourself.
7. Optionally run `/twitch rolesync add Subscriber @Subs` so linked subscribers get a role.

## Commands

This module is slash commands only. Type `/twitch` in Discord to see them. Replies are only visible to you.

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `/twitch set <channel> [prefix]` | | Manage Server | Set the Twitch channel and prefix, and enable the integration |
| `/twitch remove` | | Manage Server | Disable the integration and leave the channel |
| `/twitch enable` | | Manage Server | Turn the integration back on |
| `/twitch disable` | | Manage Server | Turn it off without deleting settings |
| `/twitch config` | | Nobody | Show channel, prefix, enabled state, go-live channel and language |
| `/twitch claim <code>` | | Nobody | Claim a link code from `!link` |
| `/twitch stream-info [title] [category]` | | Manage Server | Update the stream title or category |
| `/twitch clip` | | Manage Server | Create a clip of the current stream |
| `/twitch status` | | Manage Server | Health summary: accounts, tokens, EventSub state |
| `/twitch language <tag>` | | Manage Server | Language for chat replies; empty resets |
| `/twitch prefix <prefix>` | | Manage Server | Change the chat command prefix |
| `/twitch commands add <name> <response> [permission] [cooldown]` | | Manage Server | Add or update a custom command |
| `/twitch commands remove <name>` | | Manage Server | Delete a custom command |
| `/twitch commands list` | | Nobody | List custom commands with permission, cooldown and use count |
| `/twitch commands counter-set <name> <value>` | | Manage Server | Set a counter |
| `/twitch commands counter-list` | | Nobody | List counters |
| `/twitch commands schedule-set <message>` | | Manage Server | Set the `!schedule` reply |
| `/twitch commands schedule-clear` | | Manage Server | Clear it |
| `/twitch commands socials-set <message>` | | Manage Server | Set the `!socials` reply |
| `/twitch commands socials-clear` | | Manage Server | Clear it |
| `/twitch timers add <name> <messages> [interval] [minchat] [onlineonly] [randomize]` | | Manage Server | Add or update a timer |
| `/twitch timers remove <name>` | | Manage Server | Delete a timer |
| `/twitch timers list` | | Nobody | List timers |
| `/twitch timers enable <name>` | | Manage Server | Enable a timer |
| `/twitch timers disable <name>` | | Manage Server | Disable a timer |
| `/twitch timers test <name>` | | Manage Server | Post a timer now |
| `/twitch events golive-channel <channel> [message]` | | Manage Server | Set the go-live channel and template |
| `/twitch events golive-clear` | | Manage Server | Clear the go-live channel |
| `/twitch events sub-channel <channel> [message]` | | Manage Server | Set the sub channel and template |
| `/twitch events sub-clear` | | Manage Server | Disable sub posts |
| `/twitch events raid-channel <channel> [message]` | | Manage Server | Set the raid channel and template |
| `/twitch events raid-clear` | | Manage Server | Disable raid posts |
| `/twitch events recap-channel <channel>` | | Manage Server | Set the stream recap channel |
| `/twitch events recap-clear` | | Manage Server | Disable recaps |
| `/twitch links add <@user> <twitchlogin>` | | Manage Server | Link a member to a Twitch login |
| `/twitch links remove <@user>` | | Manage Server | Remove a member's link |
| `/twitch links list` | | Nobody | List all links |
| `/twitch rolesync add <rank> <@role>` | | Manage Server | Give a role to linked viewers at or above a rank |
| `/twitch rolesync remove <rank> <@role>` | | Manage Server | Remove a mapping |
| `/twitch rolesync list` | | Nobody | List mappings |
| `/twitch redemptions add <reward> [twitchreply] [channel] [discordmessage]` | | Manage Server | Add or update a channel point action |
| `/twitch redemptions remove <reward>` | | Manage Server | Remove one |
| `/twitch redemptions list` | | Nobody | List actions |
| `/twitch raidtargets add <twitchlogin> [note]` | | Manage Server | Add a channel to the `!raidtarget` pool |
| `/twitch raidtargets remove <twitchlogin>` | | Manage Server | Remove one |
| `/twitch raidtargets list` | | Nobody | List raid targets |

## Tips and gotchas

- The bot account is shared by every server on the bot. If nobody has connected one, chat replies cannot be sent no matter what you configure.
- Chat commands only work while **Use EventSub for chat events** is on. If the Health panel shows Legacy IRC, switch it back on.
- Live state is also polled once a minute, so a go-live post can lag the actual start by up to a minute.
- Custom command cooldowns are per channel, not per viewer. A 30 second cooldown means one use every 30 seconds for everyone.
- Role sync runs when a linked viewer chats, not on a schedule. A subscriber who never types in chat never gets the role, and a lapsed subscriber keeps it until they chat again.
- Role changes need the bot's role above the synced role and Manage Roles.
- Unknown ranks passed to `rolesync` fall back to Subscriber, and unknown permissions passed to `commands add` fall back to Everyone.
- Link codes expire after ten minutes and generating a new one invalidates the old.
- Timeouts and bans from Live Tools use your channel's moderation scopes, so they appear in Twitch as actions taken by the authorised account.
- Language override changes only Twitch chat replies. Discord replies keep the server locale.
