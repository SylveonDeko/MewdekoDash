---
title: Repetidores
slug: repeaters
summary: Publica un mensaje en un canal según una programación, cuando el canal está activo o en silencio, o mantenlo fijado al final como mensaje fijo.
icon: fa-sync
category: Actions
dashboard: /dashboard/repeaters
module: Utility
tags: [repeater, sticky, sticky message, recurring, scheduled message, auto post, reminder, forum sticky, repetidor, mensaje fijo, recurrente, mensaje programado, publicación automática, recordatorio, foro]
related: [utility, embedbuilder]
---

## Qué hace

Un repetidor es un mensaje que el bot publica una y otra vez en un canal. El uso clásico es un recordatorio temporizado: "Lee las normas" cada seis horas. Cada vez que se dispara, el bot elimina primero su copia anterior, así que el canal nunca se llena de duplicados y el mensaje siempre queda cerca del final.

Los repetidores tienen cinco modos de activación. Además de un intervalo fijo, pueden dispararse en el momento en que otra persona publica (un verdadero mensaje fijo), tras un número de mensajes, cuando el canal ha estado activo o cuando se ha quedado en silencio. Unas ventanas horarias opcionales los limitan al horario laboral, a las tardes-noches o a los fines de semana en la zona horaria de tu servidor, y los repetidores de foro pueden publicar automáticamente en cada hilo nuevo.

El mensaje admite el constructor de embeds completo, texto plano, componentes y los marcadores generales, así que un repetidor puede ser un anuncio enriquecido en lugar de una línea de texto. Las menciones solo se conservan si quien lo crea tiene Mencionar a todos; si no, se neutralizan.

## Por qué usarlo

- Mantén las normas o un aviso de "cómo obtener ayuda" fijado al final de un canal concurrido.
- Publica un recordatorio diario de un evento a las 18:00 hora del servidor.
- Pon las pautas de publicación en cada hilo nuevo de un foro, filtradas por etiqueta.
- Anima un canal muerto con un tema de conversación cuando lleva una hora en silencio.
- Ejecuta una promoción solo en horario laboral y solo durante los próximos siete días.

## Modos de activación

| Modo | Cuándo publica |
| --- | --- |
| Intervalo de tiempo | En cada intervalo, opcionalmente alineado con una hora de inicio del día. Modo predeterminado. |
| Inmediato | Publica una vez y luego vuelve a publicar siempre que su mensaje deje de ser el último del canal. |
| Tras mensajes | Publica cuando se ha enviado el umbral de actividad de mensajes desde la última vez que se disparó. |
| Con actividad | Publica cuando el canal está activo: el umbral se compara con el tráfico reciente en la ventana de tiempo. |
| Sin actividad | Publica cuando no se ha enviado ningún mensaje en el canal durante toda la ventana de tiempo. |

Los modos basados en actividad se comprueban una vez por minuto y necesitan que el conteo de mensajes esté activado en el servidor. El intervalo debe estar entre cinco segundos y 25000 minutos. El valor predeterminado es de cinco minutos, o de un día cuando indicas una hora del día y ningún intervalo. El **Umbral de actividad** es de 5 mensajes por defecto y la **Ventana de tiempo** de cinco minutos, con un rango de ventana de treinta segundos a seis horas.

## Condiciones y límites

- **No repetir si el mensaje ya es el último del canal** (redundancia): el bot omite una ejecución si su última copia sigue siendo el mensaje más reciente.
- **Detección de conversación**: si han llegado tres o más mensajes en el último minuto, la ejecución se retrasa y se vuelve a comprobar a los treinta segundos.
- **Horario**: `business` es de 09:00 a 17:00 de lunes a viernes, `evening` es de 18:00 a 23:00 todos los días y `weekend` es todo el día sábado y domingo. Las horas usan la zona horaria del servidor; establece una primero o el bot asume UTC y te lo recuerda.
- **Eliminar automáticamente tras** y **Máx. de publicaciones**: el repetidor se elimina solo tras una antigüedad máxima o un número de publicaciones.
- **Suprimir notificaciones**: el mensaje se envía en silencio para que no avise en ningún dispositivo.
- La **Prioridad** se guarda por repetidor de 0 a 100, 50 por defecto, y se muestra en la lista.

