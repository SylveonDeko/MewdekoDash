---
title: Disparadores
slug: chat-triggers
summary: Respuestas automáticas a mensajes, reacciones, comandos de barra y eventos del bot, con condiciones, costes, contadores, concesión de roles y un conjunto completo de marcadores.
icon: fa-comments
category: Actions
dashboard: /dashboard/chat-triggers
module: ChatTriggers
tags: [chat triggers, triggers, autoresponder, custom commands, auto reply, reaction roles, regex, counters, placeholders, event triggers, disparadores, respuesta automática, comandos personalizados, roles por reacción, contadores, marcadores, eventos]
related: [administration, xp, currency, tickets, giveaways]
---

## Qué hace

Un disparador es un texto que el bot vigila y una respuesta que envía cuando lo ve. En su forma más simple, un miembro escribe `hello` y el bot responde `hi there`. A partir de ahí, un disparador puede coincidir en cualquier parte de un mensaje o mediante una expresión regular, responder con un embed, reaccionar con emojis, enviar la respuesta por MD, eliminar el mensaje del miembro, conceder o quitar roles, publicar una copia en otro canal o webhook y ejecutar un segundo disparador cuando termina.

Los disparadores no tienen que ser mensajes. El mismo disparador puede registrarse como comando de barra, comando contextual de mensaje o de usuario, activarse cuando alguien añade o quita una reacción concreta, o activarse con un evento del bot como una subida de nivel, la entrada de un miembro, el inicio de un boost, la apertura de un ticket o la victoria en un sorteo.

Cada disparador lleva sus propias condiciones: un enfriamiento por usuario, canal o servidor, un nivel de XP requerido, un coste o recompensa en moneda, horas y días activos, una fecha de caducidad, un límite de usos, una antigüedad mínima de la cuenta o del tiempo en el servidor, y un contador que tiene que estar dentro de un rango. Si una condición falla, el disparador guarda silencio o muestra un mensaje que hayas escrito. El probador del panel te dice exactamente qué regla bloquearía un mensaje de ejemplo.

Las respuestas pueden leer valores del resto del bot: el nivel, el saldo, la reputación o el número de mensajes del miembro, el texto que va después del disparador, las personas que mencionó, el mensaje al que respondió, los grupos de captura de una regex y contadores de todo el servidor que una respuesta puede leer y aumentar.

## Por qué usarlo

- Responder automáticamente a preguntas frecuentes: `!rules` publica el embed de las reglas.
- Comandos divertidos que los miembros pueden usar gratis sin el conjunto de comandos integrado del bot.
- Un disparador tipo `daily` que paga moneda una vez por usuario al día con un enfriamiento y una recompensa.
- Una palabra de «verificación» que concede un rol y elimina el mensaje.
- Roles por reacción que dan un rol cuando alguien reacciona con un emoji concreto.
- Anuncios personalizados de subida de nivel, bienvenida o boost, con el formato que prefieras, activados por el evento en lugar de por un mensaje.
- Contadores como «días desde el último incidente» que cualquiera puede aumentar con una palabra.

## Tipos de disparador

Un disparador tiene un conjunto de tipos activados. Un tipo controla qué puede activarlo. Mensaje viene activado por defecto; los demás se activan por disparador con `chattriggervalidtype` o con los interruptores del panel.

| Tipo | Se activa cuando |
| --- | --- |
| Message | Un mensaje coincide con el texto del disparador |
| Interaction | Alguien ejecuta el comando de barra, de mensaje o de usuario registrado para él |
| Button | Se pulsa un componente de botón cuyo ID coincide con el disparador |
| Reactions | Alguien añade el emoji del disparador a un mensaje |
| ReactionsRemoved | Alguien quita el emoji del disparador de un mensaje |
| Event | Ocurre uno de los eventos del bot que aparecen más abajo |

### Coincidencia de mensajes

Por defecto, el mensaje completo, en minúsculas, debe ser igual al disparador. Dos opciones lo flexibilizan:

- **Coincidir en cualquier parte del mensaje** (`ctca`): el disparador debe aparecer como palabra completa en algún punto del mensaje.
- **Permitir mencionar a alguien** (`ctat`): el mensaje puede empezar con el disparador seguido de un espacio y más texto, que pasa a ser `%target%`.

