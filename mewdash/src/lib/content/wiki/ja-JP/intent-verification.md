---
title: Intent Verification
slug: intent-verification
summary: 独自のMewdekoボットが認証を必要とするほど大きくなったときに、Discordの特権インテントの申請で回答すべき内容を、各欄に貼り付けられる文面とともに説明します。
icon: fa-shield-check
category: General
tags: [intents, privileged intents, verification, verify, discord developer portal, presence intent, server members intent, message content intent, self host, selfhost, custom bot, privacy policy, インテント, 特権インテント, 認証, 検証, Discord Developer Portal, プレゼンスインテント, サーバーメンバーインテント, メッセージコンテントインテント, セルフホスト, カスタムボット, プライバシーポリシー]
related: [settings, statusroles, logging, chatsaver]
---

## Who this is for

このページは、独自のMewdekoボットを運用している人を対象としています。セルフホストしたコピー、または公式のMewdekoではなく独自のDiscordアプリケーションを使うインスタンスなどです。ボットがDiscordの基準（すべてのサーバーを合わせて、一意のユーザーが10,000人を超えること）を超えると、Discordは使用している特権インテントごとに申請するよう求めます。ボットがその規模に達していなければ、このページは読み飛ばしてかまいません。

> [!NOTE]
> Discordが手続きを変更しない限り、毎年再認証が必要です。次回のためにこのページのリンクを保存しておいてください。

Mewdekoはすべてのゲートウェイインテントを有効にして接続するため、アプリケーションでは3つの特権インテントすべてが必要です。**Presence**、**Server Members**、**メッセージの内容** です。以下のセクションは、Discordのフォームの順序に従っています。選択肢のある項目では、ここに示されている選択肢を選んでください。テキストボックスでは、コードブロックをコピーし、山かっこで囲まれた部分を調整してください。スクリーンショットのリンクは、公式のMewdekoのスクリーンショットを指しています。そのまま使うことも、自分のインスタンスのスクリーンショットに差し替えることもできます。

> [!WARNING]
> このガイドで承認されることは保証されません。最終的な判断はDiscordが行います。すべての質問には、*あなたの* インスタンスについて正直に答えてください。無効にした機能など、既定のMewdekoのインストールと異なる点がある場合は、その内容に合わせて文面を変更してください。Discordは追加の質問をすることがあり、回答の証明を求めることもあります。

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

**はい** を選択します。

### Where is your Privacy Policy available?

```
In the bot's profile bio and on our website.
```

### Please share a link to your Privacy Policy.

```
<link to your privacy policy>
```

> [!WARNING]
> Mewdeko自身のポリシー（https://mewdeko.tech/privacy）は、公式のボットとそのサーバーだけを対象としています。データの保存場所と連絡先が記載されているのは *当方の* データについてです。あなたのインスタンスはデータを自分のサーバーに保存するため、独自のポリシーが必要です。当方のポリシーを基に、保存場所、連絡先、その他異なる点を変更して作成し、自分のサイトまたはGitHubのgistで公開できます。Discordは通常、ボットのプロフィールのbioにもリンクを記載するよう求めます。

## Privileged gateway intents

3つのインテントすべてにチェックを入れます。

- **Presence Intent**
- **Server Members Intent**
- **Message Content Intent**

> [!TIP]
> 以下のインテントのいずれかに記載された機能をすべて無効にしている場合は、そのインテントは不要です。ボットが使わないものを申請せず、チェックを入れないでください。

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

**はい** を選択します。ボットは、ユーザーID、ユーザー名、XP、警告、サーバーごとの設定をデータベースに保存します。

### Are you storing API Data for 30 days or less?

**いいえ** を選択します。XP、警告、チケットなどのサーバーデータは、ボットがそのサーバーに参加している間は保持されます。

### How do users contact you to request deletion of their activity data?

```
Users can ask for deletion in our support server (linked in the bot's bio and in the help command) or by emailing <your contact email>. Server administrators can also delete their server's data from the dashboard, and data for a server is removed when the bot is removed from it.
```

### Are you encrypting the data that you store at rest, as is required by our developer policy?

> [!WARNING]
> Mewdeko自体はデータベースを暗号化しないため、これはホスティング環境によって異なります。PostgreSQLとRedisのデータが保存されているディスクまたはボリュームが暗号化されている場合にのみ **はい** を選択してください。たとえば、LUKSで暗号化されたディスク、または保存時の暗号化が有効なクラウドボリュームなどです。暗号化されていない場合は、申請前に設定してください。それ以外の場合は Yes と答えないでください。

## Message Content intent

### Can users opt-out of having their message content data tracked?

**いいえ** を選択します。

### Are you storing message content data off-platform (outside of Discord)?

**はい** を選択します。いくつかの機能はメッセージのテキストを保存するため、標準的なインストールでは No は誤りになります。

> [!NOTE]
> メッセージのテキストを保存する機能は、Snipe（サーバーごとにオプトイン。Redisに保存され、30日後に削除）、チケットのトランスクリプトと保存されたチャットログ、スターボードの投稿、提案、告白、AFKメッセージ、ハイライトのワード、AIチャットの履歴です。これらをすべて無効にしている場合は、代わりに No と答えてかまいません。

### Will the message content data be used to train machine learning or AI Models?

**いいえ** を選択します。

> [!NOTE]
> Mewdekoはモデルのトレーニングを行いません。任意のAIチャット機能は、サーバーが設定したチャンネルのメッセージを、*そのサーバー* が選んだAIプロバイダー（OpenAI、Groq、Anthropic）に、そのサーバー自身のAPIキーを使って送信します。インスタンスでそれが許可されている場合は、以下のメッセージコンテントの回答でこの点に言及してください。許可されていない場合は、その行を削除してください。

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

チェックボックスにチェックを入れます。

> [!NOTE]
> Discordのサポートスタッフから、追加の質問や変更の依頼が届くことがあります。たとえば、プライバシーポリシーのリンクをボットのbioに移すよう求められる場合があります。インスタンスについて正直に回答してください。特定の場合にMewdekoがどう動作するかわからない場合は、[サポートサーバー](https://discord.gg/twQw45rBjN)でお尋ねください。
