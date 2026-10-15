---
title: Contar
slug: counting
summary: Convierte un canal en un juego de contar donde los miembros se turnan para publicar el siguiente número, con reacciones, rachas, clasificaciones, puntos de guardado y castigos opcionales por romper la cuenta.
icon: fa-list-numeric
category: Community
dashboard: /dashboard/counting
module: Counting
tags: [counting, count, numbers, game, channel, leaderboard, streak, milestones, save point, contar, cuenta, números, juego, canal, clasificación, racha, hitos, punto de guardado]
related: [administration, xp]
---

## Qué hace

El staff elige un canal y ejecuta `countingsetup`. A partir de ese momento el bot vigila cada mensaje de ese canal. Si un mensaje es el siguiente número esperado, el bot reacciona con una marca de verificación y registra la cuenta para ese miembro. Si es el número equivocado, el bot reacciona con una cruz y, por defecto, elimina el mensaje dos segundos después para que el canal se mantenga limpio.

El bot guarda un número actual, el número más alto alcanzado jamás, el total de cuentas y quién contó el último. Por defecto, el mismo miembro no puede contar dos veces seguidas, así que el juego necesita al menos dos personas. Los miembros pueden consultar sus propias estadísticas, rachas y precisión, y hay una clasificación por canal.

Para el staff hay puntos de guardado que permiten retroceder la cuenta tras una mala racha, una capa de moderación que registra las cuentas erróneas de cada miembro dentro de una ventana de tiempo y aplica castigos escalonados, baneos y aislamientos temporales de contar, y reglas de roles sobre quién puede participar. Varios canales pueden ejecutar el juego de contar al mismo tiempo, cada uno con sus propios ajustes.

## Por qué usarlo

- Un juego comunitario de poco esfuerzo que funciona solo y da a los miembros una meta compartida.
- Los servidores grandes pueden añadir un enfriamiento y la regla de no repetir para que una sola persona no acapare la cuenta.
- El staff puede restaurar la cuenta desde un punto de guardado en lugar de discutir quién la rompió.
- Los reincidentes que rompen la cuenta a propósito pueden ser silenciados o baneados de contar automáticamente.

## Cómo se comprueba una cuenta

Cuando un miembro publica en un canal de contar, el bot ejecuta estas comprobaciones por orden:

1. Los miembros baneados de contar se ignoran por completo.
2. Los miembros con un rol baneado, o sin uno de los roles requeridos, o con un rol ignorado, se omiten. Los mensajes de roles ignorados se eliminan si así lo pediste.
3. Si el mensaje parece un número válido, el bot comprueba que puede reaccionar a él. Si la reacción falla, el bot lo trata como que el miembro ha bloqueado al bot, elimina el mensaje y publica una breve advertencia que desaparece a los cinco segundos.
4. Un miembro que aún está en **Enfriamiento** es rechazado.
5. Si **Permitir usuarios repetidos** está desactivado y el mismo miembro contó el último, el mensaje se rechaza.
6. El texto se analiza con el patrón del canal. Todo lo que no sea un número se gestiona con las reglas de no números de más abajo.
7. El número debe ser igual al número actual más el **Incremento**. Un número equivocado cuenta como un error de ese miembro, y si **Reiniciar la cuenta al fallar** está activado, el canal se reinicia al número inicial.
8. Si se ha establecido **Número máximo** y el número lo supera, la cuenta se detiene y se avisa al staff.

Una cuenta correcta actualiza el canal, las estadísticas y la racha del miembro, inicia su enfriamiento, comprueba los hitos y registra el evento.

Las cuentas correctas reciben la reacción **Emote de acierto** (una marca de verificación por defecto) y los fallos reciben el **Emote de error** (una cruz por defecto). Ambos pueden ser un emoji estándar o un emote personalizado.

## Patrones de conteo

El patrón decide cómo deben escribir los números los miembros. El bot interpreta estos patrones:

| Patrón | Los miembros escriben |
| --- | --- |
| Normal | Dígitos simples: `1`, `2`, `3`. Con una **Base numérica** distinta de 10, los dígitos se leen en esa base. |
| Roman | Números romanos: `I`, `II`, `III`, `IV` |
| Binary | `1`, `10`, `11`, `100` |
| Hexadecimal | `1` a `9`, y luego `A`, `B`, `C` |
| Words | Palabras escritas como `twenty-one` o `one hundred and five` |
| Ordinal | `1st`, `2nd`, `3rd`, `4th` |
| Fibonacci | La sucesión de Fibonacci: `1`, `1`, `2`, `3`, `5`, `8` |
| Primes | Solo números primos: `2`, `3`, `5`, `7`, `11` |

