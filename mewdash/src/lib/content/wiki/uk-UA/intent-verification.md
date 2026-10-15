---
title: Верифікація інтентів
slug: intent-verification
summary: Що відповідати в застосунку привілейованих інтентів Discord, коли твій власний бот Mewdeko стає достатньо великим, щоб його треба було верифікувати, з текстом, який можна вставити в кожне поле.
icon: fa-shield-check
category: General
tags: [intents, privileged intents, verification, verify, discord developer portal, presence intent, server members intent, message content intent, self host, selfhost, custom bot, privacy policy, інтенти, привілейовані інтенти, верифікація, верифікувати, портал розробника discord, інтент присутності, інтент учасників сервера, інтент вмісту повідомлень, самохостинг, власний бот, політика конфіденційності]
related: [settings, statusroles, logging, chatsaver]
---

## Для кого це

Ця сторінка для тих, хто запускає власного бота Mewdeko: самохостингова копія або будь-який екземпляр, який використовує власний застосунок Discord, а не офіційний Mewdeko. Щойно твій бот перевищує поріг Discord (понад 10 000 унікальних користувачів на всіх його серверах разом), Discord просить подати заявку на кожен привілейований інтент, який він використовує. Якщо бот менший, цю сторінку можна пропустити.

> [!NOTE]
> Якщо Discord не змінить процес, верифікацію треба проходити щороку. Збережи посилання на цю сторінку для наступного разу.

Mewdeko підключається з увімкненими всіма інтентами шлюзу, тож застосунку потрібні всі три привілейовані інтенти: **Presence**, **Server Members** і **Вміст повідомлення**. Розділи нижче йдуть у порядку форми Discord. Для випадаючих списків обирай варіант, вказаний тут. Для текстових полів скопіюй блок коду і змін усе, що стоїть у кутових дужках. Посилання на скриншоти ведуть на скриншоти офіційного Mewdeko; їх можна використати як є або замінити на скриншоти твого екземпляра.

> [!WARNING]
> Цей посібник не гарантує схвалення; остаточне рішення ухвалює Discord. Відповідай на кожне питання правдиво щодо *твого* екземпляра. Якщо твоє налаштування відрізняється від типової установки Mewdeko, наприклад ти вимкнув деякі функції, зміни текст відповідно. Discord може поставити додаткові запитання і попросити підтвердити твої відповіді.

## Деталі застосунку

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

## Політика конфіденційності

### Чи є у тебе публічна Політика конфіденційності, що розповідає користувачам про використання їхніх даних?

Обери **Так**.

### Де доступна твоя Політика конфіденційності?

```
In the bot's profile bio and on our website.
```

### Поділися посиланням на свою Політику конфіденційності.

```
<link to your privacy policy>
```

> [!WARNING]
> Власна політика Mewdeko за адресою https://mewdeko.tech/privacy стосується лише офіційного бота та його серверів; вона пояснює, де зберігаються *наші* дані і з ким зв'язатися. Твій екземпляр зберігає дані на твоєму власному сервері, тож тобі потрібна власна політика. Можеш взяти за основу нашу, змінивши місце зберігання, контактні дані та все інше, що відрізняється, і опублікувати її на своєму сайті або в GitHub gist. Discord зазвичай також хоче бачити посилання в описі профілю бота.

## Привілейовані інтенти шлюзу

Постав позначку у всіх трьох інтентах:

- **Presence Intent**
- **Server Members Intent**
- **Message Content Intent**

> [!TIP]
> Якщо ти вимкнув усі функції, перелічені під одним з інтентів нижче, цей інтент тобі не потрібен. Залиш його без позначки, замість того щоб запитувати те, чим бот не користується.

## Інтент присутності

### Навіщо тобі інтент Presence?

```
Status Roles - Server staff can give members a role based on their custom status text (for example, a supporter role for members who put the server's invite in their status). The role is removed again when the status changes.
Stream Roles - Gives members a "live" role while their Discord activity shows they are streaming, and removes it when they stop.
Game Voice Channels - Optionally moves members into a voice channel matching the game they are playing.
Server Stats - Server staff can opt in to activity statistics showing which games and activities are popular in the server.
Online member counts - Online/idle/do-not-disturb counts for stat channels and message placeholders.
```

### Надай посилання на скриншоти та/або відео, що демонструють твій сценарій використання

```
https://cdn.mewdeko.tech/intent-verification/streamrole.png
https://cdn.mewdeko.tech/intent-verification/serverstats.png
```

## Інтент учасників сервера

### Навіщо тобі інтент Guild Members?

