---
title: Gestión del servidor
slug: servermanagement
summary: Herramientas masivas para dar forma a tu servidor: crea y elimina canales y roles, da roles a cientos de miembros en una sola tarea, bloquea el servidor, sincroniza permisos de canal, roba emotes y vigila los cambios peligrosos en los roles.
icon: fa-server
category: Actions
module: ServerManagement
tags: [server management, roles, mass role, channels, lockdown, slowmode, lock channel, nuke, emotes, steal emotes, webhook, permcontrol, role monitor, role jobs, server icon, server banner, gestión del servidor, roles masivos, canales, bloqueo, modo lento, bloquear canal, robar emotes, monitor de roles, tareas de roles, icono del servidor, banner del servidor]
related: [administration, permissions, moderation]
---

## Qué hace

Gestión del servidor reúne los comandos que cambian la estructura de un servidor en lugar de a las personas que hay en él. El personal puede crear una categoría y todos sus canales en una sola línea, renombrar o eliminar canales, definir temas, activar NSFW, establecer el modo lento, bloquear un canal, o eliminar y volver a crear uno para borrar su historial.

Los roles reciben la mayor atención. Comandos puntuales crean, renombran, cambian de color, separan en la lista y eliminan roles, o dan un rol a un solo miembro, con un temporizador opcional. Los comandos masivos añaden o quitan un rol a todos los miembros, a todos los humanos, a todos los bots, a todos los de otro rol o a todos los que se unieron antes o después de una fecha de corte. Estos se ejecutan como tareas en segundo plano que puedes listar y detener.

El módulo también cubre el aspecto del propio servidor (icono, banner, splash, nombre), la gestión de emotes, incluido robar emotes de otros servidores, los permisos por canal, los movimientos entre canales de voz, tres tipos de bloqueo y un monitor de roles que revierte y castiga los cambios peligrosos en los roles.

Nada de esto se configura en el panel. Todo se ejecuta con comandos.

## Por qué usarlo

- Montar un servidor nuevo y querer diez canales bajo una categoría sin hacer clic diez veces en la interfaz de Discord.
- Dar un rol «Miembro» a dos mil miembros existentes después de activar el filtrado por roles.
- Bloquear el servidor durante un raid para que nadie pueda publicar y luego restaurar exactamente los permisos anteriores.
- Copiar los emotes del servidor de un amigo con un solo comando.
- Impedir que un moderador se dé Administrador a sí mismo añadiendo a un rol un permiso en la lista negra.

## Canales

### Crear y editar

`creatxtchanl <name>` y `creatvoichanl <name>` crean un único canal de texto o de voz. `deltxtchanl <#channel>` y `delvoichanl <channel>` eliminan uno.

La familia `cc...` crea varios a la vez:

| Comando | Qué crea |
| --- | --- |
| `ccatc <category name> <channel names...>` | Una categoría nueva y canales de texto dentro de ella |
| `ccavc <category name> <channel names...>` | Una categoría nueva y canales de voz dentro de ella |
| `cctc <existing category> <channel names...>` | Canales de texto dentro de una categoría que ya existe |
| `ccvc <existing category> <channel names...>` | Canales de voz dentro de una categoría que ya existe |

`renamechannel <channel> <name>` renombra cualquier canal, `setchanlname <name>` renombra el canal en el que estás, `settopic [text]` define o borra el tema del canal actual y `nsfwtoggle` cambia la marca NSFW del canal actual.

### Modo lento, bloqueo y nuke

`slowmode` solo alterna el canal actual entre un minuto y desactivado. `slowmode <time>`, como `slowmode 30s`, define un intervalo concreto, y ambas formas aceptan un canal como argumento. Se rechaza cualquier valor de 21600 segundos (seis horas) o más.

`lock [#channel]` añade una denegación de Enviar mensajes para el rol `@everyone` en ese canal; `unlock [#channel]` la quita. Se conservan los demás bits de permisos existentes.

