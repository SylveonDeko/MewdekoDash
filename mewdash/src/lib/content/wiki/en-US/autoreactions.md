---
title: Auto reactions
slug: autoreactions
summary: Reacts to new messages in a channel with emojis you choose, optionally only when they match a filter
icon: fa-face-smile
category: Actions
dashboard: /dashboard/channel-messages?tab=reactions
module: Utility
tags: [auto reaction, autoreact, react to messages, emoji reaction, reaction rules, image channel, polls, voting reactions]
related: [repeaters, stickies, utility, starboard]
---

## What it does

An auto reaction rule makes the bot add emojis to new messages in one channel. A rule can react to everything or only to messages that match its filters, such as images and links, or messages containing a certain word.

In a forum channel, the bot reacts to the first post of each new thread instead of to every reply.

A channel can have several rules. Each rule has its own emojis and filters, and the rules for a channel run in list order.

## Why you would use it

- Add an up and down vote to every post in a suggestions or showcase channel.
- React only to images and videos in a media channel.
- Mark every link posted in a channel.
- Remove anything that is not an image from a screenshots channel while reacting to the rest.
- Let a moderator role manage the rules without giving them Manage Server.

## The Reactions tab

The **Channel messages** page has a **Reactions** tab with two cards.

### Auto reactions

The **Auto reactions** card lists every rule as the channel name and the emojis, with a badge for the message type. **Words** appears if it has word filters and **Filters** if it has role or member filters. An empty list reads **No reactions**.

Each row has a switch to turn the rule on or off. Buttons on the row edit or delete it, and two more move it up or down. Order matters: rules higher in the list add their reactions first.

Press **New reaction** to open the form. Changes to an existing rule save automatically, with the save status in the header next to the enabled switch. A new rule is only created when you press **Create**.

| Setting | Default | What it controls |
| --- | --- | --- |
| Channel | none | A text channel or a forum. Forums are listed as `#name (forum)`. |
| Emojis | none | The emojis to add, picked from the server emojis and the standard ones. At least one is required, up to 10. |
| React to | Any message | **Any message**, **Text only**, **Images**, **Videos**, **Images and videos** or **Links** |
| Delete other messages | off | Remove messages that do not fit the chosen type instead of just skipping them |
| Skip bots | on | Do not react to messages from bots |
| Skip webhooks | off | Do not react to messages from webhooks |
| Skip replies | off | Do not react to messages that reply to another message |
| Needs one of | none | The message must contain at least one of these words |
| Skips on | none | The message is skipped if it contains any of these words |
| Only these roles | Everyone | Only members with one of these roles get reactions |
| Ignored roles | none | Members with any of these roles never get reactions |
| Ignored members | None | Members who never get reactions |

Word lists take up to 25 words of up to 50 characters each. Words match anywhere in the message and ignore case.

### Message types

| Type | Matches |
| --- | --- |
| Any message | Every message |
| Text only | Messages with no attachment and no embed or link |
| Images | Messages with an image attachment or embed, or a GIF |
| Videos | Messages with a video attachment or video embed |
| Images and videos | Either of the above |
| Links | Messages containing a link |

### Access

The **Access** card has one setting, **Role that can manage reactions**. Members with this role can manage auto reactions with the commands without having Manage Server. Leave it empty to require Manage Server. Setting or clearing this role through the `autoreact manager` command needs Manage Server.

## How a rule is applied

For each new message in the rule's channel, the bot checks in this order:

1. The rule is enabled.
2. The message is a normal message or a reply.
3. The author is not on **Ignored members**, and is not a bot or webhook the rule skips.
4. The message is not a reply, if **Skip replies** is on.
5. The author has none of the **Ignored roles**, and one of the **Only these roles** if any are set.
6. The message has none of the **Skips on** words, and one of the **Needs one of** words if any are set.
7. The message fits the **React to** type.

If all of that passes, the bot adds the emojis in order. If **Delete other messages** is on, a message that fits the rule's author filters but not its message type is deleted instead. This does nothing when the type is **Any message**, and it does not apply in forums.

An emoji from another server that the bot cannot use is skipped. An emoji Discord rejects as unknown is skipped from then on until the rules change.

> [!PERMISSION]
> The bot needs Add Reactions and Read Message History in the channel. **Delete other messages** also needs Manage Messages.

## Setup walkthrough

1. Open **Channel messages** and pick the **Reactions** tab.
2. Press **New reaction**.
3. Pick the **Channel**.
4. Pick the **Emojis** one at a time. Remove one with the cross beside it.
5. Pick what to **React to**. Leave it on **Any message** to react to everything.
6. Add word, role or member filters if you need them.
7. Press **Create**, then post a message in the channel to test it.

> [!EXAMPLE]
> For a screenshots channel, choose **Images** as **React to**, add the thumbs up emoji, and turn on **Delete other messages**. Images get a reaction and everything else is removed.

## Commands

Run these with your server's prefix (`.` unless you changed it). They need Manage Server or the manager role. `autoreact` is one command with options.

| Command | Purpose |
| --- | --- |
| `autoreact list` | List the rules |
| `autoreact show <number>` | Show every setting of one rule |
| `autoreact add <#channel> <emojis>` | Add a rule, for example `autoreact add #general 👍 🔥` |
| `autoreact edit <number> <setting> <value>` | Change a setting |
| `autoreact move <number> <position>` | Move a rule in the order |
| `autoreact enable <number>` | Turn a rule on |
| `autoreact disable <number>` | Turn a rule off |
| `autoreact remove <number>` | Delete a rule |
| `autoreact manager [@role or none]` | Show, set or clear the manager role |

The alias is `areact`. The settings for `edit` are `channel`, `emojis`, `type`, `delete`, `bots`, `webhooks`, `replies`, `allowedroles`, `ignoredroles`, `ignoredmembers`, `skipwords` and `requiredwords`. Switches take `on` or `off`. Role, member and word lists take `none` to clear. Separate words with commas. The types are `any`, `text`, `images`, `videos`, `media` and `links`.

Slash equivalents live under `/autoreact`.

## Tips and gotchas

- Rule numbers in commands are the rule IDs shown by `autoreact list`, not the position on the dashboard.
- A rule with no emojis cannot be saved. Removing the last emoji from an existing rule is not saved until you add another.
- Skipping bots is on by default. Turn it off if a bot posts the messages you want to react to.
- Discord limits reactions per message, so several rules on one channel can run out of room.
- **Delete other messages** removes messages permanently. Use **Ignored roles** to exempt staff before turning it on in a busy channel.
