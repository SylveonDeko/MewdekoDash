---
title: Starboard
slug: starboard
summary: Let members vote on the best messages with a reaction, and repost anything that reaches the threshold into a dedicated highlights channel.
icon: fa-star
category: Community
dashboard: /dashboard/starboard
module: Starboard
tags: [starboard, stars, highlights, best of, reactions, pins, repost, threshold]
related: [settings, logging]
---

## What it does

A starboard is a channel where the bot reposts messages that enough people reacted to with a chosen emote. Members react to something funny or useful; once the reaction count reaches the threshold, the bot copies the message into the starboard channel with the author's name, the text, any images or videos, the current reaction counts and a **Jump to Message** button.

The post keeps updating as reactions come and go. If reactions drop below the threshold, the post can be removed. If the original message is deleted or its reactions are cleared, the post can be removed too.

A server can run several starboards at once, each with its own channel, its own emote or set of emotes, its own threshold and its own rules. A "best memes" board watching one emote and a "helpful answers" board watching another can run side by side.

## Why you would use it

- Give the community a way to surface the best content without staff curating it.
- Keep a long-lived highlights channel that new members can scroll through.
- Run separate boards for humour, art, or helpful answers, each with different emotes.
- Limit which channels feed the board, so bot spam and off-topic channels stay out.

## Multiple starboards and emotes

Each starboard is identified by a numeric ID shown by `liststarboards` and in the dashboard list. Commands take that ID as their first argument.

A starboard starts with one emote and can have more added. Any of its emotes counts toward the same total, and the post shows a separate count per emote. An emote can only belong to one starboard in the server; trying to reuse it fails with "emote already in use". A starboard must keep at least one emote, so the last one cannot be removed.

Custom emotes work as well as Unicode ones. The bot tests the emote by reacting to your command message, so it must be one the bot can use.

## Thresholds and counting

The **star threshold** is how many reactions a message needs before it is posted. The default from the command is 1; the dashboard requires at least 1.

When counting, the bot:

- Ignores reactions from bot accounts.
- Adds up reactions across every emote that belongs to that starboard.
- Counts the author's own reaction. There is no self-star exclusion.
- Only reacts to messages that have text or an attachment. A message with neither is skipped.

If the total is below the threshold and a post already exists, the post is deleted when **Remove Below Threshold** is on. Otherwise the post is left as it was.

## Bot messages

By default messages written by bots are never posted. Turn on **Allow Bot Messages** to include them. For a bot message the text is taken from the first embed's description if it has embeds, otherwise from the plain content, and the image comes from the first attachment or the first embed image. When bot messages are allowed, bot reactions are also counted in the per-emote numbers shown on the post.

## Repost threshold

Normally the bot edits the existing starboard post in place whenever the count changes. Once a board is busy, that post may be far up the channel where nobody sees the updated count.

The **repost threshold** fixes this. Set it to a number N, and on each update the bot looks at the last N messages in the starboard channel. If the existing post is among them it is edited. If it has scrolled further back than that, the old post is deleted and a fresh one is sent at the bottom. Set it to 0 to disable reposting and always edit in place.

## Channel filtering

Each starboard has a channel list and a mode:

| Mode | Effect |
| --- | --- |
| Whitelist (default) | Only messages in listed channels are considered. An empty list means every channel. |
| Blacklist | Messages in listed channels are ignored. Everything else is considered. |

`starboardchtoggle <id> #channel` adds or removes a channel from the list. The dashboard's **Manage Channels** action does the same.

## The starboard post

The post is built from components rather than a classic embed:

- A line above the container with each emote and its count.
- The author's name, linked to their profile.
- The message text.
- A media gallery of image and video attachments.
- Up to three other attachments, re-uploaded to the starboard channel. If a download fails, the file name and size are shown instead.
- A **Jump to Message** link button.

Mentions in the reposted text are suppressed, so a starred message cannot ping anyone a second time.

## Removal rules

| Rule | Default | When it fires |
| --- | --- | --- |
| Remove on Delete | On | The original message is deleted. Needs the bot to have Manage Messages in the source channel. |
| Remove on Reactions Clear | On | A moderator clears all reactions from the original. |
| Remove Below Threshold | On | The total drops under the threshold after a reaction is removed. |

## Statistics

`starboardstats` shows totals for the server: starred message count, total stars, the most starred member, the most active channel and the most active starrer. `starboarduserstats [@user]` shows a member's starred message count, stars received, stars given, their top posts, who stars them most, and who they star most. Both are open to everyone.

## Settings

