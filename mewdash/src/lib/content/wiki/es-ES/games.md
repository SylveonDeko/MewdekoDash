---
title: Juegos
slug: games
summary: Juegos de chat que los miembros pueden iniciar en cualquier canal, desde trivia, ahorcado y cadenas de palabras hasta carreras de mecanografía, acrofobia y encuestas.
icon: fa-gamepad-modern
category: Entertainment
module: Games
tags: [games, trivia, hangman, kaladont, nunchi, typing race, acrophobia, tic tac toe, poll, vote, 8ball, choose, juegos, ahorcado, carrera de mecanografía, acrofobia, tres en raya, encuesta, votación, bola 8, elegir]
related: [polls, currency, xp, searches, utility]
---

## Qué hace

Los juegos se juegan en el canal donde se inician. Un miembro ejecuta un comando, el bot publica el juego y todos en el canal juegan escribiendo respuestas o pulsando botones. Solo se ejecuta un juego de cada tipo por canal (o por servidor en Nunchi y Kaladont) a la vez, y la mayoría de los juegos se pueden detener antes con el comando de parada correspondiente.

Trivia, ahorcado, Kaladont, Nunchi, la carrera de mecanografía, acrofobia y tres en raya son multijugador. Las encuestas permiten al staff plantear una pregunta al canal con botones o un menú desplegable. `choose` y `8ball` son juguetes de una sola vez.

No hay una página del panel para este módulo. Todo se hace con comandos, y la mayoría no necesita ningún permiso.

## Por qué usarlo

- Anima una tarde tranquila con una ronda de trivia o ahorcado.
- Organiza una carrera de mecanografía o un torneo de Kaladont como evento de la comunidad.
- Haz al servidor una pregunta rápida de sí o no, o una encuesta de varias opciones con un menú desplegable.
- Configura un canal permanente de Kaladont para que la cadena de palabras nunca se detenga.

## Trivia

`trivia` inicia un cuestionario. El bot publica una pregunta, muestra una pista a mitad del temporizador de la pregunta salvo que las pistas estén desactivadas, y el primer miembro que escriba la respuesta consigue un punto. Cuando un miembro alcanza el requisito de victoria, el juego termina y gana. Si se quedan sin responder suficientes preguntas seguidas, el juego se detiene.

| Opción | Por defecto | Qué hace |
| --- | --- | --- |
| `-p`, `--pokemon` | desactivada | Modo "¿Quién es ese Pokémon?" |
| `--nohint` | desactivada | No mostrar nunca pistas |
| `-w`, `--win-req` | 10 | Puntos necesarios para ganar; 0 para un juego sin fin |
| `-q`, `--question-timer` | 30 | Segundos por pregunta |
| `-t`, `--timeout` | 10 | Preguntas sin responder seguidas antes de que el juego se detenga; 0 para nunca |

`tl` muestra las puntuaciones actuales y `tq` detiene el juego. La configuración global del bot puede definir un requisito mínimo de victoria y un premio en moneda para el ganador.

> [!EXAMPLE]
> `trivia -w 5 -q 20` ejecuta un juego corto hasta cinco puntos con veinte segundos por pregunta.

## Ahorcado

`hangman [type]` elige una palabra de una categoría y la muestra como espacios en blanco. Los miembros adivinan una sola letra, o la palabra completa, escribiéndola en el canal. Seis fallos pierden el juego. Las categorías son `countries`, `movies`, `animals`, `things` y `random`; `random` es la predeterminada. `hangmanlist` muestra los tipos disponibles en tu servidor y `hangmanstop` termina el juego.

## Kaladont

Kaladont es una cadena de palabras. Cada palabra debe empezar con las dos últimas letras de la palabra anterior, y una palabra solo se puede usar una vez por juego. Los jugadores se turnan, con un límite de tiempo por turno. El diccionario puede ser inglés o serbio, y los dígrafos serbios (como lj y nj) se tratan como letras sueltas.

