---
title: Message Stats
slug: messagestats
summary: See how many messages each member sends, with leaderboards and per-channel breakdowns
icon: fa-envelope
category: Analytics
dashboard: /dashboard/messagestats
module: Utility
tags: [message stats, message count, activity, leaderboard, top users, analytics, busiest hours, activity graph]
related: [xp, utility, statchannels]
---

## What it does

Once message counting is switched on, the bot records one count per member per channel every time a human posts a message that meets the minimum length. Nothing is stored about the content, only who posted and where and when. Counts are queued and written to the database in batches so busy servers do not slow the bot down.

Members can ask for their own totals with `usermessages` and check the whole server with `servermessages`. `channelmessages` shows which channel is busiest. `topusers` prints a top ten leaderboard with each member's share of all messages. `activitygraph` renders a bar chart image of the busiest days of the week or hours of the day.

The dashboard shows the same numbers with charts, and lets staff turn counting on or off and reset counts. They can also export the data as CSV or JSON.

## Why you would use it

- Find your most active members for rewards or moderator recruitment.
- See which channels are dead and which are thriving before reorganising the server.
- Pick event times using the busiest hours graph in your own timezone.
- Spot bots and spam accounts by comparing message counts with message quality.

## What gets counted

| Rule | Behaviour |
| --- | --- |
| Counting enabled | Nothing is recorded until `togglemsgcount` or the header switch is on |
| Bots | Never counted |
| DMs | Never counted; only server channels |
| Minimum length | Messages shorter than **Minimum message length** characters are skipped; the default is 0, so everything counts |
| Timestamps | Message times are kept for 90 days to power the hour and day graphs; totals are kept indefinitely |

The minimum length accepts values up to 4098. Running `minmsglength` with no number shows the current value.

## Activity graphs

`activitygraph days` needs data for all seven days of the week and looks at the last four weeks. `activitygraph hours` needs data for all 24 hours over the last seven days. For the hourly graph the bot asks you to pick a timezone first, offering a list of common zones and accepting any IANA zone name. It cancels if you do not answer. The chart is posted as a PNG.

## Settings

The Message statistics page has five tabs: **Overview**, **Top users**, **Top channels**, **Settings** and **Export data**. The on and off switch for counting sits in the page header, and **Refresh** reloads the numbers. Changes save automatically.

| Setting | Default | What it controls |
| --- | --- | --- |
| Header switch | Off | Whether new messages are recorded. A **Counting is off.** notice shows on **Overview** while it is off |
| Minimum message length | 0 | Characters needed to count, from 0 to 4098 (**Message count settings** card) |
| Reset all server counts | | In the **Reset message counts** card. Deletes every stored count for the server after confirmation |
| Format | CSV | CSV or JSON download |
| Include user statistics | On | Adds the top user rows to the export |
| Include channel statistics | On | Adds the top channel rows to the export |
| Include hourly breakdown | Off | Adds the busiest hours and busiest days rows to the export |

**Overview** shows **Daily messages**, **Total messages** and **Last updated** tiles, the **Least active user** and **Least active channel**, a **24-hour activity** chart and a **Weekly trend** chart. **Top users** lists **Top message senders** and **Top channels** lists **Most active channels**. Each row shows its share of all messages and its daily count, and has a reset button that clears only that member or channel after confirmation.

> [!NOTE]
> **Export data** builds the file in your browser from the statistics already loaded on the page, using the **Export data** button.

## Setup walkthrough

1. Open **Message statistics** in the dashboard.
2. Turn on the switch in the page header.
3. Optionally open **Settings** and set **Minimum message length** to 5, or run `minmsglength 5` in Discord, so one-character replies are ignored.
4. Let the server chat for a day, then check **Overview** for the first numbers.
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
