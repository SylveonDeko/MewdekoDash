---
title: Chat Saver
slug: chatsaver
summary: Pull the recent history of a channel into the dashboard, read it there, and keep named snapshots for later, or export an HTML transcript from Discord with a command.
icon: fa-folder
category: Security
dashboard: /dashboard/chatsaver
module: Utility
tags: [chat saver, chat log, save chat, transcript, export, archive, history, evidence, ticket transcript]
related: [tickets, logging, auditlog]
---

## What it does

Chat Saver has two halves. On the dashboard, staff pick a channel and a time window, and the bot fetches every message from that period: text, author, attachments and embeds. They can read it on the page and, if it is worth keeping, save it as a named log. Saved logs live in the bot's database, so they survive the original messages being deleted.

In Discord, `savechat` runs a full transcript export of a channel for the last few minutes, hours or days and gives you a link to an HTML file that looks like Discord, including media.

Ticket transcripts also land here. When a ticket closes in a server that has a ticket transcript channel set, the ticket system stores the conversation as a saved log named `Ticket #<id> - <channel>`, so it shows up under **Saved Logs** with everything else.

## Why you would use it

- Keeping evidence of an argument or rule break before people delete their messages.
- Archiving an event channel or announcement thread before it is removed.
- Reviewing what happened in a channel overnight without scrolling back in Discord.
- Reading old ticket transcripts in one place.

## Fetching messages

On the **Fetch Messages** tab, choose a **Channel**, a **Time Amount** and a **Time Unit**, then click **Load Messages**. The bot reads the channel from newest to oldest and stops when it reaches messages older than your window or has collected 5000 messages, whichever comes first. Messages are shown oldest first on the **View Messages** tab.

| Time unit | Maximum |
| --- | --- |
| Minutes | 4320 |
| Hours | 72 |
| Days | 3 |

All three caps are the same three day window. Fetching does not store anything; close the page and it is gone.

## Saving a log

With messages loaded, click **Save Log** on the **View Messages** tab. The log is named `<channel> - <today's date>` and stored with the channel, who saved it and the message count. Each saved log records the message text, author name and avatar, timestamp, attachment links and embed titles, descriptions and thumbnails.

Attachment and avatar links point at Discord's CDN. If Discord removes the file, the link in the saved log stops working, though the text stays.

**Export HTML**, next to **Save Log**, downloads the loaded messages as a standalone HTML transcript built in your browser. Nothing is stored on the bot.

## Saved logs

The **Saved Logs** tab lists every log for the server, newest first, with its channel and message count. Each entry has **View log**, **Rename log** and **Delete log**. Renaming changes only the label. Deleting is permanent and happens as soon as you click; there is no confirmation prompt.

Renames and deletions are recorded in the dashboard audit log.

## The savechat command

`savechat` works differently from the dashboard. It runs DiscordChatExporter on the bot's host, writes an HTML file with media, and replies with a link. On the public Mewdeko it DMs you a `cdn.mewdeko.tech` link; on a self-hosted bot it posts the local path in the channel.

The window is limited to three days. Larger values are rejected. The export needs the bot's configured chat save directory to exist, otherwise the command errors out.

> [!NOTE]
> `savechat` exports do not appear under **Saved Logs**. They are files on the host, not database entries.

## Settings

Chat Saver has no configuration. The dashboard page has three tabs: **Fetch Messages**, **Saved Logs** and **View Messages**.

| Control | Default | What it controls |
| --- | --- | --- |
| Channel | none | The text channel to read |
| Time Amount | 1 | How far back to fetch |
| Time Unit | Hours | Minutes, Hours or Days |

## Setup walkthrough

1. Open **Chat Saver** in the dashboard.
2. On **Fetch Messages**, select the **Channel** and set **Time Amount** and **Time Unit**, for example 6 hours.
3. Click **Load Messages** and wait for the message count to appear.
4. Switch to **View Messages** to read what came back.
5. Click **Save Log** to keep it. It appears on **Saved Logs**.
6. Use **Rename log** to give it a meaningful name, such as the incident or date.

## Commands

Run these with your server's prefix (`.` unless you changed it).

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `savechat <time> [#channel]` | | Manage Messages | Export the last `<time>` of a channel to HTML, for example `savechat 2h #general` |

## Tips and gotchas

- The bot must be able to read the channel and its message history. Channels it cannot see return "Channel not found".
- Fetching stops at 5000 messages. For a very busy channel, use a shorter window.
- Message edits and deletions that happened before you fetch are not visible; the bot reads what is in the channel at that moment. Use the logging feature for a live record.
- Saved logs store author names as they were at save time. A later username change is not reflected.
- Anyone with dashboard access to the server can read saved logs, including ticket transcripts. Restrict dashboard access accordingly.
- `savechat` is meant for the public bot's CDN. Self-hosters need to set a chat save path in credentials and copy the DiscordChatExporter files next to the bot.
