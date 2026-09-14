---
title: Administration
slug: administration
summary: Automatic raid, spam, alt, scam and honeypot protection, roles handed out on join or picked up by members, Discord permission overrides for commands, and the mass operations you reach for on a bad day.
icon: fa-cog
category: Security
dashboard: /dashboard/administration
module: Administration
tags: [admin, anti-raid, anti-spam, anti-alt, anti-pattern, anti-mass-mention, anti-mass-post, honeypot, anti-image-hash, scam images, reaction roles, self-assignable roles, auto-assign roles, auto-ban roles, voice channel roles, permission overrides, dpo, mass ban, prune, server recovery, staff role, timezone, cooldowns]
related: [moderation, permissions, logging, multigreets, settings, auditlog, rolestates]
---

## What it does

Administration is the module that keeps a server orderly when no moderator is watching. Its protection systems watch joins and messages and punish automatically when something looks like a raid, a spam burst, a throwaway alt, a mass ping, a scam link pasted into every channel, a post in a trap channel, or a known scam image. Each system is independent, has its own punishment, and can be switched on and off on its own.

The same module handles role automation: roles given on join, roles members pick up themselves with `iam`, reaction roles, roles tied to being in a voice channel, and tripwire roles that ban whoever receives them. It also lets you change which Discord permission a command needs, set the staff and member roles other features rely on, rate limit commands, and clean up command messages.

For the bad days there are mass operations: ban or kick everyone who joined in the last few minutes, ban by name pattern, by role, or by avatar, prune inactive members, and a server recovery flow that gets an administrator role back to a verified owner.

Everything lives on the **Administration** page of the dashboard across five tabs: **Overview**, **Protection Systems**, **Roles & Permissions**, **Automation & Settings** and **Advanced Operations**. Nearly every setting also has a command.

## Why you would use it

- Join raids and bot waves hit at 3am and you want them handled before anyone wakes up.
- A compromised account is pasting the same phishing link into ten channels.
- Members should be able to pick their own colour, region or notification roles without staff help.
- You want `ban` to work for people with Manage Messages instead of Ban Members, without touching Discord's role settings.
- One command is spammed in general and needs a cooldown.
- A rogue admin stripped the owner's roles and you need a way back in.

## Punishments

Every protection system takes a **punishment action**. Some actions also take a **duration** or a **role**.

| Action | What happens |
| --- | --- |
| Mute | Applies the server's mute role (text and voice) |
| ChatMute | Mute role for text only |
| VoiceMute | Server mutes the member in voice |
| Kick | Removes the member; they can rejoin |
| Softban | Bans and immediately unbans to wipe recent messages |
| Ban | Bans, or temporarily bans if you give a duration |
| Timeout | Discord native timeout; needs a duration, at most 28 days |
| AddRole | Adds the role you pick, for example a quarantine role |
| RemoveRoles | Strips every role |
| Warn | Adds a warning through the Moderation module |
| Delete | Deletes the offending message and nothing else |
| None | Records the hit and takes no action |

Only Ban, Mute, ChatMute, VoiceMute, AddRole and Timeout accept a duration; for anything else a duration is ignored. Durations are in minutes. The dashboard allows up to 10080 (one week) for Anti-Raid, Anti-Spam, Anti-Mass-Mention and Anti-Pattern, 1440 (one day) for Anti-Mass-Post, Anti-Post-Channel and Anti-Image-Hash, and a year for Anti-Alt. Punishments are applied one per second from a queue, and the reason on Discord's audit log reads like "Raiding Protection" or "ImageHash Protection".

> [!WARNING]
> Anti-Raid, Anti-Alt and Anti-Pattern run when a member joins, and they skip the check entirely when the action is Warn. Pick Kick, Ban, Timeout or a role for those three.

Members with the Administrator permission are exempt from every message based protection. Bots are ignored by the join based protections and by Anti-Spam; the others have an **Ignore bots** toggle.

## Protection systems

