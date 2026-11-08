---
title: Custom Voice
slug: customvoice
summary: A join-to-create channel that gives each member a temporary voice channel they control
icon: fa-microphone
category: Entertainment
dashboard: /dashboard/customvoice
module: CustomVoice
tags: [custom voice, temporary voice, join to create, voice hub, private voice, voice channels, lock, bitrate, user limit]
related: [administration, statchannels]
---

## What it does

Staff set one voice channel as the hub. When a member joins it, the bot creates a new voice channel for them, named from a template and placed in the configured category, and moves them into it. That member owns the channel: they can rename it, set a user limit and bitrate, lock it so only allowed members can join, allow or deny specific people, keep it alive, or hand it to someone else.

When the last human leaves, the channel is deleted after a short timeout, unless the owner turned on keep alive. If the owner leaves and someone else is still inside, they can claim it.

Members can save preferences for their channels, so every channel they create starts with their preferred name, limit, bitrate, lock state and keep alive setting. Staff decide which of these customisations members are allowed to use and set caps on limit and bitrate. They can also name an admin role that may manage any custom channel.

## Why you would use it

- Stop maintaining a wall of "Gaming 1" to "Gaming 8" channels; members make one when they need it and it disappears afterwards.
- Members who want a private call lock their channel and allow only their friends.
- Streamers and event hosts keep a channel alive so it survives while they step away.
- Moderators with the admin role can rename or lock any channel without needing Manage Channels on the whole server.

## The hub

`setupvoicehub` creates a voice channel called "Create Voice Channel" inside a new "Custom Voice Channels" category, lets everyone connect but not speak, and registers it as the hub. `setvoicehub #channel [category]` uses a channel you already have. On the dashboard, the **Hubs** tab lists your hubs. **Add hub** asks for a **Hub voice channel** and a **Voice category**, then opens the new hub's settings. You can add several hubs, each with its own settings.

If **Allow multiple channels per user** is off (the default), joining the hub while you already own a channel deletes the old one before creating the new one.

## Channel naming

The **Channel name format** is a template of up to 100 characters. The bot replaces `{0}` or `{username}` with the member's username, `{1}` with their discriminator and `{2}` with the server name. The default is `{username}'s Channel`. The name is trimmed to fit Discord's limits.

## Owner controls

`voicecontrols` posts a panel for the channel you are in, showing the current name, limit, bitrate, lock and keep alive state and who is inside, with buttons for **Rename**, **Limit**, **Bitrate**, **Lock**/**Unlock**, keep alive, **Transfer** and a member picker for managing who is inside. Buttons for customisations the server has turned off are disabled.

The same actions exist as commands, and each one checks that you are in a custom channel and that you own it or hold the admin role. It also checks that the server allows that customisation:

| Action | Command | What it does |
| --- | --- | --- |
| Rename | `voicerename <name>` | Renames the channel, if **Allow name customization** is on |
| User limit | `voicelimit <n>` | Sets the limit, capped by the server's maximum user limit |
| Bitrate | `voicebitrate <kbps>` | Sets the bitrate, capped by the server's maximum bitrate |
| Lock | `voicelock [true/false]`, `voiceunlock` | Locked denies connect to everyone except allowed members and the owner or admin role |
| Allow | `voiceallow @user` | Grants connect to a member even when locked |
| Deny | `voicedeny @user` | Removes connect from a member and disconnects them if they are inside |
| Keep alive | `voicekeepalive [true/false]` | Stops the empty-channel cleanup for this channel |
| Transfer | `voicetransfer @user` | Makes another member the owner and moves the management overwrites to them |
| Claim | `voiceclaim` | Any member inside can take ownership when the owner is not in the channel, once the **Owner lock (minutes)** wait has passed |

When **Set owner permissions automatically** is on, the owner gets connect and speak. Whichever of Manage Channel, permission management, Move Members and Priority Speaker are enabled under **Channel owners** are added too. Allowed and denied members get matching overwrites, and the admin and moderator roles get management access.

## Cleanup

With **Delete channels when empty** on (the default), a channel with no humans left in it is scheduled for deletion after the empty channel timeout. Rejoining before the timer fires cancels it. Channels marked keep alive are never removed automatically. A background sweep every five minutes also removes leftover channels that have been empty longer than the timeout, when **Delete leftover empty channels** is on. The **Clean up inactive channels** button on the **Active channels** tab removes channels inactive for a number of hours you choose (1 to 720, 24 by default) after a confirmation.

## Member preferences

`voicepreferences` shows your saved name format, user limit, bitrate, lock and keep alive preferences. Each `voiceprefs...` command sets one, running it with no value clears it, and `voiceprefsreset` clears them all. Preferences are only applied when **Remember member preferences** is on, and limit and bitrate are still capped by the server maximums. Staff can edit any member's preferences on the dashboard: open the **Member preferences** tab, pick a **Member**, and change **Default channel name**, **Default user limit** or **Default bitrate (kbps)**. Empty fields use the server default. **Clear preferences** empties all three.

## Settings

The dashboard has three tabs: **Hubs**, **Active channels** and **Member preferences**. On **Hubs**, the edit button on a hub opens a sheet with five cards. The bin button removes the hub after **Remove this hub?**, which turns that hub off and leaves its channels alone. Changes in the sheet save automatically. `voiceconfig` with no arguments shows every value; `voiceconfig <setting> <value>` changes one.

### Hub basics

| Setting | Default | What it controls |
| --- | --- | --- |
| Hub name | the channel's name | Label for the hub (`hubname`), up to 50 characters on the dashboard |
| Voice category | the one picked when adding | Where new channels are created |
| Channel name format | `{username}'s Channel` | Template for new channel names (`nameformat`) |
| Default user limit | 0 (0 = unlimited) | Starting user limit, 0 to 99 (`userlimit`) |
| Default bitrate | 64 kbps | Starting bitrate, chosen from 8, 16, 32, 64, 96, 128, 192, 256 or 384 kbps (`bitrate`) |