## Hilos y foros

- **Crear automáticamente en hilos nuevos**: cuando se crea un hilo bajo el canal del repetidor, el bot publica el mensaje en el hilo y lo mantiene al final a medida que los miembros responden.
- **Modo solo hilos**: el repetidor nunca publica en el canal padre, solo en hilos. Obligatorio cuando el destino es un canal de foro.
- **Filtros de etiquetas de foro**: las etiquetas obligatorias y excluidas deciden qué publicaciones del foro reciben el mensaje fijo.

## Marcadores

El mensaje pasa por el conjunto general de marcadores. Los marcadores de usuario se refieren al propio bot, ya que nadie dispara un repetidor. Algunos útiles:

| Marcador | Valor |
| --- | --- |
| `%server%`, `%server.name%` | Nombre del servidor |
| `%server.members%` | Número de miembros en caché |
| `%server.id%`, `%server.icon%` | ID del servidor y URL del icono |
| `%channel%`, `%channel.name%` | Mención y nombre del canal del repetidor |
| `%bot.name%`, `%bot.avatar%` | Nombre y avatar del bot |
| `%server.time%`, `%time.day%` | Hora del servidor y día de la semana actual |

También se sustituyen los marcadores de GIFs de reacción como `%huggif%`. Los marcadores de activación como `%user%` se resuelven como el bot.

## Ajustes

La página de Repetidores tiene tres pestañas: **Resumen**, **Gestionar repetidores** y **Crear nuevo**.

| Ajuste | Predeterminado | Qué controla |
| --- | --- | --- |
| Canal de destino | ninguno | Canal de texto o de foro donde publicar |
| Filtros de etiquetas de foro | ninguno | Etiquetas obligatorias y excluidas, solo canales de foro |
| Contenido del mensaje | ninguno | Abre el constructor de embeds |
| Modo de activación | Intervalo de tiempo | Uno de los cinco modos |
| Repetir cada | 5 minutos | Preajustes desde 1 minuto hasta diario, o un `HH:MM:SS` personalizado |
| No repetir si el mensaje ya es el último del canal | desactivado | Comprobación de redundancia |
| Permitir menciones a @everyone y @here | desactivado | Conserva las menciones masivas del mensaje en lugar de neutralizarlas |
| Prioridad (0-100) | 50 | El valor de prioridad que se muestra en la lista |
| Posición en la cola | 0 | Valor de orden guardado |
| Hora de inicio (HH:MM) | ninguna | Hora del día con la que alinear un repetidor de Intervalo de tiempo |
| Detección de conversación | desactivado | Retrasa mientras la gente conversa |
| Suprimir notificaciones | desactivado | Envía en silencio |
| Crear automáticamente en hilos nuevos | desactivado | Mensaje fijo en hilos, solo canales de foro |
| Modo solo hilos | desactivado | Omite el canal padre, solo canales de foro |
| Eliminar automáticamente tras (días) | ninguno | Antigüedad máxima como `d.hh:mm:ss`, por ejemplo `7.00:00:00` |
| Máx. de publicaciones | ilimitado | Número de publicaciones antes de eliminarse |
| Horario (opcional) | ninguno | Botones de preajuste u horario personalizado |
| Umbral de actividad / Mensajes necesarios | 5 | Mensajes para los modos de actividad |
| Ventana de tiempo | 00:05:00 | Ventana para los modos de actividad |

**Resumen** muestra los totales, el número de activos, el total de publicaciones, un desglose por modo de activación y los repetidores más activos. **Gestionar repetidores** lista cada uno con **Editar**, **Activar ahora** y **Eliminar**, además de una edición rápida del intervalo, el umbral, la antigüedad máxima y el máximo de activaciones.

## Guía de configuración

1. Abre **Repetidores** en el panel y elige **Crear nuevo**.
2. Elige el **Canal de destino**. Para un foro, marca **Modo solo hilos** y establece los **Filtros de etiquetas de foro** que necesites.
3. Haz clic en el cuadro **Contenido del mensaje** y crea el mensaje en el constructor de embeds.
4. Elige un **Modo de activación**. Para un mensaje fijo, elige Inmediato; para un recordatorio, Intervalo de tiempo con un preajuste de **Repetir cada**.
5. Abre **Opciones avanzadas** si quieres redundancia, envío silencioso, un horario o una caducidad.
6. Haz clic en **Crear repetidor** y luego usa **Activar ahora** en la pestaña Gestionar para probarlo.

