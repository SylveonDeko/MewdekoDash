---
title: 意图验证
slug: intent-verification
summary: 当你自己的 Mewdeko 机器人规模变大、需要验证时，在 Discord 特权意图申请中应如何作答，并附有可直接粘贴到各个输入框中的文本。
icon: fa-shield-check
category: General
tags: [intents, privileged intents, verification, verify, discord developer portal, presence intent, server members intent, message content intent, self host, selfhost, custom bot, privacy policy, 意图, 特权意图, 验证, Discord 开发者门户, 在线状态意图, 服务器成员意图, 消息内容意图, 自托管, 自定义机器人, 隐私政策]
related: [settings, statusroles, logging, chatsaver]
---

## 适用对象

本页面面向运行自己 Mewdeko 机器人的用户：即自托管的副本，或任何使用自己的 Discord 应用程序而非官方 Mewdeko 的实例。当你的机器人超过 Discord 的门槛（所有服务器合计超过 10,000 名不重复用户）后，Discord 会要求你为所使用的每个特权意图提交申请。如果机器人规模低于该门槛，可以跳过本页。

> [!NOTE]
> 除非 Discord 更改流程，否则每年都需要重新验证。请保存本页面的链接，方便下次使用。

Mewdeko 会在启用所有网关意图的状态下连接，因此应用程序需要全部三个特权意图：**Presence Intent**（在线状态）、**Server Members Intent**（服务器成员）和 **Message Content Intent**（消息内容）。以下各节按照 Discord 表单的顺序排列。对于下拉选择框，请选择此处给出的选项。对于文本框，请复制代码块中的内容，并调整尖括号中的内容。截图链接指向官方 Mewdeko 的截图；你可以直接使用，也可以换成你自己实例的截图。

> [!WARNING]
> 本指南不保证一定通过审核，最终由 Discord 决定。请针对*你自己的*实例如实作答。如果你的设置与 Mewdeko 默认安装不同，例如禁用了某些功能，请相应修改文本。Discord 可能会提出后续问题，也可能要求你证明你的回答属实。

## 应用程序详情

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

## 隐私政策

### 你是否有公开的隐私政策，告知用户其数据用途？

选择 **是**。

### 你的隐私政策在哪里可以查看？

```
In the bot's profile bio and on our website.
```

### 请提供你的隐私政策链接。

```
<link to your privacy policy>
```

> [!WARNING]
> Mewdeko 官方政策位于 https://mewdeko.tech/privacy，仅涵盖官方机器人及其服务器；其中说明*我们*的数据存储位置以及联系方式。你的实例将数据存储在你自己的服务器上，因此你需要自己的隐私政策。你可以以我们的政策为基础，修改存储位置、联系方式以及其他不同之处，然后发布在你的网站或 GitHub Gist 上。Discord 通常也要求将该链接放在机器人的个人简介中。

## 特权网关意图

勾选全部三项意图：

- **Presence Intent**
- **Server Members Intent**
- **Message Content Intent**

> [!TIP]
> 如果你已关闭下方某个意图对应的所有功能，则无需申请该意图。请保持未勾选，而不是申请机器人并不使用的权限。

## Presence Intent（在线状态意图）

### 你为什么需要 Presence Intent？

```
Status Roles - Server staff can give members a role based on their custom status text (for example, a supporter role for members who put the server's invite in their status). The role is removed again when the status changes.
Stream Roles - Gives members a "live" role while their Discord activity shows they are streaming, and removes it when they stop.
Game Voice Channels - Optionally moves members into a voice channel matching the game they are playing.
Server Stats - Server staff can opt in to activity statistics showing which games and activities are popular in the server.
Online member counts - Online/idle/do-not-disturb counts for stat channels and message placeholders.
```

### 请提供展示你使用场景的截图和/或视频链接

```
https://cdn.mewdeko.tech/intent-verification/streamrole.png
https://cdn.mewdeko.tech/intent-verification/serverstats.png
```

## Server Members Intent（服务器成员意图）

### 你为什么需要 Guild Members 意图？

