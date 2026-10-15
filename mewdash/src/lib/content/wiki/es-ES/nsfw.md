---
title: NSFW
slug: nsfw
summary: Comandos de imágenes para adultos que solo funcionan en canales marcados como NSFW, con una lista negra de etiquetas por servidor y publicación automática temporizada opcional.
icon: fa-eye-slash
category: Entertainment
module: Nsfw
tags: [nsfw, hentai, booru, rule34, e621, danbooru, gelbooru, nhentai, reddit, tag blacklist, autohentai, nsfwtoggle, contenido adulto, lista negra de etiquetas, publicación automática, alternar nsfw]
related: [servermanagement, permissions, filter]
---

## Qué hace

El módulo NSFW obtiene imágenes para adultos de sitios de imágenes y de Reddit cuando se le pide. Todos los comandos del módulo llevan el requisito NSFW de Discord: solo se ejecutan en un canal que tiene activada la marca NSFW, y la mayoría de comandos de sitios de imágenes también funcionan en MD con el bot. En cualquier otro canal, el comando se rechaza en silencio.

El staff controla dos cosas. `nsfwtoggle` (en el módulo de Administración) activa o desactiva la marca NSFW del canal actual, que es lo que desbloquea estos comandos allí. `nsfwtagbl` mantiene una lista de etiquetas que se eliminan de todas las búsquedas en sitios de imágenes de este servidor, así un servidor puede permitir el módulo y excluir al mismo tiempo el contenido que no quiere.

Los miembros ejecutan un comando de fuente con etiquetas opcionales y reciben una imagen con su clasificación, su fuente y las primeras etiquetas. Las variantes «bomb» publican cuatro a la vez. Los moderadores también pueden iniciar un temporizador que publica una nueva imagen en un canal cada cierto número de segundos.

## Por qué usarlo

- Un servidor +18 quiere que los comandos de imágenes estén limitados a sus canales marcados.
- El staff quiere bloquear ciertas etiquetas en todo el servidor sin desactivar el módulo.
- Un canal dedicado debería recibir una imagen nueva con un temporizador, sin que nadie escriba nada.

## Requisito de canal

La marca NSFW de Discord es por canal. Ejecuta `nsfwtoggle` en un canal para activarla o desactivarla; necesitas el permiso Gestionar canales tú y el bot. El bot responde para confirmar el nuevo estado. La misma marca también se puede establecer en los ajustes del canal de Discord.

Si se usa un comando en un canal que no es NSFW, no pasa nada. Los miembros a veces creen que el bot está roto, así que una nota en tu canal de normas ayuda.

## Fuentes

| Comando | Fuente | Notas |
| --- | --- | --- |
| `hentai [tags]` | Sitios combinados, solo explícito | Espera de cinco segundos |
| `yandere`, `konachan`, `sankaku`, `e621`, `rule34`, `danbooru`, `gelbooru`, `derpibooru`, `safebooru`, `realbooru` | El sitio indicado | Cada uno admite etiquetas opcionales |
| `hentaibomb [tags]` | Yandere, Danbooru, Konachan y Gelbooru | Cuatro imágenes a la vez |
| `pornbomb [tags]` | Realbooru | Cuatro imágenes a la vez |
| `redditnsfw <subreddit>` | Un post aleatorio entre los más votados de ese subreddit | Espera de diez segundos |
| `boobs`, `butts` | Subreddits fijos a través de `redditnsfw` | |
| `pussy`, `anal`, `porn`, `bondage`, `hentaigif` | Endpoints de categoría | Solo canal NSFW, no MD |
| `nhentai <id>` | Una galería concreta por número | Rechaza galerías etiquetadas como lolicon o shotacon |
| `nhentaisearch <query> [page] [type] [blacklist]` | Búsqueda de galerías | |

Las etiquetas se separan con espacios. En e621 y Derpibooru, la etiqueta `yuri` se traduce automáticamente a la equivalente de ese sitio. Solo puede haber un `hentaibomb` y un `pornbomb` en ejecución a la vez por servidor.

## Lista negra de etiquetas

`nsfwtagbl` sin argumentos muestra las etiquetas en la lista negra. `nsfwtagbl <tag>` añade la etiqueta o, si ya está en la lista, la elimina. Los resultados que tengan una etiqueta de la lista negra se omiten en todos los comandos de sitios de imágenes del servidor. Necesita el permiso Gestionar mensajes.

## Publicación automática

