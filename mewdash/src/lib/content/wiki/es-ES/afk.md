---
title: Sistema AFK
slug: afk
summary: Permite a los miembros marcarse como ausentes, explicar a quien los mencione por qué, y quitar el estado automáticamente cuando vuelvan.
icon: fa-moon
category: Actions
dashboard: /dashboard/afk
module: Afk
tags: [afk, away, idle, status, brb, mention reply, timed afk, placeholders, ausente, inactivo, estado, respuesta a menciones, AFK temporal, marcadores]
related: [utility, administration]
---

## Qué hace

Un miembro ejecuta `afk` con un mensaje opcional. A partir de ese momento, cada vez que alguien lo mencione, el bot responde en ese canal con el mensaje y con el tiempo que lleva ausente. Cuando el miembro vuelve, el estado se borra, se publica un breve aviso de «bienvenido de nuevo» que se elimina a los cinco segundos, y se restaura el apodo.

Mientras un miembro está ausente, el bot también intenta cambiarle el nombre a `[AFK] name`, recortado para que quepa en el límite de apodos de Discord, de modo que el estado se vea en la lista de miembros.

Ejecutar `afk` sin mensaje alterna el estado: si no estás ausente, activa AFK con un mensaje vacío, y si lo estás, lo desactiva.

## Por qué usarlo

- Los miembros de servidores muy activos dejan de recibir menciones repetidas de personas que no vieron que habían escrito «brb».
- El personal puede ver de un vistazo quién está disponible y quién no.
- El AFK temporal sirve para «vuelvo en dos horas» sin que nadie tenga que acordarse de quitarlo.

## Cómo termina un estado

El **Tipo de AFK** decide qué cuenta el bot como regreso. Es el ajuste más importante de la página.

| Tipo | El estado se borra cuando |
| --- | --- |
| Autodesactivación | Solo cuando el miembro vuelve a ejecutar `afk`, o cuando el personal lo quita. Nada automático. |
| Al enviar un mensaje | El miembro envía un mensaje en cualquier lugar del servidor. |
| Al escribir | El miembro empieza a escribir en cualquier canal. |
| Cualquiera | Un mensaje o escribir, lo que ocurra primero. |

El **Tiempo de espera de AFK** es un periodo de gracia medido desde que se estableció el estado. Dentro de esa ventana, escribir o enviar un mensaje no borra el estado, lo que evita que el propio mensaje «afk, brb» termine el AFK al instante. El valor por defecto es 0, es decir, sin periodo de gracia; se configura con `afktimeout` o en la pestaña **Ajustes avanzados** del panel.

El AFK temporal es distinto: dura hasta que expira su temporizador, sin importar el tipo. Hablar mientras tanto no lo termina. Cuando el temporizador se agota, el estado se borra y el apodo se restaura sin aviso en el canal.

Editar un mensaje dentro de los cinco minutos posteriores a publicarlo cuenta igual que enviar uno nuevo.

## La respuesta a una mención

Cuando alguien menciona a un miembro ausente, el bot revisa hasta cinco usuarios mencionados por mensaje, ignora bots y automenciones, ignora los mensajes que empiezan por el prefijo del comando y omite los canales de la lista de desactivados. Por cada miembro ausente que encuentre, publica una respuesta.

Por defecto, la respuesta es un embed: la línea del autor dice «usuario está actualmente ausente» con su avatar, la descripción es su mensaje de AFK y el pie muestra cuánto tiempo lleva ausente. Si el bot está configurado para mostrar un botón de invitación, se adjunta uno.

Puedes sustituir esto por tu propio mensaje o embed usando `customafkmessage`, o el editor **Mensaje embed de AFK personalizado** del panel. El texto pasa por el analizador de embeds, así que funciona cualquier cosa que genere el creador de embeds. Ponlo en `-` para volver al valor por defecto.

### Marcadores

Estos se reemplazan dentro de un mensaje AFK personalizado. Los marcadores generales de la página de marcadores no están disponibles aquí; solo funciona este conjunto.

| Marcador | Valor |
| --- | --- |
| `%afk.message%` | El mensaje AFK, con las menciones neutralizadas y recortado a la longitud máxima |
| `%afk.user%` | El nombre de usuario del miembro ausente |
| `%afk.user.mention%` | Una mención del miembro ausente |
| `%afk.user.avatar%` | La URL del avatar del miembro ausente |
| `%afk.user.id%` | El ID de usuario del miembro ausente |
| `%afk.triggeruser%` | El nombre de usuario de quien lo mencionó |
| `%afk.triggeruser.mention%` | Una mención de quien lo mencionó |
| `%afk.triggeruser.avatar%` | La URL del avatar de quien lo mencionó |
| `%afk.triggeruser.id%` | El ID de usuario de quien lo mencionó |
| `%afk.time%` | Cuánto tiempo lleva ausente, en palabras como "2 horas" |