Los disparadores de **expresión regular** (`addchattriggerregex`) comparan el mensaje con el patrón. Cada patrón tiene 100 milisegundos; si se agota el tiempo, se omite. Los grupos de captura con nombre o numerados están disponibles en la respuesta como `%regex.1%` o `%regex.name%`.

Un **requisito de prefijo** decide si el mensaje debe empezar con un prefijo antes de comparar:

| Opción | Comportamiento |
| --- | --- |
| No necesita prefijo | Coincide con el texto sin más (por defecto) |
| Prefijo global | Debe empezar con el prefijo global del bot |
| Prefijo del servidor o global | Debe empezar con el prefijo del servidor y, si no hay, con el global |
| Prefijo del servidor si hay uno definido | Debe empezar con el prefijo del servidor; nunca coincide si el servidor no tiene ninguno |
| Un prefijo personalizado | Debe empezar con el prefijo definido con `ctprefix` |

Si varios disparadores coinciden con un mensaje, se elige uno al azar. Los mensajes de bots y webhooks se ignoran, salvo que un disparador tenga activado **Solo bots** (`ctallowbots`); en ese caso, el disparador solo responde a mensajes de bots. El bot nunca responde a sus propios mensajes.

### Disparadores de interacción

`setctintertype` registra el disparador como comando de aplicación de tipo Slash, Message o User. `setctintername` y `setctinterdesc` establecen su nombre y descripción; los nombres deben seguir las reglas de nombres de comandos de Discord. `ctinterephemeral` hace que la respuesta solo la vea quien lo ejecutó. `ctintererrors` enumera por qué falló el registro, por ejemplo nombres duplicados o demasiados subcomandos.

### Disparadores de reacción

`addreactiontrigger <emoji> <response>` crea un disparador cuyo texto es el emoji. Activa **Reacción añadida** o **Reacción quitada** como sus tipos. La respuesta se publica en el canal del mensaje al que se reaccionó, y las concesiones de rol usan al miembro que reaccionó (o, con **Las personas que mencionaron**, las menciones del mensaje al que se reaccionó). Las reacciones de bots se ignoran.

### Disparadores de evento

`ctevent <id> <event>` hace que un disparador se active con un evento en lugar de con un mensaje y activa para él el tipo Event. Eventos:

| Evento | Se activa para |
| --- | --- |
| XpLevelUp | Un miembro sube de nivel |
| XpLevelDown | Un miembro baja de nivel |
| MemberJoin | Un miembro entra |
| MemberLeave | Un miembro sale |
| VoiceJoin | Un miembro entra a un canal de voz |
| VoiceLeave | Un miembro sale de un canal de voz |
| Boost | Un miembro empieza a boostear |
| BoostEnd | Un miembro deja de boostear |
| TicketOpened | Se abre un ticket |
| TicketClosed | Se cierra un ticket |
| GiveawayWon | Un miembro gana un sorteo |

La respuesta va al canal definido con `cteventchannel` o, si no hay ninguno, al canal donde ocurrió el evento. Las entradas, salidas, eventos de voz y boosts no tienen canal propio, así que esos disparadores necesitan un canal explícito o no hacen nada. Los disparadores de evento pasan por las mismas condiciones y comprobaciones de economía que los de mensaje, y el miembro al que se refiere el evento se trata como el usuario para los marcadores y las concesiones de rol.

## Respuestas

La respuesta principal es el texto que se da al crear el disparador. Pasa por el analizador de embeds, así que puede ser texto sin formato, un embed, varios embeds o componentes creados en el editor de embeds del panel. Se pueden añadir respuestas adicionales con `ctaddresponse`, y **Cuando hay varias respuestas** decide cuáles se envían:

| Modo | Comportamiento |
| --- | --- |
| Single | Siempre la primera respuesta (por defecto) |
| Random | Una al azar; repite una línea para darle más peso |
| RoundRobin | En orden, una por uso, compartido en todo el servidor |
| All | Todas las respuestas, en orden |

Opciones de envío, todas desactivadas por defecto:

