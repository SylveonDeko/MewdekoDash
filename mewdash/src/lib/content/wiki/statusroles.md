---
title: Status Roles
slug: statusroles
summary: Give or take away roles automatically when a member's Discord custom status contains a piece of text, and optionally announce it in a channel.
icon: fa-user-circle
category: Actions
dashboard: /dashboard/statusroles
module: StatusRoles
tags: [status roles, custom status, vanity, auto role, presence, role automation, status text]
related: [administration, afk]
---

## What it does

Staff add one or more pieces of text to watch for, such as `discord.gg/yourserver` or `playing minecraft`. The bot watches presence updates. When a member's custom status starts containing that text, the bot removes the roles you listed under **Roles to Remove**, adds the roles under **Roles to Add**, and, if a channel and message are set, posts a notification there.

When the text disappears from their status again, two toggles decide what happens. **Remove Added** takes back the roles that were given. **Readd Removed** gives back the roles that were taken. Both are off by default, so with no changes the member simply keeps whatever roles they ended up with.

Only the custom status is checked, the text you type under "Set a custom status" in Discord. Game, Spotify and streaming activities are ignored. Members who are offline or invisible are skipped, and the match is a plain substring check, so `mewdeko` matches `I love mewdeko` but is case sensitive.

Each server can hold any number of status role entries, each with its own roles, channel and message. Commands refer to an entry by its index, the number shown by `liststatusroles`.

## Why you would use it

- Reward members who put your vanity invite in their status with a supporter role and its perks.
- Give a "streaming" or "looking to play" role while someone advertises it in their status, and remove it when they stop.
- Announce in a channel when a member starts repping the server so staff can thank them.
- Swap one role for another while a status is active, for example move a member out of a "no pings" role while they show a certain status.

## Matching and role changes

| Situation | What the bot does |
| --- | --- |
| Status gains the watched text | Removes **Roles to Remove**, adds **Roles to Add**, sends the notification if configured |
| Status keeps the watched text | Nothing, the change is only processed once |
| Status loses the watched text, **Remove Added** on | Removes any of the **Roles to Add** the member still has |
| Status loses the watched text, **Readd Removed** on | Gives back any of the **Roles to Remove** the member no longer has |
| Member goes offline or invisible | Nothing, roles are left as they are |

The bot compares each presence update with the last status it cached for that user, so a member who edits an unrelated part of their status is not processed again. The watched text must be unique per server; the commands also cap it at 128 characters, the dashboard does not.

## The notification message

If an entry has both a **Notification Channel** and a **Notification Message**, the bot posts the message there every time a member's status starts matching. The text goes through the embed parser, so anything the embed builder produces works, including plain text, up to ten embeds and components. Nothing is posted when the status stops matching.

### Placeholders

The message is run through the standard replacement set for the member, the notification channel and the server. The most useful ones are below; the full list is on the placeholders page under user, server, channel, bot and time.

| Placeholder | Value |
| --- | --- |
| `%user.mention%` | A mention of the member |
| `%user.name%` | The member's username |
| `%user.fullname%` | Username with discriminator |
| `%user.avatar%` | The member's avatar URL |
| `%user.id%` | The member's user ID |
| `%server.name%` | Server name |
| `%server.icon%` | Server icon URL |
| `%channel.mention%` | Mention of the notification channel |
| `%server.time%` | Current time in the server's configured timezone |

> [!NOTE]
> The dashboard editor lists a `%status%` placeholder, but the bot does not replace it. Write the status text into the message yourself.

> [!EXAMPLE]
> `%user.mention% is now repping the server in their status, thank you!`

## Settings

Everything lives on the Status Roles page, which has three tabs: **Status Roles**, **Add New** and **Statistics**. Each entry in the list expands to show its settings.

| Setting | Default | What it controls |
| --- | --- | --- |
| Status Text to Watch For | none | The text a custom status must contain; no length limit on the dashboard, 128 characters through commands |
| Roles to Add | none | Space separated role IDs given when the status matches; Save replaces the whole list |
| Roles to Remove | none | Space separated role IDs taken when the status matches; Save replaces the whole list |
| Notification Channel | none | Channel that receives the notification message |
| Notification Message | none | Text or embed sent to the channel, with placeholders |
| Remove Added | off | Take the added roles back when the status stops matching |
| Readd Removed | off | Give the removed roles back when the status stops matching |

The **Statistics** tab shows the total number of entries, how many change roles, and how many have a notification channel.

## Setup walkthrough

1. Open **Status Roles** in the dashboard and go to the **Add New** tab.
2. Enter the text to watch for and press **Add Status Role**.
3. Switch to the **Status Roles** tab and expand the new entry.
4. Press **Edit Settings**, paste role IDs into **Roles to Add** and **Roles to Remove**, pick a **Notification Channel** and write a **Notification Message** if you want one, then **Save**.
5. Use the two toggle buttons on the entry to turn on **Remove Added** and, if needed, **Readd Removed**.
6. Test it: set your own custom status to the text and confirm the role appears, then clear it and confirm the role is removed.

## Commands

Run these with your server's prefix (`.` unless you changed it). Every command needs Manage Server. The `<index>` is the number shown by `liststatusroles`, starting at 1. Slash versions are under `/statusroles`.

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `addstatusrole <text>` | `asr` | Manage Server | Add a status text to watch for |
| `removestatusrole <index>` | `rsr` | Manage Server | Delete an entry |
| `liststatusroles` | `lsr` | Manage Server | Page through every entry with its index and settings |
| `setaddroles <index> <@role...>` | `sar` | Manage Server | Add roles to the list given when the status matches |
| `setremoveroles <index> <@role...>` | `srr` | Manage Server | Add roles to the list taken when the status matches |
| `removeaddroles <index> <@role...>` | `remar` | Manage Server | Take roles off the "roles to add" list |
| `removeremoveroles <index> <@role...>` | `rmremoveroles` | Manage Server | Take roles off the "roles to remove" list |
| `setstatusrolechannel <index> <#channel>` | `statusrolechannel`, `ssrc` | Manage Server | Set the notification channel |
| `setstatusroleembed <index> [text]` | `statusroleembed`, `asre` | Manage Server | Set the notification message, or with no text preview the current one |
| `toggleremoveadded <index>` | `togglerma` | Manage Server | Toggle **Remove Added** |
| `togglereaddremoved <index>` | `togglermrm` | Manage Server | Toggle **Readd Removed** |

`setaddroles` and `setremoveroles` append to the existing list rather than replacing it. Use the `remove...` commands to take roles off again. The dashboard editor works the other way: whatever is in the box on Save becomes the full list, but an emptied box is ignored, so clearing a list entirely has to be done with the `remove...` commands.

## Tips and gotchas

- The bot needs Manage Roles, and its highest role must sit above every role it adds or removes. Failures are only logged, the member sees nothing.
- The bot must have the presence intent to see custom statuses at all. If nothing happens when you change your status, this is the first thing to check.
- Matching is case sensitive and looks anywhere in the status text. Keep the watched text short and distinctive.
- The bot only looks at the first activity in a member's presence. Discord normally lists the custom status first, but if another activity is reported ahead of it the status is not seen.
- Roles are only changed on a status change. A member who already has the text in their status when you create the entry is not processed until their status changes.
- The notification is sent each time the status starts matching, so a member who toggles their status repeatedly will trigger repeated messages.
- The dashboard takes role IDs, not names. Enable Developer Mode in Discord and right-click a role to copy its ID.
