---
title: Stickies
slug: stickies
summary: Keeps a message at the bottom of a channel by reposting it as new messages arrive
icon: fa-thumbtack
category: Actions
dashboard: /dashboard/channel-messages?tab=stickies
module: Utility
tags: [sticky, sticky message, stick, pinned message, bottom of channel, sticky template, rules reminder]
related: [repeaters, autoreactions, utility, embedbuilder]
---

## What it does

A sticky is a message the bot keeps near the bottom of one channel. When people post below it, the bot deletes its old copy and posts it again, so the message is always one of the last things in the channel.

It does not repost after every message. A sticky returns once either of two things happens, whichever comes first:

- the channel got the set number of new messages, or
- the wait time passed since the first new message.

This keeps a busy channel from being flooded with reposts and a slow channel from showing a stale sticky for long. Each channel has at most one sticky.

## Why you would use it

- Keep the channel rules at the bottom of a help channel.
- Show a "how to ask a question" notice in a support channel.
- Pin an announcement that stays visible without using Discord's pin limit.
- Reuse one message in several channels through a template.

## The Stickies tab

The **Channel messages** page has a **Stickies** tab with two cards.

### Sticky messages

The **Sticky messages** card lists every sticky with its channel and a preview of the message. A badge such as `5 messages, 15s` shows its timing. Each row has edit and delete buttons. An empty list reads **No stickies**. **Clear all** removes every sticky in the server after you confirm. It only shows while at least one sticky exists.

Press **New sticky** to open the form.

| Setting | Default | What it controls |
| --- | --- | --- |
| Channel | none | The text channel to stick to. Channels that already have a sticky are not listed. Fixed once the sticky exists. |
| Message | none | Opens the embed builder. Required. |
| After messages | 5 | New messages that bring the sticky back. 1 to 1000. |
| Wait at most | 15 seconds | How long after the first new message the sticky comes back, even if the message count was not reached. 5 seconds to 6 hours. |

A new sticky is created when you press **Create** and the bot posts it right away. Changes to an existing sticky save automatically, with the save status shown in the header.

### Templates

The **Templates** card holds saved messages you can stick to any channel later. An empty list reads **No templates**. Press **New template** and fill in:

| Setting | What it controls |
| --- | --- |
| Name | Up to 50 characters. Cannot be changed after saving, and names are matched without regard to case. |
| Message | The message, built in the embed builder |

Open a saved template to edit its message or to use it. Under **Stick to channel**, pick a channel and press **Stick** to create a sticky from the template. If that channel already has a sticky, its message is replaced and its message count and wait time stay as they are.

## Setup walkthrough

1. Open **Channel messages** and pick the **Stickies** tab.
2. Press **New sticky**.
3. Pick the **Channel**.
4. Press the **Message** box and build the message.
5. Adjust **After messages** and **Wait at most** if the defaults do not suit the channel.
6. Press **Create**.

> [!TIP]
> A fast channel suits a higher **After messages** value, such as 20, so the sticky does not jump back after every few messages.

> [!PERMISSION]
> The bot needs View Channel, Send Messages, Embed Links and Manage Messages in the channel. It deletes its previous copy before it posts the next one.

## Commands

Run these with your server's prefix (`.` unless you changed it). All of them need Manage Messages.

| Command | Aliases | Purpose |
| --- | --- | --- |
| `stick <message>` | `stickmsg` | Stick a message to the current channel |
| `stickin <#channel> <message>` | `stickmsgin` | Stick a message to another channel |
| `stickyedit <#channel> <message>` | `stickedit` | Change the message of a channel's sticky |
| `unstick [#channel]` | `stickyremove` | Remove a sticky and delete its last copy. Defaults to the current channel. |
| `stickylist` | `stickies` | List the stickies in the server |
| `stickyclear` | `stickiesclear` | Remove every sticky |
| `stickyset <#channel> <messages> <time>` | `stickset` | Set the message count and wait time, for example `stickyset #rules 10 30s` |
| `stickytemplatesave <name> <message>` | `stickytsave` | Save a template, or replace one with the same name |
| `stickytemplatelist` | `stickytlist` | List template names |
| `stickytemplatedelete <name>` | `stickytdelete` | Delete a template |
| `stickytemplateuse <name> [#channel]` | `stickytuse` | Stick a template to a channel. Defaults to the current channel. |

Slash equivalents live under `/sticky`.

## Tips and gotchas

- Sticking to a channel that already has a sticky replaces its message instead of making a second one.
- Editing a sticky posts the new message right away.
- Stickies are built on the same system as repeaters. They do not show on the **Repeaters** tab.
- If the channel is deleted or the bot loses access, the sticky removes itself.
- Stickies load shortly after the bot starts. Commands do nothing until that finishes.
- Deleting a template does not remove stickies that were made from it.
