---
title: Intent Verification
slug: intent-verification
summary: What to answer on Discord's privileged intent application when your own Mewdeko bot gets big enough to need verifying, with text you can paste into each box.
icon: fa-shield-check
category: General
tags: [intents, privileged intents, verification, verify, discord developer portal, presence intent, server members intent, message content intent, self host, selfhost, custom bot, privacy policy]
related: [settings, statusroles, logging, chatsaver]
---

## Who this is for

This page is for people running their own Mewdeko bot: a self hosted copy, or any instance that uses its own Discord application rather than the official Mewdeko. Once your bot passes Discord's threshold (more than 10,000 unique users across all of its servers combined), Discord asks you to apply for each privileged intent it uses. If your bot is smaller than that, you can skip this page.

> [!NOTE]
> Unless Discord changes the process, you have to re-verify every year. Keep a link to this page for next time.

Mewdeko connects with every gateway intent switched on, so the application needs all three privileged intents: **Presence**, **Server Members** and **Message Content**. The sections below follow the order of Discord's form. For select menus, pick the option given here. For text boxes, copy the code block and adjust anything in angle brackets. The screenshot links point at screenshots of the official Mewdeko; you can use them as they are or swap in screenshots of your own instance.

> [!WARNING]
> This guide does not guarantee approval; Discord makes the final decision. Answer every question truthfully for *your* instance. Where your setup differs from a default Mewdeko install, such as features you have disabled, change the text to match. Discord can ask follow-up questions and may ask you to prove your answers.

## Application details

```
This application is a self-hosted instance of Mewdeko (https://mewdeko.tech), an open source, general purpose Discord bot. Its main features include:

Moderation - Warnings, mutes, timeouts, bans and punishment escalation, with a moderation log.
Auto Moderation & Anti-Raid - Word and link filters, invite filtering, anti-spam and anti-raid protection.
Logging - Configurable logs for message edits/deletes, member joins/leaves, role, nickname and channel changes.
Greets & Leaves - Customisable welcome and goodbye messages, including multiple greet channels and role greets.
Chat Triggers - Custom responses and actions triggered by words, phrases or regex in chat.
XP & Leveling - Message and voice XP with level-up rewards and leaderboards.
Starboard - Members react to highlight messages in a dedicated channel.
Suggestions & Confessions - Server suggestion boards and anonymous confessions.
Support Tickets - Private ticket channels with saved transcripts.
Highlights - Members get a DM when a word they follow is mentioned.
Status Roles & Stream Roles - Roles assigned from a member's custom status or when they go live.
Server Stats - Message, voice and activity statistics for server staff.
Giveaways, Polls, Counting, Games, Music, Reminders, Birthdays and more.

Servers configure the bot with prefix commands, slash commands and a web dashboard.
```

## Privacy policy

### Do you have a public Privacy Policy telling your users about their data usage?

Select **Yes**.

### Where is your Privacy Policy available?

```
In the bot's profile bio and on our website.
```

### Please share a link to your Privacy Policy.

```
<link to your privacy policy>
```

> [!WARNING]
> Mewdeko's own policy at https://mewdeko.tech/privacy covers the official bot and its servers only; it says where *our* data is stored and who to contact. Your instance stores data on your own server, so you need your own policy. You can base it on ours, changing the storage location, contact details and anything else that differs, and publish it on your site or a GitHub gist. Discord usually wants the link in the bot's profile bio as well.

## Privileged gateway intents

Tick all three intents:

- **Presence Intent**
- **Server Members Intent**
- **Message Content Intent**

> [!TIP]
> If you have turned off every feature listed under one of the intents below, you do not need that intent. Leave it unticked rather than asking for something the bot does not use.

## Presence intent

### Why do you need the Presence intent?

```
Status Roles - Server staff can give members a role based on their custom status text (for example, a supporter role for members who put the server's invite in their status). The role is removed again when the status changes.
Stream Roles - Gives members a "live" role while their Discord activity shows they are streaming, and removes it when they stop.
Game Voice Channels - Optionally moves members into a voice channel matching the game they are playing.
Server Stats - Server staff can opt in to activity statistics showing which games and activities are popular in the server.
Online member counts - Online/idle/do-not-disturb counts for stat channels and message placeholders.
```

### Please provide links to screenshots and/or videos that demonstrate your use case

```
https://cdn.mewdeko.tech/intent-verification/streamrole.png
https://cdn.mewdeko.tech/intent-verification/serverstats.png
```

## Server Members intent

### Why do you need the Guild Members intent?