The **Protection Systems** tab shows a card per system with an **Enabled** or **Disabled** button and, once enabled, a **Configure** button that opens its settings. Enabling from the dashboard applies a starter configuration; open **Configure** and check the action before you rely on it. The **Overview** tab shows how many of the seven systems are active and lists each one.

### Anti-Raid

Counts members joining within a rolling window. When the count reaches the **user threshold** inside the **window** (seconds), everyone counted in that burst is punished together. The command takes a threshold of 2 to 30 and a window of 2 to 300 seconds; the dashboard accepts 1 to 50 and 1 to 300. AddRole is not supported here. Bots joining are not counted.

> [!EXAMPLE]
> `antiraid 10 10 Ban` bans everyone when ten accounts join within ten seconds. `antiraid 10 10 Timeout 1h` times them out for an hour instead.

### Anti-Spam

Counts consecutive identical messages from one member, compared case insensitively. When the count reaches the **message threshold** (2 to 10 with the command, 1 to 20 on the dashboard) the member is punished and the count resets. A different message resets the count; each counted message drops off after thirty minutes. Channels on the **ignored channels** list are skipped, which suits bot command channels. Use `antispam <count> <action> <role>` with AddRole to hand out a role instead.

### Anti-Alt

Checks the age of every account that joins. Accounts younger than the **minimum age** (in minutes; `antialt 3d Kick` works too) are punished on the spot. It only runs on join, so enabling it does not scan existing members. The dashboard starter value is 1440 minutes, one day.

### Anti-Mass-Mention

Counts user and role mentions. A single message with at least the **mention threshold** is punished immediately. Below that, mentions are added up per member over the **time window** (seconds), and going past the **max mentions in window** triggers the punishment. **Ignore bots** decides whether bot messages count.

### Anti-Pattern

Scores every new member for signs of being a throwaway or bot account, and punishes when the score reaches the **minimum score**. It runs at join time and looks at the account, not at messages.

| Signal | Points | Setting |
| --- | --- | --- |
| Account created within the max age | 5 | **Check account age**, **Max account age (months)** |
| Joined soon after the account was created | 10 if under an hour, 7 if under six hours, otherwise 3 | **Check join timing**, **Max join hours** |
| Other members were created in the same hour | 1 per account, up to 10 | **Check batch creation** |
| Account shows as offline while joining | 2 | **Check offline status** |
| Account younger than the new account cutoff | 3 | **Check new accounts**, **New account days** |
| Username matches one of your regex patterns | 15 | Pattern with **check username** |
| Display name matches one of your patterns | 12 | Pattern with **check display name** |

A pattern match punishes as soon as the running score is at or above the minimum; the other signals alone can also reach it. Patterns are regular expressions, matched case insensitively against the lowercase name. The dashboard starter values are minimum score 15, six months, 48 hours, seven days, all checks on. On the dashboard the **Patterns** button on the card opens the pattern list, where each pattern has a name, the regex, and the two name checkboxes.

With commands, `patternadd <regex> [name] [checkUsername] [checkDisplayName]` adds one and `patternconfig <setting> <value>` adjusts `accountage`, `maxaccountage`, `jointiming`, `maxjoinhours`, `batchcreation`, `offlinestatus`, `newaccounts`, `newaccountdays` or `minimumscore`. `patternconfig` alone shows the current values and how often the system has fired.

### Anti-Mass-Post

Catches a member posting the same or similar content into several channels in quick succession, the classic "paste the scam link everywhere" pattern that Anti-Spam misses because the messages are spread out.

For each member the bot keeps the last fifty messages inside the **time window** (10 to 600 seconds). A message is compared with the earlier ones and counts as similar when it is at least 80% alike by edit distance, ignoring case. When similar messages exist in at least the **channel threshold** (2 to 20) distinct channels, the member is punished. Messages shorter than twenty characters are ignored.

**Check links only** is on by default: only messages containing a link are tracked at all. Ignored users, roles and channels are respected. By default the triggering message is deleted and the member is sent a DM explaining why.

