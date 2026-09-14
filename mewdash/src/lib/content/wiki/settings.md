---
title: Settings
slug: settings
summary: The server-wide basics: command prefix, language, timezone, log channels, mute role, warning expiry and a few chat utilities.
icon: fa-cog
category: Settings
dashboard: /dashboard/settings
module: Administration
tags: [settings, prefix, language, locale, timezone, mute role, warn expire, command log, staff role, member role, snipe, link previews, delmsgoncmd]
related: [administration, logging, filter, suggestions]
---

## What it does

The Settings page holds the handful of options that affect every module at once rather than one feature. It is where you change the prefix members type before commands, the language the bot replies in, the timezone used for reminders and scheduled messages, and the channels where command usage and warnings are logged.

It also covers the mute role name, whether a muted member loses their other roles, how long warnings last, and two chat utilities: message sniping and message link previews.

Most of these settings have a matching text command, so staff can change them from Discord as well. A few extras live only in commands: the staff role, the member role and per-channel command message deletion.

## Why you would use it

- Your server already uses `.` for another bot and you want Mewdeko on `!` or `m!`.
- Your community speaks a language other than English and you want replies to match.
- Reminders and scheduled posts should land at the right local time, not UTC.
- Moderators want a channel that records every command run and every warning issued.
- Warnings should fade after a set number of days instead of piling up forever.
- Members should be able to `snipe` a deleted message, or link previews should be turned off in a busy chat.

## Prefix

The prefix is the text a member types before a command. It defaults to `.`. Anyone can run `prefix` with no argument to see the current prefix. Administrators change it with `prefix <new>` or, from the dashboard, the **Command Prefix** box. Slash commands are not affected by the prefix.

## Language

Each server can pick its own reply language with `languageset <code>`, for example `languageset de`, or with the **Language** dropdown on the dashboard. `languageset default` clears the override so the server follows the bot's default language. `languageslist` prints every supported locale code. `langsetdefault` with no argument shows the bot default; changing that default is a bot owner action.

## Timezone

The server timezone drives reminders, scheduled messages and any time display. `timezone` on its own shows the current value (UTC if none is set). `timezone <id>` sets it using an IANA or Windows timezone identifier such as `Europe/London`, and `timezones` pages through the identifiers the bot accepts. On the dashboard, **Server Timezone** saves the moment you pick a value; it does not wait for **Save Changes**.

## Log channels

**Command Log Channel** records command usage. Set it with `commandlogchannel #channel`; run the command with no channel to turn logging off.

**Warning Log Channel** records warnings issued by the moderation commands. This is set from the dashboard.

## Warnings

**Warning Expiry** is stored in hours. Zero means warnings never expire. The `warnexpire` command works in days instead and takes a second word: `warnexpire 30 clear` marks warnings older than 30 days as cleared, `warnexpire 30 delete` removes them. The accepted range is 0 to 366 days, and `warnexpire 0` turns expiry off.

## Mute role and role removal

**Mute Role** is the name of the role the mute commands and punishments apply. If a role with that name does not exist the bot creates it. From Discord, `muterole @role` points the setting at an existing role; the role must sit below your own highest role unless you are the server owner. `muterole` with no argument shows the current mute role.

**Remove all other roles while muted** strips a member's other roles for the duration of a mute and returns them afterwards. The command form is `removeonmute y` or `removeonmute n`.

## Chat utilities

| Setting | Command | Effect |
| --- | --- | --- |
| Message sniping | `snipeset enable` or `snipeset disable` | Lets members use the snipe commands to recover recently deleted or edited messages. Off by default. |
| Message link previews | `previewlinks y` or `previewlinks n` | When someone posts a link to a Discord message, the bot shows that message's contents. |

## Command-only settings

These are part of the same Administration module but have no dashboard control.

**Staff role** (`staffrole @role`) marks a role whose members are exempt from the word, link and invite filters, and from suggestion spam checks. Run `staffrole` with no role to see the current one and `staffroledisable` to clear it.

**Member role** (`memberrole @role`) stores a role for the server. It is recorded but not used by any feature at the moment.

**Delete message on command** (`delmsgoncmd`) removes the message that triggered a command once the command runs:

