---
title: Verificação de Intents
slug: intent-verification
summary: O que responder na solicitação de intents privilegiadas do Discord quando o seu próprio bot Mewdeko ficar grande o bastante para precisar de verificação, com textos que você pode colar em cada campo.
icon: fa-shield-check
category: General
tags: [intents, privileged intents, verification, verify, discord developer portal, presence intent, server members intent, message content intent, self host, selfhost, custom bot, privacy policy, verificação, intents privilegiadas, portal do desenvolvedor, hospedagem própria, bot personalizado, política de privacidade]
related: [settings, statusroles, logging, chatsaver]
---

## Para quem é esta página

Esta página é para quem executa o próprio bot Mewdeko: uma cópia hospedada por conta própria, ou qualquer instância que use o seu próprio aplicativo do Discord em vez da Mewdeko oficial. Quando o seu bot ultrapassa o limite do Discord (mais de 10.000 usuários únicos somando todos os seus servidores), o Discord pede que você solicite cada intent privilegiada que ele usa. Se o seu bot for menor que isso, você pode pular esta página.

> [!NOTE]
> A menos que o Discord mude o processo, você precisa verificar de novo todo ano. Guarde um link para esta página para a próxima vez.

A Mewdeko se conecta com todas as intents de gateway ativadas, então a solicitação precisa das três intents privilegiadas: **Presence**, **Server Members** e **Conteúdo da mensagem**. As seções abaixo seguem a ordem do formulário do Discord. Para os menus de seleção, escolha a opção indicada aqui. Para as caixas de texto, copie o bloco de código e ajuste tudo o que estiver entre colchetes angulares. Os links de captura de tela apontam para capturas da Mewdeko oficial; você pode usá-los como estão ou trocá-los por capturas da sua própria instância.

> [!WARNING]
> Este guia não garante a aprovação; o Discord toma a decisão final. Responda a todas as perguntas com sinceridade para a *sua* instância. Onde a sua configuração diferir de uma instalação padrão da Mewdeko, como recursos que você desativou, altere o texto para corresponder. O Discord pode fazer perguntas de acompanhamento e pedir que você comprove as suas respostas.

## Detalhes do aplicativo

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

## Política de privacidade

### Você tem uma Política de Privacidade pública informando os usuários sobre o uso dos dados deles? (Do you have a public Privacy Policy telling your users about their data usage?)

Selecione **Sim**.

### Onde a sua Política de Privacidade está disponível? (Where is your Privacy Policy available?)

```
In the bot's profile bio and on our website.
```

### Compartilhe um link para a sua Política de Privacidade. (Please share a link to your Privacy Policy.)

```
<link to your privacy policy>
```

> [!WARNING]
> A política da própria Mewdeko, em https://mewdeko.tech/privacy, cobre apenas o bot oficial e os servidores dele; ela diz onde *os nossos* dados são armazenados e quem contatar. A sua instância armazena os dados no seu próprio servidor, então você precisa da sua própria política. Você pode basear-se na nossa, alterando o local de armazenamento, os dados de contato e qualquer outra coisa que seja diferente, e publicá-la no seu site ou em um gist do GitHub. O Discord costuma querer o link também na bio do perfil do bot.

## Intents de gateway privilegiadas

Marque as três intents:

- **Presence Intent**
- **Server Members Intent**
- **Message Content Intent**

> [!TIP]
> Se você desativou todos os recursos listados sob uma das intents abaixo, não precisa dessa intent. Deixe-a desmarcada em vez de pedir algo que o bot não usa.

## Presence intent

### Por que você precisa da intent Presence? (Why do you need the Presence intent?)

```
Status Roles - Server staff can give members a role based on their custom status text (for example, a supporter role for members who put the server's invite in their status). The role is removed again when the status changes.
Stream Roles - Gives members a "live" role while their Discord activity shows they are streaming, and removes it when they stop.
Game Voice Channels - Optionally moves members into a voice channel matching the game they are playing.
Server Stats - Server staff can opt in to activity statistics showing which games and activities are popular in the server.
Online member counts - Online/idle/do-not-disturb counts for stat channels and message placeholders.
```

### Forneça links para capturas de tela e/ou vídeos que demonstrem o seu caso de uso (Please provide links to screenshots and/or videos that demonstrate your use case)

```
https://cdn.mewdeko.tech/intent-verification/streamrole.png
https://cdn.mewdeko.tech/intent-verification/serverstats.png
```

## Server Members intent

### Por que você precisa da intent Guild Members? (Why do you need the Guild Members intent?)

