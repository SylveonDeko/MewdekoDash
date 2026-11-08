---
title: Moderation
slug: moderation
summary: Warn and punish members, with stacking warnings and a numbered case history
icon: fa-flag
category: Security
dashboard: /dashboard/moderation
module: Moderation
tags: [moderation, warn, warnings, warn punish, punishment ladder, mute, mute role, timeout, ban, softban, kick, ban purge, ban prune, purge, prune, dehoist, warnlog, cases, notes, reports, reason aliases, punishment dm]
related: [administration, filter, logging, auditlog]
---

## What it does

Moderation is the toolbox staff use on individual members. Warnings are the core of it: a moderator runs `warn @user reason` and the member gets a DM with the reason and who warned them. The warning is stored. If the server has a warning log channel, an embed lands there with the warn count and any punishment that fired.

Warnings add up. You can build a punishment ladder so that reaching a set number of active warnings triggers something automatically: a mute, a timeout, a kick, a ban, or a role. Staff do not have to remember the rules; the bot applies them the moment the count is hit. Warnings can be forgiven later, or set to expire on their own after a number of days.

Around that sit the direct actions: mute (with a managed mute role), timeout, kick, softban, ban, temporary ban, mass kick, message purging, and nickname clean up for members who hoist themselves to the top of the list with special characters. Every ban action also has a configurable purge, which is how many days of the member's messages Discord deletes along with the ban.

Every warning, mute, timeout, kick, ban and similar action is also recorded as a numbered case. Cases can be browsed, filtered, edited and exported. Staff can keep private notes on members, and short names can stand in for long punishment reasons.

The dashboard page is one scroll of cards covering warnings, the warning punishment ladder, cases, notes, reason aliases, punishment DMs, ban purge settings and recent activity. Direct actions like mute, kick and ban are commands only.

## Why you would use it

- You want a consistent "three strikes" policy that applies the same way no matter which moderator is on shift.
- Members need to be silenced quickly without touching channel permissions by hand.
- A spammer joined and you want their last day of messages gone with the ban, but a temp ban for a regular should not wipe their history.
- Staff need a searchable record of who was warned, by whom, and why, that survives moderator turnover.
- Names like "!!! xXx" keep floating to the top of the member list and you want them cleaned up in one go.

## Warnings

`warn <user> [reason]` needs Ban Members. The bot first tries to DM the member an embed with the server name, the moderator and the reason. If the DM fails, the confirmation in the channel gets a footer saying so. The warning is then saved with the moderator's name and the reason, or `-` if none was given.

The member must be below the moderator in the role hierarchy, and below the bot. If they are not, the command refuses.

`warnlog <user>` shows a paged list, nine per page, with the date, the moderator, the reason and whether it was forgiven. Forgiven warnings show struck through with who cleared them. `warnlogall` lists every member with warnings as `active (total - forgiven)`.

`warnclear <user> [index]` marks warnings forgiven. With no index, or `0`, it forgives all of them. With an index it forgives just that one, numbered as in `warnlog`. Forgiven warnings stay in the log but stop counting toward punishments. The dashboard can also delete a warning outright, which removes it permanently.

### Warning expiry

`warnexpire <days> <clear|delete>` sets how long a warning counts for. Days can be 0 through 366; 0 turns expiry off. The action decides what happens when a warning ages out:

| Action | What happens |
| --- | --- |
| Clear | The warning is marked forgiven and stays in the log |
| Delete | The warning is removed from the database |

Expiry is checked every twelve hours, and once immediately when you set it.

### The warning log channel

Set it with `setwarnchannel #channel` or the **Warning log channel** selector at the bottom of the **Warning punishments** card on the dashboard. Every warning posts an embed there with the member's name and ID, their current warn number, the punishment that fired (or "None"), the reason and a jump link to the message that issued the warning.

## Warn punishments

The ladder is a list of "at N active warnings, do X" rules. When a warning is issued, the bot counts the member's active warnings including the new one and looks for a rule with exactly that count. Only an exact match fires, so a member with a rule at 3 who somehow reaches 4 without one at 4 gets nothing extra.