```
Greets & Leaves - Sending custom welcome/goodbye messages and images when members join or leave, including role greets when a member gains a role.
Auto Roles & Role States - Assigning roles on join, and restoring a member's saved roles (including mutes) if they leave and rejoin.
Anti-Raid Protection - Detecting mass joins and new-account raids as members arrive.
Logging - Logging joins, leaves, nickname, avatar and role changes for server moderators.
Invite Tracking - Recording which invite a member joined with.
Leaderboards & Stat Roles - Showing member names and avatars on XP/leaderboard rankings and giving roles based on member statistics.
Achievements - Granting achievements triggered by member profile and role changes.
```

### Please provide links to screenshots and/or videos that demonstrate your use case

```
https://cdn.mewdeko.tech/intent-verification/greets.png
https://cdn.mewdeko.tech/intent-verification/logging-members.png
https://cdn.mewdeko.tech/intent-verification/streamrole.png
https://cdn.mewdeko.tech/intent-verification/antiraid.png
```

### Are you storing any API Data off-platform (outside of Discord)?

Select **Yes**. The bot stores user IDs, usernames, XP, warnings and per-server settings in its database.

### Are you storing API Data for 30 days or less?

Select **No**. Server data such as XP, warnings and tickets is kept for as long as the bot stays in that server.

### How do users contact you to request deletion of their activity data?

```
Users can ask for deletion in our support server (linked in the bot's bio and in the help command) or by emailing <your contact email>. Server administrators can also delete their server's data from the dashboard, and data for a server is removed when the bot is removed from it.
```

### Are you encrypting the data that you store at rest, as is required by our developer policy?

> [!WARNING]
> Mewdeko does not encrypt its database itself, so this depends on your hosting. Select **Yes** only if the disk or volume your PostgreSQL and Redis data live on is encrypted, for example a LUKS-encrypted disk or a cloud volume with encryption at rest enabled. If it is not, set that up before you apply. Do not answer Yes otherwise.

## Message Content intent

### Can users opt-out of having their message content data tracked?

Select **No**.

### Are you storing message content data off-platform (outside of Discord)?

Select **Yes**. Several features keep message text, so No would be wrong for a standard install.

> [!NOTE]
> The features that store message text are Snipe (opt in per server, kept in Redis and trimmed after 30 days), ticket transcripts and saved chat logs, starboard posts, suggestions, confessions, AFK messages, highlight words, and the AI chat history. If you have disabled all of these, you can answer No instead.

### Will the message content data be used to train machine learning or AI Models?

Select **No**.

> [!NOTE]
> Mewdeko does not train any models. The optional AI chat feature sends messages from the channel a server sets up for it to the AI provider *that server* chooses (OpenAI, Groq or Anthropic), using that server's own API key. If your instance allows it, mention this in the message content answer below; if not, remove that line.

### Why do you need the Message Content intent?

```
Prefix Commands - Mewdeko supports text commands with a configurable prefix (default "."), alongside slash commands. Reading the prefix and arguments requires message content.
Auto Moderation & Anti-Spam - Checking messages against each server's word and link filters, invite filtering and spam detection, and deleting messages that break the rules.
Chat Triggers - Server-configured automatic responses to words, phrases or regex patterns in chat.
Highlights - Notifying members by DM when a keyword they follow is mentioned in a channel they can see.
Message Logging - Showing the old and new text of edited and deleted messages in a server's private moderation log channel.
Snipe - Opt-in per server; lets members view the last deleted or edited message in a channel. Kept for at most 30 days.
Support Tickets - Saving ticket transcripts so staff can review closed tickets.
Starboard - Reposting the content of highly-starred messages to a starboard channel.
Counting, Games & AFK - Reading numbers for counting channels, answers for trivia/word games, and clearing AFK status when the member speaks.
XP - Message length and type are used for XP and anti-spam checks; only counts and XP are stored, not message text.
AI Chat (optional) - Messages in a server's configured AI channel are sent to the AI provider that server set up, using its own API key. Not used for training.
```

### Please provide links to screenshots and/or videos that demonstrate your use case

```
https://cdn.mewdeko.tech/intent-verification/prefix-command.png
https://cdn.mewdeko.tech/intent-verification/chat-triggers.png
https://cdn.mewdeko.tech/intent-verification/highlights.png
https://cdn.mewdeko.tech/intent-verification/logging-messages.png
https://cdn.mewdeko.tech/intent-verification/starboard.png
https://cdn.mewdeko.tech/intent-verification/ticket-transcript.png
```

## Acknowledgement

Tick the box.

> [!NOTE]
> Discord's support staff may come back with follow-up questions or ask for changes, such as moving the privacy policy link into the bot's bio. Answer them truthfully for your instance; if you are unsure what Mewdeko does in a particular case, ask in the [support server](https://discord.gg/twQw45rBjN).
