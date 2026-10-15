---
title: Weryfikacja intencji
slug: intent-verification
summary: Co odpowiedzieć w aplikacji o uprzywilejowane intencje Discorda, gdy twój własny bot Mewdeko urośnie na tyle, że trzeba go zweryfikować, z tekstem do wklejenia w każde pole.
icon: fa-shield-check
category: General
tags: [intents, privileged intents, verification, verify, discord developer portal, presence intent, server members intent, message content intent, self host, selfhost, custom bot, privacy policy, intencje, intencje uprzywilejowane, weryfikacja, weryfikuj, portal deweloperski discord, intencja obecności, intencja członków serwera, intencja treści wiadomości, samodzielny hosting, własny bot, polityka prywatności]
related: [settings, statusroles, logging, chatsaver]
---

## Dla kogo jest ta strona

Ta strona jest dla osób, które prowadzą własnego bota Mewdeko: samodzielnie hostowanej kopii albo dowolnej instancji, która korzysta z własnej aplikacji Discorda, a nie z oficjalnego Mewdeko. Gdy twój bot przekroczy próg Discorda (ponad 10 000 unikalnych użytkowników na wszystkich twoich serwerach łącznie), Discord poprosi cię o złożenie wniosku o każdą uprzywilejowaną intencję, z której bot korzysta. Jeśli twój bot jest mniejszy, możesz pominąć tę stronę.

> [!NOTE]
> Dopóki Discord nie zmieni procesu, musisz weryfikować bota co roku. Zachowaj link do tej strony na następny raz.

Mewdeko łączy się z włączonymi wszystkimi intencjami gatewaya, więc aplikacja potrzebuje wszystkich trzech uprzywilejowanych intencji: **Presence**, **Server Members** i **Treść wiadomości**. Poniższe sekcje idą w kolejności formularza Discorda. Przy listach wyboru wybierz opcję podaną tutaj. Przy polach tekstowych skopiuj blok kodu i dostosuj wszystko w nawiasach ostrych. Linki do zrzutów ekranu prowadzą do zrzutów oficjalnego Mewdeko; możesz ich użyć w obecnej postaci albo podmienić na zrzuty własnej instancji.

> [!WARNING]
> Ten przewodnik nie gwarantuje zatwierdzenia; ostateczną decyzję podejmuje Discord. Odpowiadaj na każde pytanie zgodnie z prawdą dla *twojej* instancji. Jeśli twoja konfiguracja różni się od domyślnej instalacji Mewdeko, na przykład wyłączyłeś niektóre funkcje, zmień tekst tak, aby do niej pasował. Discord może zadać pytania uzupełniające i poprosić o udowodnienie twoich odpowiedzi.

## Szczegóły aplikacji

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

## Polityka prywatności

### Czy masz publiczną Politykę prywatności informującą użytkowników o tym, jak wykorzystujesz ich dane?

Wybierz **Tak**.

### Gdzie dostępna jest twoja Polityka prywatności?

```
In the bot's profile bio and on our website.
```

### Podaj link do swojej Polityki prywatności.

```
<link to your privacy policy>
```

> [!WARNING]
> Własna polityka Mewdeko pod adresem https://mewdeko.tech/privacy dotyczy wyłącznie oficjalnego bota i jego serwerów; określa, gdzie przechowywane są *nasze* dane i z kim się skontaktować. Twoja instancja przechowuje dane na własnym serwerze, więc potrzebujesz własnej polityki. Możesz oprzeć ją na naszej, zmieniając miejsce przechowywania, dane kontaktowe i wszystko, co się różni, a następnie opublikować ją na swojej stronie lub w giście GitHuba. Discord zwykle chce też, żeby link znalazł się w bio profilu bota.

## Uprzywilejowane intencje gatewaya

Zaznacz wszystkie trzy intencje:

- **Presence Intent**
- **Server Members Intent**
- **Message Content Intent**

> [!TIP]
> Jeśli wyłączyłeś wszystkie funkcje wymienione przy jednej z poniższych intencji, nie potrzebujesz tej intencji. Zostaw ją niezaznaczoną zamiast prosić o coś, czego bot nie używa.

## Intencja obecności

### Dlaczego potrzebujesz intencji Presence?

```
Status Roles - Server staff can give members a role based on their custom status text (for example, a supporter role for members who put the server's invite in their status). The role is removed again when the status changes.
Stream Roles - Gives members a "live" role while their Discord activity shows they are streaming, and removes it when they stop.
Game Voice Channels - Optionally moves members into a voice channel matching the game they are playing.
Server Stats - Server staff can opt in to activity statistics showing which games and activities are popular in the server.
Online member counts - Online/idle/do-not-disturb counts for stat channels and message placeholders.
```

### Podaj linki do zrzutów ekranu i/lub filmów pokazujących twój przypadek użycia

```
https://cdn.mewdeko.tech/intent-verification/streamrole.png
https://cdn.mewdeko.tech/intent-verification/serverstats.png
```

## Intencja członków serwera

### Dlaczego potrzebujesz intencji Guild Members?