```
Greets & Leaves - Sending custom welcome/goodbye messages and images when members join or leave, including role greets when a member gains a role.
Auto Roles & Role States - Assigning roles on join, and restoring a member's saved roles (including mutes) if they leave and rejoin.
Anti-Raid Protection - Detecting mass joins and new-account raids as members arrive.
Logging - Logging joins, leaves, nickname, avatar and role changes for server moderators.
Invite Tracking - Recording which invite a member joined with.
Leaderboards & Stat Roles - Showing member names and avatars on XP/leaderboard rankings and giving roles based on member statistics.
Achievements - Granting achievements triggered by member profile and role changes.
```

### Forneça links para capturas de tela e/ou vídeos que demonstrem o seu caso de uso (Please provide links to screenshots and/or videos that demonstrate your use case)

```
https://cdn.mewdeko.tech/intent-verification/greets.png
https://cdn.mewdeko.tech/intent-verification/logging-members.png
https://cdn.mewdeko.tech/intent-verification/streamrole.png
https://cdn.mewdeko.tech/intent-verification/antiraid.png
```

### Você armazena algum dado da API fora da plataforma (fora do Discord)? (Are you storing any API Data off-platform (outside of Discord)?)

Selecione **Sim**. O bot armazena IDs de usuário, nomes de usuário, XP, avisos e configurações por servidor no banco de dados dele.

### Você armazena dados da API por 30 dias ou menos? (Are you storing API Data for 30 days or less?)

Selecione **Não**. Os dados do servidor, como XP, avisos e tickets, são mantidos enquanto o bot permanecer nesse servidor.

### Como os usuários entram em contato para solicitar a exclusão dos dados de atividade deles? (How do users contact you to request deletion of their activity data?)

```
Users can ask for deletion in our support server (linked in the bot's bio and in the help command) or by emailing <your contact email>. Server administrators can also delete their server's data from the dashboard, and data for a server is removed when the bot is removed from it.
```

### Você criptografa os dados que armazena em repouso, conforme exigido pela nossa política de desenvolvedores? (Are you encrypting the data that you store at rest, as is required by our developer policy?)

> [!WARNING]
> A Mewdeko não criptografa o próprio banco de dados, então isso depende da sua hospedagem. Selecione **Sim** apenas se o disco ou volume em que os seus dados do PostgreSQL e do Redis ficam estiver criptografado, por exemplo um disco criptografado com LUKS ou um volume em nuvem com criptografia em repouso ativada. Se não estiver, configure isso antes de enviar a solicitação. Não responda Yes caso contrário.

## Message Content intent

### Os usuários podem optar por não ter os dados de conteúdo das mensagens deles rastreados? (Can users opt-out of having their message content data tracked?)

Selecione **Não**.

### Você armazena dados de conteúdo de mensagens fora da plataforma (fora do Discord)? (Are you storing message content data off-platform (outside of Discord)?)

Selecione **Sim**. Vários recursos guardam o texto das mensagens, então No estaria errado para uma instalação padrão.

> [!NOTE]
> Os recursos que armazenam texto de mensagens são o Snipe (opcional por servidor, mantido no Redis e limpo após 30 dias), as transcrições de tickets e os registros de chat salvos, os posts do starboard, as sugestões, as confissões, as mensagens de AFK, as palavras de highlights e o histórico do chat de IA. Se você desativou todos eles, pode responder No.

### Os dados de conteúdo das mensagens serão usados para treinar modelos de aprendizado de máquina ou de IA? (Will the message content data be used to train machine learning or AI Models?)

Selecione **Não**.

> [!NOTE]
> A Mewdeko não treina nenhum modelo. O recurso opcional de chat de IA envia as mensagens do canal que um servidor configura para ele ao provedor de IA que *esse servidor* escolhe (OpenAI, Groq ou Anthropic), usando a própria chave de API desse servidor. Se a sua instância permite isso, mencione-o na resposta de conteúdo de mensagens abaixo; se não, remova essa linha.

### Por que você precisa da intent Message Content? (Why do you need the Message Content intent?)

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

### Forneça links para capturas de tela e/ou vídeos que demonstrem o seu caso de uso (Please provide links to screenshots and/or videos that demonstrate your use case)

```
https://cdn.mewdeko.tech/intent-verification/prefix-command.png
https://cdn.mewdeko.tech/intent-verification/chat-triggers.png
https://cdn.mewdeko.tech/intent-verification/highlights.png
https://cdn.mewdeko.tech/intent-verification/logging-messages.png
https://cdn.mewdeko.tech/intent-verification/starboard.png
https://cdn.mewdeko.tech/intent-verification/ticket-transcript.png
```

## Confirmação

Marque a caixa.

> [!NOTE]
> A equipe de suporte do Discord pode voltar com perguntas de acompanhamento ou pedir alterações, como mover o link da política de privacidade para a bio do bot. Responda com sinceridade para a sua instância; se não tiver certeza do que a Mewdeko faz em um caso específico, pergunte no [servidor de suporte](https://discord.gg/twQw45rBjN).