### Anti-Post-Channel

Sets up **honeypot channels**. Mark one or more channels that real members have no reason to post in, usually hidden low in the channel list with a warning name. Anything that posts there is treated as a bot or compromised account: the message is deleted, the poster gets a DM, and the punishment is applied. Administrators are exempt, and you can add **ignored roles** and **ignored users** (by ID).

The bot also keeps a **status embed** up to date in a status channel: the channel you ran `antipostchannel` in, or, when enabled from the dashboard, the first honeypot channel that catches someone. The embed shows the action, number of honeypot channels, total catches, and the last ten members caught.

### Anti-Image-Hash

Blocks specific images by how they look, so a re-upload that was resized, recompressed, brightened, mirrored or wrapped in a border still matches. Each blocked image is stored as a perceptual hash together with its mirror image and, when it has a solid border, a border stripped copy. Posted attachments (and embeds, if **check embeds** is on) are hashed the same way and compared.

- **Match tolerance** (0 to 64, default 31) is how different a posted image may be and still count. Lower it if an innocent image is caught; raise it only if scams slip through.
- **Catch bordered copies** strips a solid border off a posted image before matching. Mirrored copies are always caught.
- Images that are too plain to identify reliably are never matched, and never accepted as a block, because they would match unrelated images.
- Images larger than 8 MB are not downloaded or hashed. The limit can be set between 1 and 32 MB through the API, but neither the dashboard card nor a command exposes it.
- Each blocked image can carry its own action, duration and role, overriding the system default. **Delete only** removes the image without punishing the poster.
- Ignored roles and channels are skipped; the poster gets a DM by default.

**Block known scam images** switches on a preset list shipped with the bot, currently the fake crypto casino and MrBeast giveaway images circulating on Discord. The card shows how many images are on the list and how many posts it has caught in your server.

To block your own image on the dashboard, drop or upload the file, or paste its URL, give it a label, optionally pick a per-image action, and save. With commands, run `blockimage [action] [name]` while attaching the image, replying to a message that contains it, or pasting the link. `blockedimages` lists everything with hit counts, `unblockimage <id>` removes one, and `imagehash` shows an image's hash without blocking it.

> [!TIP]
> Turn on Anti-Post-Channel and the known scam image list first. Neither produces false positives in normal chat, and together they catch most automated scam activity.

## Roles

These cards are on the **Roles & Permissions** tab.

### Auto-assign roles

Roles given to every member the moment they join, with a separate list for bots. Members still completing membership screening get their roles once they are approved. If Role States is set to skip auto-assign for members with a saved role state, returning members keep their old roles instead. `autoassignrole <role>` toggles a role in the list; run it alone to see the list.

### Self-assignable roles

Roles members can give themselves with `iam <role>` and drop with `iamnot <role>`. Roles are sorted into numbered **groups** (group 0 is "Ungrouped"), and groups can be named. **Exclusive mode** is a server wide toggle: when it is on, taking a role from a group removes any other role you hold from that group, which is ideal for colours or regions. A role can require a minimum XP **level**. **Remove iam messages** deletes both the command and the reply after three seconds to keep the channel clean.

### Reaction roles

Attach emoji to roles on an existing message. Members click the emoji to get the role and remove it to lose it. Each message can be marked **Exclusive** so a member may hold only one role from it. Discord allows twenty reactions per message, and the dashboard counts them for you. Adding to a message that already has reaction roles extends the existing setup.

With commands, `reactionroles [messageId] [excl] <role> <emoji> ...` sets up pairs; leave the message ID out to use the message directly above your command. `reactionroleslist` shows every setup with an index, and `reactionrolesremove <index>` deletes one.

### Voice channel roles

Bind a role to a voice channel. Members receive the role when they join the channel and lose it when they leave. Use it to open a text channel only to people currently in a call.

### Auto-ban roles

