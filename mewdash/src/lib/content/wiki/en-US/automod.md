---
title: Automod
slug: automod
summary: One page for automatic content moderation, including Discord's built-in AutoMod rules
icon: fa-shield-halved
category: Security
dashboard: /dashboard/automod
module: Administration
tags: [automod, protection, anti-raid, anti-spam, anti-alt, honeypot, filter, word filter, invite filter, link filter, discord automod, keyword rules, mention spam, caps, zalgo, image hash]
related: [filter, administration, moderation, logging]
---

## What it does

The Automod page has three tabs. The page remembers the tab in the address as `?tab=`.

| Tab | What it does |
| --- | --- |
| Protection | Raid, spam, alt, mass mention, mass post, honeypot channel, pattern, image hash and external app protections, plus message rules such as caps and spoilers. |
| Filters | Delete messages with filtered words, Discord invites or links, and ban on auto-ban words. See [Message Filters](/wiki/filter). |
| Discord AutoMod | Create, edit, turn on and delete the AutoMod rules Discord runs for your community. |

Settings save as you change them. Administrators are exempt from message based protections, rules and filters.

## Protection

Each protection is a card with a switch. Turn it on to start with sensible values, then change them. A counter under the settings shows how many times it has triggered.

Most protections share the same punishment fields.

| Field | What it does |
| --- | --- |
| Action | Warn, Timeout, Mute, Kick, Ban or Add role. Some protections also offer Delete only. Anti-raid has no Add role |
| Duration (minutes) | Shown for Timeout, Mute, Ban and Add role. Zero on Ban or Add role means it does not expire |
| Role | Shown for Add role |

### Anti-raid

Acts when many accounts join in a short time.

| Setting | Starts at | Range |
| --- | --- | --- |
| Users joining | 5 | 2 to 30 |
| Time window (seconds) | 10 | 2 to 300 |
| Action | Timeout, 60 minutes | |

### Anti-spam

Acts on members who send too many messages in a row.

| Setting | Starts at | Range |
| --- | --- | --- |
| Message threshold | 5 | 2 to 10 |
| Action | Timeout, 5 minutes | |

**Ignored channels** are skipped.

### Anti-alt

Acts on members who join with a new account.

| Setting | Starts at | Range |
| --- | --- | --- |
| Minimum account age (minutes) | 1440 | 1 to 525600 |
| Action | Kick | |

### Anti-mass-mention

| Setting | Starts at | What it does |
| --- | --- | --- |
| Mention threshold | 5 | Mentions allowed in a single message |
| Time window (seconds) | 30 | The window for counting mentions |
| Max mentions in window | 10 | Mentions allowed across messages in that window |
| Ignore bots | On | Skips bot messages |
| Action | Timeout, 5 minutes | |

### Anti-mass-post

Acts when a member posts the same message in several channels.

| Setting | Starts at | Range |
| --- | --- | --- |
| Channel threshold | 3 | 2 to 20 |
| Time window (seconds) | 60 | 10 to 600 |
| Links only | On | Only checks messages that contain links |
| Delete the message | On | |
| Notify the member by DM | On | |
| Ignore bots | On | |
| Action | Ban | |

### Anti-post-channel

A honeypot. Anyone who posts in a honeypot channel is punished, so use channels no one should write in.

1. Turn the card on.
2. Add channels under **Honeypot channels**.
3. Pick the **Action**. It starts on Ban.
4. Add **Ignored roles** and **Ignored members** for staff who need access.

**Delete the message**, **Notify the member by DM** and **Ignore bots** start on.

### Anti-pattern

Scores new members on signs of a throwaway account and acts when the score reaches the minimum.

| Setting | Starts at | Range |
| --- | --- | --- |
| Minimum score | 15 | 1 to 100 |
| Check account age | On | Max account age (months) 6, 1 to 120 |
| Check join timing | On | Max join hours 48, 1 to 168 |
| Check batch creation | On | |
| Check offline status | On | |
| Check new accounts | On | New account days 7, 1 to 30 |
| Action | Timeout, 60 minutes | |

Under **Patterns**, click **Add pattern** to add a **Name** and a **Regex pattern**, and choose whether it checks the **Username**, the **Display name** or both. Remove a pattern with the trash button.

### Anti-image-hash

Blocks images that look like ones on a list, even when they are resized or edited.

| Setting | Starts at | What it does |
| --- | --- | --- |
| Max image size (MB) | 8 | From 1 to 32 |
| Match tolerance | 31 | From 0 to 64. Lower it if innocent images are caught |
| Delete the message | On | |
| Notify the member by DM | On | |
| Check embedded images | On | |
| Ignore bots | On | |
| Catch bordered copies | On | |
| Block known scam images | On | Uses a built in list. The count is shown |
| Action | Ban | |

To block an image, click **Block image**, then **Upload an image** or paste an **Image URL**, add a **Label** and optionally an **Action for this image** that overrides the main one. Uploads must be under 8 MB and png, jpeg, webp, gif or bmp. Very plain images are refused because they cannot be told apart. Each entry shows its hit count.

### Anti-external-app

Acts on messages from apps that members use without adding them to your community.

