---
title: Sorteos
slug: giveaways
summary: Organiza sorteos con tiempo límite en los que los miembros participan por reacción, botón o captcha web, con requisitos de rol y de número de mensajes, elección aleatoria de ganadores, nuevos sorteos entre participantes y MD a los ganadores.
icon: fa-gift
category: Entertainment
dashboard: /dashboard/giveaways
module: Giveaways
tags: [giveaway, gstart, prize, raffle, winner, reroll, contest, entry, captcha, sorteo, premio, rifa, ganador, repetir sorteo, concurso, participación]
related: [embedbuilder, chat-triggers, xp]
---

## Qué hace

El staff inicia un sorteo con un premio, un canal, un número de ganadores y una duración. El bot publica un embed en ese canal que muestra el premio, el anfitrión, cuándo termina y los requisitos que haya. Los miembros participan reaccionando con el emote de sorteos del servidor, pulsando un botón **Participar** o resolviendo un captcha en el panel, según cómo se haya iniciado el sorteo.

Cuando se acaba el tiempo, el bot elige ganadores al azar entre todos los que participaron y siguen cumpliendo los requisitos. Edita el mensaje original para mostrar a los ganadores, publica un mensaje de felicitación en el canal y, si está activado, envía un MD a cada ganador con un enlace al sorteo. El staff puede terminar un sorteo antes de tiempo o repetirlo una vez terminado.

Los requisitos se comprueban al final, no al participar. Alguien que reaccionó pero que después perdió un rol requerido se omite al elegir a los ganadores.

## Por qué usarlo

- Sortea claves de juegos, Nitro o merchandising entre los miembros activos sin elegir nombres a mano.
- Recompensa a quienes de verdad han estado hablando, exigiendo un número mínimo de mensajes.
- Restringe un premio a los boosters o a un rol de apoyo exigiendo esos roles.
- Evita que cuentas secundarias y bots inflen las participaciones usando la participación con captcha.

## Métodos de participación

Cada sorteo usa exactamente uno de estos. El asistente interactivo de `gstart` pregunta cuál, el comando de barra tiene las opciones `use_button` y `use_captcha`, y el panel tiene una opción **Método de participación**.

| Método | Cómo participan los miembros | Notas |
| --- | --- | --- |
| Reacción | Reaccionar con el emote de sorteos del servidor | El predeterminado. El bot lee la lista de reacciones cuando termina el sorteo, hasta 1000 usuarios. |
| Botón | Pulsar el botón **Participar** bajo el embed | El bot guarda las participaciones. Se rechaza participar dos veces, después de que haya terminado o sin estar en el servidor. |
| Captcha | Pulsar **Participar (captcha web)**, iniciar sesión en el panel y superar una comprobación de Cloudflare Turnstile | Mismo almacenamiento que la participación por botón. La participación se acredita a la cuenta de Discord con la sesión iniciada. |

El emote de sorteos se establece por servidor con `gemote`. El bot lo valida reaccionando con él, así que un emote personalizado de otro servidor solo funciona si el bot también está en ese servidor. Los sorteos por reacción también necesitan los permisos Añadir reacciones y Usar emojis externos del bot, y `gstart` se niega a empezar sin ellos.

## Requisitos

| Requisito | Se establece con | Efecto en el momento del sorteo |
| --- | --- | --- |
| Roles requeridos | Asistente, `required_roles` de barra, **Roles requeridos** del panel | El miembro debe tener todos los roles listados |
| Número de mensajes | Asistente, `required_messages` de barra, **Número de mensajes requerido** del panel | Los mensajes contados del miembro en este servidor deben ser al menos este número. Usa el servicio de conteo de mensajes, así que solo conoce los mensajes contados desde que se activó. |

Los bots siempre se excluyen, y también cualquiera que haya abandonado el servidor. Los requisitos se listan en el embed del sorteo como una línea **Roles requeridos** y una línea "N Messages Required".

