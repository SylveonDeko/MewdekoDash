---
title: Sistema de XP
slug: xp
summary: Recompensa a los miembros por chatear y hablar en voz con niveles, tarjetas de rango, recompensas de roles y moneda, y eventos temporales.
icon: fa-star
category: Community
dashboard: /dashboard/xp
module: Xp
tags: [xp, experience, levels, level up, rank, rank card, leaderboard, role rewards, voice xp, xp boost, competition, xp curve, experiencia, niveles, subir de nivel, rango, tarjeta de rango, clasificación, recompensas de roles, xp de voz, bonificación de xp, competición, curva de xp]
related: [currency, achievements, administration, utility]
---

## Qué hace

Los miembros ganan XP enviando mensajes y hablando en canales de voz. La XP se acumula en niveles a lo largo de una curva que tú eliges. Cualquiera puede ejecutar `rank` para obtener una tarjeta de rango generada con su nivel, barra de progreso, rango en el servidor y avatar, o `leaderboard` para ver quién va por delante.

Cuando un miembro sube de nivel, el bot puede publicar un anuncio en el canal, en un canal específico de subidas de nivel o por MD. Puedes escribir tus propios mensajes de subida de nivel con marcadores, o dejar que se encargue el embed predeterminado. Alcanzar un nivel también puede otorgar roles y moneda del servidor automáticamente.

El staff controla la velocidad a la que llega la XP: XP por mensaje, enfriamiento, XP de voz por minuto, un multiplicador global y multiplicadores por canal y por rol. Los eventos de bonificación temporales multiplican todo durante un tiempo, y las competiciones organizan una carrera con límite de tiempo con recompensas para los primeros puestos. Se pueden excluir usuarios, roles y canales para que los canales de spam de bots y los roles silenciados no ganen nada.

## Por qué usarlo

- Da a los miembros activos un progreso visible y un motivo para seguir chateando.
- Desbloquea roles en niveles concretos para que los miembros veteranos obtengan ventajas sin que el staff tenga que hacerlo a mano.
- Organiza un evento de doble XP de fin de semana o una carrera de "el primero en llegar al nivel 20".
- Mantén la XP justa excluyendo canales de comandos, canales AFK y roles de bots.
- Vincula la XP con el módulo de moneda para que subir de nivel también dé una recompensa.

## Cómo se gana XP

### XP de texto

Cada mensaje de un miembro que no sea un bot otorga **XP por mensaje** (3 por defecto, con un máximo de 50) una vez por ventana de enfriamiento. El **Enfriamiento de XP por mensaje** es de 60 segundos por defecto; un miembro que envía diez mensajes en esa ventana recibe XP una sola vez. Los mensajes en canales excluidos, o de usuarios y roles excluidos, no ganan nada. Si el servidor está excluido por completo, no se cuenta nada.

Después, la cantidad se multiplica. Todos estos multiplicadores se acumulan:

| Multiplicador | Se establece con | Notas |
| --- | --- | --- |
| Multiplicador global | `setxpmultiplier` o **Multiplicador global de XP** | Se aplica a toda ganancia |
| Multiplicador de canal | `setchannelxp` | Se aplica a las ganancias en ese canal |
| Multiplicador de rol | `setrolexp` | Si un miembro tiene varios roles con multiplicadores, solo se usa el más alto |
| Eventos de bonificación | `xpboost` | Se aplican todos los eventos activos |

El resultado se redondea hacia abajo a un número entero.

La **bonificación del primer mensaje** es un premio único aparte, por el primer mensaje de cada miembro cada día UTC. Se guarda en los ajustes de XP, pero no se muestra en el panel.

### XP de voz

La XP de voz se registra por sesión. Un miembro solo la gana mientras está en un canal de voz con al menos dos personas participando (los bots no cuentan) y no está silenciado ni ensordecido, ni por sí mismo ni por el servidor. El tiempo pasado silenciado, ensordecido o a solas no se cuenta.

