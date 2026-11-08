---
title: Channel Messages
slug: channel-messages
summary: One page for the messages the bot posts or reacts to on its own in channels
icon: fa-comment
category: Actions
dashboard: /dashboard/channel-messages
module: Utility
tags: [channel messages, sticky, sticky message, stickies, repeater, auto reaction, autoreact, reactions, templates, forum]
related: [repeaters, embedbuilder, utility]
---

## What it does

The Channel Messages page, described on the dashboard as messages the bot posts or reacts to in channels, has three tabs. Pick one at the top. The page remembers it in the address as `?tab=`, and the arrow keys move between tabs. Changes to existing items save as you make them. New items are saved with **Create**.

| Tab | What it does |
| --- | --- |
| Repeaters | Posts a message again and again in a channel on a schedule or trigger. See [Repeaters](/wiki/repeaters). |
| Stickies | Keeps a message at the bottom of a channel. |
| Reactions | Adds emojis to new messages in a channel. |

## Repeaters

The **Repeaters** card lists every repeater by channel with a preview of its message. Click **New repeater** to add one, or click a row to edit it. A repeater can also be turned on or off and deleted from its row.

Inside a repeater you set the **Channel**, the **Message**, and the **Trigger**: Time interval, On activity, On no activity or Immediate. A repeater created from the older sticky commands may show After messages. The other options are:

| Setting | What it does |
| --- | --- |
| Every | Time interval only. How often it posts, from 5 seconds up |
| Start at (UTC) | Time interval only. The time of day the schedule starts from |
| Messages and Within | Activity triggers. How many messages in how much time count as busy or quiet |
| Skip if unchanged | Does not post again if nothing else was posted since |
| Silent | Posts without a notification |
| Wait for quiet chats | Holds the post while the channel is busy. **Messages per minute** sets how busy |
| Expires | Stops the repeater after **Expires after**, in hours or days. Starts at 7 days |
| Limit posts | Stops after **Stop after posts**. Starts at 10 |
| Schedule | Always, Business hours (9-5), Evening hours or Weekends only |
| Priority | Decides which repeater goes first when several are due. Starts at 50 |
| Send now | Posts the message immediately without changing the schedule |

When the channel is a forum, you also get **Stick in new threads**, **Threads only**, **Only threads with tags** and **Skip threads with tags**. Forums show as the channel name followed by "(forum)" in the channel list.

The full list of trigger modes, placeholders and examples is in [Repeaters](/wiki/repeaters).

## Stickies

A sticky message stays at the bottom of a channel. When people keep posting, the bot deletes its old copy and posts a new one below them. Each channel can have one sticky.

### Sticky messages

The **Sticky messages** card lists every channel that has a sticky, with a preview of the message and a badge such as `5 messages, 15s`. Click a row to edit it, or delete it from the row. **Clear all** removes every sticky after you confirm.

To add one:

1. Click **New sticky**.
2. Choose the channel. Channels that already have a sticky are not listed.
3. Write the message. It can be plain text or an embed from the embed builder.
4. Set **After messages** and **Wait at most**.
5. Click **Create**.

| Setting | Default | Range | What it does |
| --- | --- | --- | --- |
| After messages | 5 | 1 to 1000 | The sticky moves back to the bottom once this many new messages have been posted |
| Wait at most | 15 seconds | 5 seconds to 6 hours | The sticky also moves back to the bottom this long after the first new message, even if the message count has not been reached |

Whichever limit is reached first moves the sticky. Both settings save as you type once the sticky exists.

### Templates

A template is a saved sticky message you can put in any channel. The **Templates** card lists them by name.

1. Click **New template**.
2. Enter a **Name**. It can be up to 50 characters and cannot be changed afterwards.
3. Write the message and click **Save**.

To use a template, open it, choose a channel under **Stick to channel** and click **Stick**. This creates a sticky in that channel with the default settings. Saving a template under an existing name replaces its message.

### Commands

These need the Manage Messages permission.

| Command | Aliases | Purpose |
| --- | --- | --- |
| `stick <message>` | `stickmsg` | Stick a message to the current channel |
| `stickyedit <channel> <message>` | `stickedit` | Change the message of a channel's sticky |
| `stickyset <channel> <messages> <time>` | `stickset` | Change how many messages or how much time brings the sticky back down |
| `stickylist` | `stickies` | List the stickies |
| `unstick [channel]` | `stickyremove` | Remove a sticky |
| `stickyclear` | `stickiesclear` | Remove every sticky |
| `stickytemplatesave <name> <message>` | `stickytsave` | Save a template |
| `stickytemplatelist` | `stickytlist` | List the templates |
| `stickytemplateuse <name> [channel]` | `stickytuse` | Stick a template to a channel |
| `stickytemplatedelete <name>` | `stickytdelete` | Delete a template |

There is also a `/sticky` slash command group.

## Reactions

Auto reactions add emojis to new messages in a channel. Rules are checked from the top of the list down, and messages are only matched when they are plain user messages or replies.

### Auto reactions

The **Auto reactions** card lists each rule by channel, with its emojis and badges for its message type and filters. Each row has a switch to turn the rule on or off and arrows to move it up or down. Edit and delete buttons are on the row too. Order sets priority.

To add one:

1. Click **New reaction**.
2. Choose the channel. Forum channels are listed as the name followed by "(forum)". For a forum the bot reacts to the first post of each new thread.
3. Add emojis under **Emojis**, using server emojis or standard ones. At least one is needed.
4. Set the optional filters below.
5. Click **Create**.

| Setting | What it does |
| --- | --- |
| Emojis | Up to 10 per rule, added in the order shown |
| React to | Any message, Text only, Images, Videos, Images and videos or Links |
| Delete other messages | Deletes messages that do not fit **React to**. Needs the Manage Messages permission in that channel. Does nothing when **React to** is Any message |
| Skip bots | On by default. Does not react to bot messages |
| Skip webhooks | Does not react to webhook messages |
| Skip replies | Does not react to replies |
| Needs one of | Words. Only messages containing at least one of them get reactions |
| Skips on | Words. Messages containing any of them get no reaction |
| Only these roles | Only members with one of these roles. Empty means everyone |
| Ignored roles | Members with these roles are skipped |
| Ignored members | These members are skipped |

Each word list takes up to 25 words of up to 50 characters. Words match anywhere in the message and ignore capitals. Emojis from other servers or deleted emojis are skipped. The bot needs Add Reactions and Read Message History in the channel.

### Access

The **Access** card has **Role that can manage reactions**. Members with this role can manage rules with the `autoreact` command without needing the Manage Server permission. Setting the role itself needs Manage Server.

### Commands

| Command | Aliases | Purpose |
| --- | --- | --- |
| `autoreact list` | `areact` | List the rules |
| `autoreact add <channel> <emojis>` | | Add a rule |
| `autoreact manager [role]` | | Show or set the manager role |

`autoreact` also takes `show`, `remove`, `enable`, `disable`, `edit` and `move` followed by a rule number. Run `autoreact` with no arguments in your server for the current usage.
