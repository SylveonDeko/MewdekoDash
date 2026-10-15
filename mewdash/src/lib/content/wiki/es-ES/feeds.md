---
title: Feeds
slug: feeds
summary: Suscribe un canal a un feed RSS o Atom y haz que el bot publique cada nuevo elemento, ya sea con un embed predeterminado o con un mensaje que diseñes tú.
icon: fa-newspaper
category: Actions
dashboard: /dashboard/feeds
module: Searches
tags: [rss, atom, feed, news, blog, youtube, updates, subscriptions, feedadd, noticias, actualizaciones, suscripciones, canal de YouTube]
related: [embedbuilder, utility]
---

## Qué hace

Le das al bot la URL de un feed y un canal. A partir de ese momento, el bot revisa el feed con regularidad y publica cualquier elemento publicado desde la última revisión. Los miembros ven un mensaje nuevo en el canal cada vez que el sitio publica algo, con el título del elemento, un enlace y, si el feed lo proporciona, la descripción y una imagen.

El staff puede suscribirse a hasta diez feeds por servidor y dar a cada uno su propio mensaje. El mensaje pasa por el analizador de embeds, así que una actualización del feed puede ser texto plano, un embed o un embed con botones, y puede usar placeholders que obtienen el título, el enlace, el autor del elemento, etc.

No se requiere nada de los miembros. Solo tienen que leer el canal.

## Por qué usarlo

- Publica automáticamente el blog, las notas de parche o el changelog de tu comunidad en un canal de anuncios.
- Refleja un feed de un sitio de noticias o de un subreddit en un canal de debate.
- Sigue un canal de YouTube o un podcast a través de su feed RSS.
- Mantén visible un feed de estado o de versiones sin que nadie tenga que copiar enlaces a mano.

## Cómo se publican las actualizaciones

El bot recorre cada URL de feed suscrita, la descarga y espera unos diez segundos antes de empezar la siguiente pasada. En la primera descarga tras el inicio, registra la fecha del elemento más reciente y no publica nada. Después, se publica cada elemento con una fecha de publicación más reciente que la última que vio, del más antiguo al más nuevo, y la fecha registrada avanza. En los feeds Atom se usa la fecha de actualización del elemento cuando no hay fecha de publicación. Los elementos sin ninguna de las dos se ignoran.

No hay límite de cuántos elementos salen en una pasada, así que un feed que suelta veinte entradas con fechas antiguas de golpe producirá veinte mensajes.

Los feeds que no se cargan se omiten en silencio hasta la siguiente pasada. No se eliminan y el bot no informa del fallo.

### El mensaje predeterminado

Si un feed no tiene mensaje personalizado, el bot envía un embed con:

| Parte | Valor |
| --- | --- |
| Título | El título del elemento, recortado a 256 caracteres |
| Descripción | La descripción del elemento sin HTML, recortada a 2048 caracteres |
| URL | El enlace del elemento, para que el título sea clicable |
| Imagen | Un adjunto de imagen del feed, o un elemento Atom `preview` o `thumbnail` si existe |
| Pie | La URL del feed |

### Mensajes personalizados y placeholders

Define un mensaje personalizado con `feedmessage` o con el botón **Editar mensaje** del panel. El texto pasa por el analizador de embeds, así que funciona cualquier cosa del [constructor de embeds](/wiki/embedbuilder): texto plano, JSON de embed, o ambos. Las menciones de roles y usuarios en la parte de texto plano sí notifican.

Estos placeholders se reemplazan en el mensaje personalizado, además de los placeholders generales de servidor, canal y bot de la página de placeholders.

| Placeholder | Valor |
| --- | --- |
| `%title%` | El título del elemento |
| `%author%` | El autor del elemento, o "Desconocido" |
| `%content%` | La descripción del elemento sin HTML |
| `%url%` | Enlace al elemento |
| `%feedurl%` | La URL propia del feed |
| `%image_url%` | La imagen del elemento si el feed la proporciona; si no, la imagen del feed |
| `%categories%` | Las categorías del elemento, separadas por comas |
| `%timestamp%` | La fecha de publicación como marca de tiempo de Discord |

