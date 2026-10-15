---
title: Sugerencias
slug: suggestions
summary: Da a los miembros un canal o un botón para enviar ideas, deja que el servidor vote por ellas y haz que el personal acepte, deniegue, considere o implemente cada una con un motivo.
icon: fa-lightbulb
category: Community
dashboard: /dashboard/suggestions
module: Suggestions
tags: [suggestions, ideas, feedback, voting, accept, deny, consider, implement, threads, suggest button, placeholders, sugerencias, comentarios, votación, aceptar, denegar, considerar, implementar, hilos, botón de sugerir, marcadores]
related: [administration, afk]
---

## Qué hace

Un miembro ejecuta `suggest` con su idea, la escribe directamente en el canal de sugerencias o pulsa un botón **Suggest Here!** y rellena un formulario. El bot elimina el mensaje original, publica un embed de sugerencia numerado en el canal de sugerencias y adjunta emotes de voto como reacciones o botones. Cada sugerencia recibe un número que el personal usa para referirse a ella más adelante.

Después, el personal lleva la sugerencia por cuatro estados: aceptar, denegar, considerar o implementar, cada uno con un motivo opcional. El bot edita el mensaje original de la sugerencia para convertirlo en un embed de estado de color, envía un MD al miembro que la sugirió con el resultado y puede volver a publicar el embed de estado en un canal distinto por cada estado, de modo que las ideas aceptadas estén en un sitio y las denegadas en otro.

Opcionalmente, cada sugerencia lleva un botón **Join/Create Discussion** que abre un hilo público o privado debajo de ella. Cuando el personal cambia el estado, el hilo puede archivarse automáticamente.

## Por qué usarlo

- Canales de comentarios donde las ideas se pierden entre las respuestas; cada sugerencia pasa a ser su propio mensaje con un recuento de votos.
- Comunidades que quieren que los miembros vean qué se aceptó y qué se rechazó, y por qué, sin que el personal tenga que escribir anuncios.
- Servidores que quieren una discusión por idea en lugar de discusiones en el canal principal, usando hilos.
- Personal que quiere clasificar desde el panel con un cuadro de motivo en lugar de recordar números de sugerencia.

## Cómo se envía una sugerencia

Hay tres formas de entrar, y todas pasan por las mismas comprobaciones de longitud y acaban en el canal de sugerencias.

| Método | Qué ocurre |
| --- | --- |
| `suggest <text>` | Se elimina el mensaje del comando y se publica la sugerencia. Funciona desde cualquier canal. |
| Escribir en el canal de sugerencias | Cualquier mensaje que no sea de un bot y no empiece con el prefijo se convierte en sugerencia y se elimina el original. Se omite a los miembros con el rol de personal del servidor, para que el personal pueda hablar con normalidad en el canal. |
| El botón de sugerir | Un mensaje con un botón en el **Canal del botón de sugerencia**. Al pulsarlo se abre un formulario cuyos límites de longitud coinciden con tus ajustes. |

Si el texto es más largo que la **Longitud máxima** o más corto que la **Longitud mínima**, se rechaza. Con el comando, el error se muestra en el canal y se elimina a los cinco segundos; en el canal de sugerencias, se elimina el mensaje y se envía un MD al miembro. Las menciones dentro de la sugerencia se neutralizan en el embed publicado, y se avisa al miembro de que la sugerencia se envió.

El embed de sugerencia por defecto usa al miembro como autor, el título «Suggestion #N» y el texto como descripción. Puedes sustituirlo por tu propio embed (consulta los marcadores más abajo).

### El botón de sugerir

El mensaje del botón se publica en el **Canal del botón de sugerencia** y el bot lo mantiene al final: cuando otros mensajes lo empujan hacia arriba, el bot lo elimina y lo vuelve a publicar. La etiqueta por defecto es **Suggest Here!**, sin emote y de color blurple. El mensaje sobre el botón puede ser texto sin formato o código de embed, y por defecto es una breve invitación a hacer una sugerencia.

## Votación

Por defecto, cada sugerencia recibe un pulgar arriba y un pulgar abajo. En su lugar, puedes definir hasta cinco emotes personalizados con `suggestmotes` o el selector de **Emotes personalizados**; el bot debe poder usarlos.

El **Modo de visualización de emotes** decide cómo se emiten los votos.

| Modo | Comportamiento |
| --- | --- |
| Reactions (por defecto) | El bot añade los emotes como reacciones. Los recuentos se siguen a partir de las reacciones añadidas y quitadas. |
| Buttons | Los emotes se convierten en botones que muestran un recuento en vivo. Un miembro puede tener un voto por sugerencia: pulsar de nuevo el mismo botón pide quitarlo, y pulsar uno distinto pide cambiarlo. |