`nuke [#channel]` pide confirmación, elimina el canal y crea uno nuevo con el mismo nombre, posición, tema, permisos, marca NSFW, categoría y modo lento. Los mensajes fijados, los webhooks y el historial de mensajes desaparecen para siempre.

### Permisos por canal

`permcontrol <channel> <allow|deny|inherit> <role or user> <permissions...>` edita los permisos de un destino en un canal sin tocar sus demás bits. `permview [@user or role]` enumera qué permisos tienen ahora mismo tú, un miembro o un rol.

`syncroletoall <role>` copia los permisos del rol desde el canal actual a todos los canales de texto y categorías. `syncroletoallchannels` y `syncroletoallcategories` lo hacen solo con canales o solo con categorías. El rol ya debe tener permisos propios en el canal desde el que ejecutas el comando.

### Webhooks

`createwebhook <#channel> <name> [avatar url]` crea un webhook. Si no das una URL, se usa como avatar una imagen adjunta. El bot lo confirma en el canal y te envía por MD la URL y el token del webhook.

## Voz

- `moveto <voice channel>` te mueve a ti.
- `moveuserto @user <voice channel>` mueve a otra persona.
- `grab @user` trae a alguien al canal de voz en el que estás.

## Bloqueo

`lockdown [type] [action] [override]` y `liftlockdown [type]` requieren Administrador.

| Tipo | Qué hace |
| --- | --- |
| `Joins` | Quien se une mientras está activo es expulsado o baneado. La acción es `Ban` por defecto; `Kick` es la única otra opción. |
| `Readonly` | El bot guarda los permisos actuales de `@everyone` de cada canal y luego deniega Enviar mensajes, crear hilos y responder en hilos en los canales de texto, y Conectar y Hablar en los de voz. Los canales de foro conservan Enviar mensajes para que los hilos existentes sigan siendo legibles. |
| `Full` | Ambos anteriores. |

Antes de aplicar un bloqueo de solo lectura, el bot comprueba que puede editar todos los canales. Si faltan algunos, los enumera y se detiene, salvo que pases `true` como tercer argumento para continuar de todos modos. Al levantar el bloqueo se restauran los permisos guardados. Los bloqueos de entradas sobreviven a un reinicio del bot.

`unlockdown` es una herramienta aparte y más antigua: vuelve a activar Enviar mensajes en el propio rol `@everyone`, para servidores que se bloquearon editando ese rol.

> [!WARNING]
> `lockdown` sin argumentos es un bloqueo de solo lectura, y `lockdown joins` banea a quienes se unen por defecto. Pasa `kick` si es lo que quieres.

## Roles

### Comandos de un solo rol

| Comando | Qué hace |
| --- | --- |
| `createrole [name]` | Crea un rol, no mencionable |
| `deleterole <role>` | Elimina un rol por debajo de tu rol más alto |
| `renamerole <role> <name>` | Renombra un rol |
| `rolecolor <role> [colour]` | Muestra el color del rol, o lo define |
| `rolehoist <role>` | Alterna si el rol se muestra por separado en la lista de miembros |
| `setrole <role> @user [time]` | Da un rol, y opcionalmente lo quita de nuevo tras `time`, como `2h` |
| `removerole <role> @user` | Quita un rol |
| `removeallroles @user` | Quita todos los roles no gestionados de un miembro |

En `setrole` y `removerole`, los argumentos de rol y miembro pueden darse en cualquier orden.

### Varios roles o miembros a la vez

- `createroles <names...>` crea un rol por cada palabra tras confirmar la lista.
- `deleteroles <roles...>` elimina varios roles tras confirmación; se omiten los roles gestionados.
- `setroles @user <roles...>` da varios roles a un miembro; `setroles @user <time> <roles...>` los hace temporales.
- `removeroles @user <roles...>` quita varios roles a un miembro.
- `adduserstorole <role> @user @user...` y `removeusersfromrole <role> @user @user...` funcionan con varios miembros.

