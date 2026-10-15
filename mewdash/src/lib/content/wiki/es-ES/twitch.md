---
title: Bot de Twitch
slug: twitch
summary: Usa Mewdeko dentro de tu propio chat de Twitch con comandos personalizados, temporizadores, citas y contadores, y lleva a Discord las suscripciones, raids, canjes de puntos del canal y eventos de directo.
icon: fa-brands fa-twitch
category: Community
dashboard: /dashboard/twitch
module: Twitch
tags: [twitch, chat bot, streamer, commands, timers, quotes, counters, channel points, redemptions, subs, raids, account link, role sync, eventsub, bot de chat, comandos, temporizadores, citas, contadores, puntos del canal, canjes, suscripciones, vincular cuenta, sincronizar roles]
related: [streams, administration]
---

## Qué hace

El bot de Twitch conecta un canal de Twitch con tu servidor de Discord y permite que Mewdeko actúe como bot de chat dentro de ese canal. Los espectadores escriben `!ping`, `!quote`, `!counter deaths` o tus propios comandos personalizados en el chat de Twitch, y el bot responde allí. Los temporizadores publican mensajes repetitivos mientras estás en directo, las citas y los contadores se guardan por servidor, y las recompensas de puntos del canal pueden activar una respuesta en el chat o una publicación en Discord.

Los eventos del canal vuelven a Discord. Cuando el canal empieza el directo, se envía una publicación de inicio de directo a un canal de Discord; las suscripciones, las suscripciones regaladas y los raids pueden publicar cada uno en su propio canal con tu propia plantilla, y un resumen al final del stream puede recoger la duración, el pico de espectadores, los mensajes del chat, las suscripciones y los raids.

Los espectadores pueden vincular su cuenta de Twitch con su cuenta de Discord. Una vez vinculada, el bot sabe qué miembro de Discord está chateando en Twitch, y la sincronización de roles puede dar roles de Discord a suscriptores, VIP, mods o al streamer.

> [!NOTE]
> Esto no es lo mismo que Alertas de stream. Alertas de stream solo vigila canales públicos de varias plataformas y avisa cuando empiezan un directo. El bot de Twitch necesita que autorices tu propia cuenta de Twitch y le da al bot presencia en tu chat. Si ambos están configurados para el mismo canal de Twitch, la publicación de directo del bot de Twitch sustituye a la de Alertas de stream para que no haya duplicados.

## Por qué usarlo

- Haces streams en Twitch y quieres un solo bot para tu Discord y tu chat de Twitch, con los mismos comandos personalizados y redes sociales en ambos sitios.
- Quieres celebrar en Discord las suscripciones y los raids al momento.
- Quieres roles de suscriptor o VIP en Discord sin repartirlos a mano.
- Quieres que una recompensa de puntos del canal de hidratarse o estirarse diga algo de verdad en el chat y quede registrada en Discord.
- Tus mods necesitan un comando de shoutout, un selector de objetivo de raid y una lista de citas que sobreviva entre streams.

## Conexión

Intervienen dos autorizaciones de Twitch, ambas desde la pestaña **Configuración**, subpestaña **Conectar**.

| Autorización | Quién la hace | Qué concede |
| --- | --- | --- |
| Cuenta del bot | Solo el propietario del bot | La cuenta de Twitch con la que chatea el bot. Scopes `user:read:chat`, `user:write:chat`, `user:bot`. Una identidad compartida para todos los servidores. |
| Canal del streamer | Tú, el streamer | Acceso a los eventos de tu canal. Scopes `channel:bot`, suscripciones, bits, canjes, encuestas, predicciones, gestión de la emisión, edición de clips y moderación. |

La integración se considera configurada cuando existe una cuenta de bot, tu canal está autorizado y la configuración está activada. El panel **Estado** muestra el transporte (WebSocket de EventSub o IRC heredado), el último evento recibido, la caducidad del token de ambas cuentas y, en **Diagnóstico avanzado**, los permisos (scopes) que faltan y las suscripciones de EventSub guardadas.

Desconectar el canal elimina tu autorización y desactiva la integración. La cuenta del bot solo puede desconectarla un propietario del bot.

## Comandos de chat en Twitch

Cada canal conectado recibe estos comandos integrados. El prefijo es `!` por defecto y se puede cambiar, hasta cinco caracteres. Los comandos personalizados solo se buscan cuando ningún comando integrado coincide con el nombre.