Any role in this list is a tripwire: the moment a member gains it, they are banned. The reason defaults to "Auto-ban role assigned" unless you set one with `autobanrolereason`. Combine it with a reaction role on a hidden message to catch self-assigning bots. The number of days of messages deleted follows the Moderation module's ban prune setting.

## Permission overrides and command permissions

**Permission overrides** replace the Discord permission a command normally checks. Add an override for `ban` requiring Manage Messages and anyone with Manage Messages can run it; add one requiring Administrator and only administrators can. When several permissions are listed the user needs all of them. With commands, `dpo <command> <permission> [permission...]` sets one, `dpo <command>` with no permissions removes it, `dpol` lists them and `dpor` clears everything after a confirmation. Custom chat trigger names are accepted too.

The **Permissions Management** card on the same tab is the rule based command permission system: allow or deny a command, a module or everything for a user, role, channel, category or the whole server, evaluated top to bottom. It has its own article, see `permissions`.

## Server settings

These cards are on the **Automation & Settings** tab.

| Setting | Default | What it controls |
| --- | --- | --- |
| **Staff Role** | none | The role other features treat as staff |
| **Member Role** | none | The role treated as "member"; `prunemembers` can include people with it |
| **Server Timezone** | UTC | Timezone used wherever the bot prints local times |
| **Command Cooldowns** | none | Per command rate limit in seconds, 1 to 90,000 |
| **Permission Overrides** | none | Discord permission each command requires (see above) |
| **Game Voice Channel** | none | When a member in this voice channel starts playing a game, the bot moves them to the voice channel whose name matches the game |
| **Delete Message On Command** | off | Delete the invoking message after a command runs, with per channel overrides of Enable, Disable or Inherit |
| **Stats opt-out** | opted in | Stop command usage statistics for this server; **Delete Stats** wipes what is stored |

## Advanced operations

The **Advanced Operations** tab holds three cards. Every mass operation asks for confirmation and then runs without further checks.

### Custom Ban Message

The message a member receives by DM when they are banned, built in the embed editor. It is the same template the Moderation module's ban command uses.

### Server Recovery

A way to get an Administrator role back to the owner after a compromised admin removes it. Two secrets are stored for the server: a **recovery key** and a **two-factor key**.

- Running `/serverrecovery server-recover` as the server owner when nothing is set up generates both: a recovery key sent to you by DM, and an authenticator secret shown as a QR code. Confirm with a code from your authenticator app to finish.
- Once set up, anyone who runs `/serverrecovery server-recover`, enters the recovery key and then a valid authenticator code is given a new role called "Recovered Server Owner Role" with Administrator, placed just under the bot's highest role.
- `/serverrecovery clear-server-recover` deletes the stored keys after a confirmation, as does **Remove recovery setup** on the dashboard.

The dashboard card can also store keys directly: generate or type a recovery key of at least sixteen characters and a two-factor key. The bot verifies codes against that two-factor key as an authenticator (TOTP) secret, so enter a base32 secret you have added to an authenticator app, not a plain password.

> [!PERMISSION]
> The bot itself must have Administrator for recovery to run, and its highest role must sit high enough that a role just beneath it still outranks the people you are recovering from.

### Mass Operations

| Operation | What it does |
| --- | --- |
| **Prune Inactive Users** | Discord's member prune for members inactive for the given number of days (1 to 30) |
| **Mass Ban Users** | Bans a pasted list of user IDs with one reason; message deletion follows the Moderation ban prune setting |
| **Mass Rename Users** | Sets every member's nickname to a pattern where `{username}` is replaced with their username, for example `[AFK] {username}`; members the bot cannot rename are skipped |
| **Prune to Message** | Deletes every message after a given message ID in a channel, one at a time |

The commands add ways to pick who gets banned: `banunder 10m` bans everyone who joined in the last ten minutes (`-p` previews the list first, `-accage 1d` also requires the account to be under a day old), `kickunder` does the same with a kick, `nameban <regex>` bans usernames matching a pattern after a preview, `baninrole <role>` bans everyone holding a role, and `banbyhash <avatarHash>` bans every member using a given avatar. All of them ask you to confirm.

