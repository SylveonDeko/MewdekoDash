---
title: Intent-Verifizierung
slug: intent-verification
summary: Was du im Antrag auf Discords privilegierte Intents antworten musst, wenn dein eigener Mewdeko-Bot so groß wird, dass er verifiziert werden muss, mit Texten, die du in jedes Feld einfügen kannst.
icon: fa-shield-check
category: General
tags: [intents, privileged intents, verification, verify, discord developer portal, presence intent, server members intent, message content intent, self host, selfhost, custom bot, privacy policy, Verifizierung, privilegierte Intents, Entwicklerportal, Selbsthosting, eigener Bot, Datenschutzerklärung]
related: [settings, statusroles, logging, chatsaver]
---

## Für wen das ist

Diese Seite richtet sich an Leute, die ihren eigenen Mewdeko-Bot betreiben: eine selbst gehostete Kopie oder jede Instanz, die eine eigene Discord-Anwendung statt des offiziellen Mewdeko nutzt. Sobald dein Bot Discords Schwelle überschreitet (mehr als 10.000 einzelne Nutzer über alle seine Server zusammen), verlangt Discord, dass du für jeden verwendeten privilegierten Intent einen Antrag stellst. Ist dein Bot kleiner, kannst du diese Seite überspringen.

> [!NOTE]
> Solange Discord den Ablauf nicht ändert, musst du jedes Jahr neu verifizieren. Behalte einen Link zu dieser Seite für das nächste Mal.

Mewdeko verbindet sich mit allen eingeschalteten Gateway-Intents, daher braucht der Antrag alle drei privilegierten Intents: **Presence**, **Server Members** und **Nachrichteninhalt**. Die Abschnitte unten folgen der Reihenfolge von Discords Formular. Bei Auswahlmenüs wähle die hier angegebene Option. Bei Textfeldern kopiere den Codeblock und passe alles in spitzen Klammern an. Die Screenshot-Links zeigen auf Screenshots des offiziellen Mewdeko; du kannst sie unverändert verwenden oder Screenshots deiner eigenen Instanz einsetzen. Die Formularfragen sind unten übersetzt, die Texte zum Einfügen und die Bezeichnungen im Entwicklerportal bleiben Englisch.

> [!WARNING]
> Diese Anleitung garantiert keine Genehmigung; Discord trifft die endgültige Entscheidung. Beantworte jede Frage wahrheitsgemäß für *deine* Instanz. Wo sich dein Setup von einer Standard-Mewdeko-Installation unterscheidet, etwa durch deaktivierte Funktionen, passe den Text entsprechend an. Discord kann Rückfragen stellen und dich bitten, deine Antworten zu belegen.

## Angaben zur Anwendung

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

## Datenschutzerklärung

### Hast du eine öffentliche Datenschutzerklärung, die deine Nutzer über die Datennutzung informiert?

Wähle **Ja**.

### Wo ist deine Datenschutzerklärung verfügbar?

```
In the bot's profile bio and on our website.
```

### Bitte teile einen Link zu deiner Datenschutzerklärung.

```
<link to your privacy policy>
```

> [!WARNING]
> Mewdekos eigene Erklärung unter https://mewdeko.tech/privacy gilt nur für den offiziellen Bot und seine Server; sie sagt, wo *unsere* Daten gespeichert werden und an wen man sich wenden kann. Deine Instanz speichert Daten auf deinem eigenen Server, also brauchst du deine eigene Erklärung. Du kannst sie auf unserer aufbauen und Speicherort, Kontaktdaten und alles andere Abweichende ändern und sie auf deiner Website oder in einem GitHub-Gist veröffentlichen. Discord möchte den Link meist auch in der Profilbeschreibung des Bots sehen.

## Privilegierte Gateway-Intents

Hake alle drei Intents an:

- **Presence Intent**
- **Server Members Intent**
- **Message Content Intent**

> [!TIP]
> Wenn du jede unter einem der Intents unten aufgeführte Funktion ausgeschaltet hast, brauchst du diesen Intent nicht. Lass ihn dann abgewählt, statt etwas zu beantragen, das der Bot nicht nutzt.

## Presence-Intent

### Warum brauchst du den Presence-Intent?

```
Status Roles - Server staff can give members a role based on their custom status text (for example, a supporter role for members who put the server's invite in their status). The role is removed again when the status changes.
Stream Roles - Gives members a "live" role while their Discord activity shows they are streaming, and removes it when they stop.
Game Voice Channels - Optionally moves members into a voice channel matching the game they are playing.
Server Stats - Server staff can opt in to activity statistics showing which games and activities are popular in the server.
Online member counts - Online/idle/do-not-disturb counts for stat channels and message placeholders.
```

### Bitte gib Links zu Screenshots und/oder Videos an, die deinen Anwendungsfall zeigen

```
https://cdn.mewdeko.tech/intent-verification/streamrole.png
https://cdn.mewdeko.tech/intent-verification/serverstats.png
```

## Server-Members-Intent

### Warum brauchst du den Guild-Members-Intent?

