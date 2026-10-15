---
title: Utilidades
slug: utility
summary: Una caja de herramientas con ayudas del día a día, desde alias de comandos, citas y recordatorios hasta publicación automática, roles de directo, un asistente de IA, conteo de mensajes y repetidores.
icon: fa-wrench
category: Actions
dashboard: /dashboard/utility
module: Utility
tags: [alias, quotes, auto publish, stream role, ai, chatbot, nsfw filter, role monitor, reminder, snipe, repeater, sticky, message count, invites, embed, calculator, userinfo, serverinfo, alias de comandos, citas, publicación automática, rol de directo, ia, asistente, filtro nsfw, monitor de roles, recordatorio, repetidor, conteo de mensajes, invitaciones, calculadora, información de usuario, información del servidor]
related: [repeaters, polls, invites, messagestats, embedbuilder, xp, administration, moderation]
---

## Qué hace

Utilidades es el módulo comodín para las pequeñas funciones que casi todos los servidores acaban queriendo. Los miembros disponen de recordatorios, citas, tiradas de dados, una calculadora, conversión de unidades y comandos de información sobre usuarios, roles, canales y el servidor. El staff cuenta con alias de comandos, mensajes repetidos, publicación automática para canales de anuncios, un rol que acompaña a los miembros mientras están en directo, captura de mensajes borrados, conteo de mensajes y seguimiento de invitaciones.

La página **Utilidades** del panel reúne las partes que se manejan mejor con un formulario: alias, citas, publicación automática, rol de directo, el asistente de IA, el filtro de etiquetas NSFW y el monitor de roles. Todo lo demás funciona solo con comandos.

Como este módulo es muy amplio, cada subfunción se describe por separado a continuación. La tabla de comandos del final lista todos los comandos del módulo.

## Por qué usarlo

- Acorta `play youtube` a `yt` para todo el servidor con un alias.
- Mantén un libro de citas compartido al que los miembros pueden añadir y del que pueden sacar líneas al azar.
- Haz que cada publicación de tu canal de anuncios se publique automáticamente a los seguidores.
- Da a los miembros un rol "En directo" solo mientras emiten un juego concreto.
- Publica las normas o un aviso fijo cada pocos minutos, o solo cuando el canal esté activo.
- Permite que los miembros programen recordatorios para sí mismos o para un canal.
- Ejecuta un asistente de IA en un canal usando tu propia clave de API.

## Alias

Un alias es una palabra disparadora que el bot reescribe como otro comando antes de ejecutarlo. `alias yt play youtube` significa que `.yt lofi` se ejecuta como `.play youtube lofi`. El disparador debe ser la primera palabra del mensaje; lo que venga después se añade al comando asignado. Los disparadores más largos se comprueban primero. Ejecutar `alias <trigger>` sin equivalencia lo elimina, y `aliasesclear` los elimina todos.

En el panel, la pestaña **Alias** tiene los campos **Disparador del alias** y **Equivalencia del alias**, un cuadro de búsqueda y una lista de la que puedes eliminar.

## Citas

Las citas son textos cortos archivados bajo una palabra clave. `quoteadd <keyword> <text>` guarda una, `quoteprint <keyword>` (o `..`) muestra una cita al azar de esa palabra clave y `quoteshow <id>` muestra una concreta. `quotesearch` busca por palabra clave y texto, `quoteid` muestra quién añadió una cita y `listquotes` las pagina ordenadas por palabra clave o por fecha de alta. Cualquiera puede añadir citas. Una cita puede eliminarla el miembro que la añadió o un administrador; borrar todas las citas de una palabra clave, exportar a JSON e importar desde un archivo JSON adjunto requieren Administrador.

La pestaña **Citas** te permite añadir, editar, buscar y eliminar citas.

## Publicación automática

