---
title: AFK System
slug: afk
summary: Let members mark themselves away, tell anyone who pings them why, and clear the status automatically when they come back.
icon: fa-moon
category: Actions
dashboard: /dashboard/afk
module: Afk
tags: [afk, away, idle, status, brb, mention reply, timed afk, placeholders]
related: [utility, administration]
---

## What it does

A member runs `afk` with an optional message. From then on, whenever someone mentions them, the bot replies in that channel with the message and how long they have been away. When the member comes back, the status is cleared, a short "welcome back" notice is posted and deleted after five seconds, and the nickname is restored.

While a member is away the bot also tries to rename them to `[AFK] name`, trimmed to fit Discord's nickname limit, so the status is visible in the member list.

Running `afk` with no message toggles: it turns AFK on with a blank message if you are not away, and turns it off if you are.

## Why you would use it

- Members in busy servers stop being pinged repeatedly by people who did not see them say "brb".
- Staff can see at a glance who is around and who is not.
- Timed AFK covers "back in two hours" without anyone having to remember to clear it.

## How a status ends

The **AFK type** decides what the bot counts as coming back. It is the most important setting on the page.

| Type | Status clears when |
| --- | --- |
| Self disable | Only when the member runs `afk` again, or staff remove it. Nothing automatic. |
| On message | The member sends a message anywhere in the server. |
| On type | The member starts typing in any channel. |
| Either | A message or typing, whichever comes first. |

The **AFK timeout** is a grace period measured from when the status was set. Inside that window, typing or sending a message does not clear the status, which stops the "afk, brb" message itself from ending the AFK straight away. The default is 0, meaning no grace period; set it with `afktimeout` or on the dashboard's **Advanced Settings** tab.

Timed AFK is different: it runs until its timer expires regardless of type. Talking in between does not end it. When the timer runs out the status is cleared and the nickname restored without a channel notice.

Editing a message within five minutes of posting it counts the same as sending a new one.

## The reply to a mention

When someone mentions an away member, the bot checks up to five mentioned users per message, ignores bots and self mentions, ignores messages that start with the command prefix, and skips channels on the disabled list. For each away member it finds, it posts a reply.

By default the reply is an embed: the author line reads "user is currently away" with their avatar, the description is their AFK message, and the footer shows how long they have been away. If the bot is configured to show an invite button, one is attached.

You can replace this with your own message or embed using `customafkmessage`, or the **Custom AFK Embed Message** editor on the dashboard. The text is run through the embed parser, so anything the embed builder produces works. Set it to `-` to return to the default.

### Placeholders

These are replaced inside a custom AFK message. General placeholders from the placeholders page are not available here; only this set is.

| Placeholder | Value |
| --- | --- |
| `%afk.message%` | The AFK message, with mentions neutralised and cut to the max length |
| `%afk.user%` | The away member's username |
| `%afk.user.mention%` | A mention of the away member |
| `%afk.user.avatar%` | The away member's avatar URL |
| `%afk.user.id%` | The away member's user ID |
| `%afk.triggeruser%` | Username of the person who pinged them |
| `%afk.triggeruser.mention%` | A mention of the person who pinged them |
| `%afk.triggeruser.avatar%` | Avatar URL of the person who pinged them |
| `%afk.triggeruser.id%` | User ID of the person who pinged them |
| `%afk.time%` | How long they have been away, in words such as "2 hours" |

> [!EXAMPLE]
> A plain text reply: `%afk.user.mention% is away (%afk.time%): %afk.message%`

## Settings

All of these are on the AFK page, under the **Basic Settings** and **Advanced Settings** tabs.

| Setting | Default | What it controls |
| --- | --- | --- |
| Auto-deletion time | 0 (never) | Seconds before the bot's reply to a mention deletes itself |
| Max message length | 128 | Longest AFK message a member may set, 1 to 4096; longer ones are rejected |
| AFK removal type | Self disable | One of the four types above |
| AFK timeout | 0 (none) | The grace period after setting AFK, up to two hours |
| Disabled channels | none | Channels where mentioning an away member gets no reply |
| Custom AFK embed | default embed | Your own reply, with the placeholders above |

> [!TIP]
> Set auto-deletion to around thirty seconds. The person who pinged sees the reply, and the channel does not fill up with stale AFK notices.

The **User Management** tab lists every member currently away and lets staff clear a status for one or several people at once.

## Setup walkthrough

1. Open **AFK System** in the dashboard.
2. Pick an **AFK removal type**. "On message" is the safest default; "Either" is the most convenient.
3. Set **Auto-deletion time** to 30. Leave **Max message length** at 128 unless you want longer statuses.
4. In **Advanced Settings**, add bot command channels and announcement channels to **Disabled channels**.
5. Optionally build a custom reply in the embed editor using the placeholders above.
6. Test it: run `afk testing`, ping yourself from another account, then send a message and watch the status clear.

## Commands

Run these with your server's prefix (`.` unless you changed it).

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `afk [message]` | | Nobody | Set your AFK message, or toggle AFK on and off with no message |
| `timedafk <time> <message>` | `tafk` | Nobody | AFK that ends by itself, for example `timedafk 2h dinner` |
| `getactiveafks` | `activeafks` | Nobody | List everyone currently AFK |
| `afkview [@user]` | `viewafk` | Manage Messages | Show someone's current AFK message |
| `afkremove @user...` | `afkrm` | Manage Messages | Clear one or more members' statuses |
| `afkdel [seconds]` | `afkdelete` | Manage Server | Show or set auto-deletion for the reply |
| `afklength <number>` | `maxafklength` | Administrator | Cap AFK message length |
| `afktype <type>` | | Administrator | `selfdisable`, `onmessage`, `ontype` or `either` |
| `afktimeout <time>` | | Administrator | Set the grace period, for example `30s` |
| `afkdisable #channel...` | | Manage Channels | Add channels to the no-reply list |
| `afkundisable #channel...` | | Manage Channels | Remove channels from the no-reply list |
| `afkdisabledlist` | | Manage Channels | Show the no-reply list |
| `customafkmessage <text>` | `afkmessage` | Administrator | Set the custom reply, or `-` to reset |

## Tips and gotchas

- There is no command to clear only your own status. Run `afk` again with no message, or wait for the type rule to clear it.
- Nickname changes need the bot's role above the member's top role and the Manage Nicknames permission. The server owner's nickname can never be changed by a bot, so owners keep their name but the status still works.
- The AFK service loads its cache shortly after the bot starts. Until then commands reply that AFK is still starting.
- Mentions inside the AFK message are neutralised in the reply, so members cannot use their status to ping roles or everyone.
