---
title: Server Management
slug: servermanagement
summary: Bulk tools for the shape of your server: create and delete channels and roles, hand roles to hundreds of members in one job, lock the server down, sync channel overrides, steal emotes and watch for dangerous role changes.
icon: fa-server
category: Actions
module: ServerManagement
tags: [server management, roles, mass role, channels, lockdown, slowmode, lock channel, nuke, emotes, steal emotes, webhook, permcontrol, role monitor, role jobs, server icon, server banner]
related: [administration, permissions, moderation]
---

## What it does

Server Management collects the commands that change the structure of a server rather than the people in it. Staff can create a category and all its channels in one line, rename or delete channels, set topics, toggle NSFW, set slowmode, lock a channel, or delete and recreate one to wipe its history.

Roles get the most attention. One-off commands create, rename, recolour, hoist and delete roles or give a role to a single member, with an optional timer. Mass commands add or remove a role for every member, every human, every bot, everyone in another role, or everyone who joined before or after a cutoff. Those run as background jobs you can list and stop.

The module also covers the server's own look (icon, banner, splash, name), emote management including stealing emotes from other servers, per-channel permission overrides, voice channel moves, three kinds of lockdown, and a role monitor that reverts and punishes dangerous role changes.

Nothing here is configured on the dashboard. Everything is run from commands.

## Why you would use it

- Setting up a new server and wanting ten channels under a category without clicking through Discord's UI ten times.
- Giving a "Member" role to two thousand existing members after turning on role gating.
- Locking the server during a raid so nobody can post, then restoring the old permissions exactly.
- Copying emotes from a friend's server in one command.
- Stopping a moderator from giving themselves Administrator by adding a blacklisted permission to a role.

## Channels

### Creating and editing

`creatxtchanl <name>` and `creatvoichanl <name>` make a single text or voice channel. `deltxtchanl <#channel>` and `delvoichanl <channel>` delete one.

The `cc...` family builds several at once:

| Command | What it creates |
| --- | --- |
| `ccatc <category name> <channel names...>` | A new category and text channels inside it |
| `ccavc <category name> <channel names...>` | A new category and voice channels inside it |
| `cctc <existing category> <channel names...>` | Text channels inside a category that already exists |
| `ccvc <existing category> <channel names...>` | Voice channels inside a category that already exists |

`renamechannel <channel> <name>` renames any channel, `setchanlname <name>` renames the one you are in, `settopic [text]` sets or clears the current channel's topic, and `nsfwtoggle` flips the current channel's NSFW flag.

### Slowmode, lock and nuke

`slowmode` on its own toggles the current channel between one minute and off. `slowmode <time>` such as `slowmode 30s` sets a specific interval, and either form takes a channel argument. Anything of 21600 seconds (six hours) or more is refused.

`lock [#channel]` adds a Send Messages deny for the `@everyone` role on that channel; `unlock [#channel]` removes it. Existing override bits are kept.

`nuke [#channel]` asks for confirmation, deletes the channel, and creates a new one with the same name, position, topic, permission overwrites, NSFW flag, category and slowmode. Pins, webhooks and message history are gone for good.

### Permission overrides

`permcontrol <channel> <allow|deny|inherit> <role or user> <permissions...>` edits one target's override on a channel without touching its other bits. `permview [@user or role]` lists which permissions you, a member or a role currently have.

`syncroletoall <role>` copies the role's override from the current channel to every text channel and category. `syncroletoallchannels` and `syncroletoallcategories` do only channels or only categories. The role must already have an override in the channel you run the command from.

### Webhooks

`createwebhook <#channel> <name> [avatar url]` creates a webhook. An attached image is used as the avatar if you do not give a URL. The bot confirms in the channel and sends the webhook URL and token to you by DM.

## Voice

- `moveto <voice channel>` moves you.
- `moveuserto @user <voice channel>` moves someone else.
- `grab @user` pulls someone into the voice channel you are in.

## Lockdown

`lockdown [type] [action] [override]` and `liftlockdown [type]` need Administrator.

| Type | What it does |
| --- | --- |
| `Joins` | Anyone who joins while it is active is kicked or banned. The action is `Ban` by default; `Kick` is the only other option. |
| `Readonly` | The bot saves every channel's current `@everyone` override, then denies Send Messages, thread creation and thread replies in text channels, and Connect and Speak in voice channels. Forum channels keep Send Messages so existing threads stay readable. |
| `Full` | Both of the above. |

Before applying a read-only lockdown the bot checks it can edit every channel. If some are missing, it lists them and stops, unless you pass `true` as the third argument to continue anyway. Lifting the lockdown restores the saved overrides. Join lockdowns survive a bot restart.

`unlockdown` is a separate, older tool: it turns Send Messages back on for the `@everyone` role itself, for servers that locked down by editing that role.