En los canales de anuncios de Discord hay que publicar cada mensaje a mano. `addautopublish #channel` hace que el bot publique cada mensaje nuevo de ese canal. Dos listas negras por canal omiten mensajes: `addpublishblacklist @user #channel` ignora a un usuario y `addpublishblacklist #channel word` ignora cualquier mensaje que contenga esa palabra, sin distinguir mayúsculas de minúsculas. `getautopublishes` muestra todos los canales con sus listas negras.

La pestaña **Publicación automática** añade canales y gestiona las listas **Omitir mensajes de estos usuarios** y **Omitir mensajes que contengan estas palabras**.

## Rol de directo

`streamrole <fromRole> <addRole>` da **addRole** a cualquier miembro de **fromRole** mientras esté en directo y se lo quita cuando termina. `streamrolekeyword <keyword>` lo limita a los directos cuyo título contenga la palabra clave; ejecútalo sin palabra clave para quitarla. Los miembros de la lista blanca reciben el rol mientras emiten aunque la palabra clave no coincida, y los de la lista negra nunca lo reciben. `streamrole` sin argumentos desactiva la función. Si el bot pierde el permiso para gestionar el rol, o el rol se elimina, la función se desactiva sola.

La pestaña **Rol de directo** tiene **Rol elegible**, **Rol durante el directo**, **Palabra clave del título del directo** y una lista blanca y una lista negra por ID de usuario.

## Asistente de IA

El asistente responde a cada mensaje publicado en un canal elegido y guarda como contexto los últimos cinco intercambios de cada miembro. Escribir `deletesession` en ese canal borra tu propia conversación.

| Ajuste | Comando | Qué hace |
| --- | --- | --- |
| Canal | `aichannel [#channel] [enabled]` | El único canal en el que escucha el asistente |
| Proveedor y modelo | `aimodel <OpenAi\|Groq\|Claude> [model]` | Qué API y qué modelo se usan |
| Clave de API | `aikey` | Tu propia clave para ese proveedor; el bot la guarda y no vuelve a mostrarla |
| Prompt del sistema | `aiprompt <text>` | Instrucciones que sigue el modelo |
| Búsqueda web | `aiwebsearch <true\|false>` | Permite que el modelo busque en la web (solo Claude) |
| Webhook | `aiwebhook [name] [avatarUrl]` | Publica las respuestas mediante un webhook con nombre y avatar personalizados |
| Embed personalizado | `aicustomembed [template]` | Envuelve las respuestas en un embed; `%airesponse%` marca dónde va la respuesta |

`aiconfig` muestra la configuración actual. La pestaña **Asistente de IA** tiene **Asistente activado**, **Canal**, **Proveedor**, **Modelo**, **Clave de API**, **Prompt del sistema**, **Permitir búsqueda web** y **Ocultar los avisos de "buscando en la web"**.

> [!WARNING]
> El asistente funciona con tu clave de API y se carga a tu factura. Si no hay una clave configurada, los mensajes del canal reciben una respuesta de error.

## Filtro NSFW

La pestaña **Filtro NSFW** lista las etiquetas bloqueadas para las búsquedas de imágenes del módulo NSFW. Escribe una etiqueta en **Etiqueta a bloquear** para añadirla, o haz clic en una para quitarla. El comando equivalente es `nsfwtagbl [tag]` del módulo NSFW; sin etiqueta muestra la lista negra actual.

## Monitor de roles

La pestaña **Monitor de roles** configura el monitor de roles del módulo Gestión del servidor, que reacciona cuando se concede un rol o permiso que hayas marcado como protegido. Elige un **Castigo predeterminado** (solo revertir el cambio, avisar, quitar todos los roles, silenciar, aislar temporalmente, expulsar o banear), añade los roles y permisos que quieres proteger y lista los **Roles de confianza** y **Miembros de confianza** que quedan exentos. Los comandos (`addblacklistedrole`, `addblacklistedpermission`, `whitelistuser`, `whitelistrole`, `setdefaultpunishment`, `listblacklists`) son exclusivos del propietario del servidor y pertenecen a Gestión del servidor.