| Opción | Por defecto | Qué hace |
| --- | --- | --- |
| `-j`, `--join-time` | 15 | Segundos para que los jugadores se unan antes de que empiece el juego |
| `-t`, `--turn-time` | 30 | Segundos por turno |
| `-m`, `--min-players` | 2 | Jugadores necesarios para empezar |
| `-l`, `--language` | en | `en` o `sr` |
| `-e`, `--endless` | desactivada | Rechaza palabras que no dejen ninguna palabra válida para el siguiente jugador |

`kaladontstop` termina el juego actual. `kaladontsetup` convierte el canal actual en un canal persistente de Kaladont que mantiene la cadena en marcha, con las mismas opciones de idioma y sin fin, y `kaladontdisable` lo quita. Ambos necesitan Gestionar canales.

## Nunchi

`nunchi` crea un juego, y otros miembros ejecutan `nunchi` para unirse mientras está en la fase de unión. En cada ronda el bot anuncia un número y cada jugador debe escribir el siguiente número. Los jugadores que lo escriben correctamente pasan; cuando todos menos uno han pasado, la ronda termina y el jugador restante queda eliminado. Si nadie responde a tiempo, la ronda se reinicia con todos los que ya han pasado. El último jugador en pie gana.

## Carrera de mecanografía

`typestart` hace una cuenta atrás (cinco segundos por defecto, `-s` o `--start-time` define de 3 a 30) y luego publica una frase. El primer miembro que la escriba con suficiente precisión gana; se toleran unos pocos errores, aproximadamente uno cada 25 caracteres. El resultado muestra palabras por minuto y el número de errores. `typestop` termina una carrera, `typelist` muestra el conjunto de frases, y los propietarios del bot pueden añadir o eliminar frases con `typeadd` y `typedel`.

## Acrofobia

`acrophobia` publica de tres a cinco letras aleatorias. Los miembros tienen el tiempo de envío (por defecto 60 segundos, de 15 a 300) para enviar una frase cuyas palabras empiecen con esas letras en orden, un envío cada uno. Después todos votan por su favorita por número durante el tiempo de votación (por defecto 60 segundos, de 15 a 120). No puedes votar por tu propia entrada. Define los temporizadores con `-s` o `--submission-time` y `-v` o `--vote-time`.

## Tres en raya

`tictactoe` abre un juego; el siguiente miembro que lo ejecute se une como segundo jugador. Los turnos se hacen en el chat, y un jugador que tarde más que el temporizador de turno (por defecto 15 segundos, `-t` o `--turn-timer`, de 5 a 60) pierde. El juego informa de un ganador o de un empate.

## Encuestas

Crear encuestas requiere Gestionar mensajes. Las opciones se separan con punto y coma.

| Comando | Tipo | Comportamiento |
| --- | --- | --- |
| `poll <question>` | Sí/No | Dos botones |
| `pollc question;option1;option2;...` | Opción única | Un voto por miembro |
| `pollm question;option1;option2;...` | Opción múltiple | Los miembros pueden elegir varias opciones |
| `polla question;option1;option2;...` | Anónima | Las identidades de los votantes se ocultan |

Las encuestas con dos a cinco opciones usan botones; las más largas usan un menú desplegable con hasta 25 entradas. Los miembros pueden cambiar su voto. Las plantillas guardan una pregunta y sus opciones para reutilizarlas: `polltemplates` las lista y `polltemplate <name>` publica una. Crear y eliminar plantillas, cerrar una encuesta, listar las encuestas activas y ver las estadísticas de una encuesta se hace con los comandos de barra `/poll` (`create-template`, `delete-template`, `close`, `list`, `stats`) o en la página de Encuestas del panel, que tiene su propio artículo.

## Otros

- `choose a; b; c` elige una opción al azar de una lista separada por punto y coma.
- `8ball <question>` responde con una lista de respuestas de la configuración de juegos del bot.
- `linux <word> <word>` publica el copypasta de "I'd just like to interject" con los dos nombres intercambiados.
- `dragon` activa o desactiva tu marca de probador beta, que algunos comandos experimentales comprueban.
- `rategirl` existe solo como un esqueleto con una nota sobre por qué se eliminó. No hace nada útil.