> [!WARNING]
> `lockdown` with no arguments is a read-only lockdown, and `lockdown joins` bans joiners by default. Pass `kick` if that is what you want.

## Roles

### Single role commands

| Command | What it does |
| --- | --- |
| `createrole [name]` | Creates a role, not mentionable |
| `deleterole <role>` | Deletes a role below your own top role |
| `renamerole <role> <name>` | Renames a role |
| `rolecolor <role> [colour]` | Shows the role's colour, or sets it |
| `rolehoist <role>` | Toggles whether the role is shown separately in the member list |
| `setrole <role> @user [time]` | Gives a role, optionally removing it again after `time` such as `2h` |
| `removerole <role> @user` | Takes a role away |
| `removeallroles @user` | Removes every unmanaged role from a member |

Role and member arguments can be given in either order for `setrole` and `removerole`.

### Several roles or members at once

- `createroles <names...>` creates one role per word after confirming the list.
- `deleteroles <roles...>` deletes several roles after confirmation; managed roles are skipped.
- `setroles @user <roles...>` gives several roles to one member; `setroles @user <time> <roles...>` makes them timed.
- `removeroles @user <roles...>` removes several roles from one member.
- `adduserstorole <role> @user @user...` and `removeusersfromrole <role> @user @user...` work on several members.

### Mass role jobs

These go through the whole member list and run as background jobs. Because of Discord rate limits the bot pauses briefly per member and only allows five jobs per server at a time. Each job reports how long it expects to take.

| Command | Who is affected |
| --- | --- |
| `addtoall <role>` | Every member who does not have the role |
| `addtoallusers <role>` | Humans only |
| `addtoallbots <role>` | Bots only |
| `addtousersover <time> <role>` | Members who joined at least `time` ago, for example `30d` |
| `addtousersunder <time> <role>` | Members who joined more recently than `time` |
| `addroletorole <role> <role2>` | Gives `role` to everyone in `role2` |
| `addthenremove <role> <role2>` | Gives `role` to everyone in `role2`, then removes `role2` |
| `removefromall <role>` | Everyone who has the role |
| `removefromallusers <role>` | Humans only |
| `removefromallbots <role>` | Bots only |
| `removefromrole <role> <role2>` | Removes `role` from everyone in `role2` |

`rolejobs` lists the running jobs with their type, who started them, progress and roles. `stopjob <number>` cancels one and reports how far it got.

### Export and import

`exportrolelist` sends a `rolelist.txt` file with one `roleId,userId,roleName` line per membership for every role the bot can manage. `importrolelist` reads such a file attached to the command and re-applies the roles; pass `true` to create roles by name when the IDs no longer exist. `addroletolist <role>` reads an attached list of user IDs and gives them the role.

## Server appearance and emotes

`seticon <url>`, `setbanner <url>`, `setsplash <url>` and `setservername <name>` change the server itself and need Administrator. `setguildavatar`, `setguildbanner` and `setguildbio` change how the bot itself appears in this server only, and need Manage Server.

Emote commands need Manage Expressions on both you and the bot:

- `addemote <name> [url]` uploads an emote from a URL or an attached image.
- `removeemote <emote>` and `renameemote <emote> <name>` work on emotes from this server.
- `stealemotes <emotes...>` copies every custom emote in your message into this server. `sfr <role> <emotes...>` does the same but restricts the emotes to one role.
- Right-clicking a message and choosing **Steal Emotes** or **Steal Sticker** from the Apps menu does the same without typing.

## Role monitor

The role monitor watches the audit log. When a member is given a blacklisted role, or a role gains a blacklisted permission, the bot reverts the change and punishes whoever did it. Only the server owner can configure it.

- `addblacklistedrole <role> [punishment]` and `removeblacklistedrole <role>`.
- `addblacklistedpermission <permission> [punishment]` and `removeblacklistedpermission <permission>`, for example `addblacklistedpermission Administrator Ban`.
- `setdefaultpunishment <punishment>` sets what happens when a blacklisted entry has no punishment of its own. The default is `None`.
- `addwhitelisteduser @user`, `addwhitelistedrole <role>` and their `remove...` partners exempt staff from the monitor. Changes made by or to whitelisted people are ignored.
- `listblacklists` shows everything above.

Punishment values are `None`, `Warn`, `Mute`, `ChatMute`, `VoiceMute`, `Timeout`, `Kick`, `Softban`, `Ban`, `RemoveRoles`, `AddRole` and `Delete`. When several blacklisted permissions are added at once, the most severe punishment wins.

## Settings

There is no dashboard page. The only stored settings belong to the role monitor and the lockdown state.

| Setting | Default | What it controls |
| --- | --- | --- |
| Default punishment | None | Applied when a blacklisted role or permission has no punishment set |
| Blacklisted roles | none | Roles that are removed when given, with an optional punishment each |
| Blacklisted permissions | none | Permissions reverted when added to a role, with an optional punishment each |
| Whitelisted users and roles | none | Exempt from the monitor |
| Join lockdown action | Ban | What happens to members who join during a join lockdown |

