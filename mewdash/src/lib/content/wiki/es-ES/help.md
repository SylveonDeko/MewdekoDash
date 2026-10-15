---
title: Ayuda y comandos
slug: help
summary: Cómo encontrar y entender los comandos del bot desde dentro de Discord: el menú de ayuda por categorías, las descripciones generales de los módulos, las páginas de ayuda de cada comando, la búsqueda de comandos y el asistente de configuración del panel al que enlaza el bot cuando entra.
icon: fa-life-ring
category: General
module: Help
tags: [help, commands, modules, search command, slash commands, prefix, setup wizard, invite, guide, source, donate, vote, ayuda, comandos, módulos, buscar comando, comandos de barra, prefijo, asistente de configuración, invitación, guía, código fuente, donar, votar]
related: [permissions, administration, userprofile]
---

## Qué hace

El módulo de Ayuda es la forma en que los miembros descubren lo que puede hacer el bot. `help` (o `cmds`) abre un menú que lista las categorías de comandos con el número de módulos y de comandos de cada una, además de un desplegable para abrir una. Elegir una categoría muestra sus módulos; elegir un módulo muestra sus comandos, diez por página, con descripciones breves o, en el caso de los módulos muy grandes, primero una vista general dividida en secciones.

`help <command>` muestra un solo comando: su nombre y primer alias, qué hace, los permisos de Discord que necesitas tú y que necesita el bot, un enfriamiento si lo tiene, el comando de barra equivalente, cada parámetro, formas alternativas, ejemplos de uso y un enlace a la documentación. Un botón **Ejecutar** te permite ejecutar el comando directamente desde la página de ayuda, abriendo un formulario para sus argumentos si los tiene.

`searchcommand <term>` encuentra los comandos cuyo nombre o descripción contienen el término. Mencionar al bot sin texto responde con el prefijo actual y una indicación hacia `cmds`.

Cada comando tiene una versión de texto, que se usa con el prefijo del servidor, y en la mayoría de los casos una versión de barra. El menú de ayuda y las páginas de comandos son los mismos en ambos casos; `/help`, `/search` y `/invite` son los puntos de entrada con barra.

## Por qué usarlo

- Un miembro nuevo escribe `.help` y necesita un lugar razonable al que llegar.
- El staff quiere saber exactamente qué permiso necesita un comando antes de concederlo.
- Alguien recuerda la mitad del nombre de un comando y quiere buscarlo.
- Acabas de invitar al bot y quieres una configuración guiada en lugar de leer la documentación de cada módulo.

## El menú de ayuda

`help`, `commands` o `modules` sin argumentos abre el nivel superior. La descripción del embed explica las dos formas de entrar: elegir una categoría en el desplegable, o usar `h commandname` para un solo comando. También incluye enlaces a la documentación, al servidor de soporte, a la invitación y a las páginas de donaciones.

| Categoría | Contiene |
| --- | --- |
| Moderación y administración | Administration, Moderation, Permissions, Server Management, Role States, Status Roles, Counting Moderation |
| Configuración del servidor | MultiGreets, Role Greets, Starboard, Stat Channels, Suggestions, Tickets, Confessions, Channel Access, Custom Voice, Chat Triggers, Polls, Giveaways |
| Diversión y juegos | Games, Counting, NSFW, Searches, Minecraft, Switch |
| Economía y niveles | Currency, XP, Reputation, Vote, Patreon |
| Música | Music |
| Utilidades | Utility, Help, AFK, Todo, User Profile, Birthday, Highlights, Copr Monitoring |
| Propietario del bot | Módulos exclusivos del propietario |
| Otros | Todo lo que no esté archivado arriba |

Un botón **Alternar descripciones** cambia entre la lista compacta y un diseño más largo que lista cada módulo bajo su categoría con una marca de verificación o una cruz que indica si está activado para ti en el canal actual. Un globo con una cruz significa que los propietarios del bot han desactivado el módulo en todas partes.

### Páginas de módulo

`commands <module>` salta directamente a un módulo. El nombre puede ser exacto o un prefijo único, así que `cmds mod` abre Moderation mientras que `cmds s` se queja de que coinciden varios módulos. Añade una palabra tras el módulo para filtrar: `cmds utility remind` lista solo los comandos de Utility cuyo nombre o descripción mencione "remind".

Los módulos con más de 30 comandos y al menos tres secciones muestran primero una vista general: la descripción del módulo, un campo por sección con su número de comandos, un desplegable para abrir una sección, un botón **Todos los comandos**, un botón **Buscar** que abre un formulario y **Atrás**. Los módulos más pequeños van directamente a la lista paginada. Las páginas contienen diez comandos agrupados por sección, con botones de primera, anterior, saltar, siguiente, última, atrás y cerrar. El paginador permanece activo durante una hora.

## Páginas de comando

`help <command>` coincide con el nombre exacto o con cualquier alias. El embed contiene:

- El comando con su prefijo y primer alias, y su descripción.
- **Permisos del usuario**: lo que necesitas tú. Cuando una sustitución de permisos de Discord del módulo de Administración reemplaza el requisito integrado, el original se muestra tachado y la sustitución se lista a continuación.
- **Permisos del bot**: lo que necesita el bot.
- **Documentación**: un enlace a la página del comando en el sitio de documentación.
- **Enfriamiento**: se muestra solo cuando el comando lo tiene.
- **Comando de barra**: una mención en la que se puede hacer clic de la versión de barra cuando existe.
- **Parámetros**, **Sobrecargas** y **Uso** de la documentación del comando, que lista cada argumento, si es opcional y cualquier valor predeterminado.
- Un pie con el módulo, el submódulo y el nombre del método, útil al reportar errores.

