---
title: Custom Voice
slug: customvoice
summary: A join-to-create hub that gives each member their own temporary voice channel, with rename, user limit, bitrate, lock, allow and deny controls, and automatic cleanup when it empties.
icon: fa-microphone
category: Entertainment
dashboard: /dashboard/customvoice
module: CustomVoice
tags: [custom voice, temporary voice, join to create, voice hub, private voice, voice channels, lock, bitrate, user limit]
related: [administration, statchannels]
---

## What it does

Staff set one voice channel as the hub. When a member joins it, the bot creates a new voice channel for them, named from a template, puts it in the configured category and moves them into it. That member owns the channel: they can rename it, set a user limit and bitrate, lock it so only allowed members can join, allow or deny specific people, keep it alive, or hand it to someone else.

When the last human leaves, the channel is deleted after a short timeout, unless the owner turned on keep alive. If the owner leaves and someone else is still inside, they can claim it.

Members can save preferences for their channels, so every channel they create starts with their preferred name, limit, bitrate, lock state and keep alive setting. Staff decide which of these customisations members are allowed to use, set caps on limit and bitrate, and can name an admin role that may manage any custom channel.

## Why you would use it

- Stop maintaining a wall of "Gaming 1" to "Gaming 8" channels; members make one when they need it and it disappears afterwards.
- Members who want a private call lock their channel and allow only their friends.
- Streamers and event hosts keep a channel alive so it survives while they step away.
- Moderators with the admin role can rename, lock or hand over any channel without needing Manage Channels on the whole server.

## The hub

`setupvoicehub` creates a voice channel called "Create Voice Channel" inside a new "Custom Voice Channels" category, lets everyone connect but not speak, and registers it as the hub. `setvoicehub #channel [category]` uses a channel you already have. The dashboard **Basic Configuration** section does the same with a channel and category picker.

If **Allow multiple channels per user** is off (the default), joining the hub while you already own a channel deletes the old one before creating the new one.

## Channel naming

The **Default Name Format** is a template. The bot replaces `{0}` with the member's username, `{1}` with their discriminator and `{2}` with the server name. The default is `{0}'s Channel`. The name is trimmed to fit Discord's limits.

> [!NOTE]
> The dashboard placeholder text shows `{username}'s Channel`, but the bot only substitutes `{0}`, `{1}` and `{2}`. Use the numbered form.

## Owner controls

