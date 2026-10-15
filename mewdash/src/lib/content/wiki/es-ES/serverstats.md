---
title: Estadísticas de actividad
slug: serverstats
summary: Mensajes, tiempo en voz, juegos y crecimiento de miembros de todo el servidor, de un miembro o de un canal en cualquier periodo de hasta noventa días, con gráficos, clasificaciones, exportaciones y opción de exclusión por privacidad.
icon: fa-chart-simple
category: Analytics
dashboard: /dashboard/serverstats
module: ServerStats
tags: [activity, stats, statistics, statbot, voice time, games, presence, lookback, top chatters, charts, member growth, status, snapshots, privacy, opt out, actividad, estadísticas, tiempo en voz, juegos, presencia, periodo, mejores chatters, gráficos, crecimiento de miembros, estado, instantáneas, privacidad, exclusión]
related: [messagestats, statroles, liveboards, statchannels, invites]
---

## Qué hace

El bot ya contaba los mensajes. Estadísticas de actividad añade el tiempo en voz, los juegos y aplicaciones, instantáneas por hora de miembros y estados, y una forma de consultar cualquiera de estos datos en un periodo: el último día, la última semana, el último mes, hasta noventa días o desde siempre. Todo está disponible en el panel, como comandos, como gráficos, como CSV y para roles de estadísticas, tableros en vivo, informes y canales de estadísticas.

## Qué se registra

| Datos | Cómo |
| --- | --- |
| Mensajes | Cada mensaje contado con su marca de tiempo, guardado durante noventa días, más los totales históricos por miembro y canal |
| Tiempo en voz | Un segmento por miembro y canal, que se divide cada vez que se mueve, se silencia, se ensordece, empieza a transmitir o activa la cámara; guardado durante noventa días, más los totales históricos |
| Juegos y aplicaciones | Un segmento por miembro y actividad (jugando, transmitiendo, escuchando, viendo, compitiendo), guardado durante noventa días, más los totales históricos. Desactivado por defecto |
| Instantáneas | Recuentos de miembros, humanos, bots, en línea, inactivos, No molestar, desconectados y en voz cada hora, guardados durante noventa días |
| Entradas y salidas | Cada entrada y salida con su marca de tiempo |

Los periodos de hasta noventa días leen los datos con marca de tiempo. **Todo el tiempo** lee los totales históricos, así que sigue funcionando cuando los datos de noventa días ya han caducado.

## Juegos y aplicaciones

El seguimiento de juegos está desactivado hasta que lo actives, porque es el que más recursos consume. Una vez activado, el bot observa la presencia de cada miembro y registra cuánto dura cada juego, transmisión, sesión de Spotify o aplicación vista.

- **Verificar actividades** (activado por defecto) solo cuenta las actividades que Discord certifica: las que tienen un ID de aplicación registrado, Spotify y las transmisiones. Un cliente modificado puede decir que está jugando a cualquier cosa, así que mientras esto esté activo se ignoran las actividades con nombre sin verificar.
- El **filtro de actividades** es una lista de nombres de juegos que funciona como **lista negra** (los juegos listados se ignoran) o como **lista blanca** (solo cuentan los juegos listados).
- Los estados personalizados nunca se cuentan.

## Pestañas del panel

| Pestaña | Qué muestra |
| --- | --- |
| Resumen | Mensajes, tiempo en voz, chatters, entradas, salidas, crecimiento neto, miembros ahora, el mejor chatter, el miembro con más tiempo en voz, el canal más activo y el juego más jugado, además de gráficos de mensajes, horas de voz, miembros, estado de los miembros y entradas y salidas |
| Clasificaciones | Miembros y canales ordenados por mensajes, tiempo en voz o tiempo de juego, y los juegos más jugados con el número de jugadores, exportable en CSV. Haz clic en un miembro, canal o juego para abrirlo |
| Miembro y canal | Los mensajes, el tiempo en voz, las posiciones, los totales históricos, los canales y juegos favoritos de un miembro; la actividad de un canal y sus miembros más activos; y **Quién juega** para cualquier juego |
| Ajustes | Cada rastreador, el periodo predeterminado, la espera entre mensajes, los bots, los estados de voz que no cuentan, los canales ignorados, los roles y miembros, y el filtro de actividades |

## Ajustes

