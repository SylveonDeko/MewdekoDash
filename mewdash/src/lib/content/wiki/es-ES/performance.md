---
title: Rendimiento
slug: performance
summary: Página del panel solo para propietarios del bot que muestra la CPU, la memoria, el tiempo activo, los métodos más lentos y cuántos eventos de Discord procesa y en cuántos falla cada módulo.
icon: fa-clock
category: Analytics
dashboard: /owner/performance
tags: [performance, metrics, cpu, memory, latency, monitoring, uptime, events, modules, owner, rendimiento, métricas, cpu, memoria, latencia, monitorización, tiempo activo, eventos, módulos, propietario]
related: [analytics, leave-feedback, administration]
---

## Qué hace

Rendimiento es una página de monitorización para quien ejecuta el bot. Solo es visible para los propietarios del bot: la barra lateral lo oculta para todos los demás, y abrir la URL directamente envía a los no propietarios al inicio del panel. No hay nada aquí que el staff del servidor pueda configurar.

La página lee cifras en vivo del proceso del bot en ejecución. Una pestaña muestra los recursos del sistema, otra enumera los métodos que más tiempo de CPU consumen, y dos desglosan el manejo de eventos de Discord por tipo de evento y por módulo del bot, cada uno con recuentos, tiempo medio de ejecución y tasa de errores. Todo se actualiza solo mientras la página está abierta.

Las cifras de eventos y módulos provienen del manejador interno de eventos del bot, que registra cada evento de gateway que despacha. Los tiempos de los métodos provienen del monitor de rendimiento que envuelve los métodos rastreados. Ambos existen solo en memoria, así que se reinician cuando el bot se reinicia, y las métricas de eventos se reinician solas cada hora. Para el historial guardado de las mismas cifras, usa [Analíticas](/wiki/analytics).

## Por qué usarlo

- El bot va lento y quieres ver si la causa es la CPU, la memoria o un método lento concreto.
- Un módulo está dando errores y quieres la tasa de errores por módulo sin leer registros.
- Quieres confirmar que la memoria es estable después de un despliegue, observándola durante unos minutos.
- Necesitas el tiempo activo y el número de hilos para una consulta de soporte.

## Pestañas

| Pestaña | Sección | Qué muestra | Actualización |
| --- | --- | --- | --- |
| Resumen | Recursos del sistema | **Uso de CPU**, **Uso de memoria** (usada y total), **Tiempo activo**, **Número de hilos** y **Métodos con más uso de CPU** con su tiempo medio | Cada 5 segundos |
| Métodos | Rendimiento de métodos | Cada método rastreado con **Llamadas**, **Tiempo medio**, **Tiempo total** y **Última ejecución**; ordenable por cualquier columna, con un botón que borra los datos recopilados | Cada 30 segundos |
| Eventos | Métricas de eventos | **Eventos totales**, **Errores totales**, **Tipos de evento** y **Tasa media de errores**, y luego cada tipo de evento de Discord con su número procesado, errores, tiempo de ejecución y tasa de errores | Cada 10 segundos |
| Módulos | Métricas de módulos | **Módulos activos**, **Eventos totales**, **Errores totales** y **Tasa media de errores**, y luego cada módulo con eventos procesados, errores, tiempo de ejecución y tasa de errores | Cada 10 segundos |

El uso de CPU se muestrea durante medio segundo cada vez que se actualiza el Resumen y corresponde solo al proceso del bot, no a toda la máquina. La memoria es el conjunto de trabajo del proceso. La memoria total se lee del host en Windows y Linux, y en otros sistemas aparece como 0.

> [!NOTE]
> La pestaña Métodos está vacía hasta que se hayan ejecutado métodos rastreados. Usa el bot un rato y vuelve.

## Ajustes

No hay ajustes. La única acción es el botón de borrar de la pestaña Métodos, que elimina los tiempos de los métodos. Las métricas de eventos y de módulos no se pueden borrar a mano; se reinician cada hora.

## Guía de configuración

1. Inicia sesión en el panel con una cuenta de propietario del bot.
2. Abre **Rendimiento** desde la barra lateral. Solo aparece para los propietarios.
3. Deja **Resumen** abierto durante un minuto para ver cómo se estabilizan la CPU y la memoria.
4. Cambia a **Módulos** y ordena por errores para encontrar lo que falla, y luego a **Eventos** para ver qué tipos de evento son los más activos.
5. Usa **Métodos** para detectar métodos lentos, y bórralo después de una corrección para volver a medir.

## Comandos

La página de Rendimiento es solo para el panel; no hay un módulo del bot equivalente. Algunos comandos de propietario cubren terreno relacionado en el chat. Ejecútalos con el prefijo de tu servidor (`.` a menos que lo hayas cambiado).

| Comando | Alias | Requiere | Función |
| --- | --- | --- | --- |
| `stats` | | Nadie | Versión del bot, comandos ejecutados por cada cinco segundos, memoria, recuentos de caché, shard y tiempo activo |
| `commandstats` | `cstats` | Propietario del bot | Comando, módulo, servidor y usuario más usados |
| `shardstats` | | Propietario del bot | Estado de cada shard |

## Consejos y advertencias

- La página comprueba la propiedad a través del bot, así que una cuenta que es propietaria en una instancia del bot pero no en otra será redirigida en la segunda.
- Las cifras son por proceso. En un bot con shards repartidos entre varios procesos, ves solo el proceso al que está conectado el panel.
- Nada de lo que aparece en esta página se guarda. Si necesitas historial, anota las cifras o haz capturas de pantalla.
- Una tasa de errores alta en un tipo de evento suele indicar un módulo que escucha ese evento; revisa después la pestaña Módulos.
