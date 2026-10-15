---
title: Minecraft
slug: minecraft
summary: Registra tus servidores de Minecraft, publica embeds de estado en vivo que se actualizan solos, recibe alertas de conexión y desconexión, ejecuta comandos RCON y conecta con Discord el chat del juego, las entradas, las muertes y los progresos mediante el plugin complementario.
icon: fa-server
category: Entertainment
dashboard: /dashboard/minecraft
module: Minecraft
tags: [minecraft, mc, server status, bridge, rcon, whitelist, chat bridge, java, bedrock, geyser, player lookup, skin, estado del servidor, puente, lista blanca, puente de chat, consulta de jugador, skin del jugador]
related: [statchannels, logging, utility]
---

## Qué hace

El personal registra uno o varios servidores de Minecraft con un nombre y una dirección. Cualquier miembro puede entonces ejecutar `mcstatus` para ver si el servidor está en línea, su MOTD, versión, latencia y quién está conectado. Un servidor también puede vigilarse: el bot publica un embed de estado en un canal y lo edita con un temporizador, o escribe el número de jugadores en el tema del canal, y avisa cuando el servidor cae o vuelve.

Si el servidor tiene RCON activado, el personal puede enviar comandos de consola y gestionar la lista blanca desde Discord o desde la consola del panel sin entrar al juego.

El plugin complementario opcional convierte el enlace en un puente bidireccional. El chat de los jugadores, las entradas, las salidas, las muertes y los progresos se publican en los canales de Discord que elijas, y los mensajes escritos en el canal del puente se difunden a los jugadores dentro del juego.

## Por qué usarlo

- Mostrar un embed en vivo de «quién está en línea» para que los miembros sepan cuándo merece la pena conectarse.
- Avisar a la comunidad en cuanto el servidor se cae o vuelve tras un mantenimiento.
- Añadir a la lista blanca a nuevos miembros desde Discord sin abrir la consola del servidor.
- Mantener al día a los miembros que solo están en Discord con el chat del juego, las muertes y los progresos.
- Consultar el UUID de un jugador o el render de su skin al gestionar una solicitud o un reporte.

## Tipos de servidor

| Tipo | Puerto por defecto | Cómo se consulta |
| --- | --- | --- |
| Java Edition | 25565 | Ping de la lista de servidores; el protocolo de consulta también se usa cuando se define el **Puerto de consulta** y `enable-query=true` |
| Bedrock Edition | 19132 | Ping de Bedrock |
| Geyser (Java + Bedrock) | 25565 | Ping de Java, marcado como Geyser |

Cada servidor tiene un nombre que se guarda en minúsculas, y el primer servidor que añadas pasa a ser el predeterminado que usa `mcstatus` sin argumentos. Las direcciones privadas, reservadas y de bucle local se rechazan salvo que el host del bot las haya permitido.

## Vigilar un servidor

Define un **Canal de vigilancia** y el bot consulta el servidor cada **Intervalo de vigilancia** minutos (5 por defecto, mínimo 1). Lo que hace con el resultado depende del **Modo de vigilancia**.

| Modo | Comportamiento |
| --- | --- |
| Embed (se edita en el sitio) | Publica un embed de estado y lo edita en cada ciclo; lo vuelve a publicar si se elimina el mensaje |
| Channel Topic | Escribe una línea de estado breve en el tema del canal, como máximo una vez cada cinco minutos |
| Both | Hace ambas cosas |

Cada ciclo también registra una instantánea del estado de conexión, el número de jugadores, la latencia y la versión. La pestaña **Historial** del panel las representa en gráficos a lo largo del tiempo.

Cuando cambia el estado de conexión, el bot publica una alerta en el canal de vigilancia: por defecto un embed verde de «came online» o rojo de «went offline», o tus propias plantillas de **Alerta de servidor en línea** y **Alerta de servidor desconectado**.

### Marcadores de estado

El **Embed de vigilancia personalizado** y las dos plantillas de alerta pasan por el analizador de embeds y admiten estos marcadores.

| Marcador | Valor |
| --- | --- |
| `%mc.server.name%` | El nombre registrado |
| `%mc.server.address%` | Nombre de host o IP |
| `%mc.server.port%` | Puerto |
| `%mc.online%` | `Online` u `Offline` |
| `%mc.players.online%` | Número actual de jugadores |
| `%mc.players.max%` | Plazas de jugadores |
| `%mc.player.list%` | Nombres de los jugadores en línea |
| `%mc.motd%` | El MOTD sin los códigos de formato |
| `%mc.version%` | Versión informada |
| `%mc.latency%` | Ping, por ejemplo `42ms` |
| `%mc.favicon%` | URL del icono del servidor |
| `%mc.map%` | Nombre del mundo, solo con el protocolo de consulta |
| `%mc.gamemode%` | Modo de juego, solo con el protocolo de consulta |
| `%mc.software%` | Software del servidor, solo con el protocolo de consulta |
| `%mc.plugins%` | Lista de plugins, solo con el protocolo de consulta |
| `%mc.query%` | `Yes` si respondió la consulta ampliada |
| `%mc.geyser%` | `Yes` si se detectó Geyser |

