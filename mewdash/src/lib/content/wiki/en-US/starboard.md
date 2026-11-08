---
title: Starboard
slug: starboard
summary: Members react to the best messages, and the popular ones get reposted in a highlights channel
icon: fa-star
category: Community
dashboard: /dashboard/starboard
module: Starboard
tags: [starboard, stars, highlights, best of, reactions, pins, repost, threshold, lock, auto-star, post design]
related: [settings, logging]
---

## What it does

A starboard is a channel where the bot reposts messages that enough people reacted to with a chosen emote. Members react to something funny or useful. Once the reaction count reaches the threshold, the bot copies the message into the starboard channel with the author's name and the text, any images or videos, the current reaction counts and a **Jump to Message** button.

The post keeps updating as reactions come and go. The post can be removed if reactions drop below the threshold, or if the original message is deleted or its reactions are cleared.

A server can run several starboards at once, each with its own channel, emotes, threshold and rules. A "best memes" board watching one emote and a "helpful answers" board watching another can run side by side.

## Why you would use it

- Give the community a way to surface the best content without staff curating it.
- Keep a long-lived highlights channel that new members can scroll through.
- Run separate boards for humour or helpful answers, each with different emotes.
- Limit which channels and roles feed the board, so bot spam and off-topic channels stay out.
- Pause a board during an event with a lock, or restyle the posts to match your server.

## Starboards list

The page has one card, **Starboards**, with a **New starboard** button. Each row shows the channel, its emotes, the threshold (**Needs** a number of reactions) and badges for **Locked**, **Custom post**, **Auto-star** and **Role limits**. A switch on the row turns the starboard on or off without deleting it, and the row menu has **Edit** and **Delete**. With no boards the card says **No starboards configured**.

## Creating a starboard

**New starboard** opens a form with these fields:

| Field | Default | What it does |
| --- | --- | --- |
| Channel | Use an existing channel | **Use an existing channel** or **Create a channel** |
| Starboard channel | none | The channel to post in (existing channel mode) |
| New channel name | `starboard` | Name of the channel to create (create mode, up to 100 characters) |
| Emote | ⭐ | The emote members react with |
| Threshold (reactions needed) | 3 | Reactions a message needs before it is posted. Minimum 1 |

Press **Create**. The form asks for an emote and a channel (or a name) before it accepts. Creating a channel makes one only the bot can post in.

New starboards start with **Remove when the original is deleted**, **Remove when reactions are cleared** and **Remove when below threshold** on, and everything else at its default listed below.

## Editing a starboard

Click a row or **Edit** to open its editor. The top bar has the channel name, a save indicator and an **Enabled** or **Disabled** switch. Every change saves as you make it.

### Emotes and threshold

Under **Emotes**, remove an emote with the button on its chip and add one with the **Add an emote** picker. Then set **Threshold (reactions needed)**.

A starboard must keep at least one emote, so the last one cannot be removed. Any of its emotes counts toward the same total, and the post shows a separate count per emote. An emote can only belong to one starboard in the server, so reusing it fails. Custom emotes work as well as Unicode ones, as long as the bot can use them.

### Stars and reactions

| Setting | Default | What it controls |
| --- | --- | --- |
| Allow bot messages | Off | Include messages written by bots |
| Count a member's own star | On | Whether the author reacting to their own message counts |
| Count every emote a member reacts with | Off | With several emotes, count each member once or once per emote |
| Remove stars that can't count | Off | Remove a reaction that would not be counted, such as a denied role or a self-star |
| Bot reactions on posts | None | **None**, **First emote** or **All emotes** reacted by the bot on the posted message |
| Roles that can star | Everyone | If set, only these roles' stars count |
| Roles whose stars never count | No roles | Stars from these roles are ignored |

Reactions from bot accounts never count. With **Allow bot messages** on, the text of a bot message comes from its first embed's description if it has one, otherwise from the plain content.

### Channels and messages

| Setting | Default | What it controls |
| --- | --- | --- |
| Allow NSFW channel messages | On | Let messages from NSFW channels onto a board whose channel is not NSFW |
| Channel mode | Only check listed channels | **Only check listed channels** or **Ignore listed channels** |
| Checked channels / Ignored channels | All channels / No channels | The channel list. In the first mode an empty list means every channel |
| Auto-star channels | none | Messages in these channels are posted without needing stars |
| Minimum message age (minutes) | 0 | A message must be this old before it can be starred. 0 for none |
| Maximum message age (minutes) | 0 | Messages older than this can't be starred. 0 for none |