## Setup walkthrough

1. Open **Administration** in the dashboard and go to **Protection Systems**.
2. Enable **Anti-Raid**, press **Configure**, and set a threshold and window that fit your normal join rate. Pick Kick or Ban as the action.
3. Create a hidden channel that only bots would post in, enable **Anti-Post-Channel**, and add it under **Honeypot Channels**.
4. Enable **Anti-Image-Hash** and press **Block known scam images**.
5. Enable **Anti-Mass-Post** with the default three channels in sixty seconds and links only.
6. Under **Roles & Permissions**, add your member role to **Auto-Assign Roles** for normal users, and set up a colour group with **Add Self-Assignable Role**, then turn on **Exclusive mode**.
7. Under **Automation & Settings**, set the **Staff Role**, **Member Role** and **Server Timezone**.
8. Under **Advanced Operations**, set up **Server Recovery** while things are calm.
9. Check **Overview**: it lists every protection system and whether it is active.

## Commands

Run these with your server's prefix (`.` unless you changed it). Protection commands run with no arguments disable that system.

### Protection

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `antiraid [threshold] [seconds] [action] [duration]` | | Administrator | Configure or disable Anti-Raid |
| `antispam [count] [action] [duration or role]` | | Administrator | Configure or disable Anti-Spam |
| `antialt [minAge] [action] [duration or role]` | | Administrator | Configure or disable Anti-Alt |
| `antimassmention [threshold] [window] [max] [ignoreBots] [action] [duration or role]` | `amm`, `massmention`, `stopmassmention` | Administrator | Configure or disable Anti-Mass-Mention |
| `antipattern [action] [duration or role]` | `apattern` | Administrator | Configure or disable Anti-Pattern |
| `patternadd <regex> [name] [checkUsername] [checkDisplayName]` | `padd` | Administrator | Add a name pattern |
| `patternremove <id>` | `premove`, `prem` | Administrator | Remove a pattern by ID |
| `patternlist` | `plist` | Administrator | List patterns |
| `patternconfig [setting] [value]` | `pconfig` | Administrator | Show or change Anti-Pattern scoring settings |
| `antimasspost [channels] [seconds] [action] [duration]` | | Administrator | Configure or disable Anti-Mass-Post |
| `antipostchannel [action] [duration]` | | Administrator | Configure or disable honeypot channels; the current channel becomes the status channel |
| `antipostchanneladd <#channel>` | | Administrator | Add a honeypot channel |
| `antipostchannelremove <#channel>` | | Administrator | Remove a honeypot channel |
| `antiimagehash [action] [tolerance] [duration]` | `aih` | Administrator | Configure or disable Anti-Image-Hash |
| `blockimage [action] [name]` | `banimage` | Administrator | Block the attached, replied to or linked image |
| `unblockimage <id>` | `unbanimage` | Administrator | Remove a blocked image |
| `blockedimages` | `blockedimagelist` | Administrator | List blocked images with hit counts |
| `imagehash [url]` | | Administrator | Show an image's hash |
| `antiimagehashpreset` | `aihpreset`, `blockcommonscams` | Administrator | Toggle the known scam image list |
| `antiimagehashignore <role or #channel>` | `aihignore` | Administrator | Toggle a role or channel exemption |

