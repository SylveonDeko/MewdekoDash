---
title: Live Boards
slug: liveboards
summary: Pin a leaderboard, chart or overview in a channel and have the bot keep editing it, and post a digest of the day, week or month on a schedule.
icon: fa-thumbtack
category: Community
dashboard: /dashboard/liveboards
module: ServerStats
tags: [live boards, pinned leaderboard, pin leaderboard, auto updating, server report, weekly report, monthly report, digest, growth report]
related: [serverstats, invites, statchannels, statroles]
---

## What it does

A live board is a message the bot posts once, pins, and then edits on an interval so it always shows current numbers. A server report is a one-off embed with a growth chart posted daily, weekly or monthly that summarises what happened since the last one.

## Boards

| Board | Shows |
| --- | --- |
| Invite leaderboard | Top inviters with regular, left and fake counts |
| Message leaderboard | Top chatters |
| Voice leaderboard | Members with the most voice time |
| Top games | The most played games and apps with player counts (needs game tracking) |
| Joins chart, Leaves chart, Growth chart | Joins and leaves per day |
| Members chart | Member count from the hourly snapshots |
| Messages chart | Messages per day |
| Server overview | The same summary as `serveractivity` |
| Invite analytics | Joins, leaves, retention, fake joins and sources |

Each board has a **window** (last day, week, month, or all time; charts use up to 90 days for all time), a refresh interval of at least 5 minutes, a row count for leaderboards, and a pin toggle. A server can have up to 10 boards. Deleting a board deletes its message. If someone deletes the message by hand the bot posts a fresh one on the next refresh.

## Server reports

Set a channel and a frequency, and the bot posts a report the first time the schedule comes round, then daily at 00:00 UTC, weekly on Mondays, or on the first of each month. A report contains:

- Joins, leaves, net growth and retention for the period
- Messages, voice time and active members
- Member count and how it changed
- Top inviters, chatters, voice members and busiest channels
- Top invite codes with their labels, and top games when game tracking is on
- A joins and leaves chart

**Send a report now** posts one immediately without changing the schedule. Reports switch themselves off if the bot loses permission to post in the channel.

## Commands

Run these with your server's prefix (`.` unless you changed it). Boards also live under `/liveboard`, reports under `/serverreport`.

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `liveboardadd <#channel> <board> [range] [rows] [minutes]` | `pinboard`, `pinleaderboard` | Manage Server | Post and pin a board |
| `liveboardlist` | `liveboards` | Manage Server | Every board |
| `liveboardremove <id>` | `unpinboard` | Manage Server | Delete a board and its message |
| `liveboardrefresh` | | Manage Server | Refresh every board now |
| `serverreportchannel [#channel]` | `reportchannel` | Manage Server | Set the report channel and enable reports, or disable them |
| `serverreportfrequency <Daily/Weekly/Monthly>` | `reportfrequency` | Manage Server | How often reports post |
| `serverreportnow [frequency]` | `reportnow` | Manage Server | Post a report in the current channel |

## Tips and gotchas

- Pinning needs Manage Messages in the channel. Without it the board still posts, just unpinned.
- Boards edit the same message, so a board in a busy channel scrolls away; put them in a dedicated stats channel or rely on the pin.
- Leaderboards respect the invite and activity exclusions, so hidden or ignored members never appear on a pinned board.
- Stat channels are the other way to show live numbers: a counter in a channel name instead of a message.
