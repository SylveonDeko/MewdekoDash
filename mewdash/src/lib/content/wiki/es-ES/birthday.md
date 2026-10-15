---
title: Cumpleaños
slug: birthday
summary: Los miembros definen su cumpleaños en su perfil y se apuntan, y el bot lo anuncia en un canal, opcionalmente con un rol de cumpleaños temporal y una mención de rol.
icon: fa-birthday-cake
category: Community
dashboard: /dashboard/birthday
module: Birthday
tags: [birthday, birthdays, bday, celebrate, birthday role, announcement, timezone, age, profile, cumpleaños, celebrar, rol de cumpleaños, anuncio, zona horaria, edad, perfil]
related: [utility, administration]
---

## Qué hace

Un miembro define su cumpleaños una vez con `setbirthday` y luego ejecuta `birthdayannouncements` en cualquier servidor que tenga la función activada. Cada día, el bot comprueba quién cumple años, publica un mensaje en el canal de anuncios y puede dar un rol de cumpleaños durante 24 horas. Si hay un rol a mencionar definido, se menciona antes del mensaje.

Los cumpleaños se guardan en el perfil del miembro en el bot, no por servidor, así que un solo `setbirthday` cubre todos los servidores que comparte con el bot. Que un cumpleaños se anuncie en un servidor concreto depende de tres cosas: que el miembro se haya apuntado, que su perfil no sea privado y que su modo de visualización del cumpleaños no esté desactivado.

Cualquiera puede ver quién está de celebración con `birthdaytoday` y quién se acerca con `birthdaylist`. La edad se muestra junto al nombre salvo que el miembro haya elegido un modo de visualización que oculte el año.

El personal configura el canal, los roles y el mensaje desde la página de **Cumpleaños** del panel o con los comandos `birthday*`.

## Por qué usarlo

- Servidores de comunidad que quieren una publicación diaria de «feliz cumpleaños» sin que nadie controle las fechas a mano.
- Dar a los miembros un rol de cumpleaños de color durante el día para que destaquen en el chat.
- Mencionar un rol de «equipo de cumpleaños» para que la gente vea de verdad el anuncio.
- Dejar que los miembros elijan cuánto de su cumpleaños es público, hasta ocultarlo por completo.

## Quién se anuncia

Un miembro se incluye en los anuncios y las listas solo cuando se cumplen todas estas condiciones:

| Requisito | Cómo lo controla el miembro |
| --- | --- |
| Hay un cumpleaños definido | `setbirthday <date>` |
| Se ha apuntado a los anuncios | `birthdayannouncements` lo activa o desactiva; desactivado por defecto |
| El perfil no es privado | `setprivacy public` en el perfil |
| El modo de visualización no es Disabled | `setbirthdayprivacy <mode>` |

La comprobación se hace sobre los miembros que están ahora en el servidor, así que quien se va no se anuncia.

### Modos de visualización del cumpleaños

`setbirthdayprivacy` acepta uno de estos valores. Afecta a lo que se muestra en las listas, en el perfil y en `birthdaytoday`.

| Modo | Efecto |
| --- | --- |
| `Default` | Se muestra la fecha completa, la edad aparece en las listas |
| `MonthOnly` | Solo el mes, edad oculta |
| `YearOnly` | Solo el año, la edad sigue apareciendo |
| `MonthAndDate` | Mes y día, edad oculta |
| `Disabled` | Cumpleaños oculto y nunca anunciado |

## Cómo funciona la comprobación diaria

El servicio se ejecuta una vez por hora y compara el mes y el día del cumpleaños de cada miembro con la fecha de hoy en UTC. La primera hora de un nuevo día UTC que encuentra cumpleaños los publica, y el servidor se marca como hecho para ese día para que no se publique nada dos veces.

Los anuncios solo ocurren cuando la función **Anuncios** está activada y hay un canal definido. Definir un canal con `birthdaychannel` o en el panel activa la función por ti.

Las zonas horarias se guardan pero la comprobación diaria aún no las usa. `birthdaytimezone` y el ajuste **Zona horaria del servidor** se aceptan y se muestran en el embed de configuración, pero los anuncios salen en el día UTC.

## El rol de cumpleaños

Cuando **Rol de cumpleaños** está activado y hay un rol definido, cada miembro anunciado recibe el rol en el momento del anuncio y se le quita 24 horas después. El temporizador de retirada vive en memoria, así que si el bot se reinicia durante el día, el rol se queda hasta que alguien lo quite.

El bot necesita Gestionar roles y su rol más alto debe estar por encima del rol de cumpleaños.

## El mensaje de anuncio

El mensaje por defecto es `Happy Birthday %user.mention%!` con emojis de fiesta alrededor. Sustitúyelo con `birthdaymessage` o con el editor de **Mensaje de cumpleaños** del panel. El texto pasa por el analizador de embeds, así que funciona todo lo que produce el creador de embeds, y la mención del rol se antepone si está activada.

### Marcadores

El mensaje admite los marcadores estándar de usuario, servidor, canal y bot de la página de marcadores, además de un valor específico de cumpleaños.

| Marcador | Valor |
| --- | --- |
| `%user.mention%` | Menciona al miembro que cumple años |
| `%user.name%` | Su nombre de usuario |
| `%user.avatar%` | La URL de su avatar |
| `%server.name%` | El nombre del servidor |
| `%birthday.age%` | La edad que cumple, o `Unknown` |

> [!WARNING]
> Usa `%user.mention%`, no `{user}`. La ayuda del comando de texto menciona `{user}`, pero en el anuncio publicado solo se sustituye la forma `%...%`.

## Ajustes

Todo está en la página de **Cumpleaños** bajo tres pestañas: **Configuración**, **Usuarios** y **Estadísticas**.

