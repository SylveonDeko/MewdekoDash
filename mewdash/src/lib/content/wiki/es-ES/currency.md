---
title: Moneda
slug: currency
summary: Una economía por servidor con carteras y banco, recompensas diarias, trabajo y crimen, una tienda de roles y artículos, y más de veinte juegos de apuestas, todo ajustable desde el panel.
icon: fa-money-bill
category: Entertainment
dashboard: /dashboard/currency
module: Currency
tags: [currency, economy, money, coins, shop, balance, bank, daily, work, crime, rob, pay, gambling, blackjack, roulette, slots, leaderboard, moneda, economía, dinero, monedas, tienda, saldo, banco, recompensa diaria, trabajo, crimen, robar, pagar, apuestas, tragaperras, clasificación]
related: [xp, administration]
---

## Qué hace

Cada miembro tiene una cartera y, si dejas el banco activado, un saldo bancario. Gana moneda reclamando una recompensa diaria, ejecutando `work` y `crime` con tiempos de espera, ganando juegos o recibiendo pagos de otros miembros. La gasta en tu tienda en roles, coleccionables o artículos de texto, o la apuesta en juegos como blackjack, ruleta, tragaperras, crash y keno.

El staff decide cómo se comporta la economía: si las apuestas están activadas, los límites de apuesta, una ventaja de la casa, cuánto pagan work y crime, si existe el robo, el impuesto de transferencia, el interés bancario y las bonificaciones de racha diaria. Cada uno de estos es un ajuste de la pestaña **Configuración** o una clave de `economyset`, así que puedes ajustar la economía sin tocar los juegos.

El bot registra cada abono y cada cargo como una transacción, de modo que los miembros pueden ver adónde fue su dinero y la pestaña **Analíticas** puede mostrarte la masa monetaria, dónde está y qué juegos pagan más de lo que cobran.

## Por qué usarlo

- Da a los miembros activos algo en lo que gastar su participación: un rol de color, un título personalizado o un poco de diversión en un canal de juegos.
- Mantén un canal de juegos justo, porque los límites de apuesta, un límite de pérdida diaria y una ventaja de la casa se aplican por ti.
- Recompensa a los miembros con `modifybalance` o con la herramienta **Ajustar un saldo** por ayudar, y deja que elijan en la tienda.
- Mira la tabla **Rendimiento de los juegos** para ver el retorno real de cada juego y ajustar `payoutmultiplier` con datos en lugar de a ojo.

## Saldos, banco y transferencias

`cash` muestra tu cartera, y tu banco y patrimonio neto si tienes algo en el banco. `bank` muestra lo mismo de cualquier miembro y además cobra cualquier interés que se te deba. `deposit` y `withdraw` mueven dinero entre ambos; `all` sirve como cantidad. El dinero en el banco no se puede robar, y una **Capacidad del banco** limita cuánto se puede guardar (0 significa ilimitado).

El interés se paga cuando un miembro ejecuta `bank`: si ha pasado el intervalo desde su último pago de interés, el saldo bancario gana el **Interés (%)** una vez. No se paga mientras nadie lo consulta.

`pay` envía moneda de la cartera a otro miembro, menos el **Impuesto de transferencia (%)**, con una **Transferencia mínima** y un tiempo de espera opcional. No se puede pagar a los bots.

`transactions` lista las últimas 250 entradas tuyas o de otro miembro, diez por página. `cashleaderboard` clasifica a los miembros por cartera más banco.

## Ingresos

| Comando | Por defecto | Qué ocurre |
| --- | --- | --- |
| `dailyreward` | No definida hasta que el staff ejecute `setdaily` | Abona la cantidad diaria una vez por tiempo de espera. Con las rachas activadas, cada reclamo consecutivo suma la **Bonificación por día** multiplicada por los días de la racha más allá del primero, limitada por la **Bonificación máxima**. Perder una ventana completa de tiempo de espera reinicia la racha. |
| `work` | De 50 a 250, cada 30 minutos | Un pago aleatorio dentro del rango configurado, siempre tiene éxito. |
| `crime` | De 200 a 800, 45 % de éxito, cada hora | Si tiene éxito, paga el rango del crimen. Si falla, cobra una multa de 100 a 500, limitada a lo que haya en la cartera. |
| `rob @user` | Desactivado | Cuando está activado: 35 % de probabilidad de llevarse hasta el 20 % de la cartera del objetivo. Los objetivos con menos de 100 están protegidos. Fallar cuesta el 15 % de tu propia cartera. Un intento por hora. |

