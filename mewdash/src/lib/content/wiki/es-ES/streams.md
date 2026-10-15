---
title: Alertas de stream
slug: streams
summary: Sigue a streamers en Twitch, YouTube, Kick y Picarto y publica un anuncio en el canal que elijas cuando empiecen o terminen su directo.
icon: fa-video
category: Community
dashboard: /dashboard/streams
module: Searches
tags: [streams, stream alerts, go live, live notifications, twitch, youtube, kick, picarto, trovo, streamadd, streamtemplate, alertas de stream, directos, notificaciones de directo, en directo]
related: [twitch, utility, administration]
---

## Qué hace

El personal pega la URL de un stream y elige un canal de Discord. El bot consulta entonces la plataforma de ese streamer y, cuando el stream pasa de desconectado a en línea, publica un mensaje de inicio de directo en el canal elegido. Por defecto es un embed con el nombre del streamer enlazado al stream, el título del stream, el juego o la categoría, el número de espectadores, el avatar del streamer y una imagen de vista previa.

Puedes sustituir el embed predeterminado por tu propio mensaje. Hay una plantilla para todo el servidor que se aplica a todos los streams seguidos, y cada stream también puede tener su propio mensaje de conexión y su propio mensaje de desconexión. Todos admiten los marcadores `%stream.*%` indicados abajo y pueden ser texto sin formato o un embed completo creado en el editor de embeds del panel.

Los avisos de desconexión están desactivados por defecto. Actívalos y el bot también publicará cuando termine un stream seguido, usando el mensaje de desconexión del stream si hay uno, si no la plantilla del servidor y, si no, el embed predeterminado que muestra «Offline».

> [!NOTE]
> Alertas de stream anuncia en tu Discord los streams de otras personas. La función aparte del bot de Twitch conecta el bot a tu propio chat de Twitch para comandos, temporizadores y eventos. Consulta el artículo del bot de Twitch para eso.

## Por qué usarlo

- Un servidor de comunidad quiere un canal de «ahora en directo» que se ilumine cada vez que uno de sus creadores empiece a hacer stream.
- El Discord de un streamer quiere un aviso automático con el título y la categoría para que nadie tenga que publicarlo a mano.
- Un servidor de esports o de eventos sigue varios canales de torneos de Twitch y Kick en un solo sitio.
- Un servidor quiere un aviso limpio de «stream terminado» para que la publicación de inicio de directo no parezca obsoleta.

## Plataformas compatibles

El bot elige la plataforma según la URL que le des. Solo se pueden seguir las URL que coincidan con uno de estos patrones.

| Plataforma | Formato de URL | Notas |
| --- | --- | --- |
| Twitch | `twitch.tv/username` | Usa la API Helix de Twitch. Se rellenan el título, el juego, los espectadores, el avatar y la vista previa. |
| YouTube | `youtube.com/@handle` o `youtube.com/channel/ID` | Se lee extrayendo datos de la página en directo del canal, así que los datos pueden ser menos completos que en Twitch. Una URL con ID de canal se convierte al handle. |
| Kick | `kick.com/slug` | Usa la API pública de Kick. El marcador del avatar se rellena con la imagen del banner del canal. |
| Picarto | `picarto.tv/name` | Usa la API de Picarto. |

Trovo y Facebook aparecen en la lista de plataformas del panel y en los datos guardados, pero no hay un comprobador de URL que funcione para Trovo ni un proveedor para Facebook en el código actual, así que esas URL se rechazan cuando intentas seguirlas.

## Cómo funciona la comprobación

El bot mantiene un rastreador por plataforma y le pide a cada plataforma el estado de cada canal seguido en un bucle, con una pausa de tres segundos entre rondas. Un stream se anuncia como en línea la primera vez que se ve en directo después de haber estado desconectado.

La desconexión se gestiona con más cuidado porque Twitch a veces informa de un breve parpadeo de desconexión durante un directo. Un stream tiene que verse desconectado en dos comprobaciones consecutivas antes de enviar el aviso de desconexión. Si vuelve a estar en línea entretanto, no se publica nada.

Cada treinta minutos, el bot busca streams cuyas consultas a la plataforma llevan fallando más de doce horas, por ejemplo un canal eliminado o renombrado, y los quita de todos los servidores que los seguían.

Si se ha eliminado el canal de notificaciones de un stream seguido, el stream se descarta la próxima vez que alguien ejecute `streamlist`.

## El mensaje que envía

Cuando un stream cambia de estado, el bot elige un mensaje en este orden:

1. El **Mensaje de conexión** o el **Mensaje de desconexión** propio del stream, el que corresponda al nuevo estado.
2. La plantilla del **Mensaje global de directos** de todo el servidor.
3. El embed integrado.

Un mensaje propio de un stream que no es JSON de embed válido se publica como texto sin formato sobre el embed integrado. Una plantilla global que no es JSON de embed se publica como texto sin formato por sí sola. Los mensajes que son JSON de embed válido, que es lo que produce el creador de embeds del panel, se envían exactamente como se diseñaron, incluidos los botones.

El embed integrado tiene el nombre del streamer como título enlazado, el título del stream como línea de autor, un campo **Estado** que muestra Online u Offline, un campo **Viewers**, un campo **En directo** para el juego o la categoría, el avatar como miniatura y la vista previa como imagen grande. Es verde mientras está en directo y rojo cuando está desconectado.

### Marcadores

En los mensajes de stream solo se sustituye este conjunto. Los marcadores generales de servidor y de usuario de la página de marcadores no están disponibles aquí.

