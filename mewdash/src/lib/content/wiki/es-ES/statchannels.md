---
title: Canales de estadísticas
slug: statchannels
summary: Canales de voz cuyo nombre se actualiza solo para mostrar cifras en vivo, como el número de miembros, los boosts, los tickets abiertos o los espectadores de Twitch.
icon: fa-chart-simple
category: Community
dashboard: /dashboard/statchannels
module: StatChannels
tags: [stat channels, counter, member count, live stats, voice channel stats, countdown, member goal, boost count, twitch viewers, canales de estadísticas, contador, número de miembros, estadísticas en vivo, cuenta atrás, meta de miembros, boosts, espectadores de twitch]
related: [counting, twitch, suggestions, xp, afk, starboard]
---

## Qué hace

Un canal de estadísticas es un canal de voz bloqueado que se sitúa en la parte superior de tu lista de canales y muestra una cifra en su nombre, por ejemplo "Members: 12,480". El bot reescribe el nombre según una programación para que la cifra se mantenga al día. Los miembros no pueden entrar en el canal; existe solo para leerse.

Eliges un tipo de contador, una plantilla para el nombre, un estilo para el número y la frecuencia con la que se actualiza. El bot admite varias decenas de contadores que abarcan datos del servidor, presencia, boosts de Nitro, huecos de emojis, metas de miembros y cuentas atrás, además de valores procedentes de otras funciones de Mewdeko como tickets, sugerencias, sorteos, XP, contar, el starboard y servidores de Twitch o Minecraft vinculados.

Discord solo permite renombrar un canal dos veces cada diez minutos. Canales de estadísticas lo soluciona con una elección de mecanismo de actualización, incluido uno que elimina y recrea el canal para poder actualizarse cada minuto.

## Por qué usarlo

- Muestra los recuentos de miembros, humanos y bots en lo alto del servidor.
- Sigue el progreso hacia una meta de miembros con un porcentaje o una barra de progreso.
- Haz una cuenta atrás hasta un evento, un lanzamiento o un aniversario.
- Muestra el estado en directo de Twitch y el número de espectadores en el servidor de un streamer.
- Da al staff una vista en vivo de los tickets abiertos o las sugerencias pendientes sin abrir un panel.
- Muestra el estado del servidor de Minecraft y el número de jugadores junto al enlace de invitación.

## Tipos de contador

El catálogo completo de abajo es lo que listan `statchanneltypes` y la sección **Contadores disponibles** del panel. Todos los tipos aceptan los marcadores comunes; algunos añaden los suyos. Las plantillas predeterminadas empiezan con un emoji a juego seguido del texto indicado.

### Miembros

| Tipo | Muestra | Plantilla predeterminada | Marcadores adicionales |
| --- | --- | --- | --- |
| `TotalMembers` | Todos los miembros, bots incluidos | `Members: %count%` | |
| `HumanMembers` | Miembros que no son bots | `Humans: %count%` | |
| `BotCount` | Cuentas de bots | `Bots: %count%` | |
| `OnlineMembers` | Miembros con cualquier presencia distinta de desconectado | `Online: %count%` | |
| `IdleMembers` | Miembros marcados como ausentes | `Idle: %count%` | |
| `DndMembers` | Miembros marcados como no molestar | `DND: %count%` | |
| `StreamingMembers` | Miembros con una actividad de directo | `Streaming: %count%` | |
| `InVoiceMembers` | Miembros conectados a cualquier canal de voz | `In Voice: %count%` | |
| `RoleMembers` | Miembros con un rol elegido | `%role.name%: %count%` | `%role.name%`, `%role.id%`, `%role.color%` |
| `NewestMember` | El miembro que se unió más recientemente | `Newest: %member.name%` | `%member.name%`, `%member.id%` |
| `MembersJoinedToday` | Se unieron en las últimas 24 horas | `Joined Today: %count%` | |
| `MembersJoinedWeek` | Se unieron en los últimos 7 días | `This Week: %count%` | |
| `MemberGoal` | Progreso hacia un número de miembros objetivo | `%count% / %goal%` | `%goal%`, `%goal.raw%`, `%goal.percent%`, `%goal.remaining%`, `%goal.bar%` |
| `AfkCount` | Miembros que están AFK ahora mismo mediante Mewdeko | `AFK: %count%` | |