Auto-star is still stopped by a lock, the bot-message rule and the NSFW rule.

### Removal and reposts

| Setting | Default | When it fires |
| --- | --- | --- |
| Remove when the original is deleted | On | The original message is deleted. Needs Manage Messages for the bot in the source channel |
| Remove when reactions are cleared | On | A moderator clears all reactions from the original |
| Remove when below threshold | On | The total drops under the threshold after a reaction is removed |
| Repost threshold | 0 (disabled) | See below |
| Repost cooldown (minutes) | 0 (none) | Least time between reposts of the same post |

Normally the bot edits the existing post in place whenever the count changes. On a busy board that post may be far up the channel. Set the **Repost threshold** to a number N and the bot looks at the last N messages in the starboard channel on each update. If the post is among them it is edited. If it has scrolled further back, the old post is deleted and a new one is sent at the bottom. 0 always edits in place.

### Lock

**Lock for** stops a board from accepting new stars for **1 hour**, **6 hours**, **1 day**, **1 week** or **Until unlocked**. Press **Lock**. A locked board shows **Locked until** a time or **Locked until unlocked**, with an **Unlock** button. Existing posts stay.

### Post design

**Post design** replaces the default layout with your own message built in the embed editor. Placeholders such as `%star.author%`, `%star.content%`, `%star.count%`, `%star.emotes%`, `%star.link%`, `%star.image%` and `%server.name%` are filled in for each post, and the editor lists all of them. **Reset to default** puts the default layout back.

To check a design, pick a **Preview channel**, optionally enter a **Message ID** (it uses the latest message otherwise), and press **Send preview**.

## Thresholds and counting

When counting, the bot:

- Ignores reactions from bot accounts.
- Adds up reactions across every emote that belongs to that starboard.
- Applies the star rules above: own star, allowed and denied roles, message age.
- Only acts on messages that have text or an attachment.

If the total is below the threshold and a post already exists, the post is deleted when **Remove when below threshold** is on. Otherwise it is left as it was.

## The default starboard post

Without a custom design the post is built from components rather than a classic embed:

- A line above the container with each emote and its count.
- The author's name, linked to their profile.
- The message text.
- A media gallery of image and video attachments.
- Up to three other attachments, re-uploaded to the starboard channel. If a download fails, the file name and size are shown instead.
- A **Jump to Message** link button.

Mentions in the reposted text are suppressed, so a starred message cannot ping anyone a second time.

## Statistics

`starboardstats` shows totals for the server: starred message count, total stars, the most starred member, the most active channel and the most active starrer. `starboarduserstats [@user]` shows a member's starred message count, stars received, stars given, their top posts, who stars them most, and who they star most. `starboardjump <messageId>` and `starboardrandom [id]` show a starred message. All are open to everyone.

> [!TIP]
> Start with a threshold of 3 to 5 on an active server. A threshold of 1 turns every stray reaction into a post.

## Setup walkthrough

1. Make sure the bot can send messages, embed links and attach files in the channel you will use, or let the dashboard create one.
2. Open **Starboard** in the dashboard and press **New starboard**.
3. Pick the channel or **Create a channel**, choose the **Emote**, set **Threshold (reactions needed)** and press **Create**.
4. Open the new row. Add extra emotes under **Emotes** and set a **Repost threshold** such as 20 if the board will be busy.
5. Under **Channels and messages**, list the channels that should feed the board, or switch **Channel mode** to **Ignore listed channels** and list the ones to exclude.
6. Under **Post design**, restyle the post if you want, then use **Send preview** to check it.
7. React to a test message enough times to hit the threshold and check the post appears.

## Commands

Run these with your server's prefix (`.` unless you changed it). `<id>` is the starboard ID from `liststarboards`. Every command that changes a board needs Manage Channels.