Set a rule with `warnpunish <number> <punishment> [time]`, or `warnpunish <number> addrole <role> [time]` for the role variant. `warnpunish <number>` with nothing else removes the rule. `warnpunishlist` shows the ladder.

| Punishment | Timed? | What it does |
| --- | --- | --- |
| Mute | Optional | Applies the mute role, or a timed mute if a time is given |
| ChatMute | Optional | Mute role only, no voice mute |
| VoiceMute | Optional | Server voice mute only |
| Timeout | Required, up to 28 days | Discord timeout |
| Kick | No | Kicks the member |
| Softban | No | Bans and immediately unbans to delete messages |
| Ban | Optional | Permanent ban, or a timed ban if a time is given |
| AddRole | Optional | Adds the chosen role, removed again after the time if set |
| RemoveRoles | No | Strips the member's roles |

Times are stored in minutes and can be up to 49 days. Softban, Kick and RemoveRoles refuse a time. Timeout refuses to save without one. Punishments run with the reason "Warned too many times."

On the dashboard the same ladder is the **Warning punishments** card: pick **At warning #**, a **Punishment**, an optional **Duration (minutes)** (empty means permanent), and a **Role to add** for the role punishment, then **Add to ladder**. Each rule in the list has a **Remove** button. Saving a rule at a count that already has one replaces it. Until a rule exists the card shows "No automatic punishments yet. Warnings are only recorded."

> [!EXAMPLE]
> `warnpunish 2 mute 1h`, `warnpunish 3 timeout 1d`, `warnpunish 5 ban`. Two warnings mutes for an hour, three times out for a day, five bans.

## Mini warnings

There is a second, independent warning track called mini warnings, meant for minor infractions handled by junior staff. `mwarn` needs only Mute Members instead of Ban Members. It has its own log (`mwarnlog`, `mwarnlogall`), its own clear command, its own expiry, its own punishment ladder (`mwarnpunish`) and its own log channel (`setmwarnchannel`). Mini warnings never count toward the main ladder and vice versa. The dashboard does not show mini warnings.

## Mutes and the mute role

The bot manages a mute role. By default it is named `Mewdeko-mute`; change it with `muterole @role`, or run `muterole` alone to see the current one. The first time a mute is needed the bot creates the role if it does not exist, then walks every text channel and adds an overwrite denying Send Messages, Add Reactions, Attach Files, Send Messages in Threads and Create Public Threads. Threads are skipped. This can take a moment in servers with many channels.

| Command | Effect |
| --- | --- |
| `mute` | Full mute: adds the mute role |
| `chatmute` | Adds the mute role only |
| `voicemute` | Server mutes the member in voice only |
| `stfu` | Denies Send Messages for that member in the current channel only, via a permission overwrite |

Each has a timed form. Full mutes run from one minute up to 90 days; chat and voice mutes from one minute up to 49 days. `stfu` with a time lifts the overwrite when the time is up. Muted members get a DM when muted and unmuted.

`removeonmute y` makes a full mute also strip the member's other roles and store them, and `unmute` gives them back. `removeonmute n` turns that off. `unmuteall` removes the mute role from everyone who has it after a confirmation prompt, optionally with a reason.

## Timeouts

`timeout <time> <user> [reason]` uses Discord's native timeout, up to 28 days. Both you and the bot need Moderate Members. `untimeout <user>` lifts it. The reason goes into the audit log as `moderator | reason`.

## Bans, kicks and softbans

`ban <user> [reason]` DMs the member first, then bans. `ban <time> <user> [reason]` is a temporary ban that lifts itself, up to 49 days. `ban <pruneTime> <time> <user>` sets the purge window and the ban length explicitly. Banning by ID works for people who are not in the server. `unban <user or id>` reverses it.

`softban <user> [reason]` bans and immediately unbans, which is a kick that also deletes recent messages. `kick <user> [reason]` kicks, and `masskick @a @b @c` kicks several people at once and reports how many succeeded. `masskill` is bot owner only and mass bans a pasted list of IDs.

### The ban DM