Normal es el predeterminado. El patrón se establece desde el panel; no hay comando para ello.

> [!WARNING]
> El desplegable **Patrón de conteo** del panel lista actualmente Secuencial, Saltar múltiplos, Fibonacci, Primos y Potencias de dos, y sus valores no coinciden con la lista de patrones del bot de arriba. Por ahora, solo Secuencial (Normal) es seguro de elegir desde el panel.

## Hitos

El bot registra un hito la primera vez que la cuenta llega a un múltiplo de 100, 500, 1.000, 5.000 o 10.000. Los hitos se muestran en la pestaña **Estadísticas** y en `countingstatus`.

La pestaña **Gestión** del panel y `countingmilestones` permiten guardar una lista personalizada de números de hito por canal, la misma pestaña y `countingmilestonemessage` guardan un mensaje de hito, y `countingmilestonechannel` guarda un canal de anuncio de hitos. Estos valores se guardan, pero el bot todavía no publica ningún anuncio de hito, así que considéralos reservados para una versión futura.

## Estadísticas y clasificaciones

Cada miembro tiene estadísticas por canal: contribuciones, racha actual, racha más alta, precisión, errores, total de números contados y última contribución. `countingstats` las muestra junto con el rango del miembro.

`countingleaderboard` y la pestaña **Clasificación** ordenan según uno de cuatro tipos:

| Tipo | Ordenado por |
| --- | --- |
| `contributions` | Número de cuentas correctas (predeterminado) |
| `streak` | Racha más alta |
| `accuracy` | Cuentas correctas como porcentaje |
| `totalnumbers` | Total de números contados |

El comando muestra los 20 primeros, diez por página.

## Puntos de guardado

`countingsave` guarda el número actual con un motivo opcional y te da un ID de guardado. `countingrestore <id>` devuelve el canal a ese número tras un aviso de confirmación. `countingreset` establece la cuenta directamente en cualquier número, con confirmación, y por defecto en 0. Los tres también están en la pestaña **Gestión**.

## Moderación

La moderación de contar está desactivada hasta que la actives, ya sea por canal con `countmodenable true` o en todo el servidor con `countmoddefaults true`. Los ajustes del canal prevalecen sobre los valores por defecto del servidor; `countmodreset` devuelve un canal a los valores por defecto.

Cuando está activada, cada número erróneo se registra contra el miembro y se suma a su recuento de errores durante la **ventana de tiempo** (24 horas por defecto, de 1 a 168). Los castigos escalonados se disparan cuando el recuento de un miembro llega a un número exacto: `countmodpunish 3 Mute 30` silencia durante 30 minutos al tercer error. Los escalones establecidos con un canal se aplican a ese canal; los establecidos sin canal son valores por defecto del servidor, y los escalones del canal tienen prioridad. `Softban`, `Kick` y `RemoveRoles` no admiten duración, y las duraciones tienen un tope de 49 días. `AddRole` necesita un rol.

Dos reglas adicionales solo se aplican cuando la moderación está activada:

- **No números**: `countmodnonnumbers` decide si los mensajes de chat en el canal se eliminan (por defecto sí) y si cuentan como una infracción (por defecto no).
- **Ediciones**: `countmodedits` decide si editar un mensaje en el canal lo elimina (por defecto sí) y si cuenta como una infracción (por defecto no).

Reglas de roles: **Roles requeridos** significa que un miembro necesita al menos uno de ellos para contar, **Roles baneados** bloquea a los miembros que tengan cualquiera de ellos, y `countmodignore` omite a los miembros con los roles indicados y opcionalmente elimina sus mensajes.

`countingban`, `countingtimeout` y `countingunban` bloquean a un solo miembro de un canal, de forma permanente o durante un tiempo. La pestaña **Gestión** tiene los mismos controles por ID de usuario, además de un botón **Purgar todo** que equivale a `countingdisable` con purga.

## Ajustes

El panel tiene cinco pestañas: **Canales**, **Configuración**, **Estadísticas**, **Clasificación** y **Gestión**. Elige primero un canal en **Canales**; las demás pestañas actúan sobre ese canal.

