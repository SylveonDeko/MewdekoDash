---
title: Repeaters
slug: repeaters
summary: Repeats a message in a channel on a schedule or when the channel goes quiet
icon: fa-sync
category: Actions
dashboard: /dashboard/channel-messages?tab=repeaters
module: Utility
tags: [repeater, recurring, scheduled message, auto post, reminder, forum repeater, thread repeater, channel messages]
related: [utility, embedbuilder, stickies, autoreactions]
---

## What it does

A repeater is a message the bot posts again and again in one channel. The classic use is a timed reminder such as "Read the rules" every six hours. Each time it fires, the bot deletes its previous copy first, so the channel never fills with duplicates.

Repeaters have four trigger modes. Besides a fixed interval, they can fire the moment someone else posts. They can also fire when the channel has been busy or when it has gone quiet. A schedule limits them to business hours or weekends, and forum repeaters can post into every new thread.

The message is built in the embed builder, so a repeater can be a rich announcement instead of a line of text. It also runs through the general placeholders.

> [!NOTE]
> Messages that keep returning to the bottom after a number of new messages are on the **Stickies** tab, not here. See the stickies article.

## Why you would use it

- Post a daily event reminder at a set time.
- Keep a "how to get help" notice at the bottom of a fast channel.
- Put the posting guidelines in every new forum thread, filtered by tag.
- Nudge a dead channel with a conversation starter when it has been quiet for an hour.
- Run a promotion for a limited number of posts or days.

## The Repeaters tab

The **Channel messages** page opens on the **Repeaters** tab. The **Repeaters** card lists every repeater with its channel, a preview of the message, its trigger mode and interval, and a switch to turn it on or off. Each row has edit and delete buttons. If a repeater was switched off by the bot, the reason is shown on the row. An empty list reads **No repeaters**.

Press **New repeater** to open the form. Press edit on a row to change an existing one. Changes to an existing repeater save automatically and show their save status in the header, next to the enabled switch. A new repeater is only created when you press **Create**.

## Trigger modes

| Mode | When it posts |
| --- | --- |
| Time interval | Every interval, optionally aligned to a start time of day. Default mode. |
| On activity | When at least **Messages** messages were sent in the channel within the **Within** window. |
| On no activity | When no messages were sent in the channel for the whole **Within** window. |
| Immediate | Posts once, then reposts whenever its message is no longer the last one in the channel. |

Activity modes are checked once a minute and need message counting enabled on the server.

## Settings

| Setting | Default | What it controls |
| --- | --- | --- |
| Channel | none | Text channel or forum to post in. Forums are listed as `#name (forum)`. |
| Message | none | Opens the embed builder. Required. |
| Trigger | Time interval | One of the four modes |
| Every | 1 hour | Time interval only. Seconds, minutes, hours or days, from 5 seconds up to 25000 minutes. |
| Start at (UTC) | none | Time interval only. Time of day to align the repeater to, in UTC. |
| Messages | 5 | Activity modes only. How many messages count as busy. |
| Within | 5 minutes | Activity modes only. The window the messages are counted in. |
| Skip if unchanged | off | Skip a post when the bot's last copy is still the newest message |
| Silent | off | Send without notifying anyone's device |
| Wait for quiet chats | off | Hold the post while people are talking |
| Messages per minute | 3 | Shown with **Wait for quiet chats**. How busy a chat must be to hold the post. |
| Expires | off | Remove the repeater after a set age |
| Expires after | 7 days | Shown with **Expires**. Hours or days. |
| Limit posts | off | Remove the repeater after a number of posts |
| Stop after posts | 10 | Shown with **Limit posts** |
| Schedule | Always | **Always**, **Business hours (9-5)**, **Evening hours** or **Weekends only** |
| Priority | 50 | Stored ordering value, 0 to 100 |

**Send now** appears when editing an existing repeater and posts it immediately.

Business hours are 09:00 to 17:00 Monday to Friday and evening hours are 18:00 to 23:00 every day. Weekends are all day Saturday and Sunday. Schedules use the server timezone. If none is set the bot assumes UTC.

A repeater created with a custom schedule through the API shows **Custom schedule**. It stays as it is until you pick one of the presets.

### Threads and forums

These options only appear after you pick a forum as the **Channel**.

