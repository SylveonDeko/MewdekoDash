---
title: Moderación
slug: moderation
summary: Advierte, silencia, aísla temporalmente, expulsa y banea miembros, escala los castigos automáticamente a medida que se acumulan las advertencias y controla cuántos días de mensajes elimina un baneo.
icon: fa-flag
category: Security
dashboard: /dashboard/moderation
module: Moderation
tags: [moderation, warn, warnings, warn punish, punishment ladder, mute, mute role, timeout, ban, softban, kick, ban purge, ban prune, purge, prune, dehoist, warnlog, moderación, advertencias, escalera de castigos, silenciar, rol de silenciado, aislamiento temporal, banear, expulsar, limpieza de bans, purgar]
related: [administration, filter, logging, auditlog]
---

## Qué hace

Moderación es la caja de herramientas que el staff usa con miembros concretos. Las advertencias son su núcleo: un moderador ejecuta `warn @user reason`, el miembro recibe un MD con el motivo y quién lo advirtió, la advertencia se guarda y, si el servidor tiene un canal de registro de advertencias, allí llega un embed con el número de advertencias y cualquier castigo que se haya activado.

Las advertencias se acumulan. Puedes construir una escalera de castigos para que, al alcanzar cierto número de advertencias activas, se active algo automáticamente: un silencio, un aislamiento temporal, una expulsión, un baneo o un rol. El staff no tiene que recordar las reglas; el bot las aplica en el momento en que se alcanza el recuento. Las advertencias se pueden perdonar más tarde, o configurarse para que caduquen solas tras un número de días.

Alrededor de eso están las acciones directas: silenciar (con un rol de silenciado gestionado), aislamiento temporal, expulsión, softban, baneo, baneo temporal, expulsión masiva, purga de mensajes y limpieza de apodos para los miembros que se colocan al principio de la lista con caracteres especiales. Cada acción de baneo también tiene una purga configurable, que es el número de días de mensajes del miembro que Discord elimina junto con el baneo.

La página del panel cubre las advertencias, la escalera de castigos, el canal de registro de advertencias y los ajustes de limpieza de bans. Las acciones directas como silenciar, expulsar y banear son solo mediante comandos.

## Por qué usarlo

- Quieres una política coherente de "tres avisos" que se aplique igual sin importar qué moderador esté de turno.
- Necesitas silenciar a miembros rápidamente sin tocar a mano los permisos de los canales.
- Entró un spammer y quieres que se borre su último día de mensajes con el baneo, pero un baneo temporal a un habitual no debería borrar su historial.
- El staff necesita un registro con búsqueda de quién fue advertido, por quién y por qué, que sobreviva a los cambios de moderadores.
- Nombres como "!!! xXx" siguen subiendo al principio de la lista de miembros y quieres limpiarlos de una sola vez.

## Advertencias

`warn <user> [reason]` requiere Banear miembros. El bot intenta primero enviar por MD al miembro un embed con el nombre del servidor, el moderador y el motivo. Si el MD falla, la confirmación en el canal lleva un pie de página que lo indica. Después la advertencia se guarda con el nombre del moderador y el motivo, o `-` si no se indicó ninguno.

El miembro debe estar por debajo del moderador en la jerarquía de roles, y por debajo del bot. Si no es así, el comando se niega.

`warnlog <user>` muestra una lista paginada, nueve por página, con la fecha, el moderador y el motivo. Las advertencias perdonadas aparecen tachadas con quién las borró. `warnlogall` lista a todos los miembros con advertencias como `activas (total - perdonadas)`.

`warnclear <user> [index]` marca advertencias como perdonadas. Sin índice, o con `0`, las perdona todas. Con un índice perdona solo esa, numerada como en `warnlog`. Las advertencias perdonadas permanecen en el registro pero dejan de contar para los castigos. El panel también puede eliminar una advertencia por completo, lo que la borra de forma permanente.

### Caducidad de advertencias

