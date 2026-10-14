---
title: Confessions
slug: confessions
summary: Members send anonymous confessions that the bot posts as numbered embeds in a channel, with an optional staff-only log that reveals who sent each one.
icon: fa-comment
category: Community
dashboard: /dashboard/confessions
module: Confessions
tags: [confessions, confess, anonymous, secrets, confession channel, confession log, blacklist]
related: [administration, moderation]
---

## What it does

A member runs `/confess` in the server, or DMs the bot `.confess <server id> "text"`, and the bot posts their message in the confession channel as an embed headed "Anonymous confession #N". The sender's name never appears in that channel. They get a private confirmation, and the confession number goes up by one each time.

Staff can set a separate log channel. Every confession is copied there with the sender's tag and ID, the confession number, and a jump link to the posted message. Members are told in every confession footer how to confess, and in the confirmation that they can report a server that abuses the feature.

Staff can also blacklist individual members so their confessions are refused, and delete confessions from the dashboard, which removes the Discord message as well.

## Why you would use it

- Vent or "tea" channels where members want to speak without a name attached.
- Compliment or appreciation channels that stay anonymous.
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

When a **Log Channel** is set, each confession also produces a red embed there with **User** (tag and ID), **Confession N** (the text), a **Message Link**, and a warning about misuse. This is the only place the sender is revealed, so restrict it to people you trust.

> [!WARNING]
> The log channel exists so staff can deal with harassment. Sharing who sent a confession is grounds for the bot owners to blacklist the server. Members can report abuse with `/confessions report`.

## Blacklist

`confessionblacklist` adds a member to the server's blacklist and `confessionunblacklist` removes them. Blacklisted members get "you are blacklisted" instead of a post. The check is by user ID.

The dashboard shows a **Role Blacklist** and stores role IDs in the same list. The bot only compares the sender's user ID against the list when a confession comes in, so roles selected on the dashboard do not currently stop anyone. Use the commands to block specific members.

## Settings

The **Confessions** page has three tabs: **Configuration**, **Confessions** and **Statistics**.

| Setting | Default | What it controls |
| --- | --- | --- |
| Confession Channel | none | Where anonymous confessions are posted; confessions are off until set |
| Log Channel (shows user IDs) | none | Where the identifying copy of each confession goes |
| Role Blacklist | none | See the blacklist section above |

**Confessions** lists every stored confession newest first with its number and date. Content is hidden until you expand it, and **Delete confession** removes it from the database and deletes the message in Discord if it still exists.

**Statistics** shows **Total Confessions**, **This Month**, **Today** and **Latest Number**.

## Setup walkthrough

1. Create a channel where the bot has Send Messages and Embed Links, and members can read but ideally not post.
2. Open **Confessions** in the dashboard and pick that channel as **Confession Channel**.
3. Optionally pick a private staff channel as **Log Channel**.
4. Click **Save Configuration**.
5. Run `/confess` from a member account and check the embed appears with `#1`.
6. If someone abuses it, find them in the log channel and run `confessionblacklist @user`.

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
- Confessions are stored with the sender's user ID even without a log channel, and the dashboard can look up a single confession's sender. Treat dashboard access as staff-only.
- Deleting from the dashboard removes the stored record, so the log channel copy is your only remaining trace.