| Form | Effect |
| --- | --- |
| `delmsgoncmd` | Toggle deletion for the whole server |
| `delmsgoncmd list` | Show the server setting and every channel override |
| `delmsgoncmd channel enable [#channel]` | Always delete in that channel (current channel if omitted) |
| `delmsgoncmd channel disable [#channel]` | Never delete in that channel |
| `delmsgoncmd channel inherit [#channel]` | Follow the server setting |

## Settings

Everything below is on the single **Bot Settings** page. Press **Save Changes** after editing; only **Server Timezone** saves on its own.

| Setting | Default | What it controls |
| --- | --- | --- |
| Command Prefix | `.` | Text typed before commands |
| Command Log Channel | none | Channel where command usage is logged |
| Currency Emoji | none | Emoji shown for the server currency |
| Warning Log Channel | none | Channel where warnings are logged |
| Warning Expiry | 0 (never) | Hours until warnings expire |
| Language | Bot default | Reply language for this server |
| Server Timezone | UTC | Timezone for scheduled messages, reminders and time displays |
| Mute Role | Muted | Name of the role applied by mutes and punishments |
| Remove all other roles while muted | Off | Strip other roles for the length of a mute |
| Message sniping | Off | Allow the snipe commands |
| Message link previews | Off | Expand Discord message links |

> [!NOTE]
> The page only covers the shared basics. Logging, moderation, starboard and other features have their own pages with their own settings.

## Setup walkthrough

1. Open **Settings** in the dashboard.
2. Set **Command Prefix** if `.` clashes with another bot.
3. Pick a **Language** and a **Server Timezone**.
4. Choose a **Command Log Channel** and a **Warning Log Channel** that only staff can read.
5. Set **Warning Expiry** in hours, for example `720` for thirty days, or leave it at 0.
6. Check the **Mute Role** name matches the role your moderators already use, or leave it as `Muted` and let the bot create one.
7. Turn on **Message sniping** or **Message link previews** if you want them.
8. Press **Save Changes**.
9. In Discord, run `staffrole @YourStaffRole` so filters and suggestion limits skip your team.

## Commands

Run these with your server's prefix (`.` unless you changed it).

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `prefix [new prefix]` | | Nobody to view, Administrator to change | Show or set the command prefix |
| `languageset <code>` | `langset` | Administrator | Set the server reply language, or `default` to clear it |
| `langsetdefault` | `langsetd` | Nobody to view, Bot owner to change | Show or set the bot-wide default language |
| `languageslist` | `langli` | Nobody | List supported locale codes |
| `timezone [id]` | | Nobody to view, Administrator to change | Show or set the server timezone |
| `timezones` | | Nobody | Page through accepted timezone identifiers |
| `commandlogchannel [#channel]` | `commandlog`, `logcommands` | Administrator | Set the command log channel, or disable with no channel |
| `warnexpire <days> <clear or delete>` | `warne` | Administrator | Expire warnings after a number of days |
| `muterole [@role]` | `setmuterole` | Manage Roles | Show or set the mute role |
| `removeonmute <y or n>` | | Administrator | Strip other roles while muted |
| `snipeset <enable or disable>` | `setsnipe` | Administrator | Allow or block the snipe commands |
| `previewlinks <y or n>` | `plinks` | Administrator | Expand Discord message links |
| `staffrole [@role]` | | Administrator | Show or set the staff role |
| `staffroledisable` | | Administrator | Clear the staff role |
| `memberrole [@role]` | | Administrator | Show or set the member role |
| `delmsgoncmd [list or channel <state> [#channel]]` | `dmc` | Administrator | Delete command messages server-wide or per channel |

## Tips and gotchas

- `delmsgoncmd` needs the bot to have Manage Messages, otherwise the command refuses to run.
- The dashboard stores warning expiry in hours while `warnexpire` takes days. `warnexpire 1` and a dashboard value of `24` are the same thing.
- `muterole` compares the role you pass against your own top role. If it errors with insufficient permissions, ask the owner or pick a lower role.
- Slash commands ignore the prefix entirely, so a prefix change only affects text commands.
- The staff role exemption only covers filters and suggestion spam checks. It does not grant command permissions; use the Permissions module for that.
