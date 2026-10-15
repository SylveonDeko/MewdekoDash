---
title: Verificación de intents
slug: intent-verification
summary: Qué responder en la solicitud de intents privilegiados de Discord cuando tu propio bot Mewdeko crece lo suficiente como para necesitar verificación, con textos que puedes pegar en cada casilla.
icon: fa-shield-check
category: General
tags: [intents, privileged intents, verification, verify, discord developer portal, presence intent, server members intent, message content intent, self host, selfhost, custom bot, privacy policy, verificación, intents privilegiados, portal de desarrolladores de discord, autoalojado, bot propio, política de privacidad]
related: [settings, statusroles, logging, chatsaver]
---

## A quién va dirigido

Esta página es para quienes ejecutan su propio bot Mewdeko: una copia autoalojada, o cualquier instancia que use su propia aplicación de Discord en lugar del Mewdeko oficial. Cuando tu bot supera el umbral de Discord (más de 10.000 usuarios únicos entre todos sus servidores combinados), Discord te pide que solicites cada intent privilegiado que usa. Si tu bot es más pequeño que eso, puedes saltarte esta página.

> [!NOTE]
> Salvo que Discord cambie el proceso, tienes que volver a verificar cada año. Guarda un enlace a esta página para la próxima vez.

Mewdeko se conecta con todos los intents del gateway activados, así que la solicitud necesita los tres intents privilegiados: **Presence**, **Server Members** y **Contenido del mensaje**. Las secciones siguientes siguen el orden del formulario de Discord. Como el formulario de Discord está en inglés, los textos para pegar se dejan en inglés y las preguntas aparecen en su original entre paréntesis. En los menús de selección, elige la opción indicada aquí. En los cuadros de texto, copia el bloque de código y ajusta lo que aparezca entre corchetes angulares. Los enlaces de capturas apuntan a capturas del Mewdeko oficial; puedes usarlos tal cual o sustituirlos por capturas de tu propia instancia.

> [!WARNING]
> Esta guía no garantiza la aprobación; Discord toma la decisión final. Responde con sinceridad a todas las preguntas sobre *tu* instancia. Donde tu configuración difiera de una instalación predeterminada de Mewdeko, por ejemplo por funciones que hayas desactivado, cambia el texto para que coincida. Discord puede hacer preguntas de seguimiento y pedirte que demuestres tus respuestas.

## Detalles de la aplicación

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

## Política de privacidad

### ¿Tienes una política de privacidad pública que informe a tus usuarios sobre el uso de sus datos? (Do you have a public Privacy Policy telling your users about their data usage?)

Selecciona **Sí**.

### ¿Dónde está disponible tu política de privacidad? (Where is your Privacy Policy available?)

```
In the bot's profile bio and on our website.
```

### Comparte un enlace a tu política de privacidad. (Please share a link to your Privacy Policy.)

```
<link to your privacy policy>
```

> [!WARNING]
> La política propia de Mewdeko en https://mewdeko.tech/privacy cubre solo el bot oficial y sus servidores; indica dónde se almacenan *nuestros* datos y con quién contactar. Tu instancia almacena los datos en tu propio servidor, así que necesitas tu propia política. Puedes basarla en la nuestra, cambiando el lugar de almacenamiento, los datos de contacto y todo lo que sea distinto, y publicarla en tu sitio web o en un gist de GitHub. Discord suele querer el enlace también en la biografía del perfil del bot.

## Intents privilegiados del gateway

Marca los tres intents:

- **Presence Intent**
- **Server Members Intent**
- **Message Content Intent**

> [!TIP]
> Si has desactivado todas las funciones listadas bajo uno de los intents de abajo, no necesitas ese intent. Déjalo sin marcar en lugar de pedir algo que el bot no usa.

## Intent de Presence

### ¿Por qué necesitas el intent de Presence? (Why do you need the Presence intent?)

```
Status Roles - Server staff can give members a role based on their custom status text (for example, a supporter role for members who put the server's invite in their status). The role is removed again when the status changes.
Stream Roles - Gives members a "live" role while their Discord activity shows they are streaming, and removes it when they stop.
Game Voice Channels - Optionally moves members into a voice channel matching the game they are playing.
Server Stats - Server staff can opt in to activity statistics showing which games and activities are popular in the server.
Online member counts - Online/idle/do-not-disturb counts for stat channels and message placeholders.
```

### Proporciona enlaces a capturas de pantalla o vídeos que demuestren tu caso de uso (Please provide links to screenshots and/or videos that demonstrate your use case)

```
https://cdn.mewdeko.tech/intent-verification/streamrole.png
https://cdn.mewdeko.tech/intent-verification/serverstats.png
```

## Intent de Server Members

### ¿Por qué necesitas el intent de Guild Members? (Why do you need the Guild Members intent?)

