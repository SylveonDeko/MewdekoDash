---
title: Búsquedas
slug: searches
summary: Consulta cosas sin salir de Discord, desde el clima, la hora y definiciones del diccionario hasta anime, películas, imágenes, perfiles de osu!, chistes y GIFs de reacción.
icon: fa-magnifying-glass
category: Entertainment
module: Searches
tags: [search, weather, time, define, urban dictionary, wikipedia, google, image search, anime, manga, movie, osu, pokemon, translate, xkcd, meme, reddit, hug, pat, ship, búsqueda, clima, hora, definir, diccionario, búsqueda de imágenes, película, traducir, abrazo]
related: [streams, feeds, twitch, games, utility]
---

## Qué hace

El módulo Búsquedas es un conjunto de comandos de consulta que obtienen algo de un servicio externo y lo publican en el canal. Los miembros piden el clima de una ciudad, la hora en algún lugar, la definición de una palabra, un anime o una película, un resumen de Wikipedia, un gato aleatorio o un GIF de reacción para un abrazo o una bofetada. La mayoría de los resultados vuelven como un embed, y las búsquedas con muchos resultados están paginadas.

No hay una página en el panel. Casi todos los comandos están abiertos a todo el mundo, y solo el modo automático de traducción necesita permiso del staff.

Las notificaciones de streams y los feeds RSS viven en el mismo módulo del bot pero tienen sus propios artículos. Consulta las páginas de notificaciones de streams y de feeds para `streamadd`, `feedadd` y similares.

## Por qué usarlo

- Resuelve el "¿qué hora es allí?" con `time` en lugar de hacer cuentas.
- Consulta el pronóstico antes de un evento con una tarjeta interactiva de `weather`.
- Busca un anime, manga o personaje mientras charlas sobre él.
- Deja que los miembros envíen abrazos, caricias y choques de manos como GIFs.
- Traduce un mensaje al momento, o traduce automáticamente un canal para una comunidad internacional.

## Clima y hora

`weather <place>` geocodifica el lugar con Open-Meteo y muestra las condiciones actuales: temperatura, sensación térmica, humedad, velocidad del viento y ráfagas, presión, nubosidad, visibilidad, y la máxima y la mínima del día. Los botones y un menú desplegable cambian al pronóstico por horas, a las condiciones detalladas por horas y a una vista diaria con la máxima, la mínima y la precipitación de hoy y de mañana.

`time <place>` busca el lugar y muestra la hora actual y la zona horaria. Cuando varios lugares coinciden, ofrece los candidatos para elegir.

## Palabras y conocimiento

| Comando | Fuente | Resultado |
| --- | --- | --- |
| `define <word>` | Diccionario Pearson | Definición, categoría gramatical y una frase de ejemplo |
| `urbandict <term>` | Urban Dictionary | Definiciones, paginadas |
| `wiki <query>` | Wikipedia | Resumen de la primera página que coincide |
| `wikia <site> <query>` | Una wiki de Fandom | Resumen de esa wiki |
| `google <query>` | Google, con DuckDuckGo como respaldo | Resultados web |
| `bible <book> <chapter:verse>` | API de la Biblia | El texto del versículo |
| `resolvetonetags <text>` | integrado | Explica las etiquetas de tono como `/j` o `/s` que aparezcan en el texto |
| `translate <langs> <text>` | API de traducción | Texto traducido; langs es `from>to`, por ejemplo `translate en>fr hello` |
| `translangs` | API de traducción | Idiomas que puedes usar |

### Traducción automática

`autotranslate` activa o desactiva la traducción automática del canal actual y requiere Administrador. Indica `del` para borrar el mensaje original tras traducirlo, o `nodel` (el valor por defecto) para conservarlo. Después, cada miembro ejecuta `autotranslang en>fr` para definir su propio par de idiomas en ese canal, o `autotranslang` sin nada para quitarlo.

## Multimedia y fandom

| Comando | Qué obtienes |
| --- | --- |
| `anime <query>` | Resultados de búsqueda de anime con detalles |
| `manga <query>` | Resultados de búsqueda de manga |
| `charinfo <name>` | Los nombres, la descripción y la imagen de un personaje |
| `findanime [image]` | Identifica un anime a partir de una captura mediante trace.moe; adjunta una imagen o indica una URL |
| `mal <username or @user>` | Un perfil de MyAnimeList con estadísticas de viendo, completados y más |
| `movie <title>` | Detalles de IMDb mediante OMDb |
| `youtube <query>` | Resultados de búsqueda de YouTube |
| `steam <game>` | Enlace a la página de la tienda de Steam del juego |
| `pokemon <name>` | Detalles de un Pokémon |
| `osu <user> [mode]`, `osu5 <user> [mode]` | Perfil de osu!, o las cinco mejores jugadas; los modos son standard, taiko, catch y mania |
| `gatari <user> [mode]` | Perfil de osu!Gatari |
| `xkcd [number or latest]` | Un cómic de xkcd, aleatorio por defecto |

