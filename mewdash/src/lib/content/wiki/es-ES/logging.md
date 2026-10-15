---
title: Registros
slug: logging
summary: Envía un registro de entradas, salidas, ediciones, eliminaciones, baneos, cambios de roles y canales y más a los canales de registro que elijas, con enrutamiento por evento y exclusiones de canales.
icon: fa-file
category: Security
dashboard: /dashboard/logging
module: Administration
tags: [logging, logs, audit, events, message deleted, message edited, join leave, mod log, ignored channels, registros, auditoría, eventos, mensaje eliminado, mensaje editado, entradas y salidas, registro de moderación, canales ignorados]
related: [moderation, administration, filter]
---

## Qué hace

Los registros vigilan los eventos que Discord envía al bot y publican un resumen de cada uno en un canal de texto que eliges. Un mensaje eliminado muestra quién lo escribió y qué decía. La entrada de un miembro muestra la antigüedad de su cuenta. Un cambio de roles muestra qué roles se añadieron o quitaron. Cuando el bot puede leer el registro de auditoría, también nombra al miembro del staff que lo hizo.

Cada tipo de evento tiene su propio ajuste de canal, así que puedes enviar las ediciones de mensajes a un canal, las acciones de moderación a otro y dejar el resto desactivado. No se registra nada hasta que asignas un canal, y un tipo de evento cuyo canal está vacío se omite sin avisar.

Los canales también se pueden excluir. Un canal ignorado no genera ningún registro de mensajes, hilos ni voz, lo que mantiene las salas del staff y los canales de spam de bots fuera del registro.

## Por qué usarlo

- Conserva una copia de los mensajes eliminados y editados para que los moderadores puedan ver después qué se quitó.
- Sigue quién entró y salió, incluidas las fechas de creación de las cuentas, para detectar raids y cuentas secundarias.
- Registra baneos, desbaneos y silenciamientos con el moderador responsable para tener rendición de cuentas.
- Vigila los cambios de roles, canales y permisos hechos por otros administradores o por cuentas comprometidas.
- Sigue la actividad de voz en servidores donde los canales de voz son el principal punto de encuentro.

## Tipos de evento de registro

Cada tipo puede apuntar a un canal distinto o dejarse desactivado. Estos son los valores que acepta `log` y que se muestran en el panel.

| Tipo | Etiqueta en el panel | Se registra cuando |
| --- | --- | --- |
| `MessageUpdated` | Mensaje editado | Se edita el contenido de un mensaje (se omiten los autores bot y el contenido sin cambios) |
| `MessageDeleted` | Mensaje eliminado | Se elimina un mensaje |
| `MessagesBulkDeleted` | Mensajes eliminados en bloque | Se purgan varios mensajes a la vez, con el número de los que estaban en caché |
| `ReactionEvents` | Eventos de reacciones | Se añaden o quitan reacciones, agrupadas por mensaje cada cinco segundos |
| `ThreadCreated` | Hilo creado | Se crea un hilo |
| `ThreadDeleted` | Hilo eliminado | Se elimina un hilo |
| `ThreadUpdated` | Hilo actualizado | Cambia el nombre de un hilo, su estado de archivo o algo similar |
| `UsernameUpdated` | Nombre de usuario actualizado | Cambia el nombre de usuario global de un miembro |
| `NicknameUpdated` | Apodo actualizado | Cambia el apodo de un miembro en el servidor |
| `UserUpdated` | Usuario actualizado | Cambia el perfil de un miembro, como el avatar o el nombre global |
| `UserJoined` | Usuario entró | Un miembro entra al servidor |
| `UserLeft` | Usuario salió | Un miembro se va o es expulsado |
| `UserRoleAdded` | Rol añadido a usuario | Se dan uno o más roles a un miembro |
| `UserRoleRemoved` | Rol quitado a usuario | Se quitan uno o más roles a un miembro |
| `UserBanned` | Usuario baneado | Se banea a un miembro |
| `UserUnbanned` | Usuario desbaneado | Se levanta un baneo |
| `UserMuted` | Usuario silenciado | Se silencia a un miembro en voz o en texto |
| `VoicePresence` | Presencia en voz | Un miembro entra, sale, se mueve, se silencia, se ensordece o emite en voz |
| `VoicePresenceTts` | Presencia en voz (TTS) | Es posible que un miembro haya usado texto a voz en voz; la detección es de mejor esfuerzo |
| `ServerUpdated` | Servidor actualizado | Cambian ajustes del servidor como el nombre, el icono o el propietario |
| `EventCreated` | Evento creado | Se crea un evento programado del servidor |
| `InviteCreated` | Invitación creada | Se crea una invitación, con su duración máxima y usos |
| `InviteDeleted` | Invitación eliminada | Se elimina una invitación |
| `RoleCreated` | Rol creado | Se crea un rol |
| `RoleDeleted` | Rol eliminado | Se elimina un rol |
| `RoleUpdated` | Rol actualizado | Cambia el nombre, el color o los permisos de un rol |
| `ChannelCreated` | Canal creado | Se crea un canal |
| `ChannelDestroyed` | Canal eliminado | Se elimina un canal |
| `ChannelUpdated` | Canal actualizado | Cambia el nombre, el tema o los permisos de un canal |
| `Other` | Otros | Eventos varios no cubiertos arriba |

El panel también muestra una entrada **Avatar actualizado**. Se guarda junto a las demás y la establecen las categorías Users y All, pero no es un valor que puedas pasar al comando `log`.

## Categorías

`logcategory` establece de una vez todo un grupo de tipos en un mismo canal. Ejecutarlo sin canal borra todos los tipos de ese grupo.