## Juegos

Toda apuesta pasa por las mismas comprobaciones: las apuestas deben estar activadas, la apuesta debe estar entre la **Apuesta mínima** y la **Apuesta máxima**, el miembro no debe haber alcanzado el **Límite de pérdida diaria** en las últimas 24 horas y debe haber pasado el tiempo de espera del juego (si lo hay). La apuesta se cobra por adelantado. Las ganancias son `apuesta más beneficio`, y la parte del beneficio se escala con el **Multiplicador de pago**, así que un multiplicador de 0.9 recorta cada victoria un diez por ciento mientras que un empate sigue devolviendo la apuesta completa.

| Juego | Cómo paga |
| --- | --- |
| `coinflip <bet> heads/tails` | Pago 1 a 1 si aciertas |
| `highlow higher/lower [bet]` | Se muestra un número del 1 al 10; adivina el siguiente. Pago 1 a 1, un número igual devuelve la apuesta. Apuesta por defecto 100 |
| `spinwheel [bet]` | Rueda ponderada con segmentos del menos 10 por ciento al más 30 por ciento de la apuesta. Apuesta por defecto 10 |
| `blackjack <bet>`, luego `hit` y `stand` | La banca roba hasta 17. Pago 1 a 1 si ganas, empate si igualas |
| `slot [bet]` | Dos símbolos iguales pagan 2x. Tres iguales pagan 3x, uvas 5x, sietes 7x, diamantes 10x. Apuesta por defecto 10 |
| `roulette <bet> <type>` | Un número del 0 al 36 paga 35 a 1. `red`, `black`, `even` u `odd` pagan 1 a 1; el cero pierde las apuestas de color y paridad |
| `rps <choice> [bet]` | Piedra, papel, tijera, lagarto, Spock contra el bot. Pago 1 a 1, los empates devuelven la apuesta. La apuesta es opcional |
| `war <bet>` | La carta más alta gana 1 a 1. Un empate cobra una segunda apuesta y juega una carta más por el doble |
| `craps <bet> [pass/dontpass/field/any]` | Pass y don't pass siguen las reglas del punto con pago 1 a 1. Field paga 1 a 1, o 2x con 2 o 12. Any seven paga 4x |
| `scratchcard [bronze/silver/gold/diamond]` | Cartas de coste fijo de 10, 50, 200 o 1000 con 30, 25, 20 y 15 por ciento de probabilidad de ganar y rangos de premio de hasta 50, 200, 1000 y 5000 |
| `russianroulette <bet> [bullets]` | De una a cinco balas en seis recámaras. Sobrevivir paga 1.2x, 1.5x, 2x, 3x o 5x de beneficio según el número de balas |
| `baccarat <bet> [player/banker/tie]` | Player o banker pagan 1.95x, tie paga 8x |
| `minesweeper <bet> [small/medium/large]` | 70, 60 o 50 por ciento de supervivencia para 1.5x, 2.5x o 4x |
| `lottery [tickets]` | Los boletos cuestan 50 cada uno, hasta 10. Más boletos aumentan la probabilidad de ganar (máx. 40 %) y el multiplicador del premio |
| `crash <bet> [target]` | Elige un objetivo de retirada de 1.1x a 10x. Ganas el objetivo si el punto de crash es igual o superior |
| `keno <bet> <numbers>` | Elige de 1 a 10 números del 1 al 80; se sacan 20. Los pagos van desde 3x por uno de uno hasta 800x por cinco de cinco |
| `plinko <bet> [rows]` | De 5 a 10 filas. Caer en el centro paga 0.5x, los bordes pagan hasta 10x |
| `wheelfortune <bet> [classic/risky/balanced]` | Ruedas de multiplicadores; risky va de 0.1x a 20x |
| `duckrace <bet>` | Cinco patos, el tuyo es aleatorio. El primero paga 4x, el segundo 2x, el tercero 1.2x |
| `bingo <bet> [small/large]` | 40 % de probabilidad de 2x, o 25 % de probabilidad de 3.5x |
| `diceduel @user <bet>` | El oponente recibe botones para aceptar y rechazar; ambos deben poder cubrir la apuesta |
| `memory <bet> [easy/medium/hard]` | Repite una secuencia de 4, 6 u 8 para 1.5x, 2x o 3x |
| `horserace <bet>` | Hasta diez miembros se unen en diez segundos; corredores de IA rellenan los huecos vacíos. El bote paga 50, 30 y 20 por ciento a los tres primeros |
| `triviachain <bet> [category]` | Responde preguntas de OpenTDB seguidas; cada respuesta correcta sube el multiplicador 0.5x. Categorías: general, science, history, sports, entertainment |