| Command | Aliases | Purpose |
| --- | --- | --- |
| `createstarboard #channel <emote> [threshold]` | `addstarboard`, `newstarboard` | Create a starboard, threshold defaults to 1 |
| `starboardsetup <emote> [threshold] [name]` | `starsetup`, `createstarboardchannel` | Create a bot-only channel and a starboard for it |
| `deletestarboard <id>` | `removestarboard`, `delstarboard` | Remove a starboard configuration |
| `liststarboards` | `starboardlist`, `starboards` | Page through every starboard (anyone) |
| `starboardenabled <id> <true or false>` | `starenabled` | Turn a board on or off |
| `setstarthreshold <id> <number>` | `starthreshold` | Set the reactions needed |
| `setrepostthreshold <id> <number>` | `starboardrepost`, `repostthreshold` | Set the repost window, 0 disables |
| `starboardrepostcooldown <id> [time]` | `starcooldown` | Set the least time between reposts |
| `addstarboardemote <id> <emote>` | `addstaremote`, `starboardaddemote`, `asbe` | Add an emote |
| `removestarboardemote <id> <emote>` | `removestaremote`, `starboardremoveemote`, `rsbe` | Remove an emote, not the last one |
| `starboardallowbots <id> <true or false>` | `starbots`, `starbotsallow`, `starbab` | Allow bot-authored messages |
| `starboardselfstar <id> <true or false>` | `starself` | Count a member's own star |
| `starboardnsfw <id> <true or false>` | `starnsfw` | Allow NSFW channel messages |
| `starboardmultireact <id> <true or false>` | `starmulti` | Count every emote a member reacts with |
| `starboardremoveinvalid <id> <true or false>` | `starinvalid` | Remove stars that can't count |
| `starboardautoreactmode <id> <None, First or All>` | `starboardautoreact`, `starreact` | Bot reactions on posts |
| `starboardallowrole <id> @role` | `starallowrole` | Toggle a role that may star |
| `starboarddenyrole <id> @role` | `stardenyrole` | Toggle a role whose stars never count |
| `starboardminage <id> [time]` | `starminage` | Minimum message age |
| `starboardmaxage <id> [time]` | `starmaxage` | Maximum message age |
| `starboardremoveondelete <id> <true or false>` | `starboarddelete`, `stardelete`, `srod` | Remove the post when the original is deleted |
| `starboardremoveonreactionsclear <id> <true or false>` | `starboardreactionclear`, `starclear` | Remove the post when reactions are cleared |
| `starboardremoveonbelowthreshold <id> <true or false>` | `starboardbelowthreshold`, `starbelow`, `srobt` | Remove the post below the threshold |
| `starboardwlmode <id> <whitelist or blacklist>` | `starboardmode`, `starboardwhitelist`, `swm` | Set how the channel list is treated |
| `starboardchtoggle <id> #channel` | `starboardchannel`, `togglestarboardchannel`, `scht` | Add or remove a channel from the list |
| `starboardautostar <id> #channel` | `starautostar`, `autostar` | Toggle an auto-star channel |
| `starboardlock <id> [time]` | `starlock` | Lock a board, until unlocked if no time is given |
| `starboardunlock <id>` | `starunlock` | Unlock a board |
| `starboarddesign <id> <embed json>` | `stardesign` | Set the post design |
| `starboarddesignreset <id>` | `stardesignreset` | Back to the default layout |
| `starboarddesigntest <id> [messageId]` | `stardesigntest`, `starpreview` | Send a preview post |
| `starboardplaceholders` | `starplaceholders` | List design placeholders (anyone) |
| `starboardstats` | `starstats`, `starboardstatistics`, `sbstats` | Server-wide statistics (anyone) |
| `starboarduserstats [@user]` | `staruserstats`, `userstarstats`, `sbuserstats` | Statistics for one member (anyone) |
| `starboardjump <messageId>` | `starjump` | Show a starred message (anyone) |
| `starboardrandom [id]` | `starrandom` | Show a random starred message (anyone) |

Slash equivalents live under `/starboard`.

## Tips and gotchas

- The bot silently does nothing if it cannot send messages in the starboard channel. Check channel permissions first.
- **Remove when the original is deleted** only works when the bot has Manage Messages in the channel the original message was in.
- Reactions from bots never count toward the threshold, so another bot auto-reacting cannot push messages onto the board.
- Deleting a starboard removes its configuration only. Existing posts in the channel stay.
- The same emote cannot be shared between two boards. Pick distinct emotes for each.
- Very large attachments may fail to re-upload. The post then lists the file name instead.
- A disabled or locked board ignores new stars but keeps its settings and posts.