## Recordatorios

`remind me <time> <message>` te envía un MD más tarde; `remind here <time> <message>` publica en el canal actual; `remind #channel <time> <message>` apunta a otro canal y requiere Gestionar mensajes. El tiempo se escribe como `2h30m`, `3 days`, `1w` o `in 45 minutes`, y puede ser como máximo de 60 días. `remindlist` muestra tus recordatorios con su número de índice y `reminddelete <index>` elimina uno. Las menciones del mensaje se neutralizan a menos que puedas mencionar a todos en ese canal.

## Snipe

El snipe está desactivado hasta que un administrador ejecuta `snipeset enable`. Una vez activo, el bot conserva los mensajes borrados y editados durante 30 días. `snipe [#channel] [@user]` muestra el último mensaje borrado, `editsnipe` la última edición, y `snipelist` y `editsnipelist` muestran los últimos cinco (o la cantidad que indiques), filtrados por canal o usuario.

## Repetidores

Un repetidor publica un mensaje según una programación. `repeat <message>` usa un intervalo de cinco minutos; `repeat <interval> <message>` establece uno entre 5 segundos y 25000 minutos; `repeat <time of day> <message>` se ejecuta una vez al día. Cada repetidor tiene un índice que muestra `repeatlist`.

| Modo de activación | Comportamiento |
| --- | --- |
| `timeinterval` | Publica en cada intervalo (predeterminado) |
| `onactivity` | Publica cuando el canal recibe un número de mensajes dentro de una ventana de tiempo (`repeatactivity`) |
| `onnoactivity` | Publica cuando el canal ha estado en silencio durante la ventana |
| `immediate` | Publica de inmediato y después sigue el intervalo |
| `aftermessages` | Publica tras un número determinado de mensajes |

Otros interruptores por repetidor: `repeatredun` evita publicar si el mensaje del repetidor ya es el último del canal; `repeatschedule <business\|evening\|weekend\|custom>` limita cuándo se ejecuta; `repeatconversation` activa o desactiva la detección de conversaciones; `repeatpriority` ordena los repetidores de 0 a 100; `repeatthreadonly` y `repeatthreadautosticky` apuntan a hilos; `repeatforumtags` restringe las publicaciones de foro por etiqueta; `repeatsuppressnotifications` envía en silencio; `repeattoggle` pausa.

## Conteo de mensajes e invitaciones

`togglemsgcount` activa el conteo de mensajes. `usermessages`, `channelmessages`, `servermessages` y `topusers` informan de los recuentos, `activitygraph` dibuja las horas o días de mayor actividad y `minmsglength` ignora los mensajes más cortos que una longitud dada. `resetmessagecounts` borra los recuentos de un usuario, un canal o ambos tras pedir confirmación.

El seguimiento de invitaciones registra quién invitó a cada miembro. `invites`, `whoinvited`, `invitedusers` y `inviteleaderboard` leen los datos. `toggleinvitetracking`, `toggleremoveinviteonleave` y `setminaccountage <days>` lo controlan; las cuentas más recientes que la edad mínima no se cuentan.

## Ajustes

La página del panel se divide en pestañas: **Alias**, **Citas**, **Publicación automática**, **Rol de directo**, **Asistente de IA**, **Filtro NSFW** y **Monitor de roles**.

