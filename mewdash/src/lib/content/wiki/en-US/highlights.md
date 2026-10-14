---
title: Highlights
slug: highlights
summary: Members pick words to watch for and get a DM with context whenever someone says one of them in the server.
icon: fa-bolt
category: Community
dashboard: /dashboard/highlights
module: Highlights
tags: [highlights, keywords, watch words, notifications, mentions, dm alerts, ignore channel, ignore user]
related: [afk, utility]
---

## What it does

A member adds a word or phrase with `highlight add`. From then on, whenever a message in the server contains that word, the bot sends them a DM. The DM says which server and channel it happened in, shows the last five messages before it plus the matching one, and has a **Jump to message** button.

Highlights are personal. Each member manages their own list, chooses which channels and people to ignore, and can switch their highlights off without deleting them. Staff cannot add highlights for someone else, but the dashboard lets them see what is being watched and remove entries.

Members only get DMs for channels they can actually see. A member who is typing in the server is assumed to be present, so highlights pause for them for two minutes.

## Why you would use it

- Get pinged when your name, nickname or project is mentioned without an actual @mention.
- Follow a topic such as "giveaway" or "patch notes" across a large server.
- Staff can watch for words like "help" or "report" without reading every channel.
- Moderators can audit what members are tracking and clean out abusive or spammy entries.

## How matching works

The bot checks every non-empty message against every highlight in that server.

- A highlight matches as a whole word or phrase. `cat` does not match "category", but "the cat sat" does.
- Matching is case sensitive. Add `Cat` and `cat` separately if you want both.
- Each member gets at most one DM per two minutes in a server, however many words match.
- Typing anywhere in the server starts that same two minute pause, so you are not DMed about a conversation you are already in.
- Messages from ignored users and in ignored channels are skipped for that member.
- The DM is skipped when the member cannot view the channel or has DMs closed.
- Messages are checked through a queue that handles one message every two seconds. On a very busy shard some messages can be dropped from that queue.

`highlight match some text` checks your own list against a sample sentence and tells you which of your words would have matched. That check ignores case, so it is a rough guide rather than an exact copy of the live rule.

## Per-member settings

Each member has a settings row that is created the first time they toggle something.

| Setting | Default | What it controls |
| --- | --- | --- |
| Highlights on | on | `highlight toggle false` pauses all of your highlights in this server |
| Ignored channels | none | Channels where your words never trigger a DM |
| Ignored users | none | People whose messages never trigger your highlights |

## Settings

The Highlights page in the dashboard is for staff. It does not add highlights; it shows and removes them.

| Tab | What it shows |
| --- | --- |
| All Highlights | Every highlight in the server grouped by member, with a delete button per word and a button to remove all of one member's words |
| Search | Find highlights containing a word across all members; the search ignores case |
| Disabled Users | Members who have turned their highlights off, with how many channels and users they ignore |
| Statistics | Total Highlights, Active Users, Top Word, Most Active, plus Top Highlighted Words and Recent Highlights |

## Setup walkthrough

There is nothing to enable. Highlights work as soon as the bot is in the server.

1. As a member, run `highlight add yourname` in any channel.
2. Run `highlight list` to confirm it saved.
3. Have someone type your name in another channel. Wait a couple of seconds and check your DMs.
4. If you get too many, run `highlight toggleignore #busy-channel` or `highlight toggleignore @user`.
5. Staff: open **Highlights** in the dashboard to review the **All Highlights** tab and remove anything unwanted.

## Commands

Run these with your server's prefix (`.` unless you changed it). The same actions exist as the single slash command `/highlights manage`, whose `action` option is `Add`, `List`, `Delete`, `Match`, `ToggleUser`, `ToggleChannel` or `ToggleGlobal`, with separate `words`, `user` and `channel` options.

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `highlight add <word>` | `highlights`, `hl` | Nobody | Watch a word or phrase |
| `highlight list` | `highlights`, `hl` | Nobody | Page through your highlights, ten per page |
| `highlight delete <number or word>` | `highlights`, `hl` | Nobody | Remove by its list number or exact word; `remove` does the same |
| `highlight match <text>` | `highlights`, `hl` | Nobody | Show which of your words appear in the text |
| `highlight toggleignore <#channel or @user>` | `highlights`, `hl` | Nobody | Add or remove a channel or person from your ignore list |
| `highlight toggle <true or false>` | `highlights`, `hl` | Nobody | Turn all your highlights in this server on or off |

## Tips and gotchas

- The bot needs to be able to read the channel to match in it, and you need DMs open from server members to receive alerts.
- Adding a word you already have is rejected. The check for duplicates ignores case, but live matching does not.
- Deleting by number uses the position shown in `highlight list`, which changes after every removal.
- The highlight list and settings are cached for thirty minutes per server. Adding or deleting single words through commands or the dashboard updates the cache straight away; removing all of a member's words from the dashboard can take up to thirty minutes to stop DMs.
- When the bot leaves a server, its highlights and settings are cleaned up the next time the bot restarts.