| Comando | Quién puede usarlo | Qué hace |
| --- | --- | --- |
| `!ping` | Todos | Responde con un pong |
| `!uptime` | Todos | Cuánto tiempo lleva en marcha el proceso del bot |
| `!commands` | Todos | Enumera los comandos integrados y los personalizados activados |
| `!discord` | Todos | Muestra qué cuenta de Discord está vinculada a quien lo usa |
| `!link` | Todos | Genera un código de reclamación de seis dígitos para vincular cuentas |
| `!rank` | Todos | Muestra el rango resuelto de quien lo usa |
| `!stream` | Todos | Estado en directo, título, categoría, espectadores y tiempo en directo, o «offline» |
| `!schedule` | Todos | Publica el mensaje de horario definido por el personal |
| `!socials` | Todos | Publica el mensaje de redes sociales definido por el personal |
| `!quote [id]` | Todos | Una cita aleatoria, o una concreta por su número |
| `!quote add <text> [-- author]` | Mod | Guarda una cita, opcionalmente con un autor después de `--` |
| `!quote remove <id>` | Mod | Elimina una cita (`delete` también funciona) |
| `!counter <name>` | Todos | Muestra el valor de un contador |
| `!counter <name> +` | Mod | Suma uno (`++` o `add` también funcionan); `-`, `--` o `sub` restan uno; `reset` lo pone a 0; un número lo fija directamente |
| `!so <user>` | Mod | Hace un shoutout a otro canal de Twitch |
| `!raidtarget` | Mod | Sugiere un canal aleatorio de la lista de objetivos de raid |

### Rangos

El rango de un chatter viene de sus insignias de Twitch. Streamer es el más alto, luego Mod, VIP, Suscriptor (las insignias de fundador cuentan como suscriptor) y después Todos. Los comandos, los comandos personalizados y la sincronización de roles comparan con este orden, así que un Mod puede ejecutar cualquier cosa definida para VIP, Suscriptor o Todos.

## Comandos personalizados

Los comandos personalizados se añaden en el panel en **Comandos**, **Comandos personalizados**, o con `/twitch commands add`. Los nombres se pasan a minúsculas, pueden tener hasta 32 caracteres y pueden contener letras, dígitos, guiones y guiones bajos. Cada comando tiene un **Permiso** (Everyone, Subscriber, Vip, Mod, Broadcaster), un valor de **Segundos de enfriamiento** de 0 a 86400, un interruptor **Activado** y una **Respuesta**. El enfriamiento es compartido por todo el canal, no por usuario. Los usos se contabilizan y se muestran en la lista.

El panel también tiene un campo **Argumentos de prueba** y una vista previa para que veas la respuesta generada antes de guardar.

### Marcadores en las respuestas

| Marcador | Valor |
| --- | --- |
| `%user%` | El login de Twitch del chatter |
| `%display%` | El nombre visible del chatter |
| `%channel%` | El login de tu canal de Twitch |
| `%args%` | Todo lo escrito después del nombre del comando |
| `%target%` | La primera palabra después del nombre del comando |
| `%discord%` | El ID de usuario de Discord vinculado del chatter, o vacío |
| `%random:a\|b\|c%` | Una opción elegida al azar |
| `%count:name%` | Valor actual del contador indicado |
| `%stream%` | El mismo resumen que da `!stream` |

> [!EXAMPLE]
> `!hug` con la respuesta `%display% hugs %target%! That is hug number %count:hugs%.`

## Temporizadores

Los temporizadores publican un mensaje en el chat de Twitch según un horario. Se gestionan en **Comandos**, **Temporizadores**, o con `/twitch timers`.

| Ajuste | Por defecto | Qué controla |
| --- | --- | --- |
| Nombre del temporizador | | Mismas reglas de nombres que los comandos |
| Minutos de intervalo | 10 | De 1 a 1440 minutos entre publicaciones |
| Mínimo de mensajes en el chat | 5 | Mensajes de chat que deben llegar desde la última publicación antes de volver a publicar; 0 desactiva la comprobación |
| Solo en directo | activado | Solo publica mientras el canal está en directo |
| Rotación aleatoria | desactivado | Elige una línea aleatoria en lugar de recorrerlas en orden |
| Activado | activado | Si el temporizador se ejecuta |
| Mensajes | | Un mensaje por línea |