| Ajuste | Predeterminado | Qué controla |
| --- | --- | --- |
| Disparador y equivalencia del alias | ninguno | La palabra a reescribir y el comando en el que se convierte |
| Palabra clave y texto de la cita | ninguno | Una cita guardada |
| Canales de publicación automática | ninguno | Canales de anuncios en los que el bot publica |
| Omitir mensajes de estos usuarios / que contengan estas palabras | ninguno | Listas negras de publicación por canal |
| Rol elegible | ninguno | Miembros que pueden recibir el rol de directo |
| Rol durante el directo | ninguno | El rol que se añade y se quita |
| Palabra clave del título del directo | cualquier directo | Solo cuentan los directos cuyo título contenga este texto |
| Asistente activado | desactivado | Si el canal de IA responde o no |
| Proveedor, Modelo, Clave de API, Prompt del sistema | ninguno | Configuración de la IA |
| Permitir búsqueda web | desactivado | Búsqueda web de Claude |
| Ocultar los avisos de "buscando en la web" | activado | Oculta los mensajes de estado de búsqueda web del modelo |
| Etiquetas bloqueadas | ninguna | Etiquetas de búsqueda NSFW que se filtran |
| Castigo predeterminado | usar el predeterminado | Acción del monitor de roles |

El snipe, el conteo de mensajes, el seguimiento de invitaciones, los repetidores, los recordatorios y las vistas previas de enlaces no tienen controles en el panel.

## Guía de configuración

1. Abre **Utilidades** en el panel.
2. En **Alias**, añade un disparador como `yt` asignado a `play youtube`. Pruébalo en Discord.
3. En **Publicación automática**, añade tu canal de anuncios. Añade a la lista de omitidos cualquier bot o usuario de webhook.
4. En **Rol de directo**, elige el rol elegible y el rol que se añadirá, y opcionalmente una palabra clave del título. Comprueba que el rol del bot esté por encima del rol que añade.
5. En **Asistente de IA**, elige un canal, un proveedor y un modelo, pega tu clave, escribe un prompt del sistema y actívalo.
6. En Discord, ejecuta `snipeset enable` si quieres el snipe de mensajes borrados y `togglemsgcount` para las estadísticas de mensajes.

## Comandos

Ejecútalos con el prefijo de tu servidor (`.` salvo que lo hayas cambiado).