- **Responder al mensaje** (`ctreply`): envía la respuesta como un reply de Discord.
- **Enviar la respuesta por MD** (`ctdm`): la envía al miembro en privado.
- **Eliminar el mensaje que lo activa** (`ctad`): elimina lo que escribió la persona.
- **Reaccionar al mensaje en su lugar** (`rtt`): pone el emoji del disparador en su mensaje en lugar de en la respuesta. No se puede combinar con eliminar.
- **No enviar ningún mensaje** (`ctnr`): útil para disparadores que solo dan roles.
- **Eliminar la respuesta tras** (`ctdeleteafter`): segundos antes de que se elimine la respuesta del bot; 0 la conserva.
- **Emoji con los que reaccionar** (`ctreact`): hasta seis emojis, añadidos uno por segundo. Sin emojis, se vacía la lista.

### Crosspost

`ctcpch` publica una copia de cada respuesta en otro canal del servidor. `ctcpwh` la publica mediante una URL de webhook, que puede estar en otro servidor. El crosspost se realiza incluso cuando **No enviar ningún mensaje** está activado.

### Roles

**Roles a conceder** y **Roles a quitar** (`ctrgranttoggle`, `ctrremovetoggle`) se aplican cuando se activa el disparador. Si ejecutas el interruptor otra vez para el mismo rol, lo quitas de la lista. **Aplicar esos roles a** (`chattriggerrolegranttype`) elige el destino:

| Destino | A quién afecta |
| --- | --- |
| Sender | Al miembro que activó el disparador (por defecto) |
| Mentioned | Hasta cinco miembros mencionados en el mensaje |
| Both | Al remitente más hasta cuatro miembros mencionados |

Cuando el destino incluye menciones, estas se eliminan del mensaje antes de comparar, así que `verify @someone` sigue coincidiendo con un disparador `verify`.

### Encadenado

`ctchain <id> <nextId>` ejecuta un segundo disparador cuando termina el primero. El segundo se evalúa según sus propias reglas, incluidas sus condiciones y costes. Una cadena se detiene tras cinco pasos y nunca vuelve a un disparador que ya ejecutó.

## Condiciones

Todas se comprueban antes de cobrar, enviar o contar nada. Una condición fallida significa que el disparador simplemente no se activa, salvo en las comprobaciones de nivel y moneda, que muestran el **Mensaje cuando no pueden usarlo** si lo definiste con `ctreqmsg`.

| Condición | Comando | Por defecto | Comportamiento |
| --- | --- | --- | --- |
| Enfriamiento | `ctcooldown <id> <seconds> [scope]` | ninguno | Bloquea activaciones repetidas durante esos segundos. El ámbito es `User`, `Channel` o `Guild` |
| Nivel requerido | `ctreqlevel <id> <level>` | 0 | El nivel de XP del miembro debe ser al menos este |
| Coste | `ctcost <id> <amount>` | 0 | Moneda que se cobra al miembro; no se activa si no puede pagar |
| Recompensa | `ctreward <id> <amount>` | 0 | Moneda que se paga al miembro cuando se activa |
| Recompensa de XP | `ctxpreward <id> <amount>` | 0 | XP concedida cuando se activa |
| Horas activas | `cttime <id> <HH:mm> <HH:mm> [days...]` | siempre | Solo se activa dentro del intervalo, en la zona horaria del servidor. Si el fin es anterior al inicio, se ejecuta durante la noche. Los días son nombres o 0 a 6, con el domingo como 0 |
| Caducidad | `ctexpiry <id> [duration]` | nunca | Deja de activarse pasada la duración desde ahora, por ejemplo `7d` |
| Límite de usos | `ctmaxuses <id> <uses>` | ilimitado | Se detiene tras esa cantidad de activaciones; 0 quita el límite |
| Antigüedad mínima de la cuenta | `ctminage <id> [duration]` | ninguna | La cuenta debe tener al menos esa antigüedad |
| Tiempo mínimo en el servidor | `ctminmember <id> [duration]` | ninguno | El miembro debe haberse unido hace al menos ese tiempo |
| Rango del contador | `ctrequirecounter <id> <name> [min] [max]` | ninguno | El contador indicado debe estar dentro del rango; `clear` como nombre lo quita |

El enfriamiento solo empieza después de que se cumplan todas las demás condiciones, así que un intento bloqueado no lo consume. El coste se cobra antes de pagar la recompensa, de modo que un disparador que cuesta y paga nunca paga a quien no pudo permitírselo. Los enfriamientos de comandos de todo el servidor definidos con `cmdcd` también se aplican a los disparadores, por usuario, además del enfriamiento propio del disparador.

## Contadores