> [!NOTE]
> `horserace` acepta cualquier apuesta positiva: cobra la apuesta directamente y no aplica los límites de apuesta compartidos ni el multiplicador de pago.

## Desafíos diarios

Cada miembro recibe un desafío aleatorio al día: jugar cinco partidas, ganar tres, gastar 500, ganar 300 o jugar tres veces a un juego concreto. La recompensa es la cantidad base más hasta 50 extra. `dailychallenge` lo muestra, `claimchallenge` lo paga y `challengeleaderboard` clasifica a los diez primeros por desafíos completados en los últimos 30 días.

> [!WARNING]
> Actualmente los juegos no informan del progreso al rastreador de desafíos, así que los desafíos muestran 0 de progreso y todavía no se pueden reclamar.

## La tienda

Los artículos viven en la pestaña **Tienda** o provienen de `shopadditem` y `shopaddrole`. Cada artículo tiene un **Nombre**, **Precio**, **Descripción**, **Tipo**, **Existencias** (vacío o -1 para ilimitadas), **Límite por usuario**, un **Rol requerido** opcional que el comprador debe tener y un **Orden**.

| Tipo | Al comprar |
| --- | --- |
| Rol | El bot añade el rol al comprador. Por defecto, uno por miembro. |
| Coleccionable | Va al inventario del comprador; es consumible, así que `use` quita uno. |
| Texto | El **Texto entregado** se envía al comprador por MD, y de nuevo con `use`. |

`buy <name>` comprueba que el artículo esté activado, que el comprador tenga el rol requerido, que queden existencias, que pueda pagarlo y que esté por debajo del límite por usuario. Cualquier fallo después del pago se reembolsa automáticamente. `inventory` lista lo que posee un miembro. `shoptoggle` oculta un artículo sin borrar las copias de nadie; `shopremove` lo elimina junto con todas las copias.

## Marcadores

Estos marcadores de moneda están disponibles en las respuestas de chat triggers y en otros lugares que usan marcadores de triggers.

| Marcador | Valor |
| --- | --- |
| `%currency.balance%` | La cartera del usuario |
| `%currency.bank%` | El saldo bancario del usuario |
| `%currency.total%` | Cartera más banco |
| `%targetuser.currency.balance%` | La cartera del usuario objetivo |
| `%targetuser.currency.bank%` | El saldo bancario del usuario objetivo |
| `%currency.emote%` | El emote de moneda del servidor |

## Ajustes

El panel tiene cuatro pestañas: **Analíticas**, **Configuración**, **Tienda** y **Clasificación**. La pestaña **Clasificación** también contiene **Ajustar un saldo**, que abona o carga a un miembro con un motivo registrado en el libro de cuentas.

