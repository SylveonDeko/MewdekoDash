---
title: 인텐트 인증
slug: intent-verification
summary: 직접 운영하는 Mewdeko 봇이 커져서 인증이 필요해졌을 때, Discord 특권 인텐트 신청서의 각 칸에 붙여넣을 수 있는 답변을 정리했어요.
icon: fa-shield-check
category: General
tags: [intents, privileged intents, verification, verify, discord developer portal, presence intent, server members intent, message content intent, self host, selfhost, custom bot, privacy policy, 인텐트, 특권 인텐트, 인증, 검증, 디스코드 개발자 포털, 프레즌스 인텐트, 서버 멤버 인텐트, 메시지 콘텐츠 인텐트, 직접 호스팅, 자체 봇, 개인정보 처리방침]
related: [settings, statusroles, logging, chatsaver]
---

## 대상

이 페이지는 Mewdeko 봇을 직접 운영하는 사람을 위한 페이지예요. 자체 호스팅한 사본이거나, 공식 Mewdeko이 아니라 자체 Discord 애플리케이션을 쓰는 인스턴스를 뜻해요. 봇이 Discord의 기준(모든 서버를 합쳐 고유 사용자 10,000명 초과)을 넘으면 Discord는 사용하는 특권 인텐트마다 신청하라고 요청해요. 봇이 그보다 작다면 이 페이지는 건너뛰어도 돼요.

> [!NOTE]
> Discord가 절차를 바꾸지 않는 한 매년 다시 인증해야 해요. 다음 번을 위해 이 페이지 링크를 보관해 두세요.

Mewdeko은 모든 게이트웨이 인텐트를 켠 상태로 연결하므로, 신청서에는 특권 인텐트 세 가지가 모두 필요해요: **Presence**, **Server Members**, **메시지 내용**. 아래 섹션은 Discord 신청 양식의 순서를 따라가요. 선택 메뉴는 여기 적힌 옵션을 고르세요. 텍스트 상자는 코드 블록을 복사하고 꺾쇠괄호 안의 내용만 고치면 돼요. 스크린샷 링크는 공식 Mewdeko의 스크린샷을 가리켜요. 그대로 쓰거나 직접 운영하는 인스턴스의 스크린샷으로 바꿔도 괜찮아요.

> [!WARNING]
> 이 가이드는 승인을 보장하지 않아요. 최종 결정은 Discord가 해요. 모든 질문에 *본인의* 인스턴스 기준으로 사실대로 답하세요. 기능을 끄는 등 기본 Mewdeko 설치와 다른 점이 있다면 그에 맞게 내용을 바꾸세요. Discord는 추가 질문을 할 수 있고, 답변이 사실인지 증명하라고 요청할 수도 있어요.

## 애플리케이션 세부 정보

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

## 개인정보 처리방침

### 사용자에게 데이터 사용을 알리는 공개 개인정보 처리방침이 있나요?

**예**를 고르세요.

### 개인정보 처리방침은 어디에서 볼 수 있나요?

```
In the bot's profile bio and on our website.
```

### 개인정보 처리방침 링크를 알려 주세요.

```
<link to your privacy policy>
```

