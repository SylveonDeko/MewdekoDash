---
title: Administration
slug: administration
summary: The Server tools page, which gathers the bot's server management features in one place
icon: fa-cog
category: Security
dashboard: /dashboard/administration
module: Administration
tags: [admin, server tools, reaction roles, self-assignable roles, auto-ban roles, voice channel roles, permission overrides, permission rules, dpo, mass ban, mass rename, prune, server recovery, staff role, member role, timezone, cooldowns, ban message, delete command messages]
related: [channel-tools, server-backups, automod, moderation, permissions, logging, multigreets, role-menus, settings, auditlog, rolestates]
---

## What it does

Administration is the module behind the **Server tools** page in the dashboard. It sets the staff and member roles other features rely on and changes which Discord permission a command needs. It also rate limits commands and hands out roles in several ways. For bad days it holds the mass operations, such as banning a pasted list of IDs or renaming everyone. A recovery flow gets an administrator role back to a verified owner. Nearly every setting also has a command.

The page has six tabs. Two of them have their own articles.

| Tab | What it holds |
| --- | --- |
| Automation | Server roles, timezone, game voice channel, deleting command messages, statistics |
| Commands | Command cooldowns, permission overrides, permission settings and permission rules |
| Roles | Self-assignable roles, reaction roles, voice channel roles and auto-ban roles |
| Backups | Server backups and templates. See [Server backups](/wiki/server-backups) |
| Channels | Lockdown, bulk channel actions, purge, auto-purge and voice text links. See [Channel tools](/wiki/channel-tools) |
| Advanced | Ban message, server recovery, prune, mass ban and mass rename |

Raid, spam, alt, scam image and honeypot protection are on the **Protection** tab of the **Automod** page. See [Automod](/wiki/automod). Roles given to every new member are under Welcome and goodbye, see [Multigreets](/wiki/multigreets).

## Why you would use it

- Members should be able to pick their own colour or region roles without staff help.
- You want `ban` to work for people with Manage Messages instead of Ban Members, without touching Discord's role settings.
- One command is spammed in general and needs a cooldown.
- A bot wave or a list of known bad accounts needs removing in one go.
- A rogue admin stripped the owner's roles and you need a way back in.

## Automation tab

| Card | Setting | What it does |
| --- | --- | --- |
| Server roles | Staff role | The role other features treat as staff |
| Server roles | Member role | The role treated as "member". `prunemembers` can include people with it |
| Timezone | Server timezone | Used wherever the bot prints local times. Default UTC |
| Game voice channel | Channel | When a member in this voice channel starts playing a game, the bot moves them to the voice channel whose name matches the game. **Set as game voice channel** toggles the choice and the card shows the current channel |
| Delete command messages | Header switch | Deletes the message that invoked a command after it runs. Off by default |
| Delete command messages | Channel overrides | Pick a channel and set **Always delete**, **Never delete** or **Use server setting**. Overrides are listed and can be reset |
| Statistics and privacy | Collect statistics | Opt out to stop collecting command usage statistics for this server |
| Statistics and privacy | Delete stats | Permanently deletes every statistic stored for this server |

Settings save as you change them.

## Commands tab

### Command cooldowns

A per command rate limit. Click **Add cooldown**, pick a command and enter the seconds, from 1 to 90000 (25 hours). Each cooldown can be removed again.

### Permission overrides

An override replaces the Discord permission a command normally checks. Add an override for `ban` requiring Manage Messages and anyone with Manage Messages can run it. Add one requiring Administrator and only administrators can. Click **Add override**, pick the command and the **Required permission**. The card lists every override with a remove button on each, and **Clear all** removes them together. With commands, `dpo <command> <permission> [permission...]` sets one and needs all the listed permissions. Custom chat trigger names are accepted too.

### Permission settings

| Setting | What it does |
| --- | --- |
| Verbose permissions | Tells users when a rule blocks a command |
| Permission role | Members with this role can edit permission rules with commands |

### Permission rules