### Tareas masivas de roles

Recorren toda la lista de miembros y se ejecutan como tareas en segundo plano. Debido a los límites de frecuencia de Discord, el bot hace una breve pausa por miembro y solo permite cinco tareas a la vez por servidor. Cada tarea informa de cuánto tiempo espera tardar.

| Comando | A quién afecta |
| --- | --- |
| `addtoall <role>` | A todos los miembros que no tienen el rol |
| `addtoallusers <role>` | Solo a humanos |
| `addtoallbots <role>` | Solo a bots |
| `addtousersover <time> <role>` | A miembros que se unieron hace al menos `time`, por ejemplo `30d` |
| `addtousersunder <time> <role>` | A miembros que se unieron hace menos de `time` |
| `addroletorole <role> <role2>` | Da `role` a todos los de `role2` |
| `addthenremove <role> <role2>` | Da `role` a todos los de `role2` y luego quita `role2` |
| `removefromall <role>` | A todos los que tienen el rol |
| `removefromallusers <role>` | Solo a humanos |
| `removefromallbots <role>` | Solo a bots |
| `removefromrole <role> <role2>` | Quita `role` a todos los de `role2` |

`rolejobs` enumera las tareas en ejecución con su tipo, quién las inició, su progreso y los roles. `stopjob <number>` cancela una e informa de hasta dónde llegó.

### Exportar e importar

`exportrolelist` envía un archivo `rolelist.txt` con una línea `roleId,userId,roleName` por cada pertenencia, para todos los roles que el bot puede gestionar. `importrolelist` lee un archivo así adjunto al comando y vuelve a aplicar los roles; pasa `true` para crear roles por nombre cuando los IDs ya no existen. `addroletolist <role>` lee una lista adjunta de IDs de usuario y les da el rol.

## Aspecto del servidor y emotes

`seticon <url>`, `setbanner <url>`, `setsplash <url>` y `setservername <name>` cambian el propio servidor y requieren Administrador. `setguildavatar`, `setguildbanner` y `setguildbio` cambian cómo aparece el propio bot solo en este servidor, y requieren Gestionar servidor.

Los comandos de emotes requieren Gestionar expresiones tanto para ti como para el bot:

- `addemote <name> [url]` sube un emote desde una URL o una imagen adjunta.
- `removeemote <emote>` y `renameemote <emote> <name>` funcionan con emotes de este servidor.
- `stealemotes <emotes...>` copia a este servidor todos los emotes personalizados de tu mensaje. `sfr <role> <emotes...>` hace lo mismo pero restringe los emotes a un rol.
- Hacer clic derecho en un mensaje y elegir **Steal Emotes** o **Steal Sticker** en el menú Apps hace lo mismo sin escribir.

## Monitor de roles

El monitor de roles vigila el registro de auditoría. Cuando a un miembro se le da un rol en la lista negra, o un rol gana un permiso en la lista negra, el bot revierte el cambio y castiga a quien lo hizo. Solo el propietario del servidor puede configurarlo.

- `addblacklistedrole <role> [punishment]` y `removeblacklistedrole <role>`.
- `addblacklistedpermission <permission> [punishment]` y `removeblacklistedpermission <permission>`, por ejemplo `addblacklistedpermission Administrator Ban`.
- `setdefaultpunishment <punishment>` define qué pasa cuando una entrada de la lista negra no tiene castigo propio. Por defecto es `None`.
- `addwhitelisteduser @user`, `addwhitelistedrole <role>` y sus equivalentes `remove...` eximen al personal del monitor. Se ignoran los cambios hechos por o a personas de la lista blanca.
- `listblacklists` muestra todo lo anterior.

Los valores de castigo son `None`, `Warn`, `Mute`, `ChatMute`, `VoiceMute`, `Timeout`, `Kick`, `Softban`, `Ban`, `RemoveRoles`, `AddRole` y `Delete`. Cuando se añaden varios permisos en la lista negra a la vez, gana el castigo más severo.

