---
title: Chat Saver
slug: chatsaver
summary: Pull a channel's recent history into the dashboard so you can read it or save a snapshot
icon: fa-folder
category: Security
dashboard: /dashboard/chatsaver
module: Utility
tags: [chat saver, chat log, save chat, transcript, export, archive, history, evidence, ticket transcript]
related: [tickets, logging, auditlog]
---

## What it does

Chat Saver has two halves. On the dashboard, staff pick a channel and a time window, and the bot fetches every message from that period: text, author, attachments and embeds. They can read it on the page and save it as a named log if it is worth keeping. Saved logs live in the bot's database, so they survive the original messages being deleted.

In Discord, `savechat` runs a full transcript export of a channel for a window of up to three days and gives you a link to an HTML file that looks like Discord, including media.

Ticket transcripts also land here. When a ticket closes in a server that has a ticket transcript channel set, the ticket system stores the conversation as a saved log named `Ticket #<id> - <channel>`, so it shows up under **Saved logs** with everything else.

## Why you would use it

- Keeping evidence of an argument or rule break before people delete their messages.
- Archiving an event channel or announcement thread before it is removed.
- Reviewing what happened in a channel overnight without scrolling back in Discord.
- Reading old ticket transcripts in one place.

## Fetching messages

On the **Fetch messages** tab, under **Chat options**, choose a **Channel**, a **Time amount** and a **Time unit**, then click **Load messages**. The bot reads the channel from newest to oldest and stops when it reaches messages older than your window or has collected 5000 messages, whichever comes first. The result opens in a panel with the messages oldest first, grouped by day and author. If nothing is found you get a "No messages found in the selected time range" notice instead.

| Time unit | Maximum |
| --- | --- |
| Minutes | 4320 |
| Hours | 72 |
| Days | 3 |

All three caps are the same three day window, and the amount must be above 0. Fetching does not store anything. Close the panel and it is gone.

In the panel, the **Search** box filters the loaded messages and shows how many match. When the fetch hit the 5000 message limit the panel says "Showing 5000 messages. There may be more."

## Saving a log

With messages loaded, click **Save log** at the top of the panel. The log is named `<channel> - <today's date>` and stored with the channel and the message count, and it notes who saved it. Each saved log records the message text, author name and avatar, timestamp, attachment links and embed details such as title, description and thumbnail.

Attachment and avatar links point at Discord's CDN. If Discord removes the file, the link in the saved log stops working, though the text stays.

**Export HTML**, next to **Save log**, downloads the loaded messages as a standalone HTML transcript built in your browser. Nothing is stored on the bot. It is also available when you open a saved log.

## Saved logs

The **Saved logs** tab lists every log for the server with its name, channel, date and message count. Click a log to open it in the same panel, with **Search** and **Export HTML**. A saved log has a name box and a **Rename log** button instead of **Save log**. Renaming changes only the label. The trash button (**Delete log**) asks for confirmation, and deleting is permanent.

Renames and deletions are recorded in the dashboard audit log.

## The savechat command

`savechat` works differently from the dashboard. It runs DiscordChatExporter on the bot's host, writes an HTML file with media, and replies with a link. On the public Mewdeko it DMs you a `cdn.mewdeko.tech` link; on a self-hosted bot it posts the local path in the channel.

The window is limited to three days. Larger values are rejected. The export needs the bot's configured chat save directory to exist, otherwise the command errors out.

> [!NOTE]
> `savechat` exports do not appear under **Saved logs**. They are files on the host, not database entries.

## Settings

Chat Saver has no configuration. The dashboard page has two tabs, **Fetch messages** and **Saved logs**.

| Control | Default | What it controls |
| --- | --- | --- |
| Channel | none | The text channel to read |
| Time amount | 1 | How far back to fetch |
| Time unit | Hours | Minutes, Hours or Days |

## Setup walkthrough

1. Open **Chat Saver** in the dashboard.
2. On **Fetch messages**, select the **Channel** and set **Time amount** and **Time unit**, for example 6 hours.
3. Click **Load messages**. The messages open in a panel.
4. Read through them, using **Search** to narrow them down.
5. Click **Save log** to keep it. It appears on **Saved logs**.
6. Open the log from **Saved logs** and use **Rename log** to give it a meaningful name, such as the incident or date.

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
