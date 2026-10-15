---
title: Ajustes
slug: settings
summary: Lo básico de todo el servidor: prefijo de comandos, idioma, zona horaria, canales de registro, rol de silenciado, caducidad de advertencias y algunas utilidades de chat.
icon: fa-cog
category: Settings
dashboard: /dashboard/settings
module: Administration
tags: [settings, prefix, language, locale, timezone, mute role, warn expire, command log, staff role, member role, snipe, link previews, delmsgoncmd, ajustes, prefijo, idioma, zona horaria, rol de silenciado, caducidad de advertencias, registro de comandos, rol de personal, rol de miembro, vistas previas de enlaces]
related: [administration, logging, filter, suggestions]
---

## Qué hace

La página de Ajustes reúne las pocas opciones que afectan a todos los módulos a la vez en lugar de a una sola función. Es donde cambias el prefijo que los miembros escriben antes de los comandos, el idioma en el que responde el bot, la zona horaria usada para los recordatorios y los mensajes programados, y los canales donde se registran el uso de comandos y las advertencias.

También cubre el nombre del rol de silenciado, si un miembro silenciado pierde sus otros roles, cuánto duran las advertencias y dos utilidades de chat: el snipe de mensajes y las vistas previas de enlaces de mensajes.

La mayoría de estos ajustes tienen un comando de texto equivalente, así que el personal también puede cambiarlos desde Discord. Unos pocos extras solo existen como comandos: el rol de personal, el rol de miembro y la eliminación de los mensajes de comandos por canal.

## Por qué usarlo

- Tu servidor ya usa `.` para otro bot y quieres a Mewdeko con `!` o `m!`.
- Tu comunidad habla un idioma distinto del inglés y quieres que las respuestas coincidan.
- Los recordatorios y las publicaciones programadas deben llegar a la hora local correcta, no en UTC.
- Los moderadores quieren un canal que registre cada comando ejecutado y cada advertencia emitida.
- Las advertencias deben desvanecerse tras un número de días en lugar de acumularse para siempre.
- Los miembros deberían poder hacer `snipe` de un mensaje eliminado, o las vistas previas de enlaces deberían desactivarse en un chat muy activo.

## Prefijo

El prefijo es el texto que un miembro escribe antes de un comando. Por defecto es `.`. Cualquiera puede ejecutar `prefix` sin argumento para ver el prefijo actual. Los administradores lo cambian con `prefix <new>` o, desde el panel, con el cuadro **Prefijo de comandos**. Los comandos de barra no se ven afectados por el prefijo.

## Idioma

Cada servidor puede elegir su propio idioma de respuesta con `languageset <code>`, por ejemplo `languageset de`, o con el desplegable **Idioma** del panel. `languageset default` borra el ajuste para que el servidor siga el idioma predeterminado del bot. `languageslist` imprime todos los códigos de idioma compatibles. `langsetdefault` sin argumento muestra el idioma predeterminado del bot; cambiar ese valor es una acción del propietario del bot.

## Zona horaria

La zona horaria del servidor determina los recordatorios, los mensajes programados y cualquier visualización de horas. `timezone` solo muestra el valor actual (UTC si no hay ninguno definido). `timezone <id>` la define usando un identificador de zona horaria IANA o de Windows como `Europe/London`, y `timezones` pagina los identificadores que acepta el bot. En el panel, **Zona horaria del servidor** se guarda en cuanto eliges un valor; no espera a **Guardar cambios**.

## Canales de registro

El **Canal de registro de comandos** registra el uso de comandos. Defínelo con `commandlogchannel #channel`; ejecuta el comando sin canal para desactivar el registro.

El **Canal de registro de advertencias** registra las advertencias emitidas por los comandos de moderación. Se define desde el panel.

## Advertencias

La **Caducidad de advertencias** se guarda en horas. Cero significa que las advertencias nunca caducan. El comando `warnexpire` funciona en cambio en días y lleva una segunda palabra: `warnexpire 30 clear` marca como borradas las advertencias de más de 30 días, `warnexpire 30 delete` las elimina. El intervalo aceptado es de 0 a 366 días, y `warnexpire 0` desactiva la caducidad.

## Rol de silenciado y retirada de roles

El **Rol de silenciado** es el nombre del rol al que se aplican los comandos y castigos de silenciar. Si no existe un rol con ese nombre, el bot lo crea. Desde Discord, `muterole @role` apunta el ajuste a un rol existente; el rol debe estar por debajo de tu rol más alto salvo que seas el propietario del servidor. `muterole` sin argumento muestra el rol de silenciado actual.

**Quitar todos los demás roles mientras esté silenciado** retira los demás roles de un miembro mientras dura el silencio y se los devuelve después. La forma del comando es `removeonmute y` o `removeonmute n`.

## Utilidades de chat

| Ajuste | Comando | Efecto |
| --- | --- | --- |
| Snipe de mensajes | `snipeset enable` o `snipeset disable` | Permite a los miembros usar los comandos snipe para recuperar mensajes eliminados o editados recientemente. Desactivado por defecto. |
| Vistas previas de enlaces de mensajes | `previewlinks y` o `previewlinks n` | Cuando alguien publica un enlace a un mensaje de Discord, el bot muestra el contenido de ese mensaje. |

## Ajustes solo por comandos

Forman parte del mismo módulo Administración pero no tienen control en el panel.

El **Rol de personal** (`staffrole @role`) marca un rol cuyos miembros están exentos de los filtros de palabras, enlaces e invitaciones, y de las comprobaciones de spam de sugerencias. Ejecuta `staffrole` sin rol para ver el actual y `staffroledisable` para borrarlo.

El **Rol de miembro** (`memberrole @role`) guarda un rol para el servidor. Se registra, pero ahora mismo no lo usa ninguna función.