The Starboard page has two sections: **Create New Starboard** and **Manage Starboards**. Each entry in the list shows its channel, emote, threshold and repost threshold, with buttons for **Starboard Settings**, **Manage Channels** and **Delete**.

Inside **Starboard Settings**:

| Setting | Default | What it controls |
| --- | --- | --- |
| Star Threshold | set at creation | Reactions needed before a message is posted |
| Repost Threshold | 0 (disabled) | How many recent messages to search before reposting at the bottom |
| Star Emotes | the creation emote | Add or remove emotes that count for this board |
| Allow Bot Messages | Off | Include messages written by bots |
| Remove on Delete | On | Remove the post when the original is deleted |
| Remove on Reactions Clear | On | Remove the post when reactions are cleared |
| Remove Below Threshold | On | Remove the post when the count falls under the threshold |
| Channel Mode | Whitelist | Whether the channel list is a whitelist or a blacklist |

> [!TIP]
> Start with a threshold of 3 to 5 on an active server. A threshold of 1 turns every stray reaction into a post.

## Setup walkthrough

1. Create a channel for highlights and make sure the bot can send messages, embed links and attach files there.
2. Open **Starboard** in the dashboard.
3. Under **Create New Starboard**, pick the channel, choose an emote from the quick picks or type a custom one, set **Threshold (reactions needed)** and press **Create Starboard**.
4. Open **Starboard Settings** on the new entry. Add any extra emotes under **Star Emotes** and set a **Repost Threshold** such as 20 if the board will be busy.
5. Use **Manage Channels** to whitelist the channels that should feed the board, or switch **Channel Mode** to blacklist and list the ones to exclude.
6. React to a test message with the emote enough times to hit the threshold and check the post appears.

## Commands

Run these with your server's prefix (`.` unless you changed it). `<id>` is the starboard ID from `liststarboards`.

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `createstarboard #channel <emote> [threshold]` | `addstarboard`, `newstarboard` | Manage Channels | Create a starboard, threshold defaults to 1 |
| `deletestarboard <id>` | `removestarboard`, `delstarboard` | Manage Channels | Remove a starboard configuration |
| `liststarboards` | `starboardlist`, `starboards` | Nobody | Page through every starboard and its settings |
| `setstarthreshold <id> <number>` | `starthreshold` | Manage Channels | Set the reactions needed |
| `setrepostthreshold <id> <number>` | `starboardrepost`, `repostthreshold` | Manage Channels | Set the repost window, 0 disables |
| `addstarboardemote <id> <emote>` | `addstaremote`, `starboardaddemote`, `asbe` | Manage Channels | Add an emote to a starboard |
| `removestarboardemote <id> <emote>` | `removestaremote`, `starboardremoveemote`, `rsbe` | Manage Channels | Remove an emote, cannot remove the last one |
| `starboardallowbots <id> <true or false>` | `starbots`, `starbotsallow`, `starbab` | Manage Channels | Allow bot-authored messages |
| `starboardremoveondelete <id> <true or false>` | `starboarddelete`, `stardelete`, `srod` | Manage Channels | Remove the post when the original is deleted |
| `starboardremoveonreactionsclear <id> <true or false>` | `starboardreactionclear`, `starclear` | Manage Channels | Remove the post when reactions are cleared |
| `starboardremoveonbelowthreshold <id> <true or false>` | `starboardbelowthreshold`, `starbelow`, `srobt` | Manage Channels | Remove the post when it drops below the threshold |
| `starboardwlmode <id> <whitelist or blacklist>` | `starboardmode`, `starboardwhitelist`, `swm` | Manage Channels | Set how the channel list is treated |
| `starboardchtoggle <id> #channel` | `starboardchannel`, `togglestarboardchannel`, `scht` | Manage Channels | Add or remove a channel from the list |
| `starboardstats` | `starstats`, `starboardstatistics`, `sbstats` | Nobody | Server-wide starboard statistics |
| `starboarduserstats [@user]` | `staruserstats`, `userstarstats`, `sbuserstats` | Nobody | Statistics for one member |

Slash equivalents live under `/starboard`.

## Tips and gotchas

- The bot silently does nothing if it cannot send messages in the starboard channel. Check channel permissions first.
- Remove on Delete only works when the bot has Manage Messages in the channel the original message was in.
- Reactions from bots never count toward the threshold, so another bot auto-reacting cannot push messages onto the board.
- Deleting a starboard removes its configuration only. Existing posts in the channel stay.
- The same emote cannot be shared between two boards. Pick distinct emotes for each.
- Very large attachments may fail to re-upload; the post then lists the file name instead.
