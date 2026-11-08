---
title: Server Backups
slug: server-backups
summary: Back up your server's layout and settings so you can restore them later
icon: fa-box-archive
category: Actions
dashboard: /dashboard/administration?tab=backups
module: Administration
tags: [backup, restore, template, server template, roles, channels, emoji, clone server, disaster recovery]
related: [administration, servermanagement, channel-tools]
---

## What it does

A backup is a copy of a server's settings, roles, categories, channels, permission overwrites and emoji. It can also hold the most recent messages of channels you pick. Backups belong to you, not to the server, so you can restore one into a different server you own or administrate.

A template is the same idea without server settings and without extras such as emoji and messages. It is meant for reusing a layout. The bot comes with starter templates for community, gaming and support servers.

Open the **Backups** tab of the **Administration** page, or use the `/server backup` and `/server template` commands. The tab has three cards: **Back up this server**, **Your backups** and **Templates**.

## Back up this server

1. Set **Recent messages to save per channel**, from 0 to 100. Leave it at 0 to skip messages.
2. If it is above 0, pick the text channels in **Channels to save messages from**. Only the first 10 are used.
3. Press **Create backup**.

The button is disabled while you are at your backup limit. The line under it shows how many backups you have used and the time you have to wait between backups.

## Your backups

Each row shows the backup number, the server it came from, when it was made, its size, and badges for roles, channels, emoji and messages. Open a row to preview the roles and channels inside it. Use the trash button to delete it. Delete asks for confirmation and can't be undone.

In the preview, **Restore into** the selected server using one of two modes:

- **Add what's missing** only creates the roles, channels and emoji the server doesn't have.
- **Replace everything** deletes every role, channel and emoji first, then recreates them from the backup. It can't be undone.

Press **Restore** and confirm. A restore runs in the background and the tab shows its progress (**Restoring**, then **Restore finished** with a count of failed or skipped items). When it ends, the bot sends a summary to your direct messages, or to a restored channel if your messages are closed.

### Limits

| Limit | Value |
| --- | --- |
| Backups per person | 5 |
| Size of one backup | 25 MB compressed |
| Time between backups | 30 minutes |
| Messages saved per channel | 100 |
| Channels to save messages from | 10 |

There is no limit on templates.

## Who can use it

You must own the server or have the Administrator permission, both to create a backup and to restore one. Restoring a backup of another server also needs you to be an administrator there while the bot is in that server. The bot needs Manage Roles, Manage Channels, Manage Server and Manage Emojis and Stickers, plus Manage Webhooks to restore messages, and its highest role must sit above the roles it creates.

## Templates

The **Templates** card lists the starter templates (Community, Gaming, Support) and your saved ones. Type a **Template name** (up to 50 characters) and press **Save as template**. Using an existing name asks before replacing your template. Open a row to preview it. **Apply** only adds the roles and channels the server is missing and never deletes anything. Starter templates can't be deleted.

## Commands

| Command | Purpose |
| --- | --- |
| `/server backup create [messages] [channels]` | Back up this server |
| `/server backup list` | List your backups |
| `/server backup info <id>` | Show what a backup holds |
| `/server backup restore <id> [mode]` | Restore a backup into this server |
| `/server backup delete <id>` | Delete a backup |
| `/server template save <name>` | Save this server as a template |
| `/server template list` | List starter and saved templates |
| `/server template apply <name>` | Add a template's missing roles and channels |
| `/server template delete <name>` | Delete a saved template |