## Ajustes

No hay una página en el panel. Los únicos ajustes guardados pertenecen al monitor de roles y al estado del bloqueo.

| Ajuste | Por defecto | Qué controla |
| --- | --- | --- |
| Castigo por defecto | None | Se aplica cuando un rol o permiso en la lista negra no tiene castigo definido |
| Roles en la lista negra | ninguno | Roles que se quitan al darlos, con un castigo opcional cada uno |
| Permisos en la lista negra | ninguno | Permisos que se revierten al añadirlos a un rol, con un castigo opcional cada uno |
| Usuarios y roles en la lista blanca | ninguno | Eximidos del monitor |
| Acción del bloqueo de entradas | Ban | Qué les pasa a los miembros que se unen durante un bloqueo de entradas |

## Guía de configuración

1. Comprueba que el rol del bot esté por encima de todos los roles que quieres que gestione, y que tenga Gestionar roles y Gestionar canales.
2. Crea la estructura: `ccatc Community general off-topic memes` crea la categoría y tres canales.
3. Crea roles de una vez: `createroles Member Regular Veteran`.
4. Reparte el rol base: `addtoallusers Member` y luego síguelo con `rolejobs`.
5. Como propietario del servidor, protege el servidor: `addblacklistedpermission Administrator Ban` y `addwhitelistedrole Admin`.
6. Ten presente `lockdown full kick` para emergencias y prueba `liftlockdown full` después, en un día tranquilo.

## Comandos

Ejecútalos con el prefijo de tu servidor (`.` salvo que lo hayas cambiado).

