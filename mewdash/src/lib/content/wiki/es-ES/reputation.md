---
title: Reputación
slug: reputation
summary: Permite a los miembros darse las gracias con puntos de reputación, con enfriamientos y límites antiabuso, recompensas de roles por umbrales, entrega mediante reacciones y decaimiento opcional para miembros inactivos.
icon: fa-trophy
category: Community
dashboard: /dashboard/reputation
module: Reputation
tags: [reputation, rep, karma, thanks, role rewards, leaderboard, reaction rep, decay, cooldown, reputación, gracias, recompensas de roles, clasificación, reputación por reacciones, decaimiento, enfriamiento]
related: [xp, administration]
---

## Qué hace

Un miembro ejecuta `rep @user` para dar un punto de reputación, opcionalmente con un motivo. El total del receptor sube, se registra la racha diaria de quien da, y el historial guarda quién dio qué y por qué. Cualquiera puede consultar los totales con `repcheck`, ver el ranking del servidor con `repleaderboard` y leer las últimas diez entradas con `rephistory`.

El staff configura con qué libertad fluye la rep: un enfriamiento por pareja de quien da y quien recibe, límites diarios y semanales, y una antigüedad mínima de la cuenta, tiempo en el servidor y número de mensajes antes de que alguien pueda dar. Los canales se pueden desactivar para la rep o darles un multiplicador. La reputación también se puede ganar con reacciones: un emoji configurado en un mensaje da puntos a su autor.

En umbrales elegidos, el bot reparte roles, anuncia el hito en un canal y envía un MD al miembro. El decaimiento opcional va quitando puntos poco a poco a los miembros que no han dado ni recibido rep durante un tiempo, para que la clasificación refleje la actividad actual.

## Por qué usarlo

- Reconoce a los miembros que ayudan en los canales de soporte y dales un rol visible.
- Deja que una reacción de pulgar arriba en el canal de exhibición dé puntos al artista.
- Condiciona un comando o un canal a un nivel de reputación en lugar de a un rol manual.
- Organiza un evento de fin de semana en el que la rep de un canal cuente doble.
- Mantén honesta una clasificación de soporte con decaimiento para quienes dejan de ayudar.

## Dar reputación

Cada `rep` da un punto, multiplicado por el multiplicador del canal si hay uno establecido. No puedes darte rep a ti mismo ni a un bot. Cada intento pasa estas comprobaciones, por este orden, y el primer fallo se comunica a quien da:

| Comprobación | Predeterminado | Qué ocurre |
| --- | --- | --- |
| Sistema activado | activado | Todo se rechaza mientras está desactivado |
| Estado del canal | enabled | Un canal en `disabled` rechaza la rep dada allí |
| Receptor congelado | no | Los miembros congelados no pueden recibir rep |
| Enfriamiento | 60 minutos | Tiempo antes de que el mismo que da pueda dar rep otra vez al mismo receptor |
| Límite diario | 10 | Rep que puede repartir quien da por día UTC |
| Límite semanal | ninguno | Tope opcional por semana, contando desde el domingo |
| Antigüedad mín. de la cuenta | 7 días | Antigüedad de la cuenta de Discord de quien da |
| Tiempo mín. en el servidor | 24 horas | Cuánto tiempo lleva en el servidor quien da |
| Mín. de mensajes | 10 | Mensajes que ha enviado quien da, según el conteo de mensajes |

La rep anónima registra la entrada como anónima, pero solo cuando la entrega anónima está activada en la configuración. La reputación negativa es un interruptor aparte; al quitar una reacción ya se retiran los puntos que dio.

### Rachas y estadísticas

Dar rep en días consecutivos construye una racha; un hueco de más de un día y medio la reinicia. `repstats` muestra el total, el rango, lo dado, lo recibido, la racha actual y la más larga, y las últimas horas en que se dio y se recibió.

### Tipos personalizados

`reptypeadd helpful Helpful` crea un tipo con nombre. Los miembros ejecutan entonces `rep @user helpful thanks for the fix`. La rep estándar solo suma al total; un tipo personalizado además mantiene su propio recuento por tipo, al que pueden apuntar los requisitos de comandos.

## Reacciones

`repreaction <emoji> [amount] [type]` hace que una reacción dé rep al autor del mensaje. Quien reacciona no debe ser un bot, y quitar la reacción retira los puntos. El comando usa por defecto un punto de rep estándar, y cada configuración de reacción lleva su propio enfriamiento.

## Recompensas de roles

`reprole @Role 100` da el rol cuando un miembro llega a 100 de rep. Opciones: quitar el rol de nuevo cuando la rep baja del umbral (activado por defecto), anunciar el hito en un canal y enviar un MD. Las recompensas se comprueban tras cada cambio de rep. Se puede guardar XP extra en una recompensa, pero todavía no se paga.

Independientemente de las recompensas de roles, el bot publica un mensaje de hito en el **canal de notificaciones** cuando un miembro cruza 50, 100, 250, 500, 1000, 2500, 5000 o 10000 de rep. Los miembros también reciben un MD cuando reciben diez o más puntos de golpe o llegan a un múltiplo de diez.