En el modo de botones, cada uno de los cinco botones de emote tiene su propio color (**Botón del emote 1** a **Botón del emote 5**). Los colores son Azul, Gris, Verde y Rojo. Cambiar un color también actualiza el mensaje del botón de sugerir.

`suggestinfo <number>` muestra el texto, quién la sugirió, el estado actual, quién lo cambió por última vez, cuántas veces cambió el estado y el recuento por emote, con botones de Aceptar, Denegar, Considerar e Implementar debajo.

## Estados

Toda sugerencia empieza como Suggested (se muestra como Pendiente en el panel). El personal con Gestionar mensajes puede pasarla a uno de cuatro estados con `accept`, `deny`, `consider` o `implemented`, desde los botones de `suggestinfo` o desde el panel. Cada cambio de estado con un motivo muestra el motivo; sin él, el campo dice «none».

| Estado | Color del embed | Opciones adicionales |
| --- | --- | --- |
| Aceptada | Azul | Canal de aceptadas, mensaje de aceptación, archivar al aceptar |
| Denegada | Rojo | Canal de denegadas, mensaje de denegación, archivar al denegar |
| Considerada | Dorado | Canal de consideradas, mensaje de consideración, archivar al considerar |
| Implementada | Verde | Canal de implementadas, mensaje de implementación, archivar al implementar |

Cuando cambia un estado, el bot hace lo siguiente, en este orden:

1. Archiva el hilo de discusión si el interruptor de archivado de ese estado está activado.
2. Edita el mensaje original en el canal de sugerencias para convertirlo en el embed de estado y quita todas las reacciones. Si el mensaje original ya no existe, publica uno nuevo.
3. Envía por MD al autor de la sugerencia un embed con la sugerencia, el motivo y quién la cambió. La confirmación para el personal indica si el MD llegó o si el miembro tenía los MD desactivados.
4. Registra el nuevo estado y quién lo cambió.
5. Si hay un canal definido para ese estado, publica allí el embed de estado y elimina el mensaje de estado anterior de esa sugerencia, para que una sugerencia que pasa de Considerada a Aceptada no deje una copia obsoleta.

Una sugerencia puede cambiar de estado tantas veces como quieras. No hay ningún comando para devolverla a Pendiente.

### El mensaje de estado

El embed de estado por defecto tiene al autor de la sugerencia como autor, un título como «Suggestion #12 Accepted», el texto de la sugerencia como descripción y un campo **Motivo**. Define el tuyo con `acceptmessage`, `denymessage`, `considermessage` o `implementmessage`, o con los cuatro editores de la pestaña **Mensajes** del panel. Usa `-` para volver al predeterminado. El texto personalizado pasa por el analizador de embeds; si no es código de embed válido, se usa como descripción del embed.

## Marcadores

El mensaje de sugerencia (publicado al enviarla) admite estos, además de los marcadores generales del servidor de la página de marcadores.

| Marcador | Valor |
| --- | --- |
| `%suggest.user%` | Nombre de usuario completo de quien sugiere |
| `%suggest.user.name%` | El nombre de usuario de quien sugiere |
| `%suggest.user.avatar%` | La URL del avatar de quien sugiere |
| `%suggest.message%` | El texto de la sugerencia, con las menciones neutralizadas |
| `%suggest.number%` | El número de la sugerencia |

Los mensajes de aceptación, denegación, consideración e implementación admiten todo lo anterior, los marcadores generales del servidor y estos adicionales.

| Marcador | Valor |
| --- | --- |
| `%suggest.user.id%` | El ID de usuario de quien sugiere |
| `%suggest.mod.user%` | Nombre de usuario completo del miembro del personal que cambió el estado |
| `%suggest.mod.name%` | Nombre de usuario de ese miembro del personal |
| `%suggest.mod.avatar%` | La URL de su avatar |
| `%suggest.mod.Id%` | Su ID de usuario (fíjate en la I mayúscula) |
| `%suggest.mod.message%` | El motivo indicado, o «none» |
| `%suggest.emote1count%` a `%suggest.emote5count%` | Recuento de votos de cada emote en el momento del cambio |

> [!EXAMPLE]
> Un mensaje de denegación sencillo: `Suggestion #%suggest.number% by %suggest.user% was denied by %suggest.mod.name%: %suggest.mod.message%`

## Hilos

El **Tipo de hilo** añade una segunda fila de botones a cada sugerencia nueva.

| Tipo | Botón | Resultado |
| --- | --- | --- |
| Sin hilos (por defecto) | ninguno | Sin botón de discusión |
| Hilos normales | Join/Create Public Discussion | Crea un hilo público llamado «Suggestion #N Discussion» en el mensaje de la sugerencia |
| Hilos privados | Join/Create Private Discussion | Lo mismo, como hilo privado |