| Setting | What it controls |
| --- | --- |
| Stick in new threads | Post the message into every new thread and keep it at the bottom as members reply |
| Threads only | Never post in the forum itself, only in threads |
| Only threads with tags | Only threads carrying the chosen tags get the message. Empty means any. |
| Skip threads with tags | Threads carrying any of these tags never get the message |

## Placeholders

The message runs through the general placeholder set. User placeholders refer to the bot itself, since nobody triggers a repeater.

| Placeholder | Value |
| --- | --- |
| `%server%`, `%server.name%` | Server name |
| `%server.members%` | Cached member count |
| `%server.id%`, `%server.icon%` | Server ID and icon URL |
| `%channel%`, `%channel.name%` | Mention and name of the repeater channel |
| `%bot.name%`, `%bot.avatar%` | The bot's name and avatar |
| `%server.time%`, `%time.day%` | Server time and current weekday |

Reaction GIF placeholders such as `%huggif%` are also replaced.

## Setup walkthrough

1. Open **Channel messages** in the dashboard. The **Repeaters** tab is selected by default.
2. Press **New repeater**.
3. Pick the **Channel**. For a forum, turn on **Threads only** if the message should only appear in threads, and set the tag filters.
4. Press the **Message** box and build the message in the embed builder.
5. Pick a **Trigger**. Use **Time interval** with **Every** for a reminder, or **Immediate** to keep the message at the bottom.
6. Set the toggles you need, such as **Skip if unchanged**, **Silent**, **Expires**, **Limit posts**, or a **Schedule**.
7. Press **Create**. The form stays open on the new repeater, so press **Send now** to test it.

> [!NOTE]
> Schedules need a server timezone. Set it with the timezone command before using any schedule other than **Always**.

## Commands

Run these with your server's prefix (`.` unless you changed it). All of them need Manage Messages. Repeaters are addressed by their number from `repeatlist`.

| Command | Aliases | Purpose |
| --- | --- | --- |
| `repeat [time] [interval] <message>` | | Create a repeater in the current channel, for example `repeat 6h Read the rules` or `repeat 18:00 Event tonight` |
| `repeatlist` | `replst`, `replist`, `repli` | List repeaters with channel, mode, interval and next run |
| `repeatinvoke <index>` | `repinv` | Fire a repeater now and restart its timer |
| `repeatremove <index>` | `reprm` | Delete a repeater |
| `repeattoggle <index>` | `reptoggle`, `reptog` | Enable or disable without deleting |
| `repeatmessage <index> <message>` | `repmsg` | Replace the message |
| `repeatchannel <index> [#channel]` | `repchan` | Move it to a text or forum channel |
| `repeatredundant <index>` | `repeatredun`, `repred` | Toggle skipping when unchanged |
| `repeattriggermode <index> <mode>` | `reptriggermode`, `repmode` | `timeinterval`, `immediate`, `onactivity` or `onnoactivity` |
| `repeatactivity <index> <threshold> <window>` | `repactivity`, `repact` | Set the activity threshold and window, for example `10 5m` |
| `repeatpriority <index> <0-100>` | `reppriority`, `repprio` | Set the priority value |
| `repeatschedule <index> <preset>` | `repschedule`, `repsched` | `business`, `evening`, `weekend`, or `none` to clear |
| `repeatconversation <index>` | `repconversation`, `repconv` | Toggle waiting for quiet chats |
| `repeatsuppressnotifications <index>` | `repsuppressnotif`, `repsilent`, `repsuppress` | Toggle silent sending |
| `repeatthreadautosticky <index>` | `repthreadauto`, `repthreads` | Toggle posting into new threads |
| `repeatthreadonly <index>` | `repthreadonly`, `reptonly` | Toggle threads only |
| `repeatforumtags <index> <add/remove/clear/list> [required/excluded] [tags]` | `repforumtags`, `repftags` | Manage forum tag filters by tag ID |

## Tips and gotchas

- The bot needs Send Messages, Embed Links and Manage Messages in the channel, because it deletes its previous copy before posting again.
- If the channel is deleted or the bot loses access, the repeater removes itself.
- Repeaters are loaded shortly after the bot starts. Commands do nothing until that finishes.
- Immediate mode reposts after every message from someone else, so avoid it in very fast channels or pair it with **Wait for quiet chats**.
- Mass mentions in a repeater made on the dashboard are neutralised.
- **Limit posts** counts every post, including ones you send by hand with **Send now**.
- Activity modes depend on message counting. Enable it before switching modes.
