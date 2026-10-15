---
title: Analíticas
slug: analytics
summary: Una página del panel solo para el propietario del bot con el historial guardado de comandos, eventos del gateway, latencia, errores, crecimiento de servidores, adopción de funciones, uso de IA y música, tráfico del sitio web y reglas de alerta por webhook.
icon: fa-chart-simple
category: Analytics
dashboard: /owner/analytics
tags: [analytics, metrics, telemetry, commands, events, latency, errors, growth, alerts, shards, owner, analíticas, métricas, telemetría, comandos, eventos, latencia, errores, crecimiento, alertas, propietario]
related: [performance, leave-feedback, administration]
---

## Qué hace

Analíticas es la página de historial para quien gestiona el bot. Solo la ven los propietarios del bot: la barra lateral la oculta a todos los demás, y abrir la URL directamente devuelve a quienes no son propietarios al inicio del panel. No hay nada aquí que el staff del servidor tenga que configurar.

Mientras que [Rendimiento](/wiki/performance) muestra el proceso en vivo y lo olvida al reiniciar, Analíticas lee lo que el bot ha escrito en su propia base de datos. Cada instancia en ejecución registra comandos, eventos del gateway, latencia de shards, llamadas REST, tiempos de base de datos, indicadores del proceso, excepciones, uso de funciones, actividad de IA y música, y visitas a páginas del panel. Los números se agregan en memoria por minuto, se vuelcan cada minuto, se pliegan en intervalos de 5 minutos y de una hora, y se purgan según un calendario fijo, así que puedes mirar la semana pasada, compararla con la anterior y filtrar por instancia, shard o servidor.

Se puede publicar un resumen semanal en un webhook de Discord, y las reglas de alerta sobre cualquier métrica guardada avisan a un webhook cuando se cruza un umbral.

## Por qué usarlo

- Quieres saber si un pico de errores empezó antes o después de un despliegue, no solo qué está fallando ahora mismo.
- Un servidor informa de que el bot va lento y quieres su latencia de comandos, su actividad y sus eventos de seguridad en un rango de fechas.
- Quieres ver qué funciones configuran y usan realmente los servidores, y cómo cambió eso a lo largo de los meses.
- Necesitas un aviso de Discord cuando la latencia de los shards, la tasa de errores o los 429 de REST pasen de un límite, sin tener que vigilar una página.
- Quieres un resumen de los lunes sobre crecimiento, comandos, errores y funciones principales en un canal.

## Pestañas