> [!WARNING]
> Mewdeko의 공식 정책(https://mewdeko.tech/privacy)은 공식 봇과 그 서버에만 적용돼요. 데이터가 저장되는 위치와 연락처를 *우리* 기준으로 설명하죠. 직접 운영하는 인스턴스는 자기 서버에 데이터를 저장하므로 본인만의 정책이 필요해요. 공식 정책을 바탕으로 저장 위치, 연락처, 그 밖에 다른 부분을 고쳐서 본인 사이트나 GitHub gist에 게시하면 돼요. Discord는 보통 봇 프로필 소개란에도 링크가 있기를 원해요.

## 특권 게이트웨이 인텐트

세 가지 인텐트를 모두 체크하세요:

- **Presence Intent**
- **Server Members Intent**
- **Message Content Intent**

> [!TIP]
> 아래 인텐트 중 하나에 속한 기능을 모두 껐다면 그 인텐트는 필요 없어요. 봇이 쓰지 않는 권한을 요청하지 말고 체크하지 마세요.

## Presence 인텐트

### Presence 인텐트가 왜 필요한가요?

```
Status Roles - Server staff can give members a role based on their custom status text (for example, a supporter role for members who put the server's invite in their status). The role is removed again when the status changes.
Stream Roles - Gives members a "live" role while their Discord activity shows they are streaming, and removes it when they stop.
Game Voice Channels - Optionally moves members into a voice channel matching the game they are playing.
Server Stats - Server staff can opt in to activity statistics showing which games and activities are popular in the server.
Online member counts - Online/idle/do-not-disturb counts for stat channels and message placeholders.
```

### 사용 사례를 보여주는 스크린샷이나 영상 링크를 제공해 주세요

```
https://cdn.mewdeko.tech/intent-verification/streamrole.png
https://cdn.mewdeko.tech/intent-verification/serverstats.png
```

## Server Members 인텐트

### Guild Members 인텐트가 왜 필요한가요?

```
Greets & Leaves - Sending custom welcome/goodbye messages and images when members join or leave, including role greets when a member gains a role.
Auto Roles & Role States - Assigning roles on join, and restoring a member's saved roles (including mutes) if they leave and rejoin.
Anti-Raid Protection - Detecting mass joins and new-account raids as members arrive.
Logging - Logging joins, leaves, nickname, avatar and role changes for server moderators.
Invite Tracking - Recording which invite a member joined with.
Leaderboards & Stat Roles - Showing member names and avatars on XP/leaderboard rankings and giving roles based on member statistics.
Achievements - Granting achievements triggered by member profile and role changes.
```

### 사용 사례를 보여주는 스크린샷이나 영상 링크를 제공해 주세요

```
https://cdn.mewdeko.tech/intent-verification/greets.png
https://cdn.mewdeko.tech/intent-verification/logging-members.png
https://cdn.mewdeko.tech/intent-verification/streamrole.png
https://cdn.mewdeko.tech/intent-verification/antiraid.png
```

### Discord 외부(플랫폼 밖)에 API 데이터를 저장하나요?

**예**를 고르세요. 봇은 데이터베이스에 사용자 ID, 사용자 이름, XP, 경고, 서버별 설정을 저장해요.

### API 데이터를 30일 이하로 보관하나요?

**아니요**를 고르세요. XP, 경고, 티켓 같은 서버 데이터는 봇이 그 서버에 있는 동안 보관돼요.

### 사용자가 활동 데이터 삭제를 요청하려면 어떻게 해야 하나요?

```
Users can ask for deletion in our support server (linked in the bot's bio and in the help command) or by emailing <your contact email>. Server administrators can also delete their server's data from the dashboard, and data for a server is removed when the bot is removed from it.
```

### 개발자 정책에서 요구하는 대로 저장된 데이터를 암호화하나요?

> [!WARNING]
> Mewdeko은 데이터베이스 자체를 암호화하지 않아요. 따라서 호스팅 환경에 따라 달라져요. PostgreSQL과 Redis 데이터가 있는 디스크나 볼륨이 암호화되어 있을 때만 **예**를 고르세요. 예를 들면 LUKS로 암호화된 디스크나 저장 시 암호화를 켠 클라우드 볼륨이에요. 암호화되어 있지 않다면 신청 전에 먼저 설정하세요. 그 외에는 Yes라고 답하면 안 돼요.

## Message Content 인텐트

### 사용자가 자신의 메시지 내용 데이터 추적을 거부할 수 있나요?

**아니요**를 고르세요.

### 메시지 내용 데이터를 플랫폼 밖에 저장하나요?

**예**를 고르세요. 여러 기능이 메시지 텍스트를 보관하므로, 일반적인 설치에서는 No가 틀린 답이에요.

> [!NOTE]
> 메시지 텍스트를 저장하는 기능은 Snipe(서버별 선택 사용, Redis에 보관되고 30일 후 정리), 티켓 기록과 저장된 채팅 로그, 스타보드 게시물, 제안, 고백, AFK 메시지, 하이라이트 단어, AI 채팅 기록이에요. 이 기능을 모두 껐다면 대신 No라고 답해도 돼요.

### 메시지 내용 데이터를 머신러닝이나 AI 모델 학습에 사용하나요?

**아니요**를 고르세요.

> [!NOTE]
> Mewdeko은 어떤 모델도 학습시키지 않아요. 선택 기능인 AI 채팅은 서버가 설정한 채널의 메시지를 *그 서버가* 고른 AI 제공자(OpenAI, Groq, Anthropic)로 보내요. 이때 서버 자신의 API 키를 써요. 인스턴스에서 이를 허용한다면 아래 메시지 내용 답변에 이 사실을 언급하세요. 허용하지 않는다면 그 줄을 빼세요.

### Message Content 인텐트가 왜 필요한가요?

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

### 사용 사례를 보여주는 스크린샷이나 영상 링크를 제공해 주세요

```
https://cdn.mewdeko.tech/intent-verification/prefix-command.png
https://cdn.mewdeko.tech/intent-verification/chat-triggers.png
https://cdn.mewdeko.tech/intent-verification/highlights.png
https://cdn.mewdeko.tech/intent-verification/logging-messages.png
https://cdn.mewdeko.tech/intent-verification/starboard.png
https://cdn.mewdeko.tech/intent-verification/ticket-transcript.png
```

## 동의

체크박스를 선택하세요.

> [!NOTE]
> Discord 지원팀이 추가 질문을 하거나 변경을 요청할 수 있어요. 예를 들어 개인정보 처리방침 링크를 봇 프로필 소개란으로 옮기라고 할 수도 있어요. 본인의 인스턴스 기준으로 사실대로 답하세요. 특정 상황에서 Mewdeko이 무엇을 하는지 확실하지 않다면 [지원 서버](https://discord.gg/twQw45rBjN)에서 물어보세요.