The message sent to a banned member can be customised with `banmessage <text or embed code>`, or with **Ban** in the dashboard's **Punishment DMs** card, which edits the same template. The text runs through the embed parser, so anything from the embed builder works. Set it to `-` to send no DM at all, and use `banmsgreset` to return to the default. `banmsgtest [duration] [reason]` sends the current template to you so you can see it.

| Placeholder | Value |
| --- | --- |
| `%ban.mod%` | The moderator's full name |
| `%ban.mod.name%` | The moderator's username |
| `%ban.user%` | The banned member's full name |
| `%ban.user.name%` | The banned member's username |
| `%ban.reason%` or `%reason%` | The reason, or `-` if none |
| `%ban.duration%` | The length as `d.hh:mm`, or `perma` |

Server placeholders such as `%server.name%` also work here.

## Cases

Every warning, mute, unmute, timeout, untimeout, kick, ban, softban, unban and remove-roles action creates a case with a number that counts up per server. A case stores the action, the member, the moderator, the reason and the date.

| Command | Needs | Purpose |
| --- | --- | --- |
| `case <number>` | Ban Members | Show one case |
| `cases <user>` | Ban Members | Page through a member's cases |
| `casereason <number> <reason>` | Ban Members | Change a case's reason |
| `casedelete <number>` | Manage Server | Delete a case permanently |
| `caseexport` | Manage Server | Send every case as a CSV file |
| `modstats` | Ban Members | Number of cases per moderator |
| `modcaselog [#channel]` | Manage Server | Post new cases to a channel, or turn it off with no channel |

The dashboard's **Mod cases** card lists cases 25 per page with **Previous** and **Next** buttons. Filter by **Member ID**, **Moderator ID** and **Action** (**All actions** or one action). Each case has an edit button for the reason and a delete button that asks for confirmation. **Leaderboard** shows how many cases each moderator has and **Export** downloads `cases.csv`. The **Case log channel** selector posts new cases to a channel and **Turn off** clears it.

### Reports

`report <user> <reason>` lets any member report someone to staff, optionally with a message link in the reason. The bot deletes the command message and posts the report in the report channel. Each member can report once every five minutes. Set the channel with `reportlog [#channel]` (Manage Server) or the **Report channel** selector in the **Mod cases** card, and clear it with **Turn off**.

## User notes

Notes are private staff comments on a member and never count toward warnings. In the **User notes** card, enter a member's **User ID** to see their notes and add one (up to 1000 characters) with **Add**. With no ID entered it lists recent notes for the whole server. Each note shows who wrote it and when, and has a delete button.

| Command | Needs | Purpose |
| --- | --- | --- |
| `note <user> <note>` | Ban Members | Add a note |
| `notes <user>` | Ban Members | List a member's notes |
| `noteremove <id>` | Ban Members | Remove one note |
| `noteclear <user>` | Ban Members | Remove every note on a member |

## Reason aliases

A reason alias is a short name that expands to a full reason. When a moderator types the alias as the reason for a warning, mute, kick, ban or similar command, the bot swaps in the saved text.

In the **Reason aliases** card, enter a **Name** (up to 32 characters, no spaces) and a **Reason** (up to 500 characters) and press **Add**. Saving an existing name replaces it. Names are stored lowercase.

| Command | Needs | Purpose |
| --- | --- | --- |
| `reasonalias <name> <reason>` | Manage Server | Save an alias |
| `reasonaliaslist` | Ban Members | List aliases |
| `reasonaliasremove <name>` | Manage Server | Delete an alias |

> [!EXAMPLE]
> `reasonalias spam No advertising or spam.` then `ban @user spam` bans with the full reason.

## Punishment DMs

The **Punishment DMs** card sets the message a member receives for each punishment. Pick a **Punishment** (Warn, Mute, Timeout, Kick, Ban or Softban), write the message in the editor, which accepts embed builder output and shows a preview, and it saves automatically. **Use the default message** puts the built in text back.

| Placeholder | Value |
| --- | --- |
| `%user%` | Member name |
| `%reason%` | Reason given |
| `%mod%` | Moderator name |
| `%duration%` | Length of the punishment |
| `%case%` | Case number |
| `%server%` | Server name |

