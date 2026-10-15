---
title: Música
slug: music
summary: Reproduce música de YouTube, Spotify, SoundCloud y búsquedas en un canal de voz, con cola, listas de reproducción guardadas, filtros de audio, un rol de DJ, texto a voz y scrobbling de Last.fm.
icon: fa-music
category: Entertainment
dashboard: /dashboard/music
module: Music
tags: [music, play, queue, playlist, spotify, youtube, soundcloud, volume, skip, loop, repeat, dj role, filters, bass boost, nightcore, tts, text to speech, lastfm, scrobble, music links, música, reproducir, cola, lista de reproducción, volumen, saltar, repetir, rol de DJ, filtros, texto a voz, enlaces de música]
related: [utility, administration]
---

## Qué hace

Un miembro entra a un canal de voz y ejecuta `play` con un enlace o una búsqueda. El bot se une, pone la pista en cola y empieza a reproducir. Los enlaces de YouTube, YouTube Music, SoundCloud y Spotify se resuelven directamente; las pistas, álbumes y listas de reproducción de Spotify se asocian con YouTube. Una búsqueda simple muestra hasta 25 resultados en un menú de selección para que el miembro elija el que quería.

Todos los del canal comparten una sola cola. Los miembros pueden verla, saltar a una entrada, mover o quitar pistas, mezclar, repetir una pista o toda la cola, y guardar la cola como una lista de reproducción con nombre para cargarla más tarde. Saltar es instantáneo para los miembros con el rol de DJ, o por votación para todos los demás.

El staff elige un canal de música donde van los avisos de reproducción actual y de cola vacía, define el rol de DJ, el volumen predeterminado y el modo de repetición, y puede activar filtros de audio como el refuerzo de graves o nightcore. El panel muestra el reproductor en vivo con una cola, botones de repetición y filtros, y el mismo flujo en vivo alimenta la app móvil.

Dos extras viven en el mismo módulo. El texto a voz lee mensajes del chat en voz alta en un canal de voz, con voces por usuario y una lista de bloqueo. Last.fm permite a los miembros hacer scrobble de lo que reproduce el bot y ejecutar comandos del estilo `fm` sobre lo que escuchan.

## Por qué usarlo

- Un canal de voz para charlar quiere música de fondo a la que cualquiera pueda añadir sin que una sola persona sea DJ toda la noche.
- El staff quiere un rol de DJ para que solo miembros de confianza puedan saltar al instante, mientras todos los demás votan.
- Una comunidad mantiene algunas listas de reproducción propias que se cargan al comenzar cada evento.
- Un canal de voz tiene miembros que no pueden hablar y quieren que sus mensajes se lean en voz alta.
- Los aficionados a la música quieren un lugar compartido para comparar estadísticas de Last.fm y clasificaciones de "quién conoce a este artista".

## Reproducción y cola

Debes estar en un canal de voz para casi todos los comandos de música. Si el bot ya está reproduciendo en otro canal, los comandos desde un canal distinto se rechazan.

`play <link or search>` acepta:

| Entrada | Qué ocurre |
| --- | --- |
| Enlace de YouTube o YouTube Music | Se carga directamente, listas de reproducción incluidas |
| Enlace de SoundCloud | Se carga directamente |
| Enlace de una pista de Spotify | Se asocia con una pista de YouTube |
| Enlace de un álbum o lista de reproducción de Spotify | Cada entrada se asocia con YouTube y se pone en cola a medida que se resuelve, con un mensaje de progreso |
| Cualquier otra cosa | Se busca en YouTube, hasta 25 resultados en un menú de selección |

`play <number>` salta a esa posición de la cola. `search <query>` lista diez resultados sin poner nada en cola. `queue` muestra una vista paginada, cinco por página, con un menú de selección para opciones por pista. `nowplaying` muestra la pista actual con quien la pidió y el proveedor.

`songremove <number>` quita una entrada, `movesong <from> <to>` reordena, `shuffle` mezcla todo lo que va después de la pista actual y `clearqueue` vacía la cola y detiene la reproducción. `seek mm:ss` salta dentro de la pista actual. `volume 0..100` define el volumen y lo guarda como predeterminado del servidor.

