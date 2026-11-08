---
title: Channel Tools
slug: channel-tools
summary: Lock the server down and run bulk actions on channels, like cloning one or purging messages
icon: fa-hashtag
category: Actions
dashboard: /dashboard/administration?tab=channels
module: ServerManagement
tags: [lockdown, lock, hide, slowmode, clone, nuke, purge, auto purge, sync permissions, voice text, channels]
related: [servermanagement, administration, server-backups]
---

## What it does

The **Channels** tab of the **Server tools** page runs the channel commands from the dashboard. It has six cards, from top to bottom: **Lockdown**, **Channel actions**, **Locked and hidden channels**, **Single channel**, **Auto-purge** and **Voice text channels**. Everything that deletes or restricts something asks you to confirm first. See [Administration](/wiki/administration) for the other tabs.

## Lockdown

A lockdown stops members from sending messages, joining, or both. Pick a type, then click **Start lockdown**.

| Type | Effect |
| --- | --- |
| Messages | Everyone loses permission to send messages in every channel |
| Joins | New members are kicked or banned as they join |
| Messages and joins | Both of the above |

For the two types that involve joins, choose **Kick** or **Ban**. While a lockdown runs, the card shows "Lockdown active" with the type and a **Lift lockdown** button. Lifting it puts the channel permissions back.

Channels and categories you add under **Channels lockdown skips** are never touched. That list saves as soon as you change it.

## Channel actions

Pick any number of channels, choose an action, then click **Apply to N selected**.

| Action | Effect |
| --- | --- |
| Set slowmode | Sets slowmode on the selected channels, 0 to 21600 seconds. Field: **Slowmode (seconds)** |
| Lock chat | Stops @everyone from sending messages |
| Unlock chat | Undoes a lock and restores the old permissions |
| Hide channel | Hides the channel from @everyone |
| Show channel | Undoes a hide |
| Sync with category | Replaces the channel's permissions with its category's |

Lock and Hide have a **Lasts for (minutes), empty for no limit** field, from 1 minute up to 525600 (365 days). When some channels fail, the result reads "Updated X, failed Y".

## Locked and hidden channels

Every channel that is currently locked or hidden is listed with its end time, or "Until undone", and an undo button that restores the channel.

## Single channel

Pick one channel and one of four tools.

| Tool | Effect |
| --- | --- |
| Clone | Copies the channel with its settings and permissions. **Name of the copy (optional)** takes up to 100 characters |
| Purge | Deletes recent messages. **Messages to delete** is 1 to 1000. **Which messages** limits it to All, Humans, Bots, With links or With attachments, and **Keep pinned messages** spares pins |
| Delete after message | Deletes every message after the **Message ID** you give |
| Recreate | Deletes a text channel and creates it again with the same settings. Its messages are lost for good |

## Auto-purge

An auto-purge rule deletes messages older than an age you set, checked on an interval you set. Click **Add rule**, pick a channel and fill in:

| Field | Range |
| --- | --- |
| Delete messages older than (minutes) | 1 to 525600 |
| Check every (minutes) | 5 to 1440 |
| Which messages | All, Humans, Bots, With links or With attachments |
| Keep pinned messages | On or off |

Each rule shows a summary such as "Older than 1d, checked every 1h". **Purge now** runs a rule straight away and reports how many messages it deleted. The remove button stops the rule.

## Voice text channels

Link a voice channel to a text channel so members can see the text channel only while they are in the voice channel. Pick a **Voice channel** and a **Text channel**, then click **Link channels**. The remove button unlinks one.

## Commands

| Command | Purpose |
| --- | --- |
| `/channel lockdown` and `/channel lift-lockdown` | Start and lift a lockdown |
| `/channel lockdown-exempt` and `/channel lockdown-exempt-list` | Add or remove a channel lockdown skips, and list them |
| `/channeltools lock`, `unlock`, `hide`, `unhide`, `list` | Timed locks and hides |
| `/channel slowmode` | Set slowmode |
| `/channel edit`, `sync-permissions`, `clone` | Change, sync and copy channels |
| `/channel nuke` | Recreate a text channel |
| `/autopurge set`, `off`, `list`, `run` | Manage auto-purge |
| `/voicetext link`, `unlink`, `list` | Manage voice text links |