El planificador revisa los temporizadores cada 30 segundos. Las líneas de los temporizadores admiten `%channel%`, `%url%`, `%stream%`, `%count:name%` y `%random:a|b|c%`. `/twitch timers test` (o el botón de prueba del panel) publica un temporizador al instante.

## Citas y contadores

Las citas se guardan con su texto, un autor opcional y quién las añadió. La subpestaña **Citas** del panel permite al personal añadirlas, buscarlas y eliminarlas; los espectadores usan `!quote`. Los contadores son enteros con nombre que los mods aumentan desde el chat; el personal puede fijar valores con `/twitch commands counter-set` y listarlos con `counter-list`.

## Eventos hacia Discord

La pestaña **Eventos**, subpestaña **Alertas**, contiene los ajustes de suscripciones, raids y puntos del canal. La publicación de inicio de directo está en **Configuración**, **Ajustes del bot**, **Enrutamiento de eventos**.

### Inicio de directo y fin de directo

Cuando el canal empieza el directo, el bot publica en el **Canal de Discord para directos**. Sin **Mensaje de directo**, envía un embed predeterminado: el nombre del streamer enlazado al canal, el título como línea de autor, el estado, el número de espectadores, la categoría y una imagen de vista previa. Un mensaje personalizado pasa por el creador de embeds, así que funcionan embeds completos y componentes. Cuando el canal termina el directo, se publica en el mismo canal un breve embed rojo de «Offline».

| Marcador | Valor |
| --- | --- |
| `%streamer%` | El nombre visible del streamer |
| `%title%` | Título del stream |
| `%game%` | Nombre de la categoría |
| `%url%` | `https://twitch.tv/<channel>` |
| `%viewers%` | Número actual de espectadores |

### Suscripciones y raids

Son mensajes de texto sin formato. Mensaje de suscripción por defecto: `%display% subscribed to %channel%!`, o `%display% received a gifted sub on %channel%!` para regalos. Mensaje de raid por defecto: `%raider% raided %channel% with %viewers% viewers!`.

| Evento | Marcadores |
| --- | --- |
| Suscripción | `%user%`, `%display%`, `%channel%`, `%tier%` |
| Raid | `%raider%`, `%channel%`, `%viewers%` |

Cada alerta tiene un botón **Enviar prueba** en el panel, y la lista **Historial de eventos** muestra los eventos recientes y los envíos de prueba.

### Acciones de puntos del canal

En **Acciones de puntos del canal**, asocia un **Título de la recompensa** (que se compara sin distinguir mayúsculas) con una **Respuesta en Twitch**, un **Canal de Discord** con un **Mensaje de Discord**, o ambos. Marcadores: `%user%`, `%display%`, `%channel%`, `%reward%`, `%input%` (lo que escribió el espectador) y `%url%`.

### Resumen del stream

`/twitch events recap-channel` define un canal que recibe un embed cuando termina el stream: duración, pico de espectadores, mensajes del chat, suscripciones, raids, y el último título y categoría. Los resúmenes no están en el panel.

## Vinculación de cuentas y sincronización de roles

Hay dos formas de vincular a un miembro de Discord con un login de Twitch:

1. Por cuenta propia: el espectador escribe `!link` en el chat de Twitch, recibe un código de seis dígitos y ejecuta `/twitch claim <code>` en Discord en un plazo de diez minutos.
2. Por el personal: la pestaña **Vínculos de cuentas** o `/twitch links add @user twitchlogin`.

Un login de Twitch por miembro de Discord y servidor. Una vez vinculado, `%discord%` se rellena para ese espectador y se aplica la sincronización de roles.

La sincronización de roles asocia un rango de Twitch con un rol de Discord mediante `/twitch rolesync add`. Cada vez que un espectador vinculado envía un mensaje al chat, el bot añade el rol si su rango es igual o superior al asociado y lo quita si es inferior. La sincronización de roles solo está disponible mediante comandos de barra.

## Herramientas en vivo

La pestaña **Eventos**, subpestaña **Herramientas en vivo**, ofrece acciones de operador del stream que usan la autorización de tu canal: enviar un mensaje al chat como el bot, crear un marcador de stream, crear un clip, iniciar una encuesta (una opción por línea, 60 segundos por defecto) y silenciar con timeout (600 segundos por defecto), banear, desbanear o eliminar un mensaje por ID. `/twitch stream-info` y `/twitch clip` se encargan desde Discord del título, la categoría y el clip.