| Command | Needs | Purpose |
| --- | --- | --- |
| `punishdm <action> <message>` | Manage Server | Set the DM, or `-` to send none |
| `punishdmlist` | Manage Server | Show the DM set for each punishment |
| `punishdmreset <action>` | Manage Server | Back to the default |

## Ban purge

Every ban carries a purge: the number of days of the member's messages Discord deletes with it, from 0 to 7. Rather than one global number, each kind of ban has its own default, and you can override any of them for the whole server, for a category, or for a single channel.

| Action | Key | Built in default |
| --- | --- | --- |
| Ban | `ban` | 7 days |
| Ban by ID | `hackban` | 7 days |
| Temporary ban | `tempban` | none |
| Softban | `softban` | 7 days |
| Mass ban | `massban` | 7 days |
| Ban by avatar hash | `banbyhash` | none |
| Ban in role | `baninrole` | none |
| Ban under age | `banunder` | none |
| Warn punishment | `warnpunish` | none |
| Auto-ban role | `autobanrole` | none |
| Role monitor | `rolemonitor` | none |
| Filter | `filter` | none |
| Lockdown | `lockdown` | none |
| Dashboard | `dashboard` | none |

When a ban happens the bot looks for the most specific setting: the channel the command was run in, then that channel's category, then the server default. Within each level a setting for the exact action beats one set for "all actions". If nothing matches, the built in default applies.

`banprune` shows what a ban from the current channel would purge plus every configured setting. `banpruneset <action|all> <days> [#channel or category]` sets one, `banpruneclear <action|all> [#channel or category]` removes one, and `banprunereset` wipes them all.

The dashboard's **Ban purge** card lists every action under **Server defaults** with a days box each (0 to 7) and an **Unset** button once you override it, an **All actions** fallback row, and an **Overrides** section where you pick a **Scope** (Channel or Category), the target, an **Action** and the **Purge (days)**. Each override can be removed, and **Reset everything to defaults** clears every default and override after confirmation. A channel beats its category, which beats the server default.

## Purging messages

`purge [count] [flags]` deletes up to 1000 messages in the current channel. With no count it deletes the bot's own last 100 messages. `purge @user [count]` deletes only that member's messages from the last two weeks. Flags can be combined: `-s` skips pinned messages, `-nb` skips bots, `-ob` only bots, `-he` only messages with embeds, `-ne` only without, `-c text` only messages containing the text, `-b date` before a date and `-a date` after one.

`purgeuser <user> <count>` searches the last `count` messages (1 to 1000) of every text channel and deletes that user's messages from each.

## Nicknames

`dehoist <user>` and `sanitize <user>` rewrite one member's nickname to drop leading special characters or unusual characters. `dehoistall [nicksOnly]` and `sanitizeall` do it for everyone after a confirmation, running as a background job; `massnickprogress` reports how far along it is and `massnickstop` cancels it. The single-member commands need the bot to have Manage Nicknames; the "all" variants need the bot to have Administrator. In both cases the bot's role must be above the affected members.

## Settings

The Moderation page has no tabs. It is a single page of cards, in this order: **All warnings**, **Warning punishments**, **Mod cases**, **User notes**, **Reason aliases**, **Punishment DMs**, **Ban purge** and **Recent moderation activity**. **Refresh** in the page header reloads every card. Settings save automatically.

| Setting | Default | Where | What it controls |
| --- | --- | --- | --- |
| Warning log channel | none | Warning punishments | Channel that receives an embed for every warning |
| Punishment ladder | empty | Warning punishments | What fires at each warning count |
| Case log channel | none | Mod cases | Channel that receives every new case |
| Report channel | none | Mod cases | Channel that receives member reports |
| Punishment DMs | built in text | Punishment DMs | The DM for Warn, Mute, Timeout, Kick, Ban and Softban |
| Reason aliases | none | Reason aliases | Short names that expand to full reasons |
| Ban purge defaults | per action | Ban purge | Days of messages deleted with each kind of ban |
| Ban purge overrides | none | Ban purge | Per channel or per category purge |
| Warning expiry | off | Commands only | Days until a warning is cleared or deleted |
| Mute role | `Mewdeko-mute` | Commands only | The role applied by mute commands |
| Remove roles on mute | off | Commands only | Strip and restore roles around a full mute |