### Servidor

| Tipo | Muestra | Plantilla predeterminada | Marcadores adicionales |
| --- | --- | --- | --- |
| `Countdown` | Tiempo que falta hasta una fecha objetivo | `%days%d %hours%h left` | `%days%`, `%hours%`, `%minutes%`, `%total.hours%` |
| `ChannelCount` | Todos los canales | `Channels: %count%` | |
| `TextChannelCount` | Canales de texto | `Text: %count%` | |
| `VoiceChannelCount` | Canales de voz | `Voice: %count%` | |
| `CategoryCount` | Categorías | `Categories: %count%` | |
| `StageChannelCount` | Canales de escenario | `Stages: %count%` | |
| `ForumChannelCount` | Canales de foro | `Forums: %count%` | |
| `ThreadCount` | Hilos que están en caché como activos | `Threads: %count%` | |
| `RoleCount` | Roles | `Roles: %count%` | |
| `BoostCount` | Boosts de Nitro activos | `Boosts: %count%` | |
| `BoostLevel` | Nivel de boost, de 0 a 3 | `Level %count%` | |
| `NextBoostGoal` | Boosts que faltan para el siguiente nivel | `%count% to Tier %tier.next%` | `%tier.next%`, `%tier.current%` |
| `EmojiCount` | Todos los emojis personalizados | `Emojis: %count%` | |
| `AnimatedEmojiCount` | Emojis personalizados animados | `Animated: %count%` | |
| `StaticEmojiCount` | Emojis personalizados estáticos | `Static: %count%` | |
| `StickerCount` | Stickers personalizados | `Stickers: %count%` | |
| `EmojiSlotsUsed` | Huecos de emoji usados frente al límite del nivel | `Slots: %count%/%slots.max%` | `%slots.max%`, `%slots.free%` |
| `ServerAge` | Días desde que se creó el servidor | `Age: %count% days` | `%years%`, `%created%` |
| `EventCount` | Eventos programados | `Events: %count%` | |
| `BotUptime` | Cuánto tiempo lleva en marcha Mewdeko | `Uptime: %days%d %hours%h` | `%days%`, `%hours%`, `%minutes%` |
| `InviteCount` | Invitaciones registradas por el seguimiento de invitaciones | `Invites: %count%` | |

### Twitch

Estos leen del canal de Twitch vinculado mediante el módulo de Twitch.

| Tipo | Muestra | Plantilla predeterminada | Marcadores adicionales |
| --- | --- | --- | --- |
| `TwitchLiveStatus` | Si el canal está en directo | `%twitch.name%: %status%` | `%status%`, `%twitch.name%` |
| `TwitchViewers` | Espectadores actuales | `Viewers: %count%` | `%twitch.name%` |
| `TwitchGame` | Categoría que se está emitiendo | `%game%` | `%game%`, `%title%`, `%twitch.name%` |
| `TwitchUptime` | Cuánto tiempo lleva en directo | `Live %hours%h %minutes%m` | `%hours%`, `%minutes%` |
| `TwitchFollowers` | Total de seguidores | `Followers: %count%` | `%twitch.name%` |
| `TwitchSubs` | Total de suscriptores | `Subs: %count%` | `%twitch.name%` |
| `TwitchCounter` | Un contador con nombre del chat de Twitch | `%counter.name%: %count%` | `%counter.name%` |
| `TwitchLastRaider` | El último raider | `Last Raid: %raider%` | `%raider%`, `%raid.viewers%` |
| `TwitchRecentStreams` | Directos iniciados en los últimos 14 días | `Streams: %count%` | |

### Otras funciones de Mewdeko