## Setup walkthrough

1. Check the bot's role sits above every role you want it to manage, and that it has Manage Roles and Manage Channels.
2. Build the layout: `ccatc Community general off-topic memes` creates the category and three channels.
3. Create roles in one go: `createroles Member Regular Veteran`.
4. Hand the base role out: `addtoallusers Member`, then watch it with `rolejobs`.
5. As server owner, protect the server: `addblacklistedpermission Administrator Ban` and `addwhitelistedrole Admin`.
6. Keep `lockdown full kick` in mind for emergencies and test `liftlockdown full` afterwards on a quiet day.

## Commands

Run these with your server's prefix (`.` unless you changed it).

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `permview [@user or role]` | `pview` | Nobody | List allowed permissions |
| `setsplash <url>` | `setserversplash`, `setsplashimage` | Administrator | Set the invite splash |
| `seticon <url>` | `setservericon`, `seticonimage` | Administrator | Set the server icon |
| `setbanner <url>` | `setserverbanner` | Administrator | Set the server banner |
| `setservername <name>` | | Administrator | Rename the server |
| `setguildavatar [url]` | `sgav`, `setgav` | Manage Server | Bot's avatar in this server |
| `setguildbanner [url]` | `sgbanner`, `setgbanner` | Manage Server | Bot's banner in this server |
| `setguildbio <text>` | `sgbio`, `setgbio` | Manage Server | Bot's bio in this server |
| `addemote <name> [url]` | `emoteadd`, `ae`, `ea` | Manage Expressions | Upload an emote |
| `removeemote <emote>` | `deleteemote`, `emoteremove`, `emotedelete` | Manage Expressions | Delete an emote |
| `renameemote <emote> <name>` | `emoterename` | Manage Expressions | Rename an emote |
| `stealemotes <emotes...>` | `steal` | Manage Expressions | Copy emotes into this server |
| `sfr <role> <emotes...>` | | Manage Expressions | Copy emotes, restricted to a role |
| `creatxtchanl <name>` | `ctch` | Manage Channels | Create a text channel |
| `creatvoichanl <name>` | `cvch` | Manage Channels | Create a voice channel |
| `deltxtchanl <#channel>` | `dtch` | Manage Channels | Delete a text channel |
| `delvoichanl <channel>` | `dvch` | Manage Channels | Delete a voice channel |
| `ccatc <category> <names...>` | | Manage Channels | New category with text channels |
| `ccavc <category> <names...>` | | Manage Channels | New category with voice channels |
| `cctc <category> <names...>` | | Manage Channels | Text channels in an existing category |
| `ccvc <category> <names...>` | | Manage Channels | Voice channels in an existing category |
| `renamechannel <channel> <name>` | `channelrename` | Manage Channels | Rename a channel |
| `setchanlname <name>` | `schn` | Manage Channels | Rename the current channel |
| `settopic [text]` | `st` | Manage Channels | Set or clear the current topic |
| `nsfwtoggle` | `nsfw`, `nsfwtgl` | Manage Channels | Toggle the NSFW flag |
| `slowmode [time] [#channel]` | | Manage Channels | Toggle or set slowmode |
| `lock [#channel]` | `channellock`, `lockchannel` | Manage Messages | Deny Send Messages for everyone |
| `unlock [#channel]` | `channelunlock`, `unlockchannel` | Manage Messages | Undo `lock` |
| `nuke [#channel]` | `channelnuke`, `nukechannel` | Manage Channels | Delete and recreate a channel |
| `permcontrol <channel> <allow|deny|inherit> <role or user> <perms...>` | `permc` | Manage Channels | Edit a channel override |
| `syncroletoall <role>` | `synctoall` | Manage Channels | Copy an override to all channels and categories |
| `syncroletoallchannels <role>` | `srtch`, `srtach` | Manage Channels | Copy an override to text channels |
| `syncroletoallcategories <role>` | `srtc`, `srtac` | Manage Channels | Copy an override to categories |
| `createwebhook <#channel> <name> [avatar]` | `cwh` | Administrator | Create a webhook |
| `moveto <voice channel>` | | Nobody | Move yourself |
| `moveuserto @user <voice channel>` | `moveuto` | Manage Channels | Move someone |
| `grab @user` | `getoverhere` | Nobody | Pull someone into your voice channel |
| `lockdown [joins|readonly|full] [kick|ban] [true]` | `lockdownserver` | Administrator | Start a lockdown |
| `liftlockdown [type]` | `unlockserver` | Administrator | End a lockdown |
| `unlockdown` | `endlockdown` | Manage Channels | Re-enable Send Messages on `@everyone` |
| `createrole [name]` | `cr` | Manage Roles | Create a role |
| `deleterole <role>` | `dr` | Manage Roles | Delete a role |
| `renamerole <role> <name>` | `renr` | Manage Roles | Rename a role |
| `rolecolor <role> [colour]` | `roleclr` | Manage Roles to set | Show or set a role colour |
| `rolehoist <role>` | `rh` | Manage Roles | Toggle hoisting |
| `setrole <role> @user [time]` | `sr`, `giverole` | Manage Roles | Give a role, optionally timed |
| `removerole <role> @user` | `rr` | Manage Roles | Remove a role |
| `removeallroles @user` | `rar` | Manage Roles | Strip all roles |
| `createroles <names...>` | `croles`, `crs` | Manage Roles | Create several roles |
| `deleteroles <roles...>` | `drs` | Manage Roles | Delete several roles |
| `setroles @user [time] <roles...>` | `srs` | Manage Roles | Give several roles |
| `removeroles @user <roles...>` | `rrs` | Manage Roles | Remove several roles |
| `adduserstorole <role> @users...` | `autr` | Manage Roles | Give one role to several members |
| `removeusersfromrole <role> @users...` | `rufr` | Manage Roles | Remove one role from several members |
| `addtoall <role>` | `ata` | Manage Roles | Role to every member |
| `addtoallusers <role>` | `atau` | Manage Roles | Role to every human |
| `addtoallbots <role>` | `atab` | Manage Roles | Role to every bot |
| `addtousersover <time> <role>` | `atuo` | Manage Roles | Role to members who joined at least that long ago |
| `addtousersunder <time> <role>` | `atuu` | Manage Roles | Role to members who joined more recently |
| `addroletorole <role> <role2>` | `artr` | Manage Roles | Role to everyone in another role |
| `addthenremove <role> <role2>` | `atr` | Manage Roles | Swap one role for another |
| `removefromall <role>` | `rfa` | Manage Roles | Remove from every member |
| `removefromallusers <role>` | `rfau` | Manage Roles | Remove from every human |
| `removefromallbots <role>` | `rfab` | Manage Roles | Remove from every bot |
| `removefromrole <role> <role2>` | `rfr` | Manage Roles | Remove from everyone in another role |
| `rolejobs` | `rj` | Manage Roles | List running mass role jobs |
| `stopjob <number>` | `sj` | Manage Roles | Cancel a job |
| `exportrolelist` | `exportroles`, `erl` | Manage Roles | Download role memberships |
| `importrolelist [true]` | `importroles`, `irl` | Manage Roles | Re-apply an exported list |
| `addroletolist <role>` | `artl` | Manage Roles | Give a role to an attached list of user IDs |
| `setdefaultpunishment <action>` | `sdp`, `defaultpunishment`, `setdefpunishment` | Server owner | Role monitor fallback punishment |
| `addblacklistedrole <role> [action]` | `abr`, `blacklistrole`, `addbrole` | Server owner | Watch a role |
| `removeblacklistedrole <role>` | `rbr`, `unblacklistrole`, `removebrole` | Server owner | Stop watching a role |
| `addblacklistedpermission <permission> [action]` | `abp`, `blacklistpermission`, `addbpermission` | Server owner | Watch a permission |
| `removeblacklistedpermission <permission>` | `rbp`, `unblacklistpermission`, `removebpermission` | Server owner | Stop watching a permission |
| `addwhitelisteduser @user` | `awu`, `whitelistuser`, `addwuser` | Server owner | Exempt a member |
| `removewhitelisteduser @user` | `rwu`, `unwhitelistuser`, `removewuser` | Server owner | Remove an exemption |
| `addwhitelistedrole <role>` | `awr`, `whitelistrole`, `addwrole` | Server owner | Exempt a role |
| `removewhitelistedrole <role>` | `rwr`, `unwhitelistrole`, `removewrole` | Server owner | Remove an exemption |
| `listblacklists` | `lbl`, `blacklists`, `listbws` | Server owner | Show the monitor's lists |

## Tips and gotchas

- Role commands check hierarchy twice: your top role and the bot's top role must both be above the role in question. The server owner skips the check on their own side.
- Mass jobs take roughly one second per member. Adding a role to five thousand members is well over an hour, and the bot refuses a sixth simultaneous job.
- `syncroletoall` and its variants need the role to already have an override on the channel you run them in; that override is what gets copied.
- `nuke` cannot be undone and the confirmation prompt is the only safeguard.
- Read-only lockdown edits overrides on every channel, which is a lot of API calls on large servers. Lift it with `liftlockdown`, not by hand, so the saved overrides are restored.
- The role monitor relies on the audit log, so the bot needs View Audit Log, and it needs the permission for whatever punishment you pick.
- Emote stealing needs free emote slots; failures are listed under "Errored Emotes".