| Categoría | Tipos que establece |
| --- | --- |
| `All` | Todos los tipos de arriba |
| `Users` | NicknameUpdated, AvatarUpdated, UsernameUpdated, UserRoleAdded, UserRoleRemoved, VoicePresence, UserJoined, UserLeft, UserUpdated |
| `Threads` | ThreadCreated, ThreadDeleted, ThreadUpdated |
| `Roles` | RoleCreated, RoleDeleted, RoleUpdated |
| `Server` | ServerUpdated, EventCreated, InviteCreated, InviteDeleted |
| `Channel` | ChannelCreated, ChannelDestroyed, ChannelUpdated |
| `Messages` | MessageDeleted, MessageUpdated, MessagesBulkDeleted, ReactionEvents |
| `Moderation` | UserMuted, UserBanned, UserUnbanned, Other |
| `None` | Borra todos los tipos (lo usa **Desactivar todo** del panel) |

## Canales ignorados

Cualquier canal de la lista de ignorados se omite para los eventos de mensajes, hilos, canal y voz que ocurran dentro de él. Los hilos heredan el ajuste de su canal padre, así que ignorar un foro o un canal de texto también ignora sus hilos. Ignorar un canal de voz suprime los registros de presencia en voz de las entradas y salidas de ese canal.

Ignorar un canal no detiene los eventos de miembros, roles o servidor, ya que no están vinculados a un canal.

## Ajustes

La página de Registros tiene dos pestañas, **Canales de registros** y **Canales ignorados**.

| Ajuste | Predeterminado | Qué controla |
| --- | --- | --- |
| Canales de registros | ninguno | Un selector de canal por tipo de evento, agrupados en Populares, Usuarios, Mensajes, Moderación, Servidor, Canales, Roles, Hilos, Voz y Todos los eventos |
| Borrar categoría | | Vacía todos los selectores del grupo que estás viendo; surte efecto al **Guardar configuración** |
| Borrar todo | | Se muestra en el grupo **Todos los eventos**; vacía todos los selectores, se aplica al guardar |
| Desactivar todo | | Botón de la cabecera que se muestra mientras haya algún canal establecido; desasigna todos los tipos de evento de inmediato tras una confirmación, conservando los canales ignorados |
| Canales ignorados | ninguno | Canales excluidos del registro, que se mueven entre las listas **Canales activos** y **Canales ignorados** |

> [!TIP]
> El grupo **Populares** contiene Usuario entró, Usuario salió, Mensaje eliminado, Mensaje editado, Usuario baneado, Usuario desbaneado, Canal creado y Canal eliminado. Es un buen conjunto inicial para la mayoría de los servidores.

## Guía de configuración

1. Crea uno o más canales de registro privados que solo pueda leer el staff.
2. Abre **Registros** en el panel y quédate en la pestaña **Canales de registros**.
3. En el grupo **Populares**, elige tu canal de registro para cada evento que quieras y guarda.
4. Cambia a otros grupos como **Moderación** o **Voz** y asigna canales para todo lo demás que necesites.
5. Abre la pestaña **Canales ignorados** y mueve las salas del staff y los canales de comandos de bots a la lista de ignorados.
6. Elimina un mensaje de prueba y confirma que el registro aparece en el canal correcto.

## Comandos

Ejecútalos con el prefijo de tu servidor (`.` salvo que lo hayas cambiado). Las versiones con barra están bajo `/log`.

| Comando | Alias | Requiere | Para qué sirve |
| --- | --- | --- | --- |
| `log <type> [#channel]` | | Administrador | Envía un tipo de evento a un canal; sin canal se usa el canal actual |
| `log #channel [types...]` | | Administrador | Envía varios tipos a un canal, o abre un menú de selección con todos los tipos si no indicas ninguno |
| `log "#channel:Type1,Type2" ...` | | Administrador | Establece varios pares de canal y tipo en un solo mensaje |
| `logcategory <category> [#channel]` | `logcat` | Administrador | Apunta toda una categoría a un canal, o la borra si no indicas canal |
| `logevents` | | Administrador | Lista todos los tipos de evento y el canal que usan actualmente |
| `logignore [#channel]` | `lignore` | Administrador | Añade o quita un canal de la lista de ignorados; por defecto el canal actual |
| `logignorelist` | `lignorel` | Administrador | Muestra la lista de ignorados |
| `commandlogchannel [#channel]` | `commandlog`, `logcommands` | Administrador | Registra el uso de comandos del bot en un canal, o lo desactiva si no indicas canal |

> [!EXAMPLE]
> `log "#mod-logs:UserBanned,UserUnbanned,UserMuted" "#message-logs:MessageDeleted,MessageUpdated"`

## Consejos y trampas habituales

- Da al bot **Ver el registro de auditoría**. Sin él, los registros se publican igualmente pero no pueden decir qué moderador eliminó un mensaje, baneó a alguien o cambió un rol.
- El bot debe poder ver y enviar mensajes en cada canal de registro. Un canal de registro que no puede ver se omite sin error.
- Los registros de mensajes eliminados y editados dependen de la caché de mensajes del bot. Los mensajes enviados antes del último reinicio del bot, o en purgas masivas, pueden aparecer como no almacenados en caché.
- Los registros de reacciones se agrupan: todos los cambios de reacciones de un mensaje en unos cinco segundos llegan como una sola entrada, para no saturar los servidores concurridos.
- El menú de selección que abre `log #channel` lista hasta 25 tipos por menú y preselecciona los que ya se envían a ese canal.
- `logcategory` sobrescribe todos los tipos de la categoría, incluidos los que hubieras enrutado a otro sitio. Usa `log` para tipos individuales después.
