---
title: Palabra del día
slug: wordoftheday
summary: Publica una palabra de vocabulario al día con su definición, pronunciación y un ejemplo, elegida de un diccionario por tema y dificultad o de una lista que escribe el propio servidor.
icon: fa-book-open
category: Community
dashboard: /dashboard/wordoftheday
module: WordOfTheDay
tags: [word of the day, wotd, vocabulary, dictionary, definition, daily, datamuse, topic, schedule, palabra del día, vocabulario, diccionario, definición, diario, tema, programación]
related: [birthday, utility]
---

## Qué hace

Una vez al día, a una hora que el servidor elige en su propia zona horaria, el bot publica una palabra en el canal elegido. La publicación muestra la palabra, cómo se pronuncia, su categoría gramatical, una definición y una frase de ejemplo cuando existe. Se puede mencionar a un rol con cada publicación.

Las palabras provienen del diccionario Datamuse y se filtran con tres ajustes: un **tema** hacia el que deben tender las palabras, una **categoría gramatical** y una **dificultad** basada en la frecuencia con la que aparece la palabra en el inglés escrito. El bot evita repetir cualquier cosa que haya publicado en los últimos noventa días.

Los servidores también pueden crear una **lista personalizada** con `wotdadd`. Si se omite la definición, el bot la busca. El **modo de fuente** decide si las publicaciones salen del diccionario, de la lista personalizada, o de la lista personalizada primero y del diccionario cuando se agota.

## Programar por día de la semana o mes

Las reglas pueden sustituir el tema, la categoría gramatical y la dificultad para un día de la semana o un mes concretos. Una regla solo cambia los campos que define, así que una regla de lunes con solo un tema sigue usando la categoría gramatical y la dificultad base. Cuando ambas se aplican, las reglas de día de la semana tienen prioridad sobre las de mes, y las de mes tienen prioridad sobre los ajustes base.

Ejemplos:

- `wotdday monday science` hace que la palabra del lunes sea de ciencia.
- `wotddayfilter friday adjective rare` hace que los viernes sean adjetivos raros.
- `wotdmonth october spooky halloween` tematiza todo octubre.
- `wotdschedule` muestra todas las reglas y qué filtros están activos hoy.

## Hilo de debate

Cuando está activado, el bot crea un hilo público bajo cada publicación diaria y deja un mensaje inicial que invita a la gente a usar la palabra en una frase. El nombre del hilo sale de una plantilla (por defecto `Word of the day: %wotd.word%`) que admite `%wotd.word%`, `%wotd.date%`, `%wotd.pos%` y los marcadores habituales del servidor. `wotdthread` activa o desactiva el hilo, `wotdthreadname` establece, muestra o borra la plantilla del nombre, y `wotdthreadarchive` define cuánto tiempo permanece abierto el hilo antes de archivarse automáticamente (1 hora, 1 día, 3 días o 1 semana).

## Comandos

| Comando | Qué hace |
| --- | --- |
| `wotd` | Muestra la palabra de hoy, o una vista previa si todavía no se ha publicado nada. |
| `wotdchannel #channel` | Establece el canal y activa las publicaciones. |
| `wotdtime 9` | Establece la hora local a la que publicar. |
| `wotdtimezone Europe/London` | Establece la zona horaria. |
| `wotdtopic space` | Establece el tema base. |
| `wotdpos noun` | Restringe la categoría gramatical. |
| `wotddifficulty rare` | Establece la dificultad. |
| `wotdmode mixed` | Elige diccionario, personalizada o mixta. |
| `wotdadd word [definition]` | Añade una palabra personalizada. |
| `wotdmessage` | Establece una plantilla de mensaje personalizada con marcadores o JSON de embed. |
| `wotdthread` | Activa o desactiva el hilo de debate bajo cada publicación. |
| `wotdthreadname [template\|clear]` | Establece, muestra o borra la plantilla del nombre del hilo. |
| `wotdthreadarchive 1h\|24h\|3d\|7d` | Define cuánto tiempo permanece abierto el hilo antes de archivarse automáticamente. |
| `wotdpost` | Publica una palabra nueva ahora mismo. |

## Marcadores del mensaje

`%wotd.word%`, `%wotd.definition%`, `%wotd.pos%`, `%wotd.example%`, `%wotd.phonetic%`, `%wotd.date%` y `%wotd.ping%` están disponibles dentro de una plantilla personalizada, junto con los marcadores habituales del servidor.