| Comando | Alias | Requiere | Para qué sirve |
| --- | --- | --- | --- |
| `alias <trigger> [mapping]` | `cmdmap` | Administrador | Añade un alias, o lo elimina si no indicas equivalencia |
| `aliaslist` | `cmdmaplist`, `aliases` | Nadie | Lista los alias |
| `aliasesclear` | `aliasclear` | Administrador | Elimina todos los alias |
| `quoteadd <keyword> <text>` | `.` | Nadie | Añade una cita |
| `quoteprint <keyword>` | `..` | Nadie | Cita al azar de una palabra clave |
| `quoteshow <id>` | | Nadie | Muestra una cita por ID |
| `quotesearch <keyword> <text>` | `qsearch` | Nadie | Busca una cita por palabra clave y texto |
| `quoteid <id>` | `qid` | Nadie | Quién añadió una cita |
| `listquotes [page] [order]` | `liqu` | Nadie | Pagina las citas |
| `quotedelete <id>` | `qdel` | Nadie (citas propias) o Administrador | Elimina una cita |
| `delallquotes <keyword>` | `daq`, `delallq` | Administrador | Elimina todas las citas de una palabra clave |
| `quoteexport` | `qexport` | Administrador | Exporta las citas como JSON |
| `quoteimport` | `qimport` | Administrador | Importa citas desde un archivo JSON adjunto |
| `addautopublish <#channel>` | `addautopub`, `aap` | Administrador | Publica automáticamente un canal de noticias |
| `removeautopublish <#channel>` | `removeautopub` | Administrador | Deja de publicar automáticamente |
| `addpublishblacklist <@user> <#channel>` o `<#channel> <word>` | `addpubbl` | Administrador | Omite a un usuario o una palabra |
| `removepublishblacklist <@user> <#channel>` o `<#channel> <word>` | `removepubbl` | Administrador | Quita una omisión |
| `getautopublishes` | `getaps` | Administrador | Lista los canales de publicación automática |
| `streamrole [fromRole] [addRole]` | | Gestionar roles | Establece el rol de directo, o lo desactiva si no indicas roles |
| `streamrolekeyword [keyword]` | `srkw` | Gestionar roles | Exige una palabra clave en el título del directo |
| `streamroleblacklist <add\|remove> <@user>` | `srbl` | Gestionar roles | No dar nunca el rol a este miembro |
| `streamrolewhitelist <add\|remove> <@user>` | `srwl` | Gestionar roles | Dar siempre el rol a este miembro mientras esté en directo |
| `aichannel [#channel] [enabled]` | `aic` | Gestionar servidor | Establece el canal de IA |
| `aimodel <provider> [model]` | `aim` | Gestionar servidor | Proveedor y modelo |
| `aikey` | `ak` | Administrador | Establece la clave de API |
| `aiprompt <text>` | `aip` | Gestionar servidor | Prompt del sistema |
| `aiwebsearch <true\|false>` | `aws` | Gestionar servidor | Búsqueda web de Claude |
| `aiwebhook [name] [avatar]` | `aiw` | Administrador | Responde mediante un webhook, o lo desactiva si no indicas nombre |
| `aicustomembed [template]` | `aice` | Administrador | Plantilla de embed para las respuestas |
| `aiconfig` | `ac` | Nadie | Muestra los ajustes de IA |
| `remind <me\|here> <time> <message>` | | Nadie | Programa un recordatorio |
| `remind <#channel> <time> <message>` | | Gestionar mensajes | Recordatorio en otro canal |
| `remindlist` | `remindl`, `remindlst` | Nadie | Tus recordatorios |
| `reminddelete <index>` | `remindrm`, `reminddel` | Nadie | Elimina un recordatorio |
| `snipeset <enable\|disable>` | `setsnipe` | Administrador | Activa o desactiva el snipe |
| `snipe [#channel] [@user]` | | Nadie | Último mensaje borrado |
| `editsnipe [#channel] [@user]` | | Nadie | Último mensaje editado |
| `snipelist [#channel] [@user] [amount]` | `slist` | Nadie | Mensajes borrados recientes |
| `editsnipelist [#channel] [@user] [amount]` | `esnipelist` | Nadie | Mensajes editados recientes |
| `repeat [time] [interval] <message>` | | Gestionar mensajes | Crea un repetidor |
| `repeatlist` | `replst`, `replist`, `repli` | Gestionar mensajes | Lista los repetidores |
| `repeatremove <index>` | `reprm` | Gestionar mensajes | Elimina un repetidor |
| `repeatinvoke <index>` | `repinv` | Gestionar mensajes | Publicarlo ahora |
| `repeatmessage <index> <message>` | `repmsg` | Gestionar mensajes | Cambia el texto |
| `repeatchannel <index> [#channel]` | `repchan` | Gestionar mensajes | Lo mueve |
| `repeatredun <index>` | `repred` | Gestionar mensajes | Activa o desactiva la comprobación de redundancia |
| `repeattriggermode <index> <mode>` | `reptriggermode`, `repmode` | Gestionar mensajes | Modo de activación de la tabla anterior |
| `repeatactivity <index> <messages> <window>` | `repactivity`, `repact` | Gestionar mensajes | Umbral de actividad |
| `repeatpriority <index> <0-100>` | `reppriority`, `repprio` | Gestionar mensajes | Prioridad |
| `repeatschedule <index> <preset>` | `repschedule`, `repsched` | Gestionar mensajes | Horario por franja del día |
| `repeatconversation <index>` | `repconversation`, `repconv` | Gestionar mensajes | Activa o desactiva la detección de conversaciones |
| `repeattoggle <index>` | `reptoggle`, `reptog` | Gestionar mensajes | Pausa o reanuda |
| `repeatthreadautosticky <index>` | `repthreadauto`, `repthreads` | Gestionar mensajes | Fijo en hilos nuevos |
| `repeatthreadonly <index>` | `repthreadonly`, `reptonly` | Gestionar mensajes | Publica solo en hilos |
| `repeatsuppressnotifications <index>` | `repsuppressnotif`, `repsilent`, `repsuppress` | Gestionar mensajes | Envía en silencio |
| `repeatforumtags <index> <action> [tagType] [tags]` | `repforumtags`, `repftags` | Gestionar mensajes | Reglas de etiquetas de foro |
| `togglemsgcount` | `togglemessagecount` | Administrador | Activa o desactiva el conteo de mensajes |
| `minmsglength [length]` | `mmlength`, `minmlength` | Gestionar servidor | Ignora los mensajes cortos |
| `usermessages [@user]` | `usermsg`, `umsg` | Nadie | Estadísticas de mensajes de un miembro |
| `channelmessages [#channel]` | `channelmsg`, `cmsg` | Nadie | Estadísticas de mensajes de un canal |
| `servermessages` | `servermsg`, `smsg`, `guildmessages`, `guildmsg`, `gmsg` | Nadie | Estadísticas de todo el servidor |
| `topusers` | `topu` | Nadie | Los diez primeros por número de mensajes |
| `activitygraph [days\|hours]` | `actgraph` | Nadie | Gráfico de las horas de más actividad |
| `resetmessagecounts [@user] [#channel]` | `rmc`, `resetmsgcounts`, `resetmessages`, `resetcounts` | Gestionar mensajes | Reinicia los recuentos |
| `invites [@user]` | | Nadie | Número de invitaciones |
| `whoinvited [@user]` | `invitedby` | Nadie | Quién invitó a un miembro |
| `invitedusers [@user]` | `userinvites` | Nadie | Miembros a los que alguien invitó |
| `inviteleaderboard` | `inviteslb` | Nadie | Los que más invitan |
| `invitesettings` | `inviteconfig` | Gestionar servidor | Muestra los ajustes de invitaciones |
| `toggleinvitetracking` | | Gestionar servidor | Activa o desactiva el seguimiento |
| `toggleremoveinviteonleave` | `triol` | Gestionar servidor | Descuenta las invitaciones cuando el invitado se va |
| `setminaccountage <days>` | `inviteminage` | Gestionar servidor | Ignora las cuentas recientes |
| `joinstats` | `jstats` | Marca beta (`dragon`) | Gráfico de entradas |
| `leavestats` | `lstats` | Marca beta (`dragon`) | Gráfico de salidas |
| `joinstatscolor [r g b]` | `jstatscolor` | Marca beta (`dragon`) | Color del gráfico de entradas, dorado si no indicas valores |
| `leavestatscolor [r g b]` | `lstatscolor` | Marca beta (`dragon`) | Color del gráfico de salidas, dorado si no indicas valores |
| `userinfo [@user]` | `uinfo` | Nadie | Detalles del miembro |
| `serverinfo [name]` | `sinfo` | Nadie | Detalles del servidor |
| `channelinfo [#channel]` | `cinfo` | Nadie | Detalles del canal de texto |
| `vinfo [channel]` | `voiceinfo` | Nadie | Detalles del canal de voz |
| `rinfo <role>` | `roleinfo` | Nadie | Detalles del rol |
| `fetch <id>` | | Nadie | Busca a cualquier usuario por ID |
| `avatar [@user]` | `av` | Nadie | Avatar, con un botón para el avatar del servidor |
| `banner [@user]` | `userbanner` | Nadie | Banner del usuario |
| `userid [@user]` | `uid` | Nadie | ID del usuario |
| `roleid <role>` | `rid` | Nadie | ID del rol |
| `channelid` | `cid` | Nadie | ID del canal |
| `serverid` | `sid` | Nadie | ID del servidor |
| `roles [@user]` | | Nadie | Roles del servidor, o los de un miembro |
| `inrole <role>` | | Nadie | Miembros con un rol |
| `inroles <role> <role>` | | Nadie | Miembros con ambos roles |
| `rolepermlist [and\|or] <permissions...>` | `roleperms` | Nadie | Roles que tienen ciertos permisos |
| `channeltopic [#channel]` | `ct` | Nadie | Tema del canal |
| `whosplaying <game>` | `whpl` | Nadie | Miembros que juegan a un juego |
| `emotelist [type]` | | Nadie | Emotes del servidor |
| `showemojis <emojis>` | `se` | Nadie | Amplía emojis |
| `say [#channel] <text or embed JSON>` | | Gestionar mensajes | Habla como el bot |
| `getjson <messageId> [#channel]` | | Gestionar mensajes | JSON del embed de un mensaje |
| `embedsave <name> <json>` | `esave` | Nadie | Guarda una plantilla de embed personal |
| `guildembedsave <name> <json>` | `gesave`, `gembedsave` | Gestionar mensajes | Guarda una plantilla de embed del servidor |
| `embedlist` / `guildembedlist` | `elist` / `gelist`, `gembedlist` | Nadie | Lista las plantillas |
| `embeddelete <name>` / `guildembeddelete <name>` | `edel`, `edelete` / `gedel`, `gembeddelete` | Nadie / Gestionar mensajes | Elimina una plantilla |
| `embedpreview <name>` | `epreview`, `eprev` | Nadie | Vista previa de una plantilla |
| `debugembed <text>` | `embeddebug` | Administrador | Prueba el análisis de un embed |
| `savechat <time> [#channel]` | | Gestionar mensajes | Guarda un registro del chat y da un enlace |
| `calculate <expression>` | `calc` | Nadie | Evalúa una operación matemática |
| `calcops` | | Nadie | Operaciones matemáticas disponibles |
| `plot <function> [start] [end]` | `graphfunction` | Nadie | Grafica una función |
| `sym <expression>` | `symbolicmath` | Nadie | Matemáticas simbólicas |
| `convertunits <from> <to> <value>` | `unitconvert`, `units` | Nadie | Conversión de unidades |
| `convertlist` | | Nadie | Unidades compatibles |
| `convert <format>` | | Nadie | Convierte un archivo multimedia adjunto |
| `roll <dice>` | | Nadie | Tira dados, admite notación DnD |
| `owoify <text>` | `owo` | Nadie | Convierte el texto a OwO |
| `vcheck [url]` | `viruscheck` | Nadie | Análisis de VirusTotal de un enlace |
| `traceroute <host>` | `tracert`, `trcrt` | Nadie | Traza la ruta hasta un host |
| `pingip <ip> [count]` | | Nadie | Hace ping a una dirección, hasta 10 veces |
| `previewlinks <yes\|no>` | `plinks` | Administrador | Activa o desactiva las vistas previas de enlaces |
| `verboseerror [true\|false]` | `ve` | Gestionar mensajes | Activa o desactiva los errores detallados de comandos |
| `ping` | | Nadie | Latencia del bot |
| `stats` | | Nadie | Estadísticas del bot |
| `invite` | | Nadie | Invitación del bot y enlaces de soporte |
| `vote` | | Nadie | Enlace para votar |

## Consejos y trampas habituales

- Un alias solo reescribe el texto; el comando asignado se ejecuta igualmente con sus propias comprobaciones de permisos.
- La publicación automática solo funciona en los canales de anuncios (noticias) de Discord.
- El rol de directo necesita que el rol del bot esté por encima del rol que añade. Si no puede gestionar el rol, la función se desactiva sola en lugar de fallar en silencio con cada directo.
- El snipe está desactivado de forma predeterminada, y los mensajes de más de 30 días se descartan.
- Los recordatorios de más de 60 días se rechazan.
- El asistente de IA solo responde en el único canal configurado e ignora a los bots. Su memoria son los últimos cinco mensajes por miembro, así que las conversaciones largas pierden el contexto inicial.
- El conteo de mensajes tiene que estar activado antes de que existan estadísticas; no se cuenta nada de forma retroactiva.
- `joinstats` y `leavestats` se pueden ejecutar una vez cada diez segundos.
