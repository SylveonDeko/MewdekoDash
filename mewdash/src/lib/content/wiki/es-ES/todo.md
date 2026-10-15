---
title: Listas de tareas
slug: todo
summary: Listas de tareas compartidas y personales dentro de Discord, con prioridades, fechas límite, etiquetas, búsqueda y permisos por persona.
icon: fa-check
category: Community
dashboard: /dashboard/todo
module: Todo
tags: [todo, tasks, task list, checklist, project, due date, priority, tags, permissions, tareas, lista de tareas, pendientes, proyecto, fecha límite, prioridad, etiquetas, permisos]
related: [administration, tickets]
---

## Qué hace

Las listas de tareas dan a tu servidor listas de tareas que viven en el bot. Un miembro crea una lista, le añade tareas, las marca como hechas y puede dar acceso para que otras personas vean o trabajen en la misma lista. El personal con Gestionar servidor puede crear listas de todo el servidor que todos los miembros pueden ver.

Cada tarea tiene un título, una descripción opcional, una prioridad de 1 a 4, etiquetas opcionales, una fecha límite opcional y una hora de recordatorio opcional. Las tareas conservan una posición para que puedas reordenarlas, y las tareas completadas se marcan con quién las completó y cuándo.

Hay dos tipos de lista. Una lista personal pertenece a un miembro y es invisible para todos los demás salvo que el propietario dé acceso. Una lista del servidor pertenece al servidor; es pública por defecto para que cualquiera pueda verla, pero solo quienes tienen permiso explícito pueden añadir o cambiar tareas.

Las listas aparecen como embeds en Discord y como tarjetas en el panel. El panel también sigue el progreso, el número de tareas vencidas y la tasa de finalización de la lista que tienes abierta.

## Por qué usarlo

- Un equipo de moderación sigue las tareas pendientes en una lista del servidor en lugar de un mensaje fijado que se queda obsoleto.
- Los organizadores de eventos comparten una lista de comprobación y van tachando tareas.
- Los miembros mantienen una lista privada de cosas que seguir en el servidor.
- Un canal de proyecto quiere etiquetas y prioridades para que las tareas «críticas» destaquen sobre las «bajas».

## Listas y permisos

Cada lista tiene un propietario, la persona que la creó. El propietario puede hacerlo todo en esa lista. Las demás personas obtienen acceso mediante permisos, concedidos por usuario con `todogrant`.

| Permiso | Qué permite |
| --- | --- |
| `view` | Ver la lista y sus tareas |
| `add` | Añadir tareas nuevas |
| `edit` | Editar, etiquetar, reordenar y definir fechas en las tareas de otras personas |
| `complete` | Completar las tareas de otras personas |
| `delete` | Eliminar las tareas de otras personas |
| `manage` | Cambiar los ajustes de la lista, eliminar la lista, conceder y revocar acceso |
| `all` | Todos los permisos anteriores |

Indica varios como una cadena separada por comas, por ejemplo `todogrant 12 @user view,add,complete`. Conceder de nuevo reemplaza los permisos anteriores de ese usuario. `todorevoke` los quita todos.

Se aplican dos reglas independientemente de los permisos: quien creó una tarea siempre puede editar, completar y eliminar su propia tarea, y el propietario de la lista siempre puede hacer cualquier cosa.

Quién puede ver una lista:

| Tipo de lista | Pública | Quién puede verla |
| --- | --- | --- |
| Personal | cualquiera | El propietario, más cualquiera con `view` concedido |
| Servidor | sí (por defecto) | Todos en el servidor |
| Servidor | no | El propietario, más cualquiera con `view` concedido |

`todotoggleprivacy` cambia una lista entre pública y privada. Solo el propietario o alguien con `manage` puede hacerlo.

## Tareas

| Campo | Por defecto | Notas |
| --- | --- | --- |
| Título | obligatorio | Se muestra en negrita en la lista |
| Descripción | ninguna | Se muestra en cursiva bajo el título |
| Prioridad | 1 (Baja) con comandos, Media en el panel | 1 Baja, 2 Media, 3 Alta, 4 Crítica. Cualquier valor fuera de 1 a 4 se ajusta al límite |
| Fecha límite | ninguna | Se muestra como una marca de tiempo relativa de Discord junto al título |
| Hora de recordatorio | ninguna | Se guarda en la tarea y se define con `todosetreminder` |
| Etiquetas | ninguna | No distinguen mayúsculas de minúsculas; añadir una etiqueta existente no hace nada |
| Posición | final de la lista | Se cambia con `todoreorder` |

`todoshow` enumera las tareas pendientes ordenadas por posición, luego por prioridad y luego por hora de creación. Pasa `true` como segundo argumento para mostrar también hasta cinco tareas completadas con cuándo se completaron. Las fechas de `todosetdue` y `todosetreminder` se interpretan con flexibilidad, así que `2026-10-01 18:00` y `October 1 2026` funcionan ambas.

`todosearch` compara la consulta con los títulos, descripciones y etiquetas de las tareas pendientes y muestra hasta diez resultados. `todofilter` acota una lista por una sola etiqueta (`todofilter 12 tag bug`) o por prioridad (`todofilter 12 priority 4`).

Cada lista puede tener un color hexadecimal, definido con `todosetcolor 12 #ff8800`, que se usa para el borde del embed. El valor por defecto es `#7289da`.

## Ajustes

No hay ajustes de todo el servidor. Todo es por lista o por tarea.

La página de Listas de tareas tiene una sola vista. El lado izquierdo enumera todas las listas que puedes ver, con un cuadro **Buscar listas de tareas**, un interruptor **Mostrar tareas completadas** y **Ordenar por** (Prioridad, Fecha límite, Creación, Título) con un selector de orden. Al seleccionar una lista se muestran sus tareas con los botones **Añadir tarea** y **Eliminar lista**, un editor de tareas con **Prioridad** y **Fecha límite**, y un botón **Gestionar permisos** por lista.

