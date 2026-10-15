---
title: Verifica degli intent
slug: intent-verification
summary: Cosa rispondere nella domanda sugli intent privilegiati di Discord quando il tuo bot Mewdeko diventa abbastanza grande da richiedere la verifica, con testi da incollare in ogni casella.
icon: fa-shield-check
category: General
tags: [intents, privileged intents, verification, verify, discord developer portal, presence intent, server members intent, message content intent, self host, selfhost, custom bot, privacy policy, intent privilegiati, verifica, auto-hosting, bot personalizzato, informativa privacy]
related: [settings, statusroles, logging, chatsaver]
---

## Per chi è questa guida

Questa pagina è per chi gestisce un proprio bot Mewdeko: una copia self-hosted, o qualsiasi istanza che usa una propria applicazione Discord invece di quella ufficiale di Mewdeko. Quando il tuo bot supera la soglia di Discord (più di 10.000 utenti unici in tutti i suoi server messi insieme), Discord ti chiede di richiedere ciascun intent privilegiato che usa. Se il bot è più piccolo, puoi saltare questa pagina.

> [!NOTE]
> Salvo cambiamenti di Discord, devi ripetere la verifica ogni anno. Conserva un link a questa pagina per la prossima volta.

Mewdeko si connette con tutti gli intent del gateway attivi, quindi l'applicazione deve avere tutti e tre gli intent privilegiati: **Presence**, **Server Members** e **Contenuto dei messaggi**. Le sezioni seguenti seguono l'ordine del modulo di Discord. Per i menu a scelta, seleziona l'opzione indicata qui. Per le caselle di testo, copia il blocco di codice e modifica quello che è tra parentesi angolari. I link alle schermate puntano a schermate del Mewdeko ufficiale; puoi usarle così come sono oppure sostituirle con schermate della tua istanza.

> [!WARNING]
> Questa guida non garantisce l'approvazione; la decisione finale spetta a Discord. Rispondi a ogni domanda in modo veritiero per *la tua* istanza. Dove la tua configurazione è diversa da un'installazione predefinita di Mewdeko, per esempio funzionalità che hai disattivato, modifica il testo di conseguenza. Discord può fare domande di approfondimento e può chiederti di dimostrare le tue risposte.

## Dettagli dell'applicazione

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

## Informativa sulla privacy

### Hai una informativa sulla privacy pubblica che spiega agli utenti come vengono usati i loro dati?

Seleziona **Sì**.

### Dove è disponibile la tua informativa sulla privacy?

```
In the bot's profile bio and on our website.
```

### Condividi un link alla tua informativa sulla privacy.

```
<link to your privacy policy>
```

> [!WARNING]
> L'informativa di Mewdeko all'indirizzo https://mewdeko.tech/privacy riguarda solo il bot ufficiale e i suoi server; spiega dove sono conservati *i nostri* dati e chi contattare. La tua istanza conserva i dati sul tuo server, quindi ti serve una tua informativa. Puoi basarla sulla nostra, cambiando il luogo di conservazione, i recapiti e tutto ciò che è diverso, e pubblicarla sul tuo sito o in un gist GitHub. Di solito Discord vuole anche il link nella bio del profilo del bot.

## Intent gateway privilegiati

Spunta tutti e tre gli intent:

- **Presence Intent**
- **Server Members Intent**
- **Message Content Intent**

> [!TIP]
> Se hai disattivato tutte le funzionalità elencate sotto uno degli intent, non ti serve quell'intent. Lascialo non spuntato invece di chiedere qualcosa che il bot non usa.

## Presence intent

### Perché ti serve il Presence intent?

```
Status Roles - Server staff can give members a role based on their custom status text (for example, a supporter role for members who put the server's invite in their status). The role is removed again when the status changes.
Stream Roles - Gives members a "live" role while their Discord activity shows they are streaming, and removes it when they stop.
Game Voice Channels - Optionally moves members into a voice channel matching the game they are playing.
Server Stats - Server staff can opt in to activity statistics showing which games and activities are popular in the server.
Online member counts - Online/idle/do-not-disturb counts for stat channels and message placeholders.
```

### Fornisci link a schermate e/o video che mostrano il tuo caso d'uso

```
https://cdn.mewdeko.tech/intent-verification/streamrole.png
https://cdn.mewdeko.tech/intent-verification/serverstats.png
```

## Server Members intent

### Perché ti serve il Guild Members intent?