The rule based command permission system. Rules are checked top to bottom and the first match wins. Rule 0 is the default, "Everyone can use everything". **Add rule** takes an **Action** (Allow or Deny), **What** (all modules, one module or one command) and **For** (the whole server, a channel, a category, a role or a specific user ID). Move rules up or down or remove them, and **Reset all** goes back to the default. It has its own article, see [Permissions](/wiki/permissions).

## Roles tab

The tab starts with a link noting that join roles moved to Welcome and goodbye.

### Self-assignable roles

Roles members give themselves with `iam <role>` and drop with `iamnot <role>`. To add one, pick a role, set its **Group** (0 to 100) and **Level required** (0 to 1000), and click **Add role**. Group 0 is shown as Ungrouped, other groups can be named with the pencil button. Click a role to change its level, or use the remove button.

| Setting | What it does |
| --- | --- |
| Exclusive | One role per group. Taking a role from a group removes any other role you hold from that group, which suits colours or regions |
| Auto delete | Removes the `iam` messages. The command and the reply are deleted after three seconds |

A role can require a minimum XP level before `iam` works. Level 0 means none.

### Reaction roles

Attach emoji to roles on an existing message. Members click the emoji to get the role and remove it to lose it. Click **New reaction roles**, enter the **Message ID** (right-click a message and Copy ID, which needs Developer Mode), pick its channel, then add emoji and role pairs with **Add pair**. The sheet counts reactions against Discord's limit of 20 per message and warns when the message already has reaction roles, which your new pairs are added to. **Exclusive** allows one role per message. Existing setups are listed by message and can be removed.

The card notes that [Role menus](/wiki/role-menus) do the same with a dropdown or buttons, and that **Move older setups** there brings these over.

With commands, `reactionroles [messageId] [excl] <role> <emoji> ...` sets up pairs. Leave the message ID out to use the message directly above your command. `reactionroleslist` shows every setup with an index, and `reactionrolesremove <index>` deletes one.

### Voice channel roles

Bind a role to a voice channel. Pick the voice channel and the **Role given**, then click **Add**. Members receive the role when they join the channel and lose it when they leave. Use it to open a text channel only to people currently in a call.

### Auto-ban roles

Any role in this list is a tripwire. The moment a member gains it, they are banned. Pick a role and click **Add role**. The reason defaults to "Auto-ban role assigned" unless you set one with `autobanrolereason`. Combine it with a reaction role on a hidden message to catch self-assigning bots. The days of messages deleted follow the Moderation module's ban prune setting.

## Advanced tab

Every mass operation asks for confirmation and then runs without further checks.

| Card | What it does |
| --- | --- |
| Ban message | The message a member receives by DM when they are banned, built in the embed editor. It is the same template the Moderation module's ban command uses |
| Server recovery | A way to get an Administrator role back to the owner. See below |
| Prune inactive members | Discord's member prune. **Days inactive** is 1 to 30. Click **Prune** and confirm |
| Mass ban | Paste **User IDs**, one per line or separated by commas, add a reason (default "Mass ban") and click **Ban N users**. Message deletion follows the Moderation ban prune setting. The result reports how many succeeded and failed |
| Mass rename | Sets every member's nickname to a **Nickname pattern**. The default is `{username}`, which is replaced with each member's username, for example `[AFK] {username}`. Members the bot cannot rename are skipped |

Deleting every message after a given message ID is in the **Single channel** card on the Channels tab, as **Delete after message**.

### Server recovery

A way to get an Administrator role back to the owner after a compromised admin removes it. Two secrets are stored for the server: a **recovery key** and a **two-factor key**.

On the dashboard, click **Set up recovery**. Generate or type a **Recovery key** of at least sixteen characters, and enter a **Two-factor key** of at least six characters. The saved key can be shown or copied from the card, and **Remove recovery** deletes both keys after a confirmation. The bot verifies codes against the two-factor key as an authenticator (TOTP) secret, so enter a base32 secret you have added to an authenticator app, not a plain password.

