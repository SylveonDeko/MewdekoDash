---
title: Vérification des intentions
slug: intent-verification
summary: Que répondre à la demande d'intentions privilégiées de l'application Discord lorsque votre propre bot Mewdeko devient assez grand pour nécessiter une vérification, avec des textes à coller dans chaque champ.
icon: fa-shield-check
category: General
tags: [intents, privileged intents, verification, verify, discord developer portal, presence intent, server members intent, message content intent, self host, selfhost, custom bot, privacy policy, intentions, intentions privilégiées, vérification, vérifier, portail développeur discord, intention de présence, intention des membres du serveur, intention de contenu des messages, auto-hébergement, bot personnalisé, politique de confidentialité]
related: [settings, statusroles, logging, chatsaver]
---

## À qui s'adresse cette page

Cette page s'adresse aux personnes qui font fonctionner leur propre bot Mewdeko : une copie auto-hébergée, ou toute instance qui utilise sa propre application Discord plutôt que le Mewdeko officiel. Une fois que votre bot dépasse le seuil de Discord (plus de 10 000 utilisateurs uniques, tous serveurs confondus), Discord vous demande de demander l'autorisation pour chaque intention privilégiée utilisée. Si votre bot est plus petit, vous pouvez ignorer cette page.

> [!NOTE]
> Sauf si Discord modifie la procédure, vous devez effectuer une nouvelle vérification chaque année. Conservez un lien vers cette page pour la prochaine fois.

Mewdeko se connecte avec toutes les intentions de passerelle activées ; l'application doit donc disposer des trois intentions privilégiées : **Presence**, **Server Members** et **Contenu du message**. Les sections ci-dessous suivent l'ordre du formulaire de Discord. Pour les menus de sélection, choisissez l'option indiquée ici. Pour les zones de texte, copiez le bloc de code et adaptez ce qui se trouve entre chevrons. Les liens vers les captures d'écran pointent vers des captures du Mewdeko officiel ; vous pouvez les utiliser tels quels ou les remplacer par des captures de votre propre instance.

> [!WARNING]
> Ce guide ne garantit pas l'approbation ; c'est Discord qui prend la décision finale. Répondez à chaque question en toute honnêteté pour *votre* instance. Si votre configuration diffère d'une installation Mewdeko par défaut, par exemple si vous avez désactivé certaines fonctionnalités, modifiez le texte en conséquence. Discord peut poser des questions complémentaires et vous demander de prouver vos réponses.

## Détails de l'application

Les textes ci-dessous sont à coller en anglais dans le formulaire de Discord, qui est examiné en anglais.

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

## Politique de confidentialité

### Disposez-vous d'une politique de confidentialité publique informant vos utilisateurs de l'utilisation de leurs données ?

Sélectionnez **Oui**.

### Où votre politique de confidentialité est-elle disponible ?

```
In the bot's profile bio and on our website.
```

### Veuillez partager un lien vers votre politique de confidentialité.

```
<link to your privacy policy>
```

> [!WARNING]
> La politique de Mewdeko, disponible à l'adresse https://mewdeko.tech/privacy, ne concerne que le bot officiel et ses serveurs ; elle indique où *nos* données sont stockées et qui contacter. Votre instance stocke les données sur votre propre serveur, vous avez donc besoin de votre propre politique. Vous pouvez vous en inspirer, en modifiant le lieu de stockage, les coordonnées et tout autre élément qui diffère, puis la publier sur votre site ou dans un gist GitHub. Discord souhaite généralement que le lien figure également dans la biographie du profil du bot.

## Intentions de passerelle privilégiées

Cochez les trois intentions :

- **Presence Intent**
- **Server Members Intent**
- **Message Content Intent**

> [!TIP]
> Si vous avez désactivé toutes les fonctionnalités listées sous l'une des intentions ci-dessous, vous n'avez pas besoin de cette intention. Laissez-la décochée plutôt que de demander une autorisation dont le bot n'a pas l'usage.

## Intention de présence

### Pourquoi avez-vous besoin de l'intention de présence ?

```
Status Roles - Server staff can give members a role based on their custom status text (for example, a supporter role for members who put the server's invite in their status). The role is removed again when the status changes.
Stream Roles - Gives members a "live" role while their Discord activity shows they are streaming, and removes it when they stop.
Game Voice Channels - Optionally moves members into a voice channel matching the game they are playing.
Server Stats - Server staff can opt in to activity statistics showing which games and activities are popular in the server.
Online member counts - Online/idle/do-not-disturb counts for stat channels and message placeholders.
```

### Veuillez fournir des liens vers des captures d'écran et/ou des vidéos démontrant votre cas d'utilisation

```
https://cdn.mewdeko.tech/intent-verification/streamrole.png
https://cdn.mewdeko.tech/intent-verification/serverstats.png
```

## Intention des membres du serveur

### Pourquoi avez-vous besoin de l'intention Guild Members ?

