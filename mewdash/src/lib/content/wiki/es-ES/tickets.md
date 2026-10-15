---
title: Tickets
slug: tickets
summary: Paneles de tickets de soporte con botones y menús de selección que abren canales privados, además de reclamación, prioridades, etiquetas, casos, transcripciones y herramientas para el staff.
icon: fa-ticket
category: Community
dashboard: /dashboard/tickets
module: Tickets
tags: [tickets, support, help desk, panel, ticket panel, transcripts, cases, claim, priority, blacklist, modmail, soporte, centro de ayuda, panel de tickets, transcripciones, casos, reclamar, prioridad, lista negra]
related: [administration, chat-triggers, auditlog]
---

## Qué hace

Tickets convierte un canal en un centro de ayuda. Publicas un panel, que es un mensaje con un embed y uno o más botones o un menú de selección. Cuando un miembro hace clic en un botón o elige una opción, el bot crea un canal de texto privado para él, configura los permisos para que solo lo vean esa persona y tus roles de soporte, y publica un mensaje de apertura con los botones **Reclamar** y **Cerrar**.

Desde el punto de vista del miembro: hace clic, opcionalmente rellena un breve formulario y aparece un canal con un nombre como `ticket-username-1`. Allí describe su problema. Cuando se cierra, el canal se renombra a `closed-...`, se bloquea y se mueve a una categoría de archivo o se elimina tras un retraso, según cómo hayas configurado ese tipo de ticket.

Desde el punto de vista del staff: reclama un ticket para que todos sepan quién se encarga de él, establece una prioridad, añade etiquetas, deja notas, vincula tickets relacionados en un caso y lo cierra. Cada cierre puede guardar una transcripción en un canal y en el panel. El panel también muestra los tiempos de respuesta y de resolución, los tickets por prioridad y una vista por miembro del staff.

Cada botón y cada opción de menú de selección es un tipo de ticket independiente, con su propia categoría, roles, límites, formulario, mensaje de apertura y comportamiento de cierre.

## Por qué usarlo

- Un servidor de soporte quiere canales privados uno a uno en lugar de un canal de ayuda público.
- Tienes varios equipos (facturación, moderación, colaboraciones) y quieres un menú de selección que dirija al equipo correcto.
- Necesitas solicitudes para moderadores con un formulario, separadas del soporte general.
- Quieres un rastro de auditoría: transcripciones, notas del staff y casos que agrupan reportes relacionados.
- Quieres impedir que ciertos miembros abran tickets.

## Paneles, botones y menús de selección

Un panel es un mensaje en un canal. El ID del panel es el ID de ese mensaje. Un panel puede contener botones, menús de selección o ambos.

- **Botones**: un tipo de ticket por botón. Cada uno tiene una etiqueta, un emoji opcional y un estilo (Primario, Secundario, Éxito o Peligro).
- **Menús de selección**: un menú con un marcador de posición y una lista de opciones. Cada opción es un tipo de ticket con etiqueta, descripción y emoji. Un menú debe conservar al menos una opción.

Si se elimina el mensaje del panel, `checkpanels` lista qué paneles faltan y `recreatepanel` o `recreateallpanels` los vuelve a publicar y actualizan el ID de mensaje guardado. El bot también vigila las eliminaciones de los mensajes de panel.

`ticketduplicatepanel` copia un panel y todos sus componentes a otro canal. `ticketmovepanel` lo mueve. `ticketupdatepanel` sustituye el embed por un nuevo JSON de embed.

### Ajustes del tipo de ticket

Existen en cada botón y en cada opción de menú de selección. En el panel aparecen al añadir o editar un botón u opción.