Cuando termina la sesión, los minutos válidos se multiplican por **XP de voz por minuto** (2 por defecto, con un máximo de 10). Las sesiones de menos de 15 segundos no ganan nada. El **Tiempo de espera de XP de voz** (60 minutos por defecto) es el número máximo de minutos que se pueden pagar de una misma sesión. Los multiplicadores se aplican a la XP de voz solo cuando la cantidad base es al menos 5. Establecer la XP de voz por minuto o el tiempo de espera en 0 desactiva la XP de voz.

### Decaimiento de XP

El decaimiento es opcional y está desactivado por defecto. Cuando está activado, cada doce horas el bot busca a los miembros cuya última actividad es anterior a **Días de inactividad antes del decaimiento** y les quita el **Porcentaje diario de decaimiento** de su XP total. Estos tres ajustes existen en el registro de ajustes de XP, pero todavía no tienen comando ni control en el panel.

## Niveles y curvas

El nivel en el que está un miembro depende del **Tipo de curva de XP**. Todas las curvas parten de una base de 36 XP para el nivel uno.

| Curva | Nombre del comando | Nombre en el panel | XP necesaria para el nivel n |
| --- | --- | --- | --- |
| Estándar | `Standard` | Default | 36 x n al cuadrado |
| Lineal | `Linear` | Linear | 36 x n |
| Acelerada | `Accelerated` | Quadratic | 36 x n elevado a 1,25 |
| Decelerada | `Decelerated` | Exponential | 36 x n elevado a 2,5 |
| Personalizada | `Custom` | no se ofrece | Igual que Estándar |
| Heredada | `Legacy` | Legacy | Cada nivel cuesta 36 más 9 por cada nivel anterior, y los totales se acumulan |

Estándar es la predeterminada. Cambiar la curva con `setxpcurve` recalcula el nivel de todos, salvo que pases `false` como segundo argumento. Cambiar la curva no modifica el total de XP de nadie, solo a qué nivel corresponde ese total.

## Notificaciones de subida de nivel

Cada miembro elige cómo se le avisa de las subidas de nivel con `levelnotif`: `None`, `Channel` o `Dm`. Los miembros también pueden ejecutar `leveluppings false` para que el bot deje de mencionarlos; su nombre se muestra entonces como texto plano.

Las notificaciones en canal van al **canal de subidas de nivel** si se ha configurado uno con `levelupchannel`; si no, al canal donde se ganó la XP. El bot necesita Enviar mensajes allí.

Si el servidor no tiene mensajes personalizados, el predeterminado es un embed con un título de subida de nivel, el avatar del miembro como miniatura y campos con la XP total, el rango en el servidor y el nuevo nivel. Si has añadido mensajes personalizados con `addlevelupmessage`, se elige al azar uno de los mensajes activados cada vez. Un mensaje personalizado puede ser texto plano o JSON de embed del constructor de embeds. Prueba cualquier plantilla con `testlevelupmessage`.

### Marcadores

Funcionan dentro de los mensajes personalizados de subida de nivel, junto con los marcadores generales de usuario y servidor de la página de marcadores. Como las notificaciones no registran el canal ni a la persona que las provocó, `%xp.channel.*%` se resuelve como "Unknown Channel", `%xp.triggeruser.*%` como "System" y `%xp.gained%` es siempre 0.