**Eliminar mensaje al ejecutar comando** (`delmsgoncmd`) elimina el mensaje que activó un comando una vez que el comando se ejecuta:

| Forma | Efecto |
| --- | --- |
| `delmsgoncmd` | Activa o desactiva la eliminación para todo el servidor |
| `delmsgoncmd list` | Muestra el ajuste del servidor y cada excepción de canal |
| `delmsgoncmd channel enable [#channel]` | Elimina siempre en ese canal (el canal actual si se omite) |
| `delmsgoncmd channel disable [#channel]` | No elimina nunca en ese canal |
| `delmsgoncmd channel inherit [#channel]` | Sigue el ajuste del servidor |

## Ajustes

Todo lo siguiente está en la única página de **Ajustes del bot**. Pulsa **Guardar cambios** después de editar; solo la **Zona horaria del servidor** se guarda por sí sola.

| Ajuste | Por defecto | Qué controla |
| --- | --- | --- |
| Prefijo de comandos | `.` | Texto que se escribe antes de los comandos |
| Canal de registro de comandos | ninguno | Canal donde se registra el uso de comandos |
| Emoji de moneda | ninguno | Emoji que se muestra para la moneda del servidor |
| Canal de registro de advertencias | ninguno | Canal donde se registran las advertencias |
| Caducidad de advertencias | 0 (nunca) | Horas hasta que caducan las advertencias |
| Idioma | Predeterminado del bot | Idioma de respuesta de este servidor |
| Zona horaria del servidor | UTC | Zona horaria de los mensajes programados, los recordatorios y la visualización de horas |
| Rol de silenciado | Muted | Nombre del rol que aplican los silencios y los castigos |
| Quitar todos los demás roles mientras esté silenciado | Desactivado | Retira los demás roles mientras dure un silencio |
| Snipe de mensajes | Desactivado | Permite los comandos snipe |
| Vistas previas de enlaces de mensajes | Desactivado | Expande los enlaces de mensajes de Discord |

> [!NOTE]
> La página solo cubre lo básico compartido. El registro, la moderación, el starboard y otras funciones tienen sus propias páginas con sus propios ajustes.

## Guía de configuración

1. Abre **Ajustes** en el panel.
2. Define el **Prefijo de comandos** si `.` choca con otro bot.
3. Elige un **Idioma** y una **Zona horaria del servidor**.
4. Elige un **Canal de registro de comandos** y un **Canal de registro de advertencias** que solo pueda leer el personal.
5. Define la **Caducidad de advertencias** en horas, por ejemplo `720` para treinta días, o déjala en 0.
6. Comprueba que el nombre del **Rol de silenciado** coincide con el rol que ya usan tus moderadores, o déjalo como `Muted` y deja que el bot cree uno.
7. Activa **Snipe de mensajes** o **Vistas previas de enlaces de mensajes** si los quieres.
8. Pulsa **Guardar cambios**.
9. En Discord, ejecuta `staffrole @YourStaffRole` para que los filtros y los límites de sugerencias omitan a tu equipo.

## Comandos

Ejecútalos con el prefijo de tu servidor (`.` salvo que lo hayas cambiado).

| Comando | Alias | Requiere | Propósito |
| --- | --- | --- | --- |
| `prefix [new prefix]` | | Nadie para verlo, Administrador para cambiarlo | Muestra o define el prefijo de comandos |
| `languageset <code>` | `langset` | Administrador | Define el idioma de respuesta del servidor, o `default` para borrarlo |
| `langsetdefault` | `langsetd` | Nadie para verlo, Propietario del bot para cambiarlo | Muestra o define el idioma predeterminado de todo el bot |
| `languageslist` | `langli` | Nadie | Enumera los códigos de idioma compatibles |
| `timezone [id]` | | Nadie para verla, Administrador para cambiarla | Muestra o define la zona horaria del servidor |
| `timezones` | | Nadie | Pagina los identificadores de zona horaria aceptados |
| `commandlogchannel [#channel]` | `commandlog`, `logcommands` | Administrador | Define el canal de registro de comandos, o lo desactiva si no se indica canal |
| `warnexpire <days> <clear or delete>` | `warne` | Administrador | Hace caducar las advertencias tras un número de días |
| `muterole [@role]` | `setmuterole` | Gestionar roles | Muestra o define el rol de silenciado |
| `removeonmute <y or n>` | | Administrador | Retira los demás roles mientras esté silenciado |
| `snipeset <enable or disable>` | `setsnipe` | Administrador | Permite o bloquea los comandos snipe |
| `previewlinks <y or n>` | `plinks` | Administrador | Expande los enlaces de mensajes de Discord |
| `staffrole [@role]` | | Administrador | Muestra o define el rol de personal |
| `staffroledisable` | | Administrador | Borra el rol de personal |
| `memberrole [@role]` | | Administrador | Muestra o define el rol de miembro |
| `delmsgoncmd [list or channel <state> [#channel]]` | `dmc` | Administrador | Elimina los mensajes de comandos en todo el servidor o por canal |

## Consejos y advertencias

- `delmsgoncmd` necesita que el bot tenga Gestionar mensajes; de lo contrario, el comando se niega a ejecutarse.
- El panel guarda la caducidad de advertencias en horas, mientras que `warnexpire` usa días. `warnexpire 1` y un valor de `24` en el panel son lo mismo.
- `muterole` compara el rol que indicas con tu propio rol más alto. Si da un error de permisos insuficientes, pide al propietario que lo haga o elige un rol más bajo.
- Los comandos de barra ignoran por completo el prefijo, así que un cambio de prefijo solo afecta a los comandos de texto.
- La exención del rol de personal solo cubre los filtros y las comprobaciones de spam de sugerencias. No concede permisos de comandos; usa el módulo Permisos para eso.