| Tipo | Categoría | Muestra | Plantilla predeterminada | Marcadores adicionales |
| --- | --- | --- | --- | --- |
| `MinecraftPlayers` | Minecraft | Jugadores conectados en un servidor vigilado | `Players: %count%/%players.max%` | `%players.max%`, `%server.version%` |
| `MinecraftStatus` | Minecraft | Si un servidor vigilado es accesible | `%status%` | `%status%`, `%latency%` |
| `CountingCurrent` | Contar | Número actual en un canal de contar | `Count: %count%` | |
| `CountingRecord` | Contar | El número más alto alcanzado jamás | `Record: %count%` | |
| `OpenTickets` | Tickets | Tickets abiertos y sin archivar | `Open Tickets: %count%` | |
| `TicketsToday` | Tickets | Tickets abiertos en las últimas 24 horas | `Today: %count%` | |
| `PendingSuggestions` | Sugerencias | Sugerencias a la espera de una decisión | `Pending: %count%` | |
| `ActiveGiveaways` | Sorteos | Sorteos en marcha actualmente | `Giveaways: %count%` | |
| `StarboardPosts` | Starboard | Total de publicaciones del starboard | `Starred: %count%` | |
| `TopXpUser` | XP | El miembro con más XP | `Top: %member.name%` | `%member.name%`, `%member.id%`, `%member.xp%` |
| `TotalGuildXp` | XP | Toda la XP ganada en el servidor | `Total XP: %count%` | |
| `TotalCurrency` | Moneda | Moneda en manos de los miembros | `In Circulation: %count%` | |
| `ActivePolls` | Encuestas | Encuestas que aceptan votos | `Polls: %count%` | |
| `Clock` | Servidor | La fecha y la hora en la zona horaria del servidor | `%time% %tz%` | `%time%`, `%date%`, `%datetime%`, `%weekday%`, `%tz%` |
| `MessagesToday`, `MessagesWeek` | Actividad | Mensajes de las últimas 24 horas o 7 días | `Today: %count%` | |
| `VoiceHoursToday`, `VoiceHoursWeek` | Actividad | Horas de voz de todos los miembros en las últimas 24 horas o 7 días | `Today: %count%h` | |
| `TopChatter` | Actividad | El miembro más activo en el chat de los últimos 7 días | `Chatter: %member.name%` | `%member.name%`, `%member.id%`, `%member.messages%` |
| `TopVoiceMember` | Actividad | El miembro con más tiempo en voz en los últimos 7 días | `Voice: %member.name%` | `%member.name%`, `%member.id%`, `%member.hours%` |
| `TopGame` | Actividad | El juego más jugado de los últimos 7 días (requiere seguimiento de juegos) | `%game%` | `%game%`, `%hours%`, `%players%` |
| `PlayingNow` | Actividad | Miembros que están ahora en un juego registrado (requiere seguimiento de juegos) | `Playing: %count%` | |
| `RoleMembersOnline` | Miembros | Miembros con un rol que no están desconectados | `%role.name%: %count%` | `%role.name%`, `%role.id%`, `%role.total%` |
| `TopInviter` | Seguimiento de invitaciones | El miembro con más invitaciones | `Inviter: %member.name%` | `%member.name%`, `%member.id%`, `%member.invites%` |
| `InvitesWeek` | Seguimiento de invitaciones | Entradas acreditadas a invitadores en los últimos 7 días | `This Week: %count%` | |
| `MembersLeftToday`, `MembersLeftWeek` | Miembros | Miembros que se fueron en las últimas 24 horas o 7 días | `Left Today: %count%` | |
| `NetGrowthWeek` | Miembros | Entradas menos salidas en los últimos 7 días | `Growth: %count%` | `%joins%`, `%leaves%` |

### Marcadores disponibles para todos los tipos

| Marcador | Valor |
| --- | --- |
| `%count%` | El valor, mostrado con el estilo de visualización elegido |
| `%count.raw%` | El valor como dígitos simples |
| `%server.name%` | Nombre del servidor |
| `%server.id%` | ID del servidor |
| `%server.members%` | Número total de miembros |
| `%server.boostcount%` | Número de boosts |
| `%server.boostlevel%` | Nivel de boost |

Los nombres de canal están limitados al máximo de 100 caracteres de Discord.

## Estilos de visualización

El **Estilo del contador** decide cómo se muestra `%count%`. Solo se aplica a los contadores numéricos; los contadores de texto como `NewestMember` imprimen el texto tal cual, y los contadores de verdadero o falso como `TwitchLiveStatus` imprimen un texto del estilo "LIVE" u "Offline".