## Ajustes

Este módulo no tiene página en el panel ni ajustes por servidor. El comportamiento de los juegos se define con las opciones de comando anteriores. La configuración `games.yml` del propietario del bot contiene las respuestas de 8ball y el requisito mínimo de victoria y la recompensa en moneda de la trivia.

## Guía de configuración

1. Elige un canal para los juegos, o crea uno, para que los mensajes de los juegos no ahoguen la conversación.
2. Si quieres una cadena de palabras permanente, ejecuta `kaladontsetup -l en` en ese canal.
3. Ejecuta `trivia` o `hangman` para comprobar que el bot puede enviar mensajes y leer respuestas allí.
4. Da Gestionar mensajes al staff si quieres que ejecute encuestas.

## Comandos

Ejecútalos con el prefijo de tu servidor (`.` salvo que lo hayas cambiado).

| Comando | Alias | Requiere | Para qué sirve |
| --- | --- | --- | --- |
| `trivia [options]` | `t` | Nadie | Iniciar trivia |
| `tl` | | Nadie | Puntuaciones de la trivia |
| `tq` | | Nadie | Detener la trivia |
| `hangman [type]` | | Nadie | Iniciar ahorcado |
| `hangmanlist` | | Nadie | Listar los tipos de ahorcado |
| `hangmanstop` | | Nadie | Detener el ahorcado |
| `kaladont [options]` | `kal` | Nadie | Iniciar Kaladont |
| `kaladontstop` | `kalstop` | Nadie | Detener Kaladont |
| `kaladontsetup [options]` | `kalsetup` | Gestionar canales | Convertir este canal en un canal persistente de Kaladont |
| `kaladontdisable` | `kaldisable` | Gestionar canales | Quitar el canal persistente |
| `nunchi` | | Nadie | Crear o unirse a Nunchi |
| `typestart [options]` | | Nadie | Iniciar una carrera de mecanografía |
| `typestop` | | Nadie | Detener la carrera |
| `typelist [page]` | | Nadie | Listar las frases de la carrera |
| `typeadd <text>` | | Propietario del bot | Añadir una frase |
| `typedel <index>` | | Propietario del bot | Eliminar una frase |
| `acrophobia [options]` | `acro` | Nadie | Iniciar acrofobia |
| `tictactoe [options]` | `ttt` | Nadie | Iniciar o unirse a tres en raya |
| `poll <question>` | `ppoll` | Gestionar mensajes | Encuesta de sí/no |
| `pollc <question;options>` | | Gestionar mensajes | Encuesta de opción única |
| `pollm <question;options>` | | Gestionar mensajes | Encuesta de opción múltiple |
| `polla <question;options>` | | Gestionar mensajes | Encuesta anónima |
| `polltemplates` | `ptemplates` | Nadie | Listar las plantillas de encuestas |
| `polltemplate <name>` | `ptemplate` | Gestionar mensajes | Publicar una encuesta desde una plantilla |
| `choose <a; b; c>` | | Nadie | Elegir una al azar |
| `8ball [question]` | `eightball` | Nadie | Bola 8 mágica |
| `linux <word> <word>` | | Nadie | El copypasta de la interjección |
| `dragon` | | Nadie | Activar o desactivar tu marca beta |
| `rategirl` | | Nadie | Esqueleto, no hace nada |

## Consejos y advertencias

- Los juegos leen las respuestas del canal, así que el bot necesita Ver el historial de mensajes y Enviar mensajes allí, y no debe estar bloqueado por una regla de permisos del canal.
- Las respuestas de trivia, ahorcado y Kaladont son mensajes normales. Si además usas el recuento de mensajes o XP, esos mensajes cuentan.
- Solo puede ejecutarse un juego de trivia, ahorcado, mecanografía o Kaladont por canal; el comando de inicio te avisa si ya hay uno en marcha.
- Las opciones de encuesta de más de 100 caracteres se recortan en el menú desplegable.
- Nunchi elimina al jugador más lento en cada ronda, así que un grupo grande puede tardar en terminar.