**All warnings** shows an active and forgiven count. **Warn a user** opens a form for a **User ID to warn** and a required reason (up to 500 characters). Below it, staff can search by user ID, reason or moderator, tick **Show forgiven**, **Forgive** one warning, **Forgive all** for a member, or delete one permanently. Warnings are grouped by member. **Recent moderation activity** lists the ten latest warnings.

> [!WARNING]
> Deleting a warning from the dashboard removes it for good and it stops counting. Forgiving keeps the record and also stops it counting. Forgive unless you have a reason to erase history.

## Setup walkthrough

1. Open **Moderation** in the dashboard and find the **Warning punishments** card.
2. Pick a **Warning log channel** that only staff can read.
3. Add rules to the ladder. A gentle start is Mute for 60 minutes at 2, Timeout for 1440 minutes at 3, Ban at 5.
4. In **Mod cases**, pick a **Case log channel** and a **Report channel** that only staff can read.
5. Run `muterole @Muted` if you already have a muted role, otherwise let the bot create `Mewdeko-mute` on first use.
6. Decide on expiry with `warnexpire 90 clear` so old warnings stop counting after three months.
7. In **Ban purge**, set **Temporary ban** to 0 if you do not want temp bans to delete history, and add channel overrides if a bot spam channel should purge more.
8. Optionally add **Reason aliases** for rule violations you cite often and write your own **Punishment DMs**.
9. Test with an alt: `warn @alt test`, check the log channel, then `warnclear @alt`.

## Commands