## Imágenes

`image <query>` busca en Google y DuckDuckGo con búsqueda segura estricta, y luego pasa los resultados por una comprobación de seguridad antes de mostrarlos en un embed paginado. Se puede usar una vez cada veinte segundos por miembro. `safebooru <tag>` obtiene una imagen etiquetada de Safebooru. `revimg <url>` y `revav [@user]` dan enlaces de búsqueda inversa de imágenes en Google, TinEye y Yandex para una imagen o un avatar. `color <hex...>` genera muestras de uno o más colores hexadecimales.

Imágenes aleatorias: `randomcat`, `randomdog`, `randomfood`, `randombird`, `randomneko`, `randomkitsune` y `randomwaifu`. `meme` publica un meme aleatorio de un conjunto de subreddits, y `randomreddit <subreddit>` publica una publicación aleatoria de un subreddit tras comprobar que no esté marcado como NSFW. `memelist` muestra las plantillas de memegen y `memegen <template> [text]` crea uno. `rip @user` genera una imagen de lápida con su nombre y avatar. `shorten <url>` acorta un enlace.

## Chistes

`randjoke`, `yomama`, `chucknorris`, `wowjoke` y `magicitem` obtienen cada uno un chiste o la descripción de un objeto de sus respectivas API. `catfact` publica un dato sobre gatos.

## Comandos de reacción

Estos publican un GIF de anime para la acción. Los dirigidos a alguien aceptan una mención: `hug`, `kiss`, `pat`, `cuddle`, `poke`, `tickle`, `slap`, `punch`, `shoot`, `bite`, `feed`, `baka`, `handhold` y `highfive`. Los que tratan de ti mismo aceptan texto opcional: `blush`, `bored`, `cry`, `dance`, `facepalm`, `happy`, `laugh`, `pout`, `shrug`, `sleep`, `smile`, `smug`, `stare`, `think`, `thumbsup`, `wave` y `wink`. Todos están también disponibles como comandos de barra.

`ship @user [@user2]` puntúa la compatibilidad de dos miembros (o de ti y un miembro) y publica una imagen de ship con un comentario.

## Ajustes

Este módulo no tiene página en el panel ni ajustes por servidor aparte del interruptor de traducción automática. Varios comandos dependen de claves de API que configura el propietario del bot; si falta una clave, el comando responde con un error en lugar de resultados.

## Guía de configuración

1. No hay que activar nada. Ejecuta `weather London` o `define serendipity` para confirmar que el bot puede responder en el canal.
2. Si quieres un canal traducido, ejecuta `autotranslate` allí como administrador y luego haz que los miembros definan `autotranslang en>es` o similar.
3. Usa el módulo de permisos si quieres restringir los comandos de reacción o de imágenes a ciertos canales.

## Comandos

Ejecútalos con el prefijo de tu servidor (`.` salvo que lo hayas cambiado).