| Comando | Alias | Requiere | Propósito |
| --- | --- | --- | --- |
| `permview [@user or role]` | `pview` | Nadie | Enumera los permisos permitidos |
| `setsplash <url>` | `setserversplash`, `setsplashimage` | Administrador | Define el splash de invitación |
| `seticon <url>` | `setservericon`, `seticonimage` | Administrador | Define el icono del servidor |
| `setbanner <url>` | `setserverbanner` | Administrador | Define el banner del servidor |
| `setservername <name>` | | Administrador | Renombra el servidor |
| `setguildavatar [url]` | `sgav`, `setgav` | Gestionar servidor | Avatar del bot en este servidor |
| `setguildbanner [url]` | `sgbanner`, `setgbanner` | Gestionar servidor | Banner del bot en este servidor |
| `setguildbio <text>` | `sgbio`, `setgbio` | Gestionar servidor | Biografía del bot en este servidor |
| `addemote <name> [url]` | `emoteadd`, `ae`, `ea` | Gestionar expresiones | Sube un emote |
| `removeemote <emote>` | `deleteemote`, `emoteremove`, `emotedelete` | Gestionar expresiones | Elimina un emote |
| `renameemote <emote> <name>` | `emoterename` | Gestionar expresiones | Renombra un emote |
| `stealemotes <emotes...>` | `steal` | Gestionar expresiones | Copia emotes a este servidor |
| `sfr <role> <emotes...>` | | Gestionar expresiones | Copia emotes, restringidos a un rol |
| `creatxtchanl <name>` | `ctch` | Gestionar canales | Crea un canal de texto |
| `creatvoichanl <name>` | `cvch` | Gestionar canales | Crea un canal de voz |
| `deltxtchanl <#channel>` | `dtch` | Gestionar canales | Elimina un canal de texto |
| `delvoichanl <channel>` | `dvch` | Gestionar canales | Elimina un canal de voz |
| `ccatc <category> <names...>` | | Gestionar canales | Categoría nueva con canales de texto |
| `ccavc <category> <names...>` | | Gestionar canales | Categoría nueva con canales de voz |
| `cctc <category> <names...>` | | Gestionar canales | Canales de texto en una categoría existente |
| `ccvc <category> <names...>` | | Gestionar canales | Canales de voz en una categoría existente |
| `renamechannel <channel> <name>` | `channelrename` | Gestionar canales | Renombra un canal |
| `setchanlname <name>` | `schn` | Gestionar canales | Renombra el canal actual |
| `settopic [text]` | `st` | Gestionar canales | Define o borra el tema actual |
| `nsfwtoggle` | `nsfw`, `nsfwtgl` | Gestionar canales | Alterna la marca NSFW |
| `slowmode [time] [#channel]` | | Gestionar canales | Alterna o define el modo lento |
| `lock [#channel]` | `channellock`, `lockchannel` | Gestionar mensajes | Deniega Enviar mensajes a todos |
| `unlock [#channel]` | `channelunlock`, `unlockchannel` | Gestionar mensajes | Deshace `lock` |
| `nuke [#channel]` | `channelnuke`, `nukechannel` | Gestionar canales | Elimina y vuelve a crear un canal |
| `permcontrol <channel> <allow|deny|inherit> <role or user> <perms...>` | `permc` | Gestionar canales | Edita los permisos de un canal |
| `syncroletoall <role>` | `synctoall` | Gestionar canales | Copia los permisos a todos los canales y categorías |
| `syncroletoallchannels <role>` | `srtch`, `srtach` | Gestionar canales | Copia los permisos a los canales de texto |
| `syncroletoallcategories <role>` | `srtc`, `srtac` | Gestionar canales | Copia los permisos a las categorías |
| `createwebhook <#channel> <name> [avatar]` | `cwh` | Administrador | Crea un webhook |
| `moveto <voice channel>` | | Nadie | Te mueve a ti |
| `moveuserto @user <voice channel>` | `moveuto` | Gestionar canales | Mueve a alguien |
| `grab @user` | `getoverhere` | Nadie | Trae a alguien a tu canal de voz |
| `lockdown [joins|readonly|full] [kick|ban] [true]` | `lockdownserver` | Administrador | Inicia un bloqueo |
| `liftlockdown [type]` | `unlockserver` | Administrador | Termina un bloqueo |
| `unlockdown` | `endlockdown` | Gestionar canales | Vuelve a activar Enviar mensajes en `@everyone` |
| `createrole [name]` | `cr` | Gestionar roles | Crea un rol |
| `deleterole <role>` | `dr` | Gestionar roles | Elimina un rol |
| `renamerole <role> <name>` | `renr` | Gestionar roles | Renombra un rol |
| `rolecolor <role> [colour]` | `roleclr` | Gestionar roles para definirlo | Muestra o define el color de un rol |
| `rolehoist <role>` | `rh` | Gestionar roles | Alterna la separación en la lista |
| `setrole <role> @user [time]` | `sr`, `giverole` | Gestionar roles | Da un rol, opcionalmente temporal |
| `removerole <role> @user` | `rr` | Gestionar roles | Quita un rol |
| `removeallroles @user` | `rar` | Gestionar roles | Quita todos los roles |
| `createroles <names...>` | `croles`, `crs` | Gestionar roles | Crea varios roles |
| `deleteroles <roles...>` | `drs` | Gestionar roles | Elimina varios roles |
| `setroles @user [time] <roles...>` | `srs` | Gestionar roles | Da varios roles |
| `removeroles @user <roles...>` | `rrs` | Gestionar roles | Quita varios roles |
| `adduserstorole <role> @users...` | `autr` | Gestionar roles | Da un rol a varios miembros |
| `removeusersfromrole <role> @users...` | `rufr` | Gestionar roles | Quita un rol a varios miembros |
| `addtoall <role>` | `ata` | Gestionar roles | Rol para todos los miembros |
| `addtoallusers <role>` | `atau` | Gestionar roles | Rol para todos los humanos |
| `addtoallbots <role>` | `atab` | Gestionar roles | Rol para todos los bots |
| `addtousersover <time> <role>` | `atuo` | Gestionar roles | Rol para miembros que se unieron hace al menos ese tiempo |
| `addtousersunder <time> <role>` | `atuu` | Gestionar roles | Rol para miembros que se unieron hace menos tiempo |
| `addroletorole <role> <role2>` | `artr` | Gestionar roles | Rol para todos los de otro rol |
| `addthenremove <role> <role2>` | `atr` | Gestionar roles | Cambia un rol por otro |
| `removefromall <role>` | `rfa` | Gestionar roles | Quita el rol a todos los miembros |
| `removefromallusers <role>` | `rfau` | Gestionar roles | Quita el rol a todos los humanos |
| `removefromallbots <role>` | `rfab` | Gestionar roles | Quita el rol a todos los bots |
| `removefromrole <role> <role2>` | `rfr` | Gestionar roles | Quita el rol a todos los de otro rol |
| `rolejobs` | `rj` | Gestionar roles | Enumera las tareas masivas de roles en ejecución |
| `stopjob <number>` | `sj` | Gestionar roles | Cancela una tarea |
| `exportrolelist` | `exportroles`, `erl` | Gestionar roles | Descarga las pertenencias a roles |
| `importrolelist [true]` | `importroles`, `irl` | Gestionar roles | Vuelve a aplicar una lista exportada |
| `addroletolist <role>` | `artl` | Gestionar roles | Da un rol a una lista adjunta de IDs de usuario |
| `setdefaultpunishment <action>` | `sdp`, `defaultpunishment`, `setdefpunishment` | Propietario del servidor | Castigo de respaldo del monitor de roles |
| `addblacklistedrole <role> [action]` | `abr`, `blacklistrole`, `addbrole` | Propietario del servidor | Vigila un rol |
| `removeblacklistedrole <role>` | `rbr`, `unblacklistrole`, `removebrole` | Propietario del servidor | Deja de vigilar un rol |
| `addblacklistedpermission <permission> [action]` | `abp`, `blacklistpermission`, `addbpermission` | Propietario del servidor | Vigila un permiso |
| `removeblacklistedpermission <permission>` | `rbp`, `unblacklistpermission`, `removebpermission` | Propietario del servidor | Deja de vigilar un permiso |
| `addwhitelisteduser @user` | `awu`, `whitelistuser`, `addwuser` | Propietario del servidor | Exime a un miembro |
| `removewhitelisteduser @user` | `rwu`, `unwhitelistuser`, `removewuser` | Propietario del servidor | Quita una exención |
| `addwhitelistedrole <role>` | `awr`, `whitelistrole`, `addwrole` | Propietario del servidor | Exime a un rol |
| `removewhitelistedrole <role>` | `rwr`, `unwhitelistrole`, `removewrole` | Propietario del servidor | Quita una exención |
| `listblacklists` | `lbl`, `blacklists`, `listbws` | Propietario del servidor | Muestra las listas del monitor |

## Consejos y advertencias

- Los comandos de roles comprueban la jerarquía dos veces: tu rol más alto y el del bot deben estar por encima del rol en cuestión. El propietario del servidor se salta la comprobación de su lado.
- Las tareas masivas tardan aproximadamente un segundo por miembro. Añadir un rol a cinco mil miembros lleva bastante más de una hora, y el bot rechaza una sexta tarea simultánea.
- `syncroletoall` y sus variantes necesitan que el rol ya tenga permisos propios en el canal donde las ejecutas; esos permisos son los que se copian.
- `nuke` no se puede deshacer y la confirmación es la única salvaguarda.
- El bloqueo de solo lectura edita los permisos de todos los canales, lo que son muchas llamadas a la API en servidores grandes. Levántalo con `liftlockdown`, no a mano, para que se restauren los permisos guardados.
- El monitor de roles depende del registro de auditoría, así que el bot necesita Ver registro de auditoría, además del permiso necesario para el castigo que elijas.
- Robar emotes requiere huecos libres de emotes; los fallos aparecen en «Errored Emotes».