| Ajuste | Predeterminado | Qué controla |
| --- | --- | --- |
| Número inicial | 1 | El número desde el que empieza la cuenta, establecido en la configuración inicial |
| Incremento | 1 | Cuánto suma cada cuenta; debe ser positivo |
| Patrón de conteo | Normal | Cómo se escriben los números, ver arriba |
| Base numérica | 10 | Base que usa el patrón Normal |
| Enfriamiento (segundos) | 0 | Espera entre dos cuentas del mismo miembro, de 0 a 300 |
| Número máximo | 0 (ilimitado) | La cuenta se detiene cuando se supera este número |
| Emote de acierto | marca de verificación | Reacción a una cuenta correcta |
| Emote de error | cruz | Reacción a una cuenta errónea |
| Permitir usuarios repetidos | Desactivado | Deja que un mismo miembro cuente dos veces seguidas |
| Reiniciar la cuenta al fallar | Desactivado | Un número erróneo reinicia el canal al número inicial |
| Eliminar mensajes incorrectos | Activado | Elimina los números erróneos tras dos segundos |
| Activar logros | Activado | Marca guardada que se muestra en `countingconfig` |
| Activar competiciones | Activado | Marca guardada que se muestra en `countingconfig` |
| Roles requeridos | ninguno | Los miembros necesitan uno de estos roles para contar |
| Roles baneados | ninguno | Los miembros con estos roles no pueden contar |

> [!NOTE]
> El comando `countingfailurethreshold` guarda un valor de 1 a 10 (3 por defecto) y `countmodthreshold` guarda un umbral de cuentas erróneas, pero los castigos solo se disparan con los escalones que establezcas con `countmodpunish`.

## Guía de configuración

1. Crea un canal y dale al bot Ver canal, Enviar mensajes, Añadir reacciones, Gestionar mensajes y Leer el historial de mensajes allí.
2. Abre **Contar** en el panel, elige el canal en **Configurar un nuevo canal de contar**, establece **Número inicial** e **Incremento**, y guarda.
3. En **Configuración**, establece un **Enfriamiento** si quieres ralentizar el juego, y elige los emotes.
4. Opcionalmente añade **Roles requeridos** o **Roles baneados**.
5. Si quieres castigos automáticos, ejecuta `countmodenable true` en el canal y añade escalones con `countmodpunish`.
6. Publica `1` desde una cuenta y `2` desde otra para confirmar que las reacciones funcionan.

## Comandos

Ejecútalos con el prefijo de tu servidor (`.` salvo que lo hayas cambiado).