## Ajustes

En **Configuración**, **Ajustes del bot**:

| Ajuste | Por defecto | Qué controla |
| --- | --- | --- |
| Prefijo de comandos | `!` | Prefijo de los comandos del chat de Twitch, hasta 5 caracteres |
| Idioma personalizado | el del servidor | Etiqueta BCP-47 como `de-DE` usada para las respuestas del bot en el chat |
| Activar el bot de chat de Twitch para este servidor | activado | Interruptor general; al desactivarlo se conserva la configuración |
| Usar EventSub para los eventos del chat | activado | Recibe el chat y los eventos mediante EventSub; si está desactivado, los comandos de chat no se ejecutan |
| Canal de Discord para directos | ninguno | Dónde van las publicaciones de inicio y fin de directo |
| Mensaje de directo | embed predeterminado | Plantilla personalizada con los marcadores de directo |

En **Eventos**, **Alertas**: **Canal de Discord para suscripciones**, **Mensaje de suscripción**, **Canal de Discord para raids**, **Mensaje de raid** y la lista de acciones de puntos del canal.

## Guía de configuración

1. Abre **Bot de Twitch** en el panel. Un propietario del bot debe haber conectado primero la **Cuenta del bot**; la subpestaña **Conectar** muestra si existe una.
2. Haz clic en **Conectar canal** y autoriza con tu propia cuenta de Twitch.
3. En **Ajustes del bot**, define el prefijo, activa **Activar el bot de chat de Twitch para este servidor**, elige un **Canal de Discord para directos** y guarda.
4. En **Comandos**, añade un par de comandos personalizados y un temporizador de redes sociales. Usa **Argumentos de prueba** y la vista previa para comprobar los marcadores.
5. En **Eventos**, **Alertas**, elige los canales de suscripciones y raids y pulsa **Enviar prueba** en cada uno.
6. Escribe `!ping` en tu chat de Twitch para confirmar que el bot escucha, y luego `!link` y `/twitch claim` para vincularte.
7. Opcionalmente, ejecuta `/twitch rolesync add Subscriber @Subs` para que los suscriptores vinculados reciban un rol.

## Comandos

Este módulo solo tiene comandos de barra. Escribe `/twitch` en Discord para verlos. Las respuestas solo las ves tú.