| Ajuste | Por defecto | Qué controla |
| --- | --- | --- |
| Activar apuestas | Activado | Activa o desactiva todos los juegos de apuestas |
| Apuesta mínima | 1 | La apuesta más pequeña |
| Apuesta máxima | 0 (ilimitada) | La apuesta más grande |
| Multiplicador de pago | 1.0 | Escala solo las ganancias, de 0.1 a 5.0 |
| Límite de pérdida diaria | 0 (desactivado) | Deja fuera a un miembro tras perder esta cantidad en 24 horas |
| Tiempo de espera de juegos (segundos) | 0 | Segundos entre apuestas por miembro |
| Activar trabajo | Activado | El comando `work` |
| Mínimo / máximo del trabajo | 50 / 250 | Rango de pago de work |
| Tiempo de espera del trabajo | 1800 segundos | `workcooldown`, solo con comando |
| Activar crimen | Activado | El comando `crime` |
| Mínimo / máximo del crimen | 200 / 800 | Rango de pago de crime |
| Probabilidad de éxito del crimen (%) | 45 | Probabilidad de que un crimen pague |
| Multa mínima / máxima del crimen | 100 / 500 | Multa al fallar |
| Tiempo de espera del crimen | 3600 segundos | `crimecooldown`, solo con comando |
| Activar banco | Activado | `bank`, `deposit`, `withdraw` |
| Capacidad del banco | 0 (ilimitada) | Lo máximo que un miembro puede guardar en el banco |
| Interés (%) | 0 | Se paga por intervalo sobre el saldo del banco |
| Intervalo de interés (horas) | 24 | Cada cuánto se puede cobrar el interés |
| Activar transferencias | Activado | El comando `pay` |
| Impuesto de transferencia (%) | 0 | Se descuenta de cada pago |
| Transferencia mínima | 1 | El pago más pequeño |
| Tiempo de espera de pagos | 0 | `paycooldown`, solo con comando |
| Activar robos | Desactivado | El comando `rob` |
| Probabilidad de éxito (%) | 35 | Probabilidad de que un robo funcione |
| Robo máximo (%) | 20 | Porcentaje de la cartera del objetivo que puede llevarse un éxito |
| Multa por fallo (%) | 15 | Porcentaje de la cartera del ladrón que se pierde al fallar |
| Protegido por debajo de | 100 | Los objetivos con menos no se pueden robar |
| Tiempo de espera de robos | 3600 segundos | `robcooldown`, solo con comando |
| Activar rachas | Activado | Los reclamos diarios consecutivos dan una bonificación |
| Bonificación por día | 0 | Se suma por cada día consecutivo más allá del primero |
| Bonificación máxima | 0 (sin límite) | Tope de la bonificación de racha |

La cantidad de la recompensa diaria y su tiempo de espera se definen con `setdaily`, no en el panel. `economyconfig` imprime cada clave con su valor actual y `economyreset` restaura todos los valores por defecto.

## Guía de configuración

1. Ejecuta `setdaily 500 24h` para que los miembros tengan algo que reclamar.
2. Abre **Moneda** en el panel y ve a **Configuración**. Define la **Apuesta máxima** y un **Límite de pérdida diaria** antes de abrir un canal de juegos.
3. Activa **Activar robos** solo si tus miembros aceptan perder dinero de la cartera; deja el banco activado para que puedan protegerlo.
4. En **Tienda**, añade un par de artículos de rol y un coleccionable. Define un **Rol requerido** en todo lo que deba ser solo para miembros.
5. Da a algunos miembros un saldo inicial con **Ajustar un saldo** o `modifybalance`.
6. Pasada una semana, revisa **Analíticas** y baja el **Multiplicador de pago** si los juegos pagan más de lo que cobran.

## Comandos

Ejecútalos con el prefijo de tu servidor (`.` salvo que lo hayas cambiado).

