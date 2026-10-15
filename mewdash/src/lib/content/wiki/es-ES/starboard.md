---
title: Starboard
slug: starboard
summary: Deja que los miembros voten los mejores mensajes con una reacción y vuelve a publicar todo lo que alcance el umbral en un canal de destacados dedicado.
icon: fa-star
category: Community
dashboard: /dashboard/starboard
module: Starboard
tags: [starboard, stars, highlights, best of, reactions, pins, repost, threshold, estrellas, destacados, lo mejor, reacciones, republicar, umbral]
related: [settings, logging]
---

## Qué hace

Un starboard es un canal donde el bot vuelve a publicar los mensajes a los que suficientes personas han reaccionado con un emote elegido. Los miembros reaccionan a algo divertido o útil; cuando el número de reacciones alcanza el umbral, el bot copia el mensaje en el canal del starboard con el nombre del autor, el texto, las imágenes o vídeos, el recuento actual de reacciones y un botón **Jump to Message**.

La publicación se sigue actualizando a medida que llegan y se quitan reacciones. Si las reacciones bajan del umbral, la publicación puede eliminarse. Si se elimina el mensaje original o se borran sus reacciones, la publicación también puede eliminarse.

Un servidor puede tener varios starboards a la vez, cada uno con su propio canal, su propio emote o conjunto de emotes, su propio umbral y sus propias reglas. Un tablero de «mejores memes» que vigila un emote y un tablero de «respuestas útiles» que vigila otro pueden funcionar en paralelo.

## Por qué usarlo

- Dar a la comunidad una forma de sacar a la luz el mejor contenido sin que el personal lo seleccione.
- Mantener un canal de destacados de larga duración por el que los nuevos miembros puedan desplazarse.
- Tener tableros separados para humor, arte o respuestas útiles, cada uno con emotes distintos.
- Limitar qué canales alimentan el tablero, para dejar fuera el spam de bots y los canales fuera de tema.

## Varios starboards y emotes

Cada starboard se identifica con un ID numérico que muestra `liststarboards` y la lista del panel. Los comandos reciben ese ID como primer argumento.

Un starboard empieza con un emote y se le pueden añadir más. Cualquiera de sus emotes cuenta para el mismo total, y la publicación muestra un recuento aparte por emote. Un emote solo puede pertenecer a un starboard del servidor; intentar reutilizarlo falla con «emote already in use». Un starboard debe conservar al menos un emote, así que el último no se puede quitar.

Los emotes personalizados funcionan igual que los Unicode. El bot prueba el emote reaccionando al mensaje de tu comando, así que debe ser uno que el bot pueda usar.

## Umbrales y recuento

El **umbral de estrellas** es cuántas reacciones necesita un mensaje antes de publicarse. El valor por defecto del comando es 1; el panel exige al menos 1.

Al contar, el bot:

- Ignora las reacciones de cuentas de bots.
- Suma las reacciones de todos los emotes que pertenecen a ese starboard.
- Cuenta la reacción del propio autor. No hay exclusión de autoestrellas.
- Solo actúa con mensajes que tengan texto o un archivo adjunto. Un mensaje sin ninguno de los dos se omite.

Si el total está por debajo del umbral y ya existe una publicación, la publicación se elimina cuando **Quitar bajo el umbral** está activado. En caso contrario, la publicación se deja como estaba.

## Mensajes de bots

Por defecto, los mensajes escritos por bots nunca se publican. Activa **Permitir mensajes de bots** para incluirlos. En un mensaje de bot, el texto se toma de la descripción del primer embed si tiene embeds y, si no, del contenido sin formato, y la imagen procede del primer archivo adjunto o de la primera imagen del embed. Cuando se permiten los mensajes de bots, las reacciones de bots también se cuentan en los números por emote que se muestran en la publicación.

## Umbral de republicación

Normalmente, el bot edita la publicación existente del starboard en el mismo sitio cada vez que cambia el recuento. Cuando un tablero tiene mucha actividad, esa publicación puede quedar muy arriba en el canal, donde nadie ve el recuento actualizado.