| Marcador | Valor |
| --- | --- |
| `%xp.user%` | Nombre de usuario y etiqueta, o solo el nombre de usuario si las menciones están desactivadas |
| `%xp.user.mention%` | Mención del miembro, o el nombre de usuario en texto plano si las menciones están desactivadas |
| `%xp.user.name%` | Nombre de usuario |
| `%xp.user.displayname%` | Nombre visible |
| `%xp.user.nickname%` | Apodo, o el nombre de usuario si no tiene |
| `%xp.user.avatar%` | URL del avatar |
| `%xp.user.id%` | ID de usuario |
| `%xp.user.created%` | Fecha de creación de la cuenta |
| `%xp.user.joined%` | Fecha de entrada al servidor |
| `%xp.level.old%` | Nivel antes de la subida |
| `%xp.level.new%` | Nuevo nivel (`%xp.level.current%` es lo mismo) |
| `%xp.level.next%` | Nuevo nivel más uno |
| `%xp.level.difference%` | Cuántos niveles se han ganado |
| `%xp.total%` | XP total |
| `%xp.current%` | XP ganada dentro del nivel actual |
| `%xp.needed%` | XP que requiere el nivel actual en total |
| `%xp.remaining%` | XP que aún falta para el siguiente nivel |
| `%xp.progress%` | Progreso dentro del nivel en porcentaje |
| `%xp.rank%` | Rango en el servidor como número |
| `%xp.rank.ordinal%` | Rango en palabras, como "tercero" |
| `%xp.rank.suffix%` | Solo el sufijo: st, nd, rd o th |
| `%xp.guild%`, `%xp.guild.name%` | Nombre del servidor |
| `%xp.guild.id%` | ID del servidor |
| `%xp.guild.membercount%` | Número aproximado de miembros |
| `%xp.guild.icon%`, `%xp.guild.banner%` | URL del icono y del banner del servidor |
| `%xp.time%`, `%xp.time.full%`, `%xp.date%` | Hora UTC actual, hora con fecha y fecha |
| `%xp.timestamp%`, `%xp.timestamp.relative%` | Etiquetas de marca de tiempo de Discord para el momento actual |

> [!EXAMPLE]
> `addlevelupmessage %xp.user.mention% just hit level %xp.level.new% and is now %xp.rank.ordinal% on the leaderboard.`

Ejecuta `levelupplaceholders` en Discord para ver la misma lista.

## Recompensas de roles

`rolereward <level> <role>` da un rol cuando un miembro alcanza ese nivel. Con **Recompensas de rol exclusivas** desactivado (el valor predeterminado), los miembros conservan todos los roles de recompensa de los niveles iguales o inferiores al suyo y pierden los de los niveles superiores. Con la opción activada (`setxpexclusive true`), solo se conserva la recompensa del nivel más alto al que optan y se quitan todos los demás roles de recompensa.

Las recompensas se aplican cuando cambia un nivel. Usa `syncmyxproles`, `syncuserxproles` o `syncallxproles` para poner los roles al día tras añadir recompensas o importar XP. La sincronización de todos los usuarios se puede ejecutar una vez por hora, y el bot necesita Gestionar roles con su rol por encima de todos los roles de recompensa.

## Recompensas de moneda

`currencyreward <level> <amount>` paga moneda del servidor del módulo de moneda cuando un miembro alcanza ese nivel. Pasar 0 elimina la recompensa. Si el nivel de un miembro baja, por ejemplo tras `setxp` o por decaimiento, se le retira la moneda de los niveles que ha perdido.

## Logros

Los [logros](/wiki/achievements) son un sistema aparte con sus propios puntos y rangos, así que un rango de logros no es un nivel de XP. Ambos se cruzan en dos puntos: alcanzar niveles de XP desbloquea logros de la categoría Comunidad, y los logros pueden devolver XP mediante una recompensa de XP por logro o **XP por punto** en la pestaña Ajustes de logros. Ambos están desactivados hasta que los configures.

## Eventos de bonificación

`xpboost <time> <multiplier> <name>` inicia un evento temporal, por ejemplo `xpboost 2h 2.0 Weekend XP Event`. Cada bonificación activa multiplica la XP de mensajes y de voz además de los demás multiplicadores. `xpboosts` lista lo que está en marcha y `cancelboost <id>` detiene uno antes de tiempo.

## Competiciones

`xpcompetition <time> <type> [targetLevel] [name]` inicia una carrera con límite de tiempo. Los miembros se inscriben automáticamente la primera vez que ganan XP mientras está en marcha.

| Tipo | Ganador |
| --- | --- |
| `MostGained` | Quien más XP haya ganado durante la competición |
| `ReachLevel` | Quien alcance primero el nivel objetivo |
| `HighestTotal` | Quien tenga más XP total al terminar |

