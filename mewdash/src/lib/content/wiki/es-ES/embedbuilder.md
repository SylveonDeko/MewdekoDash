---
title: Embeds
slug: embedbuilder
summary: Crea mensajes completos de Discord con embeds, botones y menús de selección, guárdalos como plantillas, envíalos a un canal y reutiliza el mismo JSON en cualquier lugar donde el bot acepte un mensaje personalizado.
icon: fa-link
category: Actions
dashboard: /dashboard/embedbuilder
module: Utility
tags: [embed, embed builder, json, say, template, webhook, persona, buttons, select menu, custom message, constructor de embeds, plantilla, perfil de envío, botones, menú de selección, mensaje personalizado]
related: [multigreets, chat-triggers, afk, feeds, giveaways, suggestions]
---

## Qué hace

El constructor de embeds es un editor visual de mensajes de Discord. Rellenas un título, una descripción, un color, campos, imágenes y, opcionalmente, botones o menús de selección, ves una vista previa en vivo y al final obtienes un bloque de JSON. Ese JSON es el formato universal de mensajes del bot. Pégalo en `say` para publicarlo, guárdalo como una plantilla con nombre o ponlo en cualquier función que acepte un mensaje personalizado, como los saludos, los chat triggers, las respuestas de AFK, las actualizaciones de feeds o el MD al ganador de un sorteo.

Las plantillas pueden ser personales, visibles solo para ti en todos los servidores, o compartidas con un servidor para que cualquier miembro del staff pueda cargarlas. El panel también puede enviar un mensaje terminado directamente a un canal, opcionalmente mediante un webhook con un nombre y un avatar personalizados, lo que se llama un perfil de envío (persona).

Los miembros nunca interactúan con el constructor. Solo ven los mensajes que produce.

## Por qué usarlo

- Escribe una publicación de normas o de información con el formato adecuado y actualízala más tarde con `edit`.
- Diseña un mensaje de bienvenida una vez y luego pega el JSON en los saludos.
- Mantén un conjunto de plantillas de anuncios para que el staff publique novedades con un aspecto coherente.
- Añade botones que ejecuten chat triggers, o un menú de selección que reparta roles mediante triggers.
- Publica como "Server News" con su propio avatar sin dar a nadie acceso a webhooks.

## El formato JSON

El analizador busca la primera `{` en el texto y lee hasta su `}` correspondiente. Si no hay un objeto JSON, o no se puede analizar, todo el texto se trata como contenido simple. Los nombres de las propiedades no distinguen mayúsculas.

| Clave | Tipo | Significado |
| --- | --- | --- |
| `content` | string | Texto simple mostrado encima de los embeds |
| `embed` | object | Un único embed. Si está presente, `embeds` se ignora. |
| `embeds` | array | Hasta diez objetos embed |
| `components` | array | Botones y menús de selección |

Un objeto embed acepta `title`, `description`, `url`, `color`, `author` (`name`, `url`, `icon_url`), `footer` (`text`, `icon_url`), `thumbnail` (`url`), `image` (`url`) y `fields` (array de `name`, `value`, `inline`). `color` puede ser un número o una cadena como `#5865F2`. Los nombres de los campos se recortan a 256 caracteres y los valores a 1024. Cualquier URL que no sea una dirección absoluta completa se descarta en lugar de hacer fallar todo el mensaje. Se acepta una clave `timestamp` pero no se muestra.

Un componente tiene `row` (en qué fila está), `displayName`, y o bien `url` para un botón de enlace o bien `id` para un botón vinculado a un chat trigger. `style` va de 1 a 4 para los cuatro estilos de botón de Discord, y `emoji` es opcional. Pon `isSelect` en true para un menú de selección y luego indica `options` (cada una con `id`, `name`, `description`, `emoji`) y `minOptions` y `maxOptions` entre 0 y 25. Un componente que incumple una regla se muestra como un botón rojo desactivado cuya etiqueta es el error, para que puedas ver qué salió mal en Discord.

> [!EXAMPLE]
> `{"content": "Welcome %user.mention%!", "embeds": [{"title": "Read the rules", "description": "See %channel.mention%", "color": "#57F287"}]}`

### Marcadores

El botón **%** del constructor inserta marcadores de la página de marcadores (usuario, servidor, canal, bot, hora, etc.). El panel no los sustituye: un mensaje enviado desde la pestaña **Enviar** sale con el texto literal. El bot los sustituye cuando el JSON pasa por un comando o una función, por ejemplo `say`, `embedpreview`, los saludos y los triggers. Cada función añade su propio conjunto, como `%afk.message%` o `%giveawayitem%`, además de los generales.

## Plantillas

Una plantilla es un nombre más el JSON. Existen dos ámbitos.

| Ámbito | Quién la ve | Creada por |
| --- | --- | --- |
| Personal | Solo tú, en cualquier servidor y en MD | `embedsave`, o **Guardar** en el panel con la opción de compartir sin marcar |
| Compartida con el servidor | Cualquiera con acceso en ese servidor | `guildembedsave` (Gestionar mensajes), o **Guardar** con **Compartir con todos en (servidor)** marcado |

Los nombres deben ser únicos dentro de un ámbito. `embedpreview <name>` busca primero tu plantilla personal, luego la compartida del servidor, sustituye los marcadores y la publica en el canal actual.

Algunos comandos aceptan una referencia a una plantilla en lugar de JSON sin procesar: escribe `{template:name}` o `{t:name}` como mensaje. `multigreetmessage` lo admite. Se guarda el JSON resuelto, no la referencia, así que las ediciones posteriores de la plantilla no actualizan el saludo.