`warnexpire <days> <clear|delete>` define cuánto tiempo cuenta una advertencia. Los días pueden ser de 0 a 366; 0 desactiva la caducidad. La acción decide qué ocurre cuando una advertencia envejece:

| Acción | Qué ocurre |
| --- | --- |
| Clear | La advertencia se marca como perdonada y permanece en el registro |
| Delete | La advertencia se elimina de la base de datos |

La caducidad se comprueba cada doce horas, y una vez de inmediato cuando la configuras.

### El canal de registro de advertencias

Defínelo con `setwarnchannel #channel` o con el selector **Canal de registro de advertencias** de la pestaña Castigos del panel. Cada advertencia publica allí un embed con el nombre y el ID del miembro, su número de advertencia actual, el castigo que se activó (o "None"), el motivo y un enlace al mensaje que emitió la advertencia.

## Castigos por advertencias

La escalera es una lista de reglas del tipo "con N advertencias activas, hacer X". Cuando se emite una advertencia, el bot cuenta las advertencias activas del miembro, incluida la nueva, y busca una regla con exactamente ese número. Solo se activa una coincidencia exacta, así que un miembro con una regla en 3 que de algún modo llega a 4 sin una regla en 4 no recibe nada adicional.

Define una regla con `warnpunish <number> <punishment> [time]`, o `warnpunish <number> addrole <role> [time]` para la variante de rol. `warnpunish <number>` sin nada más quita la regla. `warnpunishlist` muestra la escalera.

| Castigo | ¿Con duración? | Qué hace |
| --- | --- | --- |
| Mute | Opcional | Aplica el rol de silenciado, o un silencio temporal si se indica un tiempo |
| ChatMute | Opcional | Solo el rol de silenciado, sin silencio de voz |
| VoiceMute | Opcional | Solo silencio de voz del servidor |
| Timeout | Obligatoria, hasta 28 días | Aislamiento temporal de Discord |
| Kick | No | Expulsa al miembro |
| Softban | No | Banea y desbanea de inmediato para borrar mensajes |
| Ban | Opcional | Baneo permanente, o baneo temporal si se indica un tiempo |
| AddRole | Opcional | Añade el rol elegido, que se quita de nuevo tras el tiempo si se indica |
| RemoveRoles | No | Quita todos los roles del miembro |

Los tiempos se guardan en minutos y pueden llegar hasta 49 días. Softban, Kick y RemoveRoles rechazan un tiempo. Timeout se niega a guardarse sin uno. Los castigos se ejecutan con el motivo "Warned too many times."

En el panel, la misma escalera está en la pestaña **Castigos**: elige **En la advertencia n.º**, un **Castigo**, una **Duración (minutos)** opcional y un **Rol a añadir** para el castigo de rol; después pulsa **Añadir a la escalera**. Guardar una regla en un recuento que ya tiene una la reemplaza.

> [!EXAMPLE]
> `warnpunish 2 mute 1h`, `warnpunish 3 timeout 1d`, `warnpunish 5 ban`. Con dos advertencias, silencio de una hora; con tres, aislamiento temporal de un día; con cinco, baneo.

## Mini advertencias

Existe una segunda vía de advertencias, independiente, llamada mini advertencias, pensada para infracciones menores gestionadas por staff júnior. `mwarn` solo requiere Silenciar miembros en lugar de Banear miembros. Tiene su propio registro (`mwarnlog`, `mwarnlogall`), su propio comando de borrado, su propia caducidad, su propia escalera de castigos (`mwarnpunish`) y su propio canal de registro (`setmwarnchannel`). Las mini advertencias nunca cuentan para la escalera principal y viceversa. El panel no muestra las mini advertencias.

## Silencios y el rol de silenciado

El bot gestiona un rol de silenciado. Por defecto se llama `Mewdeko-mute`; cámbialo con `muterole @role`, o ejecuta `muterole` solo para ver el actual. La primera vez que se necesita un silencio, el bot crea el rol si no existe y luego recorre todos los canales de texto y añade una excepción que deniega Enviar mensajes, Añadir reacciones, Adjuntar archivos, Enviar mensajes en hilos y Crear hilos públicos. Los hilos se omiten. Esto puede tardar un momento en servidores con muchos canales.

