---
title: Filtros de mensajes
slug: filter
summary: Elimina los mensajes que contengan palabras bloqueadas, invitaciones de Discord o enlaces, opcionalmente advierte al remitente, y banea al instante con una lista aparte de palabras de baneo automático.
icon: fa-filter
category: Security
dashboard: /dashboard/filter
module: Permissions
tags: [filter, word filter, invite filter, link filter, automod, auto ban, blacklist, banned words, regex, filtro, filtro de palabras, filtro de invitaciones, filtro de enlaces, automoderación, baneo automático, lista negra, palabras prohibidas, expresión regular]
related: [moderation, logging, administration]
---

## Qué hace

El filtro revisa cada mensaje que un miembro envía o edita antes de que lo vean otros módulos. Si el mensaje contiene una palabra filtrada, una invitación de Discord o un enlace en un lugar donde ese filtro está activo, el bot lo elimina. También puedes hacer que el bot emita una advertencia mediante el sistema de moderación y envíe al miembro un MD explicando qué se eliminó.

Una segunda lista, la de palabras de baneo automático, es más estricta. Un mensaje que coincida con una palabra de baneo automático se elimina y su autor queda baneado de inmediato, con un MD que incluye el motivo cuando el bot puede enviarlo.

Los administradores y cualquiera que tenga el rol de staff del servidor (configurado con `staffrole`) nunca son filtrados. Los mensajes de bots tampoco se revisan.

## Por qué usarlo

- Mantener insultos y otros términos prohibidos fuera del chat sin necesidad de que haya un moderador conectado.
- Evitar que los miembros hagan publicidad de otros servidores al pegar enlaces de invitación.
- Hacer que un canal sea solo de texto eliminando cualquier mensaje con una URL, por ejemplo en un chat de anuncios sin contenido multimedia.
- Banear al instante las cuentas que publiquen frases de estafa conocidas o firmas de raids.

## Tipos de filtro

| Filtro | Dónde se aplica | Qué ocurre |
| --- | --- | --- |
| Filtro de palabras | Solo en los canales de la lista del filtro de palabras | Se elimina el mensaje; advertencia y MD si **Advertir por palabra filtrada** está activado |
| Filtro de invitaciones | En todas partes cuando el interruptor del servidor está activado y la lista de canales está vacía, o solo en los canales listados cuando la lista tiene entradas | Se elimina el mensaje; advertencia y MD si **Advertir por enlace de invitación** está activado |
| Filtro de enlaces | En todas partes cuando el interruptor del servidor está activado, más cualquier canal de su lista | Se elimina el mensaje, sin advertencia |
| Palabras de baneo automático | En todas partes | Se elimina el mensaje, se envía un MD al autor y se le banea |

Las tres listas de canales son las **Excepciones por canal** del panel. Ten en cuenta que el filtro de palabras se controla por completo con su lista de canales: un canal debe estar en ella para que se comprueben las palabras allí.

## Cómo se comparan las palabras

Las palabras filtradas y las palabras de baneo automático se tratan como expresiones regulares y se comprueban contra el contenido del mensaje en minúsculas. Una palabra simple como `example` funciona como coincidencia de subcadena, así que `examples` también se detecta. Los patrones que no se pueden compilar se eliminan automáticamente de la lista. Cada patrón tiene un tiempo límite de coincidencia de 250 milisegundos.

Las palabras filtradas se guardan en minúsculas y se comparan sin distinguir mayúsculas. Los patrones de baneo automático se guardan tal como los escribes y se comparan con el texto en minúsculas, así que escríbelos en minúsculas.

> [!WARNING]
> Los patrones de baneo automático son muy potentes. Un patrón corto como `ban` dentro de una palabra más larga banearía a quien escriba «banana». Prueba primero los patrones como palabras filtradas.

## Advertencias

Al activar **Advertir por palabra filtrada** o **Advertir por enlace de invitación**, el bot añade una advertencia mediante el módulo de moderación con el motivo "Warned for Filtered Word" o el motivo de advertencia de invitación, y después envía un MD al miembro. Los castigos por advertencias configurados en la página de Moderación se aplican como de costumbre, así que tres coincidencias del filtro pueden escalar a un silencio o a una expulsión si así están configuradas las advertencias.

Los baneos automáticos usan la configuración de purga de baneo del módulo de moderación para la acción "Filter" y decidir cuántos días de mensajes se borran.

## Ajustes

La página de Filtros de mensajes tiene cuatro pestañas: **Filtros**, **Palabras filtradas**, **Palabras de baneo automático** y **Excepciones por canal**.