| Pestaña | Qué muestra |
| --- | --- |
| Resumen | Tarjetas de **Servidores**, **Usuarios**, **Comandos / min**, **Eventos de gateway**, **Sol. REST / s**, **Errores no controlados** (con desglose en grupos de excepciones), **Peor latencia de shard** y **Reproductores de música**; latencia de shards con bandas de alerta; alertas que se están disparando; comandos y eventos de gateway por segundo según tipo; instantáneas diarias de servidores; tasa REST; memoria del proceso |
| Comandos | Selectores de tipo, módulo y resultado; **Invocaciones**, **Errores**, **Duración p95** y **p50**; invocaciones por módulo; errores por clase; duración p50, p95, p99; invocaciones por tipo; un mapa de calor de hora UTC por tamaño del servidor; **Comandos más usados**, un **Registro de invocaciones** paginado y **Comandos con más fallos**, donde una fila abre sus muestras de errores recientes |
| Eventos | Eventos de gateway por segundo según tipo; total en el rango y una tabla por tipo; eventos por shard; p95 de handlers por tipo; errores de handlers por módulo y por tipo de evento |
| Latencia | **p95 de REST**, **REST 5xx**, **REST 429**, **Límites de tasa alcanzados**, **p95 de BD**, **Errores de BD**, **Reconexiones de shards**, **Errores no controlados**; latencia y tasa REST por ruta; límites de tasa alcanzados por ruta; p95 y errores de base de datos por operación; CPU, RSS, hilos y GC de gen. 2; una tabla por shard con estado, latencia, pico, servidores y reconexiones; grupos de excepciones no controladas, donde una fila abre sus apariciones; errores por tipo |
| Servidores | **Servidores**, **Usuarios**, **Entradas**, **Salidas**, **Neto**; instantáneas de servidores y usuarios de 30 días; entradas y salidas por día; abandono con tasa de rebote y entradas y salidas por tamaño; retención por día de entrada; entradas por tamaño; tablas **Servidores rebotados** y **Se quedaron en silencio**, donde una fila abre la ficha del servidor |
| Servidores (por servidor) | Selector de tipo de evento y un mínimo de eventos por hora; un id de servidor abre la **Ficha del servidor**, un mapa de calor de actividad por tipo y hora, y un registro paginado y filtrable de **Eventos de seguridad**; **Servidores con más eventos**; **Actividad inusual** puntuada frente a la misma hora de los 14 días anteriores |
| Funciones | **Adopción de funciones** con los recuentos de configuradas y activadas del censo nocturno, servidores activos, actividad y tasa de errores; funciones usadas por servidor; tamaño del servidor frente a funciones usadas; para la función seleccionada, **Uso de ajustes** del último censo y una serie de censo configurado o activado en 90, 180 o 365 días |
| IA | **Solicitudes**, **Tokens de entrada**, **Tokens de salida**, **Coste est.** a precios de lista para modelos con precio; una tabla por modelo con fallos, tokens, p95 y coste; solicitudes, tokens y p95 por modelo; servidores principales por uso del chat de IA |
| Música | **Reproductores**, **Pistas iniciadas**, **Errores**; reproductores por nodo; pistas iniciadas por fuente; errores por tipo; estado de los nodos; pistas finalizadas por motivo |
| Sitio web | **Visitas a páginas**, **Visitantes**, **p95 de solicitudes**, **5xx**; vistas por ruta; duración de las solicitudes; una tabla por ruta con visitantes, p95 y 5xx; 4xx y 5xx por ruta; un embudo de inicio de sesión a callback de OAuth a panel con abandono |
| Alertas | Grupos disparados; la tabla de reglas con activar, probar, silenciar 1 hora y eliminar; un registro paginado de eventos de transiciones de estado con el valor frente al umbral y si se envió un webhook; **Nueva regla** y **Enviar resumen ahora** |
| Pipeline | Una etiqueta de estado; **Último volcado**, **Último agregado**, **Último mantenimiento**, **Series pendientes**, **Filas pendientes**; el último error de volcado, si lo hay; recuentos de filas y fila más reciente por tabla; instancias registradas con latido y último recuento de servidores; duración del volcado y filas por volcado |

El estado del Pipeline es `healthy` cuando el último volcado tiene como máximo 60 segundos, el último agregado como máximo 10 minutos y no hay error de volcado; `flush stale` y `rollup stale` en caso contrario, `error` cuando un volcado falló y `disabled` cuando las analíticas están desactivadas en la configuración del bot. Una instancia cuyo último recuento de servidores tenga más de 3 minutos se marca en amarillo, y en rojo si tiene más de 10 minutos.

> [!NOTE]
> Todo está en UTC. Las instantáneas, las filas del censo y los totales diarios se escriben una vez por noche, así que las pestañas Servidores y Funciones están vacías hasta que el bot haya estado funcionando pasadas las 00:05 UTC al menos una vez.

### Barra de filtros

La barra situada sobre las pestañas se aplica a todas ellas y se mantiene en la URL, así que cambiar de pestaña, recargar o compartir el enlace conserva la misma vista.

| Control | Qué hace |
| --- | --- |
| Rango | `15m`, `1h`, `6h`, `24h`, `7d`, `30d`, o un inicio y fin UTC personalizados de hasta 31 días |
| comparar | Superpone el mismo ancho un periodo antes en los gráficos y tarjetas que lo admiten |
| Bot | Una instancia, tomada de las instancias que conoce el pipeline, o todas |
| Shard | Un id de shard o todos |
| id del servidor | Limita las tablas sin procesar y las vistas de servidor a un servidor; pulsa Intro para aplicar |
| Actualizar | Todo se recarga cada 30 segundos mientras la pestaña es visible; el botón lo fuerza |
| Copiar enlace | Copia la URL actual con todos los filtros |