`loop <type>` define la repetición: `none` (también `off`), `track` (también `song`) o `queue` (también `all`). Cuando la cola termina con la repetición desactivada, el bot publica un aviso de cola vacía en el canal de música.

### Saltar y el rol de DJ

`skip` termina la pista actual de inmediato para quien lo ejecute. `voteskip` cuenta votos: un miembro con el rol de DJ o Administrador salta al instante, todos los demás suman un voto, y la pista se salta cuando los votos alcanzan el 70 por ciento de los miembros no bot del canal de voz.

Define el rol de DJ con `setdjrole @role` o con el selector **Rol de DJ** del panel. Ejecuta `setdjrole` sin rol para quitarlo.

### Reproducción automática

`autoplay <0..5>` hace que el bot añada esa cantidad de pistas relacionadas cuando la cola se queda vacía, usando recomendaciones de Spotify. 0 lo desactiva. Esto depende de que el bot tenga credenciales de Spotify configuradas; si faltan, la reproducción automática no hace nada.

## Listas de reproducción

`saveplaylist <name>` guarda la cola actual bajo un nombre, por servidor, contigo como autor. `loadplaylist <name> [true]` la añade a la cola, o reemplaza la cola si indicas `true`, y empieza a reproducir si no hay nada sonando. Las pistas se vuelven a resolver en YouTube al cargarlas, así que las entradas que ya no existen se omiten en silencio. `playlists` las lista con el número de pistas y los autores, y `deleteplaylist <name>` elimina una.

## Filtros de audio

Los filtros se aplican al reproductor en marcha y se restablecen cuando se desconecta.

| Comando | Efecto |
| --- | --- |
| `bass <0..1>` | Refuerza las frecuencias graves; 0 lo desactiva |
| `nightcore [on/off]` | Más rápido y más agudo |
| `vaporwave [on/off]` | Más lento y más grave |
| `karaoke [on/off]` | Suprime las voces centradas |
| `tremolo [on/off]` | Oscilación del volumen |
| `vibrato [on/off]` | Oscilación del tono |
| `eightd [on/off]` | Hace girar el sonido alrededor del oyente |
| `distortion [on/off]` | Distorsión |
| `stereowiden [on/off]` | Ensancha la imagen estéreo |

`activefilters` lista lo que está activado y `resetfilters` los borra todos. La tarjeta **Reproduciendo ahora** del panel tiene botones para alternar el refuerzo de graves, nightcore, vaporwave, karaoke, trémolo, vibrato, la rotación 8D y la distorsión.

## Conversión de enlaces de música

En los canales donde está activada, publicar un enlace de Apple Music, Spotify, YouTube Music, YouTube, Amazon Music, Deezer, Tidal, Pandora o SoundCloud recibe una respuesta con un embed con el título de la pista, el artista y la portada, además de enlaces a la misma pista en los demás proveedores. Activa o desactiva un canal con `musiclinkchannel [#channel]` (Gestionar servidor) y lístalos con `musiclinkchannels`. En el panel es la sección **Conversión de enlaces de música** de la pestaña Ajustes de música.

## Texto a voz

El TTS lee mensajes en voz alta en un canal de voz en el que está el bot. El staff lo activa por canal de voz; los mensajes de los miembros de ese canal de voz, escritos en el chat de texto del canal de voz o en un canal de texto vinculado, se ponen en cola y se leen. La música baja al 15 por ciento mientras se lee una línea y vuelve después. La cola admite 10 mensajes por defecto.

Los miembros eligen su propia voz con `ttsvoice <name>` y exploran con `ttsvoices [search]`. El staff define una voz predeterminada, la velocidad (de 0.5 a 3.0 en el panel, de 0.5 a 2.0 por comando), el volumen, un rol requerido, anuncios de entrada y salida con sus propios formatos, y puede bloquear a usuarios concretos. La pestaña **Ajustes de TTS** del panel tiene los mismos controles, divididos en **Ajustes generales del TTS**, **Comportamiento del TTS**, **TTS del canal de voz** y **Usuarios bloqueados del TTS**.

## Last.fm