El **umbral de republicación** lo soluciona. Defínelo en un número N y, en cada actualización, el bot mira los últimos N mensajes del canal del starboard. Si la publicación existente está entre ellos, se edita. Si se ha desplazado más atrás, se elimina la publicación antigua y se envía una nueva al final. Defínelo en 0 para desactivar la republicación y editar siempre en el mismo sitio.

## Filtrado de canales

Cada starboard tiene una lista de canales y un modo:

| Modo | Efecto |
| --- | --- |
| Whitelist (por defecto) | Solo se tienen en cuenta los mensajes de los canales de la lista. Una lista vacía significa todos los canales. |
| Blacklist | Se ignoran los mensajes de los canales de la lista. Todo lo demás se tiene en cuenta. |

`starboardchtoggle <id> #channel` añade o quita un canal de la lista. La acción **Gestionar canales** del panel hace lo mismo.

## La publicación del starboard

La publicación se construye con componentes en lugar de un embed clásico:

- Una línea sobre el contenedor con cada emote y su recuento.
- El nombre del autor, enlazado a su perfil.
- El texto del mensaje.
- Una galería multimedia de archivos adjuntos de imagen y vídeo.
- Hasta tres archivos adjuntos más, vueltos a subir al canal del starboard. Si falla una descarga, se muestran en su lugar el nombre y el tamaño del archivo.
- Un botón de enlace **Jump to Message**.

Las menciones del texto republicado se suprimen, así que un mensaje destacado no puede mencionar a nadie por segunda vez.

## Reglas de eliminación

| Regla | Por defecto | Cuándo se activa |
| --- | --- | --- |
| Quitar al borrar el original | Activada | Se elimina el mensaje original. Requiere que el bot tenga Gestionar mensajes en el canal de origen. |
| Quitar al borrar reacciones | Activada | Un moderador borra todas las reacciones del original. |
| Quitar bajo el umbral | Activada | El total baja del umbral después de quitar una reacción. |

## Estadísticas

`starboardstats` muestra totales del servidor: número de mensajes destacados, total de estrellas, el miembro con más estrellas, el canal más activo y quien más estrellas da. `starboarduserstats [@user]` muestra el número de mensajes destacados de un miembro, las estrellas recibidas, las estrellas dadas, sus mejores publicaciones, quién le da más estrellas y a quién da más estrellas. Ambos están abiertos a todos.

## Ajustes

La página de Starboard tiene dos secciones: **Crear nuevo starboard** y **Gestionar starboards**. Cada entrada de la lista muestra su canal, emote, umbral y umbral de republicación, con botones de **Ajustes del starboard**, **Gestionar canales** y **Eliminar**.

Dentro de **Ajustes del starboard**:

| Ajuste | Por defecto | Qué controla |
| --- | --- | --- |
| Umbral de estrellas | se define al crearlo | Reacciones necesarias antes de publicar un mensaje |
| Umbral de republicación | 0 (desactivado) | Cuántos mensajes recientes se revisan antes de republicar al final |
| Emotes de estrella | el emote de creación | Añade o quita emotes que cuentan para este tablero |
| Permitir mensajes de bots | Desactivado | Incluye mensajes escritos por bots |
| Quitar al borrar el original | Activado | Quita la publicación cuando se elimina el original |
| Quitar al borrar reacciones | Activado | Quita la publicación cuando se borran las reacciones |
| Quitar bajo el umbral | Activado | Quita la publicación cuando el recuento baja del umbral |
| Modo de canales | Lista blanca | Si la lista de canales es una lista blanca o una lista negra |

> [!TIP]
> Empieza con un umbral de 3 a 5 en un servidor activo. Un umbral de 1 convierte cada reacción suelta en una publicación.

## Guía de configuración

