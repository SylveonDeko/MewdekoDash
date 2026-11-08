---
title: Live Boards
slug: liveboards
summary: Pin a leaderboard or chart in a channel and the bot keeps it up to date
icon: fa-thumbtack
category: Community
dashboard: /dashboard/liveboards?tab=boards
module: ServerStats
tags: [live boards, pinned leaderboard, pin leaderboard, auto updating, server report, weekly report, monthly report, digest, growth report]
related: [serverstats, invites, statchannels, statroles]
---

## What it does

A live board is a message the bot posts and pins once, then edits on an interval so it shows current numbers. A server report is a one-off embed with a growth chart, posted daily, weekly or monthly, that summarises what happened since the last one.

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

Deleting a board deletes its message. If someone deletes the message by hand the bot posts a fresh one on the next refresh.

## Dashboard

The **Live boards** page has two tabs: **Live boards** and **Server reports**. The tab is kept in the address as `?tab=boards` or `?tab=reports`.

### Live boards tab

The **Live boards** card lists every board with its type, channel, refresh interval, when it last updated, and badges for the window, the row count (leaderboards only) and **pinned**. It shows **No live boards yet** when empty. Two buttons sit above the list:

- **Refresh all** updates every board now. It is disabled while there are no boards.
- **Add live board** opens the **Add a live board** form.

Select a board to open **Edit live board**. The trash button on each row asks for confirmation, then deletes the board and its message.

| Setting | Default | What it controls |
| --- | --- | --- |
| Channel | none | Where the board is posted. Required, and cannot be changed after creation. |
| Board | Invite leaderboard | Which board to post |
| Window | 7d | 24h, 7d, 30d or All. Charts use up to 90 days for All. |
| Rows | 10 | Leaderboards only. From 3 to 25. |
| Refresh every (minutes) | 15 | From 5 to 1440 |
| Pin the message | on | Pins the board. Needs Manage Messages in the channel. Only shown when adding. |

Numbers outside the allowed range are adjusted to the nearest allowed value when you save.

### Server reports tab

The **Schedule** card holds the report settings. Changes save as you make them.

| Setting | What it controls |
| --- | --- |
| Channel | Where reports post. Choosing a channel enables reports, and clearing it disables them. |
| Frequency | **Daily**, **Weekly** or **Monthly**. Reports go out at 00:00 UTC, on Mondays for weekly and on the 1st for monthly. |
| Reports enabled | Switch reports on or off. Disabled until a channel is set. |

The card also shows when the last report was sent. **Send a report now** posts one immediately without changing the schedule. It is disabled until a channel is set.

A report posts the first time the schedule comes round, then on that schedule. A report contains:

- Joins, leaves, net growth and retention for the period
- Messages, voice time and active members
- Member count and how it changed
- Top inviters, chatters, voice members and busiest channels
- Top invite codes with their labels, and top games when game tracking is on
- A joins and leaves chart

Reports switch themselves off if the bot loses permission to post in the channel.

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