### Roles

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `autoassignrole [role]` | `aar` | Manage Roles | Toggle a role on join, or list them |
| `autoassignbotrole [role]` | `aabr` | Manage Roles | Same for bots |
| `asar [group] <role>` | | Manage Roles | Make a role self-assignable, optionally in a group |
| `rsar <role>` | | Manage Roles | Remove a self-assignable role |
| `lsar` | | Nobody | List self-assignable roles by group |
| `sargn <group> [name]` | | Manage Roles | Name a group, or clear its name |
| `togglexclsar` | `tesar` | Manage Roles | Toggle exclusive mode |
| `rolelevelreq <level> <role>` | `rlr` | Manage Roles | Require an XP level for a role |
| `adsarm` | | Manage Messages | Toggle deleting `iam` messages |
| `iam <role>` | | Nobody | Give yourself a self-assignable role |
| `iamnot <role>` | `iamn` | Nobody | Remove one |
| `reactionroles [messageId] [excl] <role> <emoji>...` | `rero` | Manage Roles | Set up reaction roles on a message |
| `reactionroleslist` | `reroli` | Manage Roles | List reaction role setups |
| `reactionrolesremove <index>` | `rerorm` | Manage Roles | Remove a setup by index |
| `vcrole [voiceChannel] [role]` | | Manage Roles | Bind a role to a voice channel (your current one if omitted); no role removes the binding |
| `vcrolerm <channelId>` | | Manage Roles | Remove a binding by channel ID |
| `vcrolelist` | | Nobody | List voice channel roles |
| `autobanroleadd <role>` | `abra` | Administrator | Add a tripwire role |
| `autobanroleremove <role>` | `abrr` | Administrator | Remove one |
| `autobanrolelist` | `abrl` | Administrator | List tripwire roles and reasons |
| `autobanrolereason <role> [reason]` | `abreason` | Administrator | Show, set or clear the ban reason |
| `setrole <role> <user> [time]` | `sr`, `giverole` | Manage Roles | Give a role, optionally for a limited time |
| `removerole <role> <user>` | `rr` | Manage Roles | Remove a role |
| `removeallroles <user>` | `rar` | Manage Roles | Strip every role |
| `createrole [name]` | `cr` | Manage Roles | Create a role |
| `deleterole <role>` | `dr` | Manage Roles | Delete a role |
| `renamerole <role> <name>` | `renr` | Manage Roles | Rename a role |
| `rolehoist <role>` | `rh` | Manage Roles | Toggle showing the role separately |
| `rolecolor <role> [color]` | `roleclr` | Nobody to view, Manage Roles to set | Show or set a role's colour |

The `autobanrole` commands are also available as `/autobanrole list`, `add`, `remove` and `reason` slash commands.

### Permissions and settings

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `dpo <command> [permission...]` | | Administrator | Set or remove a permission override |
| `dpol` | `dpoli` | Administrator | List overrides |
| `dpor` | | Administrator | Clear all overrides |
| `staffrole [role]` | | Administrator | Show or set the staff role |
| `staffroledisable` | | Administrator | Clear the staff role |
| `memberrole <role>` | | Administrator | Show or set the member role |
| `delmsgoncmd [list, server, or channel <enable, disable, inherit> [#channel]]` | `dmc` | Administrator | Show, toggle, or override command message deletion |
| `gamevoicechannel` | `gvc` | Administrator | Toggle your current voice channel as the game voice channel |
| `timezone [id]` | | Nobody to view, Administrator to set | Show or set the server timezone |
| `timezones` | | Nobody | List available timezone IDs |
| `prefix [new]` | | Nobody to view, Administrator to set | Show or change the command prefix |
| `languageset <name>` | `langset` | Administrator | Set the server language, or `default` |
| `langsetdefault [name]` | `langsetd` | Nobody to view, Bot owner to set | Show or set the bot wide default language |
| `languageslist` | `langli` | Nobody | List supported languages |
| `guildstatsoptout` | `gstatsoptout` | Administrator | Toggle command statistics for this server |
| `deleteguildstatsdata` | `delguildstatsdata` | Administrator | Delete stored statistics, once per hour |

