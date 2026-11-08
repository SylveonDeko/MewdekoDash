---
title: Confessions
slug: confessions
summary: Members send anonymous confessions that the bot posts in a channel as numbered embeds
icon: fa-comment
category: Community
dashboard: /dashboard/confessions
module: Confessions
tags: [confessions, confess, anonymous, secrets, confession channel, confession log, blacklist]
related: [administration, moderation]
---

## What it does

A member runs `/confess` in the server, or DMs the bot `.confess <server id> "text"`, and the bot posts their message in the confession channel as an embed headed "Anonymous confession #N". The sender's name never appears in that channel. They get a private confirmation, and the confession number goes up each time.

Staff can set a separate log channel. Every confession is copied there with the sender's tag and ID. The confession number and a jump link to the posted message come with it. Members are told in every confession footer how to confess, and in the confirmation that they can report a server that abuses the feature.

Staff can also blacklist members or whole roles so their confessions are refused, and delete confessions from the dashboard, which removes the Discord message as well.

## Why you would use it

- Vent, "tea" or compliment channels where members want to speak without a name attached.
- Any anonymous channel where staff still need a way to trace harassment.

## The confession post

Each confession is an embed in the confession channel:

| Part | Content |
| --- | --- |
| Author line | `Anonymous confession #N` with the server icon |
| Description | The confession text |
| Image | The attachment, if one was sent |
| Footer | `Do /confess or dm me .confess <server id> yourconfession to send a confession!` |
| Timestamp | When it was posted |

Numbering starts at 1 and continues from the last stored confession. Deleting a confession does not renumber the others.

Attachments are supported both ways: attach a file to `/confess` with the `attachment` option, or attach one to the DM when using the text command. Only the first attachment is used.

## The log channel

When a **Log channel (shows user IDs)** is set, each confession also produces a red embed there with **User** (tag and ID), **Confession N** (the text), a **Message Link**, and a warning about misuse. This is the only place the sender is revealed, so restrict it to people you trust.

> [!WARNING]
> The log channel exists so staff can deal with harassment. Sharing who sent a confession is grounds for the bot owners to blacklist the server. Members can report abuse with `/confessions report`.

## Blacklist

`confessionblacklist` adds a member to the server's blacklist and `confessionunblacklist` removes them. Blacklisted members get "you are blacklisted" instead of a post. The check matches the sender's user ID and each of their roles, so blocking a role stops everyone who holds it.

The **Blacklist** tab has a **Blocked from confessing** card with a **Roles** list and a **Members** list. Pick a role or member and click **Block**, or click the X on a row to unblock. Each list shows "No roles blocked" or "No members blocked" when empty.

## Settings

The **Confessions** page has three tabs: **Settings**, **Blacklist** and **Confessions**. The header has a **Refresh** button. Changes save as soon as you make them, and the tab is kept in the URL.

### Settings tab

The **Channels** card has two settings.

| Setting | Default | What it controls |
| --- | --- | --- |
| Confession channel | none | Where anonymous confessions are posted. Confessions are off until set |
| Log channel (shows user IDs) | none | Where the identifying copy of each confession goes |

Below them the card shows the DM command members can use, `.confess <server id> message` with your server's own prefix and ID filled in, and a button to copy it. Clear a channel by removing the selection.

### Blacklist tab

See the Blacklist section above.

### Confessions tab

The **All confessions (N)** card starts with four tiles: **Total confessions**, **This month**, **Today** and **Latest number**. Below is a search box (**Search by text or number**) and every stored confession, newest first, 25 at a time with **Show more** for the rest. Each row shows the confession number and date, followed by its text. Click a row to read all of it. The arrow opens the posted message in Discord and the trash button deletes the confession. Deleting asks for confirmation, then removes the stored record and the Discord message if it still exists.

## Setup walkthrough

1. Create a channel where the bot has Send Messages and Embed Links, and members can read but ideally not post.
2. Open **Confessions** in the dashboard and pick that channel as **Confession channel** on the **Settings** tab.
3. Optionally pick a private staff channel as **Log channel (shows user IDs)**.
4. Run `/confess` from a member account and check the embed appears with `#1`.
5. If someone abuses it, find them in the log channel and block them on the **Blacklist** tab.

## Commands

Run these with your server's prefix (`.` unless you changed it). The slash versions live under `/confessions`, except `/confess`, which is top level.

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `confess <server id> <"text">` | | Nobody | DM only. Post a confession in the given server; wrap multi-word text in quotes |
| `confessionchannel [#channel]` | `confesschannel` | Manage Channels | Set the confession channel, or turn confessions off with no channel |
| `confessionlogchannel [#channel]` | `confesslogchannel`, `confessionlogchnl` | Administrator | Set the log channel |
| `confessionblacklist <@user>` | `confessblacklist`, `confessbl` | Manage Channels | Stop a member from confessing |
| `confessionunblacklist <@user>` | `confessunblacklist`, `confessunbl` | Manage Channels | Let a blacklisted member confess again |

`/confessions report <server id> <description>` sends a report about a server misusing confessions to the bot owners. It has no text equivalent.

## Tips and gotchas

- The bot needs Send Messages and Embed Links in both the confession channel and the log channel. The channel commands warn if it lacks them but still save the setting.
- The text `confess` command only works in DMs and takes the confession as a single argument, so `confess 123456789 "I like pineapple on pizza"` works and the unquoted version only posts the first word. `/confess` in the server is simpler for members.
- `confess` by DM only works for servers you share with the bot; other server IDs are refused.
- The text `confessionlogchannel` command with no channel clears the confession channel rather than the log channel. Clear the log channel from the dashboard instead.
- Confessions are stored with the sender's user ID even without a log channel. Treat dashboard access as staff-only.
- Deleting from the dashboard removes the stored record, so the log channel copy is your only remaining trace.
