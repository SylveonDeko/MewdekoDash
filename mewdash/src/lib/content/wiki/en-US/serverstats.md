---
title: Activity Stats
slug: serverstats
summary: Activity charts for the whole server or for a single member
icon: fa-chart-simple
category: Analytics
dashboard: /dashboard/serverstats
module: ServerStats
tags: [activity, stats, statistics, statbot, voice time, games, presence, lookback, top chatters, charts, member growth, status, snapshots, privacy, opt out]
related: [messagestats, statroles, liveboards, statchannels, invites]
---

## What it does

The bot already counted messages. Activity Stats adds voice time and game and app tracking. It also takes hourly member and status snapshots. You can ask about any of it over a window of a day, a week, a month, up to ninety days, or all time. Everything is available in the dashboard, as commands, as charts and as CSV, and it feeds stat roles, live boards, reports and stat channels.

## What is tracked

| Data | How |
| --- | --- |
| Messages | Every counted message with a timestamp, kept for ninety days, plus lifetime totals per member and channel |
| Voice time | A segment per member per channel, split whenever they move, mute, deafen, start streaming or turn on their camera, kept for ninety days, plus lifetime totals |
| Games and apps | A segment per member per activity (playing, streaming, listening, watching, competing), kept for ninety days, plus lifetime totals. Off by default |
| Snapshots | Member, human, bot, online, idle, DND, offline and in-voice counts every hour, kept for ninety days |
| Joins and leaves | Every join and leave with a timestamp |

Windows up to ninety days read the timestamped data. **All time** reads the lifetime totals, so it keeps working after the ninety day data ages out.

## Games and apps

Game tracking is off until you turn it on, because it is the heaviest tracker. Once on, the bot watches every member's presence and records how long each game, stream, Spotify session or watched app lasts.

- **Verify activities** (on by default) only counts activities Discord itself attests to, which means anything with a registered application ID. Spotify and streams count too. A modified client can claim to be playing anything, so plain named activities are ignored while this is on.
- The **activity filter** is a list of game names that is either a **blacklist** (listed games are ignored) or a **whitelist** (only listed games count).
- Custom statuses are never counted.

## Dashboard tabs

| Tab | What it shows |
| --- | --- |
| Overview | **Server activity**: messages, **Voice time**, chatters, joins, leaves, **Net growth**, **Members now**, **Top chatter**, **Top voice**, **Busiest channel** and **Most played**, and charts for messages, **Voice hours**, members, **Member status** (**Online**, **Idle**, **DND**, **In voice**) and **Joins and leaves**. A **Time window** picker sets the range |
| Rankings | Members and channels ranked by messages or by time in voice or games, plus **Top games and apps** with player counts. **CSV** exports the ranking. Click a member, channel or game to open it |
| Member & channel | **Look up** a member (messages, voice time, ranks, **Lifetime messages**, **Lifetime voice**, **Chats most in**, **Games and apps**), a channel (**Top chatters**, **Voice channels**) or a game with **Who plays** (**Playing now** and **People**) |
| Settings | **Tracking settings**, **Voice states that do not count**, ignored channels, roles and members, and the **Activity filter** |

The tab is kept in the address as `?tab=overview`, `top`, `lookup` or `settings`.

## Settings

| Setting | Default | What it controls |
| --- | --- | --- |
| Default window (days) | 14 | What commands and the page use when no window is given, 1 to 90 |
| Message cooldown (seconds) | 0 | Counts a member's messages once per this many seconds. 0 counts all |
| Track voice time | on | Whether voice segments are recorded, per member and channel |
| Hourly snapshots | on | Whether member and status counts are sampled every hour for the charts |
| Count bots | off | Whether bot accounts are included |
| Track games and apps | off | Whether presence activities are recorded |
| Verify activities | on | Ignore spoofed presences |
| Voice states that do not count | none | Toggle any of **Self muted**, **Self deafened**, **Server muted**, **Server deafened**, **AFK channel**, **Alone**, **Streaming**, **Camera on** to leave that time out of voice stats |
| Ignored channels, Ignored roles, Ignored members | none | Nothing from these is counted. Add each with its picker and **Add** |
| Activity filter mode | none | **Blacklist** ignores the listed games, **Whitelist** tracks only the listed games |

Settings save as you change them. Add a game to the **Activity filter** by typing its name under **Game or app name** and pressing **Add**.

## Privacy

Any member can run `statsprivacy` (or `/serverstats privacy`) to opt out. Their recorded messages and their voice and game time are deleted in every server the bot shares with them, and nothing new is recorded until they run it again to opt back in. Server admins cannot override it.

## Commands

Run these with your server's prefix (`.` unless you changed it). Every command also exists under `/serverstats`. `days` is the window; 0 means all time and leaving it out uses the server default.

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `serveractivity [days]` | `sstats` | Nobody | The server overview |
| `useractivity [@user] [days]` | `ustats`, `mystats` | Nobody | A member's messages, voice time, ranks, lifetime totals, top channels and games |
| `channelactivity [#channel] [days]` | `cstats` | Nobody | A channel's activity and top members |
| `activitytop [Messages/Voice/Activity] [days] [@role]` | `topchatters`, `topvoice` | Nobody | Rank members |
| `activitytopchannels [Messages/Voice] [days]` | `topchannels` | Nobody | Rank channels |
| `topgames [days]` | `games` | Nobody | The most played games and apps |
| `whoplays <game>` | | Nobody | Who is in a game right now and who has played it most |
| `activitychart [Messages/Voice/Members/Status/Joins/Leaves/Growth/InVoice/Activities] [days]` | `graph` | Nobody | A chart image |
| `activityexport [Messages/Voice/Activity] [days]` | | Manage Server | A CSV ranking |
| `statssettings` | | Manage Server | Show the settings |
| `statslookback <days>`, `statscooldown <seconds>` | `lookback` | Manage Server | Default window and message cooldown |
| `statstrackvoice`, `statstracksnapshots`, `statscountbots`, `statstrackactivities`, `statsverifyactivities` | `trackvoice`, `trackgames` | Manage Server | Toggle each tracker |
| `statsignorevoicestate <state>` | | Manage Server | Toggle whether a voice state counts |
| `statsignore <#channel, @role or @user>`, `statsignored` | | Manage Server | Exclusions |
| `statsactivityfiltermode <Whitelist/Blacklist>`, `statsactivityfilter <game>`, `statsactivityfilters` | `gamefilter` | Manage Server | The activity filter |
| `statsprivacy` | `optoutstats` | Nobody | Opt out of, or back in to, tracking everywhere |

## Tips and gotchas

- Member and status charts start filling an hour after snapshots are enabled; there is no history before that.
- Voice time only counts while the bot is running. A restart closes and reopens every session, so nothing is lost, but the segment boundaries move.
- Excluding a channel hides its history from every query as well as stopping new counts, so old numbers change too.
- Message counting itself still has to be on (the Message Stats page toggle) for message numbers to appear here.
- Game names are matched case insensitively in the filter and in `whoplays`.