```
Greets & Leaves - Sending custom welcome/goodbye messages and images when members join or leave, including role greets when a member gains a role.
Auto Roles & Role States - Assigning roles on join, and restoring a member's saved roles (including mutes) if they leave and rejoin.
Anti-Raid Protection - Detecting mass joins and new-account raids as members arrive.
Logging - Logging joins, leaves, nickname, avatar and role changes for server moderators.
Invite Tracking - Recording which invite a member joined with.
Leaderboards & Stat Roles - Showing member names and avatars on XP/leaderboard rankings and giving roles based on member statistics.
Achievements - Granting achievements triggered by member profile and role changes.
```

### Надай посилання на скриншоти та/або відео, що демонструють твій сценарій використання

```
https://cdn.mewdeko.tech/intent-verification/greets.png
https://cdn.mewdeko.tech/intent-verification/logging-members.png
https://cdn.mewdeko.tech/intent-verification/streamrole.png
https://cdn.mewdeko.tech/intent-verification/antiraid.png
```

### Чи зберігаєш ти дані API поза платформою (поза Discord)?

Обери **Так**. Бот зберігає в базі даних ID користувачів, імена, XP, попередження та налаштування для кожного сервера.

### Чи зберігаєш ти дані API на 30 днів або менше?

Обери **Ні**. Дані сервера, як-от XP, попередження та тікети, зберігаються, доки бот перебуває на цьому сервері.

### Як користувачі звертаються до тебе із запитом на видалення їхніх даних активності?

```
Users can ask for deletion in our support server (linked in the bot's bio and in the help command) or by emailing <your contact email>. Server administrators can also delete their server's data from the dashboard, and data for a server is removed when the bot is removed from it.
```

### Чи шифруєш ти дані, що зберігаються, як того вимагає наша політика розробника?

> [!WARNING]
> Mewdeko сам по собі не шифрує базу даних, тож це залежить від твого хостингу. Обери **Так** лише тоді, коли диск або том, на якому зберігаються твої дані PostgreSQL і Redis, зашифрований, наприклад диск LUKS або хмарний том із увімкненим шифруванням у стані спокою. Якщо ні, налаштуй це перед подачею заявки. Інакше не відповідай Yes.

## Інтент вмісту повідомлень

### Чи можуть користувачі відмовитися від відстеження вмісту їхніх повідомлень?

Обери **Ні**.

### Чи зберігаєш ти дані вмісту повідомлень поза платформою (поза Discord)?

Обери **Так**. Кілька функцій зберігають текст повідомлень, тож відповідь No була б помилковою для стандартної установки.

> [!NOTE]
> Функції, які зберігають текст повідомлень: Snipe (вмикається окремо для кожного сервера, зберігається в Redis і обрізається через 30 днів), транскрипти тікетів і збережені журнали чату, дописи зоряної дошки, пропозиції, сповіді, повідомлення AFK, слова для highlights та історія чату ШІ. Якщо ти вимкнув усі ці функції, можеш відповісти No.

### Чи будуть дані вмісту повідомлень використовуватися для навчання моделей машинного навчання або ШІ?

Обери **Ні**.

> [!NOTE]
> Mewdeko не навчає жодних моделей. Необов'язкова функція чату ШІ надсилає повідомлення з каналу, який сервер налаштував для неї, до провайдера ШІ, якого *цей сервер* обрав (OpenAI, Groq або Anthropic), використовуючи власний ключ API сервера. Якщо твій екземпляр це дозволяє, згадай про це у відповіді про вміст повідомлень нижче; якщо ні, прибери цей рядок.

### Навіщо тобі інтент Message Content?

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

### Надай посилання на скриншоти та/або відео, що демонструють твій сценарій використання

```
https://cdn.mewdeko.tech/intent-verification/prefix-command.png
https://cdn.mewdeko.tech/intent-verification/chat-triggers.png
https://cdn.mewdeko.tech/intent-verification/highlights.png
https://cdn.mewdeko.tech/intent-verification/logging-messages.png
https://cdn.mewdeko.tech/intent-verification/starboard.png
https://cdn.mewdeko.tech/intent-verification/ticket-transcript.png
```

## Підтвердження

Постав позначку в полі.

> [!NOTE]
> Служба підтримки Discord може повернутися з додатковими запитаннями або попросити внести зміни, наприклад перенести посилання на політику конфіденційності в опис профілю бота. Відповідай на них правдиво щодо твого екземпляра; якщо ти не впевнений, що Mewdeko робить у певному випадку, запитай на [сервері підтримки](https://discord.gg/twQw45rBjN).