### Mass operations and utilities

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `banunder <time> [-p or -accage <time>]` | | Administrator | Ban everyone who joined within the time |
| `kickunder <time> [-p]` | | Administrator | Kick everyone who joined within the time |
| `nameban <regex>` | `nban` | Administrator | Ban members whose username matches, with preview |
| `baninrole <role> [reason]` | | Administrator | Ban everyone holding a role |
| `banbyhash <avatarHash>` | `bbh` | Administrator | Ban everyone with a given avatar hash |
| `prunemembers <time> [yes]` | `memberprune` | Administrator | Prune members inactive for that many days; `yes` includes the member role |
| `setnick [user] <nickname>` | | Manage Nicknames | Change a member's nickname, or the bot's own |
| `deafen <users...>` | `deaf` | Deafen Members | Server deafen |
| `undeafen <users...>` | `undef` | Deafen Members | Undo it |
| `creatxtchanl <name>` | `ctch` | Manage Channels | Create a text channel |
| `deltxtchanl <#channel>` | `dtch` | Manage Channels | Delete a text channel |
| `creatvoichanl <name>` | `cvch` | Manage Channels | Create a voice channel |
| `delvoichanl <channel>` | `dvch` | Manage Channels | Delete a voice channel |
| `settopic [topic]` | `st` | Manage Channels | Set the current channel's topic |
| `setchanlname <name>` | `schn` | Manage Channels | Rename the current channel |
| `renamechannel <channel> <name>` | `channelrename` | Manage Channels | Rename any channel |
| `nsfwtoggle` | `nsfw`, `nsfwtgl` | Manage Channels | Toggle the NSFW flag on the current channel |
| `edit [#channel] <messageId> <text>` | | Manage Messages in that channel | Edit one of the bot's messages |
| `delete [#channel] <messageId> [time]` | `del` | Manage Messages in that channel | Delete a message now or after a delay of up to seven days |
| `setguildavatar [url]` | `sgav`, `setgav` | Manage Server | Set the server icon from a URL or attachment |
| `setguildbanner [url]` | `sgbanner`, `setgbanner` | Manage Server | Set the server banner |
| `setguildbio <text>` | `sgbio`, `setgbio` | Manage Server | Set the server description |

Server recovery is slash only: `/serverrecovery server-recover` and `/serverrecovery clear-server-recover`. Most of the other commands above also have slash equivalents under `/protection`, `/administration`, `/channel`, `/purge-members`, `/delmsgoncmd`, `/voice`, `/perm-override` and `/roles`.

### Logging and greeting commands

The module also contains the logging commands (`log`, `logcategory`, `logevents`, `logignore`, `logignorelist`, `commandlogchannel`, all Administrator, plus the `/log` slash group) and the classic greeting commands (`greetdm`, `greetdmmsg`, `greetdmtest`, `bye`, `byemsg`, `byedel`, `byetest`, `leavehook`, `boost`, `boostmsg`, `boostdel`, `boosttest`, all Manage Server). They are documented in the `logging` and `multigreets` articles.

## Tips and gotchas

- The bot's role must sit above any role it hands out, removes or bans across, and it needs Ban Members, Kick Members, Manage Roles or Moderate Members to match the punishments you choose. Mute actions need a mute role, which the bot creates on first use.
- Commands only accept up to a day (`1d`) for Anti-Raid and Anti-Spam durations, and Timeout can never exceed 28 days.
- Anti-Spam only counts identical repeats. A member sending ten different messages quickly is not spam to it; that is what Anti-Mass-Post and Anti-Mass-Mention cover.
- Anti-Mass-Post with **Check links only** on ignores anything without a link. Turn it off to catch copypasta, at the cost of more false positives in busy servers.
- Anti-Pattern's batch creation check fetches the whole member list on every join, which is slow in very large servers.
- A blocked image added from a hash rather than the image itself only catches exact copies; re-add it from the image to cover mirrored and bordered versions.
- Enabling a protection from the dashboard applies starter values. Open **Configure** and confirm the action, especially before choosing Ban.
- Auto-assign, self-assign and reaction role commands refuse roles at or above your own highest role unless you are the owner.
- Reaction roles are lost if the message is deleted; `reactionroleslist` shows which setups point at a deleted message.
- Mass rename touches every member the bot can rename, including staff below its role. Have a plan for renaming them back.
- `delete` and `edit` only work on messages the bot can see, and `edit` only on the bot's own messages.