La primera pulsación crea el hilo y añade tanto a quien sugirió como a quien pulsó. Las pulsaciones posteriores responden que ya existe un hilo y enlazan a él. Se registra un hilo por sugerencia, y los cuatro interruptores **Archivar al...** lo archivan cuando se establece el estado correspondiente. Cambiar el tipo de hilo solo afecta a las sugerencias publicadas después.

## Ajustes

La página del panel tiene dos pestañas, **Sugerencias** y **Ajustes**. La pestaña Ajustes se divide en **General**, **Mensajes**, **Canales**, **Archivo** y **Emotes**.

| Ajuste | Por defecto | Qué controla |
| --- | --- | --- |
| Longitud mínima | sin definir | Sugerencia más corta aceptada, en caracteres (no puede ser 2048 o más; el campo del panel se detiene en 2000) |
| Longitud máxima | sin definir | Sugerencia más larga aceptada (debe ser mayor que 0; el campo del panel se detiene en 2000) |
| Tipo de hilo | Sin hilos | Si las sugerencias reciben un botón de discusión público o privado |
| Mensaje de sugerencia | embed predeterminado | El embed publicado al enviar una sugerencia |
| Mensaje de aceptación / denegación / consideración / implementación | embed predeterminado | El embed de estado de cada estado |
| Canal de sugerencias | ninguno (función desactivada) | Dónde se publican las sugerencias y dónde los mensajes escritos se convierten en sugerencias |
| Canal de aceptadas / denegadas / consideradas / implementadas | ninguno | Canal adicional al que se copia cada embed de estado |
| Archivar al aceptar / denegar / considerar / implementar | desactivado | Archiva el hilo de discusión con ese estado |
| Modo de visualización de emotes | Reactions | Reacciones o botones para votar |
| Emotes personalizados | pulgar arriba y abajo | Hasta cinco emotes usados para votar |
| Etiqueta del botón | Suggest Here! | Texto del botón de sugerir |
| Emote del botón | ninguno | Emote del botón de sugerir |
| Mensaje del botón | invitación predeterminada | Texto o embed publicado sobre el botón de sugerir |
| Color del botón de sugerir | Blurple | Color del botón de sugerir |
| Botón del emote 1 a 5 | Blurple | Color de cada botón de voto en el modo de botones |

> [!WARNING]
> Nada funciona hasta que se define el **Canal de sugerencias**. Hasta entonces, `suggest` responde que no hay canal definido y elimina el error a los tres segundos.

La pestaña **Sugerencias** enumera todas las sugerencias con su estado, recuento de votos y fecha, ordenables por fecha o estado. Cada tarjeta tiene botones **Aceptar**, **Denegar**, **Considerar** e **Implementar** con un cuadro de motivo opcional, y un botón **Eliminar** que borra el registro de la base de datos sin tocar el mensaje de Discord.

## Guía de configuración

1. Abre **Sugerencias** en el panel y cambia a la pestaña **Ajustes**.
2. En **Canales**, elige un **Canal de sugerencias**. Opcionalmente, elige canales distintos para las sugerencias aceptadas, denegadas, consideradas e implementadas.
3. En **General**, define la **Longitud mínima** y la **Longitud máxima**, por ejemplo 10 y 1000, y elige un **Tipo de hilo** si quieres una discusión por idea.
4. En **Emotes**, elige **Reacciones** o **Botones** y, opcionalmente, hasta cinco **Emotes personalizados**. Si quieres un botón de sugerir, define aquí su etiqueta, su emote y su mensaje, y ejecuta `suggestbuttonchannel #channel` en Discord para publicarlo.
5. En **Archivo**, activa los interruptores de archivado de los estados que deban cerrar la discusión.
6. En **Mensajes**, personaliza los embeds de estado si quieres, usando los marcadores anteriores.
7. Guarda y prueba: ejecuta `suggest test idea`, vota por ella y ejecuta `accept 1 looks good` para ver el embed de estado y el MD.

## Comandos

Ejecútalos con el prefijo de tu servidor (`.` salvo que lo hayas cambiado).

