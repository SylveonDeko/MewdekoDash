---
title: Paneles en vivo
slug: liveboards
summary: Fija una clasificación, un gráfico o un resumen en un canal y deja que el bot lo edite continuamente, y publica un resumen del día, la semana o el mes según una programación.
icon: fa-thumbtack
category: Community
dashboard: /dashboard/liveboards
module: ServerStats
tags: [live boards, pinned leaderboard, pin leaderboard, auto updating, server report, weekly report, monthly report, digest, growth report, paneles en vivo, clasificación fijada, actualización automática, informe del servidor, informe semanal, informe mensual, resumen, informe de crecimiento]
related: [serverstats, invites, statchannels, statroles]
---

## Qué hace

Un panel en vivo es un mensaje que el bot publica una vez, lo fija y luego edita a intervalos para que siempre muestre cifras actuales. Un informe del servidor es un embed único con un gráfico de crecimiento que se publica a diario, semanal o mensualmente y resume lo ocurrido desde el anterior.

## Paneles

| Panel | Muestra |
| --- | --- |
| Clasificación de invitaciones | Principales invitadores con sus recuentos de regulares, salidas y falsos |
| Clasificación de mensajes | Principales charlatanes |
| Clasificación de voz | Miembros con más tiempo en voz |
| Juegos principales | Los juegos y apps más jugados con el número de jugadores (necesita el seguimiento de juegos) |
| Gráfico de entradas, Gráfico de salidas, Gráfico de crecimiento | Entradas y salidas por día |
| Gráfico de miembros | Número de miembros a partir de las instantáneas por hora |
| Gráfico de mensajes | Mensajes por día |
| Resumen del servidor | El mismo resumen que `serveractivity` |
| Analíticas de invitaciones | Entradas, salidas, retención, entradas falsas y fuentes |

Cada panel tiene un **periodo** (último día, semana, mes o todo el tiempo; los gráficos usan hasta 90 días para todo el tiempo), un intervalo de actualización de al menos 5 minutos, un número de filas para las clasificaciones y un interruptor de fijado. Un servidor puede tener hasta 10 paneles. Eliminar un panel elimina su mensaje. Si alguien elimina el mensaje a mano, el bot publica uno nuevo en la siguiente actualización.

## Informes del servidor

Establece un canal y una frecuencia, y el bot publica un informe la primera vez que llega la programación, y luego a diario a las 00:00 UTC, semanalmente los lunes, o el día 1 de cada mes. Un informe contiene:

- Entradas, salidas, crecimiento neto y retención del periodo
- Mensajes, tiempo de voz y miembros activos
- Número de miembros y cómo cambió
- Principales invitadores, charlatanes, miembros en voz y canales más activos
- Principales códigos de invitación con sus etiquetas, y juegos principales cuando el seguimiento de juegos está activado
- Un gráfico de entradas y salidas

**Enviar un informe ahora** publica uno de inmediato sin cambiar la programación. Los informes se desactivan solos si el bot pierde el permiso para publicar en el canal.

## Comandos

Ejecuta estos comandos con el prefijo de tu servidor (`.` a menos que lo hayas cambiado). Los paneles también están bajo `/liveboard`, y los informes bajo `/serverreport`.

| Comando | Alias | Requiere | Función |
| --- | --- | --- | --- |
| `liveboardadd <#channel> <board> [range] [rows] [minutes]` | `pinboard`, `pinleaderboard` | Gestionar servidor | Publica y fija un panel |
| `liveboardlist` | `liveboards` | Gestionar servidor | Todos los paneles |
| `liveboardremove <id>` | `unpinboard` | Gestionar servidor | Elimina un panel y su mensaje |
| `liveboardrefresh` | | Gestionar servidor | Actualiza todos los paneles ahora |
| `serverreportchannel [#channel]` | `reportchannel` | Gestionar servidor | Establece el canal de informes y activa los informes, o los desactiva |
| `serverreportfrequency <Daily/Weekly/Monthly>` | `reportfrequency` | Gestionar servidor | Con qué frecuencia se publican los informes |
| `serverreportnow [frequency]` | `reportnow` | Gestionar servidor | Publica un informe en el canal actual |

## Consejos y advertencias

- Fijar necesita el permiso Gestionar mensajes en el canal. Sin él, el panel se publica igualmente, pero no fijado.
- Los paneles editan siempre el mismo mensaje, así que un panel en un canal muy activo se pierde de vista; ponlos en un canal de estadísticas dedicado o confía en el fijado.
- Las clasificaciones respetan las exclusiones de invitaciones y actividad, así que los miembros ocultos o ignorados nunca aparecen en un panel fijado.
- Los canales de estadísticas son la otra forma de mostrar cifras en vivo: un contador en el nombre de un canal en lugar de un mensaje.