| Comando | Efecto |
| --- | --- |
| `mute` | Silencio completo: añade el rol de silenciado |
| `chatmute` | Añade solo el rol de silenciado |
| `voicemute` | El servidor silencia al miembro solo en voz |
| `stfu` | Deniega Enviar mensajes a ese miembro solo en el canal actual, mediante una excepción de permisos |

Cada uno tiene una forma con duración. Los silencios completos van de un minuto hasta 90 días; los silencios de chat y de voz, de un minuto hasta 49 días. `stfu` con un tiempo levanta la excepción cuando termina el tiempo. Los miembros silenciados reciben un MD al ser silenciados y al dejar de estarlo.

`removeonmute y` hace que un silencio completo también quite los demás roles del miembro y los guarde, y `unmute` se los devuelve. `removeonmute n` lo desactiva. `unmuteall` quita el rol de silenciado a todos los que lo tengan tras una confirmación, opcionalmente con un motivo.

## Aislamientos temporales

`timeout <time> <user> [reason]` usa el aislamiento temporal nativo de Discord, hasta 28 días. Tanto tú como el bot necesitáis Moderar miembros. `untimeout <user>` lo levanta. El motivo va al registro de auditoría como `moderador | motivo`.

## Baneos, expulsiones y softbans

`ban <user> [reason]` envía primero un MD al miembro y luego banea. `ban <time> <user> [reason]` es un baneo temporal que se levanta solo, hasta 49 días. `ban <pruneTime> <time> <user>` define explícitamente la ventana de purga y la duración del baneo. Banear por ID funciona para personas que no están en el servidor. `unban <user or id>` lo revierte.

`softban <user> [reason]` banea y desbanea de inmediato, lo que es una expulsión que además borra los mensajes recientes. `kick <user> [reason]` expulsa, y `masskick @a @b @c` expulsa a varias personas a la vez e informa de cuántas se lograron. `masskill` es solo para el propietario del bot y banea en masa una lista pegada de IDs.

### El MD de baneo

El mensaje enviado a un miembro baneado se puede personalizar con `banmessage <text or embed code>`. El texto pasa por el analizador de embeds, así que sirve cualquier cosa del constructor de embeds. Ponlo en `-` para no enviar ningún MD, y usa `banmsgreset` para volver al predeterminado. `banmsgtest [duration] [reason]` te envía la plantilla actual para que puedas verla.

| Marcador | Valor |
| --- | --- |
| `%ban.mod%` | El nombre completo del moderador |
| `%ban.mod.name%` | El nombre de usuario del moderador |
| `%ban.user%` | El nombre completo del miembro baneado |
| `%ban.user.name%` | El nombre de usuario del miembro baneado |
| `%ban.reason%` o `%reason%` | El motivo, o `-` si no hay |
| `%ban.duration%` | La duración como `d.hh:mm`, o `perma` |

Los marcadores del servidor, como `%server.name%`, también funcionan aquí.

## Limpieza de bans

Cada baneo lleva una purga: el número de días de mensajes del miembro que Discord elimina con él, de 0 a 7. En lugar de un número global, cada tipo de baneo tiene su propio valor predeterminado, y puedes sobrescribir cualquiera para todo el servidor, para una categoría o para un solo canal.

| Acción | Clave | Valor integrado por defecto |
| --- | --- | --- |
| Baneo | `ban` | 7 días |
| Baneo por ID | `hackban` | 7 días |
| Baneo temporal | `tempban` | ninguno |
| Softban | `softban` | 7 días |
| Baneo masivo | `massban` | 7 días |
| Baneo por hash de avatar | `banbyhash` | ninguno |
| Baneo en rol | `baninrole` | ninguno |
| Baneo por antigüedad | `banunder` | ninguno |
| Castigo por advertencias | `warnpunish` | ninguno |
| Rol de baneo automático | `autobanrole` | ninguno |
| Monitor de roles | `rolemonitor` | ninguno |
| Filtro | `filter` | ninguno |
| Bloqueo | `lockdown` | ninguno |
| Panel | `dashboard` | ninguno |