| Comando | Alias | Requiere | Para qué sirve |
| --- | --- | --- | --- |
| `weather <place>` | `we` | Nadie | Tarjeta interactiva del clima |
| `time <place>` | | Nadie | Hora actual y zona horaria |
| `define <word>` | `def` | Nadie | Definición del diccionario |
| `urbandict <term>` | `ud` | Nadie | Urban Dictionary |
| `wiki <query>` | `wikipedia` | Nadie | Resumen de Wikipedia |
| `wikia <site> <query>` | `fandom` | Nadie | Consulta en una wiki de Fandom |
| `google <query>` | `g` | Nadie | Búsqueda web |
| `bible <book> <chapter:verse>` | | Nadie | Versículo de la Biblia |
| `resolvetonetags <text>` | `tonetag`, `resolvetonetag`, `tonetags` | Nadie | Explicar etiquetas de tono |
| `translate <langs> <text>` | `trans` | Nadie | Traducir texto, por ejemplo `translate en>fr hello` |
| `translangs` | | Nadie | Idiomas admitidos |
| `autotranslate [del\|nodel]` | `at`, `autotrans` | Administrador | Activar o desactivar la traducción automática del canal |
| `autotranslang [from>to]` | `atl` | Nadie | Tu par de idiomas para la traducción automática |
| `anime <query>` | `ani`, `aq` | Nadie | Búsqueda de anime |
| `manga <query>` | `mang`, `mq` | Nadie | Búsqueda de manga |
| `charinfo <name>` | `characterinfo` | Nadie | Consulta de personaje |
| `findanime [image]` | `whatanime` | Nadie | Identificar un anime a partir de una captura |
| `mal <username or @user>` | | Nadie | Perfil de MyAnimeList |
| `movie <title>` | `omdb`, `imdb` | Nadie | Detalles de una película |
| `youtube <query>` | `yt` | Nadie | Búsqueda de YouTube |
| `steam <game>` | | Nadie | Enlace a la tienda de Steam |
| `pokemon <name>` | | Nadie | Detalles de un Pokémon |
| `osu <user> [mode]` | | Nadie | Perfil de osu! |
| `osu5 <user> [mode]` | | Nadie | Las cinco mejores jugadas de osu! |
| `gatari <user> [mode]` | | Nadie | Perfil de osu!Gatari |
| `xkcd [number\|latest]` | | Nadie | Cómic de xkcd |
| `image <query>` | `img`, `rimg` | Nadie | Búsqueda segura de imágenes |
| `safebooru [tag]` | | Nadie | Imagen de Safebooru |
| `revimg <url>` | | Nadie | Enlaces de búsqueda inversa de imágenes |
| `revav [@user]` | | Nadie | Búsqueda inversa de un avatar |
| `color <hex...>` | `clr` | Nadie | Muestras de color |
| `randomcat` | `meow` | Nadie | Imagen de un gato |
| `randomdog` | `woof` | Nadie | Imagen de un perro |
| `randomfood` | `yum` | Nadie | Imagen de comida |
| `randombird` | `birb`, `bird` | Nadie | Imagen de un pájaro |
| `randomneko` | `neko` | Nadie | Imagen de un neko |
| `randomkitsune` | `kitsune` | Nadie | Imagen de un kitsune |
| `randomwaifu` | `waifu` | Nadie | Imagen de una waifu |
| `meme` | `randommeme` | Nadie | Meme aleatorio de Reddit |
| `randomreddit <subreddit>` | `subreddit` | Nadie | Publicación aleatoria de un subreddit |
| `memelist` | | Nadie | Plantillas de memegen |
| `memegen <template> [text]` | | Nadie | Crear un meme |
| `rip <@user>` | | Nadie | Imagen de lápida |
| `shorten <url>` | | Nadie | Acortar un enlace |
| `randjoke` | | Nadie | Chiste aleatorio |
| `yomama` | `ym` | Nadie | Chiste de "tu mamá" |
| `chucknorris` | `cn` | Nadie | Chiste de Chuck Norris |
| `wowjoke` | | Nadie | Chiste de World of Warcraft |
| `magicitem` | `mi` | Nadie | Objeto mágico de WoW |
| `catfact` | | Nadie | Dato sobre gatos |
| `ship <@user> [@user2]` | | Nadie | Imagen con la puntuación de compatibilidad |
| `hug`, `kiss`, `pat`, `cuddle`, `poke`, `tickle`, `slap`, `punch`, `shoot`, `bite`, `feed`, `baka`, `handhold`, `highfive <@user>` | | Nadie | GIF de reacción dirigido a alguien |
| `blush`, `bored`, `cry`, `dance`, `facepalm`, `happy`, `laugh`, `pout`, `shrug`, `sleep`, `smile`, `smug`, `stare`, `think`, `thumbsup`, `wave`, `wink [text]` | | Nadie | GIF de reacción sobre ti mismo |

## Consejos y advertencias

- Estos comandos llaman a servicios externos, así que los resultados dependen de que esos servicios estén operativos y de que el propietario del bot tenga las claves de API correctas.
- `image` tiene un límite de una búsqueda cada veinte segundos por miembro, y los resultados se filtran por seguridad incluso en canales NSFW.
- `randomreddit` rechaza los subreddits marcados como NSFW. Usa el módulo NSFW para contenido adulto.
- La traducción automática es por canal y por miembro: el canal debe ser activado por un administrador y cada miembro elige su propio par.
- Las notificaciones de streams (`streamadd`, `streamlist`, `streamtemplate`) y los feeds RSS (`feedadd`, `feedlist`) están documentados por separado aunque compartan este módulo.