Los miembros vinculan una cuenta de Last.fm desde la página `/me` del panel (`lastfmlink` publica el botón). Una vez vinculada, las pistas que el bot reproduce durante al menos 30 segundos se envían por scrobble a su cuenta; `lastfmtoggle` lo pausa y `lastfmstatus` muestra el estado. La familia de comandos `fm` funciona entonces para cualquiera con una cuenta vinculada: pistas recientes, artistas, álbumes y pistas más escuchados por periodo, consultas de artistas y álbumes, clasificaciones de who knows en el servidor, coronas, comparación de gustos y collages.

## Ajustes

La página del panel tiene dos pestañas, **Ajustes de música** y **Ajustes de TTS**. La pestaña de Música también muestra una tarjeta **Reproduciendo ahora** con la longitud de la cola, botones de mezclar y vaciar, botones del modo de repetición y filtros cuando el bot está reproduciendo.

| Ajuste | Por defecto | Qué controla |
| --- | --- | --- |
| Volumen predeterminado | 100 | Volumen inicial, de 0 a 100; `volume` también guarda aquí |
| Canal de música | Todos los canales | Dónde se publican los avisos de reproducción actual y de cola |
| Rol de DJ | Sin rol de DJ | Rol que salta al instante y omite la votación para saltar |
| Modo de repetición | Ninguno | Ninguno, Una pista o Cola |
| Desconexión automática | Nunca | Nunca, Cuando el canal de voz esté vacío, Cuando la cola esté vacía o Cualquiera de las condiciones |
| Reproducción automática de similares | Desactivado | Añade pistas relacionadas cuando la cola se vacía; el comando permite hasta 5 |
| Activar votación para saltar | desactivado | Muestra el umbral de votación para saltar en el pie del reproductor |
| Umbral de votación para saltar | porcentaje, de 1 a 100 | Valor mostrado; el propio comando `voteskip` siempre necesita el 70 por ciento |
| Canales de enlaces de música | ninguno | Canales donde los enlaces de música reciben un embed entre proveedores |
| Volumen del TTS | 100 | Volumen de las líneas leídas |
| Velocidad del TTS | 1.0 | De 0.5 a 3.0 |
| Tamaño máximo de la cola | 10 | Mensajes de TTS pendientes, de 1 a 50 |
| Voz predeterminada | predeterminada del proveedor | Voz usada cuando un miembro no ha elegido una |
| Rol requerido | Sin rol requerido | Solo los miembros con este rol pueden usar TTS; los administradores siempre pueden |
| Contexto de respuesta | desactivado | Lee "respondiendo a usuario" antes de las respuestas |
| Narración de adjuntos | desactivado | Anuncia las imágenes, vídeos y archivos enviados |
| Agrupación consecutiva | desactivado | Omite el nombre cuando el mismo miembro envía varios mensajes seguidos |
| TTS del canal de voz | ninguno | Por canal de voz: activado, canal de texto vinculado, anuncios de entrada y salida y formatos |
| Usuarios bloqueados del TTS | ninguno | Miembros cuyos mensajes nunca se leen |

> [!NOTE]
> El modo de repetición definido en el panel se aplica desde el siguiente reproductor. `loop` cambia el reproductor en marcha de inmediato.

## Guía de configuración

1. Asegúrate de que el bot tenga Conectar y Hablar en los canales de voz que quieras que use.
2. Abre **Música** en el panel. Define un **Canal de música** para que los embeds de reproducción actual no acaben en el chat general.
3. Elige un **Rol de DJ** para las personas autorizadas a saltar libremente.
4. Pon el **Volumen predeterminado** en torno a 50; 100 es mucho.
5. Entra a un canal de voz y ejecuta `play never gonna give you up`, elige un resultado y luego `queue` y `nowplaying`.
6. Crea una lista de reproducción propia poniendo pistas en cola y ejecutando `saveplaylist chill`.
7. Si quieres TTS, cambia a **Ajustes de TTS**, añade el canal de voz en **TTS del canal de voz** y haz que los miembros elijan una voz con `ttsvoice`.

## Comandos

Ejecútalos con el prefijo de tu servidor (`.` salvo que lo hayas cambiado).