### Lifecycle

| Setting | Default | What it controls |
| --- | --- | --- |
| Delete channels when empty | On | Remove channels nobody is in (`deleteempty`) |
| Delete after (minutes) | 1 | Delay before an empty channel is removed, 1 to 1440 (`emptytimeout`). Shown only when the toggle above is on |
| Delete leftover empty channels | On | Let the five-minute sweep remove empty channels the timer missed (`cleanup`). Shown only when the first toggle is on |
| Allow multiple channels per member | Off | Let one member own several channels (`multiplechannels`) |
| Create a text channel with each voice channel | Off | Make a text channel alongside each voice channel |
| Owner lock (minutes) | 0 (0 = no lock) | How long after the owner leaves before someone else can claim the channel, 0 to 10080 (`ownerlock`) |

### What members can change

| Setting | Default | What it controls |
| --- | --- | --- |
| Allow renaming | On | `namechange` |
| Allow user limit changes | On | `limitchange` |
| Allow bitrate changes | On | `bitratechange` |
| Allow locking | On | `locking` |
| Allow allow and deny lists | On | Allow and deny commands (`usermanagement`) |
| Remember member preferences | On | Apply saved member preferences (`persistpreferences`) |
| Maximum user limit | 99 | Cap for member-set limits, 1 to 99 (`maxuserlimit`) |
| Maximum bitrate (kbps) | 96 | Cap for member-set bitrates, 8 to 384, also capped by the server's boost tier (`maxbitrate`) |

### Channel owners

| Setting | Default | What it controls |
| --- | --- | --- |
| Set owner permissions automatically | On | Set owner, allow, deny and admin overwrites (`autopermission`) |
| Owners can manage their channel | On | Give the owner Manage Channel (`ownermanagechannel`) |
| Owners can manage permissions | Off | Give the owner permission management (`ownermanageroles`) |
| Owners can move members | On | Give the owner Move Members (`ownermovemembers`) |
| Owners are priority speakers | Off | Give the owner Priority Speaker (`ownerpriority`) |
| Copy permissions from | Don't copy | Start new channels with the overwrites of **The hub channel** or **The category** (`syncperms`) |

### Staff roles

| Setting | Default | What it controls |
| --- | --- | --- |
| Admin role | none | Role that may manage any custom channel (`adminrole`) |
| Moderator roles | none | Roles that get view, connect, speak and member moderation access on every custom channel and can moderate any of them (`modroles`) |

### Active channels

The **Active channels** tab shows totals for **Channels created**, **Active last hour**, **Locked** and **Kept alive**. Under them, the **Active channels** card lists every live custom channel with its owner, hub and creation time. Each row has four buttons: **Lock channel** or **Unlock channel**, **Hide from others** or **Show to everyone**, **Keep alive**, and **Delete channel**. Deleting asks for confirmation and removes the voice channel from the server. The **Inactive channels** card holds the **Clean up inactive channels** control.

## Setup walkthrough

