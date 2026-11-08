---
title: Status Roles
slug: statusroles
summary: Gives or removes a role when a member's custom status contains certain text
icon: fa-user-circle
category: Actions
dashboard: /dashboard/roles?tab=status
module: StatusRoles
tags: [status roles, custom status, vanity, auto role, presence, role automation, status text]
related: [roles, administration, afk]
---

## What it does

Staff add one or more pieces of text to watch for, such as `discord.gg/yourserver` or `playing minecraft`. The bot watches presence updates. When a member's custom status starts containing that text, the bot removes the roles you listed under **Roles to remove** and adds the roles under **Roles to add**. If a channel and message are set, it also posts a notification there.

When the text disappears from their status again, two toggles decide what happens. **Remove added roles when the status is removed** takes back the roles that were given. **Re-add removed roles when the status is removed** gives back the roles that were taken. Both are off by default, so with no changes the member simply keeps whatever roles they ended up with.

Only the custom status is checked, the text you type under "Set a custom status" in Discord. Other activities, such as games or streaming, are ignored, and so are members who are offline or invisible. The match is a plain substring check, so `mewdeko` matches `I love mewdeko` but is case sensitive.

Each server can hold any number of status role entries, each with its own roles and notification settings. Commands refer to an entry by its index, the number shown by `liststatusroles`.

## Why you would use it

- Reward members who put your vanity invite in their status with a supporter role and its perks.
- Give a "streaming" or "looking to play" role while someone advertises it in their status, and remove it when they stop.
- Announce in a channel when a member starts repping the server so staff can thank them.
- Swap one role for another while a status is active, for example move a member out of a "no pings" role while they show a certain status.

## Matching and role changes

| Situation | What the bot does |
| --- | --- |
| Status gains the watched text | Removes **Roles to remove** and adds **Roles to add**, then sends the notification if configured |
| Status keeps the watched text | Nothing, the change is only processed once |
| Status loses the watched text, remove added roles on | Removes any of the **Roles to add** the member still has |
| Status loses the watched text, re-add removed roles on | Gives back any of the **Roles to remove** the member no longer has |
| Member goes offline or invisible | Nothing, roles are left as they are |

The bot compares each presence update with the last status it cached for that user, so a member who edits an unrelated part of their status is not processed again. The commands cap the watched text at 128 characters, the dashboard does not.

## The notification message

If an entry has both a **Notification channel** and a **Notification message**, the bot posts the message there every time a member's status starts matching. The text goes through the embed parser, so anything the embed builder produces works, including plain text and up to ten embeds with components. Nothing is posted when the status stops matching.

### Placeholders

The message is run through the standard replacement set for the member and the server. The notification channel is available too. The most useful ones are below; the full list is on the placeholders page under user, server, channel, bot and time.

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
| `%status%` | The member's custom status text |

> [!EXAMPLE]
> `%user.mention% is now repping the server in their status, thank you!`

## Settings

On the Roles page this feature is the **Status roles** tab. It has two cards, **Status roles** and **Statistics**.

The **Status roles** card lists every entry with its watched text and a line such as `Adds: Supporter • Removes: None`. Each row has an edit and a delete button. With no entries it reads **No status roles**. **Add status role** opens a small form with **Status text**, for example `playing minecraft`, and **Add**. The new entry opens in the editor straight away.

The editor changes save as you make them, with the save status shown on the tab.

| Setting | Default | What it controls |
| --- | --- | --- |
| Roles to add | none | Roles given when the status matches. Managed roles are not listed. |
| Roles to remove | none | Roles taken when the status matches. Managed roles are not listed. |
| Re-add removed roles when the status is removed | off | Give the removed roles back when the status stops matching |
| Remove added roles when the status is removed | off | Take the added roles back when the status stops matching |
| Notification channel | No channel | Channel that receives the notification message |
| Notification message | none | Text or embed sent to the channel, with placeholders |

The watched text has no length limit on the dashboard and is 128 characters at most through commands. It cannot be changed after the entry is created, so delete the entry and add a new one to watch for different text.

The **Statistics** card shows **Total status roles**, **Active configs** (entries that change roles) and **With notifications** (entries with a notification channel).

## Setup walkthrough

1. Open **Roles** and pick the **Status roles** tab.
2. Press **Add status role**, enter the **Status text** to watch for and press **Add**.
3. In the editor that opens, pick **Roles to add** and **Roles to remove**.
4. Turn on **Remove added roles when the status is removed** and, if needed, **Re-add removed roles when the status is removed**.
5. Pick a **Notification channel** and write a **Notification message** if you want an announcement.
6. Close the editor with **Done**.
7. Test it: set your own custom status to the text and confirm the role appears, then clear it and confirm the role is removed.

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
| `toggleremoveadded <index>` | `togglerma` | Manage Server | Toggle removing added roles when the status is removed |
| `togglereaddremoved <index>` | `togglermrm` | Manage Server | Toggle re-adding removed roles when the status is removed |

`setaddroles` and `setremoveroles` append to the existing list rather than replacing it. Use the `remove...` commands to take roles off again. The dashboard works the other way: the roles selected in the editor become the full list.

## Tips and gotchas

- The bot needs Manage Roles, and its highest role must sit above every role it adds or removes. Failures are only logged, the member sees nothing.
- The bot must have the presence intent to see custom statuses at all. If nothing happens when you change your status, this is the first thing to check.
- Matching is case sensitive and looks anywhere in the status text. Keep the watched text short and distinctive.
- The bot only looks at the first activity in a member's presence. Discord normally lists the custom status first, but if another activity is reported ahead of it the status is not seen.
- Roles are only changed on a status change. A member who already has the text in their status when you create the entry is not processed until their status changes.
- The notification is sent each time the status starts matching, so a member who toggles their status repeatedly will trigger repeated messages.
- The role pickers on the dashboard leave out roles that integrations manage, since the bot cannot give those out.