## Decaimiento

Cuando está activado, cada hora el bot comprueba si toca aplicar decaimiento. `daily` se ejecuta a las 02:00 UTC, `weekly` el domingo a las 02:00 UTC y `monthly` el día uno del mes. Los miembros que no han dado ni recibido rep durante el periodo de inactividad pierden la cantidad de decaimiento, ya sea un número fijo de puntos o un porcentaje de su total, nunca por debajo de cero. Los miembros congelados se omiten. Valores predeterminados: semanal, 1 punto, 30 días de inactividad.

## Requisitos de comandos

`repcommandreq <command> <minimum> [type] [#channels]` bloquea un comando hasta que el miembro tenga esa cantidad de rep, opcionalmente de un tipo personalizado y opcionalmente solo en ciertos canales. `repcommandbypass` exime a roles, y `repcommandinfo` permite a cualquiera ver lo que necesita un comando.

## Ajustes

La página de Reputación tiene cuatro pestañas: **Configuración**, **Recompensas de rol**, **Clasificación** y **Estadísticas**.

| Ajuste | Predeterminado | Qué controla |
| --- | --- | --- |
| Activar el sistema de reputación | activado | Interruptor general |
| Enfriamiento (minutos) | 60 | Por pareja de quien da y quien recibe |
| Límite diario | 10 | Rep por persona que da y día |
| Límite semanal (opcional) | ninguno | Rep por persona que da y semana |
| Antigüedad mín. de la cuenta (días) | 7 | Requisito para quien da |
| Mín. de tiempo en el servidor (horas) | 24 | Requisito para quien da |
| Mín. de mensajes | 10 | Requisito para quien da |
| Canal de notificaciones (opcional) | ninguno | Adónde van los mensajes de hito |
| Permitir reputación negativa | desactivado | Activa las cantidades negativas |
| Permitir reputación anónima | desactivado | Permite que `repanon` oculte a quien da |

El decaimiento no está en el panel; usa los comandos `repdecay*` de abajo.

**Recompensas de rol** tiene un formulario con **Rol**, **Reputación requerida**, **Canal de anuncios (opcional)**, **XP extra (opcional)**, **Quitar el rol si la rep baja del umbral** y **Enviar notificación por MD**. **Clasificación** muestra el ranking y abre el historial de un miembro. **Estadísticas** muestra el total de usuarios, el total de rep dada, las transacciones y la rep media.

## Guía de configuración

1. Abre **Reputación** en el panel. En **Configuración**, activa **Activado**.
2. Establece **Enfriamiento**, **Límite diario** y los tres requisitos mínimos según el tamaño de tu servidor.
3. Elige un **Canal de notificaciones** para los hitos y guarda.
4. En **Recompensas de rol**, añade un rol con su **Reputación requerida** y marca **Quitar el rol si la rep baja del umbral** si quieres que se gane de forma continua.
5. En Discord, ejecuta `repreaction <emoji> 1` para activar la rep por reacciones, y `repchannel #bot-spam disabled` para mantener fuera los canales de spam.
6. Prueba con una segunda cuenta: `rep @you great help` y luego `repcheck @you`.

> [!WARNING]
> `represet all` borra la rep, el historial y las insignias de todos los miembros del servidor tras una confirmación. No hay forma de deshacerlo.

## Comandos

Ejecútalos con el prefijo de tu servidor (`.` salvo que lo hayas cambiado).