Los contadores son números con nombre guardados por servidor. Se crean la primera vez que una respuesta los usa y se pueden leer o cambiar desde cualquier respuesta:

| Marcador | Efecto |
| --- | --- |
| `%counter:name%` | Muestra el contador |
| `%counter:name+%` | Suma uno y muestra el nuevo valor |
| `%counter:name-%` | Resta uno y muestra el nuevo valor |
| `%usercounter:name%` | Muestra el valor propio del miembro que activa el disparador para ese nombre |
| `%usercounter:name+%` | Suma uno al valor del miembro |
| `%usercounter:name-%` | Resta uno al valor del miembro |

Los nombres tienen hasta 64 letras, dígitos, guiones bajos o guiones, y no distinguen mayúsculas de minúsculas. `ctcounters` los enumera, `ctcounterset` fija uno a un valor exacto y `ctcounterdelete` lo elimina junto con todos los valores por usuario de ese nombre. La barra lateral del panel tiene un apartado **Contadores** para lo mismo.

## Marcadores

Una respuesta puede usar el conjunto general de marcadores (marcadores de usuario, servidor, canal, bot y hora de la página de marcadores), los marcadores de disparador y los que aportan otros módulos. `ctplaceholders` enumera en vivo los aportados.

| Marcador | Valor |
| --- | --- |
| `%target%` | Todo lo que se escribe después del disparador (requiere **Permitir mencionar a alguien** o coincidir en cualquier parte) |
| `%targetuser%` | Mención de la primera persona mencionada en el mensaje |
| `%targetuser.id%`, `%targetuser.name%`, `%targetuser.avatar%` | ID, nombre de usuario y avatar de esa persona |
| `%targetusers%`, `%targetusers.id%` | Todas las personas mencionadas, como menciones o IDs |
| `%replied.content%` | Contenido del mensaje al que respondió el miembro |
| `%replied.author%`, `%replied.author.id%` | Autor de ese mensaje |
| `%usecount%` | Cuántas veces se ha activado este disparador |
| `%regex.1%`, `%regex.name%` | Grupos de captura de un disparador regex |
| `%img:tag%` | Una imagen aleatoria de Imgur para esa etiqueta |
| `%rng%` | Un número aleatorio del conjunto general de marcadores |
| `%xp.level%`, `%xp.rank%`, `%xp.total%`, `%xp.current%`, `%xp.required%`, `%xp.remaining%`, `%xp.bonus%` | Estadísticas de XP del miembro |
| `%targetuser.xp.level%`, `%targetuser.xp.rank%`, `%targetuser.xp.total%` | Estadísticas de XP de la persona mencionada |
| `%currency.balance%`, `%currency.bank%`, `%currency.total%`, `%currency.emote%` | La moneda del miembro |
| `%targetuser.currency.balance%`, `%targetuser.currency.bank%` | La moneda de la persona mencionada |
| `%rep%`, `%rep.rank%`, `%targetuser.rep%`, `%targetuser.rep.rank%` | Reputación |
| `%messages%`, `%messages.channel%`, `%messages.server%`, `%targetuser.messages%` | Recuentos de mensajes |
| `%invites%`, `%targetuser.invites%`, `%inviter%` | Recuentos de invitaciones y quién invitó al miembro |
| `%targetuser.afk%` | El mensaje de AFK de la persona mencionada |
| `%counter:name%` y similares | Contadores, como arriba |

Las menciones dentro de `%target%` se neutralizan a menos que el propio miembro pudiera mencionar a todos.

> [!EXAMPLE]
> Disparador `daily`, respuesta `%user.mention% claimed today's bonus. Balance: %currency.balance%`, con `ctreward 12 100`, `ctcooldown 12 86400 User` y `ctreqmsg 12 Come back tomorrow.`

## El probador

`cttest <id> <sample message>` o el cuadro **Probar este disparador** de una tarjeta de disparador comprueba si ese mensaje activaría el disparador como tú, sin enviar, cobrar ni contar nada. Indica si el texto coincidió y, si el disparador no se activaría, qué regla lo impide: desactivado, solo bots, sin coincidencia, una entrada de permisos, una anulación de permisos, caducidad, enfriamiento, contador, límite de usos, horas activas, antigüedad de la cuenta, tiempo como miembro, nivel, saldo o el enfriamiento de comandos del servidor.

## Categorías y organización