## El mensaje del sorteo

El título del embed es el premio. La descripción dice "React with (emote) to enter!", nombra al anfitrión y muestra la hora de finalización como marca de tiempo de Discord relativa y absoluta. El pie muestra el número de ganadores, el nombre del servidor y la fecha de finalización. El contenido del mensaje es la mención del rol de aviso si hay uno configurado.

Ajustes de aspecto de todo el servidor:

| Ajuste | Comando | Efecto |
| --- | --- | --- |
| Color del embed | `gembedcolor` | Color del embed del sorteo, como nombre de color o `#hex` |
| Banner | `gbanner` | Imagen que se muestra en todos los sorteos. El asistente y el comando de barra pueden sustituirla por sorteo con una URL o un archivo adjunto. |
| Rol de aviso | ninguno, solo la sustitución del asistente | El asistente ofrece mencionar a un rol; si hay un rol de aviso del servidor guardado, pregunta si quieres sustituirlo |
| MD a los ganadores | `gdm` | Si los ganadores reciben un MD. Activado por defecto. |

### Cuando termina

Si hay suficientes participantes válidos, el bot edita el embed a "Winner: @user" con el anfitrión, cambia el pie a "Ended at (time)", cambia el contenido a "**Giveaway Ended!**" y publica un mensaje de felicitación aparte con un enlace al sorteo y el comando para repetirlo. Si nadie participó, o participaron menos personas válidas que ganadores, el embed se sustituye por "There were not enough participants!" y el sorteo se marca como terminado. Si hubo participantes pero ninguno cumplía los requisitos, lo indica.

Un sorteo de un solo ganador también dispara el evento `GiveawayWon` para los chat triggers, de modo que un trigger pueda reaccionar a una victoria.

### MD al ganador

Con **MD a los ganadores** activado, cada ganador recibe un MD. El predeterminado es un embed que dice que ha ganado, con un enlace al mensaje del sorteo. Si hay un mensaje final personalizado guardado, se envía ese en su lugar y puede usar estos marcadores además de los generales de servidor, usuario y canal.

| Marcador | Valor |
| --- | --- |
| `%messagelink%` | Enlace al mensaje del sorteo |
| `%giveawayitem%` | El premio |
| `%giveawaywinners%` | El número de ganadores |

`gdmmessage` sin texto ofrece una vista previa del mensaje guardado con valores de ejemplo, y rechazar la vista previa lo borra. Ejecutarlo con texto también borra el mensaje guardado en lugar de guardarlo.

## Ajustes

La página de **Sorteos** del panel tiene tres pestañas: **Sorteos activos**, **Crear sorteo** y **Sorteos terminados**. Los ajustes de todo el servidor de arriba (emote, color, banner, interruptor de MD) solo se establecen por comando.

El formulario **Crear sorteo**:

| Ajuste | Predeterminado | Qué controla |
| --- | --- | --- |
| Premio del sorteo | vacío | El premio, mostrado como título del embed |
| Número de ganadores | 1 | Cuántos ganadores se eligen; debe ser al menos 1 |
| Canal | ninguno | Dónde se publica el embed |
| Duración | 24 horas | Cuándo termina el sorteo |
| Roles requeridos | ninguno | Roles que un miembro debe tener para ganar |
| Número de mensajes requerido | 0 | Mínimo de mensajes contados |
| Emoji de reacción | el cañón de confeti | Emote para participar por reacción; sirve un emote personalizado o un código de emote pegado |
| Método de participación | Reacción | Reacción, Botón o Captcha |

**Sorteos activos** lista cada sorteo con su hora de finalización. Al expandir uno se muestran los ganadores, el canal, los roles requeridos, el requisito de mensajes y el método de participación, además de un botón **Terminar sorteo**. Los nuevos sorteos entre participantes (reroll) solo se hacen por comando.

## Guía de configuración