`voicecontrols` posts a panel for the channel you are in, showing the current name, limit, bitrate, lock and keep alive state and who is inside, with buttons for **Rename**, **Limit**, **Bitrate**, **Lock**/**Unlock**, keep alive, **Transfer** and a member picker for managing who is inside. Buttons for customisations the server has turned off are disabled.

The same actions exist as commands, and each one checks that you are in a custom channel, that you own it or hold the admin role, and that the server allows that customisation:

| Action | Command | What it does |
| --- | --- | --- |
| Rename | `voicerename <name>` | Renames the channel, if **Allow name customization** is on |
| User limit | `voicelimit <n>` | Sets the limit, capped by the server's maximum user limit |
| Bitrate | `voicebitrate <kbps>` | Sets the bitrate, capped by the server's maximum bitrate |
| Lock | `voicelock [true/false]`, `voiceunlock` | Locked denies connect to everyone except allowed members, the owner and the admin role |
| Allow | `voiceallow @user` | Grants connect to a member even when locked |
| Deny | `voicedeny @user` | Removes connect from a member and disconnects them if they are inside |
| Keep alive | `voicekeepalive [true/false]` | Stops the empty-channel cleanup for this channel |
| Transfer | `voicetransfer @user` | Makes another member the owner and moves the management overwrites to them |
| Claim | `voiceclaim` | Any member inside can take ownership when the owner is not in the channel |

When **Auto-manage channel permissions** is on, the owner gets connect, speak, Manage Channel, Move Members, Mute Members and Deafen Members on their channel, allowed and denied members get matching overwrites, and the admin role gets management access.

## Cleanup

With **Delete channels when empty** on (the default), a channel with no humans left in it is scheduled for deletion after the empty channel timeout. Rejoining before the timer fires cancels it. Channels marked keep alive are never removed automatically. A background sweep every five minutes also removes channels that have been empty longer than the timeout, and the dashboard's **Clean up inactive channels** button removes channels inactive for a number of hours you choose.

## Member preferences

`voicepreferences` shows your saved name format, user limit, bitrate, lock and keep alive preferences. Each `voiceprefs...` command sets one, running it with no value clears it, and `voiceprefsreset` clears them all. Preferences are only applied when **Remember user preferences** is on, and limit and bitrate are still capped by the server maximums. Staff can view and edit any member's preferences from the **User Preferences** tab by user ID.

## Settings

The dashboard has three tabs: **Configuration**, **Active Channels** and **User Preferences**. **Configuration** is split into **Basic Configuration**, **Channel Defaults** and **Channel Management**. `voiceconfig` with no arguments shows every value; `voiceconfig <setting> <value>` changes one.

| Setting | Default | What it controls |
| --- | --- | --- |
| Hub channel | none | The join-to-create channel |
| Category | none | Where new channels are created |
| Default Name Format | `{0}'s Channel` | Template for new channel names (`nameformat`) |
| Default User Limit | 0 (unlimited) | Starting user limit (`userlimit`) |
| Default Bitrate | 64 kbps | Starting bitrate (`bitrate`) |
| Delete channels when empty | On | Remove channels nobody is in (`deleteempty`) |
| Empty timeout | 1 | Delay before an empty channel is removed (`emptytimeout`); the dashboard labels it seconds and accepts 5 to 300 |
| Allow multiple channels per user | Off | Let one member own several channels (`multiplechannels`) |
| Remember user preferences | On | Apply saved member preferences (`persistpreferences`) |
| Auto-manage channel permissions | On | Set owner, allow, deny and admin overwrites (`autopermission`) |
| Allow name customization | On | `namechange` |
| Allow user limit customization | On | `limitchange` |
| Allow bitrate customization | On | `bitratechange` |
| Allow channel locking | On | `locking` |
| Allow user management | On | Allow and deny commands (`usermanagement`) |
| Maximum user limit | 99 | Cap for member-set limits (`maxuserlimit`) |
| Maximum bitrate | 96 kbps | Cap for member-set bitrates, also capped by the server's boost tier (`maxbitrate`) |
| Admin role | none | Role that may manage any custom channel (`adminrole`) |

**Maximum user limit**, **Maximum bitrate** and **Admin role** have no dashboard control; set them with `voiceconfig`.

The **Active Channels** tab lists every live custom channel with its owner, lock and keep alive state, lets you lock, unlock or delete one, and shows totals for channels created, active in the last hour, locked and kept alive. It also holds the **Clean up inactive channels** button and a **Disable custom voice** button that turns the module off for the server.

## Setup walkthrough

1. Give the bot Manage Channels, Move Members and Manage Roles (for permission overwrites) in the category you will use.
2. Run `setupvoicehub`, or open **Custom Voice** in the dashboard and pick an existing hub channel and category under **Basic Configuration**.
3. Set **Default Name Format**, **Default User Limit** and **Default Bitrate** under **Channel Defaults**.
4. Under **Channel Management**, turn off any customisations you do not want members to have.
5. Set an **Admin role** with `voiceconfig adminrole @Moderators` so staff can manage channels they do not own.
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
- The empty-channel timer that runs when the last member leaves treats the timeout value as seconds, while the config display and the five-minute sweep treat it as minutes. With the default of 1 the channel disappears almost immediately once empty.
- Keep alive channels are never cleaned up automatically. Use the **Active Channels** tab or `voicechannels` to find forgotten ones.
- Claiming only works while the original owner is not connected to the channel.
