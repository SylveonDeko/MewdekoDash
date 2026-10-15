---
title: Guardado de chat
slug: chatsaver
summary: Trae el historial reciente de un canal al panel, léelo allí y guarda registros con nombre para más adelante, o exporta una transcripción HTML desde Discord con un comando.
icon: fa-folder
category: Security
dashboard: /dashboard/chatsaver
module: Utility
tags: [chat saver, chat log, save chat, transcript, export, archive, history, evidence, ticket transcript, guardado de chat, registro de chat, guardar chat, transcripción, exportar, archivo, historial, pruebas, transcripción de ticket]
related: [tickets, logging, auditlog]
---

## Qué hace

Guardado de chat tiene dos partes. En el panel, el staff elige un canal y un periodo de tiempo, y el bot obtiene cada mensaje de ese periodo: texto, autor, adjuntos y embeds. Pueden leerlos en la página y, si merece la pena conservarlos, guardarlos como un registro con nombre. Los registros guardados viven en la base de datos del bot, así que sobreviven aunque los mensajes originales se eliminen.

En Discord, `savechat` exporta una transcripción completa de un canal de los últimos minutos, horas o días y te da un enlace a un archivo HTML que se parece a Discord, con los archivos multimedia incluidos.

Las transcripciones de tickets también acaban aquí. Cuando se cierra un ticket en un servidor que tiene configurado un canal de transcripciones de tickets, el sistema de tickets guarda la conversación como un registro llamado `Ticket #<id> - <channel>`, así que aparece en **Registros guardados** junto con los demás.

## Por qué usarlo

- Conservar pruebas de una discusión o de una infracción de las normas antes de que la gente borre sus mensajes.
- Archivar un canal de eventos o un hilo de anuncios antes de que se elimine.
- Revisar lo que pasó en un canal durante la noche sin tener que desplazarte hacia atrás en Discord.
- Leer transcripciones de tickets antiguos en un solo lugar.

## Obtener mensajes

En la pestaña **Obtener mensajes**, elige un **Canal**, una **Cantidad de tiempo** y una **Unidad de tiempo**, y luego haz clic en **Cargar mensajes**. El bot lee el canal del más nuevo al más antiguo y se detiene al llegar a mensajes más antiguos que tu periodo o cuando ha reunido 5000 mensajes, lo que ocurra primero. Los mensajes se muestran del más antiguo al más nuevo en la pestaña **Ver mensajes**.

| Unidad de tiempo | Máximo |
| --- | --- |
| Minutos | 4320 |
| Horas | 72 |
| Días | 3 |

Los tres límites equivalen al mismo periodo de tres días. Obtener mensajes no guarda nada; si cierras la página, desaparecen.

## Guardar un registro

Con los mensajes cargados, haz clic en **Guardar registro** en la pestaña **Ver mensajes**. El registro se llama `<channel> - <today's date>` y se guarda con el canal, quién lo guardó y el número de mensajes. Cada registro guardado conserva el texto de los mensajes, el nombre y el avatar del autor, la marca de tiempo, los enlaces de los adjuntos y los títulos, descripciones y miniaturas de los embeds.

Los enlaces de adjuntos y avatares apuntan a la CDN de Discord. Si Discord elimina el archivo, el enlace del registro guardado deja de funcionar, aunque el texto se conserva.

**Exportar HTML**, junto a **Guardar registro**, descarga los mensajes cargados como una transcripción HTML independiente generada en tu navegador. No se guarda nada en el bot.

## Registros guardados

La pestaña **Registros guardados** muestra todos los registros del servidor, del más nuevo al más antiguo, con su canal y su número de mensajes. Cada entrada tiene **Ver registro**, **Renombrar registro** y **Eliminar registro**. Renombrar solo cambia la etiqueta. Eliminar es permanente y se hace en cuanto haces clic; no hay ningún mensaje de confirmación.

Los cambios de nombre y las eliminaciones quedan registrados en el registro de auditoría del panel.

## El comando savechat

`savechat` funciona de forma distinta al panel. Ejecuta DiscordChatExporter en el equipo del bot, escribe un archivo HTML con los archivos multimedia y responde con un enlace. En el Mewdeko público te envía por MD un enlace a `cdn.mewdeko.tech`; en un bot autoalojado publica la ruta local en el canal.

El periodo está limitado a tres días. Los valores mayores se rechazan. La exportación necesita que exista el directorio de guardado de chats configurado en el bot; si no existe, el comando da error.

> [!NOTE]
> Las exportaciones de `savechat` no aparecen en **Registros guardados**. Son archivos en el equipo del bot, no entradas de la base de datos.

## Ajustes

Guardado de chat no tiene configuración. La página del panel tiene tres pestañas: **Obtener mensajes**, **Registros guardados** y **Ver mensajes**.

| Control | Por defecto | Qué controla |
| --- | --- | --- |
| Canal | ninguno | El canal de texto que se va a leer |
| Cantidad de tiempo | 1 | Cuánto tiempo atrás se obtienen los mensajes |
| Unidad de tiempo | Horas | Minutos, Horas o Días |

## Guía de configuración

1. Abre **Guardado de chat** en el panel.
2. En **Obtener mensajes**, selecciona el **Canal** y ajusta **Cantidad de tiempo** y **Unidad de tiempo**, por ejemplo 6 horas.
3. Haz clic en **Cargar mensajes** y espera a que aparezca el número de mensajes.
4. Cambia a **Ver mensajes** para leer lo que se ha obtenido.
5. Haz clic en **Guardar registro** para conservarlo. Aparecerá en **Registros guardados**.
6. Usa **Renombrar registro** para darle un nombre significativo, como el incidente o la fecha.

## Comandos

Ejecuta estos comandos con el prefijo de tu servidor (`.` a menos que lo hayas cambiado).

| Comando | Alias | Requiere | Función |
| --- | --- | --- | --- |
| `savechat <time> [#channel]` | | Gestionar mensajes | Exporta el último `<time>` de un canal a HTML, por ejemplo `savechat 2h #general` |

## Consejos y advertencias

- El bot debe poder leer el canal y su historial de mensajes. Los canales que no puede ver devuelven "Channel not found".
- La obtención se detiene en 5000 mensajes. En un canal muy activo, usa un periodo más corto.
- Las ediciones y eliminaciones de mensajes que ocurrieron antes de obtenerlos no son visibles; el bot lee lo que hay en el canal en ese momento. Usa la función de registros para un historial en tiempo real.
- Los registros guardados almacenan los nombres de autor tal como estaban en el momento de guardarlos. Un cambio de nombre posterior no se refleja.
- Cualquiera con acceso al panel del servidor puede leer los registros guardados, incluidas las transcripciones de tickets. Restringe el acceso al panel en consecuencia.
- `savechat` está pensado para la CDN del bot público. Quienes lo autoalojan deben configurar una ruta de guardado de chats en las credenciales y copiar los archivos de DiscordChatExporter junto al bot.
