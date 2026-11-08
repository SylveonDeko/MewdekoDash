---
title: Message Filters
slug: filter
summary: Deletes messages with blocked words or links, and can warn or ban the sender
icon: fa-filter
category: Security
dashboard: /dashboard/automod?tab=filters
module: Permissions
tags: [filter, word filter, invite filter, link filter, automod, auto ban, blacklist, banned words, regex, domains, link limit]
related: [automod, moderation, logging, administration]
---

## What it does

The filter checks every message a member sends or edits before other modules see it. If the message holds a filtered word, or an invite or link in a place where that filter is active, the bot deletes it. You can also have the bot issue a warning through the moderation system, with a DM to the member explaining what was removed.

A second list, auto-ban words, is stricter. A message that matches an auto-ban word is deleted and the author is banned immediately, with a DM containing the reason where the bot can send one.

The filters are the **Filters** tab of the [Automod](/wiki/automod) page. Settings save as you change them.

The filter ignores:

- Administrators.
- Members with the staff role, set with `staffrole`.
- Members with an exempt role and messages in an exempt channel, set in **Shared automod settings** on the Protection tab.
- Bot messages.

If a log channel is set in **Shared automod settings**, each hit is logged there.

## Why you would use it

- Keep slurs and other banned terms out of chat without a moderator online.
- Stop members advertising other servers by dropping invite links.
- Make a channel text only by removing any message with a URL.
- Cap how many links one member can post in a channel.
- Instantly ban accounts that post known scam phrases.

## Filters tab

The tab is a stack of cards in this order.

### Filters

Three switches, all off to begin with.

| Switch | What it does |
| --- | --- |
| Word filter | Delete messages containing any filtered word |
| Invite filter | Delete Discord invite links posted by members |
| Link filter | Delete any message containing a URL |

### Warnings

| Switch | What it does |
| --- | --- |
| Warn on filtered word | Also warns the member when a filtered word is removed |
| Warn on invite link | Also warns the member when an invite is removed |

Warnings go through the moderation module, so any warning punishments you set there still apply. Three filter hits can escalate to a mute or kick if that is how warnings are set up. The member also gets a DM. The link filter never warns.

### Filtered words

Lists the filtered words with a count in the title. Type a word or phrase under **Add a word or phrase** and click **Add**. Remove one with its cross. **Clear all** removes every word after you confirm. With more than ten words a **Search words** box appears.

### Auto-ban words

The same layout, for words that ban. Members who post these words are banned immediately. Auto-ban words have no **Clear all**.

### Channel overrides

Three channel pickers decide where each filter applies.

| Picker | Effect |
| --- | --- |
| Word filter | Flips the **Word filter** switch for these channels. With the switch on they are skipped, and with it off the word list is checked only in them |
| Invite filter | When empty, the invite filter applies everywhere. When it has channels, only those |
| Link filter | These channels remove links even when the **Link filter** switch is off |

The **Word filter** switch covers every channel on its own. The invite filter needs its server switch on, and link channels work without it.

### Word matching

**Normalize words** catches look-alike characters and spaced out letters. For example a filtered word written with symbols or spaces between letters is still found. Plain words shorter than three characters are not matched in the spaced out form.

### Link rules

| Setting | What it does |
| --- | --- |
| Links: only members without roles | The link filter only acts on members who have no roles |
| Invites: only members without roles | The invite filter only acts on members who have no roles |
| Allowed domains | A message is spared by the link filter when every link in it is on this list |
| Blocked domains | A message with a link to one of these domains is always deleted, even with the link filter off |

Domains match subdomains too, so `example.com` also covers `cdn.example.com`. An entry can be up to 253 characters.

### Link limits

Limits how many links one member can post in a channel. Choose a channel and click **Add**, then set:

| Setting | Starts at | Range |
| --- | --- | --- |
| Max links | 5 | 1 to 100 |
| Time window (seconds) | 30 | 1 to 3600 |

A member who goes over the limit in the window has the message deleted. Remove the row to remove the limit.

## How words are matched