Las tarjetas abren un desglose con detalles de su métrica. Los gráficos pueden plegar las series más pequeñas en **Otro**, alternar un total acumulado, ampliarse con los controles deslizantes de rango y aislar una serie con clic derecho en su entrada de la leyenda.

## Ajustes

La página en sí no tiene ajustes. Las reglas de alerta y tres claves de configuración del bot son todo lo que se puede configurar.

### Reglas de alerta

Cada regla vigila una métrica. Los campos del editor son:

| Campo | Significado |
| --- | --- |
| Nombre, Descripción, Gravedad, activada | Etiqueta y `info`, `warning` o `critical`, que define el color y el título del webhook |
| Métrica, Filtros, Agrupar por | Cualquier métrica guardada, filtros de etiquetas opcionales y una etiqueta opcional para evaluar cada valor por separado, por ejemplo por `shard` |
| Agr., Ventana | `sum`, `avg`, `min`, `max`, `last`, `rate`, `count`, `p50`, `p95` o `p99` en un rango de 1 minuto a 1 día |
| Comparador, Umbral, Alto | `gt`, `gte`, `lt`, `lte`, `outside` (por debajo del Umbral o por encima de Alto), `pct_change` (porcentaje frente a la misma ventana una línea base antes), `deviates` (puntuación z frente a la media de los últimos N días), `nodata` (nada reportado en la ventana) |
| Línea base, Dirección | Para `pct_change` y `deviates`: ayer o la semana pasada, y `up`, `down` o `both` |
| Durante | Cuánto tiempo debe mantenerse la infracción antes de que se dispare la regla; `immediately` omite el estado pendiente |
| Enfriamiento | Intervalo mínimo entre notificaciones de disparo |
| Repetir | Volver a notificar mientras siga disparada, o una sola vez |
| Mín. de muestras | Omite la evaluación cuando la ventana contiene menos muestras que esto |
| URL del webhook, ID del rol a mencionar, ID del hilo | Un webhook de Discord, un rol opcional al que mencionar al dispararse y un hilo opcional en el que publicar |
| Silencio desde, Silencio hasta | Una ventana UTC, que puede cruzar la medianoche, en la que no se envía nada |
| avisar al resolverse | Publica también cuando el grupo vuelve a la normalidad |

El gráfico de vista previa de la derecha dibuja el umbral del borrador como una banda discontinua para los comparadores absolutos.

Las reglas se evalúan cada minuto. Cada grupo pasa de `ok` a `pending` (solo cuando Durante está definido) a `firing`, y de vuelta a `ok`; el registro de eventos anota la transición de `firing` a `ok` como `resolved`. Silenciar desde la tabla silencia una regla durante 1 hora; la API permite hasta 30 días. Las reglas silenciadas y las ventanas de silencio siguen cambiando de estado, solo que no publican. **Enviar prueba** publica un mensaje de prueba en el webhook de la regla.

### Claves de configuración del bot

Defínelas en `bot.yml` o con el comando `config` del propietario. Por defecto están en activado, 30 y vacío.

| Clave | Significado |
| --- | --- |
| `analyticsEnabled` | `false` convierte el recolector en una operación vacía; la pestaña Pipeline muestra `disabled` |
| `analyticsRetentionDays` | Días que se conservan las filas de comandos sin procesar, las visitas a páginas y el registro de eventos de servidores |
| `analyticsDigestWebhook` | Webhook de Discord en el que se publica el resumen semanal; vacío desactiva el resumen |

### Qué se conserva y durante cuánto tiempo

| Datos | Conservación |
| --- | --- |
| Intervalos de 1 minuto | 48 horas |
| Intervalos de 5 minutos | 14 días |
| Intervalos de 1 hora | 400 días |
| Invocaciones de comandos, visitas a páginas, eventos de seguridad de servidores | `analyticsRetentionDays` |
| Muestras de errores, actividad horaria de funciones y eventos por servidor | 90 días |
| Eventos de alertas | 180 días |
| Instantáneas diarias, censo, totales diarios | No se purgan |

Las filas sin procesar se vuelcan cada 15 segundos, los intervalos de minuto cada minuto; los intervalos de 1 minuto se pliegan en los de 5 minutos cada 5 minutos y los de 5 minutos en los de una hora, y la purga se ejecuta cada 6 horas.