| Comando | Alias | Requiere | Para qué sirve |
| --- | --- | --- | --- |
| `join` | `j`, `mv` | Nadie | Unirse a tu canal de voz |
| `leave` | `disconnect`, `d` | Nadie | Salir y vaciar la cola |
| `play <link or search>` | `p`, `start` | Nadie | Poner en cola y reproducir |
| `play <number>` | `p`, `start` | Nadie | Saltar a una posición de la cola |
| `search <query>` | `find` | Nadie | Listar diez resultados sin reproducir |
| `pause` | | Nadie | Pausar o reanudar |
| `nowplaying` | `np` | Nadie | Mostrar la pista actual |
| `queue` | `q`, `yq`, `enqueue` | Nadie | Mostrar la cola |
| `skip` | `next`, `n` | Nadie | Saltar la pista actual |
| `voteskip` | `vskip` | Nadie | Votar para saltar, instantáneo con el rol de DJ |
| `songremove <number>` | `trackremove`, `srm` | Nadie | Quitar una entrada de la cola |
| `movesong <from> <to>` | `ms`, `move` | Nadie | Reordenar la cola |
| `shuffle` | `playlistshuffle`, `sh`, `plsh` | Nadie | Mezclar las próximas pistas |
| `clearqueue` | `cq` | Nadie | Vaciar la cola y detener |
| `volume <0..100>` | `vol` | Nadie | Definir y guardar el volumen |
| `seek <mm:ss>` | | Nadie | Saltar dentro de la pista actual |
| `loop <none|track|queue>` | `queuerepeat`, `qrp`, `rpl` | Nadie | Definir el modo de repetición |
| `autoplay <0..5>` | `ap` | Nadie | Pistas relacionadas cuando la cola se vacía |
| `setdjrole [role]` | `djrole` | Gestionar servidor | Definir o quitar el rol de DJ |
| `setmusicchannel [#channel]` | `smch` | Nadie | Dónde van los avisos del reproductor |
| `musicsettings` | `msettings` | Nadie | Mostrar reproducción automática, volumen, repetición y canal |
| `musiclinkchannel [#channel]` | | Gestionar servidor | Activar o desactivar la conversión de enlaces en un canal |
| `musiclinkchannels` | | Nadie | Listar los canales de conversión de enlaces |
| `saveplaylist <name>` | `saveplist` | Nadie | Guardar la cola |
| `loadplaylist <name> [clear]` | `loadplist` | Nadie | Cargar una lista de reproducción, `true` para reemplazar la cola |
| `playlists` | `playlistshow`, `plshow` | Nadie | Listar las listas de reproducción guardadas |
| `deleteplaylist <name>` | `delplist` | Nadie | Eliminar una lista de reproducción |
| `bass [0..1]` | | Nadie | Refuerzo de graves |
| `nightcore [on/off]` | `nc` | Nadie | Filtro nightcore |
| `vaporwave [on/off]` | `vw` | Nadie | Filtro vaporwave |
| `karaoke [on/off]` | | Nadie | Filtro karaoke |
| `tremolo [on/off]` | | Nadie | Filtro trémolo |
| `vibrato [on/off]` | | Nadie | Filtro vibrato |
| `eightd [on/off]` | `8d` | Nadie | Filtro de rotación 8D |
| `distortion [on/off]` | | Nadie | Filtro de distorsión |
| `stereowiden [on/off]` | `swiden` | Nadie | Ensanchamiento estéreo |
| `resetfilters` | `resetfx` | Nadie | Borrar todos los filtros |
| `activefilters` | `activefx` | Nadie | Listar los filtros activos |
| `lastfmlink` | `lflink` | Nadie | Obtener el botón de enlace de Last.fm |
| `lastfmunlink` | `lfunlink` | Nadie | Quitar tu vínculo con Last.fm |
| `lastfmtoggle` | `lftoggle` | Nadie | Pausar o reanudar el scrobbling |
| `lastfmstatus` | `lfstatus` | Nadie | Mostrar el estado de tu vínculo con Last.fm |
| `fm [user]` | | Nadie | Reproducción actual o último scrobble |
| `fmrecent [user]` | `fmr` | Nadie | Scrobbles recientes |
| `fmtopartists [period] [user]` | `fmta` | Nadie | Artistas más escuchados |
| `fmtopalbums [period] [user]` | `fmtal` | Nadie | Álbumes más escuchados |
| `fmtoptracks [period] [user]` | `fmtt` | Nadie | Pistas más escuchadas |
| `fmartist [artist]` | `fma` | Nadie | Información del artista y tus reproducciones |
| `fmalbum [query]` | `fmal` | Nadie | Información del álbum |
| `fmwhoknows [artist]` | `whoknows`, `wk` | Nadie | Clasificación del servidor para un artista |
| `fmwhoknowsalbum <query>` | `whoknowsalbum`, `wka` | Nadie | Clasificación del servidor para un álbum |
| `fmwhoknowstrack <query>` | `whoknowstrack`, `wkt` | Nadie | Clasificación del servidor para una pista |
| `fmcrowns [artist]` | `crowns` | Nadie | Coronas de artistas |
| `fmtaste <user>` | `taste` | Nadie | Comparar gustos con alguien |
| `fmchart [size] [period] [user]` | `chart` | Nadie | Collage de portadas de álbumes |
| `ttsenable` | `tts`, `ttson` | Gestionar servidor | Activar TTS en tu canal de voz |
| `ttsremove` | `ttsoff` | Gestionar servidor | Desactivar TTS en tu canal de voz |
| `ttslink [#channel]` | `ttschannel` | Gestionar servidor | Vincular un canal de texto al canal de voz |
| `ttsannounce` | `ttsjoinleave` | Gestionar servidor | Activar o desactivar los anuncios de entrada y salida |
| `ttsjoinformat [text]` | `ttsjoin` | Gestionar servidor | Texto del anuncio de entrada |
| `ttsleaveformat [text]` | `ttsleave` | Gestionar servidor | Texto del anuncio de salida |
| `ttsvolume <0..100>` | `ttsvol` | Gestionar servidor | Volumen del TTS |
| `ttsspeed <0.5..2>` | | Gestionar servidor | Velocidad del TTS |
| `ttsdefaultvoice [voice]` | `ttsdefvoice` | Gestionar servidor | Voz predeterminada del servidor |
| `ttsvoice [voice]` | | Nadie | Tu propia voz |
| `ttsvoices [search]` | `ttsvoicelist`, `ttsvoicesearch` | Nadie | Explorar voces |
| `ttsblock <user>` | `ttsban` | Gestionar servidor | Activar o quitar el bloqueo de TTS de un miembro |
| `ttsblocklist` | `ttsbanlist`, `ttsblocked` | Gestionar servidor | Listar los miembros bloqueados |
| `ttsrole [role]` | | Gestionar servidor | Exigir un rol para el TTS |
| `ttsreplycontext` | `ttsreply` | Gestionar servidor | Activar o desactivar el contexto de respuesta |
| `ttsattachmentnarration` | `ttsattach` | Gestionar servidor | Activar o desactivar la narración de adjuntos |
| `ttsconsecutivegrouping` | `ttsgroup` | Gestionar servidor | Activar o desactivar omitir el nombre en mensajes consecutivos |
| `ttsmaxqueue <1..50>` | `ttsqueue` | Gestionar servidor | Límite de mensajes de TTS pendientes |
| `ttssettings` | `ttsinfo` | Gestionar servidor | Mostrar los ajustes de TTS |

## Consejos y advertencias

- El bot necesita Conectar y Hablar en el canal de voz, y Enviar mensajes en el canal de música para los avisos.
- La mayoría de los comandos comprueban primero que estés en un canal de voz, y que sea el mismo en el que está el bot.
- El volumen de `volume` se guarda como predeterminado del servidor, así que un 10 de madrugada se convierte en el volumen inicial de mañana.
- Las listas de reproducción de Spotify se convierten pista por pista mediante la búsqueda de YouTube, así que las listas largas tardan un rato y algunas coincidencias pueden ser erróneas.
- Las listas de reproducción guardadas almacenan enlaces, no audio. Si se elimina un vídeo de YouTube, la entrada se omite al cargar.
- La votación para saltar solo cuenta a los humanos del canal. En un canal de una sola persona, tu propio voto basta.
- El TTS solo lee los mensajes de miembros que están en el canal de voz, así que quienes miran desde el texto no pueden activarlo.