```
Greets & Leaves - Sending custom welcome/goodbye messages and images when members join or leave, including role greets when a member gains a role.
Auto Roles & Role States - Assigning roles on join, and restoring a member's saved roles (including mutes) if they leave and rejoin.
Anti-Raid Protection - Detecting mass joins and new-account raids as members arrive.
Logging - Logging joins, leaves, nickname, avatar and role changes for server moderators.
Invite Tracking - Recording which invite a member joined with.
Leaderboards & Stat Roles - Showing member names and avatars on XP/leaderboard rankings and giving roles based on member statistics.
Achievements - Granting achievements triggered by member profile and role changes.
```

### Bitte gib Links zu Screenshots und/oder Videos an, die deinen Anwendungsfall zeigen

```
https://cdn.mewdeko.tech/intent-verification/greets.png
https://cdn.mewdeko.tech/intent-verification/logging-members.png
https://cdn.mewdeko.tech/intent-verification/streamrole.png
https://cdn.mewdeko.tech/intent-verification/antiraid.png
```

### Speicherst du API-Daten außerhalb der Plattform (außerhalb von Discord)?

Wähle **Ja**. Der Bot speichert Nutzer-IDs, Nutzernamen, XP, Verwarnungen und Einstellungen pro Server in seiner Datenbank.

### Speicherst du API-Daten 30 Tage oder weniger?

Wähle **Nein**. Serverdaten wie XP, Verwarnungen und Tickets werden so lange aufbewahrt, wie der Bot auf diesem Server bleibt.

### Wie können Nutzer dich kontaktieren, um die Löschung ihrer Aktivitätsdaten zu beantragen?

```
Users can ask for deletion in our support server (linked in the bot's bio and in the help command) or by emailing <your contact email>. Server administrators can also delete their server's data from the dashboard, and data for a server is removed when the bot is removed from it.
```

### Verschlüsselst du die gespeicherten Daten im Ruhezustand, wie es unsere Entwicklerrichtlinie verlangt?

> [!WARNING]
> Mewdeko verschlüsselt seine Datenbank nicht selbst, das hängt also von deinem Hosting ab. Wähle **Ja** nur, wenn die Festplatte oder das Volume, auf dem deine PostgreSQL- und Redis-Daten liegen, verschlüsselt ist, zum Beispiel eine LUKS-verschlüsselte Festplatte oder ein Cloud-Volume mit aktivierter Verschlüsselung im Ruhezustand. Ist das nicht der Fall, richte es ein, bevor du den Antrag stellst. Antworte sonst nicht mit Yes.

## Message-Content-Intent

### Können Nutzer widersprechen, dass ihre Nachrichteninhalte erfasst werden?

Wähle **Nein**.

### Speicherst du Nachrichteninhalte außerhalb der Plattform (außerhalb von Discord)?

Wähle **Ja**. Mehrere Funktionen speichern Nachrichtentext, daher wäre No bei einer Standardinstallation falsch.

> [!NOTE]
> Die Funktionen, die Nachrichtentext speichern, sind Snipe (pro Server per Opt-in, in Redis gehalten und nach 30 Tagen bereinigt), Ticket-Transkripte und gespeicherte Chatprotokolle, Starboard-Beiträge, Vorschläge, Geständnisse, AFK-Nachrichten, Highlight-Wörter und der KI-Chatverlauf. Hast du all diese deaktiviert, kannst du stattdessen mit No antworten.

### Werden die Nachrichteninhalte zum Training von Machine-Learning- oder KI-Modellen verwendet?

Wähle **Nein**.

> [!NOTE]
> Mewdeko trainiert keine Modelle. Die optionale KI-Chat-Funktion sendet Nachrichten aus dem Kanal, den ein Server dafür einrichtet, an den KI-Anbieter, den *dieser Server* wählt (OpenAI, Groq oder Anthropic), unter Verwendung des eigenen API-Schlüssels dieses Servers. Erlaubt deine Instanz das, erwähne es in der Antwort zum Message-Content-Intent unten; falls nicht, entferne diese Zeile.

### Warum brauchst du den Message-Content-Intent?

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

### Bitte gib Links zu Screenshots und/oder Videos an, die deinen Anwendungsfall zeigen

```
https://cdn.mewdeko.tech/intent-verification/prefix-command.png
https://cdn.mewdeko.tech/intent-verification/chat-triggers.png
https://cdn.mewdeko.tech/intent-verification/highlights.png
https://cdn.mewdeko.tech/intent-verification/logging-messages.png
https://cdn.mewdeko.tech/intent-verification/starboard.png
https://cdn.mewdeko.tech/intent-verification/ticket-transcript.png
```

## Bestätigung

Hake das Kästchen an.

> [!NOTE]
> Discords Support-Team kann mit Rückfragen zurückkommen oder um Änderungen bitten, etwa den Link zur Datenschutzerklärung in die Profilbeschreibung des Bots zu verschieben. Beantworte sie wahrheitsgemäß für deine Instanz; wenn du unsicher bist, was Mewdeko in einem bestimmten Fall tut, frag im [Support-Server](https://discord.gg/twQw45rBjN).