| Estilo | Ejemplo para 1234 | Notas |
| --- | --- | --- |
| `Plain` | `1234` | Dígitos simples |
| `Comma` | `1,234` | Separadores de millares. El predeterminado. |
| `Compact` | `1.2K` | Sufijos K, M, B, T, con un decimal por defecto |
| `Padded` | `1234` | Relleno con ceros hasta un ancho fijo, cuatro dígitos por defecto, así 42 pasa a `0042` |
| `Ordinal` | `1,234th` | Añade st, nd, rd o th |
| `Percent` | `61.7%` | Valor como porcentaje de la meta objetivo, con un decimal por defecto |
| `ProgressBar` | una barra de diez celdas | Celdas llenas y vacías hacia la meta objetivo, diez celdas por defecto |
| `EmojiDigits` | dígitos en recuadro | Cada dígito como un emoji de tecla |
| `Roman` | `MCCXXXIV` | Números romanos del 1 al 3999; si no, recurre al estilo con comas |

`Percent` y `ProgressBar` necesitan una meta objetivo con la que comparar. Sin ella muestran `0%` o una barra vacía.

## Mecanismos de actualización

| Mecanismo | Etiqueta en el panel | Cómo funciona |
| --- | --- | --- |
| `Rename` | Solo renombrar | Edita el nombre del canal. Discord permite dos renombrados cada diez minutos por canal, así que el intervalo de actualización se fuerza a al menos 5 minutos. El ID del canal nunca cambia. |
| `Recreate` | Eliminar y recrear | Crea un canal nuevo con el mismo nombre, categoría, posición y permisos específicos, y después elimina el antiguo. Puede actualizarse cada minuto, pero el ID del canal cambia en cada actualización y cada una deja dos entradas en el registro de auditoría. |
| `Auto` | Auto (recomendado) | Renombra mientras lo permita el límite de dos cada diez minutos. Cuando se agota el límite y el intervalo es inferior a 5 minutos, lo recrea. Cuando el intervalo es de 5 minutos o más, simplemente espera al siguiente hueco de renombrado. |

El valor predeterminado para los canales de estadísticas nuevos es **Auto** cada **5 minutos**. Los intervalos se ajustan entre 1 minuto (5 para Rename) y 1440 minutos. El bot comprueba cada 30 segundos qué canales han cumplido su intervalo.

> [!WARNING]
> Recreate cambia el ID del canal. Cualquier otra cosa que haga referencia al canal, como configuraciones de permisos en otros bots o enlaces fijados, se rompe en cada actualización. Úsalo solo donde una actualización rápida importe más que un ID estable.

## Ajustes

La página tiene tres pestañas, **Canales de estadísticas**, **Añadir** y **Valores por defecto**, además de un botón **Actualizar** en la cabecera. **Canales de estadísticas** lista todos los canales configurados con los botones **Editar** y **Quitar**.

**Añadir canal de estadísticas** ofrece **Crear canal nuevo** o **Usar canal existente** con un selector de **Canal de voz**, y después:

| Ajuste | Predeterminado | Qué controla |
| --- | --- | --- |
| Categoría (opcional) | ninguna | Dónde se coloca un canal recién creado |
| Contador | ninguno | El tipo de contador del catálogo |
| Plantilla | la predeterminada del tipo | Nombre del canal con marcadores; haz clic en un marcador para insertarlo, y la vista previa se actualiza mientras escribes |
| Estilo del contador | Comma | Estilo de visualización de la tabla anterior |
| Mecanismo de actualización | Auto | Renombrar, recrear o auto |
| Intervalo de actualización (minutos) | 5 | Con qué frecuencia se actualiza el nombre |
| Rol | ninguno | Se muestra para `RoleMembers` |
| Fecha objetivo | ninguna | Se muestra para `Countdown` |
| Objetivo meta | ninguno | Se muestra para `MemberGoal`, y lo usan los estilos de porcentaje y barra de progreso |
| Nombre del contador de Twitch | ninguno | Se muestra para `TwitchCounter` |
| Canal de contar | ninguno | Se muestra para los tipos de contar |
| Servidor de Minecraft | ninguno | Se muestra para los tipos de Minecraft |

