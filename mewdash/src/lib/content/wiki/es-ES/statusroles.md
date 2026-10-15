---
title: Roles de estado
slug: statusroles
summary: Da o quita roles automáticamente cuando el estado personalizado de Discord de un miembro contiene un fragmento de texto, y opcionalmente anúncialo en un canal.
icon: fa-user-circle
category: Actions
dashboard: /dashboard/statusroles
module: StatusRoles
tags: [status roles, custom status, vanity, auto role, presence, role automation, status text, roles de estado, estado personalizado, url personalizada, rol automático, presencia, automatización de roles, texto de estado]
related: [administration, afk]
---

## Qué hace

El staff añade uno o más fragmentos de texto que vigilar, como `discord.gg/yourserver` o `playing minecraft`. El bot vigila las actualizaciones de presencia. Cuando el estado personalizado de un miembro empieza a contener ese texto, el bot quita los roles que enumeraste en **Roles que quitar**, añade los roles de **Roles que añadir** y, si hay un canal y un mensaje configurados, publica allí una notificación.

Cuando el texto desaparece de su estado, dos interruptores deciden qué ocurre. **Quitar los añadidos** retira los roles que se dieron. **Volver a añadir los quitados** devuelve los roles que se quitaron. Ambos están desactivados por defecto, así que sin cambios el miembro simplemente conserva los roles con los que haya acabado.

Solo se comprueba el estado personalizado, el texto que escribes en "Establecer un estado personalizado" en Discord. Se ignoran las actividades de juegos, Spotify y directos. Los miembros desconectados o invisibles se omiten, y la coincidencia es una simple comprobación de subcadena, así que `mewdeko` coincide con `I love mewdeko` pero distingue mayúsculas de minúsculas.

Cada servidor puede tener cualquier número de entradas de roles de estado, cada una con sus propios roles, canal y mensaje. Los comandos se refieren a una entrada por su índice, el número que muestra `liststatusroles`.

## Por qué usarlo

- Recompensa a los miembros que ponen tu invitación personalizada en su estado con un rol de apoyo y sus ventajas.
- Da un rol de "emitiendo" o "busco jugar" mientras alguien lo anuncia en su estado, y quítalo cuando lo deja.
- Anuncia en un canal cuando un miembro empieza a representar al servidor para que el staff pueda darle las gracias.
- Cambia un rol por otro mientras un estado está activo, por ejemplo sacar a un miembro de un rol de "sin menciones" mientras muestra cierto estado.

## Coincidencias y cambios de roles

| Situación | Qué hace el bot |
| --- | --- |
| El estado adquiere el texto vigilado | Quita **Roles que quitar**, añade **Roles que añadir**, envía la notificación si está configurada |
| El estado mantiene el texto vigilado | Nada, el cambio solo se procesa una vez |
| El estado pierde el texto vigilado, con **Quitar los añadidos** activado | Quita cualquiera de los **Roles que añadir** que el miembro aún tenga |
| El estado pierde el texto vigilado, con **Volver a añadir los quitados** activado | Devuelve cualquiera de los **Roles que quitar** que el miembro ya no tenga |
| El miembro se desconecta o se vuelve invisible | Nada, los roles se dejan como están |

El bot compara cada actualización de presencia con el último estado que guardó en caché para ese usuario, así que un miembro que edita una parte no relacionada de su estado no se procesa de nuevo. El texto vigilado debe ser único por servidor; los comandos también lo limitan a 128 caracteres, el panel no.

## El mensaje de notificación

Si una entrada tiene tanto un **Canal de notificaciones** como un **Mensaje de notificación**, el bot publica el mensaje allí cada vez que el estado de un miembro empieza a coincidir. El texto pasa por el intérprete de embeds, así que funciona todo lo que produzca el constructor de embeds, incluidos texto plano, hasta diez embeds y componentes. No se publica nada cuando el estado deja de coincidir.

### Marcadores

El mensaje pasa por el conjunto estándar de sustituciones para el miembro, el canal de notificaciones y el servidor. Los más útiles están abajo; la lista completa está en la página de marcadores, en usuario, servidor, canal, bot y hora.

| Marcador | Valor |
| --- | --- |
| `%user.mention%` | Una mención del miembro |
| `%user.name%` | El nombre de usuario del miembro |
| `%user.fullname%` | Nombre de usuario con discriminador |
| `%user.avatar%` | La URL del avatar del miembro |
| `%user.id%` | El ID de usuario del miembro |
| `%server.name%` | Nombre del servidor |
| `%server.icon%` | URL del icono del servidor |
| `%channel.mention%` | Mención del canal de notificaciones |
| `%server.time%` | Hora actual en la zona horaria configurada del servidor |

> [!NOTE]
> El editor del panel lista un marcador `%status%`, pero el bot no lo sustituye. Escribe tú mismo el texto del estado en el mensaje.

> [!EXAMPLE]
> `%user.mention% is now repping the server in their status, thank you!`

## Ajustes

Todo está en la página de Roles de estado, que tiene tres pestañas: **Roles de estado**, **Añadir nuevo** y **Estadísticas**. Cada entrada de la lista se expande para mostrar sus ajustes.