| Comando | Alias | Requiere | Para qué sirve |
| --- | --- | --- | --- |
| `cash` | `$`, `$$`, `$$$`, `currency`, `cur` | Nadie | Tu cartera, banco y patrimonio neto |
| `bank [@user]` | | Nadie | Saldos de un miembro, y cobra tu interés |
| `deposit <amount/all>` | | Nadie | De la cartera al banco |
| `withdraw <amount/all>` | | Nadie | Del banco a la cartera |
| `pay @user <amount>` | | Nadie | Enviar moneda, menos el impuesto |
| `transactions [@user]` | `txs` | Nadie | Últimas 250 entradas del libro de cuentas |
| `cashleaderboard` | `cashlb`, `richest` | Nadie | Miembros más ricos por patrimonio neto |
| `dailyreward` | `daily` | Nadie | Reclamar la recompensa diaria |
| `work` | | Nadie | Ganar un pago de trabajo |
| `crime` | | Nadie | Pago arriesgado o una multa |
| `rob @user` | | Nadie | Intentar robar de una cartera |
| `dailychallenge` | `dc` | Nadie | Mostrar el desafío de hoy |
| `claimchallenge` | `claimch` | Nadie | Reclamar un desafío completado |
| `challengeleaderboard` | `chlb` | Nadie | Quienes más desafíos completan |
| `shop` | | Nadie | Explorar la tienda, ocho artículos por página |
| `buy <item>` | | Nadie | Comprar un artículo |
| `inventory [@user]` | | Nadie | Artículos que posee un miembro |
| `use <item>` | | Nadie | Gastar un consumible |
| `coinflip <bet> <heads/tails>` | `flip` | Nadie | Ver juegos |
| `highlow <higher/lower> [bet]` | | Nadie | Ver juegos |
| `spinwheel [bet]` | `wheel` | Nadie | Ver juegos |
| `blackjack <bet>` | `bj` | Nadie | Empezar o unirse a blackjack |
| `hit` | | Nadie | Robar una carta |
| `stand` | | Nadie | Terminar tu turno |
| `slot [bet]` | `slots` | Nadie | Ver juegos |
| `roulette <bet> <type>` | | Nadie | Ver juegos |
| `rps <choice> [bet]` | | Nadie | Ver juegos |
| `war <bet>` | | Nadie | Ver juegos |
| `craps <bet> [type]` | | Nadie | Ver juegos |
| `scratchcard [type]` | `scratch` | Nadie | Ver juegos |
| `russianroulette <bet> [bullets]` | `rroulette` | Nadie | Ver juegos |
| `baccarat <bet> [type]` | | Nadie | Ver juegos |
| `minesweeper <bet> [size]` | `mines` | Nadie | Ver juegos |
| `lottery [tickets]` | | Nadie | Ver juegos |
| `crash <bet> [target]` | | Nadie | Ver juegos |
| `keno <bet> <numbers>` | | Nadie | Ver juegos |
| `plinko <bet> [rows]` | | Nadie | Ver juegos |
| `wheelfortune <bet> [wheel]` | `wof` | Nadie | Ver juegos |
| `duckrace <bet>` | `duck` | Nadie | Ver juegos |
| `bingo <bet> [card]` | | Nadie | Ver juegos |
| `diceduel @user <bet>` | `dd` | Nadie | Desafiar a un miembro |
| `memory <bet> [difficulty]` | | Nadie | Ver juegos |
| `horserace <bet>` | `hr` | Nadie | Unirse a una carrera o iniciarla |
| `triviachain <bet> [category]` | `tchain` | Nadie | Ver juegos |
| `setdaily <amount> <time>` | | Administrador | Cantidad y tiempo de espera de la recompensa diaria, por ejemplo `setdaily 500 24h` |
| `modifybalance @user <amount> [reason]` | `modbal` | Propietario del bot con moneda global; en otro caso, según una excepción de permisos de comando | Añadir o quitar moneda; las cantidades negativas se cargan |
| `economyconfig` | | Administrador | Mostrar todos los ajustes de la economía |
| `economyset <setting> <value>` | | Administrador | Cambiar un ajuste por su clave |
| `economyreset` | | Administrador | Restaurar todos los valores por defecto |
| `economystats` | | Nadie | Tamaño y concentración de la masa monetaria |
| `economyflow [days]` | | Nadie | Por dónde entró y salió moneda de circulación, 7 días por defecto |
| `gamestats [days]` | | Nadie | Retorno al jugador por juego, 7 días por defecto |
| `shopadditem <price> <name>` | | Administrador | Añadir un coleccionable consumible con existencias ilimitadas |
| `shopaddrole <price> @role <name>` | | Administrador, el bot necesita Gestionar roles | Añadir un artículo de rol, uno por miembro |
| `shopremove <name>` | | Administrador | Eliminar un artículo y todas sus copias |
| `shopprice <price> <name>` | | Administrador | Cambiar un precio |
| `shopstock <stock> <name>` | | Administrador | Definir las existencias restantes |
| `shopdesc <name> \| <description>` | | Administrador | Definir la descripción |
| `shoptoggle <name>` | | Administrador | Mostrar u ocultar un artículo |

## Consejos y advertencias

- Define la **Apuesta máxima** antes que nada. Con ella en 0, un miembro con suerte puede vaciar la economía en una tarde.
- El límite de pérdida diaria cuenta las pérdidas netas de las 24 horas anteriores, así que un miembro que gana al principio puede seguir jugando más tiempo.
- Los artículos de rol necesitan que el rol más alto del bot esté por encima del rol que se vende y Gestionar roles, o la compra falla después del pago con un error al conceder el rol.
- Los artículos de texto y `use` se entregan por MD; los miembros con los MD cerrados ven un error pero siguen poseyendo el artículo.
- Blackjack guarda una partida por miembro en memoria; `hit` y `stand` solo funcionan después de `blackjack`.
- Las carreras de caballos esperan diez segundos a otros miembros, luego rellenan el campo con corredores de IA y empiezan.
- Las partidas de trivia en cadena caducan tras diez minutos de inactividad, y un miembro solo puede tener una en marcha a la vez.
- Cuando el bot está alojado con moneda global, los saldos se comparten entre todos los servidores y `modifybalance` es solo para el propietario.