```
Greets & Leaves - Sending custom welcome/goodbye messages and images when members join or leave, including role greets when a member gains a role.
Auto Roles & Role States - Assigning roles on join, and restoring a member's saved roles (including mutes) if they leave and rejoin.
Anti-Raid Protection - Detecting mass joins and new-account raids as members arrive.
Logging - Logging joins, leaves, nickname, avatar and role changes for server moderators.
Invite Tracking - Recording which invite a member joined with.
Leaderboards & Stat Roles - Showing member names and avatars on XP/leaderboard rankings and giving roles based on member statistics.
Achievements - Granting achievements triggered by member profile and role changes.
```

### Proporciona enlaces a capturas de pantalla o vídeos que demuestren tu caso de uso (Please provide links to screenshots and/or videos that demonstrate your use case)

```
https://cdn.mewdeko.tech/intent-verification/greets.png
https://cdn.mewdeko.tech/intent-verification/logging-members.png
https://cdn.mewdeko.tech/intent-verification/streamrole.png
https://cdn.mewdeko.tech/intent-verification/antiraid.png
```

### ¿Almacenas algún dato de la API fuera de la plataforma (fuera de Discord)? (Are you storing any API Data off-platform (outside of Discord)?)

Selecciona **Sí**. El bot almacena en su base de datos los ID de usuario, nombres de usuario, XP, avisos y ajustes por servidor.

### ¿Almacenas los datos de la API durante 30 días o menos? (Are you storing API Data for 30 days or less?)

Selecciona **No**. Los datos del servidor, como la XP, los avisos y los tickets, se conservan mientras el bot permanezca en ese servidor.

### ¿Cómo se ponen los usuarios en contacto contigo para solicitar la eliminación de los datos de su actividad? (How do users contact you to request deletion of their activity data?)

```
Users can ask for deletion in our support server (linked in the bot's bio and in the help command) or by emailing <your contact email>. Server administrators can also delete their server's data from the dashboard, and data for a server is removed when the bot is removed from it.
```

### ¿Cifras los datos que almacenas en reposo, como exige nuestra política de desarrolladores? (Are you encrypting the data that you store at rest, as is required by our developer policy?)

> [!WARNING]
> Mewdeko no cifra su base de datos por sí mismo, así que esto depende de tu alojamiento. Selecciona **Sí** solo si el disco o volumen en el que viven tus datos de PostgreSQL y Redis está cifrado, por ejemplo un disco cifrado con LUKS o un volumen en la nube con el cifrado en reposo activado. Si no lo está, configúralo antes de enviar la solicitud. No respondas Yes en caso contrario.

## Intent de Message Content

### ¿Pueden los usuarios optar por que no se registre el contenido de sus mensajes? (Can users opt-out of having their message content data tracked?)

Selecciona **No**.

### ¿Almacenas datos del contenido de los mensajes fuera de la plataforma (fuera de Discord)? (Are you storing message content data off-platform (outside of Discord)?)

Selecciona **Sí**. Varias funciones guardan texto de mensajes, así que responder No sería incorrecto en una instalación estándar.

> [!NOTE]
> Las funciones que almacenan texto de mensajes son Snipe (opcional por servidor, guardado en Redis y recortado a los 30 días), las transcripciones de tickets y los registros de chat guardados, las publicaciones del starboard, las sugerencias, las confesiones, los mensajes AFK, las palabras de highlights y el historial del chat de IA. Si has desactivado todas ellas, puedes responder No.

### ¿Se usarán los datos del contenido de los mensajes para entrenar modelos de aprendizaje automático o de IA? (Will the message content data be used to train machine learning or AI Models?)

Selecciona **No**.

> [!NOTE]
> Mewdeko no entrena ningún modelo. La función opcional de chat con IA envía los mensajes del canal que un servidor configura para ello al proveedor de IA que *ese servidor* elija (OpenAI, Groq o Anthropic), usando la propia clave de API de ese servidor. Si tu instancia lo permite, menciónalo en la respuesta sobre el contenido de los mensajes de más abajo; si no, quita esa línea.

### ¿Por qué necesitas el intent de Message Content? (Why do you need the Message Content intent?)

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

### Proporciona enlaces a capturas de pantalla o vídeos que demuestren tu caso de uso (Please provide links to screenshots and/or videos that demonstrate your use case)

```
https://cdn.mewdeko.tech/intent-verification/prefix-command.png
https://cdn.mewdeko.tech/intent-verification/chat-triggers.png
https://cdn.mewdeko.tech/intent-verification/highlights.png
https://cdn.mewdeko.tech/intent-verification/logging-messages.png
https://cdn.mewdeko.tech/intent-verification/starboard.png
https://cdn.mewdeko.tech/intent-verification/ticket-transcript.png
```

## Confirmación

Marca la casilla.

> [!NOTE]
> El personal de soporte de Discord puede volver con preguntas de seguimiento o pedir cambios, como mover el enlace de la política de privacidad a la biografía del bot. Respóndeles con sinceridad sobre tu instancia; si no estás seguro de lo que hace Mewdeko en un caso concreto, pregunta en el [servidor de soporte](https://discord.gg/twQw45rBjN).