Filtered words and auto-ban words are treated as regular expressions and tested against the lowercased message content. A plain word such as `example` works as a substring match, so `examples` is also caught. Patterns that fail to compile are removed from the list automatically. Each pattern has a 250 millisecond match timeout.

Filtered words are stored lowercased and matched case-insensitively. Auto-ban patterns are stored exactly as typed and matched against lowercased text, so write them in lowercase.

> [!WARNING]
> Auto-ban patterns ban on any match. A short pattern like `ban` inside a longer word will ban people who type "banana". Test patterns as filtered words first.

Auto-bans use the ban prune settings from the moderation module for the "Filter" action to decide how many days of messages to delete.

## Setup

1. Open **Automod** in the dashboard and choose the **Filters** tab.
2. Under **Filtered words**, add each word or phrase.
3. Switch on **Word filter** to check every channel. Under **Channel overrides**, add any channel to **Word filter** that should be skipped.
4. Switch on **Invite filter** to remove invites everywhere, and **Warn on invite link** if that should count as a warning.
5. Optionally add a few high confidence patterns under **Auto-ban words**.
6. Run `staffrole @Moderators` so your team is exempt, then post a filtered word from a normal account to confirm it is deleted.

## Commands

Run these with your server's prefix (`.` unless you changed it).

| Command | Aliases | Needs | Purpose |
| --- | --- | --- | --- |
| `filterword <word>` | `fw` | Nobody | Add a word to the filter list, or remove it if already present |
| `lstfilterwords` | `lfw` | Nobody | Page through the filtered word list |
| `fwclear` | | Administrator | Remove every filtered word, clear the word channel list and turn the server switch off |
| `srvrfilterwords` | `sfw` | Nobody | Toggle the **Word filter** switch |
| `chnlfilterwords` | `cfw` | Nobody | Flip the word filter for the current channel, and the reply says whether it is now on or off there |
| `srvrfilterinv` | `sfi` | Nobody | Toggle the **Invite filter** switch |
| `chnlfilterinv` | `cfi` | Nobody | Toggle the current channel on the invite filter channel list |
| `srvrfilterlin` | `sfl` | Nobody | Toggle the **Link filter** switch |
| `chnlfilterlin` | `cfl` | Nobody | Toggle the current channel on the link filter channel list |
| `fwarn <y or n>` | `filteredwarn` | Administrator | Turn **Warn on filtered word** on or off |
| `invwarn <y or n>` | `invitewarn` | Administrator | Turn **Warn on invite link** on or off |
| `autobanword <pattern>` | `autobanw` | Administrator | Add a pattern to the auto-ban list, or remove it if already present |
| `autobanwordlist` | `autobwlist` | Administrator | Page through the auto-ban list |
| `filternormalize` | `fnorm` | Administrator | Toggle **Normalize words** |
| `filterinvnoroles` | `finr` | Administrator | Toggle **Invites: only members without roles** |
| `filterlinnoroles` | `flnr` | Administrator | Toggle **Links: only members without roles** |
| `linklimit <channel> [max] [seconds]` | `linklim` | Administrator | Set or remove a link limit for a channel |
| `filterlinkallow <domain>` | `flallow` | Administrator | Add or remove an allowed domain |
| `filterlinkblock <domain>` | `flblock` | Administrator | Add or remove a blocked domain |
| `filterlinkdomains` | `fldomains` | Administrator | Show the allowed and blocked domains |

> [!PERMISSION]
> The filter toggles and `filterword` carry no permission check of their own. Use the Permissions module to restrict them, or manage filters from the dashboard where dashboard access rules apply.

## Tips and gotchas

- The bot needs **Manage Messages** in every filtered channel and **Ban Members** for auto-ban words.
- Edited messages are re-checked, so editing a link into an old message still gets it deleted.
- Do not test with an admin account. Administrators, the staff role and exempt roles are never filtered.
- `fwclear` does more than empty the list: it also removes all word filter channels.
- Invalid regex is silently dropped from the list. If a word vanishes, check that it does not contain unescaped characters such as `(` or `[`.
- Log message deletions with the Logging feature if you want a record of what the filter removed.