| Ajuste | Predeterminado | Qué controla |
| --- | --- | --- |
| Formato del nombre del canal | `ticket-{username}-{id}` | Nombre del canal creado; `{id}` es el número de ticket del miembro, máx. 100 caracteres |
| Categoría de tickets | ninguna | Categoría en la que se crea el canal |
| Categoría de archivo | ninguna | Categoría a la que se mueve el canal al cerrarse o archivarse |
| Roles de soporte | ninguno | Roles que pueden ver, hablar en y reclamar el ticket |
| Roles con acceso de lectura | ninguno | Roles que pueden leer pero no enviar |
| Máx. de tickets activos | 1 | Cuántos tickets abiertos de este tipo puede tener un miembro |
| Cierre automático (horas) | ninguno | Se guarda por tipo y se muestra en `buttoninfo` |
| Tiempo de respuesta requerido (minutos) | ninguno | Se guarda por tipo y se muestra en `buttoninfo` |
| Prioridades permitidas | todas | Qué prioridades puede establecer el staff en este tipo |
| Prioridad predeterminada | ninguna | Prioridad con la que empieza un ticket nuevo |
| Guardar transcripción | desactivado | Genera una transcripción cuando se cierra el ticket |
| Bloquear al cerrar | activado | Impide enviar mensajes a todos excepto a los roles de soporte |
| Renombrar al cerrar | activado | Añade el prefijo `closed-` al nombre del canal |
| Quitar al creador | activado | Quita el acceso de quien abrió el ticket al cerrarlo |
| Eliminar al cerrar | desactivado | Elimina el canal tras el retraso en lugar de conservarlo |
| Retraso de eliminación | 5 minutos | Espera antes de eliminar cuando Eliminar al cerrar está activado; el campo del panel usa segundos, `ticketclosebehavior` usa minutos |
| Archivar automáticamente al cerrar | desactivado | Archiva el ticket como parte del cierre |
| Bloquear al archivar | activado | Deja el canal en solo lectura al archivarlo |
| Renombrar al archivar | activado | Añade el prefijo `archived-` al nombre del canal |
| Quitar al creador (archivo) | desactivado | Quita el acceso de quien abrió el ticket al archivarlo |
| Modal | ninguno | Un formulario que se muestra antes de crear el ticket |
| Mensaje de apertura | embed predeterminado | Mensaje de apertura personalizado con marcadores |

### Formularios (modales)

Un tipo de ticket puede hacer preguntas antes de crear el canal. Establece un título con `setmodaltitle` (por defecto "Create Ticket") y añade campos con `addmodalfield`. Un campo es corto y obligatorio por defecto; las opciones tras la etiqueta lo cambian: `paragraph` para varias líneas, `optional`, y `min:X` o `max:X` para límites de longitud de hasta 4000. El ID del campo es la etiqueta en minúsculas con los espacios convertidos en guiones bajos.

Las respuestas se guardan con el ticket y se pueden usar en el mensaje de apertura como `%modal.<fieldId>%`.

### El mensaje de apertura

Por defecto, el bot publica un embed titulado "Support Ticket" que da la bienvenida al miembro, muestra el ID del ticket y la hora de creación, y le pide que describa el problema. Se adjuntan los botones Reclamar y Cerrar.

Puedes sustituirlo por tipo de ticket con tu propio texto o embed. Usa el constructor de embeds del panel (**Configurar mensaje de apertura del ticket**). Marcadores disponibles aquí:

| Marcador | Valor |
| --- | --- |
| `%ticket.id%` | El número del ticket |
| `%ticket.channel%` | Mención del canal del ticket |
| `%ticket.user%` | El nombre de usuario de quien abrió el ticket |
| `%ticket.user.mention%` | Una mención de quien abrió el ticket |
| `%ticket.user.avatar%` | La URL del avatar de quien abrió el ticket |
| `%ticket.user.id%` | El ID de usuario de quien abrió el ticket |
| `%ticket.created%` | Cuándo se creó el ticket |
| `%modal.<fieldId>%` | La respuesta a un campo del formulario |

El conjunto general de marcadores no se aplica a este mensaje; solo los de arriba.

## Qué pasa cuando se abre un ticket

1. Los miembros en la lista negra reciben un rechazo con un mensaje efímero.
2. Los tickets abiertos del miembro de este tipo se cuentan contra **Máx. de tickets activos** (1 por defecto).
3. El canal se crea en la categoría de tickets con `@everyone` denegado, con permiso para quien lo abre de ver, enviar, leer el historial, adjuntar archivos e insertar enlaces, con los mismos permisos más Gestionar mensajes para los roles de soporte y con permiso de solo lectura para los roles con acceso de lectura.
4. Se publica el mensaje de apertura con los botones Reclamar y Cerrar.
5. Si hay un canal de registros configurado, se publica allí una entrada de "nuevo ticket".
6. Se publica un evento **Ticket abierto** para los chat triggers.