Cuando ocurre un baneo, el bot busca el ajuste más específico: el canal donde se ejecutó el comando, luego la categoría de ese canal y después el valor predeterminado del servidor. Dentro de cada nivel, un ajuste para la acción exacta tiene prioridad sobre uno definido para "todas las acciones". Si nada coincide, se aplica el valor integrado.

`banprune` muestra qué purgaría un baneo desde el canal actual, además de todos los ajustes configurados. `banpruneset <action|all> <days> [#channel or category]` define uno, `banpruneclear <action|all> [#channel or category]` quita uno y `banprunereset` los borra todos.

La pestaña **Limpieza de bans** del panel lista cada acción en **Valores predeterminados del servidor** con una casilla de días para cada una, una fila de respaldo **Todas las acciones** y una sección **Excepciones** donde eliges un **Ámbito** (Canal o Categoría), el destino, una **Acción** y la **Limpieza (días)**.

## Purga de mensajes

`purge [count] [flags]` elimina hasta 1000 mensajes en el canal actual. Sin recuento, elimina los últimos 100 mensajes del propio bot. `purge @user [count]` elimina solo los mensajes de ese miembro de las últimas dos semanas. Las opciones se pueden combinar: `-s` omite los mensajes fijados, `-nb` omite los bots, `-ob` solo bots, `-he` solo mensajes con embeds, `-ne` solo sin ellos, `-c text` solo mensajes que contengan el texto, `-b date` antes de una fecha y `-a date` después de una.

`purgeuser <user> <count>` busca los últimos `count` mensajes (de 1 a 1000) de cada canal de texto y elimina los mensajes de ese usuario en cada uno.

## Apodos

`dehoist <user>` y `sanitize <user>` reescriben el apodo de un miembro para quitar los caracteres especiales o inusuales del principio. `dehoistall [nicksOnly]` y `sanitizeall` lo hacen para todos tras una confirmación, ejecutándose como una tarea en segundo plano; `massnickprogress` informa de cuánto ha avanzado y `massnickstop` la cancela. Los comandos para un solo miembro requieren que el bot tenga Gestionar apodos; las variantes "all" requieren que el bot tenga Administrador. En ambos casos, el rol del bot debe estar por encima de los miembros afectados.

## Ajustes

La página del panel tiene cinco pestañas: **Resumen** (recuentos de advertencias), **Advertencias**, **Castigos**, **Actividad reciente** y **Limpieza de bans**.

| Ajuste | Por defecto | Qué controla |
| --- | --- | --- |
| Canal de registro de advertencias | ninguno | Canal que recibe un embed por cada advertencia |
| Escalera de castigos | vacía | Qué se activa en cada recuento de advertencias |
| Caducidad de advertencias | desactivada | Días hasta que una advertencia se perdona o se elimina, solo con comandos |
| Rol de silenciado | `Mewdeko-mute` | El rol aplicado por los comandos de silencio, solo con comandos |
| Quitar roles al silenciar | desactivado | Quita y restaura roles alrededor de un silencio completo, solo con comandos |
| Plantilla del MD de baneo | embed predeterminado | El MD que recibe un miembro baneado, solo con comandos |
| Valores de limpieza de bans | por acción | Días de mensajes eliminados con cada tipo de baneo |
| Excepciones de limpieza de bans | ninguna | Purga por canal o por categoría |

En la pestaña **Advertencias**, el staff puede advertir a un miembro por ID de usuario con un motivo obligatorio, buscar por ID, motivo o moderador, ocultar las advertencias perdonadas, perdonar una advertencia, perdonar todas las de un miembro o eliminar una de forma permanente.

> [!WARNING]
> Eliminar una advertencia desde el panel la borra para siempre y deja de contar. Perdonar conserva el registro y también hace que deje de contar. Perdona, a menos que tengas un motivo para borrar el historial.

## Guía de configuración