With commands, running `/serverrecovery server-recover` as the server owner when nothing is set up generates both secrets: a recovery key sent to you by DM, and an authenticator secret shown as a QR code. Confirm with a code from your authenticator app to finish. Once set up, anyone who runs `/serverrecovery server-recover`, enters the recovery key and then a valid authenticator code is given a new role called "Recovered Server Owner Role" with Administrator, placed just under the bot's highest role. `/serverrecovery clear-server-recover` deletes the stored keys after a confirmation.

> [!PERMISSION]
> The bot itself must have Administrator for recovery to run, and its highest role must sit high enough that a role just beneath it still outranks the people you are recovering from.

The commands add ways to pick who gets banned: `banunder 10m` bans everyone who joined in the last ten minutes (`-p` previews the list first, `-accage 1d` also requires the account to be under a day old), `kickunder` does the same with a kick, `nameban <regex>` bans usernames matching a pattern after a preview, `baninrole <role>` bans everyone holding a role, and `banbyhash <avatarHash>` bans every member using a given avatar. All of them ask you to confirm.

## Setup walkthrough

1. Open **Server tools** in the dashboard. On the **Automation** tab, set the **Staff role**, **Member role** and **Server timezone** under **Server roles** and **Timezone**.
2. On the **Roles** tab, set up a colour group with **Add role**, giving each role the same **Group**, then turn on **Exclusive**.
3. Add any role you want as a tripwire under **Auto-ban roles**.
4. On the **Commands** tab, add a cooldown under **Command cooldowns** for any command that gets spammed.
5. On the **Advanced** tab, set up **Server recovery** while things are calm.
6. Open **Automod** to turn on raid, spam and scam protection. Use [Multigreets](/wiki/multigreets) for join roles.

## Commands

Run these with your server's prefix (`.` unless you changed it).

### Protection

These configure the systems on the Protection tab of the Automod page. Run with no arguments, they disable that system.

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
| `antipostchannel [action] [duration]` | | Administrator | Configure or disable honeypot channels. The current channel becomes the status channel |
| `antipostchanneladd <#channel>` | | Administrator | Add a honeypot channel |
| `antipostchannelremove <#channel>` | | Administrator | Remove a honeypot channel |
| `antiimagehash [action] [tolerance] [duration]` | `aih` | Administrator | Configure or disable Anti-Image-Hash |
| `antiexternalapp [action] [mentions] [messages] [duration]` | `aea`, `antiuserapp` | Administrator | Configure or disable Anti-External App |
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
| `vcrole [voiceChannel] [role]` | | Manage Roles | Bind a role to a voice channel (your current one if omitted). No role removes the binding |
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
| `prunemembers <time> [yes]` | `memberprune` | Administrator | Prune members inactive for that many days. `yes` includes the member role |
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

The module also contains the logging commands (`log`, `logcategory`, `logevents`, `logignore`, `logignorelist`, `commandlogchannel`, all Administrator, plus the `/log` slash group) and the classic greeting commands (`greetdm`, `greetdmmsg`, `greetdmtest`, `bye`, `byemsg`, `byedel`, `byetest`, `leavehook`, `boost`, `boostmsg`, `boostdel`, `boosttest`, all Manage Server). They are documented in the [Logging](/wiki/logging) and [Multigreets](/wiki/multigreets) articles.

## Tips and gotchas

- The bot's role must sit above any role it hands out, removes or bans across, and it needs Ban Members, Kick Members, Manage Roles or Moderate Members to match what you ask it to do.
- Auto-assign, self-assign and reaction role commands refuse roles at or above your own highest role unless you are the owner.
- Reaction roles are lost if the message is deleted. `reactionroleslist` shows which setups point at a deleted message.
- Mass rename touches every member the bot can rename, including staff below its role. Have a plan for renaming them back.
- `delete` and `edit` only work on messages the bot can see, and `edit` only on the bot's own messages.
- Permission overrides and permission rules are separate. An override changes which Discord permission a command asks for, and a rule allows or denies a command for a role, channel or user.