## Reclamar, notas, prioridades y etiquetas

**Reclamar**: un miembro de un rol de soporte o un administrador reclama el ticket con el botón o con `ticketclaim`. El canal recibe un embed de "reclamado por". Solo quien lo reclamó o un administrador puede liberarlo. Un ticket cerrado o ya reclamado no se puede reclamar.

**Notas**: `ticketnote` añade una nota del staff al ticket actual. La nota se guarda con el ticket, se muestra en el panel y se publica en el canal del ticket como un embed azul de "nota añadida" con el autor en el pie.

Las **prioridades** son definiciones de todo el servidor que se crean con `ticketaddpriority` o en la pestaña **Configuración**. Cada una tiene un ID, un nombre visible, un emoji, un nivel del 1 al 5, un color, un tiempo de respuesta y la opción **Notificar al staff**. Al establecer una prioridad en un ticket se publica un embed de ese color y, si la opción está activada, se menciona a los roles de soporte. Un tipo de ticket puede restringir qué prioridades se permiten.

Las **etiquetas** son marcas de todo el servidor con ID, nombre, descripción y color. Añádelas o quítalas de un ticket con `ticketaddtags` y `ticketremovetags` usando los ID de etiqueta. El panel las muestra en cada ticket y permite buscar por etiqueta.

## Cierre, archivo y transcripciones

Cerrar marca el ticket como cerrado y publica un embed rojo de "ticket cerrado". Después, por orden:

1. Si **Guardar transcripción** está activado para el tipo y hay un canal de transcripciones configurado, se guardan los últimos 5000 mensajes y se publica en el canal de transcripciones un embed con un enlace **Ver transcripción**. El enlace abre la transcripción en el panel.
2. Si el archivo automático está activado para el tipo, o cerraste con `ticketclose true`, el ticket se archiva (ver más abajo).
3. En caso contrario se ejecutan los comportamientos de cierre: renombrar a `closed-...`, quitar a quien abrió el ticket, bloquear el canal conservando los roles de soporte y luego mover a la categoría de archivo o, con **Eliminar al cerrar**, avisar en el canal y programar la eliminación tras el retraso de eliminación. Las eliminaciones programadas se procesan una vez por minuto.

Archivar renombra el canal a `archived-...`, lo mueve a la categoría de archivo, lo deja en solo lectura para todos y marca el ticket como archivado. `ticketarchive` hace esto directamente sobre un ticket abierto. Si el canal ya no existe, el ticket simplemente se marca como archivado.

Cerrar publica un evento **Ticket cerrado** para los chat triggers.

> [!NOTE]
> Solo se genera una transcripción cuando el tipo tiene **Guardar transcripción** activado y el servidor tiene un canal de transcripciones. Sin canal de transcripciones, el cierre se completa igualmente pero no se guarda nada.

## Casos

Un caso agrupa tickets que van juntos, por ejemplo varios reportes sobre la misma persona. Crea uno con `ticketcreatecase <title> <description>` o en la pestaña **Casos**, luego vincula el ticket actual con `ticketlinkcase <caseId>` y desvincúlalo con `ticketunlinkcase`. Los casos tienen sus propias notas, se pueden cerrar y reabrir, y se pueden editar desde el panel o con los comandos de barra `/tickets cases`.

## Lista negra

`ticketblock @user [reason]` impide que un miembro abra tickets. El motivo se escribe en el canal de registros si hay uno configurado. `ticketunblock` lo levanta. La pestaña **Avanzado** del panel tiene la misma sección **Gestión de la lista negra**, que acepta un ID de usuario.

## Herramientas por lotes

- `ticketcloseinactive <hours>` cierra todos los tickets abiertos sin actividad durante ese número de horas, publicando un embed de "cerrado automáticamente" en cada uno y archivándolo si el tipo tiene una categoría de archivo. **Cerrar tickets inactivos**, en la pestaña **Avanzado**, hace lo mismo.
- `ticketmoveall <source category> <target category>` mueve todos los canales de tickets entre categorías.

## Estadísticas