### Qué nunca se guarda

- El contenido de los mensajes. Las filas de comandos contienen el nombre del comando, el módulo, el tipo, el resultado, los tiempos y, en caso de fallo, la clase de la excepción y hasta 200 caracteres de su mensaje.
- Los ids de usuario. Nada en las analíticas está indexado por quién ejecutó un comando.
- Las IP de los clientes. Las visitas a páginas guardan un hash del visitante con la IP y el user agent y una sal que rota a diario, de modo que no se puede seguir a un visitante de un día a otro. Las solicitudes a `/api/`, `/cdn/`, los recursos estáticos y la propia página de Analíticas no se registran.

Se respetan los servidores y usuarios que se excluyeron de las estadísticas: su comando sigue contando en el agregado, pero la fila sin procesar se escribe sin el id ni el tamaño del servidor.

## Guía de configuración

1. Inicia sesión en el panel con una cuenta de propietario del bot y abre **Analíticas** desde la barra lateral. Solo aparece para los propietarios.
2. Abre **Pipeline** primero. La etiqueta debería decir `healthy` y cada instancia debería tener un latido reciente; un volcado atrasado significa que el bot no está escribiendo.
3. Elige un rango y, si ejecutas más de una instancia, un bot en la barra de filtros. Marca **comparar** para ver el periodo anterior.
4. Ve a **Alertas**, pulsa **Nueva regla**, elige una métrica como `shard.latency` con `max` en 5 minutos, `gt` tu límite, agrupa por `shard`, pega un webhook y pulsa **Enviar prueba** en la fila guardada.
5. Define `analyticsDigestWebhook` en la configuración del bot y luego pulsa **Enviar resumen ahora** para ver cómo será la publicación del lunes.
6. Vuelve tras una noche para ver **Servidores**, **Funciones** y las series del censo.

## Comandos

La página de Analíticas es solo del panel; no hay un módulo del bot equivalente. El comando `config` del propietario cambia las tres claves anteriores, y algunos comandos de propietario cubren terreno relacionado en el chat. Ejecútalos con el prefijo de tu servidor (`.` salvo que lo hayas cambiado).

| Comando | Alias | Requiere | Para qué sirve |
| --- | --- | --- | --- |
| `config bot analyticsEnabled false` | `conf` | Propietario del bot | Dejar de registrar analíticas; `true` vuelve a empezar |
| `config bot analyticsRetentionDays 14` | `conf` | Propietario del bot | Cambiar cuánto tiempo se conservan las filas sin procesar |
| `config bot analyticsDigestWebhook <url>` | `conf` | Propietario del bot | Dónde va el resumen del lunes |
| `stats` | | Nadie | Versión del bot, comandos ejecutados cada cinco segundos, memoria, recuentos de caché, shard y tiempo en línea |
| `commandstats` | `cstats` | Propietario del bot | Comando, módulo, servidor y usuario más usados |
| `shardstats` | | Propietario del bot | Estado de cada shard |

## Consejos y advertencias

- La página comprueba la propiedad a través del bot, así que una cuenta que es propietaria en una instancia del bot pero no en otra será redirigida en la segunda.
- El resumen se envía los lunes a partir de las 09:00 UTC y cubre los siete días anteriores frente a los siete previos: servidores, comandos, errores, eventos, servidores nuevos y perdidos, visitas a páginas, tokens de IA, pistas de música, además de los cinco comandos, errores y funciones principales.
- Las series de rangos largos provienen de intervalos de una hora, así que los percentiles se suavizan; reduce el rango para ver el detalle por minuto, que solo existe para las últimas 48 horas.
- Si el búfer en memoria del recolector se llena antes de un volcado, se descartan las filas de comandos sin procesar sobrantes de ese intervalo mientras los agregados siguen contando; una cifra creciente de **Filas pendientes** en Pipeline es la señal.
- Las reglas de alerta necesitan la URL de un webhook de Discord; cualquier otra cosa se rechaza al guardar.
- El coste estimado de la IA solo cubre los modelos con un precio de lista conocido, así que el total es un mínimo.
