---
title: Message Filters
slug: filter
summary: Delete messages that contain blocked words, Discord invites or links, optionally warn the sender, and ban on sight for a separate list of auto-ban words.
icon: fa-filter
category: Security
dashboard: /dashboard/filter
module: Permissions
tags: [filter, word filter, invite filter, link filter, automod, auto ban, blacklist, banned words, regex]
related: [moderation, logging, administration]
---

## What it does

The filter checks every message a member sends or edits before other modules see it. If the message contains a filtered word, a Discord invite or a link in a place where that filter is active, the bot deletes it. You can also have the bot issue a warning through the moderation system and send the member a DM explaining what was removed.

A second list, auto-ban words, is stricter. A message that matches an auto-ban word is deleted and the author is banned immediately, with a DM containing the reason where the bot can send one.

Administrators and anyone holding the server's staff role (set with `staffrole`) are never filtered. Bot messages are not checked either.

## Why you would use it

- Keep slurs and other banned terms out of chat without a moderator online.
- Stop members advertising other servers by dropping invite links.
- Make a channel text only by removing any message with a URL, for example a media-free announcements chat.
- Instantly ban accounts that post known scam phrases or raid signatures.

## Filter types

| Filter | Where it applies | What happens |
| --- | --- | --- |
| Word filter | Only in channels on the word filter channel list | Message deleted; warning and DM if **Warn on filtered word** is on |
| Invite filter | Everywhere when the server switch is on and the channel list is empty, or only in listed channels when the list has entries | Message deleted; warning and DM if **Warn on invite link** is on |
| Link filter | Everywhere when the server switch is on, plus any channel on its list | Message deleted, no warning |
| Auto-ban words | Everywhere | Message deleted, author DMed and banned |

The three channel lists are the **Channel Overrides** on the dashboard. Note that the word filter is driven entirely by its channel list: a channel must be on it for words to be checked there.

## How words are matched

Filtered words and auto-ban words are treated as regular expressions and tested against the lowercased message content. A plain word such as `example` works as a substring match, so `examples` is also caught. Patterns that fail to compile are removed from the list automatically. Each pattern has a 250 millisecond match timeout.

Filtered words are stored lowercased and matched case-insensitively. Auto-ban patterns are stored exactly as typed and matched against lowercased text, so write them in lowercase.

> [!WARNING]
> Auto-ban patterns are powerful. A short pattern like `ban` inside a longer word will ban people who type "banana". Test patterns as filtered words first.

## Warnings

Turning on **Warn on filtered word** or **Warn on invite link** makes the bot add a warning through the moderation module with the reason "Warned for Filtered Word" or the invite warning reason, then DM the member. Any warning punishments configured on the Moderation page apply as usual, so three filter hits can escalate to a mute or kick if that is how warnings are set up.

Auto-bans use the ban prune settings from the moderation module for the "Filter" action to decide how many days of messages to delete.

## Settings

The Message Filters page has four tabs: **Filters**, **Filtered Words**, **Auto-ban Words** and **Channel Overrides**.

| Setting | Default | What it controls |
| --- | --- | --- |
| Word filter | Off | Server-wide switch shown on the Filters tab |
| Invite filter | Off | Deletes Discord invite links; needed for the invite channel list to do anything |
| Link filter | Off | Deletes any message with a URL server-wide |
| Warn on filtered word | Off | Adds a warning and DMs the member when a filtered word is removed |
| Warn on invite link | Off | Adds a warning and DMs the member when an invite is removed |
| Filtered words | none | List on the Filtered Words tab, with per-word remove, a **Clear all** button that does the same as `fwclear`, and a search box once there are more than ten words |
| Auto-ban words | none | List on the Auto-ban Words tab |
| Word filter channels | none | Channels where the word list is enforced |
| Invite filter channels | none | Restricts the invite filter to these channels when non-empty |
| Link filter channels | none | Extra channels where links are removed even if the server switch is off |

The top of the page shows counts of filtered words, auto-ban words and channel overrides.

## Setup walkthrough

1. Open **Message Filters** in the dashboard.
2. On the **Filtered Words** tab, add each word or phrase and press add.
3. On **Channel Overrides**, add every channel where the word list should apply under **Word filter channels**.
4. Back on **Filters**, switch on **Invite filter** if you want invites removed everywhere, and **Warn on invite link** if that should count as a warning.
5. Optionally add a few high-confidence patterns on the **Auto-ban Words** tab.
6. Run `staffrole @Moderators` so your team is exempt, then post a filtered word from a normal account to confirm it is deleted.

## Commands

Run these with your server's prefix (`.` unless you changed it).

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `filterword <word>` | `fw` | Nobody | Add a word to the filter list, or remove it if already present |
| `lstfilterwords` | `lfw` | Nobody | Page through the filtered word list |
| `fwclear` | | Administrator | Remove every filtered word, clear the word channel list and turn the server switch off |
| `srvrfilterwords` | `sfw` | Nobody | Toggle the server-wide word filter switch |
| `chnlfilterwords` | `cfw` | Nobody | Toggle the current channel on the word filter channel list |
| `srvrfilterinv` | `sfi` | Nobody | Toggle the server-wide invite filter |
| `chnlfilterinv` | `cfi` | Nobody | Toggle the current channel on the invite filter channel list |
| `srvrfilterlin` | `sfl` | Nobody | Toggle the server-wide link filter |
| `chnlfilterlin` | `cfl` | Nobody | Toggle the current channel on the link filter channel list |
| `fwarn <y or n>` | `filteredwarn` | Administrator | Turn warnings for filtered words on or off |
| `invwarn <y or n>` | `invitewarn` | Administrator | Turn warnings for invite links on or off |
| `autobanword <pattern>` | `autobanw` | Administrator | Add a pattern to the auto-ban list, or remove it if already present |
| `autobanwordlist` | `autobwlist` | Administrator | Page through the auto-ban list |

> [!PERMISSION]
> The filter toggles and `filterword` carry no permission check of their own. Use the Permissions module to restrict them, or manage filters from the dashboard where dashboard access rules apply.

## Tips and gotchas

- The bot needs **Manage Messages** in every filtered channel and **Ban Members** for auto-ban words.
- Edited messages are re-checked, so editing a link into an old message still gets it deleted.
- Filters do not apply to administrators, the staff role, or bots. Do not test with an admin account.
- `fwclear` does more than empty the list: it also removes all word filter channel overrides.
- Invalid regex is silently dropped from the list. If a word vanishes, check that it does not contain unescaped characters such as `(`, `[` or `*`.
- Log message deletions with the Logging feature if you want a record of what the filter removed.