> [!NOTE]
> Los horarios necesitan una zona horaria del servidor. Establécela con el comando de zona horaria antes de activar las ventanas de horario laboral, tarde-noche o fin de semana.

## Comandos

Ejecútalos con el prefijo de tu servidor (`.` salvo que lo hayas cambiado). Todos requieren Gestionar mensajes. Los repetidores se identifican por su número de `repeatlist`.

| Comando | Alias | Requiere | Para qué sirve |
| --- | --- | --- | --- |
| `repeat [time] [interval] <message>` | | Gestionar mensajes | Crea un repetidor en el canal actual, por ejemplo `repeat 6h Read the rules` o `repeat 18:00 Event tonight` |
| `repeatlist` | `replst`, `replist`, `repli` | Gestionar mensajes | Lista los repetidores con canal, modo, intervalo y próxima ejecución |
| `repeatinvoke <index>` | `repinv` | Gestionar mensajes | Dispara un repetidor ahora y reinicia su temporizador |
| `repeatremove <index>` | `reprm` | Gestionar mensajes | Elimina un repetidor |
| `repeattoggle <index>` | `reptoggle`, `reptog` | Gestionar mensajes | Activa o desactiva sin eliminar |
| `repeatmessage <index> <message>` | `repmsg` | Gestionar mensajes | Sustituye el mensaje |
| `repeatchannel <index> [#channel]` | `repchan` | Gestionar mensajes | Lo mueve a un canal de texto o de foro |
| `repeatredundant <index>` | `repeatredun`, `repred` | Gestionar mensajes | Activa o desactiva la comprobación de redundancia |
| `repeattriggermode <index> <mode>` | `reptriggermode`, `repmode` | Gestionar mensajes | `timeinterval`, `immediate`, `aftermessages`, `onactivity` u `onnoactivity` |
| `repeatactivity <index> <threshold> <window>` | `repactivity`, `repact` | Gestionar mensajes | Establece el umbral y la ventana de actividad, por ejemplo `10 5m` |
| `repeatpriority <index> <0-100>` | `reppriority`, `repprio` | Gestionar mensajes | Establece el valor de prioridad |
| `repeatschedule <index> <preset>` | `repschedule`, `repsched` | Gestionar mensajes | `business`, `evening`, `weekend` o `none` para quitarlo |
| `repeatconversation <index>` | `repconversation`, `repconv` | Gestionar mensajes | Activa o desactiva la detección de conversación |
| `repeatsuppressnotifications <index>` | `repsuppressnotif`, `repsilent`, `repsuppress` | Gestionar mensajes | Activa o desactiva el envío silencioso |
| `repeatthreadautosticky <index>` | `repthreadauto`, `repthreads` | Gestionar mensajes | Activa o desactiva la publicación en hilos nuevos |
| `repeatthreadonly <index>` | `repthreadonly`, `reptonly` | Gestionar mensajes | Activa o desactiva el modo solo hilos |
| `repeatforumtags <index> <add/remove/clear/list> [required/excluded] [tags]` | `repforumtags`, `repftags` | Gestionar mensajes | Gestiona los filtros de etiquetas de foro por ID de etiqueta |

## Consejos y trampas habituales

- El bot necesita Enviar mensajes, Insertar enlaces y Gestionar mensajes en el canal, porque elimina su copia anterior antes de volver a publicar.
- Si se elimina el canal o el bot pierde el acceso, el repetidor se elimina solo.
- Los repetidores se cargan poco después de que arranque el bot. Los comandos no hacen nada, sin avisar, hasta que termina.
- El modo Inmediato vuelve a publicar con cada mensaje de otra persona, así que evítalo en canales muy rápidos o combínalo con la Detección de conversación.
- Solo un miembro con Mencionar a todos puede crear un repetidor que mencione a todos o a un rol; si no, la mención se escapa.
- Los modos basados en actividad dependen del conteo de mensajes. Actívalo antes de cambiar de modo o el comando lo rechaza.
- La caducidad por Máx. de publicaciones cuenta todas las publicaciones, incluidas las que activas a mano.