```
Greets & Leaves - Sending custom welcome/goodbye messages and images when members join or leave, including role greets when a member gains a role.
Auto Roles & Role States - Assigning roles on join, and restoring a member's saved roles (including mutes) if they leave and rejoin.
Anti-Raid Protection - Detecting mass joins and new-account raids as members arrive.
Logging - Logging joins, leaves, nickname, avatar and role changes for server moderators.
Invite Tracking - Recording which invite a member joined with.
Leaderboards & Stat Roles - Showing member names and avatars on XP/leaderboard rankings and giving roles based on member statistics.
Achievements - Granting achievements triggered by member profile and role changes.
```

### 请提供展示你使用场景的截图和/或视频链接

```
https://cdn.mewdeko.tech/intent-verification/greets.png
https://cdn.mewdeko.tech/intent-verification/logging-members.png
https://cdn.mewdeko.tech/intent-verification/streamrole.png
https://cdn.mewdeko.tech/intent-verification/antiraid.png
```

### 你是否将任何 API 数据存储在平台之外（Discord 之外）？

选择 **是**。机器人会将用户 ID、用户名、XP、警告记录和各服务器的设置存储在其数据库中。

### 你是否将 API 数据保存 30 天或更短？

选择 **否**。XP、警告和工单等服务器数据会在机器人留在该服务器期间一直保留。

### 用户如何请求删除其活动数据？

```
Users can ask for deletion in our support server (linked in the bot's bio and in the help command) or by emailing <your contact email>. Server administrators can also delete their server's data from the dashboard, and data for a server is removed when the bot is removed from it.
```

### 你是否对静态存储的数据进行加密，这是我们开发者政策的要求？

> [!WARNING]
> Mewdeko 本身不对其数据库加密，因此这取决于你的托管环境。仅当存放 PostgreSQL 和 Redis 数据的磁盘或卷已加密时才选择 **是**，例如使用 LUKS 加密的磁盘，或启用了静态加密的云存储卷。如果没有加密，请在申请前完成设置。否则不要选择 Yes。

## Message Content 意图（消息内容）

### 用户能否选择退出其消息内容数据的追踪？

选择 **否**。

### 你是否将消息内容数据存储在平台之外（Discord 之外）？

选择 **是**。多项功能会保存消息文本，因此对于标准安装而言，选择 No 是错误的。

> [!NOTE]
> 会存储消息文本的功能包括：Snipe（需按服务器主动开启，保存在 Redis 中，30 天后自动清理）、工单记录和保存的聊天日志、星标板帖子、建议、忏悔、AFK 消息、高亮关键词以及 AI 聊天记录。如果你已关闭以上所有功能，则可以改为选择 No。

### 消息内容数据是否会用于训练机器学习或 AI 模型？

选择 **否**。

> [!NOTE]
> Mewdeko 不训练任何模型。可选的 AI 聊天功能会将*某个服务器*为其设置的频道中的消息，发送给该服务器选择的 AI 服务商（OpenAI、Groq 或 Anthropic），并使用该服务器自己的 API 密钥。如果你的实例允许，请在下方的消息内容回答中说明这一点；如果不允许，请删除相关内容。

### 你为什么需要 Message Content 意图？

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

### 请提供展示你使用场景的截图和/或视频链接

```
https://cdn.mewdeko.tech/intent-verification/prefix-command.png
https://cdn.mewdeko.tech/intent-verification/chat-triggers.png
https://cdn.mewdeko.tech/intent-verification/highlights.png
https://cdn.mewdeko.tech/intent-verification/logging-messages.png
https://cdn.mewdeko.tech/intent-verification/starboard.png
https://cdn.mewdeko.tech/intent-verification/ticket-transcript.png
```

## 确认

勾选确认框。

> [!NOTE]
> Discord 的支持人员可能会回复后续问题，或要求做出修改，例如将隐私政策链接移至机器人的个人简介中。请根据你的实例如实作答；如果你不确定 Mewdeko 在某种情况下的具体行为，请在[支持服务器](https://discord.gg/twQw45rBjN)中询问。