`ticketstats` muestra totales, recuentos de abiertos y cerrados, tiempo medio de respuesta en minutos, tiempo medio de resolución en horas y desgloses por tipo y prioridad. `ticketuserstats [@user]` muestra lo mismo para un miembro más sus tickets recientes. La pestaña **Resumen** muestra los tiempos de respuesta, los tickets por prioridad y el rendimiento del staff.

## Ajustes

La página de Tickets tiene seis pestañas: **Resumen**, **Tickets**, **Paneles de tickets**, **Configuración**, **Casos** y **Avanzado**.

| Ajuste | Predeterminado | Qué controla |
| --- | --- | --- |
| Canal de transcripciones | ninguno | Dónde se publican los resúmenes de transcripciones con enlaces (Configuración) |
| Canal de registros | ninguno | Dónde se registran la creación de tickets y las entradas de la lista negra (Configuración) |
| Prioridades | ninguna | Definiciones de prioridad de todo el servidor (Configuración) |
| Etiquetas | ninguna | Definiciones de etiqueta de todo el servidor (Configuración) |
| Embed del panel | título "Support Tickets" | El mensaje del panel, creado en el editor de embeds (Paneles de tickets) |
| Ajustes por tipo | ver la tabla anterior | Se establecen en cada botón u opción de menú de selección (Paneles de tickets) |
| Lista negra | vacía | Miembros que no pueden abrir tickets (Avanzado) |

La pestaña **Tickets** lista los tickets abiertos y cerrados con búsqueda por ticket, usuario, canal o etiqueta. Desde ahí el staff puede reclamar, liberar, establecer la prioridad, añadir o quitar etiquetas, añadir una nota del staff, cerrar con un motivo opcional, archivar y abrir la transcripción.

> [!PERMISSION]
> El bot necesita Gestionar canales y Gestionar roles para poder crear los canales de tickets y establecer quién puede verlos. Su rol debe poder ver las categorías de tickets y de archivo.

## Guía de configuración

1. Crea una categoría para los tickets abiertos y, opcionalmente, otra para los cerrados. Crea un canal de transcripciones y un canal de registros que solo pueda ver el staff.
2. Abre **Tickets** en el panel, ve a **Configuración** y establece **Canal de transcripciones** y **Canal de registros**.
3. Sin salir de **Configuración**, crea al menos una prioridad (por ejemplo `urgent`, nivel 5, Notificar al staff activado) y las etiquetas que quieras.
4. Ve a **Paneles de tickets** y pulsa **Crear nuevo panel**. Elige el canal y diseña el **Embed del panel**.
5. Selecciona el panel y añade un **Nuevo botón**. Establece la etiqueta, el estilo, **Categoría de tickets**, **Categoría de archivo**, **Roles de soporte** y activa **Guardar transcripción**. Decide entre conservar los canales cerrados en la categoría de archivo o **Eliminar al cerrar** con un retraso.
6. Opcionalmente abre el constructor de modales para añadir campos de formulario y el editor del mensaje de apertura para personalizar la bienvenida.
7. Para varios tipos de ticket en un mismo desplegable, añade un **Nuevo menú de selección** y añade una opción por tipo con los mismos ajustes.
8. Abre un ticket de prueba desde otra cuenta, reclámalo, establece una prioridad, ciérralo y revisa el canal de transcripciones.

En Discord, `/tickets setup wizard #channel` recorre los mismos pasos con plantillas (Basic Support, Department Support, Gaming Server, Business, Mod Applications).

## Comandos

Ejecútalos con el prefijo de tu servidor (`.` salvo que lo hayas cambiado). Los ID de panel son ID de mensaje; los ID de botón, menú y opción se obtienen con `panelinfo` o `ticketlistpanel`.