## La página del panel

La página se titula **Constructor de embeds de Discord** y tiene seis pestañas, con una **Vista previa en vivo** y un panel de **Problemas** al lado. **Deshacer**, **Rehacer**, **Cancelar cambios** y **Copiar JSON** están en la cabecera.

| Pestaña | Qué haces allí |
| --- | --- |
| Plantillas | Elige de una galería de puntos de partida o **Empezar desde cero** |
| Editor | **Contenido del mensaje** más hasta diez embeds. Cada embed tiene título, descripción, URL, color, autor, pie, hasta 25 campos, miniatura e imagen, con contadores de caracteres. |
| Componentes | Hasta cinco filas y 25 componentes. Añade botones (texto, estilo, emoji, URL o disparador) y menús de selección (texto de ejemplo, opciones con vínculos a disparadores). |
| JSON | La carga sin procesar. **Actualizar desde el constructor** la regenera; **Aplicar al constructor** carga el JSON pegado, ya sea una carga completa o un único objeto embed. |
| Guardados | **Guardar embed actual** con un nombre y la casilla de compartir, luego listas de **Compartidos en (servidor)** y **Mis embeds** con **Cargar** y **Eliminar** |
| Enviar | Elige un canal, revisa tus permisos allí, opcionalmente envía mediante un webhook como perfil de envío o con un nombre y una URL de avatar personalizados, y pulsa **Enviar mensaje** |

### Envío y perfiles de envío

La pestaña **Enviar** solo lista los canales en los que tanto tú como el bot podéis publicar. Enviar embeds necesita Insertar enlaces para ambos. Si no tienes Mencionar a todos, las menciones a everyone, here y roles se eliminan y la pestaña te avisa.

Enviar por webhook necesita Gestionar webhooks para ti y para el bot. Un **perfil de envío** (persona) es un nombre y un avatar guardados, personales o compartidos con el servidor; **Gestionar** abre la lista de perfiles. Los perfiles con una imagen subida obtienen su propio webhook en cada canal, así que un canal puede contener como máximo quince. La opción **Personalizado** toma un nombre visible y un enlace de avatar en su lugar. Cada envío se escribe en el registro de auditoría del panel.

El mismo constructor se abre como ventana emergente dentro de otras páginas del panel (saludos, triggers y otras) solo con las pestañas **Editor**, **Componentes**, **JSON** y **Guardados**.

## Ajustes

El constructor no tiene ajustes de servidor. Todo es por mensaje o por plantilla.

## Guía de configuración

1. Abre **Embeds** en el panel y elige una plantilla o **Empezar desde cero**.
2. En **Editor**, escribe el contenido y rellena el embed. Vigila el panel de **Problemas** por si hay algo que Discord rechazaría.
3. Añade botones o menús en **Componentes** si los necesitas, vinculando cada uno a un chat trigger o a una URL.
4. Ve a **Guardados**, ponle un nombre, marca **Compartir con todos en (servidor)** si el staff debe usarla y pulsa **Guardar**.
5. Para publicarla ahora, abre **Enviar**, elige un canal y pulsa **Enviar mensaje**. Para usarla en otro lugar, pulsa **Copiar JSON** y pégalo en la otra función.
6. En Discord, `embedpreview <name>` publica una plantilla guardada con los marcadores rellenados.

## Comandos

Ejecútalos con el prefijo de tu servidor (`.` salvo que lo hayas cambiado).

| Comando | Alias | Requiere | Para qué sirve |
| --- | --- | --- | --- |
| `say [#channel] <text or JSON>` | | Gestionar mensajes | Publicar texto o JSON de embed como el bot, con los marcadores sustituidos. Un archivo adjunto `.txt` puede aportar el mensaje. |
| `edit #channel <message id> <text or JSON>` | | Gestionar mensajes | Reemplazar el contenido de un mensaje enviado por el bot |
| `embedsave <name> <JSON>` | `esave` | Nadie | Guardar una plantilla personal |
| `embedlist` | `elist` | Nadie | Listar tus plantillas personales |
| `embeddelete <name>` | `edel`, `edelete` | Nadie | Eliminar una de tus plantillas personales |
| `guildembedsave <name> <JSON>` | `gesave`, `gembedsave` | Gestionar mensajes | Guardar una plantilla compartida con este servidor |
| `guildembedlist` | `gelist`, `gembedlist` | Nadie | Listar las plantillas compartidas del servidor |
| `guildembeddelete <name>` | `gedel`, `gembeddelete` | Gestionar mensajes | Eliminar una plantilla compartida |
| `embedpreview <name>` | `epreview`, `eprev` | Nadie | Publicar una plantilla guardada en el canal actual |

## Consejos y advertencias

- `say` refleja tus propios permisos de mención: sin Mencionar a todos, el bot no mencionará a everyone ni a roles por ti.
- Un embed con solo un título y nada más se envía igualmente, pero el panel no te dejará copiar ni enviar hasta que haya un título, una descripción, un campo o contenido.
- Los botones vinculados a triggers solo funcionan en el servidor cuyo ID de trigger referencian. Cargar una plantilla compartida en otro servidor deja esos botones rotos.
- Las URL mal formadas de imagen, miniatura, autor y pie se descartan en silencio. Si falta una imagen, comprueba que la URL empiece por `https://`.
- Discord limita un mensaje a diez embeds, 25 campos por embed, cinco filas de componentes y cinco botones por fila. El constructor aplica los mismos números.
- Eliminar un perfil de envío no quita los webhooks que creó en los canales. Límpialos en los ajustes de integraciones del canal si hace falta.