1. Crea un canal para los destacados y comprueba que el bot puede enviar mensajes, insertar enlaces y adjuntar archivos allí.
2. Abre **Starboard** en el panel.
3. En **Crear nuevo starboard**, elige el canal, selecciona un emote de las opciones rápidas o escribe uno personalizado, define el **Umbral (reacciones necesarias)** y pulsa **Crear starboard**.
4. Abre **Ajustes del starboard** en la entrada nueva. Añade los emotes adicionales en **Emotes de estrella** y define un **Umbral de republicación**, como 20, si el tablero va a tener mucha actividad.
5. Usa **Gestionar canales** para poner en la lista blanca los canales que deban alimentar el tablero, o cambia el **Modo de canales** a lista negra y enumera los que quieras excluir.
6. Reacciona a un mensaje de prueba con el emote las veces suficientes para alcanzar el umbral y comprueba que aparece la publicación.

## Comandos

Ejecútalos con el prefijo de tu servidor (`.` salvo que lo hayas cambiado). `<id>` es el ID del starboard de `liststarboards`.

| Comando | Alias | Requiere | Propósito |
| --- | --- | --- | --- |
| `createstarboard #channel <emote> [threshold]` | `addstarboard`, `newstarboard` | Gestionar canales | Crea un starboard; el umbral por defecto es 1 |
| `deletestarboard <id>` | `removestarboard`, `delstarboard` | Gestionar canales | Elimina la configuración de un starboard |
| `liststarboards` | `starboardlist`, `starboards` | Nadie | Pagina todos los starboards y sus ajustes |
| `setstarthreshold <id> <number>` | `starthreshold` | Gestionar canales | Define las reacciones necesarias |
| `setrepostthreshold <id> <number>` | `starboardrepost`, `repostthreshold` | Gestionar canales | Define la ventana de republicación, 0 la desactiva |
| `addstarboardemote <id> <emote>` | `addstaremote`, `starboardaddemote`, `asbe` | Gestionar canales | Añade un emote a un starboard |
| `removestarboardemote <id> <emote>` | `removestaremote`, `starboardremoveemote`, `rsbe` | Gestionar canales | Quita un emote; no se puede quitar el último |
| `starboardallowbots <id> <true or false>` | `starbots`, `starbotsallow`, `starbab` | Gestionar canales | Permite mensajes escritos por bots |
| `starboardremoveondelete <id> <true or false>` | `starboarddelete`, `stardelete`, `srod` | Gestionar canales | Quita la publicación cuando se elimina el original |
| `starboardremoveonreactionsclear <id> <true or false>` | `starboardreactionclear`, `starclear` | Gestionar canales | Quita la publicación cuando se borran las reacciones |
| `starboardremoveonbelowthreshold <id> <true or false>` | `starboardbelowthreshold`, `starbelow`, `srobt` | Gestionar canales | Quita la publicación cuando baja del umbral |
| `starboardwlmode <id> <whitelist or blacklist>` | `starboardmode`, `starboardwhitelist`, `swm` | Gestionar canales | Define cómo se trata la lista de canales |
| `starboardchtoggle <id> #channel` | `starboardchannel`, `togglestarboardchannel`, `scht` | Gestionar canales | Añade o quita un canal de la lista |
| `starboardstats` | `starstats`, `starboardstatistics`, `sbstats` | Nadie | Estadísticas del starboard de todo el servidor |
| `starboarduserstats [@user]` | `staruserstats`, `userstarstats`, `sbuserstats` | Nadie | Estadísticas de un miembro |

Los equivalentes de barra están en `/starboard`.

## Consejos y advertencias

- El bot no hace nada, sin avisar, si no puede enviar mensajes en el canal del starboard. Revisa primero los permisos del canal.
- Quitar al borrar el original solo funciona cuando el bot tiene Gestionar mensajes en el canal donde estaba el mensaje original.
- Las reacciones de bots nunca cuentan para el umbral, así que otro bot que reaccione automáticamente no puede llevar mensajes al tablero.
- Eliminar un starboard solo elimina su configuración. Las publicaciones existentes en el canal se quedan.
- El mismo emote no se puede compartir entre dos tableros. Elige emotes distintos para cada uno.
- Los archivos adjuntos muy grandes pueden fallar al volver a subirse; entonces la publicación muestra el nombre del archivo.