Añade premios con `addcompetitionreward <id> <position> <type> <reward>`, donde el tipo es `Role`, `XP` o `Currency`. Las recompensas de rol se conceden, las de XP se añaden como XP extra y la moneda se paga a través del módulo de moneda. `competitionleaderboard <id>` muestra la clasificación y `endcompetition <id>` la termina antes de tiempo y reparte las recompensas.

## Exclusiones

`xpexclude` y `xpinclude` aceptan un usuario, un rol o un canal de texto. Los usuarios excluidos y cualquiera que tenga un rol excluido nunca ganan XP; los canales excluidos no dan nada a nadie. Esto también se aplica a los canales de voz. `xpexcludelist users|roles|channels` muestra las listas. Las versiones con barra son `/xp admin exclude`, `/xp admin include` (pasa una opción `user`, `role` o `channel`) y `/xp exclude-list`. El interruptor **Exclusión de XP del servidor** del panel desactiva la ganancia de XP de todo el servidor de una vez.

## Tarjetas de rango

`rank [@user]` genera una tarjeta PNG. `textrank [@user]` da la misma información como texto para lectores de pantalla. Los bots no tienen rango.

La tarjeta se construye a partir de la plantilla del servidor: una imagen de fondo (la tuya desde **Fondo personalizado de la tarjeta de XP**, o la integrada) y capas para el avatar y el nombre del usuario, la barra de progreso, el nivel del servidor, el rango del servidor, el tiempo en el nivel actual y la XP extra otorgada. Cada capa se puede mostrar u ocultar, mover, redimensionar y recolorear, y la barra de progreso puede ser redondeada, segmentada o radial y llenarse en cualquier dirección.

La pestaña **Plantilla** abre un editor visual. En pantallas de menos de 768 píxeles de ancho, el panel cambia a un editor táctil con las mismas capas, una hoja inferior para las propiedades y controles sencillos de posición y tamaño. En pantallas más anchas dispones del editor completo con lista de capas, cuadrícula, ajuste, reglas, deshacer y rehacer, y zoom.

## Clasificación

`leaderboard [page]` muestra el ranking del servidor. Si el servidor también usa el módulo de moneda y hay moneda en circulación, un `leaderboard` sin más pregunta si te referías a XP o a moneda; indicar una página siempre significa XP. La pestaña **Clasificación** del panel muestra el mismo ranking con una acción **Ajustar XP** que puede sumar, establecer o restablecer la XP de un miembro, y opcionalmente borrar también la XP extra.

## Ajustes

El panel tiene seis pestañas: **Ajustes**, **Estadísticas**, **Clasificación**, **Recompensas**, **Plantilla** y **Exclusiones**. Estos ajustes están en la pestaña Ajustes.

| Ajuste | Predeterminado | Qué controla |
| --- | --- | --- |
| Exclusión de XP del servidor | desactivado | Detiene toda la ganancia de XP del servidor |
| XP por mensaje | 3 | XP base por mensaje, máximo 50 |
| Enfriamiento de XP por mensaje | 60 segundos | Intervalo mínimo entre premios de XP por mensaje de cada miembro |
| XP de voz por minuto | 2 | XP base por minuto de voz válido, máximo 10; 0 desactiva la XP de voz |
| Tiempo de espera de XP de voz | 60 minutos | Máximo de minutos que se pueden pagar de una sesión de voz |
| Multiplicador global de XP | 1 | Multiplica toda ganancia |
| Tipo de curva de XP | Default | Qué curva asigna la XP a los niveles |
| Fondo personalizado de la tarjeta de XP | ninguno | URL de la imagen usada detrás de las tarjetas de rango |

La pestaña **Recompensas** gestiona las recompensas de roles y de moneda, y **Exclusiones** gestiona los canales y roles excluidos. **Estadísticas** muestra el total de usuarios, la XP total, el nivel medio, el nivel más alto y la actividad de XP reciente.