> [!EXAMPLE]
> Una respuesta en texto plano: `%afk.user.mention% is away (%afk.time%): %afk.message%`

## Ajustes

Todos estos están en la página de AFK, en las pestañas **Ajustes básicos** y **Ajustes avanzados**.

| Ajuste | Por defecto | Qué controla |
| --- | --- | --- |
| Tiempo de eliminación automática | 0 (nunca) | Segundos antes de que la respuesta del bot a una mención se borre sola |
| Longitud máxima del mensaje | 128 | El mensaje AFK más largo que puede poner un miembro, de 1 a 4096; los más largos se rechazan |
| Tipo de retirada de AFK | Autodesactivación | Uno de los cuatro tipos de arriba |
| Tiempo de espera de AFK | 0 (ninguno) | El periodo de gracia tras activar AFK, de hasta dos horas |
| Canales desactivados | ninguno | Canales donde mencionar a un miembro ausente no recibe respuesta |
| Mensaje embed de AFK personalizado | embed por defecto | Tu propia respuesta, con los marcadores de arriba |

> [!TIP]
> Pon la eliminación automática en unos treinta segundos. Quien mencionó ve la respuesta, y el canal no se llena de avisos AFK caducados.

La pestaña **Gestión de usuarios** lista a todos los miembros que están ausentes en este momento y permite al personal quitar el estado a una o varias personas a la vez.

## Configuración paso a paso

1. Abre **Sistema AFK** en el panel.
2. Elige un **Tipo de retirada de AFK**. «Al enviar un mensaje» es el valor por defecto más seguro; «Cualquiera» es el más cómodo.
3. Pon **Tiempo de eliminación automática** en 30. Deja **Longitud máxima del mensaje** en 128 salvo que quieras estados más largos.
4. En **Ajustes avanzados**, añade los canales de comandos del bot y los canales de anuncios a **Canales desactivados**.
5. Opcionalmente, crea una respuesta personalizada en el editor de embeds usando los marcadores de arriba.
6. Pruébalo: ejecuta `afk testing`, menciónate desde otra cuenta, luego envía un mensaje y observa cómo se quita el estado.

## Comandos

Ejecuta estos comandos con el prefijo de tu servidor (`.` a menos que lo hayas cambiado).

| Comando | Alias | Requiere | Función |
| --- | --- | --- | --- |
| `afk [message]` | | Nadie | Establecer tu mensaje AFK, o activar y desactivar AFK sin mensaje |
| `timedafk <time> <message>` | `tafk` | Nadie | AFK que termina solo, por ejemplo `timedafk 2h dinner` |
| `getactiveafks` | `activeafks` | Nadie | Listar a todos los que están AFK en este momento |
| `afkview [@user]` | `viewafk` | Gestionar mensajes | Mostrar el mensaje AFK actual de alguien |
| `afkremove @user...` | `afkrm` | Gestionar mensajes | Quitar el estado de uno o varios miembros |
| `afkdel [seconds]` | `afkdelete` | Gestionar servidor | Mostrar o establecer la eliminación automática de la respuesta |
| `afklength <number>` | `maxafklength` | Administrador | Limitar la longitud del mensaje AFK |
| `afktype <type>` | | Administrador | `selfdisable`, `onmessage`, `ontype` o `either` |
| `afktimeout <time>` | | Administrador | Establecer el periodo de gracia, por ejemplo `30s` |
| `afkdisable #channel...` | | Gestionar canales | Añadir canales a la lista sin respuestas |
| `afkundisable #channel...` | | Gestionar canales | Quitar canales de la lista sin respuestas |
| `afkdisabledlist` | | Gestionar canales | Mostrar la lista sin respuestas |
| `customafkmessage <text>` | `afkmessage` | Administrador | Establecer la respuesta personalizada, o `-` para restablecerla |

## Consejos y advertencias

- No hay un comando para quitar solo tu propio estado. Ejecuta `afk` de nuevo sin mensaje, o espera a que la regla del tipo lo quite.
- Cambiar apodos requiere que el rol del bot esté por encima del rol más alto del miembro y el permiso Gestionar apodos. Un bot nunca puede cambiar el apodo del dueño del servidor, así que los dueños conservan su nombre, pero el estado sigue funcionando.
- El servicio de AFK carga su caché poco después de iniciar el bot. Hasta entonces, los comandos responden que AFK todavía se está iniciando.
- Las menciones dentro del mensaje AFK se neutralizan en la respuesta, así que los miembros no pueden usar su estado para mencionar roles o a todo el servidor.
