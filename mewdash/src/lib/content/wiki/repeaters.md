---
title: Repeaters
slug: repeaters
summary: Post a message in a channel on a schedule, when the channel is busy or quiet, or keep it pinned to the bottom as a sticky message.
icon: fa-sync
category: Actions
dashboard: /dashboard/repeaters
module: Utility
tags: [repeater, sticky, sticky message, recurring, scheduled message, auto post, reminder, forum sticky]
related: [utility, embedbuilder]
---

## What it does

A repeater is a message the bot posts again and again in one channel. The classic use is a timed reminder: "Read the rules" every six hours. Each time it fires, the bot deletes its previous copy first, so the channel never fills with duplicates and the message always sits near the bottom.

Repeaters have five trigger modes. Besides a fixed interval, they can fire the moment someone else posts (a true sticky message), after a number of messages, when the channel has been busy, or when it has gone quiet. Optional time windows limit them to business hours, evenings or weekends in your server's timezone, and forum repeaters can post automatically into every new thread.

The message supports the full embed builder, plain text, components and the general placeholders, so a repeater can be a rich announcement rather than a line of text. Mentions are only kept if the person creating it has Mention Everyone; otherwise they are neutralised.

## Why you would use it

- Keep the rules or a "how to get help" notice pinned to the bottom of a busy channel.
- Post a daily event reminder at 18:00 server time.
- Put the posting guidelines in every new forum thread, filtered by tag.
- Nudge a dead channel with a conversation starter when it has been quiet for an hour.
- Run a promotion only during business hours and only for the next seven days.

## Trigger modes

| Mode | When it posts |
| --- | --- |
| Time Interval | Every interval, optionally aligned to a start time of day. Default mode. |
| Immediate | Posts once, then reposts whenever its message is no longer the last one in the channel. |
| After Messages | Posts once the activity threshold of messages has been sent since it last fired. |
| On Activity | Posts when the channel is busy: the threshold is compared against recent traffic in the time window. |
| On No Activity | Posts when no messages have been sent in the channel for the whole time window. |

Activity-based modes are checked once a minute and need message counting enabled on the server. The interval must be between five seconds and 25000 minutes. The default is five minutes, or one day when you give a time of day and no interval. **Activity threshold** defaults to 5 messages and **Time window** to five minutes, with a window range of thirty seconds to six hours.

## Conditions and limits

- **Don't repeat if message is already last in channel** (redundancy): the bot skips a run if its last copy is still the newest message.
- **Conversation Detection**: if three or more messages arrived in the last minute, the run is delayed and rechecked in thirty seconds.
- **Time Schedule**: `business` is 09:00 to 17:00 Monday to Friday, `evening` is 18:00 to 23:00 every day, `weekend` is all day Saturday and Sunday. Times use the server timezone; set one first or the bot assumes UTC and reminds you.
- **Auto-delete after** and **Max displays**: the repeater removes itself after a maximum age or a number of posts.
- **Suppress Notifications**: the message is sent silently so it does not ping anyone's device.
- **Priority** is stored per repeater as 0 to 100, default 50, and is shown in the list.

## Threads and forums

- **Auto-create in new threads**: when a thread is created under the repeater's channel, the bot posts the message into the thread and keeps it at the bottom as members reply.
- **Thread-only mode**: the repeater never posts in the parent channel, only in threads. Required when the target is a forum channel.
- **Forum Tag Filters**: required and excluded tags decide which forum posts get the sticky.

## Placeholders

The message runs through the general placeholder set. The user placeholders refer to the bot itself, since nobody triggers a repeater. Useful ones:

| Placeholder | Value |
| --- | --- |
| `%server%`, `%server.name%` | Server name |
| `%server.members%` | Cached member count |
| `%server.id%`, `%server.icon%` | Server ID and icon URL |
| `%channel%`, `%channel.name%` | Mention and name of the repeater channel |
| `%bot.name%`, `%bot.avatar%` | The bot's name and avatar |
| `%server.time%`, `%time.day%` | Server time and current weekday |

Reaction GIF placeholders such as `%huggif%` are also replaced. Trigger placeholders like `%user%` resolve to the bot.

## Settings

The Repeaters page has three tabs: **Overview**, **Manage Repeaters** and **Create New**.