```
Greets & Leaves - Sending custom welcome/goodbye messages and images when members join or leave, including role greets when a member gains a role.
Auto Roles & Role States - Assigning roles on join, and restoring a member's saved roles (including mutes) if they leave and rejoin.
Anti-Raid Protection - Detecting mass joins and new-account raids as members arrive.
Logging - Logging joins, leaves, nickname, avatar and role changes for server moderators.
Invite Tracking - Recording which invite a member joined with.
Leaderboards & Stat Roles - Showing member names and avatars on XP/leaderboard rankings and giving roles based on member statistics.
Achievements - Granting achievements triggered by member profile and role changes.
```

### Fornisci link a schermate e/o video che mostrano il tuo caso d'uso

```
https://cdn.mewdeko.tech/intent-verification/greets.png
https://cdn.mewdeko.tech/intent-verification/logging-members.png
https://cdn.mewdeko.tech/intent-verification/streamrole.png
https://cdn.mewdeko.tech/intent-verification/antiraid.png
```

### Conservi dati API al di fuori della piattaforma (fuori da Discord)?

Seleziona **Sì**. Il bot conserva nel suo database ID utente, nomi utente, XP, avvertimenti e impostazioni per server.

### Conservi i dati API per 30 giorni o meno?

Seleziona **No**. I dati del server, come XP, avvertimenti e ticket, vengono conservati finché il bot resta in quel server.

### In che modo gli utenti ti chiedono di eliminare i dati delle loro attività?

```
Users can ask for deletion in our support server (linked in the bot's bio and in the help command) or by emailing <your contact email>. Server administrators can also delete their server's data from the dashboard, and data for a server is removed when the bot is removed from it.
```

### Cifri i dati che conservi a riposo, come richiesto dalla politica per sviluppatori?

> [!WARNING]
> Mewdeko non cifra il database di per sé, quindi questo dipende dall'hosting. Seleziona **Sì** solo se il disco o il volume su cui si trovano i dati di PostgreSQL e Redis è cifrato, per esempio un disco LUKS o un volume cloud con la cifratura a riposo attivata. Se non lo è, configuralo prima di presentare la richiesta. Altrimenti non rispondere Sì.

## Message Content intent

### Gli utenti possono scegliere di non far tracciare i dati del contenuto dei loro messaggi?

Seleziona **No**.

### Conservi dati del contenuto dei messaggi al di fuori della piattaforma (fuori da Discord)?

Seleziona **Sì**. Diverse funzionalità conservano il testo dei messaggi, quindi con No la risposta sarebbe sbagliata per un'installazione standard.

> [!NOTE]
> Le funzionalità che conservano il testo dei messaggi sono Snipe (attivabile per ogni server, conservato in Redis ed eliminato dopo 30 giorni), le trascrizioni dei ticket e i log delle chat salvati, i post dello starboard, i suggerimenti, le confessioni, i messaggi AFK, le parole per gli highlight e la cronologia della chat AI. Se le hai disattivate tutte, puoi rispondere No.

### I dati del contenuto dei messaggi verranno usati per addestrare modelli di machine learning o di IA?

Seleziona **No**.

> [!NOTE]
> Mewdeko non addestra nessun modello. La funzione facoltativa di chat AI invia i messaggi del canale che un server ha configurato per questo scopo al fornitore di IA *che quel server* sceglie (OpenAI, Groq o Anthropic), usando la chiave API di quel server. Se la tua istanza lo consente, menzionalo nella risposta sul contenuto dei messaggi qui sotto; in caso contrario, rimuovi quella riga.

### Perché ti serve il Message Content intent?

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

### Fornisci link a schermate e/o video che mostrano il tuo caso d'uso

```
https://cdn.mewdeko.tech/intent-verification/prefix-command.png
https://cdn.mewdeko.tech/intent-verification/chat-triggers.png
https://cdn.mewdeko.tech/intent-verification/highlights.png
https://cdn.mewdeko.tech/intent-verification/logging-messages.png
https://cdn.mewdeko.tech/intent-verification/starboard.png
https://cdn.mewdeko.tech/intent-verification/ticket-transcript.png
```

## Riconoscimento

Spunta la casella.

> [!NOTE]
> Il supporto di Discord potrebbe rispondere con domande di approfondimento o chiedere modifiche, per esempio spostare il link all'informativa sulla privacy nella bio del bot. Rispondi in modo veritiero per la tua istanza; se non sei sicuro di cosa faccia Mewdeko in un caso particolare, chiedi nel [server di supporto](https://discord.gg/twQw45rBjN).
