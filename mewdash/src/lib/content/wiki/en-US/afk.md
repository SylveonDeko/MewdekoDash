---
title: AFK System
slug: afk
summary: Lets members set an away message that people see when they ping them
icon: fa-moon
category: Actions
dashboard: /dashboard/afk
module: Afk
tags: [afk, away, idle, status, brb, mention reply, timed afk, placeholders]
related: [utility, administration]
---

## What it does

A member runs `afk` with an optional message. From then on, whenever someone mentions them, the bot replies in that channel with the message and how long they have been away. When the member comes back, the status is cleared and the nickname is restored. A short "welcome back" notice is posted and deleted after five seconds.

While a member is away the bot also tries to rename them to `[AFK] name`, trimmed to fit Discord's nickname limit, so the status is visible in the member list.

Running `afk` with no message toggles: it turns AFK on with a blank message if you are not away, and turns it off if you are.

## Why you would use it

- Members in busy servers stop being pinged repeatedly by people who did not see them say "brb", and staff can see at a glance who is around.
- Timed AFK covers "back in two hours" without anyone having to remember to clear it.

## How a status ends

The **AFK type** decides what the bot counts as coming back. It is the most important setting on the page.

| Type | Status clears when |
| --- | --- |
| Self disable | Only when the member runs `afk` again, or staff remove it. Nothing automatic. |
| On message | The member sends a message anywhere in the server. |
| On type | The member starts typing in any channel. |
| Either | A message or typing, whichever comes first. |

The **grace period** (the `afktimeout` command) is measured from when the status was set. Inside that window, typing or sending a message does not clear the status, which stops the "afk, brb" message itself from ending the AFK straight away. The default is 0, meaning no grace period; set it with `afktimeout` or on the dashboard's **Settings** tab, in seconds up to 7200.

Timed AFK is different: it runs until its timer expires regardless of type. Talking in between does not end it. When the timer runs out the status is cleared and the nickname restored without a channel notice.

Editing a message within five minutes of posting it counts the same as sending a new one.

## The reply to a mention

When someone mentions an away member, the bot checks up to five mentioned users per message, ignores bots and self mentions, ignores messages that start with the command prefix, and skips channels on the disabled list. For each away member it finds, it posts a reply.

By default the reply is an embed with "user is currently away" and their avatar in the author line and their AFK message as the description. The footer shows how long they have been away. If the bot is configured to show an invite button, one is attached.

You can replace this with your own message or embed using `customafkmessage`, or the **Reply message** editor on the dashboard. The text is run through the embed parser, so anything the embed builder produces works. Set it to `-` to return to the default.

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

The AFK page has two tabs, **Settings** and **Members**. Settings save as you change them, and a failed save puts the field back.

### Settings tab

| Card | Setting | Default | What it controls |
| --- | --- | --- | --- |
| Behavior | Clear AFK on | Self disable | One of the four types above |
| Behavior | Max message length | 128 | Longest AFK message a member may set, 1 to 4096 characters |
| Behavior | Grace period | 0 (none) | Seconds after going AFK before talking clears it, up to 7200 (two hours) |
| Behavior | Delete replies after | 0 (keep) | Seconds before the bot's reply to a mention deletes itself |
| Disabled channels | No reply in | none | Channels where mentioning an away member gets no reply |
| Reply message | Click to write the reply | default embed | Your own reply, with the placeholders above. The editor lists the placeholders and previews the result. |

> [!TIP]
> Set auto-deletion to around thirty seconds. The person who pinged sees the reply, and the channel does not fill up with stale AFK notices.

### Members tab

The **Away members** card lists everyone currently away, with a **Permanent** or **Timed** badge. Each row shows when the status started and, for timed ones, when it expires. The card shows the total and how many are timed. Remove one member with the button on their row, or tick several (or select all) and click **Remove selected**. Each removal asks for confirmation. **Refresh** reloads the list.

The **Set AFK for a member** card sets a status for someone else. Pick the member, type a **Message** and click **Set AFK**. Members who are already away are not offered.

## Setup walkthrough

1. Open **AFK** in the dashboard and stay on the **Settings** tab.
2. Pick **Clear AFK on**. "On message" is the safest default; "Either" is the most convenient.
3. Set **Delete replies after** to 30. Leave **Max message length** at 128 unless you want longer statuses.
4. Add bot command channels and announcement channels under **Disabled channels**.
5. Optionally write a custom reply in the **Reply message** editor using the placeholders above.
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