| Comando | Alias | Requiere | Para qué sirve |
| --- | --- | --- | --- |
| `rep <@user> [type] [reason]` | `+rep`, `giverep`, `gr`, `repgive` | Nadie | Da un punto |
| `repanon <@user> [type] [reason]` | `anongiverep` | Nadie | Da de forma anónima |
| `anonrep <@user> [type] [reason]` | | Nadie | Igual que `repanon` |
| `repcheck [@user]` | `myrep`, `checkrep` | Nadie | Muestra el total y el rango |
| `repleaderboard [page]` | `replb`, `reptop`, `toprep` | Nadie | Ranking, 25 por página |
| `rephistory [@user]` | `rephist` | Nadie | Últimas diez entradas de rep |
| `repstats [@user]` | `repstat` | Nadie | Estadísticas detalladas y rachas |
| `repcommandinfo <command>` | `repcmdinfo`, `rci` | Nadie | Muestra el requisito de rep de un comando |
| `repstatus` | `repsettings` | Administrador | Muestra la configuración |
| `repconfig` | `repcfg` | Administrador | Menú de configuración interactivo |
| `repenable [true/false]` | `repe` | Administrador | Activa o desactiva el sistema |
| `repcooldown <minutes>` | `repcd` | Administrador | De 1 a 1440 |
| `repdailylimit <n>` | `repdl` | Administrador | De 1 a 100 |
| `repweeklylimit [n]` | `repwl` | Administrador | De 1 a 500, o ninguno para quitarlo |
| `repminage <days>` | `repma` | Administrador | De 0 a 365 |
| `repminmembership <hours>` | `repmm` | Administrador | De 0 a 720 |
| `repminmessages <n>` | `repminmsg` | Administrador | De 0 a 1000 |
| `repnegative <true/false>` | `repneg` | Administrador | Permite rep negativa |
| `repanonymous <true/false>` | `repanonym` | Administrador | Permite rep anónima |
| `repnotificationchannel [#channel]` | `repnotify` | Administrador | Establece o quita el canal de hitos |
| `repchannel <#channel> [enabled/disabled/readonly] [multiplier]` | `repch` | Administrador | Estado y multiplicador por canal |
| `repdecay <true/false>` | `repd` | Administrador | Activa el decaimiento |
| `repdecaytype <daily/weekly/monthly/fixed/percentage>` | `repdt` | Administrador | Programación del decaimiento o tipo de cantidad |
| `repdecayamount <n>` | `repda` | Administrador | De 1 a 100 puntos o porcentaje |
| `repdecayinactive <days>` | `repdi` | Administrador | De 1 a 365 días antes del decaimiento |
| `reptake <@user> [amount]` | `-rep`, `takerep` | Administrador | Quita puntos |
| `repset <@user> <amount>` | `setrep` | Administrador | Establece un total |
| `represet <@user or all>` | `resetrep` | Administrador | Restablece a un miembro o a todos |
| `repfreeze <@user>` | `freezerep` | Administrador | Impide que un miembro reciba rep |
| `repunfreeze <@user>` | `unfreeze`, `unfreezerep` | Administrador | Deshace una congelación |
| `repreaction <emoji> [amount] [type]` | `repemoji`, `rre` | Administrador | Añade o actualiza una recompensa por reacción |
| `repreactionremove <emoji>` | `repemojiremove`, `rrer` | Administrador | Quita una recompensa por reacción |
| `repreactionlist` | `repemojilist`, `rrel` | Administrador | Lista las recompensas por reacción |
| `reprole [@role] [rep] [removeOnDrop] [#channel] [dm] [xp]` | | Gestionar roles | Añade, actualiza o lista recompensas de roles |
| `reproleremove <@role>` | `reprr` | Gestionar roles | Quita una recompensa de rol |
| `reprolechannel <@role> [#channel]` | `reprc` | Administrador | Establece o quita el canal de anuncios de una recompensa |
| `repcommandreq <command> <min> [type] [#channels]` | `repcmdreq`, `rcr` | Administrador | Exige rep para un comando |
| `repcommandbypass <command> <@roles>` | `repcmdbypass`, `rcb` | Administrador | Roles que se saltan el requisito |
| `repcommandreqremove <command>` | `repcmdreqremove`, `rcrr` | Administrador | Quita un requisito |
| `repcommandreqlist` | `repcmdreqlist`, `rcrl` | Administrador | Lista los requisitos |
| `reptypeadd <name> <display name>` | `repaddtype`, `rta` | Administrador | Añade un tipo personalizado |
| `reptyperemove <name>` | `repremovetype`, `rtr` | Administrador | Quita un tipo personalizado |
| `reptypelist` | `replisttypes`, `rtl` | Administrador | Lista los tipos personalizados |
| `repeventcreate <name> <multiplier> <hours>` | `repec` | Administrador | Registra un evento con multiplicador |
| `repeventend <name>` | `repee` | Administrador | Termina un evento antes de tiempo |
| `repexport` | `repex` | Administrador | Exporta la configuración como JSON |
| `repimport` | `repim` | Administrador | Importa un archivo de configuración adjunto al mensaje |
| `repmilestonelost <@user> <@role> <threshold>` | | Administrador | Mensaje de prueba por un hito perdido |

Los comandos de barra `/rep` cubren `give`, `check`, `leaderboard`, `history` y `stats`, además de los grupos de administración `/rep config`, `/rep decay`, `/rep manage`, `/rep reaction`, `/rep role`, `/rep type`, `/rep event` y `/rep require`, que reflejan los comandos de ajustes de arriba. `/rep role list` y `/rep role info` existen solo como comandos de barra.

## Consejos y trampas habituales

- Las recompensas de roles necesitan que el rol del bot esté por encima de todos los roles de recompensa y el permiso Gestionar roles, y `reprole` rechaza los roles que estén por encima del bot.
- El número mínimo de mensajes usa la función de conteo de mensajes. Si el conteo está desactivado, se puede impedir a los miembros dar rep por tener un recuento de cero.
- Solo el estado de canal `disabled` impide dar. `readonly` lo acepta el comando, pero actualmente no detiene la rep en ese canal.
- Los eventos creados con `repeventcreate` se guardan con su multiplicador y hora de fin, pero el multiplicador no se aplica actualmente a la rep dada durante el evento.
- La rep por reacciones usa el nombre del emoji para los emojis estándar y su ID para los personalizados, así que un emoji personalizado de otro servidor no coincidirá una vez eliminado.
- Las comprobaciones de decaimiento se ejecutan en punto, así que un decaimiento `daily` ocurre una vez durante la hora de las 02:00 UTC.
- El enfriamiento es por pareja. Un miembro puede dar rep a varias personas distintas una tras otra, hasta el límite diario.