**Valores por defecto de los nuevos canales de estadísticas** establece **Mecanismo por defecto**, **Estilo de contador por defecto** e **Intervalo por defecto (minutos)** para los canales que añadas más adelante. La pestaña **Valores por defecto** también tiene secciones de referencia para **Estilos de contador** y **Contadores disponibles**.

Un canal recién creado deniega Conectar a `@everyone` para que actúe como una etiqueta. Un canal que añadas tú mismo conserva los permisos que ya tenga.

## Guía de configuración

1. Abre **Canales de estadísticas** en el panel y ve a la pestaña **Valores por defecto**. Deja **Mecanismo por defecto** en Auto y establece un intervalo con el que te sientas cómodo.
2. Ve a **Añadir**, elige **Crear canal nuevo** y escoge una **Categoría** si quieres agrupar los contadores.
3. Elige un **Contador**, por ejemplo Total Members. Ajusta la **Plantilla** y mira la vista previa.
4. Elige un **Estilo del contador** y guarda.
5. Repite para cada contador. Para una meta de miembros, elige `MemberGoal`, establece **Objetivo meta** y prueba el estilo `ProgressBar`.
6. Arrastra los canales nuevos a lo alto de la lista de canales en Discord si no han quedado ahí.
7. Espera un intervalo de actualización y confirma que los nombres se actualizan.

## Comandos

Ejecútalos con el prefijo de tu servidor (`.` salvo que lo hayas cambiado). Los tipos, estilos y mecanismos son los nombres de las tablas anteriores, por ejemplo `TotalMembers`, `Compact`, `Recreate`.

| Comando | Alias | Requiere | Para qué sirve |
| --- | --- | --- | --- |
| `statchannelcreate <type> [template]` | `scnew` | Gestionar canales | Crea un canal de voz bloqueado nuevo que muestra ese contador |
| `statchanneladd #voice <type> [template]` | `sca` | Gestionar canales | Convierte un canal de voz existente en un canal de estadísticas |
| `statchannelrole #voice @role [true] [template]` | `scr` | Gestionar canales | Añade un contador de miembros de un rol; `true` cuenta solo a los miembros que no están desconectados |
| `statchannelcountdown #voice <date> [template]` | `scc` | Gestionar canales | Añade una cuenta atrás hasta una fecha |
| `statchannelgoal #voice <number> [template]` | `scg` | Gestionar canales | Añade un contador de meta de miembros |
| `statchanneltwitchcounter #voice <counter> [template]` | | Gestionar canales | Refleja un contador con nombre del chat de Twitch |
| `statchannelmechanism #voice <mechanism> [minutes]` | | Gestionar canales | Establece rename, recreate o auto, y opcionalmente el intervalo |
| `statchannelstyle #voice <style>` | | Gestionar canales | Establece el estilo de visualización |
| `statchanneldefaults [mechanism] [minutes] [style]` | | Gestionar canales | Establece los valores por defecto de los canales de estadísticas nuevos |
| `statchanneltypes [category]` | | Nadie | Explora todos los contadores con un ejemplo, opcionalmente por categoría |
| `statchannellist` | `scl` | Nadie | Lista los canales de estadísticas de este servidor con tipo, estilo, modo y plantilla |
| `statchannelremove #voice` | `statchrm` | Gestionar canales | Deja de registrar un canal |

`statchannelcreate` también necesita que el bot tenga Gestionar canales. Los equivalentes con barra están bajo `/statchannel`.

## Consejos y trampas habituales

- El bot necesita Gestionar canales para renombrar o recrear un canal.
- Un canal de voz solo puede ser un canal de estadísticas. Añadirlo dos veces falla con "already a stat channel".
- Los contadores de contar, Minecraft y Twitch necesitan que esas funciones estén configuradas antes. Los objetivos de contar y Minecraft se eligen en el panel; no hay comando para ellos.
- `statchannelremove` solo deja de registrar el canal. Elimina tú mismo el canal de voz si ya no lo quieres.
- Los valores en vivo como los espectadores de Twitch o los tickets abiertos siguen igualmente el intervalo propio del canal. Reduce el intervalo en esos canales en lugar de en todos.
- Los estilos `Percent` y `ProgressBar` usan la meta objetivo propia del canal. Aplicarlos a un contador sin meta muestra siempre cero.