`ctcategory <id> <name>` coloca un disparador en una categoría. `ctcategorytoggle <name> <true or false>` activa o desactiva de una vez todos los disparadores de la categoría, y la barra lateral del panel filtra por categoría. `cttoggle` pausa un solo disparador sin eliminarlo. `ctstats` muestra con qué frecuencia se ha activado un disparador y quién lo activó recientemente.

`ctsexport` descarga todos los disparadores como un archivo YAML y `ctsimport` carga uno desde un adjunto o una URL. `ctsclear` elimina todos los disparadores tras una confirmación.

## Ajustes

Todo es por disparador. La página de Disparadores tiene un **Modo sencillo** con un formulario de **Crear disparador** (texto del disparador más respuesta) y un **Modo avanzado** con **Creación avanzada de disparadores**, donde eliges el **Tipo de patrón** (Patrón de texto normal o Patrón de expresión regular), los tipos de disparador, y puedes probar una regex antes de guardar.

Cada tarjeta de disparador se expande para mostrar el **Texto del disparador**, el editor del **Mensaje de respuesta**, el probador y un acordeón de ajustes agrupados por tema:

| Grupo | Ajustes |
| --- | --- |
| Cuándo coincide | Requisito de prefijo, Prefijo personalizado, Coincidir en cualquier parte del mensaje, Permitir mencionar a alguien, Solo el propietario del bot |
| Cómo responde | Responder al mensaje, Enviar la respuesta por MD, Eliminar el mensaje que lo activa, Reaccionar al mensaje en su lugar, No enviar ningún mensaje, Emoji con los que reaccionar, Eliminar la respuesta tras, Respuestas adicionales, Cuando hay varias respuestas |
| Roles | Roles a conceder, Roles a quitar, Aplicar esos roles a |
| Límites | Enfriamiento (segundos), El enfriamiento se aplica a, Detener tras este número de usos, Dejar de activarse tras, Antigüedad mínima de la cuenta (minutos), Tiempo mínimo en el servidor (minutos), Activo solo en ciertas horas con Desde, Hasta y En estos días |
| Costes y recompensas | Cuesta al usuario, Paga al usuario, Concede XP, Requiere nivel, Mensaje cuando no pueden usarlo |
| Requisito de contador | Nombre del contador, Como mínimo, Como máximo |
| Activar con un evento | Activar cuando, Responder en |
| Organización | Categoría, Después ejecutar el disparador, Responder a bots en lugar de a personas |

La barra lateral enumera las categorías, los **Contadores** y la lista en vivo de **Marcadores**, y tiene un cuadro de búsqueda para disparadores y respuestas.

## Guía de configuración

1. Abre **Disparadores** en el panel. En el **Modo sencillo**, escribe la palabra del disparador y crea la respuesta en el editor; después créalo.
2. Expande la tarjeta nueva. En **Cuándo coincide**, activa **Coincidir en cualquier parte del mensaje** si la palabra debe funcionar a mitad de una frase.
3. En **Cómo responde**, elige si quieres responder, enviar un MD o eliminar el mensaje del miembro.
4. En **Límites**, define un enfriamiento para que no se pueda abusar de él.
5. Escribe un mensaje de ejemplo en **Probar este disparador** y pulsa **Probar**. Corrige lo que indique que lo bloquea.
6. Para un anuncio de subida de nivel, crea un disparador con cualquier texto, define **Activar cuando** como «Un miembro sube de nivel», deja **Responder en** vacío para publicar donde el miembro estaba hablando y usa `%user.mention%` y `%xp.level%` en la respuesta.
7. Asigna una **Categoría** a los disparadores relacionados para poder pausarlos juntos.

## Comandos

Ejecútalos con el prefijo de tu servidor (`.` salvo que lo hayas cambiado). Los IDs de los disparadores los muestra `listchattriggers`.