| Comando | Alias | Requiere | Para qué sirve |
| --- | --- | --- | --- |
| `ticketpanel <#channel> [embedJson]` | `tpanel` | Administrador | Crea un panel, con una vista previa o confirmación de creación |
| `ticketpaneldelete <panelId> [force]` | `tpaneldelete` | Administrador | Elimina un panel; `true` lo fuerza aunque tenga tickets asociados |
| `ticketupdatepanel <panelId> <embedJson>` | `tupdatepanel` | Administrador | Sustituye el embed del panel |
| `ticketmovepanel <panelId> <#channel>` | `tmovepanel` | Administrador | Mueve un panel a otro canal |
| `ticketduplicatepanel <panelId> <#channel>` | `tduplicatepanel` | Administrador | Copia un panel y sus componentes |
| `panellist` | `plist` | Administrador | Lista los paneles con el número de componentes |
| `panelinfo <panelId>` | `pinfo` | Administrador | Muestra los botones y menús de un panel con sus ID |
| `ticketlistpanels` | `tlistpanels` | Gestionar canales | Lista paginada y detallada de todos los paneles |
| `ticketlistpanel <panelId>` | `tlistpanel` | Gestionar canales | Todos los componentes de un panel con sus ajustes |
| `checkpanels` | `tcheckpanels` | Administrador | Informa de los paneles cuyo mensaje o canal falta |
| `recreatepanel <panelId>` | `trecreate` | Administrador | Vuelve a publicar un panel que falta |
| `recreateallpanels` | `trecreateall` | Administrador | Vuelve a publicar todos los paneles que faltan |
| `setpaneltranscripts <panelId> <true or false>` | `sptranscripts` | Administrador | Activa o desactiva las transcripciones de todos los botones de un panel |
| `ticketaddbutton <panelId> <label> [style] [emoji]` | `taddbtn` | Administrador | Añade un botón |
| `buttoninfo <buttonId>` | `binfo` | Administrador | Muestra los ajustes de un botón |
| `deletebutton <buttonId>` | `delbtn` | Administrador | Elimina un botón |
| `ticketcategory <buttonId> [category]` | `tcat` | Administrador | Establece o quita la categoría de tickets |
| `ticketarchivecategory <buttonId> [category]` | `tarchivecat` | Administrador | Establece o quita la categoría de archivo |
| `ticketautoarchive <buttonId> [true or false]` | `tautoarchive` | Administrador | Archiva automáticamente al cerrar |
| `ticketclosebehavior <buttonId> [autoArchive] [deleteOnClose] [lockOnClose] [renameOnClose] [deleteDelayMinutes]` | `tclosebehavior` | Administrador | Establece varios comportamientos de cierre a la vez |
| `ticketautoclose <buttonId> [hours]` | `tautoclose` | Administrador | Establece o quita las horas de cierre automático |
| `setautoclose <buttonId> <hours>` | `sautoclose` | Administrador | Igual que el anterior |
| `ticketresponsetime <buttonId> [minutes]` | `tresponsetime` | Administrador | Establece o quita el tiempo de respuesta requerido |
| `setresponsetime <buttonId> <minutes>` | `sresponsetime` | Administrador | Igual que el anterior |
| `setmodaltitle <buttonId> <title>` | `smodaltitle` | Administrador | Título del formulario del ticket |
| `addmodalfield <buttonId> <label> [options]` | `addmfield` | Administrador | Añade un campo de formulario, con opciones como `paragraph,optional,max:500` |
| `removemodalfield <buttonId> <fieldId>` | `removemfield` | Administrador | Quita un campo de formulario |
| `listmodalfields <buttonId>` | `listmfields` | Administrador | Lista los campos del formulario |
| `addselectmenu <panelId>` | `addsmenu` | Administrador | Añade un menú de selección mediante un asistente guiado |
| `addoption <menuId> <label> [description] [emoji]` | `addopt` | Administrador | Añade una opción a un menú |
| `listoptions <menuId>` | `listopts` | Administrador | Lista las opciones de un menú |
| `removeoption <menuId> <value>` | `removeopt` | Administrador | Confirma una opción por valor (ver trampas habituales) |
| `deleteselectoption <optionId>` | `delselectoption` | Administrador | Quita una opción; no se puede quitar la última |
| `setplaceholder <menuId> <text>` | `splaceholder` | Administrador | Cambia el marcador de posición del menú |
| `deleteselectmenu <menuId>` | `delselectmenu` | Administrador | Quita un menú y sus opciones |
| `ticketclaim` | `tclaim` | Nadie | Reclama el ticket actual (rol de soporte o administrador) |
| `ticketunclaim` | `tunclaim` | Nadie | Libera tu reclamación (quien reclamó o administrador) |
| `ticketclose [archive]` | `tclose` | Nadie | Cierra el ticket actual; `true` también lo archiva |
| `ticketarchive` | `tarchive` | Gestionar canales | Archiva el ticket actual |
| `ticketnote <text>` | `tnote` | Nadie | Añade una nota del staff |
| `ticketpriority <priorityId>` | `tpriority` | Nadie | Establece la prioridad del ticket actual |
| `ticketaddtags <tagId...>` | `taddtags` | Nadie | Añade etiquetas al ticket actual |
| `ticketremovetags <tagId...>` | `tremovetags` | Nadie | Quita etiquetas del ticket actual |
| `ticketaddpriority <id> <name> <emoji> <level> <pingStaff> <responseTime> <color>` | `taddpriority` | Administrador | Define una prioridad, por ejemplo `taddpriority urgent Urgent :fire: 5 true 00:15:00 red` |
| `ticketremovepriority <id>` | `tremovepriority` | Administrador | Elimina una definición de prioridad |
| `ticketaddtag <id> <name> <description> <color>` | `taddtag` | Administrador | Define una etiqueta |
| `ticketremovetag <id>` | `tremovetag` | Administrador | Elimina una definición de etiqueta |
| `ticketcreatecase <title> <description>` | `tcreatecase` | Gestionar mensajes | Crea un caso |
| `ticketlinkcase <caseId>` | `tlinkcase` | Gestionar mensajes | Vincula el ticket actual a un caso |
| `ticketunlinkcase` | `tunlinkcase` | Gestionar mensajes | Desvincula el ticket actual |
| `ticketblock @user [reason]` | `tblock` | Administrador | Añade a un miembro a la lista negra |
| `ticketunblock @user` | `tunblock` | Administrador | Quita de la lista negra |
| `tickettranscriptchannel [#channel]` | `ttranscriptch` | Administrador | Establece o quita el canal de transcripciones |
| `ticketlogchannel [#channel]` | `tlogch` | Administrador | Establece o quita el canal de registros |
| `ticketcloseinactive <hours>` | `tcloseinactive` | Administrador | Cierra los tickets inactivos durante ese tiempo |
| `ticketmoveall <category> <category>` | `tmoveall` | Administrador | Mueve todos los tickets entre categorías |
| `ticketstats` | `tstats` | Nadie | Estadísticas de tickets del servidor |
| `ticketuserstats [@user]` | `tuserstats` | Nadie | Estadísticas de tickets de un miembro |