| Comando | Alias | Requiere | Propósito |
| --- | --- | --- | --- |
| `suggest <text>` | `suggestion` | Nadie | Envía una sugerencia |
| `suggestinfo <number>` | `suginfo` | Gestionar mensajes | Muestra los detalles, el recuento de votos y los botones de estado de una sugerencia |
| `accept <number> [reason]` | `suggestaccept`, `acceptsuggest` | Gestionar mensajes | Marca una sugerencia como aceptada |
| `deny <number> [reason]` | `suggestdeny`, `denysuggest` | Gestionar mensajes | Marca una sugerencia como denegada |
| `consider <number> [reason]` | `suggestconsider`, `considersuggest` | Gestionar mensajes | Marca una sugerencia como en consideración |
| `implemented <number> [reason]` | `suggestimplement`, `implementsuggest` | Gestionar mensajes | Marca una sugerencia como implementada |
| `setsuggestchannel [#channel]` | `suggestchannel`, `suggestchan` | Gestionar canales | Define el canal de sugerencias, o desactiva las sugerencias si no se indica canal |
| `suggestclear` | `suggestreset`, `resetsuggestions`, `clearsuggestions` | Administrador | Elimina todas las sugerencias y reinicia el contador, tras confirmación |
| `suggestmessage <text>` | `suggestmsg` | Administrador | Embed de sugerencia personalizado, `-` para restablecerlo |
| `acceptmessage <text>` | `acceptmsg` | Administrador | Embed de aceptación personalizado, `-` para restablecerlo |
| `denymessage <text>` | `denymsg` | Administrador | Embed de denegación personalizado, `-` para restablecerlo |
| `considermessage <text>` | `considermsg` | Administrador | Embed de consideración personalizado, `-` para restablecerlo |
| `implementmessage <text>` | `implementmsg` | Administrador | Embed de implementación personalizado, `-` para restablecerlo |
| `acceptchannel [#channel]` | | Administrador | Canal de las sugerencias aceptadas, ninguno para desactivarlo |
| `denychannel [#channel]` | | Administrador | Canal de las sugerencias denegadas, ninguno para desactivarlo |
| `considerchannel [#channel]` | | Administrador | Canal de las sugerencias consideradas, ninguno para desactivarlo |
| `implementchannel [#channel]` | | Administrador | Canal de las sugerencias implementadas, ninguno para desactivarlo |
| `minsuggestionlength <number>` | `minsuggestlength` | Administrador | Mínimo de caracteres, debe ser menor que 2048 |
| `maxsuggestionlength <number>` | `maxsuggestlength` | Administrador | Máximo de caracteres, debe ser mayor que 0 |
| `suggestmotes <emotes>` | `smotes`, `suggestemotes` | Administrador | Hasta cinco emotes de voto, o `disable` para pulgar arriba y abajo |
| `suggestmotesmode <reactions/buttons>` | | Administrador | Reacciones o botones para votar |
| `suggestmotecolor <number> <colour>` | | Administrador | Color del botón de voto 1 a 5: `blurple`, `grey`, `green` o `red` |
| `suggestthreadstype <none/public/private>` | `suggestthreads` | Administrador | Tipo de hilo de discusión para las sugerencias nuevas |
| `archiveonaccept` | | Administrador | Activa o desactiva el archivado del hilo al aceptar |
| `archiveondeny` | | Administrador | Activa o desactiva el archivado del hilo al denegar |
| `archiveonconsider` | | Administrador | Activa o desactiva el archivado del hilo al considerar |
| `archiveonimplement` | | Administrador | Activa o desactiva el archivado del hilo al implementar |
| `suggestbuttonchannel <#channel>` | | Administrador | Publica el botón de sugerir en un canal |
| `suggestbuttonmessage <text>` | | Administrador | Texto o embed sobre el botón de sugerir, `-` para restablecerlo |
| `suggestbuttonlabel <text>` | | Administrador | Etiqueta del botón de hasta 80 caracteres, `-` para restablecerla |
| `suggestbuttonemote [emote]` | | Administrador | Emote del botón, ninguno para restablecerlo |
| `suggestbuttoncolor <colour>` | | Administrador | Color del botón de sugerir: `blurple`, `grey`, `green` o `red` |

Los equivalentes de barra están en `/suggestions` y `/suggestions customize`.

## Consejos y advertencias

- El bot necesita Gestionar mensajes en el canal de sugerencias para eliminar los originales, Añadir reacciones para el modo de reacciones y Crear hilos públicos o privados para las discusiones. Los canales de estado necesitan Insertar enlaces o la copia se omite en silencio.
- Define ambos límites de longitud antes de abrir el canal. La vía de mensajes escritos elimina todo lo que quede fuera de los límites, así que un máximo sin definir puede borrar todos los mensajes.
- Los miembros con el rol de personal definido en Administración pueden hablar en el canal de sugerencias sin que sus mensajes se conviertan en sugerencias. Los mensajes de todos los demás se convierten y se eliminan.
- El comando `suggest` respeta el sistema de permisos, así que puedes bloquearlo en canales o para roles con los comandos de permisos habituales, y la vía de mensajes escritos respeta la misma regla.
- Los emotes personalizados deben ser emotes que el bot pueda usar. El comando prueba cada emote reaccionando con él y rechaza el conjunto si alguno falla.
- **Eliminar** en el panel solo borra el registro de la base de datos. El mensaje de Discord y cualquier hilo se quedan donde están.
- `suggestclear` no se puede deshacer y reinicia la numeración en 1.