> [!EXAMPLE]
> `feedmessage 1 New post: **%title%** by %author%
> %url%`

Define el mensaje como `-` para volver al embed predeterminado.

## Ajustes

Los feeds no tienen ajustes a nivel de servidor. Cada suscripción tiene un canal y una URL, elegidos al añadirla, más un mensaje opcional. La página del panel se llama **Feeds RSS** y tiene tres pestañas.

| Pestaña | Qué muestra |
| --- | --- |
| Feeds RSS | Cada suscripción con su canal, URL y fecha de alta. **Editar mensaje** o **Añadir mensaje personalizado** abre un cuadro de texto; debajo se muestra una vista previa del mensaje. **Eliminar** quita el feed tras una confirmación. |
| Añadir feed | Un selector de **Canal** y un cuadro **URL del feed RSS**, con el botón **Añadir feed RSS** |
| Estadísticas | **Total de feeds**, **Feeds únicos**, **Canales** y un desglose de **Feeds por canal** |

El canal y la URL de un feed existente no se pueden cambiar. Elimina el feed y añádelo de nuevo.

## Guía de configuración

1. Abre **Feeds** en el panel y cambia a **Añadir feed**.
2. Elige el **Canal** al que deben ir las actualizaciones.
3. Pega la dirección del feed en **URL del feed RSS** y pulsa **Añadir feed RSS**. Debe ser una dirección completa `http` o `https` a un documento RSS o Atom, no la página principal del sitio.
4. De vuelta en **Feeds RSS**, pulsa **Añadir mensaje personalizado** si quieres tu propia redacción, y luego **Guardar**.
5. Ejecuta `feedtest 1` en Discord para publicar el elemento más reciente y comprobar el resultado. El número es la posición del feed en `feedlist`.

## Comandos

Usa estos comandos con el prefijo de tu servidor (`.` a menos que lo hayas cambiado). Todos los comandos de feeds necesitan el permiso Gestionar mensajes.

| Comando | Alias | Requiere | Función |
| --- | --- | --- | --- |
| `feedadd <url> [#channel]` | `rss` | Gestionar mensajes | Suscribe un canal a un feed. Por defecto, el canal actual. El bot descarga el feed primero y lo rechaza si no puede leerlo. |
| `feedlist` | `feeds` | Gestionar mensajes | Lista las suscripciones, numeradas, diez por página |
| `feedremove <number>` | `feedrm`, `feeddel` | Gestionar mensajes | Elimina una suscripción por su número en la lista |
| `feedmessage <number> <message>` | `rssmessage` | Gestionar mensajes | Define el mensaje personalizado de una suscripción |
| `rsstest <number>` | `feedtest` | Gestionar mensajes | Publica el elemento más reciente del feed en el canal actual |

## Consejos y trampas

- El límite es de diez feeds por servidor, y la misma URL no se puede añadir dos veces. `feedadd` muestra un único error combinado para un enlace ilegible, un duplicado y el límite, así que revisa `feedlist` si no estás seguro de cuál fue.
- Añadir un feed desde el panel no prueba la URL primero. Usa `feedtest` después para asegurarte de que el bot puede leerlo.
- Los números de `feedremove`, `feedmessage` y `feedtest` vienen de `feedlist`, que ordena los feeds según cuándo se añadieron.
- El bot necesita los permisos Enviar mensajes e Insertar enlaces en el canal de destino. Sin Insertar enlaces, el embed predeterminado no aparecerá.
- Solo se publican los elementos con fecha de publicación (o, en Atom, fecha de actualización). Un feed cuyas entradas no tienen fechas nunca producirá actualizaciones.
- El bot no publica nada en su primera pasada tras un reinicio. Empieza desde el elemento más reciente en ese momento, así que los elementos publicados mientras el bot estaba desconectado no se recuperan.
- Como un mensaje personalizado usa el analizador de embeds, mantén las mismas reglas que el constructor de embeds: JSON válido o texto plano.