1. Abre **Moderación** en el panel y ve a **Castigos**.
2. Elige un **Canal de registro de advertencias** que solo el staff pueda leer.
3. Añade reglas a la escalera. Un comienzo suave es Mute durante 60 minutos con 2, Timeout durante 1440 minutos con 3 y Ban con 5.
4. Ejecuta `muterole @Muted` si ya tienes un rol de silenciado; si no, deja que el bot cree `Mewdeko-mute` la primera vez que se use.
5. Decide la caducidad con `warnexpire 90 clear` para que las advertencias antiguas dejen de contar tras tres meses.
6. En **Limpieza de bans**, pon **Baneo temporal** en 0 si no quieres que los baneos temporales borren el historial, y añade excepciones de canal si un canal de spam de bots debería purgar más.
7. Prueba con una cuenta alt: `warn @alt test`, revisa el canal de registro y luego `warnclear @alt`.

## Comandos

Ejecútalos con el prefijo de tu servidor (`.` salvo que lo hayas cambiado).

| Comando | Alias | Requiere | Para qué sirve |
| --- | --- | --- | --- |
| `warn <user> [reason]` | | Banear miembros | Advertir a un miembro y aplicar cualquier castigo de la escalera |
| `warnlog <user or id>` | | Banear miembros | Mostrar las advertencias de un miembro |
| `warnlogall` | | Banear miembros | Mostrar los recuentos de advertencias de todos |
| `warnclear <user> [index]` | `warnc` | Banear miembros | Perdonar todas las advertencias, o una por número |
| `warnexpire <days> <clear|delete>` | `warne` | Administrador | Perdonar o eliminar advertencias automáticamente tras un número de días |
| `warnpunish <number> <punishment> [time]` | `warnp` | Banear miembros | Definir una regla de la escalera, o quitarla si solo se indica un número |
| `warnpunishlist` | `warnpl` | Nadie | Mostrar la escalera de castigos |
| `setwarnchannel <#channel>` | `warnchannel` | Administrador | Definir el canal de registro de advertencias |
| `mwarn <user> [reason]` | `miniwarn` | Silenciar miembros | Emitir una mini advertencia |
| `mwarnlog [page] [user or id]` | | Silenciar miembros, o Nadie para las propias | Mostrar mini advertencias |
| `mwarnlogall` | `mwarnlogs` | Silenciar miembros | Recuentos de mini advertencias de todos |
| `mwarnclear <user or id> [index]` | `mwarnc` | Administrador | Perdonar mini advertencias |
| `mwarnexpire <days> [clear|delete]` | `mwarne` | Administrador | Caducidad de mini advertencias |
| `mwarnpunish <number> <punishment> [time]` | `mwarnp` | Administrador | Definir o quitar una regla de la escalera de mini advertencias |
| `mwarnpunishlist` | `mwarnplist`, `mwarnpl` | Nadie | Mostrar la escalera de mini advertencias |
| `setmwarnchannel <#channel>` | `mwarnchannel` | Administrador | Definir el canal de registro de mini advertencias |
| `timeout <time> <user> [reason]` | | Moderar miembros | Aislar temporalmente a un miembro, hasta 28 días |
| `untimeout <user>` | | Moderar miembros | Quitar un aislamiento temporal |
| `mute <user> [time] [reason]` | | Gestionar roles o Silenciar miembros | Silencio completo, opcionalmente con duración |
| `unmute <user> [reason]` | | Gestionar roles o Silenciar miembros | Quitar un silencio completo |
| `chatmute [time] <user> [reason]` | | Gestionar roles | Solo el rol de silenciado |
| `chatunmute <user> [reason]` | | Gestionar roles | Quitar un silencio de chat |
| `voicemute [time] <user> [reason]` | | Silenciar miembros | Solo silencio de voz |
| `voiceunmute <user> [reason]` | | Silenciar miembros | Quitar un silencio de voz |
| `stfu [time] <user>` | `cmute`, `channelmute` | Silenciar miembros | Denegar el envío solo en el canal actual |
| `unstfu <user>` | `unchannelmute` | Silenciar miembros | Deshacer `stfu` |
| `muterole [role]` | `setmuterole` | Gestionar roles | Mostrar o definir el rol de silenciado |
| `removeonmute <y|n>` | | Administrador | Quitar y restaurar roles alrededor de los silencios completos |
| `unmuteall [reason]` | `umall` | Administrador | Quitar el silencio a todos los que tengan el rol de silenciado |
| `kick <user or id> [reason]` | `k` | Expulsar miembros | Expulsar a un miembro |
| `masskick <users...>` | `mkick` | Expulsar miembros | Expulsar a varios miembros |
| `ban [time] <user or id> [reason]` | `b` | Banear miembros | Banear, o baneo temporal de hasta 49 días |
| `unban <user or id>` | | Banear miembros | Levantar un baneo |
| `softban <user or id> [reason]` | `sb` | Expulsar miembros y Gestionar mensajes | Banear y desbanear para borrar mensajes |
| `banmessage [text]` | `banmsg`, `bantemplate`, `bantemp` | Banear miembros | Mostrar o definir el MD de baneo, `-` para desactivarlo |
| `banmsgreset` | | Banear miembros | Restaurar el MD de baneo predeterminado |
| `banmsgtest [time] [reason]` | | Banear miembros | Enviarte por MD la plantilla de baneo |
| `masskill <ids and reasons>` | | Propietario del bot | Baneo masivo de una lista pegada |
| `banprune` | `banpurge` | Banear miembros | Mostrar los ajustes de purga efectivos y configurados |
| `banpruneset <action|all> <days> [channel]` | `banpurgeset` | Administrador | Definir un ajuste de purga |
| `banpruneclear <action|all> [channel]` | `banpurgeclear` | Administrador | Quitar un ajuste de purga |
| `banprunereset` | `banpurgereset` | Administrador | Quitar todos los ajustes de purga |
| `purge [count or user] [count] [flags]` | `clear`, `prune` | Gestionar mensajes | Eliminar mensajes en masa en este canal |
| `purgeuser <user> <count>` | `pruneuser` | Gestionar mensajes | Eliminar los mensajes de un usuario en todos los canales |
| `dehoist <user>` | | Gestionar apodos | Corregir un apodo elevado |
| `dehoistall [nicksOnly]` | `dehoista` | Gestionar apodos | Corregir todos los apodos elevados |
| `sanitize <user>` | | Gestionar apodos | Normalizar un apodo |
| `sanitizeall` | `sanitizea` | Gestionar apodos | Normalizar todos los apodos |
| `massnickprogress` | `mnickprogress`, `mnp` | Administrador | Progreso de un dehoist o sanitize en curso |
| `massnickstop` | `mnstop`, `mns` | Administrador | Detener un dehoist o sanitize en curso |

## Consejos y advertencias

- El rol del bot debe estar por encima de cualquiera a quien silencie, expulse o banee, y por encima del propio rol de silenciado. La mayoría de los errores de "no se puede aplicar el castigo" son problemas de jerarquía.
- El bot necesita Banear miembros, Expulsar miembros, Moderar miembros, Gestionar roles y Gestionar mensajes para los comandos correspondientes; cada comando comprueba el permiso del propio bot antes de ejecutarse.
- La escalera solo se activa con un recuento exacto. Rellena todos los pasos que te importen en lugar de asumir "3 o más".
- Solo cuentan las advertencias emitidas mediante el bot. Los aislamientos y baneos propios de Discord no añaden advertencias.
- El rol de silenciado deniega permisos por canal. Los canales creados después de que exista el rol reciben la excepción la próxima vez que alguien sea silenciado, no de inmediato.
- Discord solo permite que el borrado en masa llegue hasta 14 días atrás. Los comandos de purga omiten los mensajes más antiguos.
- Discord limita la purga al banear a 7 días, sin importar lo que configures.
- Las advertencias desde el panel necesitan un motivo válido y usan tu cuenta del panel como nombre del moderador.