Los comandos de barra están bajo `/tickets` (crear panel, listar paneles, reclamar, cerrar, nota, archivar, prioridad, grupos de panel y ajustes, grupo de casos) y `/tickets setup` (wizard, quick-button, quick-menu, from-template, templates).

## Consejos y trampas habituales

- Los comandos que actúan sobre "el ticket actual" solo funcionan dentro de un canal de ticket. Ejecútalos en el ticket, no en un canal del staff.
- Cada tipo de ticket necesita roles de soporte; si no, solo los administradores pueden reclamar y nadie salvo quien abrió el ticket puede hablar una vez bloqueado el canal.
- El límite predeterminado es un ticket abierto por miembro y tipo. Aumenta **Máx. de tickets activos** en los tipos donde sea normal repetir tickets.
- **Cierre automático (horas)** y **Tiempo de respuesta requerido** se guardan en el tipo y se muestran en `buttoninfo`, pero lo único del bot que cierra tickets inactivos es `ticketcloseinactive` o la acción por lotes **Cerrar tickets inactivos**. Ejecútalo tú de forma periódica si quieres una limpieza automática.
- `removeoption` actualmente solo informa de éxito; usa `deleteselectoption` con el ID de la opción para quitarla de verdad.
- **Eliminar al cerrar** y **Bloquear al cerrar** interactúan: un ticket configurado para eliminarse no se bloquea primero, simplemente espera a que pase el retraso de eliminación.
- El JSON del embed del panel debe ser una salida válida del constructor de embeds. Usa el editor del panel y copia el JSON si prefieres los comandos.
- Eliminar un panel con tickets abiertos se rechaza salvo que pases `true`, lo que borra el vínculo de los tickets con el panel.
- Las transcripciones capturan como máximo 5000 mensajes, y el enlace "Ver transcripción" abre la transcripción en el panel.