| Ajuste | Predeterminado | Qué controla |
| --- | --- | --- |
| Texto de estado que vigilar | ninguno | El texto que debe contener un estado personalizado; sin límite de longitud en el panel, 128 caracteres mediante comandos |
| Roles que añadir | ninguno | ID de rol separados por espacios que se dan cuando el estado coincide; Guardar sustituye toda la lista |
| Roles que quitar | ninguno | ID de rol separados por espacios que se quitan cuando el estado coincide; Guardar sustituye toda la lista |
| Canal de notificaciones | ninguno | Canal que recibe el mensaje de notificación |
| Mensaje de notificación | ninguno | Texto o embed enviado al canal, con marcadores |
| Quitar los añadidos | desactivado | Retira los roles añadidos cuando el estado deja de coincidir |
| Volver a añadir los quitados | desactivado | Devuelve los roles quitados cuando el estado deja de coincidir |

La pestaña **Estadísticas** muestra el número total de entradas, cuántas cambian roles y cuántas tienen un canal de notificaciones.

## Guía de configuración

1. Abre **Roles de estado** en el panel y ve a la pestaña **Añadir nuevo**.
2. Introduce el texto que vigilar y pulsa **Añadir rol de estado**.
3. Cambia a la pestaña **Roles de estado** y expande la entrada nueva.
4. Pulsa **Editar ajustes**, pega ID de rol en **Roles que añadir** y **Roles que quitar**, elige un **Canal de notificaciones** y escribe un **Mensaje de notificación** si quieres uno, y luego **Guardar**.
5. Usa los dos botones de interruptor de la entrada para activar **Quitar los añadidos** y, si hace falta, **Volver a añadir los quitados**.
6. Pruébalo: establece tu propio estado personalizado con el texto y confirma que aparece el rol, luego bórralo y confirma que el rol se quita.

## Comandos

Ejecútalos con el prefijo de tu servidor (`.` salvo que lo hayas cambiado). Todos los comandos requieren Gestionar servidor. El `<index>` es el número que muestra `liststatusroles`, empezando en 1. Las versiones con barra están bajo `/statusroles`.

| Comando | Alias | Requiere | Para qué sirve |
| --- | --- | --- | --- |
| `addstatusrole <text>` | `asr` | Gestionar servidor | Añade un texto de estado que vigilar |
| `removestatusrole <index>` | `rsr` | Gestionar servidor | Elimina una entrada |
| `liststatusroles` | `lsr` | Gestionar servidor | Pagina todas las entradas con su índice y ajustes |
| `setaddroles <index> <@role...>` | `sar` | Gestionar servidor | Añade roles a la lista que se da cuando el estado coincide |
| `setremoveroles <index> <@role...>` | `srr` | Gestionar servidor | Añade roles a la lista que se quita cuando el estado coincide |
| `removeaddroles <index> <@role...>` | `remar` | Gestionar servidor | Quita roles de la lista de "roles que añadir" |
| `removeremoveroles <index> <@role...>` | `rmremoveroles` | Gestionar servidor | Quita roles de la lista de "roles que quitar" |
| `setstatusrolechannel <index> <#channel>` | `statusrolechannel`, `ssrc` | Gestionar servidor | Establece el canal de notificaciones |
| `setstatusroleembed <index> [text]` | `statusroleembed`, `asre` | Gestionar servidor | Establece el mensaje de notificación, o sin texto muestra una vista previa del actual |
| `toggleremoveadded <index>` | `togglerma` | Gestionar servidor | Activa o desactiva **Quitar los añadidos** |
| `togglereaddremoved <index>` | `togglermrm` | Gestionar servidor | Activa o desactiva **Volver a añadir los quitados** |

`setaddroles` y `setremoveroles` añaden a la lista existente en lugar de sustituirla. Usa los comandos `remove...` para volver a quitar roles. El editor del panel funciona al revés: lo que haya en el cuadro al Guardar pasa a ser la lista completa, pero un cuadro vacío se ignora, así que vaciar una lista por completo hay que hacerlo con los comandos `remove...`.

## Consejos y trampas habituales

- El bot necesita Gestionar roles, y su rol más alto debe estar por encima de todos los roles que añade o quita. Los fallos solo se registran, el miembro no ve nada.
- El bot debe tener el intent de presencia para ver los estados personalizados. Si no ocurre nada al cambiar tu estado, esto es lo primero que hay que comprobar.
- La coincidencia distingue mayúsculas de minúsculas y busca en cualquier parte del texto del estado. Mantén el texto vigilado corto y distintivo.
- El bot solo mira la primera actividad de la presencia de un miembro. Discord normalmente lista primero el estado personalizado, pero si se informa de otra actividad antes, no se ve el estado.
- Los roles solo cambian cuando cambia un estado. Un miembro que ya tiene el texto en su estado cuando creas la entrada no se procesa hasta que su estado cambia.
- La notificación se envía cada vez que el estado empieza a coincidir, así que un miembro que alterna su estado repetidamente provocará mensajes repetidos.
- El panel acepta ID de rol, no nombres. Activa el Modo desarrollador en Discord y haz clic derecho en un rol para copiar su ID.