**Configuración** tiene los ajustes básicos, el editor de mensajes y un panel de **Funciones de cumpleaños** con un interruptor por función.

| Ajuste | Por defecto | Qué controla |
| --- | --- | --- |
| Canal de cumpleaños | ninguno | Dónde se publican los anuncios |
| Rol de cumpleaños | ninguno | Rol dado durante 24 horas en un cumpleaños |
| Rol a mencionar | ninguno | Rol mencionado antes de cada anuncio |
| Zona horaria del servidor | UTC | Se guarda para el servidor, se muestra en el embed de configuración |
| Días de recordatorio antes del cumpleaños | 0 | De 0 a 30; se guarda, aún no se envía ningún recordatorio |
| Mensaje de cumpleaños | embed predeterminado | El anuncio, con los marcadores anteriores |

| Interruptor de función | Por defecto | Qué controla |
| --- | --- | --- |
| Anuncios | desactivado | Publica el mensaje diario en el canal |
| Rol de cumpleaños | desactivado | Asigna el rol temporal |
| Recordatorios | desactivado | Interruptor provisional; aún no se envía nada |
| Rol a mencionar | desactivado | Menciona al rol con los anuncios |
| Compatibilidad con zonas horarias | desactivado | Interruptor provisional; la comprobación sigue ejecutándose en UTC |

**Usuarios** muestra **Próximos cumpleaños** para los próximos 7, 14 o 30 días y una lista de **Todos los usuarios** con cada miembro que tiene un cumpleaños definido, con los cumpleaños de hoy resaltados en la parte superior de la página. **Estadísticas** muestra **Total de usuarios**, **Cumpleaños registrados**, **Cumpleaños públicos** y **Cumpleaños de hoy**.

> [!NOTE]
> Guardar el formulario del panel solo escribe los valores que has rellenado. Para borrar un rol o el canal, usa `birthdayrole` o `birthdaypingrole` sin rol, o restablece todo con `/birthday config reset`.

## Guía de configuración

1. Abre **Cumpleaños** en el panel.
2. En **Configuración**, elige el **Canal de cumpleaños** para los anuncios y haz clic en **Guardar configuración**.
3. Activa **Anuncios** en el panel de **Funciones de cumpleaños**.
4. Opcionalmente, elige un **Rol de cumpleaños** y activa **Rol de cumpleaños**, y un **Rol a mencionar** con **Rol a mencionar** activado.
5. Opcionalmente, escribe tu propio **Mensaje de cumpleaños** usando `%user.mention%` y `%birthday.age%`.
6. Pide a los miembros que ejecuten `setbirthday` y luego `birthdayannouncements` para apuntarse.
7. Revisa la pestaña **Usuarios** para confirmar que aparecen en **Próximos cumpleaños**.

## Comandos

Ejecútalos con el prefijo de tu servidor (`.` salvo que lo hayas cambiado). Las versiones de barra están en `/birthday` y `/birthday config`.

| Comando | Alias | Requiere | Propósito |
| --- | --- | --- | --- |
| `setbirthday <date>` | | Nadie | Define tu cumpleaños en tu perfil, por ejemplo `setbirthday 1998-04-12` |
| `setbirthdayprivacy <mode>` | | Nadie | Elige uno de los modos de visualización anteriores |
| `birthdayannouncements` | `bdayann` | Nadie | Te apunta o te desapunta de los anuncios |
| `birthdaytimezone <zone>` | `bdaytz` | Nadie | Guarda tu zona horaria, por ejemplo `Europe/London` |
| `birthdaytoday` | `todaysbirthdays` | Nadie | Enumera quién celebra hoy |
| `birthdaylist [days]` | `bdaylist`, `upcomingbirthdays` | Nadie | Próximos cumpleaños, de 1 a 30 días, 7 por defecto |
| `birthdaychannel [#channel]` | `bdaychannel`, `bdaychan` | Administrador | Define el canal de anuncios y activa los anuncios |
| `birthdayrole [@role]` | `bdayrole` | Administrador | Define el rol de cumpleaños de 24 horas, o lo borra sin rol |
| `birthdaypingrole [@role]` | `bdayping` | Administrador | Define el rol a mencionar, o lo borra sin rol |
| `birthdaymessage [text]` | `bdaymsg` | Administrador | Define el texto del anuncio, o muestra el actual |
| `birthdayconfig` | `bdaycfg` | Administrador | Muestra la configuración actual |

`/birthday config reset` borra todos los ajustes y desactiva todas las funciones. No tiene equivalente en comando de texto.

## Consejos y advertencias

- Los miembros no se anuncian hasta que ejecutan `birthdayannouncements`. Avísales, o no aparecerá nadie.
- `setbirthday` acepta cualquier cosa que el bot pueda interpretar como fecha. Usa un formato inequívoco como `1998-04-12`.
- `birthdaytimezone` solo acepta una breve lista fija de dieciséis zonas como `UTC`, `GMT`, `America/New_York`, `Europe/London`, `Asia/Tokyo`, `Asia/Kolkata`, `Australia/Sydney` y `Pacific/Auckland`. El desplegable **Zona horaria del servidor** del panel tiene una lista parecida de trece.
- La comprobación diaria usa UTC. Los miembros lejos de UTC pueden ser anunciados unas horas antes o después.
- El bot necesita Gestionar roles para el rol de cumpleaños, y Enviar mensajes más Insertar enlaces en el canal de anuncios.
- `birthdayconfig` muestra un campo «Reminder Days» y una función Recordatorios. Se guardan, pero ahora mismo no envían nada.
- No hay ningún comando para eliminar un cumpleaños guardado. Los miembros lo ocultan ejecutando `setbirthdayprivacy Disabled` o desapuntándose con `birthdayannouncements`.