Estos campos también existen en el registro `GuildXpSetting`, pero solo se establecen por comando: `FirstMessageBonus`, `ExclusiveRoleRewards` (`setxpexclusive`), `LevelUpChannel` (`levelupchannel`), `LevelUpMessage` y los campos de decaimiento `EnableXpDecay`, `InactivityDaysBeforeDecay` y `DailyDecayPercentage`.

## Guía de configuración

1. Abre **Sistema de XP** en el panel y comprueba que **Exclusión de XP del servidor** esté desactivado.
2. En **Ajustes**, deja al principio los valores de mensajes y voz como están, elige una curva y pulsa **Guardar cambios**.
3. En **Exclusiones**, excluye los canales de comandos de bots y cualquier rol silenciado o de bots.
4. En **Recompensas**, añade una recompensa de rol para algunos niveles clave. Asegúrate de que el rol del bot esté por encima de esos roles.
5. En Discord, ejecuta `levelupchannel #level-ups` y añade una o dos plantillas con `addlevelupmessage`. Pruébalas con `testlevelupmessage`.
6. Abre **Plantilla**, sube un fondo y distribuye la tarjeta. Ejecuta `rank` para ver el resultado.

## Comandos

Ejecútalos con el prefijo de tu servidor (`.` salvo que lo hayas cambiado).

| Comando | Alias | Requiere | Para qué sirve |
| --- | --- | --- | --- |
| `rank [@user]` | | Nadie | Muestra una tarjeta de rango |
| `textrank [@user]` | | Nadie | Información de rango como texto |
| `leaderboard [page]` | `lb` | Nadie | Ranking de XP del servidor |
| `levelnotif <None\|Channel\|Dm>` | `lvlnotif` | Nadie | Elige cómo se te avisa de las subidas de nivel |
| `leveluppings <true\|false>` | `lvluppings` | Nadie | Si los mensajes de subida de nivel pueden mencionarte |
| `xpsettings` | `xpconfig` | Gestionar servidor | Muestra los ajustes de XP actuales |
| `setmessagexp <amount>` | `setmsgxp` | Gestionar servidor | XP por mensaje |
| `setxpcooldown <seconds>` | `xpcd` | Gestionar servidor | Enfriamiento de XP por mensaje |
| `setvoicexp <amount>` | | Gestionar servidor | XP de voz por minuto |
| `setvoicetimeout <minutes>` | | Gestionar servidor | Límite de la sesión de voz |
| `setxpmultiplier <number>` | `xpmult` | Gestionar servidor | Multiplicador global |
| `setxpcurve <type> [recompute]` | | Gestionar servidor | Cambia la curva de niveles |
| `setxpexclusive <true\|false>` | `xpexclusive`, `exclusivexp`, `setxpexcl`, `xpexcl` | Gestionar servidor | Conserva solo el rol de recompensa más alto |
| `setchannelxp <#channel> <number>` | | Gestionar servidor | Multiplicador de canal |
| `setrolexp <role> <number>` | | Gestionar servidor | Multiplicador de rol |
| `addxp <@user> <amount>` | | Gestionar servidor | Añade XP a un miembro |
| `setxp <@user> <amount>` | | Gestionar servidor | Establece la XP de un miembro |
| `resetxp <@user> [resetBonus]` | | Gestionar servidor | Restablece a cero la XP de un miembro |
| `resetxp` | | Administrador | Restablece la XP de todo el servidor |
| `xpboost <time> <multiplier> <name>` | | Gestionar servidor | Inicia un evento de bonificación |
| `xpboosts` | | Nadie | Lista las bonificaciones activas |
| `cancelboost <id>` | | Gestionar servidor | Termina una bonificación antes de tiempo |
| `xpexclude <@user\|role\|#channel>` | | Gestionar servidor | Excluye de la XP |
| `xpinclude <@user\|role\|#channel>` | | Gestionar servidor | Quita una exclusión |
| `xpexcludelist [users\|roles\|channels]` | | Nadie | Muestra las exclusiones |
| `rolereward <level> <role>` | `rr` | Gestionar roles | Añade una recompensa de rol |
| `removerolereward <level>` | `removerr` | Gestionar roles | Quita una recompensa de rol |
| `rolerewards` | | Nadie | Lista las recompensas de rol |
| `currencyreward <level> <amount>` | `cr` | Gestionar servidor | Añade una recompensa de moneda |
| `removecurrencyreward <level>` | `removecr` | Gestionar servidor | Quita una recompensa de moneda |
| `currencyrewards` | | Nadie | Lista las recompensas de moneda |
| `xpcompetition <time> <type> [targetLevel] [name]` | | Gestionar servidor | Inicia una competición |
| `addcompetitionreward <id> <position> <Role\|XP\|Currency> <reward>` | | Gestionar servidor | Añade un premio por puesto |
| `xpcompetitions` | | Nadie | Lista las competiciones activas |
| `competitionleaderboard <id>` | `complb` | Nadie | Clasificación de la competición |
| `endcompetition <id>` | | Gestionar servidor | Termina una competición y reparte los premios |
| `syncallxproles` | | Administrador | Vuelve a aplicar los roles de recompensa a todos (una vez por hora) |
| `syncmyxproles` | | Nadie | Vuelve a aplicar tus propios roles de recompensa (una vez cada cinco minutos) |
| `syncuserxproles <@user>` | | Gestionar roles | Vuelve a aplicar los roles de recompensa de un miembro |
| `levelupchannel [#channel]` | `lvlupchan` | Gestionar servidor | Adónde van las notificaciones en canal; sin canal se usa el actual |
| `addlevelupmessage <text or embed JSON>` | `addlvlupmsg` | Gestionar servidor | Añade un mensaje personalizado de subida de nivel |
| `levelupmessages` | `lvlupmsgs` | Gestionar servidor | Lista los mensajes personalizados con sus ID |
| `removelevelupmessage <id>` | `remlvlupmsg` | Gestionar servidor | Elimina un mensaje personalizado |
| `togglelevelupmessage <id> <true\|false>` | `togglelvlupmsg` | Gestionar servidor | Activa o desactiva un mensaje |
| `testlevelupmessage [template]` | `testlvlupmsg` | Gestionar servidor | Vista previa de una plantilla, o de una guardada al azar |
| `levelupplaceholders` | `lvlupplaceholders` | Gestionar servidor | Lista los marcadores anteriores |