```
Greets & Leaves - Sending custom welcome/goodbye messages and images when members join or leave, including role greets when a member gains a role.
Auto Roles & Role States - Assigning roles on join, and restoring a member's saved roles (including mutes) if they leave and rejoin.
Anti-Raid Protection - Detecting mass joins and new-account raids as members arrive.
Logging - Logging joins, leaves, nickname, avatar and role changes for server moderators.
Invite Tracking - Recording which invite a member joined with.
Leaderboards & Stat Roles - Showing member names and avatars on XP/leaderboard rankings and giving roles based on member statistics.
Achievements - Granting achievements triggered by member profile and role changes.
```

### Veuillez fournir des liens vers des captures d'écran et/ou des vidéos démontrant votre cas d'utilisation

```
https://cdn.mewdeko.tech/intent-verification/greets.png
https://cdn.mewdeko.tech/intent-verification/logging-members.png
https://cdn.mewdeko.tech/intent-verification/streamrole.png
https://cdn.mewdeko.tech/intent-verification/antiraid.png
```

### Stockez-vous des données API en dehors de la plateforme (en dehors de Discord) ?

Sélectionnez **Oui**. Le bot stocke les identifiants utilisateur, les noms d'utilisateur, l'XP, les avertissements et les paramètres de chaque serveur dans sa base de données.

### Conservez-vous les données API pendant 30 jours ou moins ?

Sélectionnez **Non**. Les données d'un serveur, comme l'XP, les avertissements et les tickets, sont conservées tant que le bot reste sur ce serveur.

### Comment les utilisateurs vous contactent-ils pour demander la suppression de leurs données d'activité ?

```
Users can ask for deletion in our support server (linked in the bot's bio and in the help command) or by emailing <your contact email>. Server administrators can also delete their server's data from the dashboard, and data for a server is removed when the bot is removed from it.
```

### Chiffrez-vous les données stockées au repos, comme l'exige notre politique pour les développeurs ?

> [!WARNING]
> Mewdeko ne chiffre pas lui-même sa base de données ; cela dépend donc de votre hébergement. Sélectionnez **Oui** uniquement si le disque ou le volume sur lequel se trouvent vos données PostgreSQL et Redis est chiffré, par exemple un disque chiffré avec LUKS ou un volume cloud avec le chiffrement au repos activé. Sinon, mettez cela en place avant de soumettre votre demande. Ne répondez pas Yes dans le cas contraire.

## Intention de contenu des messages

### Les utilisateurs peuvent-ils refuser que les données de contenu de leurs messages soient suivies ?

Sélectionnez **Non**.

### Stockez-vous des données de contenu de messages en dehors de la plateforme (en dehors de Discord) ?

Sélectionnez **Oui**. Plusieurs fonctionnalités conservent le texte des messages ; répondre No serait donc inexact pour une installation standard.

> [!NOTE]
> Les fonctionnalités qui stockent le texte des messages sont Snipe (activé par serveur, conservé dans Redis et purgé après 30 jours), les transcriptions de tickets et les journaux de chat enregistrés, les messages du starboard, les suggestions, les confessions, les messages AFK, les mots surveillés pour les notifications et l'historique du chat IA. Si vous avez désactivé toutes ces fonctionnalités, vous pouvez répondre No à la place.

### Les données de contenu de messages seront-elles utilisées pour entraîner des modèles de machine learning ou d'IA ?

Sélectionnez **Non**.

> [!NOTE]
> Mewdeko n'entraîne aucun modèle. La fonctionnalité facultative de chat IA envoie les messages du salon qu'un serveur a configuré pour elle au fournisseur d'IA que *ce serveur* choisit (OpenAI, Groq ou Anthropic), en utilisant la clé API propre à ce serveur. Si votre instance le permet, mentionnez-le dans la réponse sur le contenu des messages ci-dessous ; sinon, supprimez cette ligne.

### Pourquoi avez-vous besoin de l'intention de contenu des messages ?

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

### Veuillez fournir des liens vers des captures d'écran et/ou des vidéos démontrant votre cas d'utilisation

```
https://cdn.mewdeko.tech/intent-verification/prefix-command.png
https://cdn.mewdeko.tech/intent-verification/chat-triggers.png
https://cdn.mewdeko.tech/intent-verification/highlights.png
https://cdn.mewdeko.tech/intent-verification/logging-messages.png
https://cdn.mewdeko.tech/intent-verification/starboard.png
https://cdn.mewdeko.tech/intent-verification/ticket-transcript.png
```

## Accusé de réception

Cochez la case.

> [!NOTE]
> L'équipe support de Discord peut revenir vers vous avec des questions complémentaires ou demander des modifications, par exemple déplacer le lien vers la politique de confidentialité dans la biographie du bot. Répondez-leur en toute honnêteté pour votre instance ; si vous ne savez pas ce que Mewdeko fait dans un cas particulier, demandez sur le [serveur d'assistance](https://discord.gg/twQw45rBjN).