| Setting | Default | What it controls |
| --- | --- | --- |
| Target Channel | none | Text or forum channel to post in |
| Forum Tag Filters | none | Required and excluded tags, forum channels only |
| Message Content | none | Opens the embed builder |
| Trigger mode | Time Interval | One of the five modes |
| Repeat Every | 5 minutes | Presets from 1 minute to Daily, or a custom `HH:MM:SS` |
| Don't repeat if message is already last in channel | off | Redundancy check |
| Allow @everyone and @here mentions | off | Keep mass mentions in the message instead of neutralising them |
| Priority (0-100) | 50 | The priority value shown in the list |
| Queue Position | 0 | Stored ordering value |
| Start Time (HH:MM) | none | Time of day to align a Time Interval repeater to |
| Conversation Detection | off | Delay while people are talking |
| Suppress Notifications | off | Send silently |
| Auto-create in new threads | off | Thread sticky, forum channels only |
| Thread-only mode | off | Skip the parent channel, forum channels only |
| Auto-delete after (days) | none | Maximum age as `d.hh:mm:ss`, for example `7.00:00:00` |
| Max displays | unlimited | Number of posts before removal |
| Time Schedule | none | Preset buttons or a custom schedule |
| Activity threshold / Messages needed | 5 | Messages for the activity modes |
| Time window | 00:05:00 | Window for the activity modes |

**Overview** shows totals, active count, total displays, a trigger mode breakdown and the most active repeaters. **Manage Repeaters** lists each one with **Edit**, **Trigger Now** and **Delete**, plus a quick edit for interval, threshold, max age and max triggers.

## Setup walkthrough

1. Open **Repeaters** in the dashboard and pick **Create New**.
2. Choose the **Target Channel**. For a forum, tick **Thread-only mode** and set any **Forum Tag Filters**.
3. Click the **Message Content** box and build the message in the embed builder.
4. Pick a **Trigger mode**. For a sticky, choose Immediate; for a reminder, Time Interval with a **Repeat Every** preset.
5. Open **Advanced Options** if you want redundancy, silent sending, a time schedule or an expiry.
6. Click **Create Repeater**, then use **Trigger Now** on the Manage tab to test it.

> [!NOTE]
> Time schedules need a server timezone. Set it with the timezone command before enabling business, evening or weekend windows.

## Commands

Run these with your server's prefix (`.` unless you changed it). All of them need Manage Messages. Repeaters are addressed by their number from `repeatlist`.

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `repeat [time] [interval] <message>` | | Manage Messages | Create a repeater in the current channel, for example `repeat 6h Read the rules` or `repeat 18:00 Event tonight` |
| `repeatlist` | `replst`, `replist`, `repli` | Manage Messages | List repeaters with channel, mode, interval and next run |
| `repeatinvoke <index>` | `repinv` | Manage Messages | Fire a repeater now and restart its timer |
| `repeatremove <index>` | `reprm` | Manage Messages | Delete a repeater |
| `repeattoggle <index>` | `reptoggle`, `reptog` | Manage Messages | Enable or disable without deleting |
| `repeatmessage <index> <message>` | `repmsg` | Manage Messages | Replace the message |
| `repeatchannel <index> [#channel]` | `repchan` | Manage Messages | Move it to a text or forum channel |
| `repeatredundant <index>` | `repeatredun`, `repred` | Manage Messages | Toggle the redundancy check |
| `repeattriggermode <index> <mode>` | `reptriggermode`, `repmode` | Manage Messages | `timeinterval`, `immediate`, `aftermessages`, `onactivity` or `onnoactivity` |
| `repeatactivity <index> <threshold> <window>` | `repactivity`, `repact` | Manage Messages | Set the activity threshold and window, for example `10 5m` |
| `repeatpriority <index> <0-100>` | `reppriority`, `repprio` | Manage Messages | Set the priority value |
| `repeatschedule <index> <preset>` | `repschedule`, `repsched` | Manage Messages | `business`, `evening`, `weekend`, or `none` to clear |
| `repeatconversation <index>` | `repconversation`, `repconv` | Manage Messages | Toggle conversation detection |
| `repeatsuppressnotifications <index>` | `repsuppressnotif`, `repsilent`, `repsuppress` | Manage Messages | Toggle silent sending |
| `repeatthreadautosticky <index>` | `repthreadauto`, `repthreads` | Manage Messages | Toggle posting into new threads |
| `repeatthreadonly <index>` | `repthreadonly`, `reptonly` | Manage Messages | Toggle thread-only mode |
| `repeatforumtags <index> <add/remove/clear/list> [required/excluded] [tags]` | `repforumtags`, `repftags` | Manage Messages | Manage forum tag filters by tag ID |

## Tips and gotchas

- The bot needs Send Messages, Embed Links and Manage Messages in the channel, because it deletes its previous copy before posting again.
- If the channel is deleted or the bot loses access, the repeater removes itself.
- Repeaters are loaded shortly after the bot starts. Commands silently do nothing until that finishes.
- Immediate mode reposts on every message from someone else, so avoid it in very fast channels or pair it with Conversation Detection.
- Only a member with Mention Everyone can create a repeater that pings everyone or a role; otherwise the mention is escaped.
- Activity-based modes depend on message counting. Enable it before switching modes or the command refuses.
- Expiry from Max displays counts every post, including ones you trigger by hand.