| Comando | Alias | Requiere | Para qué sirve |
| --- | --- | --- | --- |
| `countingsetup [#channel] [start] [increment]` | `csetup`, `countsetup` | Gestionar canales | Empieza a contar en un canal |
| `countingstatus [#channel]` | `cstatus`, `countstatus` | Nadie | Número actual, récord, totales y reglas activas |
| `countingconfig [#channel]` | `cconfig`, `countconfig` | Gestionar canales | Muestra la configuración del canal |
| `countingreset [#channel] [number] [reason]` | `creset`, `countreset` | Gestionar mensajes | Reinicia la cuenta, por defecto a 0, con confirmación |
| `countingstats [@user] [#channel]` | `countstats` | Nadie | Estadísticas de contar y rango de un miembro |
| `countingleaderboard [type] [#channel]` | `cleaderboard`, `countleaderboard`, `clb` | Nadie | Los 20 primeros por contributions, streak, accuracy o totalnumbers |
| `countingsave [#channel] [reason]` | `csave`, `countsave` | Gestionar mensajes | Crea un punto de guardado |
| `countingrestore <saveId> [#channel]` | `crestore`, `countrestore` | Gestionar mensajes | Retrocede a un punto de guardado |
| `countingdisable [#channel] [purge] [reason]` | `cdisable`, `countdisable` | Gestionar canales | Deja de contar; `true` también purga todos los datos |
| `countinglist` | `clist`, `countlist` | Gestionar canales | Lista los canales de contar activos |
| `countingban <@user> [#channel] [duration] [reason]` | `cban`, `countban` | Gestionar mensajes | Banea a un miembro de contar, de forma permanente salvo que se indique una duración |
| `countingunban <@user> [#channel] [reason]` | `cunban`, `countunban` | Gestionar mensajes | Levanta un baneo de contar |
| `countingtimeout <@user> <duration> [#channel] [reason]` | `ctimeout`, `counttimeout` | Gestionar mensajes | Baneo temporal de contar |
| `countingcooldown [#channel] [seconds]` | `ccooldown`, `countcooldown` | Gestionar canales | Muestra o establece el enfriamiento, de 0 a 300 |
| `countingmilestones [#channel] [50,100,...]` | `cmilestones`, `countmilestones` | Gestionar canales | Muestra, establece o, con `-`, restablece los números de hito personalizados |
| `countingsuccessmessage [#channel] [text]` | `csuccessmessage`, `countsuccessmessage` | Gestionar canales | Guarda una plantilla de acierto, `-` la restablece |
| `countingfailuremessage [#channel] [text]` | `cfailuremessage`, `countfailuremessage` | Gestionar canales | Guarda una plantilla de fallo, `-` la restablece |
| `countingmilestonemessage [#channel] [text]` | `cmilestonemessage`, `countmilestonemessage` | Gestionar canales | Guarda una plantilla de hito, `-` la restablece |
| `countingmilestonechannel [#counting] [#target]` | `cmilestonechannel`, `countmilestonechannel` | Gestionar canales | Guarda un canal de hitos, sin indicar ninguno se quita |
| `countingfailurechannel [#counting] [#target]` | `cfailurechannel`, `countfailurechannel` | Gestionar canales | Guarda un canal de registro de fallos, sin indicar ninguno se quita |
| `countingfailurethreshold [#channel] [1-10]` | `cfailurethreshold`, `countfailurethreshold` | Gestionar canales | Muestra o establece el umbral de fallos |
| `countmodshow [#channel]` | `cmshow`, `countmoderationshow` | Gestionar canales | Muestra la configuración de moderación y los valores por defecto del servidor |
| `countmoddefaults <on/off> [threshold] [hours] [punishment] [minutes] [@role]` | `cmdefaults`, `countmoderationdefaults` | Administrador | Valores por defecto de moderación de todo el servidor |
| `countmodenable <on/off> [#channel]` | `cmenable`, `countmoderationenable` | Gestionar canales | Activa o desactiva la moderación de un canal |
| `countmodthreshold <1-100> [#channel]` | `cmthreshold`, `countmoderationthreshold` | Gestionar canales | Establece el umbral de cuentas erróneas del canal |
| `countmodwindow <1-168> [#channel]` | `cmwindow`, `countmoderationwindow` | Gestionar canales | Horas que una cuenta errónea permanece registrada |
| `countmodpunishment <action> [minutes] [@role] [#channel]` | `cmpunishment`, `countmoderationpunishment` | Gestionar canales | Establece el castigo predeterminado del canal |
| `countmodpunish <count> <action> [minutes] [@role] [#channel]` | `cmpunish`, `countmoderationpunish` | Gestionar canales | Castigo en un número exacto de errores; sin canal es el valor por defecto del servidor |
| `countmodunpunish <count> [#channel]` | `cmunpunish`, `countmoderationunpunish` | Gestionar canales | Quita un escalón |
| `countmodpunishlist [#channel]` | `cmpunishlist`, `countmoderationpunishlist` | Gestionar canales | Lista los escalones |
| `countmodignore <delete> [#channel] [@roles...]` | `cmignore`, `countmoderationignore` | Gestionar canales | Roles que el bot ignora, opcionalmente eliminando sus mensajes |
| `countmodrequired [#channel] [@roles...]` | `cmrequired`, `countmoderationrequired` | Gestionar canales | Roles necesarios para contar |
| `countmodbanned [#channel] [@roles...]` | `cmbanned`, `countmoderationbanned` | Gestionar canales | Roles que no pueden contar |
| `countmodnonnumbers <punish> [delete] [#channel]` | `cmnonnumbers`, `countmoderationnonnumbers` | Gestionar canales | Reglas para el chat en el canal |
| `countmodedits <punish> [delete] [#channel]` | `cmedits`, `countmoderationedits` | Gestionar canales | Reglas para los mensajes editados |
| `countmodreset [#channel]` | `cmreset`, `countmoderationreset` | Gestionar canales | El canal vuelve a los valores por defecto del servidor |
| `countmodclear <@user> [#channel]` | `cmclear`, `countmoderationclear` | Gestionar mensajes | Borra las cuentas erróneas de un miembro |
| `countmodclearall [#channel]` | `cmclearall`, `countmoderationclearall` | Gestionar mensajes | Borra las cuentas erróneas de todos |

## Consejos y trampas habituales

- El bot necesita Añadir reacciones en el canal. Sin ello nadie recibe una marca de verificación ni una cruz, y el bot omite las cuentas válidas por la prueba de bloqueo del bot.
- Eliminar los números erróneos y el chat sin números requiere Gestionar mensajes.
- Los miembros que tienen bloqueado al bot no pueden contar: su número se elimina y se publica una advertencia.
- Con la regla de no repetir activada por defecto, un miembro que publica dos veces seguidas es rechazado antes incluso de leer el número, y ese rechazo no cuenta como error.
- **Reiniciar la cuenta al fallar** reinicia al número inicial, así que con un inicio de 1 el siguiente número esperado vuelve a ser 1.
- Los castigos de moderación usan las mismas acciones que el sistema de avisos (Mute, Ban, Kick, AddRole, etc.), así que el bot necesita los permisos de Discord correspondientes y un rol de silenciado.
- `countingdisable` con purga elimina las estadísticas, los baneos y los puntos de guardado de ese canal y no se puede deshacer. Desactivar sin purga conserva los datos.