1. Give the bot Manage Channels, Move Members and Manage Roles (for permission overwrites) in the category you will use.
2. Run `setupvoicehub`, or open **Custom Voice** in the dashboard, go to **Hubs** and press **Add hub** with an existing voice channel and category.
3. In **Hub basics**, set **Channel name format**, **Default user limit** and **Default bitrate**.
4. Under **What members can change**, turn off any customisations you do not want members to have.
5. Under **Staff roles**, set an **Admin role** (or `voiceconfig adminrole @Moderators`) so staff can manage channels they do not own.
6. Join the hub yourself, run `voicecontrols`, and try renaming and locking the channel.

## Commands

Run these with your server's prefix (`.` unless you changed it).

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `setupvoicehub` | `svh`, `createvoicehub`, `voicesetup` | Manage Channels | Create a hub channel and category |
| `setvoicehub <#channel> [category]` | `sethub`, `voicehub` | Manage Channels | Use an existing channel as the hub |
| `voiceconfig [setting] [value]` | `vcconfig`, `voicesettings`, `vcsettings`, `customvoiceconfig` | Manage Channels | Show or change server settings |
| `voicecontrols` | `vcontrols` | Owner or admin role | Interactive control panel for your channel |
| `voicechannels` | `vchannels`, `listvoice`, `customvoices`, `voicelist` | Nobody | List active custom channels |
| `voicerename <name>` | `vrename`, `renamevoice`, `vcname`, `vcrename` | Owner or admin role | Rename your channel |
| `voicelimit <number>` | `vclimit`, `limitvoice`, `vlimit`, `setlimit` | Owner or admin role | Set the user limit |
| `voicebitrate <kbps>` | `vcbitrate`, `vbitrate`, `setbitrate` | Owner or admin role | Set the bitrate |
| `voicelock [true/false]` | `vclock`, `lockvoice`, `vlock`, `lockvc` | Owner or admin role | Lock or unlock |
| `voiceunlock` | `vcunlock`, `unlockvoice`, `vunlock`, `unlockvc` | Owner or admin role | Unlock |
| `voiceallow @user` | `vcallow`, `allowuser`, `vallow`, `adduser` | Owner or admin role | Let a member join a locked channel |
| `voicedeny @user` | `vcdeny`, `denyuser`, `vdeny`, `removeuser` | Owner or admin role | Block a member and disconnect them |
| `voiceclaim` | `vcclaim`, `claimvoice`, `vclaim`, `takeover` | Nobody | Take over a channel whose owner has left |
| `voicetransfer @user` | `vctransfer`, `transfervoice`, `vtransfer`, `givevc` | Owner or admin role | Give the channel to someone else |
| `voicekeepalive [true/false]` | `vckeepalive`, `keepvoice`, `vkeep`, `persist` | Owner or admin role | Exempt the channel from cleanup |
| `voicepreferences` | `vcprefs`, `voiceprefs`, `vprefs`, `myvoice` | Nobody | Show your saved preferences |
| `voiceprefsname [format]` | `vcprefsname`, `vpname`, `prefname`, `namepref` | Nobody | Preferred name format, empty clears |
| `voiceprefslimit [number]` | `vcprefslimit`, `vplimit`, `preflimit`, `limitpref` | Nobody | Preferred user limit |
| `voiceprefsbitrate [kbps]` | `vcprefsbitrate`, `vpbitrate`, `prefbitrate`, `bitratepref` | Nobody | Preferred bitrate |
| `voiceprefslock [true/false]` | `vprefslock` | Nobody | Start channels locked |
| `voiceprefskeepalive [true/false]` | `vcprefskeepalive`, `vpkeepalive`, `prefkeepalive`, `keeppref` | Nobody | Start channels with keep alive |
| `voiceprefsreset` | `vcprefsreset`, `vprefsreset`, `resetprefs`, `clearprefs` | Nobody | Clear all preferences |

## Tips and gotchas

- The bot needs Manage Channels in the category, Move Members to place the creator in the new channel, and Manage Roles to write permission overwrites.
- The maximum bitrate is clamped to what the server's boost tier allows, so a setting of 384 on an unboosted server is reduced automatically.
- Locking denies connect for the everyone role. Members with Administrator or a role that already has an explicit connect allow can still join.
- The empty channel timeout is in minutes everywhere: the dashboard, the config command, the timer that runs when the last member leaves and the sweep. With the default of 1 an empty channel is deleted after a minute.
- Keep alive channels are never cleaned up automatically. Use the **Active channels** tab or `voicechannels` to find forgotten ones.
- Claiming only works while the original owner is not connected to the channel.
