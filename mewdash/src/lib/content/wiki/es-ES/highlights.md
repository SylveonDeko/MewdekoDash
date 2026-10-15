---
title: Destacados
slug: highlights
summary: Los miembros eligen palabras que vigilar y reciben un MD con contexto cada vez que alguien dice una de ellas en el servidor.
icon: fa-bolt
category: Community
dashboard: /dashboard/highlights
module: Highlights
tags: [highlights, keywords, watch words, notifications, mentions, dm alerts, ignore channel, ignore user, destacados, palabras clave, notificaciones, menciones, alertas por MD, ignorar canal, ignorar usuario]
related: [afk, utility]
---

## Qué hace

Un miembro añade una palabra o frase con `highlight add`. A partir de ese momento, cada vez que un mensaje del servidor contenga esa palabra, el bot le envía un MD. El MD indica en qué servidor y canal ocurrió, muestra los cinco mensajes anteriores a ese más el mensaje coincidente, y tiene un botón **Ir al mensaje**.

Los destacados son personales. Cada miembro gestiona su propia lista, elige qué canales y personas ignorar, y puede desactivar sus destacados sin borrarlos. El staff no puede añadir destacados a otra persona, pero el panel les permite ver qué se está vigilando y eliminar entradas.

Los miembros solo reciben MD de los canales que realmente pueden ver. Un miembro que está escribiendo en el servidor se considera presente, así que los destacados se pausan para esa persona durante dos minutos.

## Por qué usarlo

- Recibe un aviso cuando se mencione tu nombre, apodo o proyecto sin una mención real con @.
- Sigue un tema como "giveaway" o "patch notes" en un servidor grande.
- El staff puede vigilar palabras como "help" o "report" sin leer todos los canales.
- Los moderadores pueden auditar qué están siguiendo los miembros y limpiar entradas abusivas o de spam.

## Cómo funciona la coincidencia

El bot comprueba cada mensaje no vacío contra cada destacado de ese servidor.

- Un destacado coincide como palabra o frase completa. `cat` no coincide con "category", pero sí con "the cat sat".
- La coincidencia distingue mayúsculas y minúsculas. Añade `Cat` y `cat` por separado si quieres ambos.
- Cada miembro recibe como máximo un MD cada dos minutos por servidor, sin importar cuántas palabras coincidan.
- Escribir en cualquier parte del servidor inicia esa misma pausa de dos minutos, así que no recibes MD sobre una conversación en la que ya estás participando.
- Los mensajes de usuarios ignorados y en canales ignorados se omiten para ese miembro.
- El MD se omite cuando el miembro no puede ver el canal o tiene los MD cerrados.
- Los mensajes se revisan a través de una cola que procesa un mensaje cada dos segundos. En un shard muy ocupado, algunos mensajes pueden perderse de esa cola.

`highlight match some text` comprueba tu propia lista contra una frase de muestra y te indica cuáles de tus palabras habrían coincidido. Esa comprobación ignora mayúsculas y minúsculas, así que es una guía aproximada y no una copia exacta de la regla en vivo.

## Ajustes por miembro

Cada miembro tiene una fila de ajustes que se crea la primera vez que cambia algo.

| Ajuste | Predeterminado | Qué controla |
| --- | --- | --- |
| Destacados activados | activado | `highlight toggle false` pausa todos tus destacados en este servidor |
| Canales ignorados | ninguno | Canales donde tus palabras nunca provocan un MD |
| Usuarios ignorados | ninguno | Personas cuyos mensajes nunca activan tus destacados |

## Ajustes

La página Destacados del panel es para el staff. No añade destacados; los muestra y los elimina.

| Pestaña | Qué muestra |
| --- | --- |
| Todas las palabras destacadas | Cada destacado del servidor agrupado por miembro, con un botón de eliminar por palabra y un botón para quitar todas las palabras de un miembro |
| Buscar | Encuentra destacados que contengan una palabra entre todos los miembros; la búsqueda no distingue mayúsculas |
| Usuarios desactivados | Miembros que han desactivado sus destacados, con cuántos canales y usuarios ignoran |
| Estadísticas | Total de palabras destacadas, Usuarios activos, Palabra más usada, Más activos, además de Palabras destacadas más usadas y Palabras destacadas recientes |

## Guía de configuración

No hay nada que activar. Los destacados funcionan en cuanto el bot está en el servidor.

1. Como miembro, ejecuta `highlight add yourname` en cualquier canal.
2. Ejecuta `highlight list` para confirmar que se guardó.
3. Pide a alguien que escriba tu nombre en otro canal. Espera un par de segundos y revisa tus MD.
4. Si recibes demasiados, ejecuta `highlight toggleignore #busy-channel` o `highlight toggleignore @user`.
5. Staff: abre **Destacados** en el panel para revisar la pestaña **Todas las palabras destacadas** y quitar lo que no se quiera.

## Comandos

Usa estos comandos con el prefijo de tu servidor (`.` a menos que lo hayas cambiado). Las mismas acciones existen como el único comando de barra `/highlights manage`, cuya opción `action` admite `Add`, `List`, `Delete`, `Match`, `ToggleUser`, `ToggleChannel` o `ToggleGlobal`, con las opciones separadas `words`, `user` y `channel`.

| Comando | Alias | Requiere | Función |
| --- | --- | --- | --- |
| `highlight add <word>` | `highlights`, `hl` | Nadie | Vigila una palabra o frase |
| `highlight list` | `highlights`, `hl` | Nadie | Pasa las páginas de tus destacados, diez por página |
| `highlight delete <number or word>` | `highlights`, `hl` | Nadie | Elimina por su número en la lista o por palabra exacta; `remove` hace lo mismo |
| `highlight match <text>` | `highlights`, `hl` | Nadie | Muestra cuáles de tus palabras aparecen en el texto |
| `highlight toggleignore <#channel or @user>` | `highlights`, `hl` | Nadie | Añade o quita un canal o persona de tu lista de ignorados |
| `highlight toggle <true or false>` | `highlights`, `hl` | Nadie | Activa o desactiva todos tus destacados en este servidor |

## Consejos y trampas

- El bot necesita poder leer el canal para encontrar coincidencias en él, y necesitas tener los MD abiertos a los miembros del servidor para recibir alertas.
- Añadir una palabra que ya tienes se rechaza. La comprobación de duplicados ignora mayúsculas y minúsculas, pero la coincidencia en vivo no.
- Eliminar por número usa la posición que se muestra en `highlight list`, que cambia tras cada eliminación.
- La lista de destacados y los ajustes se guardan en caché durante treinta minutos por servidor. Añadir o eliminar palabras sueltas mediante comandos o el panel actualiza la caché al instante; quitar todas las palabras de un miembro desde el panel puede tardar hasta treinta minutos en detener los MD.
- Cuando el bot sale de un servidor, sus destacados y ajustes se limpian la próxima vez que el bot se reinicie.