1. Ejecuta `gemote` con el emote con el que quieres que reaccionen los miembros, por ejemplo `gemote :tada:`.
2. Opcionalmente establece `gembedcolor` y `gbanner` para que los sorteos combinen con el aspecto de tu servidor.
3. Abre **Sorteos** en el panel y luego **Crear sorteo**.
4. Rellena **Premio del sorteo**, **Número de ganadores**, **Canal** y **Duración**.
5. Añade **Roles requeridos** o un **Número de mensajes requerido** si el premio debe ir a miembros veteranos.
6. Elige un **Método de participación** y pulsa **Crear sorteo**.
7. Cuando termine, revisa el canal. Si ganó la persona equivocada o no responde, ejecuta `greroll <message id>`.

## Comandos

Ejecútalos con el prefijo de tu servidor (`.` salvo que lo hayas cambiado). Los mismos comandos existen como comandos de barra bajo `/giveaways`.

| Comando | Alias | Requiere | Para qué sirve |
| --- | --- | --- | --- |
| `gstart [#channel <time> <winners> <prize>]` | `giveawaystart` | Gestionar mensajes | Inicia un sorteo. Sin argumentos ejecuta un asistente que también pregunta por el anfitrión, el requisito de mensajes, el banner, el rol de aviso, el método de participación y los roles requeridos. El tiempo se escribe como `2d3h`. |
| `gend <message id>` | `giveawayend` | Gestionar mensajes | Termina un sorteo ahora y elige a los ganadores |
| `greroll <message id>` | `giveawayreroll`, `reroll` | Gestionar mensajes | Vuelve a elegir entre los participantes de un sorteo terminado |
| `glist` | `giveaways`, `giveawaylist` | Gestionar mensajes | Lista los sorteos activos con ID de mensaje, premios, número de ganadores y enlaces |
| `gstats` | `giveawaystats` | Nadie | Totales de sorteos activos y terminados, anfitriones y recuentos por canal |
| `gemote <emote>` | `giveawayemote` | Gestionar mensajes | Establece el emote de participación por reacción |
| `gembedcolor <colour>` | `giveawayembedcolor` | Gestionar mensajes | Establece el color del embed del sorteo |
| `gwinembedcolor <colour>` | `giveawaywinembedcolor` | Gestionar mensajes | Establece el mismo valor de color que `gembedcolor` |
| `gbanner <url>` | `giveawaybanner` | Gestionar mensajes | Establece la imagen de banner predeterminada |
| `gdm` | `giveawaydm` | Gestionar mensajes | Activa o desactiva los MD a los ganadores |
| `gdmmessage [text]` | `gdmmsg` | Gestionar mensajes | Muestra una vista previa o borra el MD personalizado al ganador |

## Consejos y trampas habituales

- El ID de mensaje de `gend` y `greroll` es el ID del embed del sorteo. Cópialo con el Modo desarrollador, o léelo en `glist`.
- El reroll vuelve a elegir entre los participantes con los mismos requisitos, así que el ganador anterior puede volver a ganar.
- Tras un reinicio, el bot programa de inmediato los sorteos que terminan en las próximas 24 horas; los que terminan más tarde los recoge una comprobación cada hora, así que un sorteo con una duración larga termina igualmente a tiempo.
- Si el bot no puede leer las reacciones de un sorteo por reacción, recurre al emote actual del servidor, pero si el emote se cambió por uno con el que nadie reaccionó, el sorteo no encuentra participantes.
- La lista **Sorteos activos** del panel también muestra los sorteos terminados, y la pestaña **Sorteos terminados** está vacía actualmente. Usa la hora de finalización y la ausencia del botón **Terminar sorteo** para distinguirlos.
- La participación con captcha necesita que el panel sea accesible y que el miembro inicie sesión con Discord; la participación queda vinculada a esa cuenta, no a nada escrito en la página.
- Los MD a los ganadores fallan sin avisar si el ganador tiene los MD cerrados. El anuncio en el canal se publica igualmente.
