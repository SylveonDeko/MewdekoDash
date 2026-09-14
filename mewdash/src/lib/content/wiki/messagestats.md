---
title: Message Stats
slug: messagestats
summary: Count how many messages each member sends in each channel, then view leaderboards, per-user and per-channel breakdowns and busiest hour and day graphs.
icon: fa-envelope
category: Analytics
dashboard: /dashboard/messagestats
module: Utility
tags: [message stats, message count, activity, leaderboard, top users, analytics, busiest hours, activity graph]
related: [xp, utility, statchannels]
---

## What it does

Once message counting is switched on, the bot records one count per member per channel every time a human posts a message that meets the minimum length. Nothing is stored about the content, only who posted, where, and when. Counts are queued and written to the database in batches so busy servers do not slow the bot down.

Members can ask for their own totals with `usermessages`, see which channel is busiest with `channelmessages`, or check the whole server with `servermessages`. `topusers` prints a top ten leaderboard with each member's share of all messages. `activitygraph` renders a bar chart image of the busiest days of the week or hours of the day.

The dashboard shows the same numbers with charts, and lets staff turn counting on or off, reset counts, and export the data as CSV or JSON.

## Why you would use it

- Find your most active members for rewards, roles or moderator recruitment.
- See which channels are dead and which are thriving before reorganising the server.
- Pick event times using the busiest hours graph in your own timezone.
- Spot bots and spam accounts by comparing message counts with message quality.

## What gets counted

| Rule | Behaviour |
| --- | --- |
| Counting enabled | Nothing is recorded until `togglemsgcount` or the dashboard switch is on |
| Bots | Never counted |
| DMs | Never counted; only server channels |
| Minimum length | Messages shorter than **minimum message length** characters are skipped; the default is 0, so everything counts |
| Timestamps | Message times are kept for 90 days to power the hour and day graphs; totals are kept indefinitely |

The minimum length accepts values up to 4098. Running `minmsglength` with no number shows the current value.

## Activity graphs

`activitygraph days` needs data for all seven days of the week and looks at the last four weeks. `activitygraph hours` needs data for all 24 hours over the last seven days. For the hourly graph the bot asks you to pick a timezone first, offering a list of common zones, accepting any IANA zone name, and cancelling if you do not answer. The chart is posted as a PNG.

## Settings

The Message Statistics page has two top-level tabs, **Statistics** and **Management**. Statistics contains **Overview**, **Top Users** and **Top Channels**. Management contains **Settings** and **Export Data**.

| Setting | Default | What it controls |
| --- | --- | --- |
| Enable Message Counting | Off | Whether new messages are recorded |
| Minimum Message Length | 0 | Slider from 0 to 4098; shortest message that counts |
| Reset Message Counts | | **Reset All Server Counts** deletes every stored count for the server after confirmation |
| Export format | CSV | CSV or JSON download of the loaded statistics |
| Include user statistics | On | Adds the top user rows to the export |
| Include channel statistics | On | Adds the top channel rows to the export |
| Include hourly breakdown | Off | Adds the busiest hours and busiest days rows to the export |

The **Overview** tab shows **Daily Messages**, **Total Messages**, **Last Updated** and **Status** tiles, the least active user and channel, a **24-Hour Activity** chart and a **Weekly Trend** chart. **Top Users** lists the **Top Message Senders** and **Top Channels** lists the **Most Active Channels**.

> [!NOTE]
> The export is built in your browser from the statistics already loaded on the page. The start and end dates you enter are written into the file header but do not filter the rows.

## Setup walkthrough

1. Open **Message Stats** in the dashboard and go to **Management**, then **Settings**.
2. Turn on **Enable Message Counting**.
3. Optionally set **Minimum Message Length** to 5, or run `minmsglength 5` in Discord, so one-character replies are ignored.
4. Let the server chat for a day, then check **Statistics** for the first numbers.
5. After a week, run `activitygraph hours` and pick your timezone to see when the server is busiest.

## Commands

Run these with your server's prefix (`.` unless you changed it).

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `usermessages [@user]` | `usermsg`, `umsg` | Nobody | Total, most and least active channel for you or another member |
| `channelmessages [#channel]` | `channelmsg`, `cmsg` | Nobody | Total, most and least active member in a channel |
| `servermessages` | `servermsg`, `smsg`, `guildmessages`, `guildmsg` | Nobody | Server total with the most and least active member and channel |
| `topusers` | `topu` | Nobody | Top ten members by message count with percentages |
| `activitygraph [days or hours]` | `actgraph` | Nobody | Bar chart of busiest days or hours; defaults to days |
| `minmsglength [number]` | `mmlength`, `minmlength` | Manage Server | Show or set the minimum length for a message to count |
| `togglemsgcount` | `togglemessagecount` | Administrator | Turn counting on or off |
| `resetmessagecounts [@user] [#channel]` | `rmc`, `resetmsgcounts`, `resetmessages`, `resetcounts` | Manage Messages | Reset counts for the whole server, one member, one channel, or one member in one channel, after confirmation |

## Tips and gotchas

- Counting only starts from the moment it is enabled. Messages sent before that are never back-filled.
- Every stats command and the dashboard report "disabled" until counting is switched on, even if old data exists.
- Counts are written in batches of up to 100 events, so a total may lag a few seconds behind live chat.
- Deleting a channel does not delete its counts. Use `resetmessagecounts #channel` before the channel is removed if you want it gone.
- The hourly graph is only as accurate as the timezone you pick. Store the server's zone with the timezone command in Administration for consistency across staff.
- The XP system has its own activity tracking and does not use these counts.