| Comando | Alias | Requiere | Propósito |
| --- | --- | --- | --- |
| `addchattrigger <trigger> <response>` | `act`, `acr` | Administrador | Crea un disparador; usa comillas para los disparadores de varias palabras |
| `addchattriggerregex <pattern> <response>` | `actr` | Administrador | Crea un disparador regex |
| `addreactiontrigger <emoji> <response>` | `addrt` | Administrador | Crea un disparador de reacción |
| `editchattrigger <id> <response>` | `ect` | Administrador | Reemplaza la respuesta principal |
| `deletechattrigger <id>` | `dct` | Administrador | Elimina un disparador |
| `listchattriggers` | `lct` | Administrador | Enumera los disparadores con sus IDs |
| `listchattriggersgroup` | `lctg` | Administrador | Enumera los disparadores agrupados por texto |
| `showchattrigger <id>` | `sct` | Administrador | Muestra los ajustes de un disparador |
| `cttoggle <id>` | `chattriggertoggle` | Administrador | Pausa o reanuda un disparador |
| `ctca <id>` | | Administrador | Activa o desactiva coincidir en cualquier parte |
| `ctat <id>` | | Administrador | Activa o desactiva permitir mencionar |
| `ctdm <id>` | | Administrador | Activa o desactiva la respuesta por MD |
| `ctad <id>` | | Administrador | Activa o desactiva eliminar el mensaje que lo activa |
| `rtt <id>` | `reactottrigger` | Administrador | Activa o desactiva reaccionar al mensaje en lugar de a la respuesta |
| `ctnr <id>` | `chattriggernoresponse` | Administrador | Activa o desactiva no enviar ningún mensaje |
| `ctreply <id>` | `chattriggerreply` | Administrador | Activa o desactiva responder al mensaje |
| `ctdeleteafter <id> <seconds>` | `chattriggerdeleteafter` | Administrador | Elimina la respuesta tras un retraso |
| `ctreact <id> [emoji...]` | `ctr` | Administrador | Define hasta seis reacciones, o las borra |
| `ctaddresponse <id> <response>` | `chattriggeraddresponse` | Administrador | Añade una respuesta adicional |
| `ctclearresponses <id>` | `chattriggerclearresponses` | Administrador | Quita las respuestas adicionales |
| `ctresponsemode <id> <mode>` | `chattriggerresponsemode` | Administrador | `Single`, `Random`, `RoundRobin` o `All` |
| `ctprefixtype <id> <type>` | `chattriggersprefixtype` | Administrador | `None`, `Global`, `GuildOrGlobal`, `GuildOrNone` o `Custom` |
| `ctprefix <id> <prefix>` | `chattriggersprefix` | Administrador | Define el prefijo personalizado |
| `chattriggervalidtype <id> <type> <true or false>` | `ctvalidtype`, `ctvt` | Administrador | Activa o desactiva un tipo de disparador |
| `ctallowbots <id>` | `chattriggerallowbots` | Administrador | Activa o desactiva responder solo a mensajes de bots |
| `ctrgranttoggle <id> @role` | `ctgt`, `ctgranttoggle` | Administrador | Activa o desactiva un rol a conceder |
| `ctrremovetoggle <id> @role` | `ctrt`, `ctremovetoggle` | Administrador | Activa o desactiva un rol a quitar |
| `chattriggerrolegranttype <id> <type>` | `ctrolegranttype`, `ctrgt` | Administrador | `Sender`, `Mentioned` o `Both` |
| `chattriggerscrosspostchannel <id> <#channel>` | `ctcpch`, `ctcpchannel`, `ctcrosspostchannel`, `ctcrosspostch` | Administrador | Hace crosspost a un canal |
| `chattriggerscrosspostwebhook <id> <url>` | `ctcpwh`, `ctcpwebhook`, `ctcrosspostwebhook`, `ctcrosspostwh` | Administrador | Hace crosspost mediante un webhook |
| `setctintertype <id> <type>` | `ctitype`, `ctintertype` | Administrador | `None`, `Slash`, `Message` o `User` |
| `setctintername <id> <name>` | `ctiname`, `ctrealname` | Administrador | Nombre del comando de aplicación |
| `setctinterdesc <id> <description>` | `ctidesc`, `ctinterdesc` | Administrador | Descripción del comando de aplicación |
| `ctinterephemeral <id> <true or false>` | `ctieph` | Administrador | Respuesta efímera de la interacción |
| `ctintererrors` | `ctierrors`, `ctie` | Administrador | Muestra los errores de registro de comandos |
| `ctevent <id> <event>` | `chattriggerevent` | Administrador | Se activa con un evento, o `None` para detenerlo |
| `cteventchannel <id> [#channel]` | `chattriggereventchannel` | Administrador | Canal para las respuestas de eventos |
| `ctcooldown <id> <seconds> [scope]` | `chattriggercooldown` | Administrador | Enfriamiento por disparador |
| `ctreqlevel <id> <level>` | `chattriggerrequiredlevel` | Administrador | Nivel de XP requerido |
| `ctcost <id> <amount>` | `chattriggercost` | Administrador | Coste en moneda |
| `ctreward <id> <amount>` | `chattriggerreward` | Administrador | Recompensa en moneda |
| `ctxpreward <id> <amount>` | `chattriggerxpreward` | Administrador | Recompensa de XP |
| `ctreqmsg <id> [message]` | `chattriggerrequirementmessage` | Administrador | Mensaje cuando falla un requisito |
| `cttime <id> <start> <end> [days...]` | `chattriggertime` | Administrador | Horas activas, o `cttime <id> clear` |
| `ctexpiry <id> [duration]` | `chattriggerexpiry` | Administrador | Caducidad, o ninguna para borrarla |
| `ctmaxuses <id> <uses>` | `chattriggermaxuses` | Administrador | Límite de usos, 0 para ninguno |
| `ctminage <id> [duration]` | `chattriggerminimumage` | Administrador | Antigüedad mínima de la cuenta |
| `ctminmember <id> [duration]` | `chattriggerminimummembership` | Administrador | Tiempo mínimo en el servidor |
| `ctrequirecounter <id> <name> [min] [max]` | `chattriggerrequirecounter` | Administrador | Requisito de rango del contador |
| `ctcounters` | `chattriggercounters` | Nadie | Enumera los contadores |
| `ctcounterset <name> <value>` | `chattriggercounterset` | Administrador | Fija un contador |
| `ctcounterdelete <name>` | `chattriggercounterdelete` | Administrador | Elimina un contador |
| `ctplaceholders` | `chattriggerplaceholders` | Nadie | Enumera los marcadores aportados |
| `ctcategory <id> [name]` | `chattriggercategory` | Administrador | Define o borra una categoría |
| `ctcategorytoggle <name> <true or false>` | `chattriggercategorytoggle` | Administrador | Activa o desactiva una categoría |
| `ctchain <id> <nextId>` | `chattriggerchain` | Administrador | Encadena con otro disparador, 0 para borrarlo |
| `cttest <id> <sample>` | `chattriggertest` | Administrador | Simula un mensaje de ejemplo |
| `ctstats <id>` | `chattriggerstats` | Administrador | Número de activaciones y usuarios recientes |
| `ctsexport` | | Administrador | Exporta los disparadores como YAML |
| `ctsimport [url]` | | Administrador | Importa desde una URL o un adjunto |
| `ctsmigrate` | `ctsconvert` | Administrador | Convierte el formato antiguo de embeds, con copia de seguridad |
| `ctsclear` | | Administrador | Elimina todos los disparadores |
| `ctsreload` | | Propietario del bot | Recarga los disparadores desde la base de datos |