| Ajuste | Predeterminado | Qué controla |
| --- | --- | --- |
| Periodo predeterminado | 14 días | Lo que usan los comandos y la página cuando no se indica un periodo |
| Espera entre mensajes | 0 | Segundos entre mensajes contados de un mismo miembro. Evita que el spam infle los recuentos |
| Registrar tiempo en voz | activado | Si se registran los segmentos de voz |
| Instantáneas por hora | activado | Si se muestrean cada hora los recuentos de miembros y estados |
| Contar bots | desactivado | Si se incluyen las cuentas de bots |
| Registrar juegos y aplicaciones | desactivado | Si se registran las actividades de presencia |
| Verificar actividades | activado | Contar solo las actividades certificadas por Discord |
| Estados de voz que no cuentan | ninguno | Cualquiera de: silenciado por ti, ensordecido por ti, silenciado en el servidor, ensordecido en el servidor, canal AFK, solo, transmitiendo, cámara activada |
| Canales, roles y miembros ignorados | ninguno | Nada de lo que haya en estos se cuenta |

## Privacidad

Cualquier miembro puede ejecutar `statsprivacy` (o `/serverstats privacy`) para excluirse. Sus mensajes, tiempo en voz y tiempo de juego registrados se eliminan en todos los servidores que comparte con el bot, y no se registra nada nuevo hasta que vuelva a ejecutarlo para volver a participar. Los administradores del servidor no pueden anularlo.

## Comandos

Usa estos comandos con el prefijo de tu servidor (`.` a menos que lo hayas cambiado). Todos los comandos también existen bajo `/serverstats`. `days` es el periodo; 0 significa todo el tiempo y si lo omites se usa el predeterminado del servidor.

| Comando | Alias | Requiere | Función |
| --- | --- | --- | --- |
| `serveractivity [days]` | `sstats` | Nadie | El resumen del servidor |
| `useractivity [@user] [days]` | `ustats`, `mystats` | Nadie | Los mensajes, el tiempo en voz, las posiciones, los totales históricos, los canales principales y los juegos de un miembro |
| `channelactivity [#channel] [days]` | `cstats` | Nadie | La actividad de un canal y sus miembros más activos |
| `activitytop [Messages/Voice/Activity] [days] [@role]` | `topchatters`, `topvoice` | Nadie | Clasificar miembros |
| `activitytopchannels [Messages/Voice] [days]` | `topchannels` | Nadie | Clasificar canales |
| `topgames [days]` | `games` | Nadie | Los juegos y aplicaciones más jugados |
| `whoplays <game>` | | Nadie | Quién está jugando a un juego ahora mismo y quién lo ha jugado más |
| `activitychart [Messages/Voice/Members/Status/Joins/Leaves/Growth/InVoice/Activities] [days]` | `graph` | Nadie | Una imagen de gráfico |
| `activityexport [Messages/Voice/Activity] [days]` | | Gestionar servidor | Una clasificación en CSV |
| `statssettings` | | Gestionar servidor | Mostrar los ajustes |
| `statslookback <days>`, `statscooldown <seconds>` | `lookback` | Gestionar servidor | Periodo predeterminado y espera entre mensajes |
| `statstrackvoice`, `statstracksnapshots`, `statscountbots`, `statstrackactivities`, `statsverifyactivities` | `trackvoice`, `trackgames` | Gestionar servidor | Activar o desactivar cada rastreador |
| `statsignorevoicestate <state>` | | Gestionar servidor | Activar o desactivar si un estado de voz cuenta |
| `statsignore <#channel, @role or @user>`, `statsignored` | | Gestionar servidor | Exclusiones |
| `statsactivityfiltermode <Whitelist/Blacklist>`, `statsactivityfilter <game>`, `statsactivityfilters` | `gamefilter` | Gestionar servidor | El filtro de actividades |
| `statsprivacy` | `optoutstats` | Nadie | Excluirse de o volver a participar en el registro en todas partes |

## Consejos y trampas

- Los gráficos de miembros y estados empiezan a llenarse una hora después de activar las instantáneas; no hay historial anterior a eso.
- El tiempo en voz solo se cuenta mientras el bot está en funcionamiento. Un reinicio cierra y vuelve a abrir cada sesión, así que no se pierde nada, pero los límites de los segmentos cambian.
- Excluir un canal oculta su historial en todas las consultas, además de dejar de contar nuevos mensajes, así que los números antiguos también cambian.
- El recuento de mensajes tiene que estar activado (el interruptor de la página Estadísticas de mensajes) para que aparezcan aquí los números de mensajes.
- Los nombres de juegos no distinguen mayúsculas en el filtro ni en `whoplays`.