| Comando | Alias | Requiere | Propósito |
| --- | --- | --- | --- |
| `/twitch set <channel> [prefix]` | | Gestionar servidor | Define el canal de Twitch y el prefijo, y activa la integración |
| `/twitch remove` | | Gestionar servidor | Desactiva la integración y sale del canal |
| `/twitch enable` | | Gestionar servidor | Vuelve a activar la integración |
| `/twitch disable` | | Gestionar servidor | La desactiva sin borrar los ajustes |
| `/twitch config` | | Nadie | Muestra el canal, el prefijo, el estado de activación, el canal de directos y el idioma |
| `/twitch claim <code>` | | Nadie | Reclama un código de vinculación de `!link` |
| `/twitch stream-info [title] [category]` | | Gestionar servidor | Actualiza el título o la categoría del stream |
| `/twitch clip` | | Gestionar servidor | Crea un clip del stream actual |
| `/twitch status` | | Gestionar servidor | Resumen del estado: cuentas, tokens, estado de EventSub |
| `/twitch language <tag>` | | Gestionar servidor | Idioma de las respuestas del chat; vacío lo restablece |
| `/twitch prefix <prefix>` | | Gestionar servidor | Cambia el prefijo de los comandos del chat |
| `/twitch commands add <name> <response> [permission] [cooldown]` | | Gestionar servidor | Añade o actualiza un comando personalizado |
| `/twitch commands remove <name>` | | Gestionar servidor | Elimina un comando personalizado |
| `/twitch commands list` | | Nadie | Enumera los comandos personalizados con permiso, enfriamiento y número de usos |
| `/twitch commands counter-set <name> <value>` | | Gestionar servidor | Fija un contador |
| `/twitch commands counter-list` | | Nadie | Enumera los contadores |
| `/twitch commands schedule-set <message>` | | Gestionar servidor | Define la respuesta de `!schedule` |
| `/twitch commands schedule-clear` | | Gestionar servidor | La borra |
| `/twitch commands socials-set <message>` | | Gestionar servidor | Define la respuesta de `!socials` |
| `/twitch commands socials-clear` | | Gestionar servidor | La borra |
| `/twitch timers add <name> <messages> [interval] [minchat] [onlineonly] [randomize]` | | Gestionar servidor | Añade o actualiza un temporizador |
| `/twitch timers remove <name>` | | Gestionar servidor | Elimina un temporizador |
| `/twitch timers list` | | Nadie | Enumera los temporizadores |
| `/twitch timers enable <name>` | | Gestionar servidor | Activa un temporizador |
| `/twitch timers disable <name>` | | Gestionar servidor | Desactiva un temporizador |
| `/twitch timers test <name>` | | Gestionar servidor | Publica un temporizador ahora |
| `/twitch events golive-channel <channel> [message]` | | Gestionar servidor | Define el canal de directos y la plantilla |
| `/twitch events golive-clear` | | Gestionar servidor | Borra el canal de directos |
| `/twitch events sub-channel <channel> [message]` | | Gestionar servidor | Define el canal de suscripciones y la plantilla |
| `/twitch events sub-clear` | | Gestionar servidor | Desactiva las publicaciones de suscripciones |
| `/twitch events raid-channel <channel> [message]` | | Gestionar servidor | Define el canal de raids y la plantilla |
| `/twitch events raid-clear` | | Gestionar servidor | Desactiva las publicaciones de raids |
| `/twitch events recap-channel <channel>` | | Gestionar servidor | Define el canal del resumen del stream |
| `/twitch events recap-clear` | | Gestionar servidor | Desactiva los resúmenes |
| `/twitch links add <@user> <twitchlogin>` | | Gestionar servidor | Vincula a un miembro con un login de Twitch |
| `/twitch links remove <@user>` | | Gestionar servidor | Elimina el vínculo de un miembro |
| `/twitch links list` | | Nadie | Enumera todos los vínculos |
| `/twitch rolesync add <rank> <@role>` | | Gestionar servidor | Da un rol a los espectadores vinculados con un rango igual o superior |
| `/twitch rolesync remove <rank> <@role>` | | Gestionar servidor | Elimina una asociación |
| `/twitch rolesync list` | | Nadie | Enumera las asociaciones |
| `/twitch redemptions add <reward> [twitchreply] [channel] [discordmessage]` | | Gestionar servidor | Añade o actualiza una acción de puntos del canal |
| `/twitch redemptions remove <reward>` | | Gestionar servidor | Elimina una |
| `/twitch redemptions list` | | Nadie | Enumera las acciones |
| `/twitch raidtargets add <twitchlogin> [note]` | | Gestionar servidor | Añade un canal al grupo de `!raidtarget` |
| `/twitch raidtargets remove <twitchlogin>` | | Gestionar servidor | Elimina uno |
| `/twitch raidtargets list` | | Nadie | Enumera los objetivos de raid |

## Consejos y advertencias

- La cuenta del bot es compartida por todos los servidores del bot. Si nadie ha conectado una, no se pueden enviar respuestas al chat, hagas lo que hagas en la configuración.
- Los comandos de chat solo funcionan mientras **Usar EventSub para los eventos del chat** esté activado. Si el panel Estado muestra IRC heredado, vuelve a activarlo.
- El estado en directo también se consulta una vez por minuto, así que una publicación de inicio de directo puede ir hasta un minuto por detrás del inicio real.
- Los enfriamientos de los comandos personalizados son por canal, no por espectador. Un enfriamiento de 30 segundos significa un uso cada 30 segundos para todos.
- La sincronización de roles se ejecuta cuando un espectador vinculado chatea, no con un horario. Un suscriptor que nunca escribe en el chat nunca recibe el rol, y uno que dejó de suscribirse lo conserva hasta que vuelva a chatear.
- Los cambios de rol necesitan que el rol del bot esté por encima del rol sincronizado y Gestionar roles.
- Los rangos desconocidos pasados a `rolesync` se convierten en Subscriber, y los permisos desconocidos pasados a `commands add` se convierten en Everyone.
- Los códigos de vinculación caducan a los diez minutos y generar uno nuevo invalida el anterior.
- Los timeouts y baneos de las Herramientas en vivo usan los scopes de moderación de tu canal, así que aparecen en Twitch como acciones realizadas por la cuenta autorizada.
- El idioma personalizado solo cambia las respuestas del chat de Twitch. Las respuestas de Discord mantienen el idioma del servidor.