## Consejos y advertencias

- Los disparadores se comparan con el mensaje en minúsculas, así que el texto del disparador no distingue mayúsculas de minúsculas en la práctica.
- Un disparador con **Coincidir en cualquier parte** desactivado debe ser el mensaje completo. `hello there` no activará un disparador `hello` a menos que lo actives o habilites mencionar.
- Las concesiones de rol necesitan Gestionar roles y que el rol del bot esté por encima de los roles implicados. El comando que añade un rol a la lista también comprueba que puedas gestionarlo.
- Los disparadores solo para bots nunca responden a humanos, y los disparadores para humanos nunca responden a bots; un mismo disparador no puede hacer ambas cosas.
- Los enfriamientos viven en memoria y se reinician cuando el bot se reinicia. Los límites de uso y la caducidad se guardan y sobreviven a los reinicios.
- El orden de RoundRobin es compartido por todos los miembros del servidor, no se registra por miembro.
- Las entradas del sistema de permisos para el módulo `ActualChatTriggers` y cualquier `permoverride` para el texto del disparador se comprueban antes que las condiciones propias del disparador.
- Los disparadores de interacción registran comandos de aplicación reales, así que se aplican los límites de Discord sobre el número y los nombres de comandos. Revisa `ctintererrors` cuando uno no aparezca.
- Las reacciones a la respuesta se espacian de una por segundo, así que seis emojis tardan seis segundos en aparecer.
- Los disparadores de entradas, salidas, voz y boosts no hacen nada en silencio hasta que defines **Responder en**.