| Ajuste | Por defecto | Qué controla |
| --- | --- | --- |
| Nombre y descripción de la lista | obligatorio, ninguna | Se definen al crear una lista con el botón **Crear lista** |
| Prioridad (tarea) | Media | La prioridad de la tarea; se muestra como una etiqueta de color |
| Fecha límite (tarea) | ninguna | Plazo usado para el contador de vencidas |
| Mostrar tareas completadas | desactivado | Si las tareas hechas aparecen en la vista de la lista |

> [!NOTE]
> Las listas creadas desde el panel son siempre listas del servidor. Crea listas personales con `todocreatelist` en Discord.

## Guía de configuración

1. Abre **Listas de tareas** en el panel y haz clic en **Crear lista**.
2. Introduce un nombre y una descripción opcional. La lista se crea como una lista pública del servidor.
3. Haz clic en la lista y luego en **Añadir tarea**. Rellena **¿Qué hay que hacer?**, una descripción opcional y una prioridad.
4. Usa **Gestionar permisos** en la tarjeta de la lista para ver quién tiene acceso. Concede acceso desde Discord con `todogrant <listId> @user add,complete` para que esas personas puedan trabajar en ella.
5. En Discord, ejecuta `todolists` para obtener el ID de la lista y luego `todoshow <listId>` para comprobar que se muestra.
6. Marca las cosas como hechas con `todocomplete <itemId>`; el ID de la tarea aparece entre comillas invertidas en `todoshow`.

## Comandos

Ejecútalos con el prefijo de tu servidor (`.` salvo que lo hayas cambiado). Los IDs de lista y de tarea vienen de `todolists` y `todoshow`.

| Comando | Alias | Requiere | Propósito |
| --- | --- | --- | --- |
| `todocreatelist <name> [description]` | `tcl` | Nadie | Crea una lista personal |
| `todocreateserverlist <name> [description]` | `tcsl` | Gestionar servidor | Crea una lista de todo el servidor |
| `todolists [includeServer]` | | Nadie | Enumera las listas que puedes ver; pasa `false` para solo las personales |
| `tododeletelist <listId>` | `tdl` | Nadie | Elimina una lista y todas sus tareas (propietario o `manage`) |
| `todoshow <listId> [includeCompleted]` | `ts` | Nadie | Muestra las tareas de una lista |
| `todoadd <listId> <title> [description]` | `ta` | Nadie | Añade una tarea con prioridad Baja |
| `todoaddpriority <listId> <priority> <title> [description]` | `tap` | Nadie | Añade una tarea con prioridad de 1 a 4 |
| `todoedit <itemId> <title> [description]` | `te` | Nadie | Cambia el título y la descripción de una tarea |
| `todocomplete <itemId>` | `tc` | Nadie | Marca una tarea como hecha |
| `tododelete <itemId>` | `td` | Nadie | Elimina una tarea |
| `todoreorder <itemId> <position>` | `tr` | Nadie | Mueve una tarea a una posición que empieza en 1 |
| `todosetdue <itemId> <date>` | `tsd` | Nadie | Define una fecha límite |
| `todocleardue <itemId>` | `tcd` | Nadie | Quita la fecha límite |
| `todosetreminder <itemId> <date>` | `tsr` | Nadie | Define una hora de recordatorio |
| `todoclearreminder <itemId>` | `tcr` | Nadie | Quita la hora de recordatorio |
| `todoaddtag <itemId> <tag>` | `tat` | Nadie | Añade una etiqueta |
| `todoremovetag <itemId> <tag>` | `trt` | Nadie | Quita una etiqueta |
| `todosearch <listId> <query>` | `tsearch` | Nadie | Busca tareas pendientes por título, descripción o etiqueta |
| `todofilter <listId> <tag or priority> <value>` | `tf` | Nadie | Filtra las tareas pendientes por una etiqueta o una prioridad |
| `todosetcolor <listId> <#hex>` | `tsc` | Nadie | Define el color del embed |
| `todotoggleprivacy <listId>` | `ttp` | Nadie | Cambia una lista entre pública y privada |
| `todogrant <listId> @user <perms>` | `tg` | Nadie | Concede permisos separados por comas |
| `todorevoke <listId> @user` | `trv` | Nadie | Quita todos los permisos de un usuario |
| `todopermissions <listId>` | `tp` | Nadie | Muestra quién tiene qué permisos |

«Nadie» significa que no hay comprobación de permisos de Discord; los permisos propios de la lista deciden si el comando tiene éxito. Los mismos comandos existen como comandos de barra en `/todo`.

## Consejos y advertencias

- Las horas de recordatorio se guardan en la tarea, pero nada en el bot envía actualmente un recordatorio cuando llega esa hora. Trátalo como una nota por ahora.
- `todoshow` indica que no se encontró la lista si no tienes acceso `view`, incluso cuando el ID es correcto.
- El nombre de una lista debe ser único por propietario y tipo, así que dos miembros pueden tener cada uno una lista personal «Shopping», pero un mismo miembro no puede tener dos.
- `todoreorder` renumera todas las tareas de la lista, así que las posiciones se mantienen contiguas.
- Las listas públicas del servidor las puede leer todo el mundo, pero nadie salvo el propietario puede añadir a ellas hasta que concedas `add`.
- Usa `todogrant` en Discord para el conjunto completo de permisos; la vista **Gestionar permisos** del panel sirve para comprobar quién tiene acceso.
- Eliminar una lista quita sus permisos y tareas de una sola vez y no se puede deshacer.