El botón **Ejecutar** ejecuta el comando como si lo hubieras escrito tú. Si admite argumentos, primero un formulario los pide. Los administradores también ven un botón **Permisos** que abre el menú rápido de Permisos de comandos para ese comando, descrito en el artículo de Permisos de comandos.

## Comandos de barra frente a comandos de texto

Los comandos de texto usan el prefijo del servidor, `.` por defecto, y los nombres exactos del menú de ayuda. Los comandos de barra están agrupados, así que un comando de texto como `setprivacy` aparece como `/setprivacy` mientras que los comandos de permisos viven bajo `/permissions servercommand`. La página del comando muestra la mención de barra para que puedas hacer clic en ella. Ambas formas pasan por las mismas reglas de permisos.

## Cuando el bot entra

Cuando el bot se añade a un servidor, averigua quién lo invitó a partir del registro de auditoría (necesita Ver el registro de auditoría para ello) y le envía un MD. El mensaje tiene un botón **Configurar Mewdeko** que enlaza al asistente del panel para ese servidor, un recordatorio de tres pasos con `cmds`, `cmds mod` y `h purge`, y el enlace al servidor de soporte. Si no se puede identificar a quien invitó o tiene los MD cerrados, no se envía nada; no hay anuncio en ningún canal.

## El asistente de configuración

El asistente está en `/wizard?guild=<id>` en el panel. El enlace del MD de bienvenida abre la variante de configuración rápida; el propio panel puede ofrecer la variante de primera vez, que añade una comprobación de permisos al principio.

| Paso | Qué hace |
| --- | --- |
| Bienvenida | Explica lo que está a punto de ocurrir |
| Permisos | Solo la primera vez: comprueba que el bot tiene lo que necesita |
| Ajustes básicos del servidor | Prefijo, idioma del bot y zona horaria del servidor |
| Seleccionar funciones | Elige qué configurar; las funciones se marcan como configuración completa o activación rápida |
| Un paso por cada función de configuración completa | Configuración guiada de esa función |
| Activación rápida | Activa en bloque las funciones restantes con sus valores por defecto |
| Completado | Resumen, incluido lo que no se pudo guardar |

El progreso se guarda por servidor, así que salir y volver lo retoma. Un servidor se puede marcar como omitido para que el asistente deje de ofrecerse, y la página **Mis ajustes** tiene un interruptor para indicar si prefieres la configuración guiada y un restablecimiento del estado del asistente de un servidor.

## Ajustes

No hay nada que configurar para la ayuda en sí. El prefijo se establece con el módulo de Administración y se muestra en todos los embeds de ayuda.

| Ajuste | Predeterminado | Qué controla |
| --- | --- | --- |
| Prefijo | `.` | El prefijo que se muestra en los textos de ayuda y que usa el botón Ejecutar |
| Permisos detallados | desactivado | Si un comando bloqueado explica qué regla de permisos lo bloqueó (ver Permisos de comandos) |

## Guía de configuración

1. Ejecuta `help` y abre una categoría del desplegable para ver cómo se agrupan los módulos.
2. Ejecuta `cmds mod` para ver el módulo Moderation y luego `h purge` para ver un comando completo.
3. Prueba el botón **Ejecutar** en un comando inofensivo como `h ping`.
4. Ejecuta `searchcommand role` para ver cómo la búsqueda acota los resultados.
5. Si acabas de invitar al bot, sigue el enlace **Configurar Mewdeko** del MD de bienvenida, o abre `/wizard?guild=<your server id>` en el panel.

## Comandos

Ejecútalos con el prefijo de tu servidor (`.` salvo que lo hayas cambiado).

| Comando | Alias | Requiere | Para qué sirve |
| --- | --- | --- | --- |
| `help [command]` | `h` | Nadie | Menú de ayuda, o ayuda de un comando |
| `commands [module] [term]` | `cmds` | Nadie | Lista de módulos, los comandos de un módulo o una lista filtrada |
| `modules` | `mdls` | Nadie | El mismo menú de nivel superior que `help` |
| `searchcommand <term>` | | Nadie | Busca en los nombres y descripciones de comandos, hasta 20 resultados |
| `guide` | `readme` | Nadie | Enlace a la guía de inicio |
| `source` | `github`, `repo`, `gitlab`, `bitbucket` | Nadie | Enlace al código fuente |
| `donate` | | Nadie | Cómo apoyar al bot |
| `vote` | | Nadie | Enlace para votar por el bot |
| `exportcommandsjson` | `exportcommands`, `excj` | Nadie | Exporta todos los comandos como un archivo JSON (una vez por minuto) |

Solo con barra: `/search <command>` con autocompletado, y `/invite`. `/help`, `/commands <module> [filter]`, `/donate`, `/guide`, `/source` y `/vote` reflejan los comandos de texto.

## Consejos y trampas habituales

- Si `help` muestra una cruz junto a un módulo para ti, una regla de permisos o los propietarios del bot lo han desactivado en ese canal. Pide al staff que revise `listperms`.
- Las páginas de ayuda reflejan las condiciones previas reales del comando, así que un permiso listado ahí es el que vale aunque el sitio de documentación vaya por detrás.
- El botón Ejecutar usa tus propios permisos, no los del bot. Es una comodidad, no una forma de saltarse nada.
- La coincidencia de módulos por prefijo hace que los prefijos cortos suelan ser ambiguos; usa al menos tres o cuatro letras.
- El bot solo envía un MD a quien lo invitó al entrar. Si lo invitaste desde un enlace compartido y no recibiste nada, abre el asistente desde el panel.