| Marcador | Valor |
| --- | --- |
| `%stream.name%` | Nombre visible del streamer, o `Unknown` |
| `%stream.username%` | Nombre de inicio de sesión o handle del streamer |
| `%stream.url%` | Enlace directo al stream, siempre con `https://` |
| `%stream.title%` | Título actual del stream, o `No title` |
| `%stream.game%` | Juego o categoría, o `No category` |
| `%stream.viewers%` | Número de espectadores con separadores de miles, o `-` si está desconectado |
| `%stream.platform%` | Nombre de la plataforma, como `Twitch` o `Youtube` |
| `%stream.avatar%` | URL del avatar del streamer |
| `%stream.preview%` | URL de la vista previa o miniatura del stream |
| `%stream.status%` | `Online` u `Offline`, cada uno precedido por un círculo de color |
| `%stream.channelid%` | ID de canal específico de la plataforma, cuando la plataforma lo proporciona |

> [!EXAMPLE]
> Una plantilla global sencilla: `%stream.name% is live on %stream.platform% playing %stream.game%: %stream.title% %stream.url%`

## Ajustes

La página de Notificaciones de stream tiene cuatro pestañas: **Directos**, **Seguir directo**, **Ajustes** y **Estadísticas**.

| Ajuste | Por defecto | Qué controla |
| --- | --- | --- |
| Canal de notificaciones | ninguno | El canal al que van las alertas de un stream nuevo, elegido en **Seguir directo** |
| URL del directo | ninguna | El enlace que se va a seguir, en **Seguir directo** |
| Mensaje de conexión | ninguno | Mensaje por stream cuando empieza el directo, editado desde la tarjeta del stream en **Directos** |
| Mensaje de desconexión | ninguno | Mensaje por stream cuando termina, editado desde la misma tarjeta |
| Mensaje global de directos | ninguno | Plantilla de todo el servidor usada cuando un stream no tiene mensaje propio, en **Ajustes** |
| Notificaciones de desconexión | desactivado | Si el bot publica cuando los streams seguidos se desconectan, en **Ajustes** |

**Directos** enumera todos los streams seguidos con su plataforma, canal y la fecha en que se añadieron, con un botón de eliminar en cada tarjeta y un botón **Borrar todos**. **Estadísticas** muestra el total de directos, los streamers únicos, los canales con notificaciones, las plataformas en uso y un desglose por plataforma.

Un servidor puede seguir como máximo diez streams. Añadir un undécimo falla.

## Guía de configuración

1. Abre **Alertas de stream** en el panel y ve a la pestaña **Seguir directo**.
2. Elige el **Canal de notificaciones**, pega la **URL del directo** y haz clic en **Seguir directo**.
3. En **Ajustes**, crea un **Mensaje global de directos** en el editor de embeds usando los marcadores anteriores y luego haz clic en **Guardar mensaje**. Omite este paso para conservar el embed integrado.
4. Activa las **Notificaciones de desconexión** si quieres también publicaciones de «stream terminado».
5. De vuelta en **Directos**, abre la tarjeta de un stream para darle su propio **Mensaje de conexión** o **Mensaje de desconexión** si necesita algo distinto de la plantilla global.
6. Prueba con `streamcheck <url>` para confirmar que el bot puede leer el stream y luego espera al próximo inicio de directo.

## Comandos

Ejecútalos con el prefijo de tu servidor (`.` salvo que lo hayas cambiado).

| Comando | Alias | Requiere | Propósito |
| --- | --- | --- | --- |
| `streamadd <url>` | `sta`, `stadd` | Gestionar mensajes | Sigue un stream y envía sus alertas al canal actual |
| `streamremove <index>` | `strm` | Gestionar mensajes | Deja de seguir el stream de esa posición en `streamlist` |
| `streamsclear` | `stclear` | Administrador | Deja de seguir todos los streams del servidor |
| `streamlist` | `stl`, `streamslist` | Nadie | Lista paginada de streams seguidos con sus números, plataformas y canales |
| `streamoffline` | `sto`, `stoff` | Gestionar mensajes | Activa o desactiva las notificaciones de desconexión |
| `streammessage <index> <message>` | `stm`, `stmsg` | Gestionar mensajes | Define el mensaje de conexión de un stream; un mensaje vacío lo restablece |
| `streamofflinemessage <index> <message>` | `stofmsg`, `stoffline` | Gestionar mensajes | Define el mensaje de desconexión de un stream; un mensaje vacío lo restablece |
| `streamtemplate [template]` | `stt`, `sttemplate` | Gestionar mensajes | Muestra la plantilla global y los marcadores, define una nueva, o `reset` para borrarla |
| `streamcheck <url>` | `stc` | Nadie | Informa de si un stream está en directo ahora mismo y de su número de espectadores |

## Consejos y advertencias

- `streamadd` usa el canal en el que lo ejecutas. Usa el panel si quieres elegir un canal distinto.
- Los números de stream vienen de `streamlist` y empiezan en 1. Cambian cuando se quita un stream, así que revisa la lista antes de quitar por número.
- El bot necesita Enviar mensajes e Insertar enlaces en el canal de notificaciones. Las alertas a un canal que no puede ver se omiten con una entrada en el registro.
- Si tu servidor tiene conectado el bot de Twitch con un canal de inicio de directo definido para el mismo canal de Twitch, esa integración toma el relevo y Alertas de stream guarda silencio para él, así que no recibes dos publicaciones.
- Los datos de YouTube se extraen de la página en lugar de leerse de una API. Los títulos, las categorías y el número de espectadores pueden faltar o aparecer como `Live Stream`.
- Los streams cuyas consultas siguen fallando durante doce horas se eliminan automáticamente. Si un streamer renombra su canal, sigue la nueva URL.