`autohentai <seconds> [tags]`, `autoboobs <seconds>` y `autobutts <seconds>` inician un temporizador en el canal actual. El intervalo debe ser de al menos 20 segundos para `autohentai` y `autobutts`; `autoboobs` no tiene un mínimo. Ejecutar el comando con `0`, o sin intervalo, detiene el temporizador de ese canal. En `autohentai`, separa los conjuntos de etiquetas alternativos con `|` y el bot elegirá uno al azar cada vez; deja las etiquetas fuera para imágenes aleatorias. Estos comandos necesitan el permiso Gestionar mensajes y el canal debe ser NSFW. Los temporizadores no sobreviven a un reinicio del bot.

## Ajustes

Este módulo no tiene página en el panel.

| Ajuste | Predeterminado | Qué controla |
| --- | --- | --- |
| Marca NSFW del canal | desactivada | Si alguno de estos comandos se ejecuta en un canal |
| Lista negra de etiquetas | vacía | Etiquetas excluidas de los resultados de sitios de imágenes en este servidor |
| Temporizadores de publicación automática | ninguno | Temporizadores por canal iniciados con los comandos `auto...` |

## Guía de configuración

1. Elige el canal y ejecuta `nsfwtoggle` en él, o establece la marca en los ajustes del canal de Discord.
2. Usa los Permisos de comandos para mantener el módulo fuera del resto de canales, por ejemplo `srvrmdl nsfw disable` seguido de `chnlmdl nsfw enable #adult`.
3. Añade las etiquetas que no quieres con `nsfwtagbl <tag>`, una por comando.
4. Prueba con `hentai` o `rule34 <tag>` en el canal.
5. Opcionalmente, inicia `autohentai 300 <tags>` y deténlo más tarde con `autohentai 0`.

## Comandos

Usa estos comandos con el prefijo de tu servidor (`.` a menos que lo hayas cambiado).

| Comando | Alias | Requiere | Función |
| --- | --- | --- | --- |
| `nsfwtoggle` | `nsfw`, `nsfwtgl` | Gestionar canales | Activar o desactivar la marca NSFW del canal actual |
| `nsfwtagbl [tag]` | `nsfwtbl` | Gestionar mensajes | Listar, añadir o quitar una etiqueta de la lista negra |
| `hentai [tags]` | | Nadie | Una imagen explícita de los sitios combinados |
| `hentaibomb [tags]` | | Nadie | Cuatro imágenes de cuatro sitios |
| `pornbomb [tags]` | | Nadie | Cuatro imágenes de Realbooru |
| `yandere [tags]` | | Nadie | Yande.re |
| `konachan [tags]` | | Nadie | Konachan |
| `sankaku [tags]` | | Nadie | Sankaku |
| `e621 [tags]` | | Nadie | e621 |
| `rule34 [tags]` | `r34` | Nadie | Rule34 |
| `danbooru [tags]` | | Nadie | Danbooru |
| `gelbooru [tags]` | | Nadie | Gelbooru |
| `derpibooru [tags]` | `derpi` | Nadie | Derpibooru |
| `safebooru [tags]` | | Nadie | Safebooru |
| `realbooru [tags]` | `rb` | Nadie | Realbooru |
| `redditnsfw <subreddit>` | `nsfwsubreddit` | Nadie | Post aleatorio de un subreddit |
| `boobs` | | Nadie | Atajo de Reddit |
| `butts` | `ass`, `butt` | Nadie | Atajo de Reddit |
| `pussy` | | Nadie | Imagen de categoría |
| `anal` | | Nadie | Imagen de categoría |
| `porn` | | Nadie | Imagen de categoría |
| `bondage` | | Nadie | Imagen de categoría |
| `hentaigif` | | Nadie | GIF de categoría |
| `nhentai <id>` | `nh` | Nadie | Explorar una galería por número |
| `nhentaisearch <query> [page] [type] [blacklist]` | `nhsearch`, `nhs` | Nadie | Buscar galerías |
| `autohentai [seconds] [tags]` | | Gestionar mensajes | Publicación temporizada; `0` la detiene |
| `autoboobs [seconds]` | | Gestionar mensajes | Publicación temporizada; `0` la detiene; sin intervalo mínimo |
| `autobutts [seconds]` | | Gestionar mensajes | Publicación temporizada; `0` la detiene |

## Consejos y trampas

- El control de edad lo hacen la marca de canal de Discord y la lista negra de etiquetas del bot. El bot no comprueba la edad ni los roles de los miembros; para eso usa los Permisos de comandos.
- Los dueños del bot también pueden desactivar el módulo globalmente, en cuyo caso aparece como bloqueado en el menú de ayuda.
- Los sitios de imágenes limitan las peticiones y a veces no devuelven nada con combinaciones de etiquetas muy concretas; el bot responde que no se encontró ninguna imagen.
- Los temporizadores son por canal y están en memoria. Después de un reinicio, vuelve a iniciarlos.
