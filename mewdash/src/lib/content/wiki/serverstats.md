---
title: Activity Stats
slug: serverstats
summary: Messages, voice time, games and member growth for the whole server, a member or a channel over any window up to ninety days, with charts, rankings, exports and a privacy opt out.
icon: fa-chart-simple
category: Analytics
dashboard: /dashboard/serverstats
module: ServerStats
tags: [activity, stats, statistics, statbot, voice time, games, presence, lookback, top chatters, charts, member growth, status, snapshots, privacy, opt out]
related: [messagestats, statroles, liveboards, statchannels, invites]
---

## What it does

The bot already counted messages. Activity Stats adds voice time, games and apps, hourly member and status snapshots, and a way to ask about any of it over a window: the last day, week, month, up to ninety days, or all time. Everything is available in the dashboard, as commands, as charts, as CSV, and to stat roles, live boards, reports and stat channels.

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

- **Verify activities** (on by default) only counts activities Discord itself attests to: ones with a registered application ID, Spotify, and streams. A modified client can claim to be playing anything, so plain named activities are ignored while this is on.
- The **activity filter** is a list of game names that is either a **blacklist** (listed games are ignored) or a **whitelist** (only listed games count).
- Custom statuses are never counted.

## Dashboard tabs

| Tab | What it shows |
| --- | --- |
| Overview | Messages, voice time, chatters, joins, leaves, net growth, members now, the top chatter, top voice member, busiest channel and most played game, and charts for messages, voice hours, members, member status and joins and leaves |
| Rankings | Members and channels ranked by messages, voice or game time, and the top games with player counts, exportable as CSV. Click a member, channel or game to open it |
| Member & Channel | One member's messages, voice time, ranks, lifetime totals, favourite channels and games; one channel's activity and top members; and **Who plays** for any game |
| Settings | Every tracker, the default window, message cooldown, bots, voice states that do not count, ignored channels, roles and members, and the activity filter |

## Settings

| Setting | Default | What it controls |
| --- | --- | --- |
| Default window | 14 days | What commands and the page use when no window is given |
| Message cooldown | 0 | Seconds between counted messages from one member. Stops spam from inflating counts |
| Track voice time | on | Whether voice segments are recorded |
| Hourly snapshots | on | Whether member and status counts are sampled every hour |
| Count bots | off | Whether bot accounts are included |
| Track games and apps | off | Whether presence activities are recorded |
| Verify activities | on | Only count Discord attested activities |
| Voice states that do not count | none | Any of self muted, self deafened, server muted, server deafened, AFK channel, alone, streaming, camera on |
| Ignored channels, roles, members | none | Nothing from these is counted |

## Privacy

Any member can run `statsprivacy` (or `/serverstats privacy`) to opt out. Their recorded messages, voice time and game time are deleted in every server the bot shares with them, and nothing new is recorded until they run it again to opt back in. Server admins cannot override it.

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