| Setting | Starts at | What it does |
| --- | --- | --- |
| Mention limit | 5 | Users and roles one app message may mention. 0 turns it off |
| App messages allowed | 5 | App messages allowed per window. 0 turns it off |
| Time window (seconds) | 10 | 1 to 300 |
| Remove invite links | On | |
| Delete the message | On | |
| Notify the member by DM | On | |
| Action | Timeout, 60 minutes | Delete only is also available. Duration up to 40320 |

## Message rules

Below the protections sit the message rules. The **Shared automod settings** card applies to all of them.

| Setting | What it does |
| --- | --- |
| Log channel | Where each rule hit is logged |
| Review channel | Where messages held for review are posted, with buttons to approve or dismiss |
| Exempt roles | Members with these roles skip every rule, protection and filter |
| Exempt channels | These channels are skipped, including their threads |

Each rule has its own card, switch, **Actions**, **Exempt roles** and **Exempt channels**. Actions can be combined: Delete only, Warn, Timeout, Mute, Kick, Ban, Reply with a message, DM the member and Send for review. Timeout and Mute show **Duration (minutes)**, up to 40320. **Reply with a message** shows **Reply text**, where `%user%` becomes a mention. **Send for review** needs a review channel. The punishments wait until a moderator approves. Turning a rule on with no actions picks Delete only.

| Rule | Settings | Triggers when |
| --- | --- | --- |
| Excess caps | Minimum length 1 to 2000, Caps percent 1 to 100 | A message is at least that long and at least that percent of its letters are capitals. Links, emojis and mentions are ignored |
| Attachment spam | Max attachments 1 to 100, Time window (seconds) 1 to 600 | A member sends more attachments than allowed in the window |
| Emoji spam | Max emojis 1 to 200 | One message has more emojis than allowed |
| Spoiler spam | Max spoilers 1 to 100 | One message has more spoilers than allowed |
| Zalgo text | Zalgo threshold 1 to 30 | A character carries more combining marks than allowed |
| Unsafe files | none | A message has an attachment with a blocked file type |
| Media-only channels | Channels, Allow threads | A message in a listed channel has no attachment, sticker, image, video or link |
| Image-only channels | Channels, Allow threads | A message in a listed channel has no image |
| Video-only channels | Channels, Allow threads | A message in a listed channel has no video |
| Commands-only channels | Channels, Allow threads | A message in a listed channel is not a bot command |

**Allow threads** lets threads under a listed channel through. Unsafe files blocks executables and scripts such as `exe`, `bat`, `js`, `ps1` and `jar` until you change the list with `automodfiletype`.

## Discord AutoMod

The **Discord AutoMod** card lists the rules Discord runs. Discord checks messages before they are posted, so blocked messages never appear. A line under the list shows how many rules of each type you have against the limit.

To add one:

1. Click **New rule**.
2. Choose the **Rule type**: Keywords, Spam, Word presets or Mention spam.
3. Enter a **Name** and fill in the type's fields.
4. Choose **Actions** and click **Create**.

| Type | Fields |
| --- | --- |
| Keywords | **Keywords**, **Regex patterns**, **Allowed words** |
| Spam | none |
| Word presets | Profanity, Sexual content and Slurs, plus **Allowed words** |
| Mention spam | **Mention limit** and **Detect mention raids** |

| Action | What it does |
| --- | --- |
| Block message | Stops the message. **Message shown to the member** is the text they see |
| Send alert | Posts an alert in the chosen channel |
| Time out member | Times the member out for **Duration (minutes)**. Only on Keywords and Mention spam, and needs the Moderate Members permission |

Each rule can be turned on or off from its row, edited or deleted. **Exempt roles** and **Exempt channels** show how many of the allowed number are used.

### Follow-up

A follow-up adds what Discord's rules cannot do alone.

| Field | What it does |
| --- | --- |
| Warn the member | Adds a warning, with a **Reason** |
| Punishment | None, Timeout or Mute, with **Duration (minutes)** |
| Escalate on repeat hits | None, Kick or Ban. **Hits** (2 to 100) within **Within (minutes)** (1 to 43200) |
| Log channel | Logs each hit |

Mewdeko needs the Manage Server permission to manage these rules.

### Discord's limits

These come from Discord, not from Mewdeko.

| Limit | Value |
| --- | --- |
| Rules per type | 6 keyword rules, 1 each of spam, word preset and mention spam |
| Rule name | 100 characters |
| Keywords | 1000 per rule, 60 characters each |
| Regex patterns | 10 per rule, 260 characters each |
| Allowed words | 100 on keyword rules, 1000 on word preset rules |
| Exempt roles and channels | 20 roles and 50 channels |
| Block message text | 150 characters |
| Mention limit | 1 to 50 |
| Timeout | Up to 28 days |

## Commands

Message rules have commands that need the Administrator permission. `automod` shows every rule and its settings. Others include `automodcaps`, `automodattachments`, `automodmedia`, `automodfiles`, `automodfiletype`, `automodduration`, `automodmessage`, `automodlog`, `automodreview` and `automodexempt`. Discord AutoMod rules live under `/discord-automod`. Message filters have their own commands, listed in [Message Filters](/wiki/filter).