## RCON y la lista blanca

Activa **Ajustes de RCON** para un servidor e introduce el **Puerto de RCON** y la **Contraseña de RCON** de `server.properties`. Entonces `mcrcon` envía cualquier comando de consola y devuelve la salida. `mcwhitelist` envuelve los comandos de la lista blanca con las acciones `add`, `remove`, `list`, `on`, `off` y `reload`. El panel muestra la lista blanca como una lista con botones de añadir y quitar, y la pestaña **Consola** ofrece un símbolo del sistema para los servidores con RCON activado.

> [!WARNING]
> RCON da acceso completo a la consola. Mantén `mcrcon` limitado a los administradores y trata la contraseña como cualquier otra credencial del servidor.

## El puente con el plugin complementario

El puente necesita el plugin MewdekoMC en el servidor del juego: un plugin de Paper para Paper 1.21+ o un mod de NeoForge para 21.1.x, ambos con Java 21. En el panel, abre la sección **Plugin complementario** del servidor y genera una clave. Copia la **URL de la API** y la **clave de API** en el `config.yml` del plugin (Paper) o en `config/mewdeko-server.toml` (NeoForge), y luego reinicia o ejecuta `/mewdeko reconnect`. La clave solo se muestra una vez; genera una nueva para reemplazarla.

Una vez conectado, el plugin transmite eventos por un WebSocket y el bot los enruta a los canales.

| Evento | Va a | Aspecto por defecto |
| --- | --- | --- |
| Entrada de jugador | Canal de **Entradas/Salidas** | Embed verde con el nombre y el avatar del jugador |
| Salida de jugador | Canal de **Entradas/Salidas** | Embed rojo con el nombre y el avatar del jugador |
| Chat | Canal del **Puente de chat** | `**player**: message` |
| Muerte | Canal de **Muertes** | Embed gris con el mensaje de muerte |
| Progreso | Canal de **Progresos** | Embed verde con el nombre del progreso |
| Estado del servidor | A ningún sitio; se guarda como instantánea del historial con TPS y memoria | |

Cualquier canal de evento que quede vacío usa el **Canal de vigilancia**. Los mensajes enviados por usuarios que no son bots en el canal del Puente de chat (o en el canal de vigilancia si no hay ninguno) se reenvían al juego como `[Discord] user: message` por defecto. La configuración propia del plugin puede desactivar cada categoría de evento, y la transmisión de la consola está desactivada por defecto y el bot no la muestra.

### Plantillas de eventos del puente

Cada evento dirigido a Discord puede tener su propia plantilla en **Plantillas de eventos del puente**. Aceptan la salida del creador de embeds, las menciones se neutralizan y se sustituyen estos marcadores.

| Plantilla | Marcadores |
| --- | --- |
| Entrada de jugador (Discord) | `%mc.player%`, `%mc.uuid%`, `%mc.avatar%` |
| Salida de jugador (Discord) | `%mc.player%`, `%mc.uuid%`, `%mc.avatar%` |
| Mensaje de chat (Discord) | `%mc.player%`, `%mc.message%`, `%mc.avatar%` |
| Mensaje de muerte (Discord) | `%mc.player%`, `%mc.death.message%`, `%mc.avatar%` |
| Progreso (Discord) | `%mc.player%`, `%mc.advancement%`, `%mc.avatar%` |
| Chat desde Discord (formato dentro del juego) | `%user%`, `%message%`, `%channel%`; usa los códigos de color con el signo de sección de Minecraft |

## Ajustes

La página de Minecraft tiene una pestaña **Servidores**, una pestaña **Añadir servidor**, **Historial**, **Consola** y una pestaña con el nombre del servidor seleccionado para editarlo.