Run these with your server's prefix (`.` unless you changed it).

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `warn <user> [reason]` | | Ban Members | Warn a member and apply any ladder punishment |
| `warnlog <user or id>` | | Ban Members | Show a member's warnings |
| `warnlogall` | | Ban Members | Show warning counts for everyone |
| `warnclear <user> [index]` | `warnc` | Ban Members | Forgive all warnings, or one by number |
| `warnexpire <days> <clear|delete>` | `warne` | Administrator | Auto clear or delete warnings after a number of days |
| `warnpunish <number> <punishment> [time]` | `warnp` | Ban Members | Set, or with only a number remove, a ladder rule |
| `warnpunishlist` | `warnpl` | Nobody | Show the punishment ladder |
| `setwarnchannel <#channel>` | `warnchannel` | Administrator | Set the warning log channel |
| `mwarn <user> [reason]` | `miniwarn` | Mute Members | Issue a mini warning |
| `mwarnlog [page] [user or id]` | | Mute Members, or Nobody for your own | Show mini warnings |
| `mwarnlogall` | `mwarnlogs` | Mute Members | Mini warning counts for everyone |
| `mwarnclear <user or id> [index]` | `mwarnc` | Administrator | Forgive mini warnings |
| `mwarnexpire <days> [clear|delete]` | `mwarne` | Administrator | Mini warning expiry |
| `mwarnpunish <number> <punishment> [time]` | `mwarnp` | Administrator | Set or remove a mini warning ladder rule |
| `mwarnpunishlist` | `mwarnplist`, `mwarnpl` | Nobody | Show the mini warning ladder |
| `setmwarnchannel <#channel>` | `mwarnchannel` | Administrator | Set the mini warning log channel |
| `timeout <time> <user> [reason]` | | Moderate Members | Time out a member, up to 28 days |
| `untimeout <user>` | | Moderate Members | Remove a timeout |
| `mute <user> [time] [reason]` | | Manage Roles or Mute Members | Full mute, optionally timed |
| `unmute <user> [reason]` | | Manage Roles or Mute Members | Remove a full mute |
| `chatmute [time] <user> [reason]` | | Manage Roles | Mute role only |
| `chatunmute <user> [reason]` | | Manage Roles | Remove a chat mute |
| `voicemute [time] <user> [reason]` | | Mute Members | Voice mute only |
| `voiceunmute <user> [reason]` | | Mute Members | Remove a voice mute |
| `stfu [time] <user>` | `cmute`, `channelmute` | Mute Members | Deny sending in the current channel only |
| `unstfu <user>` | `unchannelmute` | Mute Members | Undo `stfu` |
| `muterole [role]` | `setmuterole` | Manage Roles | Show or set the mute role |
| `removeonmute <y|n>` | | Administrator | Strip and restore roles around full mutes |
| `unmuteall [reason]` | `umall` | Administrator | Unmute everyone with the mute role |
| `kick <user or id> [reason]` | `k` | Kick Members | Kick a member |
| `masskick <users...>` | `mkick` | Kick Members | Kick several members |
| `ban [time] <user or id> [reason]` | `b` | Ban Members | Ban, or temp ban up to 49 days |
| `unban <user or id>` | | Ban Members | Lift a ban |
| `softban <user or id> [reason]` | `sb` | Kick Members and Manage Messages | Ban then unban to delete messages |
| `banmessage [text]` | `banmsg`, `bantemplate`, `bantemp` | Ban Members | Show or set the ban DM, `-` to disable |
| `banmsgreset` | | Ban Members | Restore the default ban DM |
| `banmsgtest [time] [reason]` | | Ban Members | DM yourself the ban template |
| `masskill <ids and reasons>` | | Bot owner | Mass ban a pasted list |
| `banprune` | `banpurge` | Ban Members | Show effective and configured purge settings |
| `banpruneset <action|all> <days> [channel]` | `banpurgeset` | Administrator | Set a purge setting |
| `banpruneclear <action|all> [channel]` | `banpurgeclear` | Administrator | Remove a purge setting |
| `banprunereset` | `banpurgereset` | Administrator | Remove every purge setting |
| `purge [count or user] [count] [flags]` | `clear`, `prune` | Manage Messages | Bulk delete messages in this channel |
| `purgeuser <user> <count>` | `pruneuser` | Manage Messages | Delete a user's messages across all channels |
| `case`, `cases`, `casereason`, `casedelete`, `caseexport`, `modstats`, `modcaselog` | | Varies, see Cases | Browse and manage cases |
| `note`, `notes`, `noteremove`, `noteclear` | | Ban Members | Staff notes on members |
| `report <user> <reason>` | | Nobody | Report a member to staff |
| `reportlog [#channel]` | | Manage Server | Set the report channel |
| `reasonalias`, `reasonaliaslist`, `reasonaliasremove` | | Varies, see Reason aliases | Manage reason aliases |
| `punishdm`, `punishdmlist`, `punishdmreset` | | Manage Server | Manage punishment DMs |
| `dehoist <user>` | | Manage Nicknames | Fix one hoisted nickname |
| `dehoistall [nicksOnly]` | `dehoista` | Manage Nicknames | Fix every hoisted nickname |
| `sanitize <user>` | | Manage Nicknames | Normalise one nickname |
| `sanitizeall` | `sanitizea` | Manage Nicknames | Normalise every nickname |
| `massnickprogress` | `mnickprogress`, `mnp` | Administrator | Progress of a running dehoist or sanitize |
| `massnickstop` | `mnstop`, `mns` | Administrator | Stop a running dehoist or sanitize |

## Tips and gotchas

- The bot's role must sit above anyone it mutes, kicks or bans, and above the mute role itself. Most "cannot apply punishment" errors are hierarchy problems.
- The bot needs Ban Members, Kick Members, Moderate Members, Manage Roles and Manage Messages for the matching commands; each command checks the bot's own permission before running.
- The ladder only fires on an exact count. Fill in every step you care about rather than assuming "3 or more".
- Only warnings issued through the bot count. Discord's own timeouts and bans do not add warnings.
- The mute role denies permissions per channel. Channels created after the role exists get the overwrite the next time someone is muted, not immediately.
- Discord only lets bulk delete reach back 14 days. Older messages are skipped by purge commands.
- Purge on ban is capped at 7 days by Discord no matter what you configure.
- Warnings from the dashboard need a valid reason and use your dashboard account as the moderator name.