```
Greets & Leaves - Sending custom welcome/goodbye messages and images when members join or leave, including role greets when a member gains a role.
Auto Roles & Role States - Assigning roles on join, and restoring a member's saved roles (including mutes) if they leave and rejoin.
Anti-Raid Protection - Detecting mass joins and new-account raids as members arrive.
Logging - Logging joins, leaves, nickname, avatar and role changes for server moderators.
Invite Tracking - Recording which invite a member joined with.
Leaderboards & Stat Roles - Showing member names and avatars on XP/leaderboard rankings and giving roles based on member statistics.
Achievements - Granting achievements triggered by member profile and role changes.
```

### Podaj linki do zrzutów ekranu i/lub filmów pokazujących twój przypadek użycia

```
https://cdn.mewdeko.tech/intent-verification/greets.png
https://cdn.mewdeko.tech/intent-verification/logging-members.png
https://cdn.mewdeko.tech/intent-verification/streamrole.png
https://cdn.mewdeko.tech/intent-verification/antiraid.png
```

### Czy przechowujesz dane API poza platformą (poza Discordem)?

Wybierz **Tak**. Bot przechowuje w swojej bazie danych ID użytkowników, nazwy użytkowników, XP, ostrzeżenia i ustawienia dla poszczególnych serwerów.

### Czy przechowujesz dane API przez 30 dni lub krócej?

Wybierz **Nie**. Dane serwerowe, takie jak XP, ostrzeżenia i tickety, są przechowywane tak długo, jak bot pozostaje na danym serwerze.

### Jak użytkownicy kontaktują się z tobą, aby zażądać usunięcia danych o swojej aktywności?

```
Users can ask for deletion in our support server (linked in the bot's bio and in the help command) or by emailing <your contact email>. Server administrators can also delete their server's data from the dashboard, and data for a server is removed when the bot is removed from it.
```

### Czy szyfrujesz dane przechowywane w spoczynku, tak jak wymaga tego nasza polityka deweloperska?

> [!WARNING]
> Mewdeko sam nie szyfruje swojej bazy danych, więc wszystko zależy od hostingu. Wybierz **Tak** tylko wtedy, gdy dysk lub wolumen, na którym znajdują się dane PostgreSQL i Redis, jest zaszyfrowany, na przykład dysk szyfrowany LUKS-em albo wolumen w chmurze z włączonym szyfrowaniem w spoczynku. Jeśli nie jest, skonfiguruj to przed złożeniem wniosku. W przeciwnym razie nie odpowiadaj Yes.

## Intencja treści wiadomości

### Czy użytkownicy mogą zrezygnować z śledzenia danych o treści ich wiadomości?

Wybierz **Nie**.

### Czy przechowujesz dane o treści wiadomości poza platformą (poza Discordem)?

Wybierz **Tak**. Kilka funkcji przechowuje tekst wiadomości, więc odpowiedź No byłaby błędna w przypadku standardowej instalacji.

> [!NOTE]
> Funkcje, które przechowują tekst wiadomości, to Snipe (włączane osobno na każdym serwerze, przechowywane w Redis i przycinane po 30 dniach), transkrypcje ticketów i zapisane logi czatu, posty starboardu, sugestie, wyznania, wiadomości AFK, słowa highlight oraz historia czatu AI. Jeśli wyłączyłeś je wszystkie, możesz zamiast tego odpowiedzieć No.

### Czy dane o treści wiadomości będą wykorzystywane do trenowania modeli uczenia maszynowego lub AI?

Wybierz **Nie**.

> [!NOTE]
> Mewdeko nie trenuje żadnych modeli. Opcjonalna funkcja czatu AI wysyła wiadomości z kanału, który serwer skonfigurował do tego celu, do dostawcy AI, którego *ten serwer* wybierze (OpenAI, Groq lub Anthropic), używając własnego klucza API tego serwera. Jeśli twoja instancja na to pozwala, wspomnij o tym w odpowiedzi dotyczącej treści wiadomości poniżej; jeśli nie, usuń tę linijkę.

### Dlaczego potrzebujesz intencji Message Content?

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

### Podaj linki do zrzutów ekranu i/lub filmów pokazujących twój przypadek użycia

```
https://cdn.mewdeko.tech/intent-verification/prefix-command.png
https://cdn.mewdeko.tech/intent-verification/chat-triggers.png
https://cdn.mewdeko.tech/intent-verification/highlights.png
https://cdn.mewdeko.tech/intent-verification/logging-messages.png
https://cdn.mewdeko.tech/intent-verification/starboard.png
https://cdn.mewdeko.tech/intent-verification/ticket-transcript.png
```

## Potwierdzenie

Zaznacz pole.

> [!NOTE]
> Zespół wsparcia Discorda może odpisać z dodatkowymi pytaniami albo poprosić o zmiany, na przykład o przeniesienie linku do polityki prywatności do bio bota. Odpowiadaj na nie zgodnie z prawdą dla swojej instancji; jeśli nie wiesz, co Mewdeko robi w konkretnym przypadku, zapytaj na [serwerze wsparcia](https://discord.gg/twQw45rBjN).