| Ajuste | Por defecto | Qué controla |
| --- | --- | --- |
| Nombre | | Identificador corto usado en los comandos, por ejemplo `survival` |
| Dirección | | Nombre de host o IP |
| Puerto | 25565 | Puerto del juego; 19132 para Bedrock |
| Tipo | Java Edition | Java, Bedrock o Geyser |
| Puerto de consulta (0 = puerto del juego) | 0 | Puerto del protocolo de consulta ampliada |
| Canal de vigilancia | ninguno | Canal que recibe el embed de estado y las alertas |
| Intervalo de vigilancia (minutos) | 5 | Cada cuánto se consulta el servidor |
| Modo de vigilancia | Embed | Embed, Channel Topic o Both |
| Embed de vigilancia personalizado | embed predeterminado | Tu propio embed de estado con los marcadores anteriores |
| Alerta de servidor en línea | embed predeterminado | Se publica cuando el servidor vuelve |
| Alerta de servidor desconectado | embed predeterminado | Se publica cuando el servidor cae |
| Canales de eventos | canal de vigilancia | Puente de chat, Entradas/Salidas, Muertes, Progresos |
| Plantillas de eventos del puente | predeterminadas | Plantillas por evento indicadas arriba |
| Ajustes de RCON | desactivado | Interruptor de activación, Puerto de RCON, Contraseña de RCON |
| Plugin complementario | sin clave | Genera o revoca la clave de API del plugin y copia la URL de la API |

## Guía de configuración

1. Abre **Minecraft** en el panel y ve a **Añadir servidor**.
2. Introduce un **Nombre**, la **Dirección** y el **Puerto**, elige el **Tipo** y selecciona un **Canal de vigilancia** y un **Modo de vigilancia**. Guarda.
3. Revisa la pestaña **Servidores**: la tarjeta de estado debería mostrar el servidor en línea en unos segundos.
4. Edita el servidor para activar **Ajustes de RCON** si quieres acceso a la consola y a la lista blanca, y prueba la pestaña **Consola**.
5. Para el puente de chat, define los **Canales de eventos**, genera una clave en **Plugin complementario**, instala el plugin en el servidor del juego y pega la URL y la clave en su configuración.
6. Entra al juego y di algo: debería aparecer en el canal del Puente de chat, y una respuesta allí debería aparecer en el juego.

## Comandos

Ejecútalos con el prefijo de tu servidor (`.` salvo que lo hayas cambiado). Las versiones de barra están en `/minecraft`.

| Comando | Alias | Requiere | Propósito |
| --- | --- | --- | --- |
| `mcstatus [name or address]` | `mcs` | Nadie | Estado del servidor predeterminado, de un servidor registrado o de cualquier `host:port` que escribas |
| `mcadd <name> <address[:port]>` | | Gestionar servidor | Registra un servidor; antepón `bedrock:` a la dirección para Bedrock |
| `mcremove <name>` | `mcrm` | Gestionar servidor | Elimina un servidor registrado |
| `mclist` | `mcl` | Nadie | Enumera los servidores registrados con su tipo, marca de predeterminado y canal de vigilancia |
| `mcdefault <name>` | `mcdef` | Gestionar servidor | Elige el servidor que `mcstatus` usa por defecto |
| `mcwatch <name> [#channel]` | `mcw` | Gestionar servidor | Empieza a publicar el estado en un canal, o se detiene si no se indica canal |
| `mcwatchmode <name> <embed, channeltopic or both>` | `mcwm` | Gestionar servidor | Elige cómo muestra el estado la vigilancia |
| `mcembed <name> [template]` | `mce` | Gestionar servidor | Define un embed de estado personalizado, o `-` para restablecerlo |
| `mcplayer <username>` | `mcp` | Nadie | Muestra el UUID, el avatar y la skin de un jugador |
| `mcskin <username>` | | Nadie | Muestra el render de la skin de un jugador |
| `mcrcon <name> <command>` | | Administrador | Ejecuta un comando de consola por RCON |
| `mcwhitelist <name> <action> [player]` | `mcwl` | Gestionar servidor | `add`, `remove`, `list`, `on`, `off` o `reload` |

## Consejos y advertencias

- `mcstatus` tiene un límite de diez consultas por minuto por servidor de Discord, compartido por todos los miembros.
- Las consultas directas de direcciones con `mcstatus play.example.com:25565` funcionan sin registrar, pero se bloquean las direcciones privadas y locales.
- El bot necesita **Gestionar canales** en el canal de vigilancia para el modo Channel Topic, y el propio Discord limita las ediciones de tema, así que el modo de tema nunca se actualiza con más frecuencia que cada cinco minutos.
- Los detalles ampliados como el mapa, el modo de juego y los plugins solo aparecen cuando `enable-query=true` está definido en `server.properties` y el **Puerto de consulta** coincide.
- Si se elimina el embed de vigilancia, el siguiente ciclo publica uno nuevo en lugar de fallar.
- Los mensajes del puente neutralizan `@everyone`, `@here` y las menciones de usuarios, así que los jugadores no pueden mencionar en Discord desde el juego.