| Ajuste | Por defecto | Qué controla |
| --- | --- | --- |
| Filtro de palabras | Desactivado | Interruptor general del servidor, visible en la pestaña Filtros |
| Filtro de invitaciones | Desactivado | Elimina los enlaces de invitación de Discord; es necesario para que la lista de canales de invitaciones haga algo |
| Filtro de enlaces | Desactivado | Elimina cualquier mensaje con una URL en todo el servidor |
| Advertir por palabra filtrada | Desactivado | Añade una advertencia y envía un MD al miembro cuando se elimina una palabra filtrada |
| Advertir por enlace de invitación | Desactivado | Añade una advertencia y envía un MD al miembro cuando se elimina una invitación |
| Palabras filtradas | ninguna | Lista en la pestaña Palabras filtradas, con eliminación por palabra, un botón **Borrar todo** que hace lo mismo que `fwclear`, y un cuadro de búsqueda cuando hay más de diez palabras |
| Palabras de baneo automático | ninguna | Lista en la pestaña Palabras de baneo automático |
| Canales del filtro de palabras | ninguno | Canales donde se aplica la lista de palabras |
| Canales del filtro de invitaciones | ninguno | Limita el filtro de invitaciones a estos canales cuando no está vacío |
| Canales del filtro de enlaces | ninguno | Canales adicionales donde se eliminan los enlaces aunque el interruptor del servidor esté desactivado |

La parte superior de la página muestra el recuento de palabras filtradas, palabras de baneo automático y excepciones por canal.

## Configuración paso a paso

1. Abre **Filtros de mensajes** en el panel.
2. En la pestaña **Palabras filtradas**, añade cada palabra o frase y pulsa añadir.
3. En **Excepciones por canal**, añade cada canal donde debe aplicarse la lista de palabras en **Canales del filtro de palabras**.
4. Vuelve a **Filtros** y activa **Filtro de invitaciones** si quieres que las invitaciones se eliminen en todo el servidor, y **Advertir por enlace de invitación** si eso debe contar como advertencia.
5. Opcionalmente, añade algunos patrones de alta confianza en la pestaña **Palabras de baneo automático**.
6. Ejecuta `staffrole @Moderators` para que tu equipo quede exento y, después, publica una palabra filtrada desde una cuenta normal para confirmar que se elimina.

## Comandos

Ejecuta estos comandos con el prefijo de tu servidor (`.` a menos que lo hayas cambiado).

| Comando | Alias | Requiere | Función |
| --- | --- | --- | --- |
| `filterword <word>` | `fw` | Nadie | Añadir una palabra a la lista de filtros, o quitarla si ya estaba |
| `lstfilterwords` | `lfw` | Nadie | Recorrer la lista de palabras filtradas por páginas |
| `fwclear` | | Administrador | Eliminar todas las palabras filtradas, borrar la lista de canales de palabras y desactivar el interruptor del servidor |
| `srvrfilterwords` | `sfw` | Nadie | Activar o desactivar el interruptor del filtro de palabras de todo el servidor |
| `chnlfilterwords` | `cfw` | Nadie | Activar o desactivar el canal actual en la lista del filtro de palabras |
| `srvrfilterinv` | `sfi` | Nadie | Activar o desactivar el filtro de invitaciones de todo el servidor |
| `chnlfilterinv` | `cfi` | Nadie | Activar o desactivar el canal actual en la lista del filtro de invitaciones |
| `srvrfilterlin` | `sfl` | Nadie | Activar o desactivar el filtro de enlaces de todo el servidor |
| `chnlfilterlin` | `cfl` | Nadie | Activar o desactivar el canal actual en la lista del filtro de enlaces |
| `fwarn <y or n>` | `filteredwarn` | Administrador | Activar o desactivar las advertencias por palabras filtradas |
| `invwarn <y or n>` | `invitewarn` | Administrador | Activar o desactivar las advertencias por enlaces de invitación |
| `autobanword <pattern>` | `autobanw` | Administrador | Añadir un patrón a la lista de baneo automático, o quitarlo si ya estaba |
| `autobanwordlist` | `autobwlist` | Administrador | Recorrer la lista de baneo automático por páginas |

> [!PERMISSION]
> Los interruptores de filtro y `filterword` no tienen ninguna comprobación de permisos propia. Usa el módulo de Permisos para restringirlos, o gestiona los filtros desde el panel, donde se aplican las reglas de acceso al panel.

## Consejos y advertencias

- El bot necesita el permiso Gestionar mensajes en cada canal filtrado y el permiso Banear miembros para los baneos automáticos.
- Los mensajes editados se vuelven a comprobar, así que editar un enlace dentro de un mensaje antiguo también hace que se elimine.
- Los filtros no se aplican a administradores, al rol de staff ni a bots. No pruebes con una cuenta de administrador.
- `fwclear` hace más que vaciar la lista: también elimina todas las excepciones de canal del filtro de palabras.
- Las expresiones regulares no válidas se eliminan de la lista en silencio. Si una palabra desaparece, comprueba que no contenga caracteres sin escapar como `(`, `[` o `*`.
- Si quieres un registro de lo que eliminó el filtro, registra las eliminaciones de mensajes con la función de Registro.