Los equivalentes con barra están bajo `/xp`, con los comandos del staff agrupados como `/xp admin` (add, set, reset, exclude, include, sincronización de roles), `/xp config` (tasas, multiplicadores, curva, exclusivo), `/xp rewards`, `/xp boost`, `/xp competition` y `/xp levelup`. `/xp admin reset` sin usuario restablece la XP de todo el servidor; requiere Administrador y `confirm: true`.

## Consejos y trampas habituales

- Las recompensas de roles y las sincronizaciones de roles necesitan que el bot tenga Gestionar roles, y su rol más alto debe estar por encima de todos los roles de recompensa. `syncallxproles` y `syncuserxproles` se niegan a ejecutarse sin ello.
- La XP de voz necesita al menos dos personas sin silenciar ni ensordecer en el canal. Un miembro que esté solo o silenciado no gana nada, por mucho que se quede.
- Las ganancias de XP se agrupan y se escriben en segundo plano, así que `rank` puede ir unos segundos por detrás del último mensaje.
- Bajar la XP de alguien con `setxp` o `resetxp` puede reducir su nivel, lo que quita roles de recompensa y retira la moneda de recompensa de los niveles perdidos.
- La curva `Custom` se comporta exactamente igual que Estándar y no se ofrece en el panel. Elige Legacy solo si estás migrando desde una configuración antigua y quieres que los niveles existentes coincidan.
- Los mensajes personalizados de subida de nivel sustituyen por completo al embed predeterminado. Si todos los mensajes personalizados están desactivados, vuelve el embed predeterminado.
- Los eventos de bonificación y las competiciones se gestionan solo por comando; el panel no los muestra.
